import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { PropertyFilter } from '@/types';
import { amenities, bhkTypes, furnishingTypes } from '@/constants/amenities';
import PriceRangeSlider from './PriceRangeSlider';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filter: PropertyFilter) => void;
  initialFilter?: PropertyFilter;
}

export default function FilterModal({ 
  visible, 
  onClose, 
  onApply,
  initialFilter 
}: FilterModalProps) {
  const [filter, setFilter] = useState<PropertyFilter>({
    minPrice: 0,
    maxPrice: 100000,
    bhk: [],
    furnishingType: [],
    amenities: [],
    petsAllowed: false,
    couplesAllowed: false,
    familiesAllowed: false,
    bachelorsAllowed: false,
  });

  useEffect(() => {
    if (initialFilter) {
      setFilter(prev => ({
        ...prev,
        ...initialFilter
      }));
    }
  }, [initialFilter]);

  const handleBhkToggle = (bhk: string) => {
    setFilter(prev => {
      const newBhk = prev.bhk || [];
      if (newBhk.includes(bhk)) {
        return { ...prev, bhk: newBhk.filter(item => item !== bhk) };
      } else {
        return { ...prev, bhk: [...newBhk, bhk] };
      }
    });
  };

  const handleFurnishingToggle = (type: 'fully' | 'semi' | 'unfurnished') => {
    setFilter(prev => {
      const newFurnishing = prev.furnishingType || [];
      if (newFurnishing.includes(type)) {
        return { ...prev, furnishingType: newFurnishing.filter(item => item !== type) };
      } else {
        return { ...prev, furnishingType: [...newFurnishing, type] };
      }
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilter(prev => {
      const newAmenities = prev.amenities || [];
      if (newAmenities.includes(amenity)) {
        return { ...prev, amenities: newAmenities.filter(item => item !== amenity) };
      } else {
        return { ...prev, amenities: [...newAmenities, amenity] };
      }
    });
  };

  const handleRuleToggle = (rule: keyof Pick<PropertyFilter, 'petsAllowed' | 'couplesAllowed' | 'familiesAllowed' | 'bachelorsAllowed'>) => {
    setFilter(prev => ({
      ...prev,
      [rule]: !prev[rule]
    }));
  };

  const handlePriceChange = (min: number, max: number) => {
    setFilter(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max
    }));
  };

  const handleReset = () => {
    setFilter({
      minPrice: 0,
      maxPrice: 100000,
      bhk: [],
      furnishingType: [],
      amenities: [],
      petsAllowed: false,
      couplesAllowed: false,
      familiesAllowed: false,
      bachelorsAllowed: false,
    });
  };

  const handleApply = () => {
    onApply(filter);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Filters</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <X size={24} color={Colors.textDark} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Price Range */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Price Range</Text>
                  <PriceRangeSlider 
                    minValue={filter.minPrice || 0}
                    maxValue={filter.maxPrice || 100000}
                    onValueChange={handlePriceChange}
                  />
                  <View style={styles.priceLabels}>
                    <Text style={styles.priceLabel}>₹{filter.minPrice?.toLocaleString()}</Text>
                    <Text style={styles.priceLabel}>₹{filter.maxPrice?.toLocaleString()}</Text>
                  </View>
                </View>

                {/* BHK Type */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>BHK Type</Text>
                  <View style={styles.optionsContainer}>
                    {bhkTypes.map(type => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.optionButton,
                          filter.bhk?.includes(type.id) && styles.optionButtonSelected
                        ]}
                        onPress={() => handleBhkToggle(type.id)}
                      >
                        <Text 
                          style={[
                            styles.optionText,
                            filter.bhk?.includes(type.id) && styles.optionTextSelected
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Furnishing Type */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Furnishing</Text>
                  <View style={styles.optionsContainer}>
                    {furnishingTypes.map(type => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.optionButton,
                          filter.furnishingType?.includes(type.id as any) && styles.optionButtonSelected
                        ]}
                        onPress={() => handleFurnishingToggle(type.id as 'fully' | 'semi' | 'unfurnished')}
                      >
                        <Text 
                          style={[
                            styles.optionText,
                            filter.furnishingType?.includes(type.id as any) && styles.optionTextSelected
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Amenities</Text>
                  <View style={styles.optionsContainer}>
                    {amenities.map(amenity => (
                      <TouchableOpacity
                        key={amenity.id}
                        style={[
                          styles.optionButton,
                          filter.amenities?.includes(amenity.id) && styles.optionButtonSelected
                        ]}
                        onPress={() => handleAmenityToggle(amenity.id)}
                      >
                        <Text 
                          style={[
                            styles.optionText,
                            filter.amenities?.includes(amenity.id) && styles.optionTextSelected
                          ]}
                        >
                          {amenity.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Rules */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Rules</Text>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        filter.petsAllowed && styles.optionButtonSelected
                      ]}
                      onPress={() => handleRuleToggle('petsAllowed')}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          filter.petsAllowed && styles.optionTextSelected
                        ]}
                      >
                        Pets Allowed
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        filter.couplesAllowed && styles.optionButtonSelected
                      ]}
                      onPress={() => handleRuleToggle('couplesAllowed')}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          filter.couplesAllowed && styles.optionTextSelected
                        ]}
                      >
                        Couples Allowed
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        filter.familiesAllowed && styles.optionButtonSelected
                      ]}
                      onPress={() => handleRuleToggle('familiesAllowed')}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          filter.familiesAllowed && styles.optionTextSelected
                        ]}
                      >
                        Families Allowed
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        filter.bachelorsAllowed && styles.optionButtonSelected
                      ]}
                      onPress={() => handleRuleToggle('bachelorsAllowed')}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          filter.bachelorsAllowed && styles.optionTextSelected
                        ]}
                      >
                        Bachelors Allowed
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
  },
  content: {
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500',
  },
});