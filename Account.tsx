import { ApiError, Session } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { Alert, Button, Image, StyleSheet, Text, View } from "react-native";
import { Input } from "react-native-elements";
import { supabase } from "./supabase";
import * as ImagePicker from 'expo-image-picker';
import {decode} from 'base64-arraybuffer'
import PhotoCarousel from "./PhotoCarousel";

export default function Account({session}: {session: Session}) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [photos, setPhotos] = useState<string[]>(["", "", ""]);
    
    useEffect(() => {
        if(session) {
            //getProfile();
            downloadPhotos();
        }
    }, [session]);

    async function getProfile() {
        try {
            setLoading(true);
            console.log("getProfile")
            const user = supabase.auth.user();
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
            const user = supabase.auth.user();
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

    async function uploadPhotos() {
        try {
            const photo = await selectPhotos();
            if (photo.cancelled) {
                return;
            }
            const user = supabase.auth.user();
            if (!user) {
                throw new Error("No user");
            }
            const path: string = `pictures/${user.id}`;
            const fileExt = photo.uri.split('.').pop();
            const filePath: string = `${Math.random()}.${fileExt}`;
            if (photo.base64) {
                await supabase.storage.from(path).upload(filePath, decode(photo.base64), {
                    contentType: `image/${fileExt}`
                });
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
            const user = supabase.auth.user();
            if (!user) {
                throw new Error("No user");
            }
            const path: string = `pictures/${user.id}`;
            const array:Array<string> = [];
            for (let i = 0; i < 3; i++) {
                array.push(`${user.id}/picture${i}.jpg`)
            }
            const {data, error} = await supabase.storage
                .from("pictures")
                .createSignedUrls(array, 60);
            if (error) {
                throw error;
            }
            if (data) {
                setPhotos( data.map(x => x.signedURL?x.signedURL:""));
            }

        } catch (error: any) {
            Alert.alert("Error downloading images", error.message)
        }
    }

    return(
        <View style={styles.container}>
            <Text style={{fontWeight: "bold", fontSize: 20, textAlign: "center"}}>
                My Profile
            </Text>
            <PhotoCarousel photosUrls={photos}/>
            <View>
                <Button title="Upload Photos" onPress={() => uploadPhotos()} />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input label="Email" value={session?.user?.email} autoCompleteType={undefined} disabled/>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      width: "80%"
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

