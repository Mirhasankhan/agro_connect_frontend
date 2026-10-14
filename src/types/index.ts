export type UserRole = "BUYER" | "PRODUCER" | "DRIVER" | "ADMIN";

export type ActivityStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type SellingUnit =
  | "KG"
  | "GRAM"
  | "PIECE"
  | "DOZEN"
  | "LITER"
  | "BAG"
  | "BUNDLE";

export type OrderStatus =
  | "Pending"
  | "Active"
  | "PartiallyCancelled"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "PartiallyRefunded"
  | "Refunded";

export type ItemStatus =
  | "Pending"
  | "SentToHub"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export type DeliveryStatus = "Assigned" | "PickedUp" | "Delivered";

export type ProducerType = "Private" | "Company";

export type DriverVehicleType =
  | "BIKE"
  | "MOTORCYCLE"
  | "THREE_WHEELER"
  | "VAN"
  | "TRUCK"
  | "PICKUP";

export type VerificationStatus = "Pending" | "Accepted" | "Rejected";

export interface TProducerProfile {
  id?: string;
  userId?: string;
  farmName?: string;
  farmSize?: number;
  producerType?: ProducerType;
  farmLocation?: string;
  nidUrl?: string;
  companyName?: string | null;
  rccmNo?: string | null;
  sirenNo?: string | null;
  landCertificate?: string | null;
  farmPhotoUrl?: string | null;
  companyCertificate?: string | null;
  rcmUrl?: string | null;
  taxUrl?: string | null;
  verificationStatus?: VerificationStatus;
  rejectionReason?: string | null;
  stripeAccountId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TDriverProfile {
  id?: string;
  userId?: string;
  vehicleType?: DriverVehicleType;
  registrationNumber?: string;
  licensePlate?: string;
  nidUrl?: string;
  drivingLicenseUrl?: string;
  vehicleRegistrationUrl?: string;
  insuranceUrl?: string;
  policeClearanceUrl?: string;
  verificationStatus?: VerificationStatus;
  rejectionReason?: string | null;
  isAvailable?: boolean;
  stripeAccountId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status?: ActivityStatus;
  isSetupCompleted?: boolean;
  phoneNumber?: string | null;
  profileImage?: string | null;
  city?: string | null;
  region?: string | null;
  address?: string | null;
  createdAt?: string;
  producerProfile?: TProducerProfile | null;
  driverProfile?: TDriverProfile | null;
}

export interface TPricingTier {
  id?: string;
  productId?: string;
  quantity: number;
  pricePerUnit: number;
}

export interface TCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface TReview {
  id?: string;
  rating: number;
  comment: string;
  createdAt?: string;
  buyer?: {
    fullName: string;
    profileImage?: string | null;
  };
}

export interface TProduct {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  sellingUnit: SellingUnit;
  pricePerUnit: number;
  availableQuantity: number;
  sold?: number;
  imageUrls: string[];
  isFeatured?: boolean;
  isCertified?: boolean;
  isActive?: boolean;
  avgRating?: number;
  totalReviews?: number;
  createdAt?: string;
  category?: {
    id?: string;
    name: string;
    slug?: string;
  };
  pricingTiers?: TPricingTier[];
  _count?: {
    pricingTiers?: number;
    orderItems?: number;
  };
  producer?: {
    id?: string;
    fullName?: string;
    profileImage?: string | null;
    address?: string | null;
    producerProfile?: {
      farmName?: string;
      companyName?: string | null;
      city?: string | null;
      farmSize?: number;
      producerType?: ProducerType;
    };
  };
  wishlists?: { id: string }[] | boolean;
  reviews?: TReview[];
  orderItems?: {
    quantity: number;
    subtotal: number;
    status: ItemStatus;
    createdAt: string;
    order?: {
      customer?: {
        fullName: string;
        profileImage?: string | null;
        shippingAddresses?: {
          addressLine: string;
          city: string;
          instruction?: string | null;
          postCode: string;
        }[];
      };
    };
  }[];
}

export interface TCartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    pricePerUnit: number;
    imageUrls: string[];
    availableQuantity?: number;
    sellingUnit?: SellingUnit;
    pricingTiers?: TPricingTier[];
  };
}

