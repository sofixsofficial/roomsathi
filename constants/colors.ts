const finderTheme = {
  primary: '#2563EB',
  primaryLight: '#60A5FA',
  primaryAccent: '#DBEAFE',
  primaryDark: '#1E40AF',
  background: '#EFF6FF',
};

const providerTheme = {
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryAccent: '#D1FAE5',
  primaryDark: '#047857',
  background: '#ECFDF5',
};

const adminTheme = {
  primary: '#7C3AED',
  primaryLight: '#C084FC',
  primaryAccent: '#F3E8FF',
  primaryDark: '#6D28D9',
  background: '#FAF5FF',
};

const commonColors = {
  secondary: '#FF6B6B',
  secondaryLight: '#FFE8E8',
  accent: '#FFD166',
  success: '#06D6A0',
  error: '#EF476F',
  warning: '#FFD166',
  info: '#118AB2',
  background: '#FFFFFF',
  card: '#F8F9FA',
  text: '#212529',
  textLight: '#6C757D',
  textDark: '#343A40',
  border: '#DEE2E6',
  disabled: '#ADB5BD',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const getThemeColors = (userType?: 'renter' | 'owner' | 'admin') => {
  let themeColors = finderTheme;
  
  if (userType === 'owner') {
    themeColors = providerTheme;
  } else if (userType === 'admin') {
    themeColors = adminTheme;
  }
  
  return {
    ...commonColors,
    ...themeColors,
  };
};

export default {
  ...commonColors,
  primary: finderTheme.primary,
  primaryLight: finderTheme.primaryLight,
  primaryDark: finderTheme.primaryDark,
  
  finder: finderTheme,
  provider: providerTheme,
  admin: adminTheme,
};