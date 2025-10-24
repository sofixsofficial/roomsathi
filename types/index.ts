export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  userType: 'renter' | 'owner' | 'admin';
  isOwner: boolean;
  isAdmin: boolean;
  isFinder: boolean;
  createdAt: string;
  status?: 'active' | 'suspended' | 'blocked';
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  deposit: number;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  propertyType: 'room-rent' | 'flat-rent' | 'shutter-rent' | 'house-rent' | 'land-rent' | 'office-rent' | 'house-buy' | 'land-buy' | 'hostel-available' | 'girls-hostel' | 'boys-hostel';
  category: 'rent' | 'buy' | 'hostel';
  bhk: string;
  furnishingType: 'fully' | 'semi' | 'unfurnished';
  amenities: string[];
  rules: {
    petsAllowed: boolean;
    couplesAllowed: boolean;
    familiesAllowed: boolean;
    bachelorsAllowed: boolean;
  };
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  availableFrom: string;
  virtualTourUrl?: string;
  status?: 'active' | 'pending' | 'rejected' | 'booked';
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilter {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: ('room-rent' | 'flat-rent' | 'shutter-rent' | 'house-rent' | 'land-rent' | 'office-rent' | 'house-buy' | 'land-buy' | 'hostel-available' | 'girls-hostel' | 'boys-hostel')[];
  category?: ('rent' | 'buy' | 'hostel')[];
  bhk?: string[];
  furnishingType?: ('fully' | 'semi' | 'unfurnished')[];
  amenities?: string[];
  petsAllowed?: boolean;
  couplesAllowed?: boolean;
  familiesAllowed?: boolean;
  bachelorsAllowed?: boolean;
  status?: ('active' | 'pending' | 'rejected' | 'booked')[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  propertyId?: string;
  propertyTitle?: string;
}

export interface PropertyHistory {
  id: string;
  propertyId: string;
  providerId: string;
  property: Property;
  action: 'created' | 'edited' | 'deleted' | 'reposted' | 'status_changed';
  previousStatus?: 'active' | 'pending' | 'rejected' | 'booked';
  newStatus?: 'active' | 'pending' | 'rejected' | 'booked';
  viewCount: number;
  interestedFinders: string[];
  timestamp: string;
  createdAt: string;
}

export interface FinderHistory {
  id: string;
  finderId: string;
  propertyId: string;
  property: Property;
  action: 'viewed' | 'contacted' | 'favorited' | 'unfavorited';
  timestamp: string;
  createdAt: string;
  isFavorite: boolean;
  contactDetails?: {
    providerName: string;
    providerPhone: string;
    providerEmail?: string;
  };
}

export interface Screenshot {
  id: string;
  userId: string;
  propertyId: string;
  imageUri: string;
  watermark: string;
  timestamp: string;
  createdAt: string;
}

export interface LocationSearch {
  latitude: number;
  longitude: number;
  radius: number;
  address?: string;
  city?: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  action: 'block_user' | 'unblock_user' | 'block_property' | 'unblock_property' | 'approve_property' | 'reject_property' | 'broadcast_message' | 'delete_user' | 'delete_property';
  targetType: 'user' | 'property';
  targetId: string;
  reason?: string;
  timestamp: string;
  createdAt: string;
}

export interface BroadcastMessage {
  id: string;
  adminId: string;
  title: string;
  content: string;
  recipients: 'all' | 'finders' | 'providers';
  timestamp: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedType: 'user' | 'property' | 'message';
  reportedId: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  timestamp: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Analytics {
  totalListings: number;
  activeUsers: number;
  blockedUsers: number;
  totalViews: number;
  totalContacts: number;
  popularLocations: { city: string; count: number }[];
  averageSearchRadius: number;
  mostViewedProperties: Property[];
}