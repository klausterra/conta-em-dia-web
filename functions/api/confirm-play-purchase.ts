import { getPlayAccessToken, parseServiceAccount } from '../lib/playAuth';

interface Env {
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?: string;
  PLAY_PACKAGE_NAME?: string;
  PLAY_PRODUCT_ID?: string;
}

const DEFAULT_PACKAGE = 'br.com.contaemdia.app';
const DEFAULT_PRODUCT = 'pro_familia';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

type SubPurchase = {
  kind?: string;
  startTimeMillis?: string;
  expiryTimeMillis?: string;
  autoRenewing?: boolean;
  paymentState?: number;
  acknowledgementState?: number;
  orderId?: string;
  cancelReason?: number;
  error?: { message?: string; status?: string };
};

function mapBilling(sub: SubPurchase, productId: string, purchaseToken: string) {
  const expiryMs = sub.expiryTimeMillis ? Number(sub.expiryTimeMillis) : NaN;
  const active = Number.isFinite(expiryMs) && expiryMs > Date.now();

  // paymentState: 1 = received, 2 = free trial
  const isTrial = sub.paymentState === 2;
  const status = !active ? 'canceled' : isTrial ? 'trialing' : 'active';
  const plan = active ? 'pro' : 'free';

  return {
    status,
    plan,
    provider: 'play' as const,
    playPurchaseToken: purchaseToken,
    playProductId: productId,
    trialEndsAt: isTrial && Number.isFinite(expiryMs) ? new Date(expiryMs).toISOString() : null,
    currentPeriodEnd: Number.isFinite(expiryMs) ? new Date(expiryMs).toISOString() : null,
    updatedAt: new Date().toISOString(),
  };
}

export async function onRequest(context: EventContext<Env, string, unknown>) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return json(null, 204);
  }

  if (request.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405);
  }

  const saRaw = env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!saRaw) {
    return json(
      {
        error:
          'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON não configurada no Cloudflare Pages. Crie uma service account com acesso à Play Console e cole o JSON nos secrets.',
      },
      500,
    );
  }

  try {
    const body = (await request.json()) as {
      uid?: string;
      purchaseToken?: string;
      productId?: string;
    };

    if (!body.uid || !body.purchaseToken) {
      return json({ error: 'uid e purchaseToken são obrigatórios.' }, 400);
    }

    const packageName = env.PLAY_PACKAGE_NAME || DEFAULT_PACKAGE;
    const productId = body.productId || env.PLAY_PRODUCT_ID || DEFAULT_PRODUCT;
    const sa = parseServiceAccount(saRaw);
    const accessToken = await getPlayAccessToken(sa);

    const getUrl =
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
      `${encodeURIComponent(packageName)}/purchases/subscriptions/` +
      `${encodeURIComponent(productId)}/tokens/${encodeURIComponent(body.purchaseToken)}`;

    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const sub = (await getRes.json()) as SubPurchase;
    if (!getRes.ok) {
      return json(
        { error: sub.error?.message || `Play API ${getRes.status}: compra inválida.` },
        getRes.status >= 400 ? getRes.status : 502,
      );
    }

    // Acknowledge se ainda não foi
    if (sub.acknowledgementState === 0) {
      const ackUrl = `${getUrl}:acknowledge`;
      const ackRes = await fetch(ackUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
      if (!ackRes.ok && ackRes.status !== 400) {
        const ackErr = (await ackRes.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        return json(
          { error: ackErr.error?.message || 'Falha ao acknowledge da compra Play.' },
          502,
        );
      }
    }

    return json({
      billing: mapBilling(sub, productId, body.purchaseToken),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao confirmar compra Play.';
    return json({ error: message }, 500);
  }
}
