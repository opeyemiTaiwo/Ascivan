// =================================================================
// api/email/send-weekly-digest.js — Loomiqe Weekly Digest
// Cron: Sundays 9 AM. A clean, professional weekly summary.
// =================================================================

const nodemailer = require('nodemailer');
const { subDays } = require('date-fns');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || 'loomiq-8c3e9',
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      projectId: process.env.FIREBASE_PROJECT_ID || 'loomiq-8c3e9',
    });
  } catch (err) {
    console.error('Firebase Admin init failed:', err.message);
    throw err;
  }
}

const db = admin.firestore();
const SITE = 'https://loomiqe.com';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const isVercelCron = req.headers['x-vercel-cron'] || req.headers['user-agent']?.includes('vercel');
  const isDev = process.env.NODE_ENV === 'development' || req.headers.host?.includes('localhost');
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validKey = process.env.DAILY_DIGEST_API_KEY;
  if (!isDev && !isVercelCron && validKey && apiKey !== validKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting Loomiqe weekly digest...');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });
    await transporter.verify();

    const sevenDaysAgo = subDays(new Date(), 7);

    const safeFetch = async (col, dateField, since, lim = 20) => {
      try {
        const snap = await db.collection(col).where(dateField, '>=', since).orderBy(dateField, 'desc').limit(lim).get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) { console.warn(`${col}:`, e.message); return []; }
    };

    const safeCount = async (col, dateField, since) => {
      try {
        const snap = await db.collection(col).where(dateField, '>=', since).get();
        return snap.size;
      } catch (e) { return 0; }
    };

    // Fetch this week's platform content (only what Loomiqe actually has).
    const [projects, jobs] = await Promise.all([
      safeFetch('projects', 'createdAt', sevenDaysAgo),
      safeFetch('hub_posts', 'createdAt', sevenDaysAgo),
    ]);
    const newMembersCount = await safeCount('users', 'createdAt', sevenDaysAgo);

    console.log(`Week: ${projects.length} projects, ${jobs.length} jobs, ${newMembersCount} new members`);

    // Subscribers (weekly digest opt-in, fall back to daily).
    const usersSnap = await db.collection('users').where('emailPreferences.weeklyDigest', '==', true).get();
    let users = usersSnap.docs
      .map(d => ({ uid: d.id, email: d.data().email, displayName: d.data().displayName }))
      .filter(u => u.email?.includes('@'));

    if (users.length === 0) {
      const fallbackSnap = await db.collection('users').where('emailPreferences.dailyDigest', '==', true).get();
      users = fallbackSnap.docs
        .map(d => ({ uid: d.id, email: d.data().email, displayName: d.data().displayName }))
        .filter(u => u.email?.includes('@'));
      if (users.length === 0) {
        return res.json({ success: true, message: 'No subscribers' });
      }
    }
    console.log(`${users.length} weekly subscribers`);

    // Per-user weekly activity — only Loomiqe's real notification types.
    for (const user of users) {
      try {
        const notifSnap = await db.collection('notifications')
          .where('userId', '==', user.uid)
          .where('createdAt', '>=', sevenDaysAgo)
          .orderBy('createdAt', 'desc').limit(100).get();
        const notifs = notifSnap.docs.map(d => d.data());

        user.applications = notifs.filter(n => n.type === 'project_application');
        user.approvals = notifs.filter(n => n.type === 'application_approved');
        user.badges = notifs.filter(n => n.type === 'project_completed' || n.type === 'badge_awarded');

        const convSnap = await db.collection('conversations')
          .where('participants', 'array-contains', user.uid).get();
        user.unreadMessages = 0;
        convSnap.docs.forEach(d => { user.unreadMessages += (d.data().unreadBy?.[user.uid] || 0); });
      } catch (e) {
        user.applications = []; user.approvals = []; user.badges = []; user.unreadMessages = 0;
      }
    }

    // ── Weekly email template (clean, on-brand, no emojis) ──────────
    const generateEmail = (user) => {
      const name = user.displayName || user.email.split('@')[0];
      const weekStart = subDays(new Date(), 7).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const weekEnd = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const totalActivity = user.applications.length + user.approvals.length + user.badges.length + user.unreadMessages;

      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5;line-height:1.6;color:#111827}
.c{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.08)}
.hd{background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;padding:28px;text-align:center}
.hd h1{margin:0;font-size:21px}.hd p{margin:8px 0 0;font-size:13px;opacity:.95}
.ct{padding:24px}
.sc{margin-bottom:24px}.sc h2{color:#EA580C;font-size:15px;border-bottom:2px solid #F97316;padding-bottom:6px;margin-bottom:14px}
.sts{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}
.st{flex:1;min-width:80px;text-align:center;background:#fff7ed;padding:12px 4px;border-radius:8px}
.sn{font-size:22px;font-weight:bold;color:#EA580C}.sl{font-size:9px;color:#666;text-transform:uppercase;letter-spacing:.04em}
.it{padding:12px;margin-bottom:8px;border-radius:8px;border-left:4px solid #F97316;background:#fff8f5}
.it h3{margin:0 0 4px;font-size:13px;color:#111827}.it p{margin:0;font-size:12px;color:#666}
.btn{display:block;padding:12px;border-radius:8px;text-decoration:none;text-align:center;font-weight:600;font-size:13px;margin:6px 0;color:#fff;background:linear-gradient(135deg,#F97316,#EA580C)}
.btn.blue{background:linear-gradient(135deg,#3B82F6,#2563EB)}
.ft{background:#1f2937;color:#9ca3af;padding:18px;text-align:center;font-size:11px}.ft a{color:#F97316;text-decoration:none}
</style></head><body><div class="c">
<div class="hd"><h1>Your Weekly Recap</h1><p>Hi ${name}, here is your week on Loomiqe</p>
<div style="margin-top:8px;font-size:11px;opacity:.85">${weekStart} to ${weekEnd}</div></div>
<div class="ct">

<div class="sc"><h2>Your Week in Numbers</h2>
<div class="sts">
<div class="st"><div class="sn">${user.applications.length}</div><div class="sl">Applications</div></div>
<div class="st"><div class="sn">${user.approvals.length}</div><div class="sl">Approvals</div></div>
<div class="st"><div class="sn">${user.badges.length}</div><div class="sl">Badges</div></div>
<div class="st"><div class="sn">${user.unreadMessages}</div><div class="sl">Messages</div></div>
</div>
${user.unreadMessages > 0 ? `<div class="it" style="border-left-color:#3B82F6;background:#eff6ff"><p>You have <b>${user.unreadMessages} unread message${user.unreadMessages>1?'s':''}</b> waiting.</p></div>` : ''}
${user.badges.length > 0 ? `<div class="it" style="border-left-color:#22C55E;background:#f0fdf4"><p>You earned <b>${user.badges.length} badge${user.badges.length>1?'s':''}</b> this week. Well done.</p></div>` : ''}
${totalActivity === 0 ? `<p style="color:#666;font-size:12px;text-align:center">A quiet week. Join a project or share a Proof Wall update to get going.</p>` : ''}
<a href="${SITE}/notifications" class="btn">View all activity</a>
</div>

<div class="sc"><h2>Platform This Week</h2>
<div class="sts">
<div class="st"><div class="sn">${projects.length}</div><div class="sl">New Projects</div></div>
<div class="st"><div class="sn">${jobs.length}</div><div class="sl">New Jobs</div></div>
<div class="st"><div class="sn">${newMembersCount}</div><div class="sl">New Members</div></div>
</div></div>

${projects.length > 0 ? `<div class="sc"><h2>New Projects to Join</h2>
${projects.slice(0,5).map(p => `<div class="it">
<h3>${p.projectTitle || 'Project'}</h3>
<p>${(p.projectDescription || '').substring(0, 90)}${(p.projectDescription||'').length > 90 ? '...' : ''}</p>
</div>`).join('')}
<a href="${SITE}/projects" class="btn">Browse projects</a></div>` : ''}

${jobs.length > 0 ? `<div class="sc"><h2>New Jobs</h2>
${jobs.slice(0,4).map(j => `<div class="it">
<h3>${j.title || 'Job'}</h3>
<p>${j.companyName || ''}${j.location ? ' · ' + j.location : ''}</p>
</div>`).join('')}
<a href="${SITE}/jobs" class="btn">View all jobs</a></div>` : ''}

<div class="sc"><h2>Quick Links</h2>
<a href="${SITE}/proof-wall" class="btn">Proof Wall</a>
<a href="${SITE}/messages" class="btn blue">Messages</a>
<a href="${SITE}/talent-board" class="btn">Talent Board</a></div>

</div>
<div class="ft"><p><b>Loomiqe</b></p><p><a href="${SITE}/proof-wall">Proof Wall</a> · <a href="${SITE}/projects">Projects</a> · <a href="${SITE}/settings">Email settings</a></p>
<p style="margin-top:6px">Weekly digest · ${new Date().getFullYear()} Loomiqe</p></div>
</div></body></html>`;
    };

    // Send emails
    let successful = 0, failed = 0;
    for (const user of users) {
      try {
        const eng = user.applications.length + user.approvals.length + user.badges.length + user.unreadMessages;
        const range = `${subDays(new Date(),7).toLocaleDateString('en-US',{month:'short',day:'numeric'})} to ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})}`;
        const subj = eng > 0
          ? `Your Loomiqe week: ${eng} update${eng>1?'s':''} (${range})`
          : `Your Loomiqe weekly recap (${range})`;
        await transporter.sendMail({ from: { name: 'Loomiqe', address: process.env.EMAIL_USER }, to: user.email, subject: subj, html: generateEmail(user) });
        successful++;
      } catch (err) { console.error(`${user.email}:`, err.message); failed++; }
    }
    transporter.close();

    try { await db.collection('email_logs').add({ type: 'weekly_digest', timestamp: new Date(), stats: { recipients: users.length, successful, failed } }); } catch (_) {}

    console.log(`Weekly digest: ${successful} sent, ${failed} failed`);
    return res.json({ success: true, stats: { recipients: users.length, successful, failed } });

  } catch (error) {
    console.error('Weekly digest error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
