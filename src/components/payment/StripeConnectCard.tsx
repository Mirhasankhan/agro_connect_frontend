"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  CreditCard,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetStripeAccountStatusQuery,
  useConnectStripeMutation,
} from "@/redux/features/payment/paymentApi";

interface StripeConnectCardProps {
  userRole?: "PRODUCER" | "DRIVER";
}

export default function StripeConnectCard({ userRole = "PRODUCER" }: StripeConnectCardProps) {
  const searchParams = useSearchParams();
  const stripeConnectParam = searchParams.get("stripe_connect");

  const { data, isLoading, isFetching, refetch } = useGetStripeAccountStatusQuery();
  const [connectStripe, { isLoading: isConnecting }] = useConnectStripeMutation();

  const status = data?.data;
  const hasAccount = Boolean(status?.hasStripeAccount && (status?.stripeAccountId || status?.accountId));
  const isEnabled = Boolean(status?.isEnabled && status?.payoutsEnabled);
  const accountId = status?.stripeAccountId || status?.accountId;

  // Handle return from Stripe onboarding
  useEffect(() => {
    if (stripeConnectParam === "complete") {
      toast.success("Returned from Stripe! Updating account payout status...");
      refetch();
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("stripe_connect");
        window.history.replaceState({}, "", url.toString());
      }
    } else if (stripeConnectParam === "refresh") {
      toast.info("Stripe onboarding session expired. You can resume anytime.");
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("stripe_connect");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [stripeConnectParam, refetch]);

  const handleConnect = async () => {
    try {
      const returnUrl = typeof window !== "undefined" ? window.location.href : undefined;
      const res = await connectStripe({ returnUrl }).unwrap();

      if (res?.data?.url) {
        toast.info("Redirecting to Stripe secure onboarding...");
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to generate Stripe onboarding link");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to initiate Stripe connection");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-3 w-72 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-36 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  // Account is connected AND payouts are enabled
  if (hasAccount && isEnabled) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Stripe Payouts Active</h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Connected &amp; Verified
              </span>              
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your Stripe account is fully enabled to receive automated payouts. Funds from completed orders
              will transfer directly to your bank account.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConnect}
          disabled={isConnecting}
          className="btn-secondary text-xs py-2 px-4 inline-flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Opening...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-3.5 h-3.5" />
              <span>Stripe Dashboard</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </>
          )}
        </button>
      </div>
    );
  }

  // Either NO stripe account OR stripe account exists but is NOT enabled
  const isPendingVerification = hasAccount && !isEnabled;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900">
              {isPendingVerification
                ? "Stripe Setup Incomplete"
                : "Stripe Account Not Connected"}
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200/80 text-amber-800 border border-amber-300">
              {isPendingVerification ? "Verification Needed" : "Action Required"}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
            {isPendingVerification
              ? `Your Stripe account (${accountId || ""}) is created, but payout capabilities are not yet enabled. Please complete verification on Stripe to enable payouts.`
              : `To receive payouts for your ${
                  userRole === "PRODUCER" ? "harvest sales" : "delivery trips"
                }, please connect your Stripe account. Payout transfers are automated once connected.`}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleConnect}
        disabled={isConnecting || isFetching}
        className="btn-primary text-xs py-2.5 px-4 inline-flex items-center justify-center gap-2 shrink-0 shadow-sm self-start sm:self-auto"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-3.5 h-3.5" />
            <span>
              {isPendingVerification ? "Complete Stripe Setup" : "Connect with Stripe"}
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
}