export interface TWishlistItem {
  id: string;
  productId?: string;
  createdAt?: string;
  product: {
    id: string;
    name: string;
    description?: string;
    pricePerUnit: number;
    imageUrls: string[];
    availableQuantity?: number;
    sellingUnit?: SellingUnit;
    category?: {
      id: string;
      name: string;
    };
    producer?: {
      fullName: string;
      producerProfile?: {
        farmName?: string;
        companyName?: string;
      };
    };
  };
}

export interface TShippingAddress {
  id: string;
  addressLine: string;
  city: string;
  postCode: string;
  instruction: string;
  createdAt?: string;
}

export interface TOrderItem {
  id: string;
  orderId?: string;
  productId: string;
  productName: string;
  sellingUnit: SellingUnit;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  status: ItemStatus;
  createdAt?: string;
  isReviewed?: boolean;
  cancelReason?: string | null;
  order?: {
    id?: string;
    orderId?: string;
    customer?: {
      fullName?: string;
      profileImage?: string | null;
      city?: string | null;
      address?: string | null;
    };
  };
  product?: {
    id?: string;
    imageUrls: string[];
    producer?: {
      id?: string;
      fullName?: string;
      profileImage?: string | null;
      address?: string | null;
      city?: string | null;
      producerProfile?: {
        farmName?: string;
        farmSize?: number;
        producerType?: ProducerType;
      };
    };
  };
}

export interface TProducerOrderItemDetails {
  id: string;
  productName: string;
  createdAt: string;
  sellingUnit: SellingUnit;
  quantity: number;
  subtotal: number;
  unitPrice: number;
  isReviewed: boolean;
  status: ItemStatus;
  product?: {
    imageUrls: string[];
  } | null;
  review?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
  order: {
    orderId: string;
    customer: {
      fullName: string;
      profileImage?: string | null;
      city?: string | null;
      address?: string | null;
    };
    deliveries?: Array<{
      status: DeliveryStatus;
      createdAt: string;
      updatedAt: string;
      driver?: {
        fullName: string;
        address?: string | null;
        profileImage?: string | null;
        driverProfile?: {
          id: string;
          vehicleType: string;
          registrationNumber?: string | null;
        } | null;
      } | null;
    }>;
  };
}

export interface TOrderDelivery {
  id: string;
  orderId?: string;
  driverId?: string;
  status: DeliveryStatus;
  createdAt?: string;
  updatedAt?: string;
  driver?: {
    id: string;
    fullName: string;
    phoneNumber?: string | null;
    profileImage?: string | null;
    driverProfile?: {
      vehicleType?: DriverVehicleType;
      registrationNumber?: string;
      licensePlate?: string;
    } | null;
  } | null;
}

export interface TOrder {
  id: string;
  orderId: string;
  customerId?: string;
  totalAmount: number;
  deliveryCharge: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  cancelReason?: string | null;
  createdAt: string;
  shippingAddress?: TShippingAddress;
  deliveries?: TOrderDelivery[];
  items: TOrderItem[];
  customer?: {
    id?: string;
    fullName: string;
    email?: string;
    profileImage?: string | null;
  };
}

export interface TPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export type TEarningChartType = "monthly" | "weekly";

export interface TEarningChartPoint {
  month?: string;
  day?: string;
  earning: number;
}

export interface TProducerEarning {
  id: string;
  amount: number;
  isTransferred: boolean;
  createdAt: string;
  paidAt?: string | null;
  orderItem?: {
    productName: string;
    quantity: number;
    sellingUnit: SellingUnit;
    unitPrice: number;
    subtotal: number;
  };
}

export interface TDriverEarning {
  id: string;
  amount: number;
  isTransferred: boolean;
  createdAt: string;
  paidAt?: string | null;
  order?: {
    id: string;
    orderId: string;
    items?: {
      productName: string;
      quantity: number;
      sellingUnit: SellingUnit;
      unitPrice: number;
      subtotal: number;
    }[];
  };
}

