import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  gradient: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Find Your Perfect Property",
    description:
      "Browse through thousands of verified properties tailored to your needs",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    gradient: ["#667eea", "#764ba2"],
  },
  {
    id: "2",
    title: "Easy Search & Filters",
    description:
      "Advanced filters to find exactly what you are looking for quickly",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    gradient: ["#f093fb", "#f5576c"],
  },
  {
    id: "3",
    title: "Direct Communication",
    description:
      "Chat directly with property owners and schedule visits instantly",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    gradient: ["#4facfe", "#00f2fe"],
  },
  {
    id: "4",
    title: "Trusted & Secure",
    description:
      "All properties are verified and secure for your peace of mind",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    gradient: ["#43e97b", "#38f9d7"],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      router.replace("/auth/login");
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
      // Still navigate even if storage fails
      router.replace("/auth/login");
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleSkip();
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <Image
        source={{ uri: item.image }}
        style={styles.slideImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.95)"] as any}
        style={styles.slideOverlay}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={slides[currentIndex].gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
              </Text>
              <ChevronRight size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.poweredBy}>Powered by Sofixs</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  slideImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  slideOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 120,
  },
  textContainer: {
    paddingHorizontal: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  description: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
  },
  paginationDotActive: {
    width: 30,
    backgroundColor: Colors.primary,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textLight,
  },
  nextButton: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.white,
  },
  poweredBy: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textLight,
    textAlign: "center",
    marginTop: 8,
  },
});
