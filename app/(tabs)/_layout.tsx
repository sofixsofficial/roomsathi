import { Tabs } from "expo-router";
import { Search, Heart, MessageCircle, User, Plus, LayoutDashboard, Home, History } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import Colors, { getThemeColors } from "@/constants/colors";
import { useAuth } from "@/hooks/auth-store";

export default function TabLayout() {
  const { user } = useAuth();
  const isPropertyProvider = user?.userType === 'owner';
  const isAdmin = user?.userType === 'admin';
  const themeColors = getThemeColors(user?.userType);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: isAdmin ? { display: 'none' } : {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isPropertyProvider ? "Provider" : "Finder",
          tabBarIcon: ({ color }) => isPropertyProvider ? <LayoutDashboard size={24} color={color} /> : <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
          href: !isPropertyProvider ? '/favorites' : null,
        }}
      />
      <Tabs.Screen
        name="add-property"
        options={{
          title: "Add Property",
          tabBarIcon: ({ color }) => <Plus size={24} color={color} />,
          href: isPropertyProvider ? '/add-property' : null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: isPropertyProvider ? "Messages" : "History",
          tabBarIcon: ({ color }) => isPropertyProvider ? <MessageCircle size={24} color={color} /> : <History size={24} color={color} />,
          href: !isPropertyProvider ? '/messages' : null,
        }}
      />
      <Tabs.Screen
        name="my-property"
        options={{
          title: "My Property",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          href: isPropertyProvider ? '/my-property' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: isAdmin ? '/admin' : null,
          title: 'Admin',
        }}
      />
    </Tabs>
  );
}
