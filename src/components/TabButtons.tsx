import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import React, { useEffect, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export type TabButtonType = {
  title: string;
};

type TabButtonsProps = {
  buttons: TabButtonType[];
  selectedTab: number;
  setSelectedTab: (index: number) => void;
};

const TabButtons = ({ buttons, selectedTab, setSelectedTab }: TabButtonsProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const buttonWidth = containerWidth / (buttons.length || 1);

  const tabPositionX = useSharedValue(0);

  const onTabBarLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  useEffect(() => {
    tabPositionX.value = withTiming(buttonWidth * selectedTab);
  }, [selectedTab, buttonWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  return (
    <View style={styles.container}>
      <View onLayout={onTabBarLayout} style={styles.tabContainer}>
        {buttons.map((button, index) => {
          const color = selectedTab === index ? '#F07F2E' : '#A5A7B9';
          return (
            <Pressable
              key={button.title}
              style={styles.btn}
              onPress={() => setSelectedTab(index)}
            >
              <Text style={[styles.textStatus, { color }]}>{button.title}</Text>
            </Pressable>
          );
        })}

        <Animated.View
          style={[styles.lineSeparator, { width: buttonWidth }, animatedStyle]}
        />
        <View style={styles.lineSeparatorGray}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  textStatus: {
    fontFamily: 'Sen_700Bold',
    fontSize: 14,
  },
  lineSeparator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    borderRadius: 100,
    backgroundColor: '#F07F2E',
    zIndex: 1
  },
    lineSeparatorGray: {
    width: 'auto',
    height: 1,
    backgroundColor: '#CED7DF',
    borderRadius: 100,
    bottom: 2
    },
  
});

export default TabButtons;