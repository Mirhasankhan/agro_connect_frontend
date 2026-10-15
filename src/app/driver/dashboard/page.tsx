"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Truck,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  MapPin,
  Eye,
} from "lucide-react";
import { useGetDriverWisePaymentsQuery } from "@/redux/features/payment/paymentApi";
import { useGetDriverWiseDeliveriesQuery } from "@/redux/features/order/orderApi";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";
import DeliveryOtpModal from "@/components/driver/DeliveryOtpModal";
import DriverProfileSetupModal from "@/components/driver/DriverProfileSetupModal";
import DriverEarningChart from "@/components/driver/DriverEarningChart";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function DriverDashboardPage() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const isSetupCompleted = useAppSelector((state) => state.auth.isSetupCompleted);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const hasDriverProfile = Boolean(
    profileData?.data?.driverProfile || user?.driverProfile
  );
  const verificationStatus = profileData?.data?.driverProfile?.verificationStatus;
  const isAccepted = verificationStatus === "Accepted";
  const isRejected = verificationStatus === "Rejected";

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsSetupModalOpen(false);
      return;
    }

    if (searchParams.get("setup") === "true") {
      setIsSetupModalOpen(true);
      return;
    }

    if (!isSetupCompleted && !hasDriverProfile && !isLoadingProfile) {
      setIsSetupModalOpen(true);
    } else {
      setIsSetupModalOpen(false);
    }
  }, [searchParams, isSetupCompleted, isAuthenticated, user, hasDriverProfile, isLoadingProfile]);

  const { data: paymentsData, isLoading: isLoadingPayments } =
    useGetDriverWisePaymentsQuery();
  const { data: deliveriesData, isLoading: isLoadingDeliveries } =
    useGetDriverWiseDeliveriesQuery();

  const [otpModalData, setOtpModalData] = useState<{
    deliveryId: string;
    orderReference?: string;
    customerName?: string;
  } | null>(null);

  const payments = paymentsData?.data?.payments || [];
  const deliveries = deliveriesData?.data || [];

  const activeDeliveries = deliveries.filter(
    (d) => d.status === "Assigned" || d.status === "PickedUp"
  );
  const completedDeliveries = deliveries.filter((d) => d.status === "Delivered");

  const totalEarnings =
    paymentsData?.data?.earningSummary?.amount ||
    payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const completedTripsCount =
    completedDeliveries.length > 0
      ? completedDeliveries.length
      : payments.filter((p) => p.isTransferred).length;

  return (
    <div className="space-y-8">
      {/* Verification Status Warning for Pending / Rejected */}
      {isSetupCompleted && !isAccepted && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs ${isRejected
            ? "border-rose-200 bg-rose-50 text-rose-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
        >
          {isRejected ? (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          ) : (
            <Clock className="h-5 w-5 shrink-0 text-amber-600" />
          )}
          <div className="space-y-0.5">
            <p className="font-semibold text-sm">
              {isRejected
                ? "Driver Verification Rejected"
                : "Driver License & Vehicle Verification Pending"}
            </p>
            <p>
              {isRejected
                ? "Your driver verification was not approved. Please review your profile documents or contact support."
                : "Your vehicle documents and license are being reviewed by dispatchers. Delivery assignment and fulfillment will be enabled once your account is Accepted."}
            </p>
          </div>
        </div>
      )}

      {/* Profile Setup Pending Notice */}
      {isAuthenticated && user && !hasDriverProfile && !isSetupCompleted && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-950">
                Driver Profile Setup Required
              </h3>
              <p className="mt-0.5 text-xs text-amber-800">
                Provide your driving license, vehicle type, and insurance documentation to start
                receiving logistics trips.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSetupModalOpen(true)}
            className="btn-primary shrink-0 self-start sm:self-auto bg-amber-600 hover:bg-amber-700 text-white border-0 text-xs py-2 px-4 shadow-sm"
          >
            Complete Driver Setup
          </button>
        </div>
      )}

      {/* Setup Profile Modal */}
      {isAuthenticated && user && !hasDriverProfile && (
        <DriverProfileSetupModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
        />
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <span className="text-xs  tracking-widest text-emerald-600 font-bold">
            Logistics Console
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Driver Delivery Control Center
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Transport fresh farm harvests from regional hubs to urban tables. Confirm pickups,
            verify customer handovers with 4-digit OTP codes, and secure instant earnings.
          </p>
        </div>

        <Link
          href="/driver/deliveries"
          className="btn-primary text-xs py-3 px-5 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
        >
          <Truck className="w-4 h-4" />
          View All Deliveries
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">
            {isLoadingPayments ? "..." : formatCurrency(totalEarnings)}
          </p>
          <p className="text-[11px] text-slate-500">Fixed delivery charge rewards</p>
        </div>

        {/* Completed Deliveries */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Completed Trips</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">
            {isLoadingDeliveries ? "..." : completedTripsCount}
          </p>
          <p className="text-[11px] text-slate-500">Verified with 4-digit OTP check</p>
        </div>

        {/* Active In-Transit */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Deliveries</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">
            {isLoadingDeliveries ? "..." : activeDeliveries.length}
          </p>
          <p className="text-[11px] text-slate-500">Assigned or in transit to buyers</p>
        </div>

        {/* Fleet Readiness */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Fleet Status</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-emerald-700">
            {isAccepted ? "On Duty & Active" : "Pending Verification"}
          </p>
          <p className="text-[11px] text-slate-500">Bangladesh Agro-Grid</p>
        </div>
      </div>

      {/* Delivery Revenue Analytics Chart */}
      <DriverEarningChart />

      {/* Active Assigned Deliveries Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Active Assigned Deliveries
            </h2>
            <p className="text-xs text-slate-500">
              Shipments ready for pickup at hubs or currently in transit to customer destinations.
            </p>
          </div>
          <Link
            href="/driver/deliveries"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
          >
            Manage All ({deliveries.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingDeliveries ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : activeDeliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500  tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Destination City</th>
                  <th className="py-3 px-4">Buyer Customer</th>
                  <th className="py-3 px-4">Produce Items</th>
                  <th className="py-3 px-4">Order Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeDeliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{d.order.orderId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-1.5 mt-2">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {d.order.shippingAddress?.city || "Destination"}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {d.order.customer?.fullName || "Buyer"}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {d.order._count?.items ?? 0} item(s)
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {formatCurrency(d.order.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${d.status === "PickedUp"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                      >
                        {d.status === "PickedUp" ? "In Transit" : "Assigned"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/driver/deliveries/${d.id}`}
                        className="btn-secondary text-[11px] py-1 px-3 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No active deliveries assigned at the moment. When logistics hubs assign deliveries to
            your vehicle, they will appear here.
          </div>
        )}
      </div>

      {/* Operational Instructions Banner */}
      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 shadow-sm">
        <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Standard Agro-Logistics Delivery Protocol
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
          <li>
            <strong>Hub Pickup:</strong> Inspect crop crates and produce packaging, then mark status as{" "}
            <span className="text-emerald-700 font-semibold">Picked Up</span>.
          </li>
          <li>
            <strong>Buyer Arrival:</strong> Upon reaching customer destination, click{" "}
            <span className="text-emerald-700 font-semibold">Send OTP</span> to generate their
            verification code.
          </li>
          <li>
            <strong>Handover & Payment:</strong> Input the buyer&apos;s 4-digit code in the{" "}
            <span className="text-emerald-700 font-semibold">Verify OTP</span> modal to immediately
            complete delivery and claim your fee.
          </li>
        </ol>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Recent Delivery Trips & Payouts
            </h2>
            <p className="text-xs text-slate-500">
              Completed and settled logistics journeys with trip fees.
            </p>
          </div>
          <Link
            href="/driver/earnings"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
          >
            View Earning Records
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingPayments ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500  tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Delivery Fee</th>
                  <th className="py-3 px-4">Transfer Status</th>
                  <th className="py-3 px-4 text-right">Completion Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{p.order?.orderId || p.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isTransferred
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                      >
                        {p.isTransferred ? "Settled & Paid" : "Escrow Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono">
                      {p.createdAt ? formatDate(p.createdAt) : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No completed delivery trips yet. Check &ldquo;My Deliveries&rdquo; to start your first
            route.
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {otpModalData && (
        <DeliveryOtpModal
          isOpen={Boolean(otpModalData)}
          onClose={() => setOtpModalData(null)}
          deliveryId={otpModalData.deliveryId}
          orderReference={otpModalData.orderReference}
          customerName={otpModalData.customerName}
        />
      )}
    </div>
  );
}
