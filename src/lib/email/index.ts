import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || 'support@suidhagaa.com';
export const SENDER_EMAIL =
  process.env.SENDER_EMAIL || `SuiDhagaa <${SUPPORT_EMAIL}>`;

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Universal email dispatcher
 */
export async function sendEmail({
  to,
  subject,
  html,
  replyTo = SUPPORT_EMAIL,
}: SendEmailParams) {
  if (!resend) {
    console.warn(
      `[Email Service] RESEND_API_KEY is not set. Simulated sending email to ${to} with subject: "${subject}"`
    );
    return {
      success: false,
      simulated: true,
      reason: 'RESEND_API_KEY_MISSING',
    };
  }

  try {
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
      replyTo,
    });

    return { success: true, id: result.data?.id };
  } catch (error: any) {
    console.error('[Email Service] Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Customer Order Confirmation Email Template
 */
export function generateOrderConfirmationHtml(order: {
  orderNumber: string;
  customerName: string;
  items: Array<{ title: string; price: number; quantity?: number }>;
  totalAmount: number;
  deliveryAddress?: string;
}) {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #1e293b;">${item.title}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #1e293b; text-align: right; font-weight: bold;">
          PKR ${Number(item.price).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f5; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eae5df; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #7E153A; padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: #fecdd3; margin: 6px 0 0 0; font-size: 13px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 12px; }
        .lead { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
        .card { background: #fdfaf7; border: 1px solid #f1eae2; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; }
        .footer a { color: #7E153A; text-decoration: none; font-weight: bold; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #ecfdf5; color: #047857; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>TailorLink.pk</h1>
          <p>Bespoke Tailoring & Digital Atelier</p>
        </div>
        <div class="content">
          <div class="greeting">Assalam-o-Alaikum, ${order.customerName}!</div>
          <p class="lead">Thank you for trusting TailorLink with your bespoke wardrobe. We have received your order <strong>#${order.orderNumber}</strong> and our master master-cutters are preparing your garment files.</p>
          
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 13px; font-weight: bold; color: #64748b; text-transform: uppercase;">Order Summary</span>
              <span class="badge">Confirmed</span>
            </div>
            <table class="table">
              ${itemsRows}
              <tr>
                <td style="padding: 12px; font-size: 15px; font-weight: bold; color: #0f172a;">Total Payable</td>
                <td style="padding: 12px; font-size: 16px; font-weight: 900; color: #7E153A; text-align: right;">
                  PKR ${Number(order.totalAmount).toLocaleString()}
                </td>
              </tr>
            </table>
          </div>

          ${
            order.deliveryAddress
              ? `
            <div style="font-size: 13px; color: #64748b; margin-bottom: 24px;">
              <strong>Delivery Destination:</strong> ${order.deliveryAddress}
            </div>
          `
              : ''
          }

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Need adjustments or custom styling specifications? Simply reply directly to this email or reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #7E153A; font-weight: bold;">${SUPPORT_EMAIL}</a>.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} TailorLink.pk. All rights reserved.</p>
          <p>For support, email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
