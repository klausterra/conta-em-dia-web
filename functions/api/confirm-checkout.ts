interface Env {
  STRIPE_SECRET_KEY: string;
}

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

function isoFromUnix(seconds: unknown): string | null {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
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
    return json({ error: 'STRIPE_SECRET_KEY não configurada.' }, 500);
  }

  try {
    const body = (await request.json()) as { sessionId?: string; uid?: string };
    if (!body.sessionId || !body.uid) {
      return json({ error: 'sessionId e uid são obrigatórios.' }, 400);
    }

    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(body.sessionId)}?expand[]=subscription`,
      {
        headers: { Authorization: `Bearer ${secret}` },
      },
    );
    const session = (await res.json()) as {
      error?: { message?: string };
      client_reference_id?: string;
      metadata?: { uid?: string };
      customer?: string;
      subscription?:
        | string
        | {
            id: string;
            status: string;
            trial_end?: number | null;
            current_period_end?: number;
          };
      status?: string;
    };

    if (!res.ok) {
      return json({ error: session.error?.message || 'Sessão inválida.' }, res.status);
    }

    const sessionUid = session.client_reference_id || session.metadata?.uid;
    if (!sessionUid || sessionUid !== body.uid) {
      return json({ error: 'Sessão não pertence a este usuário.' }, 403);
    }

    const sub = typeof session.subscription === 'object' ? session.subscription : null;
    const status = (sub?.status || 'none') as string;
    const plan = status === 'active' || status === 'trialing' ? 'pro' : 'free';

    return json({
      billing: {
        status,
        plan,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
        stripeSubscriptionId: sub?.id,
        trialEndsAt: isoFromUnix(sub?.trial_end ?? null),
        currentPeriodEnd: isoFromUnix(sub?.current_period_end ?? null),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao confirmar checkout.';
    return json({ error: message }, 500);
  }
}
