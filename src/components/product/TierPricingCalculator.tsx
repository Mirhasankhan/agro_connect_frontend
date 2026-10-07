"use client";

import React from "react";
import { TPricingTier, SellingUnit } from "@/types";
import { formatCurrency, formatUnit, getApplicableTierPrice } from "@/utils/formatters";
import { TrendingDown, Sparkles, Check } from "lucide-react";

interface TierPricingCalculatorProps {
  basePrice: number;
  sellingUnit: SellingUnit;
  pricingTiers?: TPricingTier[];
  quantity: number;
  availableQuantity: number;
  onQuantityChange: (qty: number) => void;
}

export default function TierPricingCalculator({
  basePrice,
  sellingUnit,
  pricingTiers = [],
  quantity,
  availableQuantity,
  onQuantityChange,
}: TierPricingCalculatorProps) {
  // Sort tiers ascending by quantity threshold
  const sortedTiers = [...pricingTiers].sort((a, b) => a.quantity - b.quantity);

  // Determine active unit price for the current quantity
  const { unitPrice: activeUnitPrice } = getApplicableTierPrice(basePrice, quantity, sortedTiers);

  // Calculate totals and savings
  const subtotal = quantity * activeUnitPrice;
  const regularTotal = quantity * basePrice;
  const savings = Math.max(0, regularTotal - subtotal);
  const savingsPercent = regularTotal > 0 ? Math.round((savings / regularTotal) * 100) : 0;

  const handleIncrement = () => {
    if (quantity < availableQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      onQuantityChange(1);
    } else if (val > availableQuantity) {
      onQuantityChange(availableQuantity);
    } else {
      onQuantityChange(val);
    }
  };

  return (
    <div className="bg-[#082013] border border-forest-700/70 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-emerald-400" />
          <h4 className="font-serif font-bold text-white text-base">
            Volume & Bulk Pricing Calculator
          </h4>
        </div>
        {savings > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Save {savingsPercent}% Bulk Discount
          </span>
        )}
      </div>

      <p className="text-xs text-white/60">
        Order higher quantities to unlock discounted producer rates. Select your desired volume
        below to apply savings instantly.
      </p>

      {/* Tier Breakdown Badges / Table */}
      {sortedTiers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {/* Base Tier Card */}
          <button
            type="button"
            onClick={() => onQuantityChange(1)}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              quantity < sortedTiers[0].quantity
                ? "bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500 shadow-md"
                : "bg-forest-900/40 border-forest-800 hover:border-forest-700"
            }`}
          >
            {quantity < sortedTiers[0].quantity && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-[#091b10] flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <div className="text-[11px] text-white/60 font-medium">Standard</div>
            <div className="text-xs text-white/90">
              1 - {sortedTiers[0].quantity - 1} {formatUnit(sellingUnit)}
            </div>
            <div className="font-mono font-bold text-emerald-400 text-sm mt-1">
              {formatCurrency(basePrice)}
            </div>
          </button>

          {/* Dynamic Tier Cards */}
          {sortedTiers.map((tier, idx) => {
            const isLast = idx === sortedTiers.length - 1;
            const nextTier = sortedTiers[idx + 1];
            const isCurrentlyActive =
              quantity >= tier.quantity && (!nextTier || quantity < nextTier.quantity);

            const tierDiscount = Math.round(
              ((basePrice - tier.pricePerUnit) / basePrice) * 100
            );

            return (
              <button
                key={tier.id || idx}
                type="button"
                onClick={() => onQuantityChange(tier.quantity)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isCurrentlyActive
                    ? "bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500 shadow-md"
                    : "bg-forest-900/40 border-forest-800 hover:border-forest-700"
                }`}
              >
                {isCurrentlyActive && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-[#091b10] flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <div className="text-[11px] text-amber-400 font-bold">
                  -{tierDiscount}% Off
                </div>
                <div className="text-xs text-white/90">
                  {tier.quantity}
                  {isLast ? "+" : ` - ${nextTier.quantity - 1}`} {formatUnit(sellingUnit)}
                </div>
                <div className="font-mono font-bold text-emerald-400 text-sm mt-1">
                  {formatCurrency(tier.pricePerUnit)}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-forest-900/40 border border-forest-800 text-xs text-white/60">
          This product is sold at a flat direct producer rate of{" "}
          <span className="text-emerald-400 font-bold font-mono">
            {formatCurrency(basePrice)} / {formatUnit(sellingUnit)}
          </span>
          .
        </div>
      )}

      {/* Quantity Stepper & Price Summary */}
      <div className="pt-3 border-t border-forest-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-white/70 font-medium">Quantity:</span>
          <div className="flex items-center border border-forest-700 rounded-xl overflow-hidden bg-forest-950">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="px-3.5 py-2 text-white/80 hover:bg-forest-800 disabled:opacity-40 transition-colors text-base font-bold"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={availableQuantity}
              value={quantity}
              onChange={handleInputChange}
              className="w-16 bg-transparent text-center font-mono font-bold text-white text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= availableQuantity}
              className="px-3.5 py-2 text-white/80 hover:bg-forest-800 disabled:opacity-40 transition-colors text-base font-bold"
            >
              +
            </button>
          </div>
          <span className="text-xs text-white/50">{formatUnit(sellingUnit)}</span>
        </div>

        {/* Calculation summary */}
        <div className="text-right w-full sm:w-auto">
          <div className="text-xs text-white/60">
            Unit Price:{" "}
            <span className="font-mono font-bold text-emerald-400">
              {formatCurrency(activeUnitPrice)}
            </span>{" "}
            / {formatUnit(sellingUnit)}
          </div>
          <div className="flex items-baseline justify-end gap-2 mt-0.5">
            <span className="text-xs text-white/50">Subtotal:</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {formatCurrency(subtotal)}
            </span>
          </div>
          {savings > 0 && (
            <div className="text-[11px] text-emerald-300 font-medium">
              You save {formatCurrency(savings)} with tiered pricing!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
