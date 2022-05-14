import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'react-native-elements';
import Carousel from 'react-native-snap-carousel';

export default function PhotoCarousel({photosUrls}: {photosUrls: Array<string>}) {
    
    const renderItem = ({item, index}: {item: any, index: number}) => {
        return (
            <View>
                <Image
                    source={{ uri: item[index] }}
                    width={400} height={400}
                    />
            </View>
        )
    }

    return (
        <View>
            <Carousel
                layout={'default'}
                //ref={(c) => this.carousel = c}
                data={photosUrls}
                renderItem={renderItem}
                sliderWidth={400}
                itemWidth={400}
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