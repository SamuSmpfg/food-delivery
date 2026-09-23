import { View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState, useRef } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { useRouter } from 'expo-router';

const { width } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "All your favorites",
    description: "Get all your loved foods in one once place, you just place the orer we do the rest",
  },
  {
    key: "2",
    title: "All your favorites",
    description: "Get all your loved foods in one once place, you just place the orer we do the rest",
  },
  {
    key: "3",
    title: "Order from choosen chef",
    description: "Get all your loved foods in one once place, you just place the orer we do the rest",
  },
  {
    key: "4",
    title: "Free delivery offers",
    description: "Get all your loved foods in one once place, you just place the orer we do the rest",
  },
];

const LocationAccess = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const router = useRouter();

  const isLastSlide = activeIndex === slides.length - 1;

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (isLastSlide) {
      return router.navigate('/(auth)/SignIn');
    }
    flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={[styles.container, { width }]}>
            <View style={styles.onBoardingImage}></View>
            <Text style={styles.headerSlide}>{item.title}</Text>
            <Text style={styles.paragraphSlide}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{isLastSlide ? "GET STARTED" : "NEXT"}</Text>
        </TouchableOpacity>
        {!isLastSlide && (
          <TouchableOpacity onPress={() => router.navigate('/(auth)/SignIn')}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center"
    },
    onBoardingImage: {
        width: 240,
        height: 292,
        backgroundColor: "#98A8B8",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        marginTop: 114
    },
    headerSlide: {
        fontSize: 18,
        fontFamily: "Sen_800ExtraBold",
        color: "#32343E",
        marginTop: 48,
        marginBottom: 16
    },
    paragraphSlide: {
        fontSize: 16,
        fontFamily: "Sen_400Regular",
        color: "#646982",
        textAlign: 'center',
        marginHorizontal: 25
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center"
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FFE1CE",
        marginHorizontal: 4
    },
    activeDot: {
        backgroundColor: "#FF7622",
        width: 20
    },
    buttonContainer: {
        alignItems: "center",
        marginTop: 60,
        marginHorizontal: 25
    },
    nextButton: {
        width: 327,
        height: 62,
        backgroundColor: "#FF7622",
        paddingVertical: 16,
        paddingTop: 22,
        borderRadius: 12,
        alignItems: "center",
    },
    nextButtonText: {
        fontFamily: "Sen_700Bold",
        color: "#FFFFFF",
        fontSize: 12,
    },
    skipText: {
        fontFamily: "Sen_400Regular",
        color: "#646982",
        fontSize: 14,
        marginTop: 16
    }
})

export default LocationAccess