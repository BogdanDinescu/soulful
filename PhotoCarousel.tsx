import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Alert, StyleSheet, Text, View, Dimensions } from 'react-native';
import Carousel from 'react-native-snap-carousel';

export default function PhotoCarousel({photosUrls, uploadPhoto, removePhoto}: {photosUrls: Array<string>, uploadPhoto?: Function, removePhoto?: Function}) {
    
    const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

    const renderItem = ({item, index}: {item: any, index: number}) => {
        if (item === "") {
            return (
                <View style={{
                    display: 'flex', 
                    alignItems:"center",
                    paddingTop: 200,
                    width: viewportWidth,
                    height: 400
                    }}>
                    {
                    uploadPhoto?
                    <FontAwesome.Button 
                        name="plus"
                        style={{height: 50}}
                        onPress={() => { uploadPhoto(index) }}>
                        Add image
                    </FontAwesome.Button>:<></>
                    }
              </View>
            )
        } else {
            return (
                <View>
                    {
                    removePhoto?
                    <FontAwesome.Button
                            name='remove'
                            style={{backgroundColor: "darkred"}}
                            onPress={
                                () => { removePhoto(index) }
                            }>
                            Remove this image
                    </FontAwesome.Button>:<></>
                    }
                    <Image
                        source={{uri: item}}
                        style={{width: viewportWidth, height: 400, resizeMode: 'contain'}}
                        />
                </View>
            )
        }
    }

    const isCarousel = useRef(null);

    return (
        <View>
            <Carousel
                layout={'default'}
                ref={isCarousel}
                data={photosUrls}
                renderItem={renderItem}
                sliderWidth={viewportWidth}
                itemWidth={viewportWidth}
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