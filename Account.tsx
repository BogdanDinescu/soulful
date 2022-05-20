import { ApiError, Session, User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { Input } from "react-native-elements";
import { maxNumberOfPhotos, supabase } from "./supabase";
import * as ImagePicker from 'expo-image-picker';
import {decode} from 'base64-arraybuffer'
import PhotoCarousel from "./PhotoCarousel";

export default function Account({navigation, route}: {navigation: any, route: any}) {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User|null>(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [photos, setPhotos] = useState<string[]>(["", "", ""]);

    useEffect(() => {
        const session: Session = route.params.session;
        if (session) {
            setUser(session.user);
            if (user) {
                //getProfile();
                downloadPhotos();
            }
        }
    }, [user]);

    async function getProfile() {
        try {
            setLoading(true);
            console.log("getProfile")
            if (!user) {
                throw new Error("No user");
            }

            let {data, error, status} = await supabase
                .from("profiles")
                .select(`name, bio`)
                .eq("id", user.id)
                .single();

            if (error && status != 406) {
                throw error;
            }

            if (data) {
                setName(data.username);
                setBio(data.website);
            }
        } catch (error) {
            Alert.alert((error as ApiError).message);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile({name, bio}: {name: string, bio: string}) {
        try {
            setLoading(true);
            if (!user) {
                throw new Error("No user");
            }

            const updates = {
                id: user.id,
                name: name,
                bio: bio,
                updated_at: new Date(),
            };

            const {error} = await supabase
                .from("profiles")
                .upsert(updates, {returning: "minimal"});

            if (error) {
                throw error;
            }
        } catch (error: any) {
            Alert.alert("Update profile failed", error.message);
        } finally {
            setLoading(false);
        }
    }

    async function selectPhotos() {
        const options:ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true
        };
        return ImagePicker.launchImageLibraryAsync(options);
    }

    async function uploadPhoto(number: number) {
        try {
            setLoading(true);
            const photo = await selectPhotos();
            if (photo.cancelled) {
                return;
            }
            if (!user) {
                throw new Error("No user");
            }
            const path: string = `pictures/${user.id}`;
            const fileExt = photo.uri.split('.').pop();
            const filePath: string = `picture${number}.${fileExt}`;
            if (photo.base64) {
                await supabase.storage.from(path).upload(filePath, decode(photo.base64), {
                    contentType: `image/${fileExt}`
                });
                downloadPhotos()
            } else {
                throw new Error("Image cannod be read");
            }
        } catch (error: any) {
            Alert.alert("Uploading failed", error.message);
        } finally {
            setLoading(false)
        }
    }

    async function downloadPhotos() {
        try {
            if (!user) {
                throw new Error("No user");
            }
            const path: string = `pictures/${user.id}`;
            const array:Array<string> = [];
            for (let i = 0; i < maxNumberOfPhotos; i++) {
                array.push(`${user.id}/picture${i}.jpg`)
            }
            const {data, error} = await supabase.storage
                .from("pictures")
                .createSignedUrls(array, 60);
            if (error) {
                throw error;
            }
            if (data) {
                const photoUrls = data.map(x => x.signedURL).filter(x => x);
                if (photoUrls.length < maxNumberOfPhotos) {
                    photoUrls.push("")
                }
                setPhotos(photoUrls);
            }

        } catch (error: any) {
            Alert.alert("Error downloading images", error.message)
        }
    }

    return(
        <ScrollView style={styles.container}>
            <Text style={{fontWeight: "bold", fontSize: 20, textAlign: "center"}}>
                My Profile
            </Text>
            <Button
                title="Preview"
                onPress={() =>
                    navigation.navigate('Profile', {id: user?.id})
                }
            />
            <PhotoCarousel photosUrls={photos} uploadPhoto={uploadPhoto}/>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input label="Email" value={user?.email} autoCompleteType={undefined} disabled/>
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                    label="Name"
                    value={name || ""}
                    onChangeText={(text) => setName(text)}
                    autoCompleteType={undefined}/>
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                    label="Bio"
                    value={bio || ""}
                    multiline = {true}
                    numberOfLines={3}
                    onChangeText={(text) => setBio(text)}
                    autoCompleteType={undefined}/>
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                title={loading ? "Loading ..." : "Update"}
                onPress={() => updateProfile({ name: name, bio: bio })}
                disabled={loading}
                />
            </View>

            <View style={styles.verticallySpaced}>
                <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
      
    },
    verticallySpaced: {
      paddingTop: 4,
      paddingBottom: 4,
      alignSelf: "stretch",
    },
    mt20: {
      marginTop: 20,
    },
});

