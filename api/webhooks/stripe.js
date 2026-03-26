// api/webhooks/stripe.js — Stripe webhook handler
const admin = require('../../lib/firebaseAdmin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const event = req.body;

    if (event.type === 'checkout.session.completed' || event.type === 'payment_link.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_email || session.customer_details?.email;
      const amountPaid = (session.amount_total || 0) / 100;

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
        premiumPaymentProvider: 'stripe',
        premiumPaymentId: session.id || null,
        premiumAmountPaid: amountPaid,
      });

      console.log(`Premium activated for ${customerEmail} (${isYearly ? 'yearly' : 'monthly'})`);
      return res.status(200).json({ success: true });
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const email = sub.metadata?.email;
      if (email) {
        const db = admin.firestore();
        const snap = await db.collection('users').where('email', '==', email).limit(1).get();
        if (!snap.empty) await snap.docs[0].ref.update({ membershipPlan: 'Free' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
};
