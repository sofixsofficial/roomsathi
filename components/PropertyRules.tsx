import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Property } from '@/types';

interface PropertyRulesProps {
  rules: Property['rules'];
}

export default function PropertyRules({ rules }: PropertyRulesProps) {
  const ruleItems = [
    { key: 'petsAllowed', label: 'Pets Allowed', value: rules.petsAllowed },
    { key: 'couplesAllowed', label: 'Couples Allowed', value: rules.couplesAllowed },
    { key: 'familiesAllowed', label: 'Families Allowed', value: rules.familiesAllowed },
    { key: 'bachelorsAllowed', label: 'Bachelors Allowed', value: rules.bachelorsAllowed },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>House Rules</Text>
      <View style={styles.rulesContainer}>
        {ruleItems.map(item => (
          <View key={item.key} style={styles.ruleItem}>
            {item.value ? (
              <Check size={20} color={Colors.success} />
            ) : (
              <X size={20} color={Colors.error} />
            )}
            <Text style={styles.ruleLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 16,
  },
  rulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ruleItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ruleLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textDark,
  },
});