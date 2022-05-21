import { ApiError, Session, User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import { Input } from "react-native-elements";
import { maxNumberOfPhotos, supabase } from "./supabase";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import {decode} from 'base64-arraybuffer'
import PhotoCarousel from "./PhotoCarousel";

export default function Account({navigation, route}: {navigation: any, route: any}) {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User|null>(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [birthday, setBirthday] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() - 18)));
    const [sex, setSex] = useState<string>("");
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [photos, setPhotos] = useState<string[]>(["", "", ""]);

    useEffect(() => {
        const session: Session = route.params.session;
        if (session) {
            setUser(session.user);
            if (user) {
                getProfile();
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
                .select('name, bio, birthday, sex')
                .eq("id", user.id)
                .single();

            if (error && status != 406) {
                throw error;
            }

            if (data) {
                setName(data.name);
                setBio(data.bio);
            }
        } catch (error) {
            Alert.alert((error as ApiError).message);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        try {
            setLoading(true);
            if (!user) {
                throw new Error("No user");
            }

            const updates = {
                id: user.id,
                name: name,
                bio: bio,
                birthday: birthday,
                sex: sex,
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

    async function removePhoto(number: number) {
        try {
            setLoading(true);
            if (!user) {
                throw new Error("No user");
            }
            const path: string = `pictures`;
            const fileExt: string = 'jpg';
            const filePath: string = `${user.id}/picture${number}.${fileExt}`;
            const { data, error } = await supabase.storage.from(path).remove([filePath]);
            if (error) {
                throw error;
            }
            for (let i = number + 1; i < maxNumberOfPhotos; i++) {
                const oldPath: string = `${user.id}/picture${i}.${fileExt}`;
                const newPath: string = `${user.id}/picture${i-1}.${fileExt}`;
                await supabase.storage.from(path).move(oldPath, newPath);
            }
            downloadPhotos();
        } catch (error: any) {
            Alert.alert("Deleting failed", error.message);
        } finally {
            setLoading(false);
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
            <PhotoCarousel photosUrls={photos} uploadPhoto={uploadPhoto} removePhoto={removePhoto}/>
            <View style={styles.mt20}>
                <Input label="Email" value={user?.email} autoCompleteType={undefined} disabled/>
            </View>
            <View>
                <Input
                    label="Name"
                    value={name || ""}
                    onChangeText={(text) => setName(text)}
                    autoCompleteType={undefined}/>
            </View>
            <View>
                <Picker
                    selectedValue={sex}
                    onValueChange={(value:string, index:number)=> {setSex(value)}}>
                    <Picker.Item label="Male" value="M" />
                    <Picker.Item label="Female" value="F" />
                </Picker>
            </View>
            <View>
                <TouchableOpacity
                    onPress={() => {setShowDatePicker(true)}}>
                    <Input
                        label="Birthday"
                        value={birthday.toLocaleDateString()}
                        autoCompleteType={undefined}
                        disabled/>
                </TouchableOpacity>
                {showDatePicker && 
                (<DateTimePicker
                    value={birthday}
                    mode={"date"}
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                    onChange={(event) => {
                        if (event.type ==='set' && event.nativeEvent.timestamp) {
                            setBirthday(new Date(event.nativeEvent.timestamp))
                        }
                        setShowDatePicker(false)
                    }}
                />)}
            </View>
            <View>
                <Input
                    label="Bio"
                    value={bio || ""}
                    multiline = {true}
                    numberOfLines={3}
                    onChangeText={(text) => setBio(text)}
                    autoCompleteType={undefined}/>
            </View>
            <View style={styles.mt20}>
                <Button
                title={loading ? "Loading ..." : "Update"}
                onPress={() => updateProfile()}
                disabled={loading}
                />
            </View>
            <View>
                <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
      
    },
    mt20: {
      marginTop: 20,
    },
});

