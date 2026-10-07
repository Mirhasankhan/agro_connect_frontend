import { SellingUnit, TPricingTier } from "@/types";

/**
 * Format currency with FCFA (Ivory Coast currency) or ৳ based on requirement
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-CI", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("XOF", "FCFA");
};

/**
 * Alternative standard price formatter (or display in FCFA)
 */
export const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString()} FCFA`;
};

/**
 * Format selling unit into readable format
 */
export const formatUnit = (unit?: SellingUnit): string => {
  if (!unit) return "";
  switch (unit) {
    case "KG":
      return "kg";
    case "GRAM":
      return "g";
    case "PIECE":
      return "piece";
    case "DOZEN":
      return "dozen";
    case "LITER":
      return "L";
    case "BAG":
      return "bag";
    case "BUNDLE":
      return "bundle";
    default:
      return (unit as string).toLowerCase();
  }
};

/**
 * Calculate applicable tier unit price based on selected quantity
 */
export const getApplicableTierPrice = (
  basePrice: number,
  quantity: number,
  tiers?: TPricingTier[],
): { unitPrice: number; appliedTier: TPricingTier | null } => {
  if (!tiers || tiers.length === 0) {
    return { unitPrice: basePrice, appliedTier: null };
  }

  const eligibleTiers = tiers
    .filter((tier) => tier.quantity <= quantity)
    .sort((a, b) => b.quantity - a.quantity);

  const appliedTier = eligibleTiers[0] || null;
  const unitPrice = appliedTier ? appliedTier.pricePerUnit : basePrice;

  return { unitPrice, appliedTier };
};

/**
 * Calculate percentage savings between base and tier price
 */
export const calculateSavingsPercentage = (
  basePrice: number,
  discountPrice: number,
): number => {
  if (basePrice <= 0 || discountPrice >= basePrice) return 0;
  return Math.round(((basePrice - discountPrice) / basePrice) * 100);
};

/**
 * Format ISO date string into readable date
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

/**
 * Get color styling for order status badges
 */
export const getOrderStatusColor = (
  status?: string,
): { badge: string; dot: string } => {
  switch (status) {
    case "Delivered":
      return {
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        dot: "bg-emerald-400",
      };
    case "Shipped":
    case "PickedUp":
      return {
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        dot: "bg-blue-400",
      };
    case "Active":
    case "SentToHub":
      return {
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        dot: "bg-amber-400",
      };
    case "Cancelled":
    case "Refunded":
      return {
        badge: "bg-red-500/20 text-red-300 border-red-500/40",
        dot: "bg-red-400",
      };
    case "Pending":
    default:
      return {
        badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
        dot: "bg-yellow-400",
      };
  }
};

