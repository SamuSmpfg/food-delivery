import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const grayScale = useRef(new Animated.Value(0)).current;
  const orangeScale = useRef(new Animated.Value(0)).current;
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(grayScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(orangeScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!showSplash) {
    return <Redirect href="/onBoarding" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Image
        source={require("../../../assets/images/rays-gray.png")}
        style={[styles.raysGray, { transform: [{ scale: grayScale }] }]}
      />
      <Animated.Image
        source={require("../../../assets/images/rays-orange.png")}
        style={[styles.raysOrange, { transform: [{ scale: orangeScale }] }]}
      />

      <Image
        source={require("../../../assets/images/Logo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff"
  },
  raysGray: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 200,
    height: 200,
  },
  raysOrange: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 200,
    height: 200,
  },
  logo: {
    width: 121,
    height: 58,
  },
});