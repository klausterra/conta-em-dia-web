interface Env {
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = (await request.json()) as {
      email?: string;
      householdName?: string;
      inviterName?: string;
      inviteCode?: string;
    };

    const { email, householdName, inviterName, inviteCode } = body;

    if (!email || !inviteCode) {
      return new Response(JSON.stringify({ error: 'E-mail e código da casa são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Chave de envio de e-mail (RESEND_API_KEY) não configurada no servidor.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const hName = householdName || 'sua casa';
    const iName = inviterName || 'Alguém';
    const appUrl = 'https://conta-em-dia-web.pages.dev';

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para o Conta em Dia</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08100d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f3;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08100d; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #122019; border: 1px solid #1f372c; border-radius: 16px; overflow: hidden; padding: 32px 28px; text-align: center;">
          <tr>
            <td align="center">
              <div style="width: 52px; height: 52px; background-color: #10b981; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 26px;">🏠</span>
              </div>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 8px;">Você recebeu um convite!</h1>
              <p style="color: #34d399; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px;">Conta em Dia</p>
              
              <p style="color: #d1d5db; font-size: 15px; line-height: 24px; margin: 0 0 24px;">
                <strong>${iName}</strong> convidou você para fazer parte e gerenciar as contas da casa <strong>${hName}</strong> juntos.
              </p>

              <div style="background-color: #0a1410; border: 1px dashed #234334; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
                <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: 700; margin: 0 0 6px;">Código de acesso da casa</p>
                <p style="color: #34d399; font-size: 24px; font-weight: 900; letter-spacing: 4px; font-family: monospace; margin: 0;">${inviteCode}</p>
              </div>

              <a href="${appUrl}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);">
                Acessar o Conta em Dia
              </a>

              <p style="color: #6b7280; font-size: 12px; margin: 28px 0 0;">
                Casa leve, cabeça leve. Organize vencimentos sem atrasos.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Conta em Dia <contas@hipercube.ia.br>',
        to: [email],
        subject: `${iName} te convidou para a casa ${hName} no Conta em Dia`,
        html,
      }),
    });

    const resData = (await resendRes.json()) as { message?: string; id?: string };
    if (!resendRes.ok) {
      return new Response(JSON.stringify({ error: resData.message || 'Falha ao enviar e-mail pelo Resend.' }), {
        status: resendRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: resData.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno ao disparar e-mail.';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
