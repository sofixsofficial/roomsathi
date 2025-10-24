import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export interface Session {
  id: string;
  userId: string;
  userType: 'renter' | 'owner' | 'admin';
  loginTime: string;
  lastActivityTime: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface SessionHistory {
  id: string;
  userId: string;
  userType: 'renter' | 'owner' | 'admin';
  action: 'login' | 'logout' | 'property_view' | 'property_contact' | 'property_list' | 'property_edit' | 'property_delete';
  timestamp: string;
  propertyId?: string;
  details?: string;
}

const SESSION_KEY = '@session_data';
const SESSION_HISTORY_KEY = '@session_history';

export const [SessionContext, useSession] = createContextHook(() => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
    loadSessionHistory();
  }, []);

  const loadSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionData) {
        setCurrentSession(JSON.parse(sessionData));
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem(SESSION_HISTORY_KEY);
      if (historyData) {
        setSessionHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.error('Failed to load session history:', error);
    }
  };

  const logActivity = useCallback(async (
    userId: string,
    userType: 'renter' | 'owner' | 'admin',
    action: SessionHistory['action'],
    propertyId?: string,
    details?: string
  ) => {
    try {
      const activity: SessionHistory = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId,
        userType,
        action,
        timestamp: new Date().toISOString(),
        propertyId,
        details,
      };

      setSessionHistory(prevHistory => {
        const updatedHistory = [activity, ...prevHistory].slice(0, 100);
        AsyncStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updatedHistory)).catch(err => 
          console.error('Failed to save session history:', err)
        );
        return updatedHistory;
      });

      try {
        await supabase.from('session_history').insert({
          user_id: userId,
          user_type: userType,
          action,
          timestamp: activity.timestamp,
          property_id: propertyId,
          details,
        });
      } catch (dbError) {
        console.error('Failed to save activity to database:', dbError);
      }

      console.log(`Activity logged: ${action} by ${userType} user:`, userId);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, []);

  const startSession = useCallback(async (userId: string, userType: 'renter' | 'owner' | 'admin') => {
    try {
      const session: Session = {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId,
        userType,
        loginTime: new Date().toISOString(),
        lastActivityTime: new Date().toISOString(),
      };

      setCurrentSession(session);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

      await logActivity(userId, userType, 'login');

      try {
        await supabase.from('user_sessions').insert({
          user_id: userId,
          user_type: userType,
          login_time: session.loginTime,
          last_activity_time: session.lastActivityTime,
          session_id: session.id,
        });
      } catch (dbError) {
        console.error('Failed to save session to database:', dbError);
      }

      console.log(`Session started for ${userType} user:`, userId);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, [logActivity]);

  const endSession = useCallback(async () => {
    try {
      if (currentSession) {
        await logActivity(currentSession.userId, currentSession.userType, 'logout');

        try {
          await supabase
            .from('user_sessions')
            .update({
              logout_time: new Date().toISOString(),
            })
            .eq('session_id', currentSession.id);
        } catch (dbError) {
          console.error('Failed to update session in database:', dbError);
        }
      }

      setCurrentSession(null);
      await AsyncStorage.removeItem(SESSION_KEY);

      console.log('Session ended');
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [currentSession, logActivity]);

  const updateActivity = useCallback(async () => {
    try {
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          lastActivityTime: new Date().toISOString(),
        };
        setCurrentSession(updatedSession);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));

        try {
          await supabase
            .from('user_sessions')
            .update({
              last_activity_time: updatedSession.lastActivityTime,
            })
            .eq('session_id', currentSession.id);
        } catch (dbError) {
          console.error('Failed to update activity in database:', dbError);
        }
      }
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }, [currentSession]);

  const clearSessionHistory = useCallback(async () => {
    try {
      setSessionHistory([]);
      await AsyncStorage.removeItem(SESSION_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear session history:', error);
    }
  }, []);

  const getSessionDuration = useCallback(() => {
    if (!currentSession) return 0;
    const loginTime = new Date(currentSession.loginTime).getTime();
    const now = new Date().getTime();
    return Math.floor((now - loginTime) / 1000);
  }, [currentSession]);

  const getSessionHistory = useCallback((userId?: string, limit?: number) => {
    let filtered = sessionHistory;
    if (userId) {
      filtered = filtered.filter(h => h.userId === userId);
    }
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    return filtered;
  }, [sessionHistory]);

  return useMemo(() => ({
    currentSession,
    sessionHistory,
    loading,
    startSession,
    endSession,
    updateActivity,
    logActivity,
    clearSessionHistory,
    getSessionDuration,
    getSessionHistory,
  }), [
    currentSession,
    sessionHistory,
    loading,
    startSession,
    endSession,
    updateActivity,
    logActivity,
    clearSessionHistory,
    getSessionDuration,
    getSessionHistory,
  ]);
});
