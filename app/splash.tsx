import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Star } from 'lucide-react-native';
import { BRANDING } from '@/constants/branding';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const dot4Anim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // fade and entrance scale for the whole logo area
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle1, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkle1, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(sparkle2, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkle2, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(sparkle3, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkle3, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // dot celebration animations (small pop / bounce)
    const makeDotLoop = (anim: Animated.Value, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.delay(300),
        ])
      );

    makeDotLoop(dot1Anim, 0).start();
    makeDotLoop(dot2Anim, 150).start();
    makeDotLoop(dot3Anim, 300).start();
    makeDotLoop(dot4Anim, 450).start();

    // confetti emoji float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ])
    ).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  // logo should remain fixed (no rotate)

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkle1 }]}>
        <Sparkles size={32} color="#FFD700" />
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkle2 }]}>
        <Star size={28} color="#FFA500" />
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: sparkle3 }]}>
        <Sparkles size={36} color="#FF6B6B" />
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle4, { opacity: sparkle1 }]}>
        <Star size={24} color="#4ECDC4" />
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle5, { opacity: sparkle2 }]}>
        <Sparkles size={30} color="#95E1D3" />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View style={[styles.iconWrapper]}>
            <Image 
              source={{ uri: BRANDING.logo }}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.celebrationDots}>
              <Animated.View
                style={[
                  styles.dot,
                  styles.dot1,
                  {
                    transform: [
                      {
                        scale: dot1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.3] }),
                      },
                    ],
                    opacity: dot1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  styles.dot2,
                  {
                    transform: [
                      {
                        scale: dot2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.2] }),
                      },
                    ],
                    opacity: dot2Anim,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  styles.dot3,
                  {
                    transform: [
                      {
                        scale: dot3Anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.25] }),
                      },
                    ],
                    opacity: dot3Anim,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  styles.dot4,
                  {
                    transform: [
                      {
                        scale: dot4Anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.15] }),
                      },
                    ],
                    opacity: dot4Anim,
                  },
                ]}
              />
            </View>
          </Animated.View>
          <View style={styles.confetti}>
            <Animated.Text
              style={[
                styles.confettiEmoji,
                {
                  transform: [
                    { translateY: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [6, -6] }) },
                    { scale: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] }) },
                  ],
                  opacity: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                },
              ]}
            >🎊</Animated.Text>
            <Animated.Text
              style={[
                styles.confettiEmoji,
                {
                  transform: [
                    { translateY: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [4, -8] }) },
                    { scale: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] }) },
                  ],
                  opacity: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                },
              ]}
            >✨</Animated.Text>
            <Animated.Text
              style={[
                styles.confettiEmoji,
                {
                  transform: [
                    { translateY: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [8, -4] }) },
                    { scale: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] }) },
                  ],
                  opacity: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                },
              ]}
            >🎊</Animated.Text>
          </View>
        </Animated.View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.poweredBy}>Powered by Sofixs</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 300,
    height: 180,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4F86F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative' as const,
  },
  logo: {
    width: '90%',
    height: '90%',
    zIndex: 2,
  },
  celebrationDots: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute' as const,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dot1: {
    backgroundColor: '#FFD700',
    top: 10,
    right: 20,
  },
  dot2: {
    backgroundColor: '#FF6B6B',
    bottom: 20,
    left: 10,
  },
  dot3: {
    backgroundColor: '#4ECDC4',
    top: 30,
    left: 15,
  },
  dot4: {
    backgroundColor: '#95E1D3',
    bottom: 10,
    right: 15,
  },

  confetti: {
    flexDirection: 'row' as const,
    gap: 16,
    marginTop: 16,
  },
  confettiEmoji: {
    fontSize: 32,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  poweredBy: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  sparkle: {
    position: 'absolute' as const,
  },
  sparkle1: {
    top: 100,
    left: 40,
  },
  sparkle2: {
    top: 150,
    right: 50,
  },
  sparkle3: {
    top: 250,
    left: 60,
  },
  sparkle4: {
    bottom: 200,
    right: 40,
  },
  sparkle5: {
    bottom: 150,
    left: 50,
  },
});
