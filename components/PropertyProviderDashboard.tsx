import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, Building2, MessageCircle, TrendingUp, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalViews: number;
  inquiries: number;
  bookedProperties: number;
}

export default function PropertyProviderDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    inquiries: 0,
    bookedProperties: 0,
  });
  
  const userName = user?.name || 'User';

  const loadDashboardStats = React.useCallback(async () => {
    if (!user) return;

    try {
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, status')
        .eq('owner_id', user.id);

      if (propertiesError) {
        console.error('Failed to load properties:', propertiesError);
        return;
      }

      const totalProperties = properties?.length || 0;
      const activeListings = properties?.filter(p => p.status === 'active').length || 0;
      const bookedProperties = properties?.filter(p => p.status === 'booked').length || 0;
      
      const propertyIds = properties?.map(p => p.id) || [];
      
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, property_id')
        .in('property_id', propertyIds)
        .not('property_id', 'is', null);

      const totalViews = conversations?.length || 0;

      const { data: messages } = await supabase
        .from('messages')
        .select('id, receiver_id, read')
        .eq('receiver_id', user.id)
        .eq('read', false);

      const inquiries = messages?.length || 0;

      setStats({
        totalProperties,
        activeListings,
        totalViews,
        inquiries,
        bookedProperties,
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user, loadDashboardStats]);

  const StatCard = ({ 
    icon: Icon, 
    value, 
    label, 
    gradient 
  }: { 
    icon: any; 
    value: number; 
    label: string; 
    gradient: string[];
  }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statCardGradient}
      >
        <View style={styles.statIconContainer}>
          <Icon size={24} color={Colors.white} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerGradient}>
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome Back, {userName}! 👋</Text>
              <Text style={styles.title}>Provider Dashboard</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/provider/my-listings' as any)}
            >
              <TrendingUp size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon={Home}
              value={stats.totalProperties}
              label="Total Properties"
              gradient={['#10b981', '#059669']}
            />
            <StatCard
              icon={Building2}
              value={stats.activeListings}
              label="Active Listings"
              gradient={['#3b82f6', '#2563eb']}
            />
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#F59E0B', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
              >
                <View style={styles.statIconContainer}>
                  <View style={styles.bookedIconWrapper}>
                    <CheckCircle size={24} color={Colors.white} strokeWidth={3} />
                  </View>
                </View>
                <Text style={styles.statValue}>{stats.bookedProperties}</Text>
                <Text style={styles.statLabel}>Booked</Text>
              </LinearGradient>
            </View>
            <StatCard
              icon={MessageCircle}
              value={stats.inquiries}
              label="Inquiries"
              gradient={['#a855f7', '#9333ea']}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    marginBottom: 16,
  },
  headerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerGradient: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: 0.3,
  },
  viewAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  statCardGradient: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  bookedIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
});
