import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { User, Session } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { supabase } from "../supabase";

export default function Chats({navigation, route}: {navigation: any, route: any}) {
    const [usersList, setUsersList] = useState<Array<any>>([]);
    const [user, setUser] = useState<User|null>();
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonLoading, setButtonLoading] = useState(true);
    const colors = useTheme();

    useEffect(() => {
        const session: Session = route.params.session;
        if (session) {
            setUser(session.user);
            if (user) {
                findUsers();
            }   
        }
    }, [user]);

    async function getResponses() {
        if (!user) {
            throw new Error("No user");
        }
        let {data, error} = await supabase
            .from("responses")
            .select("id1, id2, response1, response2")
            .or(`id1.eq.${user.id},id2.eq.${user.id}`)
        if (error)
            throw error;
        return data;
    }

    async function getUserNames(ids: Array<string>) {
        let {data, error} = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", ids);
        if (error)
            throw error;
        if (data === null || typeof data == 'undefined')
            return [];
        return data;
    }

    async function findUsers() {
        try {
            setButtonLoading(true);
            if (!user) {
                throw new Error("No user");
            }
            const responses = await getResponses();
            if (responses === null)
                throw Error("Error getting your responses");
            const ids = responses
                .filter(x => x.response1 === x.response2)
                .map(x => {
                    if (x.id1 === user.id) {
                        return x.id2;
                    } else {
                        return x.id1;
                    }
                });
            const result = await getUserNames(ids);
            setUsersList(result);
            setLoading(false);
            setButtonLoading(false);
            console.log("gata")
        } catch(error: any) {
            Alert.alert("Error getting users", error.message);
            setLoading(false);
            setButtonLoading(false);
        }
    }

    const itemList = ({item}: {item: any}) => {
        return (
            <View>
                <Pressable
                    onPress={() => {
                        if(user !== null && typeof user !== 'undefined') {
                            navigation.navigate('ChatComponent', {
                                currentUser: {id: user.id},
                                otherUser: {id: item.id, name: item.name}
                            });
                        }
                    }}
                    android_ripple={{color: "white"}}
                    style={{
                        backgroundColor: "dodgerblue",
                        marginTop: 10,
                        padding: 10,
                        borderRadius: 20 
                    }}>
                    <Text
                        style={{
                            color: "white",
                            fontSize: 35
                        }}
                    >
                    {item.name}
                    </Text>
                </Pressable>
            </View>
        )
    }

    if (loading) {
        return (
            <ActivityIndicator style={{padding: 100}} size={'large'}/>
        )
    }

    if (usersList === null || typeof usersList === 'undefined' || usersList.length == 0) {
        return (
            <View>
                <FontAwesome.Button
                    style={{margin: 5}}
                    backgroundColor={"dodgerblue"}
                    name='refresh'
                    onPress={() => {findUsers()}}
                    disabled={buttonLoading}>
                    Refresh list
                </FontAwesome.Button>
                <Text style={{textAlign: 'center', color: colors.colors.text}}>No mathes yet</Text>
            </View>
        )
    }

    return (
        <View>
            <FontAwesome.Button
                style={{margin: 5}}
                backgroundColor={"dodgerblue"}
                name='refresh'
                onPress={() => {findUsers()}}>
                Refresh list
            </FontAwesome.Button>
            <FlatList data={usersList} renderItem={itemList} keyExtractor={item => item.id}/>
        </View>
    )
}