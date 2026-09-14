/**
 * subscriptionService.ts
 * Frontend service for all Carebridge+ subscription operations.
 * All sensitive payment credentials are server-side only.
 */

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'payment_failed'
  | 'paused'
  | 'suspended'
  | 'payment_pending';

export interface SubscriptionStatusResponse {
  success: boolean;
  subscriptionStatus: SubscriptionStatus;
  planType?: 'CLINIC' | 'HOSPITAL';
  trialEndAt?: number; // ms timestamp
  subscriptionNextBillingAt?: number;
  subscriptionStartAt?: number;
  paymentStatus?: string;
  subscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
  error?: string;
}

export interface BillingEvent {
  id: string;
  eventType: string;
  timestamp: number;
  amount?: number;
  planType?: string;
  paymentId?: string;
  status?: string;
  description?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  razorpayKeyId?: string;
  isMockMode?: boolean;
  error?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  subscriptionStatus?: SubscriptionStatus;
  nextBillingAt?: number;
  error?: string;
}

const API_BASE = '/api/subscription';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error((err as any).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const subscriptionService = {
  /**
   * Initialize 72-hour trial for a newly registered clinic/hospital user.
   * Idempotent: if hasUsedTrial=true, does nothing.
   */
  async initTrial(userId: string, planType: 'CLINIC' | 'HOSPITAL'): Promise<{ success: boolean; error?: string }> {
    try {
      return await fetchJson(`${API_BASE}/init-trial`, {
        method: 'POST',
        body: JSON.stringify({ userId, planType }),
      });
    } catch (e: any) {
      console.error('[subscriptionService] initTrial error:', e.message);
      return { success: false, error: e.message };
    }
  },

  /**
   * Get authoritative subscription status from the backend (Firestore).
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResponse> {
    try {
      return await fetchJson(`${API_BASE}/status/${userId}`);
    } catch (e: any) {
      return { success: false, subscriptionStatus: 'trial', error: e.message };
    }
  },

  /**
   * Create a Razorpay order for the given plan type.
   */
  async createOrder(userId: string, planType: 'CLINIC' | 'HOSPITAL', subscriptionType: 'monthly' | 'yearly' = 'monthly'): Promise<CreateOrderResponse> {
    try {
      return await fetchJson(`${API_BASE}/create-order`, {
        method: 'POST',
        body: JSON.stringify({ userId, planType, subscriptionType }),
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Verify payment signature server-side and activate subscription.
   */
  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    userId: string;
    planType: 'CLINIC' | 'HOSPITAL';
    subscriptionType?: 'monthly' | 'yearly';
  }): Promise<VerifyPaymentResponse> {
    try {
      return await fetchJson(`${API_BASE}/verify-payment`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Get billing history / audit events for a user.
   */
  async getBillingHistory(userId: string): Promise<{ success: boolean; events: BillingEvent[] }> {
    try {
      return await fetchJson(`${API_BASE}/billing-history/${userId}`);
    } catch (e: any) {
      return { success: false, events: [] };
    }
  },

  /**
   * Request subscription cancellation (sets cancelAtPeriodEnd = true).
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await fetchJson(`${API_BASE}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Get server timestamp for accurate countdown calculation.
   */
  async getServerTime(): Promise<{ timestamp: number }> {
    try {
      return await fetchJson(`${API_BASE}/server-time`);
    } catch (e: any) {
      return { timestamp: Date.now() };
    }
  },

  /**
   * Load Razorpay Checkout JS dynamically.
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Open Razorpay checkout popup.
   * Returns: 'success' | 'failure' | 'cancelled'
   */
  openCheckout(options: {
    orderId: string;
    amount: number;
    currency: string;
    razorpayKeyId: string;
    userName: string;
    userEmail: string;
    description: string;
    onSuccess: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
    onFailure: (error: any) => void;
    onDismiss: () => void;
  }): void {
    const rzp = new (window as any).Razorpay({
      key: options.razorpayKeyId,
      amount: options.amount,
      currency: options.currency,
      name: 'Carebridge+',
      description: options.description,
      image: '/carebridge-logo.png',
      order_id: options.orderId,
      handler: (response: any) => {
        options.onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: options.userName,
        email: options.userEmail,
      },
      theme: {
        color: '#005f73',
      },
      modal: {
        ondismiss: options.onDismiss,
      },
    });
    rzp.on('payment.failed', (response: any) => {
      options.onFailure(response.error);
    });
    rzp.open();
  },
};
