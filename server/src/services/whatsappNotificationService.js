import config from '../config/index.js';
import logger from '../utils/logger.js';

const EVENT_TEMPLATES = {
  orderConfirmed: 'orderConfirmedTemplateName',
  orderShipped: 'orderShippedTemplateName',
  returnCreated: 'returnCreatedTemplateName',
};

const cleanParameter = (value) => String(value ?? '')
  .replace(/[\r\n\t]/g, ' ')
  .trim()
  .slice(0, 200);

const notificationComponents = (event, order) => {
  const orderId = cleanParameter(order.orderId || order.id);
  if (event === 'orderConfirmed') {
    // Matches the supplied order confirmation template exactly:
    // Hi {{text}}, order number {{text}}, estimated delivery {{date}},
    // followed by a dynamic "View order details" URL button.
    return [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: cleanParameter(order.userName) },
          { type: 'text', text: orderId },
          { type: 'date_time', date_time: { fallback_value: cleanParameter(order.estimatedDelivery) } },
        ],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: String(config.whatsapp.orderDetailsUrlButtonIndex),
        // This is appended to the URL prefix approved in Meta (for example,
        // https://shop.example.com/orders/{{1}}). Keep it non-sensitive.
        parameters: [{ type: 'text', text: encodeURIComponent(orderId) }],
      },
    ];
  }
  if (event === 'orderShipped') {
    return [{ type: 'body', parameters: [
      { type: 'text', text: orderId },
      { type: 'text', text: cleanParameter(order.trackingNumber || 'will be shared shortly') },
      { type: 'text', text: cleanParameter(order.estimatedDelivery) },
    ] }];
  }
  return [{ type: 'body', parameters: [
    { type: 'text', text: orderId },
    { type: 'text', text: cleanParameter(order.returnStatus || 'Your return request has been created') },
  ] }];
};

/**
 * Sends a pre-approved Meta WhatsApp utility template. It deliberately never
 * falls back to free-form marketing text, which keeps post-purchase messaging
 * within WhatsApp's template policy and protects user contact data.
 */
export const sendOrderWhatsAppNotification = async (event, order) => {
  const templateName = config.whatsapp[EVENT_TEMPLATES[event]];
  const phone = String(order.userPhone || order.deliveryAddress?.mobile || '').replace(/\D/g, '');
  if (!templateName) {
    logger.warn(`WhatsApp ${event} notification skipped: template is not configured.`);
    return { status: 'skipped', reason: 'template_not_configured' };
  }
  if (phone.length !== 12 || !phone.startsWith('91')) {
    logger.warn(`WhatsApp ${event} notification skipped: order has no valid Indian WhatsApp number.`);
    return { status: 'skipped', reason: 'invalid_phone' };
  }
  if (!config.whatsapp.accessToken || !config.whatsapp.phoneNumberId) {
    logger.warn(`WhatsApp ${event} notification skipped: Meta credentials are not configured.`);
    return { status: 'skipped', reason: 'meta_not_configured' };
  }

  const response = await fetch(`https://graph.facebook.com/${config.whatsapp.graphApiVersion}/${config.whatsapp.phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.whatsapp.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: config.whatsapp.templateLanguageCode },
        components: notificationComponents(event, order),
      },
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    logger.error(`WhatsApp ${event} notification failed: ${payload?.error?.message || response.statusText}`);
    return { status: 'failed', reason: 'meta_rejected' };
  }
  return { status: 'sent', messageId: payload?.messages?.[0]?.id || null };
};

export default { sendOrderWhatsAppNotification };
