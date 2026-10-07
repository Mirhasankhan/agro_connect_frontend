"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  Plus,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useGetCartQuery } from "@/redux/features/shopping/shoppingApi";
import {
  useGetShippingAddressesQuery,
  useCreateShippingAddressMutation,
} from "@/redux/features/shipping/shippingApi";
import { useCreateOrderMutation } from "@/redux/features/order/orderApi";
import { useAppSelector } from "@/redux/hooks";
import { formatCurrency, formatUnit } from "@/utils/formatters";

const addressSchema = z.object({
  addressLine: z.string().min(5, "Address line must be at least 5 characters"),
  city: z.string().min(2, "City is required (e.g. Abidjan, Bouaké)"),
  postCode: z.string().min(1, "Postal code is required"),
  instruction: z.string().min(3, "Delivery instructions (e.g. Near supermarket, gate code)"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const DELIVERY_CHARGE = 50;

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false);

  // Queries
  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: addressesData, isLoading: isLoadingAddresses } = useGetShippingAddressesQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );

  // Mutations
  const [createAddress, { isLoading: isCreatingAddress }] = useCreateShippingAddressMutation();
  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();

  const cartItems = cartData?.data || [];
  const addresses = addressesData?.data || [];
  const firstAddressId = addressesData?.data?.[0]?.id;

  // Form for new address
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
  });

  // Automatically select first address if none selected
  React.useEffect(() => {
    if (firstAddressId && !selectedAddressId) {
      setSelectedAddressId(firstAddressId);
    }
  }, [firstAddressId, selectedAddressId]);

  const handleCreateAddress = async (values: AddressFormValues) => {
    try {
      await createAddress(values).unwrap();
      toast.success("Shipping address saved!");
      reset();
      setShowNewAddressForm(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select or add a delivery address");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
      return;
    }

    const cartIds = cartItems.map((c) => c.id);

    try {
      const res = await createOrder({
        shippingAddressId: selectedAddressId,
        cartIds,
      }).unwrap();

      toast.success("Order created! Redirecting to secure checkout...");

      if (res?.data?.checkOutUrl) {
        // Redirect to Stripe Hosted Checkout
        window.location.href = res.data.checkOutUrl;
      } else {
        router.push(`/payment/success?orderId=${res?.data?.orderId || ""}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create order");
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const unitPrice = item.product?.pricePerUnit || 0;
    return acc + unitPrice * item.quantity;
  }, 0);

  const total = cartItems.length > 0 ? subtotal + DELIVERY_CHARGE : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#04160a] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-emerald-400 mb-4" />
          <h2 className="font-serif text-3xl font-bold">Please Log In</h2>
          <p className="text-white/60 text-sm max-w-sm mt-2 mb-6">
            You must be logged in to proceed to checkout.
          </p>
          <Link href="/login?redirect=/checkout" className="btn-primary text-xs py-2.5 px-6">
            Log In Now
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04160a] text-white flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-[#082314] to-[#04160a] border-b border-forest-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">Checkout & Delivery</h1>
            <p className="text-xs text-white/60 mt-1">
              Select shipping destination and pay securely via Stripe.
            </p>
          </div>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Cart
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery Address & Payment Method (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Delivery Address */}
            <div className="bg-[#071f12] border border-forest-700/60 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-forest-800 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-serif font-bold text-lg text-white">1. Shipping Address</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showNewAddressForm ? "Select Existing" : "Add New Address"}
                </button>
              </div>

              {/* Existing Addresses List */}
              {!showNewAddressForm && (
                <div className="space-y-3">
                  {isLoadingAddresses ? (
                    <div className="h-20 bg-forest-900/50 rounded-xl animate-pulse" />
                  ) : addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500"
                            : "bg-forest-900/40 border-forest-800 hover:border-forest-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingAddress"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-emerald-500"
                        />
                        <div className="flex-1 text-xs space-y-1">
                          <p className="font-bold text-white text-sm">{addr.addressLine}</p>
                          <p className="text-white/70">
                            {addr.city}, Côte d&apos;Ivoire (Postal: {addr.postCode})
                          </p>
                          {addr.instruction && (
                            <p className="text-emerald-400/90 text-[11px] italic">
                              Note: {addr.instruction}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-white/60">
                      No saved addresses found. Please add an address below.
                    </div>
                  )}
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || addresses.length === 0) && (
                <form
                  onSubmit={handleSubmit(handleCreateAddress)}
                  className="space-y-4 pt-2 border-t border-forest-800"
                >
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Add Destination Address
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="form-label">Street / Neighborhood Address</label>
                      <input
                        type="text"
                        placeholder="e.g. Rue des Jardins, Deux Plateaux"
                        {...register("addressLine")}
                        className="form-input"
                      />
                      {errors.addressLine && (
                        <p className="form-error">{errors.addressLine.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">City / Commune</label>
                      <input
                        type="text"
                        placeholder="e.g. Abidjan"
                        {...register("city")}
                        className="form-input"
                      />
                      {errors.city && <p className="form-error">{errors.city.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 01 BP 1234"
                        {...register("postCode")}
                        className="form-input"
                      />
                      {errors.postCode && <p className="form-error">{errors.postCode.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="form-label">Delivery Instructions for Driver</label>
                      <input
                        type="text"
                        placeholder="e.g. Gate code, landmark or contact number"
                        {...register("instruction")}
                        className="form-input"
                      />
                      {errors.instruction && (
                        <p className="form-error">{errors.instruction.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="btn-secondary text-xs py-2 px-4"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isCreatingAddress}
                      className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
                    >
                      {isCreatingAddress ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Address"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment Gateway */}
            <div className="bg-[#071f12] border border-forest-700/60 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-forest-800 pb-3">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif font-bold text-lg text-white">2. Payment Method</h3>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500 bg-emerald-950/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-900 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">Stripe Checkout</p>
                    <p className="text-xs text-white/60">
                      Credit card, debit card & international checkout
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>

              <p className="text-xs text-white/50 leading-relaxed">
                Your payment will be securely processed by Stripe. Once payment is confirmed,
                the producer will be notified to prepare the harvest for driver pickup.
              </p>
            </div>
          </div>

          {/* Right Column: Order Review & Submit (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-[#071f12] border border-forest-700/70 rounded-2xl p-6 space-y-6 sticky top-24 shadow-xl">
              <h3 className="font-serif font-bold text-lg text-white">Order Review</h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 border-b border-forest-800 pb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white line-clamp-1">{item.product?.name}</p>
                      <p className="text-white/50">
                        Qty: {item.quantity}{" "}
                        {item.product?.sellingUnit && formatUnit(item.product.sellingUnit)}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-emerald-400">
                      {formatCurrency((item.product?.pricePerUnit || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-2.5 text-xs border-b border-forest-800 pb-4">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-white">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Delivery Charge</span>
                  <span className="font-mono font-semibold text-white">
                    {formatCurrency(DELIVERY_CHARGE)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-white/70 font-semibold">Total to Pay</span>
                <span className="font-serif font-bold text-2xl text-emerald-400 font-mono">
                  {formatCurrency(total)}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cartItems.length === 0 || !selectedAddressId}
                className="btn-primary w-full py-3.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Place Order & Pay
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-[11px] text-white/50 justify-center">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by 6-digit delivery OTP verification</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
