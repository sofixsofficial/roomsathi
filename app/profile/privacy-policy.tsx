import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from 'lucide-react-native';

interface Section {
  icon: React.ReactNode;
  title: string;
  content: string;
}

export default function PrivacyPolicyScreen() {
  const sections: Section[] = [
    {
      icon: <Shield size={24} color={Colors.primary} />,
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, including your name, email address, phone number, and profile information. We also collect information about your use of our services, including properties you view, save, and contact.',
    },
    {
      icon: <Database size={24} color={Colors.primary} />,
      title: 'How We Use Your Information',
      content: 'We use the information we collect to provide, maintain, and improve our services, to communicate with you, to monitor and analyze trends and usage, and to personalize your experience. We may also use your information to send you technical notices and support messages.',
    },
    {
      icon: <UserCheck size={24} color={Colors.primary} />,
      title: 'Information Sharing',
      content: 'We share your contact information with property owners only when you initiate contact with them. We do not sell your personal information to third parties. We may share aggregated or de-identified information that cannot reasonably be used to identify you.',
    },
    {
      icon: <Lock size={24} color={Colors.primary} />,
      title: 'Data Security',
      content: 'We use industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. However, no internet transmission is ever fully secure, and we cannot guarantee absolute security.',
    },
    {
      icon: <Eye size={24} color={Colors.primary} />,
      title: 'Your Privacy Rights',
      content: 'You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting our support team. You also have the right to opt out of marketing communications.',
    },
    {
      icon: <AlertCircle size={24} color={Colors.primary} />,
      title: 'Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our services.',
    },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Privacy Policy', headerShown: true }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={48} color={Colors.primary} />
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSubtitle}>Last updated: January 2025</Text>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.introText}>
            At Room Finder, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
          </Text>
          <Text style={styles.introText}>
            By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>{section.icon}</View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Database size={24} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Data Retention</Text>
          </View>
          <Text style={styles.sectionContent}>
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Children's Privacy</Text>
          </View>
          <Text style={styles.sectionContent}>
            Our services are not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <AlertCircle size={24} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          </View>
          <Text style={styles.sectionContent}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.contactText}>
            If you have any questions about this Privacy Policy, please contact us:
          </Text>
          <View style={styles.contactDetails}>
            <Text style={styles.contactDetail}>📧 Email: mail.roomrent@gmail.com</Text>
            <Text style={styles.contactDetail}>📞 Phone: +977 9829911255</Text>
            <Text style={styles.contactDetail}>📍 Serving Entire Nepal</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing to use Room Finder, you acknowledge that you have read and understood this Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  introSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  introText: {
    fontSize: 15,
    color: Colors.textLight,
    lineHeight: 24,
    marginBottom: 16,
  },
  section: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    flex: 1,
  },
  sectionContent: {
    fontSize: 15,
    color: Colors.textLight,
    lineHeight: 24,
    marginLeft: 52,
  },
  contactSection: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.primary + '30',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: 16,
  },
  contactDetails: {
    gap: 8,
  },
  contactDetail: {
    fontSize: 15,
    color: Colors.textDark,
    lineHeight: 24,
  },
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
    marginBottom: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
