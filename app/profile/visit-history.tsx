import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import Colors from '@/constants/colors';
import { MapPin, Calendar, Clock, Phone, MessageCircle, Trash2 } from 'lucide-react-native';

interface Visit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyLocation: string;
  visitDate: string;
  visitTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  ownerName: string;
  ownerPhone: string;
  notes?: string;
}

const mockVisits: Visit[] = [
  {
    id: '1',
    propertyId: '1',
    propertyTitle: 'Spacious 2BHK Apartment in Downtown',
    propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    propertyLocation: 'Downtown, Mumbai',
    visitDate: '2025-01-20',
    visitTime: '10:00 AM',
    status: 'scheduled',
    ownerName: 'Rajesh Kumar',
    ownerPhone: '+91 98765 43210',
    notes: 'Please bring ID proof',
  },
  {
    id: '2',
    propertyId: '2',
    propertyTitle: 'Modern Studio Near Tech Park',
    propertyImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    propertyLocation: 'Whitefield, Bangalore',
    visitDate: '2025-01-15',
    visitTime: '2:00 PM',
    status: 'completed',
    ownerName: 'Priya Sharma',
    ownerPhone: '+91 98765 43211',
  },
  {
    id: '3',
    propertyId: '3',
    propertyTitle: 'Cozy 1BHK with Garden View',
    propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    propertyLocation: 'Koramangala, Bangalore',
    visitDate: '2025-01-10',
    visitTime: '11:00 AM',
    status: 'completed',
    ownerName: 'Amit Patel',
    ownerPhone: '+91 98765 43212',
  },
  {
    id: '4',
    propertyId: '4',
    propertyTitle: 'Luxury 3BHK Penthouse',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    propertyLocation: 'Bandra, Mumbai',
    visitDate: '2025-01-05',
    visitTime: '4:00 PM',
    status: 'cancelled',
    ownerName: 'Sneha Reddy',
    ownerPhone: '+91 98765 43213',
    notes: 'Cancelled due to personal reasons',
  },
];

export default function VisitHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [visits] = useState<Visit[]>(mockVisits);

  const filteredVisits = visits.filter(visit => {
    if (selectedTab === 'all') return true;
    return visit.status === selectedTab;
  });

  const getStatusConfig = (status: Visit['status']) => {
    switch (status) {
      case 'scheduled':
        return { color: Colors.primary, label: 'Scheduled' };
      case 'completed':
        return { color: Colors.success, label: 'Completed' };
      case 'cancelled':
        return { color: Colors.error, label: 'Cancelled' };
    }
  };

  const renderVisitCard = ({ item }: { item: Visit }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={styles.visitCard}
        onPress={() => router.push(`/property/${item.propertyId}`)}
      >
        <Image
          source={{ uri: item.propertyImage }}
          style={styles.visitImage}
          contentFit="cover"
        />
        <View style={styles.visitContent}>
          <View style={styles.visitHeader}>
            <Text style={styles.visitTitle} numberOfLines={2}>
              {item.propertyTitle}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <View style={styles.visitLocation}>
            <MapPin size={14} color={Colors.textLight} />
            <Text style={styles.visitLocationText}>{item.propertyLocation}</Text>
          </View>

          <View style={styles.visitDetails}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={Colors.primary} />
              <Text style={styles.detailText}>
                {new Date(item.visitDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.detailText}>{item.visitTime}</Text>
            </View>
          </View>

          <View style={styles.ownerInfo}>
            <Text style={styles.ownerLabel}>Owner:</Text>
            <Text style={styles.ownerName}>{item.ownerName}</Text>
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}

          {item.status === 'scheduled' && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={18} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={18} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                <Trash2 size={18} color={Colors.error} />
                <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) return null;

  return (
    <>
      <Stack.Screen options={{ title: 'Visit History', headerShown: true }} />
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
              All ({visits.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'scheduled' && styles.tabActive]}
            onPress={() => setSelectedTab('scheduled')}
          >
            <Text style={[styles.tabText, selectedTab === 'scheduled' && styles.tabTextActive]}>
              Scheduled ({visits.filter(v => v.status === 'scheduled').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
              Completed ({visits.filter(v => v.status === 'completed').length})
            </Text>
          </TouchableOpacity>
        </View>

        {filteredVisits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No visits found</Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'all' && 'You have not scheduled any property visits yet.'}
              {selectedTab === 'scheduled' && 'You have no upcoming visits scheduled.'}
              {selectedTab === 'completed' && 'You have not completed any visits yet.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredVisits}
            keyExtractor={item => item.id}
            renderItem={renderVisitCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  visitCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  visitImage: {
    width: '100%',
    height: 160,
  },
  visitContent: {
    padding: 16,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  visitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  visitLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  visitLocationText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  visitDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: '500',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ownerLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 6,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  notesContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  cancelButton: {
    borderColor: Colors.error,
  },
  cancelButtonText: {
    color: Colors.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
