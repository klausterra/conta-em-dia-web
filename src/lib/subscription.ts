export const SUBSCRIPTION = {
  productId: 'prod_VEGuXk2wgYnkHO',
  priceId: 'price_1UDoMp0VvDGRmDulWyj2aMya',
  paymentLinkUrl: 'https://buy.stripe.com/test_6oU3cn44ufmt46GfMb9Ve00',
  /** SKU da assinatura na Play Console (subscriptions). */
  playProductId: 'pro_familia',
  packageName: 'br.com.contaemdia.app',
  amountLabel: 'R$ 5,99',
  trialDays: 7,
  planName: 'Pro Família',
} as const;

export type SubscriptionStatus = 'none' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export type BillingProvider = 'stripe' | 'play';

export type UserBilling = {
  status: SubscriptionStatus;
  plan: 'free' | 'pro';
  provider?: BillingProvider;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  playPurchaseToken?: string;
  playProductId?: string;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  updatedAt?: string;
};

export function isProAccess(billing: UserBilling | null | undefined, now = Date.now()): boolean {
  if (!billing) return false;
  if (billing.plan !== 'pro') return false;
  if (billing.status === 'active') return true;
  if (billing.status === 'trialing') {
    if (!billing.trialEndsAt) return true;
    return new Date(billing.trialEndsAt).getTime() > now;
  }
  return false;
}
