import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { ChevronDown, ChevronUp, MessageCircle, Mail, Phone, Send } from 'lucide-react-native';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    category: 'Getting Started',
    question: 'How do I search for rooms?',
    answer: 'Use the search bar on the home screen to search by location, city, or property name. You can also enable location services to find rooms near you. Apply filters to narrow down your search based on price, property type, amenities, and more.',
  },
  {
    id: '2',
    category: 'Getting Started',
    question: 'How do I save my favorite properties?',
    answer: 'Tap the heart icon on any property card to add it to your favorites. You can view all your saved properties in the Favorites tab at the bottom of the screen.',
  },
  {
    id: '3',
    category: 'Booking & Payments',
    question: 'How do I contact property owners?',
    answer: 'On the property details page, tap the "Contact Owner" button to send a message directly to the property owner. You can also call them using the phone number provided.',
  },
  {
    id: '4',
    category: 'Booking & Payments',
    question: 'What payment methods are accepted?',
    answer: 'Payment methods vary by property owner. Most accept bank transfers, UPI, and cash. Discuss payment terms directly with the property owner through our messaging system.',
  },
  {
    id: '5',
    category: 'Booking & Payments',
    question: 'Is there a booking fee?',
    answer: 'Our platform is free to use for finding and contacting property owners. Any fees or deposits are arranged directly between you and the property owner.',
  },
  {
    id: '6',
    category: 'Account & Profile',
    question: 'How do I switch between renter and owner accounts?',
    answer: 'Go to your Profile tab, tap "Switch User Type", and select whether you want to search for properties or list your own properties. You can switch anytime.',
  },
  {
    id: '7',
    category: 'Account & Profile',
    question: 'How do I update my profile information?',
    answer: 'Go to Profile > Account Settings to update your name, phone number, profile picture, and password. Your email cannot be changed for security reasons.',
  },
  {
    id: '8',
    category: 'Property Listings',
    question: 'How do I list my property?',
    answer: 'Switch your account type to "Property Owner" in your profile settings. Then you can add properties with photos, descriptions, pricing, and amenities.',
  },
  {
    id: '9',
    category: 'Property Listings',
    question: 'How long does it take for my listing to be approved?',
    answer: 'Property listings are typically reviewed and approved within 24-48 hours. You will receive a notification once your listing is live.',
  },
  {
    id: '10',
    category: 'Safety & Security',
    question: 'How do I report a suspicious listing?',
    answer: 'If you encounter a suspicious listing or user, tap the report button on the property page or contact our support team immediately. We take all reports seriously.',
  },
  {
    id: '11',
    category: 'Safety & Security',
    question: 'Is my personal information safe?',
    answer: 'Yes, we use industry-standard encryption to protect your data. Your contact information is only shared with property owners when you initiate contact.',
  },
  {
    id: '12',
    category: 'Technical Support',
    question: 'The app is not loading properties. What should I do?',
    answer: 'Try refreshing the page by pulling down on the screen. Check your internet connection. If the problem persists, log out and log back in, or contact support.',
  },
];

export default function HelpCenterScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!contactEmail || !contactMessage) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert(
      'Message Sent',
      'Thank you for contacting us! Our support team will get back to you within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setContactEmail('');
            setContactMessage('');
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Help Center', headerShown: true }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>How can we help you?</Text>
          <Text style={styles.headerSubtitle}>
            Find answers to common questions or contact our support team
          </Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textLight}
            />
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {filteredFaqs.map(faq => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                {expandedId === faq.id ? (
                  <ChevronUp size={20} color={Colors.primary} />
                ) : (
                  <ChevronDown size={20} color={Colors.textLight} />
                )}
              </View>
              {expandedId === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Still need help?</Text>
          <Text style={styles.contactSubtitle}>
            Contact our support team and we'll get back to you as soon as possible
          </Text>

          <View style={styles.contactMethods}>
            <TouchableOpacity style={styles.contactMethod}>
              <View style={styles.contactMethodIcon}>
                <MessageCircle size={24} color={Colors.primary} />
              </View>
              <Text style={styles.contactMethodTitle}>Live Chat</Text>
              <Text style={styles.contactMethodSubtitle}>Available 9 AM - 6 PM</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactMethod}>
              <View style={styles.contactMethodIcon}>
                <Mail size={24} color={Colors.primary} />
              </View>
              <Text style={styles.contactMethodTitle}>Email Support</Text>
              <Text style={styles.contactMethodSubtitle}>mail.roomrent@gmail.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactMethod}>
              <View style={styles.contactMethodIcon}>
                <Phone size={24} color={Colors.primary} />
              </View>
              <Text style={styles.contactMethodTitle}>Phone Support</Text>
              <Text style={styles.contactMethodSubtitle}>+977 9829911255</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactForm}>
            <Text style={styles.formTitle}>Send us a message</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Your email"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
            />
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="Describe your issue..."
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.textLight}
            />
            <Button
              title="Send Message"
              onPress={handleSendMessage}
              icon={<Send size={20} color={Colors.white} />}
              style={styles.sendButton}
            />
          </View>
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  searchContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textDark,
  },
  categoriesSection: {
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginLeft: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  faqSection: {
    backgroundColor: Colors.white,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 16,
  },
  faqItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 15,
    color: Colors.textLight,
    marginTop: 12,
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: Colors.white,
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  contactSubtitle: {
    fontSize: 15,
    color: Colors.textLight,
    marginBottom: 20,
  },
  contactMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  contactMethod: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactMethodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  contactMethodSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  contactForm: {
    marginTop: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 16,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textDark,
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  formTextArea: {
    height: 120,
    paddingTop: 12,
  },
  sendButton: {
    marginTop: 8,
  },
});
