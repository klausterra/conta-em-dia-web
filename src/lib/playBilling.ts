/** Google Play Billing via Digital Goods API (TWA only). */

export const PLAY_BILLING_METHOD = 'https://play.google.com/billing';

type DigitalGoodsService = {
  getDetails: (itemIds: string[]) => Promise<
    Array<{
      itemId: string;
      title: string;
      description: string;
      price: { currency: string; value: string };
    }>
  >;
  listPurchases: () => Promise<Array<{ itemId: string; purchaseToken: string }>>;
  listPurchaseHistory?: () => Promise<Array<{ itemId: string; purchaseToken: string }>>;
};

declare global {
  interface Window {
    getDigitalGoodsService?: (paymentMethod: string) => Promise<DigitalGoodsService>;
  }
}

export async function getPlayBillingService(): Promise<DigitalGoodsService | null> {
  if (typeof window === 'undefined' || typeof window.getDigitalGoodsService !== 'function') {
    return null;
  }
  try {
    return await window.getDigitalGoodsService(PLAY_BILLING_METHOD);
  } catch {
    return null;
  }
}

export async function isPlayBillingAvailable(): Promise<boolean> {
  return (await getPlayBillingService()) !== null;
}

export async function purchasePlaySubscription(sku: string): Promise<{
  purchaseToken: string;
  paymentResponse: PaymentResponse;
}> {
  const paymentMethods: PaymentMethodData[] = [
    {
      supportedMethods: PLAY_BILLING_METHOD,
      data: { sku },
    },
  ];

  // Play ignora total/amount — exigido só pela Payment Request API
  const paymentDetails: PaymentDetailsInit = {
    total: {
      label: 'Total',
      amount: { currency: 'BRL', value: '0' },
    },
  };

  const request = new PaymentRequest(paymentMethods, paymentDetails);
  const paymentResponse = await request.show();
  const details = paymentResponse.details as { purchaseToken?: string; token?: string };
  const purchaseToken = details.purchaseToken || details.token;
  if (!purchaseToken) {
    await paymentResponse.complete('fail');
    throw new Error('Play Billing não retornou purchaseToken.');
  }
  return { purchaseToken, paymentResponse };
}

export async function listPlayPurchases(sku?: string) {
  const service = await getPlayBillingService();
  if (!service) return [];
  const purchases = await service.listPurchases();
  if (!sku) return purchases;
  return purchases.filter((p) => p.itemId === sku);
}
