import { User, Session } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { supabase } from "../supabase";

export default function Chats({navigation, route}: {navigation: any, route: any}) {
    const [usersList, setUsersList] = useState<Array<any>>([]);
    const [user, setUser] = useState<User|null>();

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
        } catch(error: any) {
            Alert.alert("Error getting users", error.message);
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
                        margin: 8,
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

    return (
        usersList.length?
        <View>
            <FlatList data={usersList} renderItem={itemList} keyExtractor={item => item.id}/>
        </View>:
        <View style={{marginTop: 150}}>
            <Text style={{textAlign: 'center'}}>No mathes yet</Text>
        </View>
    )
}