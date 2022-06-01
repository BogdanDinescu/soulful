import React, { useEffect, useRef, useState } from 'react';
import { Image, Alert, Text, View, Dimensions, ActivityIndicator } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { supabase } from './supabase';
import * as Location from 'expo-location';
import Geohash from 'latlon-geohash';
import { Session, User } from '@supabase/supabase-js';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default function ExploreTab({navigation, route}: {navigation: any, route: any}) {
    const [usersList, setUsersList] = useState<Array<any>>([]);
    const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);
    const [location, setLocation] = useState<Location.LocationObject|null>(null);
    const [user, setUser] = useState<User|null>();
    const [userGeoHash, setUserGeoHash] = useState<string>("");
    const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
    
    useEffect(() => {
        const session: Session = route.params.session;
        if (session) {
            setUser(session.user);
        }
        if (location) {
            updateLocation();
        } else {
            getLocation();
        }
    }, [location]);

    async function getLocation() {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(status);
        const currentLocation = await Location.getCurrentPositionAsync();
        setLocation(currentLocation);
    }

    async function updateLocation() {
        console.log(location)
        try {
            if (location) {
                const coords = location.coords;
                const curentGeohash = Geohash.encode(coords.latitude, coords.longitude, 6);
                const updates = { geohash: curentGeohash};
                const match = { id: user?.id }
                const {error} = await supabase
                    .from("profiles")
                    .update(updates, {returning: "minimal"})
                    .match(match);
                if (error) {
                    throw error;
                }
                getUsersIds(curentGeohash);
            } else {
                throw new Error("Location is undefined")
            }
        } catch (error:any) {
            Alert.alert("Location not updated", error.message)
        }
    }


    async function downloadPhotos(profiles: Array<any>) {
        try {
            const array: Array<string> = [];
            for (const profile of profiles) {
                array.push(`${profile.id}/picture0.jpg`);
            }
            const {data, error} = await supabase.storage
                .from("pictures")
                .createSignedUrls(array, 60);
            if (error) {
                throw error;
            }
            return data;
        } catch (error: any) {
            Alert.alert("Error downloading images", error.message)
        }
    }

    async function getUsersIds(geohash: string) {
        const ns = Geohash.neighbours(geohash);
        const arr: string[] = [ns.e, ns.n, ns.ne, ns.nw, ns.s, ns.se, ns.sw, ns.w, geohash]
        let {data, error} = await supabase
                .from("profiles")
                .select('id, name, birthday')
                .in('geohash', arr)
        if (error || !data) {
            Alert.alert("Error getting profiles", error?.message)
            return;
        }
        const photo_urls = await downloadPhotos(data);
        if (photo_urls !== null && typeof photo_urls !== 'undefined') {
            for (let i=0; i<data.length; i++) {
                data[i].photo = photo_urls[i].signedURL;
            }
        }
        setUsersList(data);
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

    function getRespectiveUser(): any {
        if (carouselRef === null || typeof carouselRef === 'undefined') {
            throw new Error("Carrousel not defined");
        }
        let respectiveUser = usersList[carouselRef.currentIndex];
        if (respectiveUser === null || typeof respectiveUser === 'undefined') {
            throw new Error("Respective user not found");
        }
        return respectiveUser;
    }

    async function buttonPress(response: number) {
        try {
            if (carouselRef === null || typeof carouselRef === 'undefined') {
                throw new Error("Carrousel not defined");
            }
            if (user === null || typeof user === 'undefined') {
                throw new Error("Current user not found");
            }
            const respectiveUser = getRespectiveUser()
            if (respectiveUser === null || typeof respectiveUser === 'undefined') {
                throw new Error("Respective user not found");
            }
            respectiveUser.id
            const responseRow = {
                id: user.id,
                to: respectiveUser.id,
                response: response
                
            }
            const {error} = await supabase
                .from("responses")
                .upsert(responseRow);
            if (error)
                throw error;
            carouselRef.snapToNext();   
        } catch (error: any) {
            Alert.alert("Could not send response", error.message);
        }
    }

    const renderItem = ({item, index}: {item: any, index: number}) => {
        return (
            <View style={{width: '80%', marginLeft: '5%', backgroundColor: 'lightgray', borderColor: 'darkgray', borderWidth: 2, borderRadius: 10}}>
                <Image
                    source={{uri: item.photo}}
                    style={{width: '100%', height: 400, resizeMode: 'contain'}}
                    />
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginVertical: 10}}>
                    <Text style={{fontSize: 20, fontWeight: 'bold'}}>{item.name},</Text>
                    <Text style={{fontSize: 20}}> {getAge(item.birthday)}</Text>
                </View>
            </View>
        )
    }

    let carouselRef: Carousel<any> | null;
    
    if (permissionStatus !== Location.PermissionStatus.GRANTED) {
        return (
          <View style={{padding: 100}}>
            <Text style={{textAlign: 'center'}}>Please enable location to continue</Text>
          </View>
        )
      }

    return (
        location?
        <View style={{flex: 1, alignContent: 'center', padding: 20}}>
            <Carousel
                layout={'tinder'}
                ref={(c) => { carouselRef = c; }}
                data={usersList}
                renderItem={renderItem}
                sliderWidth={viewportWidth}
                itemWidth={viewportWidth}
                itemHeight={400}
                scrollEnabled={false}
                loop={true}
            />
            <FontAwesome.Button
                style={{margin: 5}}
                backgroundColor={"grey"}
                name='info'
                onPress={() => {navigation.navigate('Profile', {id: getRespectiveUser().id})}}>
                See full profile
            </FontAwesome.Button>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 20}}>
                <View>
                    <FontAwesome5
                        name='thumbs-down'
                        size={50}
                        style={{width: 55, height: 55}}
                        onPress={async () => { await buttonPress(0) }}/>
                    <Text style={{textAlign: 'center'}}>No</Text>
                </View>
                <View>
                    <FontAwesome5
                        name='smile'
                        size={50}
                        style={{width: 55, height: 55}}
                        onPress={async () => { await buttonPress(1) }}/>
                    <Text style={{textAlign: 'center'}}>Friend</Text>
                </View>
                <View>
                    <FontAwesome5
                        name='kiss-wink-heart'
                        size={50}
                        style={{width: 55, height: 55}}
                        onPress={async () => { await buttonPress(2) }}/>
                    <Text style={{textAlign: 'center'}}>Lover</Text>
                </View>
                <View>
                    <FontAwesome5
                        name='grin-hearts'
                        size={50}
                        style={{width: 55, height: 55}}
                        onPress={async () => { await buttonPress(3) }}/>
                    <Text style={{textAlign: 'center'}}>Soulmate</Text>
                </View>
            </View>
        </View>:<ActivityIndicator style={{padding: 100}} size={'large'}/>
    )
}