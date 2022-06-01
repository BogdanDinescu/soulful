import { maxNumberOfPhotos, supabase } from "./supabase";
import PhotoCarousel from "./PhotoCarousel";
import React, { useEffect, useState } from "react";
import { Alert, View, ActivityIndicator} from "react-native";
import { Text } from "react-native-elements";

export default function Profile({navigation, route}: {navigation:any, route:any}) {
    const [photos, setPhotos] = useState<string[]>(["", "", ""]);
    const [profile, setProfile] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<string|null>(null);

    useEffect(() => {
        setUserId(route.params.id);
        if (userId != null) {
            downloadPhotos(userId);
            downloadProfile(userId);
        }
    }, [userId])


    async function downloadPhotos(id: string) {
        try {
            const path: string = `pictures/${id}`;
            const array:Array<string> = [];
            for (let i = 0; i < maxNumberOfPhotos; i++) {
                array.push(`${id}/picture${i}.jpg`)
            }
            const {data, error} = await supabase.storage
                .from("pictures")
                .createSignedUrls(array, 60);
            if (error) {
                throw error;
            }
            if (data) {
                const photoUrls = data.map(x => x.signedURL).filter(x => x);
                setPhotos(photoUrls);
            }
            setLoading(false);
        } catch (error: any) {
            Alert.alert("Error downloading images", error.message)
        }
    }

    async function downloadProfile(id: string) {
        try {
            let {data, error, status} = await supabase
                .from("profiles")
                .select("name, bio, birthday")
                .eq("id", id)
                .single();
            if (error) {
                throw error;
            }
            setProfile(data);
            navigation.setOptions({headerTitle: `${data.name}'s profile`})
        } catch (error:any) {
            Alert.alert("Error downloading profile", error.message);
        }
    }

    function getAge(birthday: Date|string): number {
        if (birthday === null || typeof birthday === 'undefined') {
            return 0;
        }
        if (typeof birthday === 'string') {
            birthday = new Date(birthday);
        }
        let today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        let m = today.getMonth() - birthday.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
           age--;
        }
        return age;
    }

    return (
        <View>
            { loading ? <ActivityIndicator/>: 
            <View>
                <PhotoCarousel photosUrls={photos}/>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 5}}>
                    <Text style={{fontSize: 20, fontWeight: 'bold'}}>{profile.name},</Text>
                    <Text style={{fontSize: 20}}> {getAge(profile.birthday)}</Text>
                </View>
                <View style={{borderBottomColor: 'gray', borderBottomWidth: 1, marginVertical: 20}}/>
                <Text style={{fontSize: 15, paddingHorizontal: 20}}>{profile.bio}</Text>
            </View> 
            }
        </View>
    )
}