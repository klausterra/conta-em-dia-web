import { useCallback, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import {
  isPlayBillingAvailable,
  listPlayPurchases,
  purchasePlaySubscription,
} from '@/lib/playBilling';
import {
  isProAccess,
  SUBSCRIPTION,
  type SubscriptionStatus,
  type UserBilling,
} from '@/lib/subscription';

const EMPTY: UserBilling = { status: 'none', plan: 'free' };

export function useSubscription() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<UserBilling>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playAvailable, setPlayAvailable] = useState(false);

  useEffect(() => {
    if (!user) {
      setBilling(EMPTY);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const data = snap.data()?.billing as UserBilling | undefined;
      setBilling(data ?? EMPTY);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    void isPlayBillingAvailable().then((ok) => {
      if (!cancelled) setPlayAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isPro = useMemo(() => isProAccess(billing), [billing]);

  const saveBilling = useCallback(
    async (next: UserBilling) => {
      if (!user) return;
      await setDoc(doc(db, 'users', user.uid), { billing: next }, { merge: true });
      setBilling(next);
    },
    [user],
  );

  const confirmPlayPurchase = useCallback(
    async (purchaseToken: string, productId: string = SUBSCRIPTION.playProductId) => {
      if (!user) return false;
      const res = await fetch('/api/confirm-play-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          purchaseToken,
          productId,
        }),
      });
      const data = (await res.json()) as { billing?: UserBilling; error?: string };
      if (!res.ok || !data.billing) {
        throw new Error(data.error || 'Não foi possível confirmar a assinatura Play.');
      }
      await saveBilling({
        ...data.billing,
        status: (data.billing.status as SubscriptionStatus) || 'active',
        plan: data.billing.plan === 'pro' ? 'pro' : 'free',
        provider: 'play',
      });
      return true;
    },
    [saveBilling, user],
  );

  // Restaura entitlement Play se o usuário já assinou neste dispositivo/conta Google
  useEffect(() => {
    if (!user || !playAvailable || isPro) return;
    let cancelled = false;
    void (async () => {
      try {
        const purchases = await listPlayPurchases(SUBSCRIPTION.playProductId);
        const first = purchases[0];
        if (!first || cancelled) return;
        await confirmPlayPurchase(first.purchaseToken, first.itemId);
      } catch {
        // silencioso — fallback Stripe / paywall continua
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, playAvailable, isPro, confirmPlayPurchase]);

  const startPlayCheckout = useCallback(async () => {
    if (!user) {
      setError('Faça login para assinar.');
      return;
    }
    setIsStartingCheckout(true);
    setError(null);
    try {
      const { purchaseToken, paymentResponse } = await purchasePlaySubscription(
        SUBSCRIPTION.playProductId,
      );
      try {
        await confirmPlayPurchase(purchaseToken, SUBSCRIPTION.playProductId);
        await paymentResponse.complete('success');
      } catch (err) {
        await paymentResponse.complete('fail');
        throw err;
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Falha no pagamento Google Play.');
      }
    } finally {
      setIsStartingCheckout(false);
    }
  }, [confirmPlayPurchase, user]);

  const startStripeCheckout = useCallback(
    async (householdId?: string | null) => {
      if (!user?.email) {
        setError('Faça login para assinar.');
        return;
      }
      setIsStartingCheckout(true);
      setError(null);
      try {
        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            householdId: householdId || undefined,
            displayName: user.displayName || undefined,
          }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (res.ok && data.url) {
          window.location.assign(data.url);
          return;
        }

        if (SUBSCRIPTION.paymentLinkUrl) {
          window.location.assign(SUBSCRIPTION.paymentLinkUrl);
          return;
        }

        throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
      } catch (err: unknown) {
        if (SUBSCRIPTION.paymentLinkUrl) {
          window.location.assign(SUBSCRIPTION.paymentLinkUrl);
          return;
        }
        setError(err instanceof Error ? err.message : 'Falha no checkout.');
        setIsStartingCheckout(false);
      }
    },
    [user],
  );

  const startCheckout = useCallback(
    async (householdId?: string | null) => {
      if (await isPlayBillingAvailable()) {
        await startPlayCheckout();
        return;
      }
      await startStripeCheckout(householdId);
    },
    [startPlayCheckout, startStripeCheckout],
  );

  const confirmCheckoutSession = useCallback(
    async (sessionId: string) => {
      if (!user) return false;
      setError(null);
      try {
        const res = await fetch('/api/confirm-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, uid: user.uid }),
        });
        const data = (await res.json()) as { billing?: UserBilling; error?: string };
        if (!res.ok || !data.billing) {
          throw new Error(data.error || 'Não foi possível confirmar a assinatura.');
        }
        await saveBilling({
          ...data.billing,
          status: (data.billing.status as SubscriptionStatus) || 'trialing',
          plan: data.billing.plan === 'pro' ? 'pro' : 'free',
          provider: 'stripe',
        });
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Falha ao confirmar.');
        return false;
      }
    },
    [saveBilling, user],
  );

  return {
    billing,
    isLoading,
    isPro,
    isStartingCheckout,
    playAvailable,
    error,
    clearError: () => setError(null),
    startCheckout,
    confirmCheckoutSession,
  };
}
