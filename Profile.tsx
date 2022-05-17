import { maxNumberOfPhotos, supabase } from "./supabase";
import PhotoCarousel from "./PhotoCarousel";
import React, { useEffect, useState } from "react";
import { Alert, View, ActivityIndicator} from "react-native";

export default function Profile({navigation, route, userId}: {navigation:any, route:any, userId:string|null}) {
    const [photos, setPhotos] = useState<string[]>(["", "", ""]);
    const [profile, setProfile] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        userId = route.params.id;
        if (userId != null) {
            downloadPhotos(userId);
            downloadProfile(userId);
        } else {
            Alert.alert("Error", "User does not exist")
        }
        setLoading(false);
    }, [])


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
                if (photoUrls.length < maxNumberOfPhotos) {
                    photoUrls.push("")
                }
                setPhotos(photoUrls);
            }

        } catch (error: any) {
            Alert.alert("Error downloading images", error.message)
        }
    }

    async function downloadProfile(id: string) {
        try {
            let {data, error, status} = await supabase
                .from("profiles")
                .select("name, bio")
                .eq("id", id)
                .single();
            if (error) {
                throw error;
            }
            setProfile(data);
        } catch (error:any) {
            Alert.alert("Error downloading profile", error.message);
        }
    }

    return (
        <View style={{}}>
            { loading ? <ActivityIndicator/>: <PhotoCarousel photosUrls={photos}/> }
        </View>
    )
}