import React, { useEffect, useRef, useState } from 'react';
import { Image, Alert, Text, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { supabase } from './supabase';
import * as Location from 'expo-location';
import Geohash from 'latlon-geohash';
import { Session, User } from '@supabase/supabase-js';

export default function ExploreTab({navigation, route}: {navigation: any, route: any}) {
    const [usersList, setUsersList] = useState<Array<any>>([]);
    const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);
    const [location, setLocation] = useState<Location.LocationObject|null>(null);
    const [user, setUser] = useState<User|null>();
    const [userGeoHash, setUserGeoHash] = useState<string>("");

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
        console.log(data);
        setUsersList(data);
    }
    
    const renderItem = ({item, index}: {item: any, index: number}) => {
        return (
            <View>
                <Text>{item}</Text>
            </View>
        )
    }

    const isCarousel = useRef(null);
    
    if (permissionStatus !== Location.PermissionStatus.GRANTED) {
        return (
          <View style={{padding: 100}}>
            <Text style={{textAlign: 'center'}}>Please enable location to continue</Text>
          </View>
        )
      }

    return (
        <View>
            <Carousel
                layout={'tinder'}
                ref={isCarousel}
                data={usersList}
                renderItem={renderItem}
                sliderWidth={500}
                itemWidth={500}
                enableMomentum={false}
                enableSnap={true}
            />
        </View>
    )
}