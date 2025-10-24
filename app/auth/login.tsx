import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useLocation } from '@/hooks/location-store';
import { useSession } from '@/hooks/session-store';
import Colors from '@/constants/colors';
import { MapPin, Home, Building2, Shield, Eye, EyeOff } from 'lucide-react-native';

type UserRole = 'renter' | 'owner' | 'admin';

export default function LoginScreen() {
  const router = useRouter();
  const { login, logout, resetPassword, loading, error: authError } = useAuth();
  const { getCurrentLocation, requestLocationPermission, hasLocationPermission, loading: locationLoading } = useLocation();
  const { startSession } = useSession();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('renter');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const validateForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    console.log('Login attempt:', { email, isAdminLogin: showAdminLogin });
    const result = await login(email, password);
    console.log('Login result:', { success: result.success, hasUser: !!result.user });
    
    if (result.success && result.user) {
      const user = result.user;
      console.log('User logged in:', { id: user.id, userType: user.userType, isAdmin: user.isAdmin });
      await startSession(user.id, user.userType);
      
      if (user.isAdmin) {
        console.log('Admin login successful, redirecting to admin dashboard');
        console.log('✅ Admin login successful');
        router.replace('/(tabs)/admin');
        return;
      }
      
      if (showAdminLogin && !user.isAdmin) {
        console.log('Admin login attempted but user is not admin');
        Alert.alert(
          'Access Denied',
          'Not an admin account',
          [{ text: 'OK' }]
        );
        await logout();
        return;
      }
      
      const redirectToHome = () => {
        if (user.userType === 'owner') {
          router.replace('/(tabs)');
        } else if (user.userType === 'renter') {
          router.replace('/(tabs)');
        } else {
          router.replace('/(tabs)');
        }
      };

      if (!hasLocationPermission && user.userType === 'renter') {
        Alert.alert(
          'Location Access',
          'Find properties near you',
          [
            {
              text: 'Skip',
              style: 'cancel',
              onPress: redirectToHome,
            },
            {
              text: 'Allow',
              onPress: async () => {
                const granted = await requestLocationPermission();
                if (granted) {
                  await getCurrentLocation();
                }
                redirectToHome();
              },
            },
          ]
        );
      } else {
        redirectToHome();
      }
    } else {
      const errorMessage = authError || 'Login failed';
      console.log('Login failed:', errorMessage);
      
      if (showAdminLogin) {
        Alert.alert(
          'Login Failed',
          'Invalid credentials',
          [{ text: 'OK' }]
        );
        return;
      }
      
      if (errorMessage.includes('verify your email')) {
        Alert.alert(
          'Email Not Verified',
          'Check your email for verification link',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('Failed to load user data')) {
        Alert.alert(
          'Setup Incomplete',
          'Try signing up again',
          [
            { text: 'Signup', onPress: () => router.push('/auth/signup') },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          'Login Failed',
          errorMessage.includes('Invalid') ? 'Invalid email or password' : errorMessage,
          [
            { text: 'Signup', onPress: () => router.push('/auth/signup') },
            { text: 'Retry', style: 'cancel' }
          ]
        );
      }
    }
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleAdminAccess = () => {
    setShowAdminLogin(!showAdminLogin);
    if (!showAdminLogin) {
      setSelectedRole('admin');
      setEmail('');
      setPassword('');
    } else {
      setSelectedRole('renter');
      setEmail('');
      setPassword('');
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Enter your email');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      Alert.alert('Error', 'Invalid email');
      return;
    }
    
    const success = await resetPassword(resetEmail);
    
    if (success) {
      Alert.alert(
        'Email Sent',
        'Check your inbox for reset link',
        [{ text: 'OK', onPress: () => setShowForgotPassword(false) }]
      );
      setResetEmail('');
    } else {
      Alert.alert('Error', authError || 'Failed to send email');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#2563EB', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>
            {showAdminLogin ? 'Admin Login' : 'Login to your account'}
          </Text>
        </LinearGradient>
        
        <View style={styles.formContainer}>
          {!showAdminLogin && (
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I am a:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'renter' && styles.roleButtonActive
                  ]}
                  onPress={() => setSelectedRole('renter')}
                >
                  <LinearGradient
                    colors={selectedRole === 'renter' ? ['#2563EB', '#7C3AED'] : [Colors.white, Colors.white]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleGradient}
                  >
                    <Home 
                      size={28} 
                      color={selectedRole === 'renter' ? Colors.white : '#2563EB'} 
                    />
                    <Text style={[
                      styles.roleButtonText,
                      selectedRole === 'renter' && styles.roleButtonTextActive
                    ]}>
                      Property Finder
                    </Text>
                    <Text style={[
                      styles.roleButtonSubtext,
                      selectedRole === 'renter' && styles.roleButtonSubtextActive
                    ]}>
                      Looking for a property
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'owner' && styles.roleButtonActive
                  ]}
                  onPress={() => setSelectedRole('owner')}
                >
                  <LinearGradient
                    colors={selectedRole === 'owner' ? ['#10B981', '#059669'] : [Colors.white, Colors.white]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleGradient}
                  >
                    <Building2 
                      size={28} 
                      color={selectedRole === 'owner' ? Colors.white : '#10B981'} 
                    />
                    <Text style={[
                      styles.roleButtonText,
                      selectedRole === 'owner' && styles.roleButtonTextActive
                    ]}>
                      Property Provider
                    </Text>
                    <Text style={[
                      styles.roleButtonSubtext,
                      selectedRole === 'owner' && styles.roleButtonSubtextActive
                    ]}>
                      Have properties to rent
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {showAdminLogin && (
            <View style={styles.adminBadge}>
              <Shield size={20} color={Colors.white} />
              <Text style={styles.adminBadgeText}>Admin Access</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="mail.roomrent@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, passwordError ? styles.inputError : null]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.textLight}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye size={20} color={Colors.textLight} />
                ) : (
                  <EyeOff size={20} color={Colors.textLight} />
                )}
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>
          
          {!showAdminLogin && (
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={() => setShowForgotPassword(true)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
          
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loginButtonGradient}
          >
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading || locationLoading}
            >
              <Text style={styles.loginButtonText}>
                {loading || locationLoading ? 'Logging in...' : showAdminLogin ? 'Admin Login' : 'Login'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
          
          {!showAdminLogin && (
            <>
              <View style={styles.locationInfo}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.locationText}>
                  Property rentals across entire Nepal
                </Text>
              </View>
              
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don&apos;t have an account?</Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          
          <TouchableOpacity 
            style={styles.adminAccessButton}
            onPress={handleAdminAccess}
          >
            <Shield size={16} color={Colors.textLight} />
            <Text style={styles.adminAccessText}>
              {showAdminLogin ? 'Back to User Login' : 'Admin Access'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.poweredBy}>Powered by Sofixs</Text>
        </View>
      </ScrollView>
      
      <ForgotPasswordModal
        visible={showForgotPassword}
        email={resetEmail}
        setEmail={setResetEmail}
        onSubmit={handleForgotPassword}
        onCancel={() => setShowForgotPassword(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: -20,
  },
  roleContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roleButtonActive: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  roleGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 8,
    textAlign: 'center',
  },
  roleButtonTextActive: {
    color: Colors.white,
  },
  roleButtonSubtext: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  roleButtonSubtextActive: {
    color: Colors.white,
    opacity: 0.9,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  adminBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textDark,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 48,
    fontSize: 15,
    color: Colors.textDark,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginTop: 4,
  },
  loginButtonGradient: {
    borderRadius: 12,
    marginBottom: 16,
  },
  loginButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signupText: {
    fontSize: 15,
    color: Colors.textLight,
  },
  signupLink: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '700',
    marginLeft: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 8,
    flex: 1,
  },
  adminAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 16,
  },
  adminAccessText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  poweredBy: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
});

function ForgotPasswordModal({ visible, email, setEmail, onSubmit, onCancel }: {
  visible: boolean;
  email: string;
  setEmail: (email: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  if (!visible) return null;
  
  return (
    <View style={forgotModalStyles.overlay}>
      <View style={forgotModalStyles.modal}>
        <Text style={forgotModalStyles.title}>Reset Password</Text>
        <Text style={forgotModalStyles.subtitle}>Enter your email to receive reset link</Text>
        
        <TextInput
          style={forgotModalStyles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <View style={forgotModalStyles.buttons}>
          <TouchableOpacity
            style={[forgotModalStyles.button, forgotModalStyles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={forgotModalStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[forgotModalStyles.button, forgotModalStyles.submitButton]}
            onPress={onSubmit}
          >
            <Text style={forgotModalStyles.submitButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const forgotModalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 1000,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButton: {
    backgroundColor: '#2563EB',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});
