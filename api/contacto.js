export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { nombre, empresa, email, telefono, equipos, mensaje } = req.body;

  // Validación básica
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Formulario Web <no-reply@cmcsystems.com.ar>',
        to: ['contacto@cmcsystems.com.ar'],
        reply_to: email,
        subject: `Nueva consulta web de ${nombre}${empresa ? ` (${empresa})` : ''}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:8px;">
            <h2 style="color:#0A0F1C;margin-top:0;">Nueva consulta desde cmcsystems.com.ar</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:bold;color:#555;width:140px;">Nombre</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#222;">${nombre}</td>
              </tr>
              ${empresa ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:bold;color:#555;">Empresa</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#222;">${empresa}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:bold;color:#555;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;"><a href="mailto:${email}" style="color:#0D6EFD;">${email}</a></td>
              </tr>
              ${telefono ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:bold;color:#555;">Teléfono</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#222;">${telefono}</td>
              </tr>` : ''}
              ${equipos ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:bold;color:#555;">Equipos</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#222;">${equipos}</td>
              </tr>` : ''}
            </table>
            <div style="margin-top:24px;">
              <p style="font-weight:bold;color:#555;margin-bottom:8px;">Mensaje:</p>
              <p style="color:#222;background:#fff;padding:16px;border-left:4px solid #0D6EFD;border-radius:4px;margin:0;">${mensaje.replace(/\n/g, '<br>')}</p>
            </div>
            <p style="margin-top:32px;font-size:12px;color:#aaa;">Este email fue generado automáticamente desde el formulario de contacto de cmcsystems.com.ar</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Error al enviar el email' });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
