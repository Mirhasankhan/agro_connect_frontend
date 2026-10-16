"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  Plus,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
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
import { formatCurrency, formatUnit, getApplicableTierPrice } from "@/utils/formatters";
import RegionCitySelect from "@/components/common/RegionCitySelect";

const DELIVERY_CHARGE = 50;

const addressSchema = z.object({
  addressLine: z.string().min(5, "Address must be at least 5 characters"),
  region: z.string().min(1, "Please select a region"),
  city: z.string().min(1, "Please select a city"),
  postCode: z.string().min(2, "Postal code is required"),
  instruction: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

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
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressLine: "",
      region: "",
      city: "",
      postCode: "",
      instruction: "",
    },
  });

  const selectedRegion = watch("region");
  const selectedCity = watch("city");

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Sync default address if available
  React.useEffect(() => {
    if (firstAddressId && !selectedAddressId) {
      setSelectedAddressId(firstAddressId);
    }
  }, [firstAddressId, selectedAddressId]);

  const handleCreateAddress = async (values: AddressFormValues) => {
    try {
      // User must select region in UI, but payload only requires city
      const payload = {
        addressLine: values.addressLine,
        city: values.city,
        postCode: values.postCode,
        instruction: values.instruction,
      };
      const res = await createAddress(payload).unwrap();
      toast.success("Delivery address added successfully!");
      reset({
        addressLine: "",
        region: "",
        city: "",
        postCode: "",
        instruction: "",
      });
      setShowNewAddressForm(false);
      if (res?.data?.id) {
        setSelectedAddressId(res.data.id);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select or add a shipping address");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const res = await createOrder({
        shippingAddressId: selectedAddressId,
        cartIds: cartItems.map((item) => item.id),
      }).unwrap();

      toast.success("Order created! Redirecting to secure Stripe Checkout...");

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
    const basePrice = item.product?.pricePerUnit || 0;
    const { unitPrice } = getApplicableTierPrice(
      basePrice,
      item.quantity,
      item.product?.pricingTiers
    );
    return acc + unitPrice * item.quantity;
  }, 0);

  const total = cartItems.length > 0 ? subtotal + DELIVERY_CHARGE : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-emerald-600 mb-4" />
          <h2 className="font-serif text-3xl font-bold text-slate-900">Please Log In</h2>
          <p className="text-slate-500 text-sm max-w-sm mt-2 mb-6">
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">Checkout & Delivery</h1>
            <p className="text-xs text-slate-500 mt-1">
              Select shipping destination and pay securely via Stripe.
            </p>
          </div>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition-colors"
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
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-serif font-bold text-lg text-slate-900">1. Shipping Address</h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (showNewAddressForm) {
                      reset({
                        addressLine: "",
                        region: "",
                        city: "",
                        postCode: "",
                        instruction: "",
                      });
                    }
                    setShowNewAddressForm(!showNewAddressForm);
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showNewAddressForm ? "Select Existing" : "Add New Address"}
                </button>
              </div>

              {/* Existing Addresses List */}
              {!showNewAddressForm && (
                <div className="space-y-3">
                  {isLoadingAddresses ? (
                    <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                  ) : addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressId === addr.id
                          ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-sm"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                          }`}
                      >
                        <input
                          type="radio"
                          name="shippingAddress"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-emerald-600"
                        />
                        <div className="flex-1 text-xs space-y-1">
                          <p className="font-bold text-slate-900 text-sm">{addr.addressLine}</p>
                          <p className="text-slate-600">
                            {addr.city}, Bangladesh (Postal: {addr.postCode})
                          </p>
                          {addr.instruction && (
                            <p className="text-emerald-700 text-[11px] italic">
                              Note: {addr.instruction}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500">
                      No saved addresses found. Please add an address below.
                    </div>
                  )}
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || addresses.length === 0) && (
                <form
                  onSubmit={handleSubmit(handleCreateAddress)}
                  className="space-y-4 pt-2 border-t border-slate-100"
                >
                  <h4 className="text-xs font-bold text-slate-800  tracking-wider">
                    Add Destination Address
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="form-label">Street / Neighborhood Address</label>
                      <input
                        type="text"
                        placeholder="e.g. block 5, street 12, near the market"
                        {...register("addressLine")}
                        className="form-input"
                      />
                      {errors.addressLine && (
                        <p className="form-error">{errors.addressLine.message}</p>
                      )}
                    </div>

                    <RegionCitySelect
                      regionValue={selectedRegion}
                      cityValue={selectedCity}
                      onRegionChange={(newRegion) => {
                        setValue("region", newRegion, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue("city", "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      onCityChange={(newCity) => {
                        setValue("city", newCity, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      regionError={errors.region?.message}
                      cityError={errors.city?.message}
                      regionLabel="Region / Division"
                      cityLabel="City / District"
                      regionId="shippingRegion"
                      cityId="shippingCity"
                      required
                      containerClassName="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    />

                    <div className="sm:col-span-2">
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 1205"
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
                        onClick={() => {
                          reset({
                            addressLine: "",
                            region: "",
                            city: "",
                            postCode: "",
                            instruction: "",
                          });
                          setShowNewAddressForm(false);
                        }}
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
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-lg text-slate-900">2. Payment Method</h3>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500 bg-emerald-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">Stripe Checkout</p>
                    <p className="text-xs text-slate-500">
                      Credit card, debit card & international checkout
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Your payment will be securely processed by Stripe. Once payment is confirmed,
                the producer will be notified to prepare the harvest for driver pickup.
              </p>
            </div>
          </div>

          {/* Right Column: Order Review & Submit (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-6 sticky top-24 shadow-sm">
              <h3 className="font-serif font-bold text-lg text-slate-900">Order Review</h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 border-b border-slate-100 pb-4">
                {cartItems.map((item) => {
                  const basePrice = item.product?.pricePerUnit || 0;
                  const { unitPrice, appliedTier } = getApplicableTierPrice(
                    basePrice,
                    item.quantity,
                    item.product?.pricingTiers
                  );
                  const lineTotal = unitPrice * item.quantity;

                  return (
                    <div key={item.id} className="flex justify-between items-start text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 line-clamp-1">{item.product?.name}</p>
                        <p className="text-slate-500">
                          Qty: {item.quantity}{" "}
                          {item.product?.sellingUnit && formatUnit(item.product.sellingUnit)}
                          {appliedTier && (
                            <span className="ml-1.5 text-emerald-700 font-semibold">
                              (Tier: {appliedTier.quantity}+ @ {formatCurrency(unitPrice)})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-emerald-600 block">
                          {formatCurrency(lineTotal)}
                        </span>
                        {appliedTier && (
                          <span className="text-[10px] text-slate-400 line-through block font-mono">
                            {formatCurrency(basePrice * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calculations */}
              <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatCurrency(DELIVERY_CHARGE)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-600 font-semibold">Total to Pay</span>
                <span className="font-serif font-bold text-2xl text-emerald-600">
                  {formatCurrency(total)}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cartItems.length === 0 || !selectedAddressId}
                className="btn-primary w-full py-3.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm"
              >
                {isPlacingOrder ? (
                  <>
                    Creating Order...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Place Order & Pay
                  </>
                )}
              </button>


            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
