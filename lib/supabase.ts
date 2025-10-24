import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://dcsoudthcmkrficgcbio.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjc291ZHRoY21rcmZpY2djYmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTg2MzAsImV4cCI6MjA3NTUzNDYzMH0.6Z_RKFr_XwIYlrmIbYFyG2GCiuWnim2Tmesb_YwU_V4';

console.log('Initializing Supabase client...');
console.log('Supabase URL:', supabaseUrl);
console.log('Platform:', Platform.OS);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-client-info': `expo-${Platform.OS}`,
    },
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string;
          avatar: string | null;
          user_type: 'renter' | 'owner' | 'admin';
          status: 'active' | 'suspended' | 'blocked';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone: string;
          avatar?: string | null;
          user_type: 'renter' | 'owner' | 'admin';
          status?: 'active' | 'suspended' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string;
          avatar?: string | null;
          user_type?: 'renter' | 'owner' | 'admin';
          status?: 'active' | 'suspended' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          deposit: number;
          address: string;
          city: string;
          state: string;
          pincode: string;
          latitude: number;
          longitude: number;
          property_type: 'room-rent' | 'flat-rent' | 'shutter-rent' | 'house-rent' | 'land-rent' | 'house-buy' | 'land-buy' | 'hostel-available';
          category: 'rent' | 'buy' | 'hostel';
          bhk: string;
          furnishing_type: 'fully' | 'semi' | 'unfurnished';
          amenities: string[];
          pets_allowed: boolean;
          couples_allowed: boolean;
          families_allowed: boolean;
          bachelors_allowed: boolean;
          images: string[];
          owner_id: string;
          owner_name: string;
          owner_phone: string;
          available_from: string;
          virtual_tour_url: string | null;
          status: 'active' | 'pending' | 'rejected' | 'rented';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          deposit: number;
          address: string;
          city: string;
          state: string;
          pincode: string;
          latitude: number;
          longitude: number;
          property_type: 'room-rent' | 'flat-rent' | 'shutter-rent' | 'house-rent' | 'land-rent' | 'house-buy' | 'land-buy' | 'hostel-available';
          category: 'rent' | 'buy' | 'hostel';
          bhk: string;
          furnishing_type: 'fully' | 'semi' | 'unfurnished';
          amenities: string[];
          pets_allowed: boolean;
          couples_allowed: boolean;
          families_allowed: boolean;
          bachelors_allowed: boolean;
          images: string[];
          owner_id: string;
          owner_name: string;
          owner_phone: string;
          available_from: string;
          virtual_tour_url?: string | null;
          status?: 'active' | 'pending' | 'rejected' | 'rented';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          deposit?: number;
          address?: string;
          city?: string;
          state?: string;
          pincode?: string;
          latitude?: number;
          longitude?: number;
          property_type?: 'room-rent' | 'flat-rent' | 'shutter-rent' | 'house-rent' | 'land-rent' | 'house-buy' | 'land-buy' | 'hostel-available';
          category?: 'rent' | 'buy' | 'hostel';
          bhk?: string;
          furnishing_type?: 'fully' | 'semi' | 'unfurnished';
          amenities?: string[];
          pets_allowed?: boolean;
          couples_allowed?: boolean;
          families_allowed?: boolean;
          bachelors_allowed?: boolean;
          images?: string[];
          owner_id?: string;
          owner_name?: string;
          owner_phone?: string;
          available_from?: string;
          virtual_tour_url?: string | null;
          status?: 'active' | 'pending' | 'rejected' | 'rented';
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          participants: string[];
          property_id: string | null;
          property_title: string | null;
          last_message: string;
          last_message_time: string;
          unread_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participants: string[];
          property_id?: string | null;
          property_title?: string | null;
          last_message: string;
          last_message_time: string;
          unread_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participants?: string[];
          property_id?: string | null;
          property_title?: string | null;
          last_message?: string;
          last_message_time?: string;
          unread_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          property_id: string | null;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          property_id?: string | null;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          receiver_id?: string;
          property_id?: string | null;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
