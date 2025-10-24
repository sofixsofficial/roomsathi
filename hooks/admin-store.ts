import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Property } from '@/types';
import { supabase } from '@/lib/supabase';

export interface AdminStats {
  totalUsers: number;
  totalRenters: number;
  totalOwners: number;
  totalProperties: number;
  activeListings: number;
  pendingListings: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  newPropertiesThisMonth: number;
}

export const [AdminContext, useAdmin] = createContextHook(() => {
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = useCallback(async (retryCount = 0) => {
    try {
      if (retryCount === 0) {
        setLoading(true);
      }
      console.log('Loading admin data...');
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        if (usersError.message?.includes('Abort') || usersError.message?.includes('aborted')) {
          console.log('Users request aborted, skipping error handling');
          setLoading(false);
          return;
        }
        
        console.error('ERROR Failed to load users:', JSON.stringify({
          code: usersError.code,
          message: usersError.message,
          details: usersError.details,
          hint: usersError.hint,
        }, null, 2));
        
        const isNetworkError = 
          usersError.message?.includes('Network request failed') ||
          usersError.message?.includes('fetch failed') ||
          usersError.message?.includes('Failed to fetch') ||
          usersError.code === 'ETIMEDOUT' ||
          usersError.code === 'ECONNREFUSED';
        
        if (isNetworkError && retryCount < 3) {
          console.log(`Retrying users load... Attempt ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
          return loadAdminData(retryCount + 1);
        }
        
        const errorMsg = isNetworkError 
          ? 'Cannot connect to server. Please check your internet connection and try again.'
          : usersError.message || 'Failed to load users';
        
        setError(errorMsg);
        console.error('ERROR Warning: Failed to load users:', {
          message: usersError.message,
          details: usersError.message,
          hint: usersError.hint || '',
          code: usersError.code || '',
        });
      } else if (usersData) {
        const mappedUsers: User[] = usersData.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          avatar: u.avatar || undefined,
          userType: u.user_type,
          isOwner: u.user_type === 'owner',
          isAdmin: u.user_type === 'admin',
          isFinder: u.user_type === 'renter',
          status: u.status,
          createdAt: u.created_at,
        }));
        setUsers(mappedUsers);
        console.log(`Successfully loaded ${mappedUsers.length} users`);
      }

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertiesError) {
        if (propertiesError.message?.includes('Abort') || propertiesError.message?.includes('aborted')) {
          console.log('Properties request aborted, skipping error handling');
          setLoading(false);
          return;
        }
        
        console.error('ERROR Failed to load properties:', JSON.stringify({
          code: propertiesError.code,
          message: propertiesError.message,
          details: propertiesError.details,
          hint: propertiesError.hint,
        }, null, 2));
        
        const isNetworkError = 
          propertiesError.message?.includes('Network request failed') ||
          propertiesError.message?.includes('fetch failed') ||
          propertiesError.message?.includes('Failed to fetch') ||
          propertiesError.code === 'ETIMEDOUT' ||
          propertiesError.code === 'ECONNREFUSED';
        
        if (isNetworkError && retryCount < 3) {
          console.log(`Retrying properties load... Attempt ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
          return loadAdminData(retryCount + 1);
        }
        
        const errorMsg = isNetworkError 
          ? 'Cannot connect to server. Please check your internet connection and try again.'
          : propertiesError.message || 'Failed to load properties';
        
        setError(errorMsg);
        console.error('ERROR Warning: Failed to load properties:', {
          message: propertiesError.message,
          details: propertiesError.message,
          hint: propertiesError.hint || '',
          code: propertiesError.code || '',
        });
      } else if (propertiesData) {
        const mappedProperties: Property[] = propertiesData.map(prop => ({
          id: prop.id,
          title: prop.title,
          description: prop.description,
          price: prop.price,
          deposit: prop.deposit,
          location: {
            address: prop.address,
            city: prop.city,
            state: prop.state,
            pincode: prop.pincode,
            coordinates: {
              latitude: prop.latitude,
              longitude: prop.longitude,
            },
          },
          propertyType: prop.property_type,
          category: prop.category,
          bhk: prop.bhk,
          furnishingType: prop.furnishing_type,
          amenities: prop.amenities,
          rules: {
            petsAllowed: prop.pets_allowed,
            couplesAllowed: prop.couples_allowed,
            familiesAllowed: prop.families_allowed,
            bachelorsAllowed: prop.bachelors_allowed,
          },
          images: prop.images,
          ownerId: prop.owner_id,
          ownerName: prop.owner_name,
          ownerPhone: prop.owner_phone,
          availableFrom: prop.available_from,
          virtualTourUrl: prop.virtual_tour_url,
          status: prop.status,
          createdAt: prop.created_at,
          updatedAt: prop.updated_at,
        }));
        setProperties(mappedProperties);
        console.log(`Successfully loaded ${mappedProperties.length} properties`);
      }
      
      if (usersData && propertiesData) {
        setError(null);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error occurred';
      
      if (errorMessage.includes('Abort') || errorMessage.includes('aborted')) {
        console.log('Admin data request aborted, skipping error handling');
        return;
      }
      
      console.error('ERROR Failed to load admin data:', err);
      
      const isNetworkError = 
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('timeout');
      
      if (isNetworkError && retryCount < 3) {
        console.log(`Retrying admin data load... Attempt ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return loadAdminData(retryCount + 1);
      }
      
      const displayError = isNetworkError
        ? 'Cannot connect to server. Please check your internet connection and try again.'
        : errorMessage;
      
      setError(displayError);
      console.error('ERROR Warning: Failed to load admin data:', {
        message: errorMessage,
        details: errorMessage,
        hint: '',
        code: '',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const getStats = useCallback((): AdminStats => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const newUsersThisMonth = users.filter(user => {
      const createdDate = new Date(user.createdAt);
      return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
    }).length;

    const newPropertiesThisMonth = properties.filter(property => {
      const createdDate = new Date(property.createdAt);
      return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
    }).length;

    return {
      totalUsers: users.length,
      totalRenters: users.filter(u => u.userType === 'renter').length,
      totalOwners: users.filter(u => u.userType === 'owner').length,
      totalProperties: properties.length,
      activeListings: properties.filter(p => p.status === 'active').length,
      pendingListings: properties.filter(p => p.status === 'pending').length,
      totalRevenue: properties.reduce((sum, p) => sum + p.price, 0),
      newUsersThisMonth,
      newPropertiesThisMonth,
    };
  }, [users, properties]);

  const updateUserStatus = useCallback(async (userId: string, status: 'active' | 'suspended' | 'blocked') => {
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user status:', updateError);
        setError('Failed to update user status');
        return false;
      }

      await loadAdminData();
      return true;
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status');
      return false;
    }
  }, [loadAdminData]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        console.error('Failed to delete user:', deleteError);
        setError('Failed to delete user');
        return false;
      }

      await loadAdminData();
      return true;
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user');
      return false;
    }
  }, [loadAdminData]);

  const updatePropertyStatus = useCallback(async (propertyId: string, status: 'active' | 'pending' | 'rejected' | 'rented') => {
    try {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', propertyId);

      if (updateError) {
        console.error('Failed to update property status:', updateError);
        setError('Failed to update property status');
        return false;
      }

      await loadAdminData();
      return true;
    } catch (err) {
      console.error('Failed to update property status:', err);
      setError('Failed to update property status');
      return false;
    }
  }, [loadAdminData]);

  const deleteProperty = useCallback(async (propertyId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (deleteError) {
        console.error('Failed to delete property:', deleteError);
        setError('Failed to delete property');
        return false;
      }

      await loadAdminData();
      return true;
    } catch (err) {
      console.error('Failed to delete property:', err);
      setError('Failed to delete property');
      return false;
    }
  }, [loadAdminData]);

  const approveProperty = useCallback(async (propertyId: string) => {
    return await updatePropertyStatus(propertyId, 'active');
  }, [updatePropertyStatus]);

  const rejectProperty = useCallback(async (propertyId: string) => {
    return await updatePropertyStatus(propertyId, 'rejected');
  }, [updatePropertyStatus]);

  const syncData = useCallback(async () => {
    await loadAdminData();
  }, [loadAdminData]);

  const sendBroadcastMessage = useCallback(async (
    adminId: string,
    title: string,
    content: string,
    recipients: 'all' | 'finders' | 'providers'
  ) => {
    try {
      const { error: insertError } = await supabase
        .from('broadcast_messages')
        .insert({
          admin_id: adminId,
          title,
          content,
          recipients,
        });

      if (insertError) {
        console.error('Failed to send broadcast message:', insertError);
        setError('Failed to send broadcast message');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to send broadcast message:', err);
      setError('Failed to send broadcast message');
      return false;
    }
  }, []);

  const getReports = useCallback(async () => {
    try {
      const { data, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('timestamp', { ascending: false });

      if (reportsError) {
        console.error('Failed to load reports:', reportsError);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to load reports:', err);
      return [];
    }
  }, []);

  const updateReportStatus = useCallback(async (
    reportId: string,
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
    reviewedBy: string
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (updateError) {
        console.error('Failed to update report status:', updateError);
        setError('Failed to update report status');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to update report status:', err);
      setError('Failed to update report status');
      return false;
    }
  }, []);

  const logAdminAction = useCallback(async (
    adminId: string,
    action: 'block_user' | 'unblock_user' | 'block_property' | 'unblock_property' | 'approve_property' | 'reject_property' | 'broadcast_message' | 'delete_user' | 'delete_property',
    targetType: 'user' | 'property',
    targetId: string,
    reason?: string
  ) => {
    try {
      const { error: insertError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          action,
          target_type: targetType,
          target_id: targetId,
          reason,
        });

      if (insertError) {
        console.error('Failed to log admin action:', insertError);
      }
    } catch (err) {
      console.error('Failed to log admin action:', err);
    }
  }, []);

  const getAdminActions = useCallback(async () => {
    try {
      const { data, error: actionsError } = await supabase
        .from('admin_actions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (actionsError) {
        console.error('Failed to load admin actions:', actionsError);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to load admin actions:', err);
      return [];
    }
  }, []);

  return useMemo(() => ({
    users,
    properties,
    loading,
    error,
    getStats,
    updateUserStatus,
    deleteUser,
    updatePropertyStatus,
    deleteProperty,
    approveProperty,
    rejectProperty,
    syncData,
    refreshData: loadAdminData,
    sendBroadcastMessage,
    getReports,
    updateReportStatus,
    logAdminAction,
    getAdminActions,
  }), [
    users,
    properties,
    loading,
    error,
    getStats,
    updateUserStatus,
    deleteUser,
    updatePropertyStatus,
    deleteProperty,
    approveProperty,
    rejectProperty,
    syncData,
    loadAdminData,
    sendBroadcastMessage,
    getReports,
    updateReportStatus,
    logAdminAction,
    getAdminActions,
  ]);
});
