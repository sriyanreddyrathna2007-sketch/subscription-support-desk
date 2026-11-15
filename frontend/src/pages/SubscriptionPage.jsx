import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Calendar,
  XCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const SubscriptionPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [confirmPlan, setConfirmPlan] = useState(null);
  const [submittingChange, setSubmittingChange] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found an alternative tool');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const fetchData = async () => {
    try {
      const [subData, plansData] = await Promise.all([
        api.getMySubscription(),
        api.getPlans(),
      ]);
      setSubscription(subData);
      setPlans(plansData);
    } catch (err) {
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangePlan = async () => {
    if (!confirmPlan) return;
    setSubmittingChange(true);
    try {
      const updated = await api.changeSubscription(confirmPlan.id);
      setSubscription(updated);
      setConfirmPlan(null);
      toast.success(`Successfully switched subscription to ${confirmPlan.name} Plan!`);
    } catch (err) {
      toast.error(err.message || 'Failed to update subscription');
    } finally {
      setSubmittingChange(false);
    }
  };

  const handleCancelSubscription = async () => {
    setSubmittingCancel(true);
    try {
      const updated = await api.cancelSubscription(cancelReason);
      setSubscription(updated);
      setCancelModalOpen(false);
      toast.warning('Subscription has been marked as canceled at end of current period.');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel subscription');
    } finally {
      setSubmittingCancel(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading subscription details..." />;
  }

  const currentPlan = subscription?.plan;
  const isCanceled = subscription?.status === 'canceled';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">My Subscription</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your subscription tier, billing period, and automated capabilities.
          </p>
        </div>

        {/* Demo Mode Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Simulated Payment Workflow (Demo Mode)</span>
        </div>
      </div>

      {/* Current Active Plan Card */}
      <Card
        title="Current Plan Status"
        subtitle="Your plan privileges, renewal dates, and status."
        headerAction={
          <Badge size="lg" variant={subscription?.status}>
            {subscription?.status ? subscription.status.toUpperCase() : 'ACTIVE'}
          </Badge>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Plan Tier</div>
            <div className="text-xl font-extrabold text-slate-800 mt-1">
              {currentPlan?.name || 'Basic'} Plan
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              ${currentPlan?.price || 0}.00 / {currentPlan?.billing_interval || 'month'}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Renewal Date</div>
            <div className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                {subscription?.renewal_date
                  ? new Date(subscription.renewal_date).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {isCanceled ? 'Access ends on renewal date' : 'Auto-renews via simulated payment'}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Simulated Payment</div>
            <div className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Visa ending 4242</span>
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">Verified Demo Card</div>
          </div>

          <div className="flex md:justify-end">
            {!isCanceled ? (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Subscription
              </Button>
            ) : (
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                Cancellation Scheduled
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Available Plans Comparison Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Available Subscription Tiers</h2>
        <p className="text-xs text-slate-500 mb-5">
          Select a tier to upgrade or downgrade your workspace instantly. Changes apply immediately with prorated adjustments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = currentPlan?.id === p.id;
            const isUpgrade = currentPlan && p.price > currentPlan.price;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-2 border-blue-600 ring-2 ring-blue-100 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#0F172A]">{p.name}</h3>
                    {isCurrent && (
                      <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.description}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#0F172A]">${p.price}</span>
                    <span className="text-xs text-slate-500">/ {p.billing_interval}</span>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                    {p.features && p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {isCurrent ? (
                    <Button variant="secondary" className="w-full text-slate-500" disabled>
                      Active Plan
                    </Button>
                  ) : (
                    <Button
                      variant={isUpgrade ? 'primary' : 'outline'}
                      className="w-full"
                      onClick={() => setConfirmPlan(p)}
                    >
                      {isUpgrade ? `Upgrade to ${p.name}` : `Switch to ${p.name}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade / Change Confirmation Modal */}
      <Modal
        isOpen={!!confirmPlan}
        onClose={() => setConfirmPlan(null)}
        title={`Confirm Subscription Change to ${confirmPlan?.name}`}
        subtitle="Review simulated transaction and feature transition."
      >
        <div className="space-y-4 text-sm text-slate-700">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>Target Plan:</span>
              <span>{confirmPlan?.name} (${confirmPlan?.price}/month)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Billing Interval:</span>
              <span className="capitalize">{confirmPlan?.billing_interval}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Simulated Demo Transaction:</strong> No actual credit card charge will occur. The backend will simulate invoice generation, log an audit trail entry, and transition your active subscription.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setConfirmPlan(null)} disabled={submittingChange}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submittingChange}
              onClick={handleChangePlan}
            >
              Confirm Subscription Change
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Subscription"
        subtitle="We are sorry to see you go. Please let us know why you are canceling."
      >
        <div className="space-y-4 text-sm text-slate-700">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for cancellation
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Found an alternative tool">Found an alternative tool</option>
              <option value="Too expensive for current needs">Too expensive for current needs</option>
              <option value="Missing a critical feature">Missing a critical feature</option>
              <option value="Temporary project completed">Temporary project completed</option>
              <option value="Technical issues or bugs">Technical issues or bugs</option>
            </select>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            You will retain full access to all features until the end of your current billing period (
            <strong>{subscription?.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : 'period end'}</strong>
            ). No further automatic charges will occur.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)} disabled={submittingCancel}>
              Keep My Subscription
            </Button>
            <Button
              variant="danger"
              loading={submittingCancel}
              onClick={handleCancelSubscription}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
