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
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { Home, Building2, Eye, EyeOff } from 'lucide-react-native';

type UserRole = 'renter' | 'owner';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, loading, error: authError } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('renter');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    
    if (!name) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    if (!phone) {
      setPhoneError('Phone number is required');
      isValid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))) {
      setPhoneError('Phone number is invalid');
      isValid = false;
    } else {
      setPhoneError('');
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
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    const success = await signup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      userType: selectedRole,
      isOwner: selectedRole === 'owner',
      isAdmin: false,
      isFinder: selectedRole === 'renter',
    });
    
    if (success) {
      Alert.alert(
        'Account Created',
        'Check your email to verify account',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/auth/login');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Signup Failed',
        authError || 'Try again',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
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
          <Text style={styles.headerTitle}>Sign Up</Text>
          <Text style={styles.headerSubtitle}>Join us to find or list properties</Text>
        </LinearGradient>
        
        <View style={styles.formContainer}>
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
                  colors={selectedRole === 'owner' ? ['#4facfe', '#00f2fe'] : [Colors.white, Colors.white]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.roleGradient}
                >
                  <Building2 
                    size={28} 
                    color={selectedRole === 'owner' ? Colors.white : '#4facfe'} 
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
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={Colors.textLight}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>
          
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
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, phoneError ? styles.inputError : null]}
              placeholder="+9779829911255"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.textLight}
            />
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, passwordError ? styles.inputError : null]}
                placeholder="Create a password (min 6 characters)"
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
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, confirmPasswordError ? styles.inputError : null]}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={Colors.textLight}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Eye size={20} color={Colors.textLight} />
                ) : (
                  <EyeOff size={20} color={Colors.textLight} />
                )}
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>
          
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.signupButtonGradient}
          >
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  signupButtonGradient: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  signupButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 15,
    color: Colors.textLight,
  },
  loginLink: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '700',
    marginLeft: 4,
  },
});
