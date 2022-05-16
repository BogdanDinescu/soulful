import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Alert, StyleSheet, Text, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';

export default function PhotoCarousel({photosUrls, uploadPhoto}: {photosUrls: Array<string>, uploadPhoto: Function}) {
    
    const renderItem = ({item, index}: {item: any, index: number}) => {
        if (item === "") {
            return (
                <View style={{
                    display: 'flex', 
                    alignItems:"center",
                    paddingTop: 100,
                    width:300,
                    height:300
                    }}>
                    <FontAwesome.Button 
                        name="plus"
                        style={{height: 50}}
                        onPress={() => uploadPhoto(index)}>
                        Add image
                    </FontAwesome.Button>
              </View>
            )
        } else {
            return (
                <View>
                    <Image
                        source={{uri: item}}
                        style={{width:300, height:300}}
                        />
                </View>
            )
        }
    }

    const isCarousel = useRef(null);

    return (
        <View style={{display: "flex", alignItems: "center"}}>
            <Carousel
                layout={'default'}
                ref={isCarousel}
                data={photosUrls}
                renderItem={renderItem}
                sliderWidth={300}
                itemWidth={300}
                enableMomentum={false}
                enableSnap={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
});