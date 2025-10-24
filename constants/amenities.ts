export const amenities = [
  { id: 'wifi', label: 'WiFi', icon: 'wifi' },
  { id: 'ac', label: 'Air Conditioner', icon: 'wind' },
  { id: 'fridge', label: 'Refrigerator', icon: 'thermometer' },
  { id: 'tv', label: 'TV', icon: 'tv' },
  { id: 'washing_machine', label: 'Washing Machine', icon: 'droplet' },
  { id: 'kitchen', label: 'Kitchen', icon: 'coffee' },
  { id: 'balcony', label: 'Balcony', icon: 'home' },
  { id: 'parking', label: 'Parking', icon: 'car' },
  { id: 'gym', label: 'Gym', icon: 'activity' },
  { id: 'lift', label: 'Lift', icon: 'arrow-up-down' },
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'power_backup', label: 'Power Backup', icon: 'battery-charging' },
  { id: 'water_supply', label: 'Water Supply', icon: 'droplet' },
  { id: 'gas_pipeline', label: 'Gas Pipeline', icon: 'flame' },
];

export const propertyTypes = [
  { id: 'apartment', label: 'Apartment' },
  { id: 'house', label: 'House' },
  { id: 'room', label: 'Room' },
  { id: 'pg', label: 'PG/Hostel' },
];

export const bhkTypes = [
  { id: 'single-room', label: 'Single Room' },
  { id: 'double-room', label: 'Double Room' },
  { id: 'family-room', label: 'Family Room' },
  { id: '1RK', label: '1 RK' },
  { id: '1BHK', label: '1 BHK' },
  { id: '2BHK', label: '2 BHK' },
  { id: '3BHK', label: '3 BHK' },
  { id: '4BHK', label: '4 BHK' },
  { id: '4+BHK', label: '4+ BHK' },
];

export const propertyCategories = [
  {
    id: 'room-rent',
    label: 'Room Rent',
    category: 'rent' as const,
    description: 'Single room for rent',
    icon: '🛏️'
  },
  {
    id: 'flat-rent',
    label: 'Flat Rent',
    category: 'rent' as const,
    description: 'Apartment/Flat for rent',
    icon: '🏢'
  },
  {
    id: 'shutter-rent',
    label: 'Shutter Rent',
    category: 'rent' as const,
    description: 'Commercial shutter/shop for rent',
    icon: '🏪'
  },
  {
    id: 'house-rent',
    label: 'House Rent',
    category: 'rent' as const,
    description: 'Independent house for rent',
    icon: '🏡'
  },
  {
    id: 'land-rent',
    label: 'Land Rent',
    category: 'rent' as const,
    description: 'Land/Plot for rent',
    icon: '🌾'
  },
  {
    id: 'office-rent',
    label: 'Office Rent',
    category: 'rent' as const,
    description: 'Office space for rent',
    icon: '🏢'
  },
  {
    id: 'house-buy',
    label: 'House Buy',
    category: 'buy' as const,
    description: 'House for sale',
    icon: '🏘️'
  },
  {
    id: 'land-buy',
    label: 'Land Buy',
    category: 'buy' as const,
    description: 'Land/Plot for sale',
    icon: '🗺️'
  },
  {
    id: 'hostel-available',
    label: 'Hostel Available',
    category: 'hostel' as const,
    description: 'Co-ed hostel accommodation',
    icon: '🏨'
  },
  {
    id: 'girls-hostel',
    label: 'Girls Hostel',
    category: 'hostel' as const,
    description: 'Girls only hostel accommodation',
    icon: '👧'
  },
  {
    id: 'boys-hostel',
    label: 'Boys Hostel',
    category: 'hostel' as const,
    description: 'Boys only hostel accommodation',
    icon: '👦'
  },
];

export const getPropertyCategoriesByType = (category: 'rent' | 'buy' | 'hostel') => {
  return propertyCategories.filter(prop => prop.category === category);
};

export const furnishingTypes = [
  { id: 'fully', label: 'Fully Furnished' },
  { id: 'semi', label: 'Semi Furnished' },
  { id: 'unfurnished', label: 'Unfurnished' },
];