interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID?: string;
  APP_URL?: string;
}

const DEFAULT_PRICE_ID = 'price_1UDoMp0VvDGRmDulWyj2aMya';
const DEFAULT_APP_URL = 'https://conta-em-dia-web.pages.dev';
const TRIAL_DAYS = 7;

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

async function stripeForm(secret: string, path: string, params: Record<string, string>) {
  const body = new URLSearchParams(params);
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const data = (await res.json()) as Record<string, unknown> & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data.error?.message || `Stripe error (${res.status})`);
  }
  return data;
}

export async function onRequest(context: EventContext<Env, string, unknown>) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return json(null, 204);
  }

  if (request.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405);
  }

  const secret = env.STRIPE_SECRET_KEY;
  if (!secret) {
    return json(
      { error: 'STRIPE_SECRET_KEY não configurada no Cloudflare Pages.' },
      500,
    );
  }

  try {
    const body = (await request.json()) as {
      uid?: string;
      email?: string;
      householdId?: string;
      displayName?: string;
    };

    if (!body.uid || !body.email) {
      return json({ error: 'uid e email são obrigatórios.' }, 400);
    }

    const appUrl = (env.APP_URL || DEFAULT_APP_URL).replace(/\/$/, '');
    const priceId = env.STRIPE_PRICE_ID || DEFAULT_PRICE_ID;

    const session = await stripeForm(secret, 'checkout/sessions', {
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: `${appUrl}/?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?billing=cancel`,
      customer_email: body.email,
      client_reference_id: body.uid,
      'subscription_data[trial_period_days]': String(TRIAL_DAYS),
      'subscription_data[metadata][uid]': body.uid,
      'subscription_data[metadata][householdId]': body.householdId || '',
      'subscription_data[metadata][app]': 'conta-em-dia',
      'metadata[uid]': body.uid,
      'metadata[householdId]': body.householdId || '',
      'metadata[app]': 'conta-em-dia',
      allow_promotion_codes: 'true',
      locale: 'pt-BR',
    });

    return json({
      url: session.url,
      id: session.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao criar checkout.';
    return json({ error: message }, 500);
  }
}
