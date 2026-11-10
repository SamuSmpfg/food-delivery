import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP não configurado. Faltando:', {
      SMTP_HOST: !!SMTP_HOST,
      SMTP_USER: !!SMTP_USER,
      SMTP_PASS: !!SMTP_PASS,
    });
    return null;
  }

  const port = Number(SMTP_PORT) || 465;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  transporter.verify((error) => {
    if (error) {
      console.error('Falha ao conectar no SMTP:', error.message);
    } else {
      console.log('SMTP pronto para enviar emails');
    }
  });

  return transporter;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendMail({ to, subject, text, html }) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(`SMTP não configurado: email para ${to} não foi enviado.`);
    return false;
  }

  try {
    const info = await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    console.log(`Email enviado para ${to}:`, info.messageId, info.response);
    return true;
  } catch (error) {
    console.error(`Erro ao enviar email para ${to}:`, error.message);
    return false;
  }
}