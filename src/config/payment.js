// src/config/payment.js — Payment configuration
// Replace these URLs with your actual Stripe/PayPal payment links when ready

export const PAYMENT_CONFIG = {
  // Set to true when payment links are ready
  enabled: false,

  // Stripe Payment Links (create at https://dashboard.stripe.com/payment-links)
  stripe: {
    yearly: 'https://buy.stripe.com/YOUR_YEARLY_LINK_HERE',
    monthly: 'https://buy.stripe.com/YOUR_MONTHLY_LINK_HERE',
  },

  // PayPal Payment Links (create at https://www.paypal.com/buttons)
  paypal: {
    yearly: 'https://www.paypal.com/YOUR_YEARLY_LINK_HERE',
    monthly: 'https://www.paypal.com/YOUR_MONTHLY_LINK_HERE',
  },

  // Webhook secret keys (set as environment variables on Vercel)
  // STRIPE_WEBHOOK_SECRET=whsec_xxxxx
  // PAYPAL_WEBHOOK_ID=xxxxx

  // Success redirect URL (Stripe/PayPal will redirect here after payment)
  successUrl: 'https://loomiqe.com/premium-success',

  pricing: {
    yearly: 200,
    monthly: 20,
  },
};