export interface TStripeAccountStatus {
  hasStripeAccount: boolean;
  stripeAccountId: string | null;
  accountId?: string | null;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  isEnabled: boolean;
}

export interface TDelivery {
  id: string;
  orderId: string;
  driverId?: string;
  status: DeliveryStatus;
  createdAt?: string;
  order?: {
    id: string;
    orderId: string;
    totalAmount?: number;
    deliveryCharge?: number;
    shippingAddress?: TShippingAddress;
    customer?: {
      id?: string;
      fullName: string;
      email?: string;
      phoneNumber?: string | null;
    };
    items?: TOrderItem[];
  };
}

export interface TDriverDeliverySummary {
  id: string;
  status: DeliveryStatus;
  otpHash?: string | null;
  order: {
    orderId: string;
    totalAmount: number;
    shippingAddress?: {
      city: string;
    } | null;
    customer?: {
      fullName: string;
    } | null;
    _count?: {
      items: number;
    };
  };
}

export interface TDriverDeliveryDetails {
  id: string;
  status: DeliveryStatus;
  otpHash?: string | null;
  order: {
    orderId: string;
    totalAmount: number;
    status: OrderStatus;
    shippingAddress?: {
      addressLine: string;
      city: string;
      instruction?: string | null;
      postCode?: string | null;
    } | null;
    customer?: {
      fullName: string;
      profileImage?: string | null;
    } | null;
    items: {
      productName: string;
      subtotal: number;
      unitPrice: number;
      quantity: number;
      sellingUnit: SellingUnit;
    }[];
  };
}

export interface TChatMessage {
  id?: string;
  conversationId?: string;
  senderId?: string;
  receiverId?: string;
  message: string;
  images?: string[];
  isRead?: boolean;
  isSendByMe?: boolean;
  createdAt?: string;
}

export interface TParticipant {
  id: string;
  fullName: string;
  profileImage?: string | null;
  role?: UserRole;
  isOnline?: boolean;
}

export interface TConversationItem {
  participant: TParticipant;
  lastMessage: {
    message: string;
    images?: string[];
    createdAt: string;
  } | null;
  unreadCount: number;
}

export interface TConversationDetails {
  id: string;
  participant?: TParticipant | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TConversationHistory {
  conversation: TConversationDetails;
  messages: TChatMessage[];
}

export interface TTopRatedProducer {
  producerId: string;
  fullName: string;
  profileImage?: string | null;
  farmName?: string | null;
  farmLocation?: string | null;
  farmPhotoUrl?: string | null;
  totalOrders: number;
  avgRating: number;
  totalProductCount: number;
}

export interface TApiResponse<T> {
  statusCode?: number;
  message: string;
  data: T;
  pagination?: TPaginationMeta;
}

export interface TFarmReview {
  rating: number;
  comment: string;
  buyer?: {
    fullName: string;
    profileImage?: string | null;
    createdAt: string;
  } | null;
}

export interface TFarmProduct {
  id: string;
  name: string;
  imageUrls: string[];
  pricePerUnit: number;
  sellingUnit: SellingUnit;
  avgRating?: number;
  totalReviews?: number;
  _count?: {
    orderItems?: number;
  };
  reviews?: TFarmReview[];
}

export interface TProducerFarmData {
  id: string;
  city?: string | null;
  region?: string | null;
  profileImage?: string | null;
  fullName: string;
  address?: string | null;
  phoneNumber?: string | null;
  _count?: {
    products?: number;
  };
  producerProfile?: {
    farmName?: string | null;
    companyName?: string | null;
    farmLocation?: string | null;
    farmPhotoUrl?: string | null;
    farmSize?: number | null;
    producerType?: ProducerType | null;
  } | null;
  products?: TFarmProduct[];
}

export interface TProducerFarmInfo {
  producer: TProducerFarmData;
}

