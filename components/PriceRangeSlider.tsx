import React, { useState, useEffect } from 'react';
import { StyleSheet, View, PanResponder, Animated, LayoutChangeEvent } from 'react-native';
import Colors from '@/constants/colors';

interface PriceRangeSliderProps {
  minValue: number;
  maxValue: number;
  onValueChange: (min: number, max: number) => void;
}

export default function PriceRangeSlider({ 
  minValue, 
  maxValue, 
  onValueChange 
}: PriceRangeSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const [minThumbPosition] = useState(new Animated.Value(0));
  const [maxThumbPosition] = useState(new Animated.Value(0));
  const [localMinValue, setLocalMinValue] = useState(minValue);
  const [localMaxValue, setLocalMaxValue] = useState(maxValue);
  
  const MIN_RANGE = 0;
  const MAX_RANGE = 100000;
  const THUMB_SIZE = 24;


  useEffect(() => {
    if (sliderWidth > 0) {
      const minPos = ((minValue - MIN_RANGE) / (MAX_RANGE - MIN_RANGE)) * (sliderWidth - THUMB_SIZE);
      const maxPos = ((maxValue - MIN_RANGE) / (MAX_RANGE - MIN_RANGE)) * (sliderWidth - THUMB_SIZE);
      
      minThumbPosition.setValue(minPos);
      maxThumbPosition.setValue(maxPos);
      
      setLocalMinValue(minValue);
      setLocalMaxValue(maxValue);
    }
  }, [minValue, maxValue, sliderWidth, minThumbPosition, maxThumbPosition]);

  const minPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      let newPosition = gestureState.moveX - THUMB_SIZE / 2;
      
      // Constrain to slider bounds
      newPosition = Math.max(0, newPosition);
      newPosition = Math.min(maxThumbPosition.__getValue() - THUMB_SIZE / 2, newPosition);
      
      minThumbPosition.setValue(newPosition);
      
      const newValue = Math.round(
        (newPosition / (sliderWidth - THUMB_SIZE)) * (MAX_RANGE - MIN_RANGE) + MIN_RANGE
      );
      setLocalMinValue(newValue);
    },
    onPanResponderRelease: () => {
      onValueChange(localMinValue, localMaxValue);
    },
  });

  const maxPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      let newPosition = gestureState.moveX - THUMB_SIZE / 2;
      
      // Constrain to slider bounds
      newPosition = Math.min(sliderWidth - THUMB_SIZE, newPosition);
      newPosition = Math.max(minThumbPosition.__getValue() + THUMB_SIZE / 2, newPosition);
      
      maxThumbPosition.setValue(newPosition);
      
      const newValue = Math.round(
        (newPosition / (sliderWidth - THUMB_SIZE)) * (MAX_RANGE - MIN_RANGE) + MIN_RANGE
      );
      setLocalMaxValue(newValue);
    },
    onPanResponderRelease: () => {
      onValueChange(localMinValue, localMaxValue);
    },
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  };

  const minThumbStyle = {
    transform: [{ translateX: minThumbPosition }],
  };

  const maxThumbStyle = {
    transform: [{ translateX: maxThumbPosition }],
  };

  const selectedRangeStyle = {
    left: Animated.add(minThumbPosition, THUMB_SIZE / 2),
    right: Animated.add(
      Animated.subtract(new Animated.Value(sliderWidth), maxThumbPosition),
      -THUMB_SIZE / 2
    ),
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.track} />
      <Animated.View style={[styles.selectedRange, selectedRangeStyle]} />
      <Animated.View
        style={[styles.thumb, minThumbStyle]}
        {...minPanResponder.panHandlers}
      />
      <Animated.View
        style={[styles.thumb, maxThumbStyle]}
        {...maxPanResponder.panHandlers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  selectedRange: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
    position: 'absolute',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    position: 'absolute',
    top: 8,
    marginTop: -9,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});