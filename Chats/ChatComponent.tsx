import { FontAwesome } from "@expo/vector-icons";
import { Chat, defaultTheme, MessageType } from "@flyerhq/react-native-chat-ui";
import { RealtimeSubscription, SupabaseRealtimePayload } from "@supabase/supabase-js";
import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import uuid from 'react-native-uuid';
import { supabase } from "../supabase";

export default function ChatComponent({navigation, route}: {navigation:any, route:any}) {
    const [otherUser, setOtherUser] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [messages, setMessages] = useState<MessageType.Any[]>([]);
    const messagesRef = useRef<MessageType.Any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [subscription, setSubscription] = useState<RealtimeSubscription|null>(null);

    useEffect(() => {
        console.log("effect")
        if (otherUser === null) {
            setOtherUser(route.params.otherUser);
        }
        if (currentUser === null) {
            setCurrentUser(route.params.currentUser);
        }
        if (otherUser !== null && typeof otherUser !== 'undefined' && otherUser.name !== null && otherUser.id !== null) {
            navigation.setOptions({headerTitle: otherUser.name});
            if(currentUser !== null && typeof currentUser !== 'undefined' && currentUser.id !== null) {
                getMessages();
                if (subscription === null) {
                    const sub = supabase
                        .from("messages")
                        .on('INSERT', handleSubscription)
                        .subscribe();
                    setSubscription(sub);
                }
            }
        }
        return () => {
            if (subscription !== null && typeof subscription !== 'undefined') {
                supabase.removeSubscription(subscription);
            }
        }
    }, [currentUser, otherUser, subscription]);

    async function handleSubscription(payload: SupabaseRealtimePayload<any>) {
        const insertedRow = payload.new;
        if (insertedRow.from === otherUser.id && insertedRow.to === currentUser.id) {
            const newMessage = rowToMessageType(insertedRow);
            messagesRef.current = [newMessage, ...messagesRef.current]
            setMessages(messagesRef.current);
        }
    }

    function rowToMessageType(row: any): MessageType.Text {
        const textMessage: MessageType.Text = {
            author: {id: row.from},
            createdAt: row.created_at,
            id: row.id,
            text: row.text,
            type: 'text',
        }
        return textMessage;
    }

    async function getMessages() {
        try {
            const {data, error} = await supabase
                .from("messages")
                .select('id, from, to, created_at, text')
                .or(`from.eq.${currentUser.id},to.eq.${currentUser.id}`)
                .order("created_at", {ascending: false});
            if (error) {
                throw error;
            }
            if (data === null || typeof data === 'undefined') {
                throw Error("No messages found")
            }
            messagesRef.current = data.map((m) => {
                return rowToMessageType(m);
            });
            setMessages(messagesRef.current);
            setLoading(false);
        } catch(error: any) {
            Alert.alert("Error getting messages", error.message);
        }
    }

    async function addMessage(message: MessageType.Text) {
        try {
            if (currentUser === null || typeof currentUser === 'undefined') {
                throw new Error("Current user not found")
            }
            if (otherUser === null || typeof otherUser === 'undefined') {
                throw new Error("User not found")
            }
            if (message === null || typeof message === 'undefined'
                || message.id === null || message.text === null
                || message.text.length == 0) {
                throw new Error("Message empty")
            }
            const row = {
                id: message.id,
                from: currentUser.id,
                to: otherUser.id,
                text: message.text
            }
            const {error} = await supabase
                .from("messages")
                .insert(row, {returning: "minimal"});
            if (error) {
                throw error;
            }
            messagesRef.current = [message, ...messagesRef.current]
            setMessages(messagesRef.current);
        } catch(error: any) {
            Alert.alert("Error sending message", error.message);
        }
    }
    
    function handleSendPress(message: MessageType.PartialText) {
        if (currentUser !== null) {
            const textMessage: MessageType.Text = {
                author: currentUser,
                createdAt: Date.now(),
                id: uuid.v4().toString(),
                text: message.text,
                type: 'text',
            }
            addMessage(textMessage);
        }
    }

    return (
        !loading?
        <View style={{height: "100%"}}>
            <FontAwesome.Button
                style={{margin: 5}}
                backgroundColor={"grey"}
                name='info'
                onPress={() => {navigation.navigate('Profile', {id: otherUser.id})}}>
                See profile
            </FontAwesome.Button>
            <Chat
                messages={messages}
                onSendPress={handleSendPress}
                user={currentUser}
                theme={{
                    ...defaultTheme,
                    colors: {...defaultTheme.colors,
                        inputBackground: 'grey',
                        inputText: 'white',
                        primary: 'deepskyblue',
                        secondary: 'lightcoral'},
                    fonts: {
                        ...defaultTheme.fonts,
                        receivedMessageBodyTextStyle: {
                            color: 'white',
                            fontWeight: '600'
                        }
                    }
                }}
            />
        </View>:<ActivityIndicator style={{padding: 100}} size={'large'}/>
    )
}
