// api/webhooks/paypal.js — PayPal webhook handler
const admin = require('../../lib/firebaseAdmin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const event = req.body;
    const eventType = event.event_type;

    if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const resource = event.resource;
      const customerEmail = resource.payer?.email_address || resource.subscriber?.email_address || resource.purchase_units?.[0]?.payee?.email_address;
      const amountPaid = parseFloat(resource.amount?.value || resource.purchase_units?.[0]?.amount?.value || 0);

      if (!customerEmail) return res.status(400).json({ error: 'No customer email' });

      const isYearly = amountPaid >= 100;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (isYearly ? 365 : 30));

      const db = admin.firestore();
      const userSnap = await db.collection('users').where('email', '==', customerEmail).limit(1).get();
      if (userSnap.empty) return res.status(404).json({ error: 'User not found' });

      await userSnap.docs[0].ref.update({
        membershipPlan: 'Premium',
        premiumActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        premiumExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        premiumBillingCycle: isYearly ? 'yearly' : 'monthly',
        premiumPaymentProvider: 'paypal',
        premiumPaymentId: resource.id || null,
        premiumAmountPaid: amountPaid,
      });

      console.log(`Premium activated via PayPal for ${customerEmail}`);
      return res.status(200).json({ success: true });
    }

    if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED' || eventType === 'BILLING.SUBSCRIPTION.EXPIRED') {
      const email = event.resource?.subscriber?.email_address;
      if (email) {
        const db = admin.firestore();
        const snap = await db.collection('users').where('email', '==', email).limit(1).get();
        if (!snap.empty) await snap.docs[0].ref.update({ membershipPlan: 'Free' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('PayPal webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
};
