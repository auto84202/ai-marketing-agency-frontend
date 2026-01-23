// Minimal Stripe checkout helper for subscriptions
// Usage: import { createSubscriptionCheckout } from 'src/lib/payments';
// await createSubscriptionCheckout({ priceId: 'price_...', userId: '<your-user-id>' });

type CreateSessionArgs = {
  priceId: string;
  userId?: string; // optional if backend derives from auth token
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:3001';

export async function createSubscriptionCheckout({ priceId, userId }: CreateSessionArgs): Promise<string> {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;

  if (!token) {
    throw new Error('Authentication required. Please log in to subscribe.');
  }

  if (!priceId) {
    throw new Error('Price ID is required');
  }

  const res = await fetch(`${API_BASE}/billing/create-subscription-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ priceId, userId }),
  });

  if (!res.ok) {
    let errorMessage = 'Failed to start checkout. Please try again.';
    try {
      const errorData = await res.json();
      // Use user-friendly error message from backend
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      // Don't expose sensitive API key details
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('sk_test_') || errorMessage.includes('sk_live_') || 
            errorMessage.includes('Invalid API Key')) {
          errorMessage = 'Payment service is not configured. Please contact support.';
        }
      }
    } catch {
      // If response is not JSON, use generic message
      errorMessage = res.status === 400 
        ? 'Invalid request. Please check your subscription plan.'
        : 'Failed to start checkout. Please try again.';
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  if (data?.url) {
    // Return the URL instead of redirecting immediately
    return data.url;
  }

  throw new Error('No session URL returned from server');
}

export async function createBillingPortal({ userId }: { userId?: string }) {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
  const res = await fetch(`${API_BASE}/billing/create-portal-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to create billing portal session: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (data?.url) {
    if (typeof window !== 'undefined') {
      window.location.href = data.url;
      return;
    }
    return data.url;
  }

  throw new Error('No portal URL returned from server');
}

export async function getSubscription(userId: string) {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
  const res = await fetch(`${API_BASE}/billing/subscription/${encodeURIComponent(userId)}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error('Failed to fetch subscription status');
  return res.json();
}

export async function cancelSubscription(userId: string) {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
  const res = await fetch(`${API_BASE}/billing/cancel-subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to cancel subscription: ${res.status} ${text}`);
  }

  return res.json();
}
