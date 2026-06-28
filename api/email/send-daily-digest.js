// =================================================================
// api/email/send-daily-digest.js — Ascivan Daily Digest
// Cron: weekdays 9 AM — includes platform updates + per-user engagement
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
    console.error('❌ Firebase Admin init failed:', err.message);
    throw err;
  }
}

const db = admin.firestore();
const SITE = 'https://ascivan.com';

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
    console.log('🌅 Starting Ascivan daily digest...');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });
    await transporter.verify();

    const oneDayAgo = subDays(new Date(), 1);
    const sevenDaysAgo = subDays(new Date(), 7);

    // Helper: safe collection fetch
    const safeFetch = async (col, dateField, since, lim = 10) => {
      try {
        const snap = await db.collection(col).where(dateField, '>=', since).orderBy(dateField, 'desc').limit(lim).get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) { console.warn(`⚠️ ${col}:`, e.message); return []; }
    };

    // Fetch platform content in parallel
    const [projects, jobs, housingPosts, financePosts, communityPosts] = await Promise.all([
      safeFetch('projects', 'createdAt', sevenDaysAgo),
      safeFetch('hub_posts', 'createdAt', oneDayAgo),
      safeFetch('housing_posts', 'createdAt', oneDayAgo),
      safeFetch('banking_posts', 'createdAt', oneDayAgo),
      safeFetch('posts', 'createdAt', oneDayAgo),
    ]);

    console.log(`📊 ${projects.length} projects, ${jobs.length} jobs, ${housingPosts.length} housing, ${financePosts.length} finance, ${communityPosts.length} posts`);

    // Get subscribed users
    const usersSnap = await db.collection('users').where('emailPreferences.dailyDigest', '==', true).get();
    const users = usersSnap.docs
      .map(d => ({ uid: d.id, email: d.data().email, displayName: d.data().displayName }))
      .filter(u => u.email?.includes('@'));

    if (users.length === 0) {
      return res.json({ success: true, message: 'No subscribers' });
    }
    console.log(`👥 ${users.length} subscribers`);

    // Per-user engagement data
    for (const user of users) {
      try {
        const notifSnap = await db.collection('notifications')
          .where('userId', '==', user.uid)
          .where('createdAt', '>=', oneDayAgo)
          .orderBy('createdAt', 'desc').limit(30).get();
        const notifs = notifSnap.docs.map(d => d.data());

        user.mentions = notifs.filter(n => n.type === 'reply_mention' || n.type === 'repost_mention');
        user.likes = notifs.filter(n => n.type === 'like');
        user.reposts = notifs.filter(n => n.type === 'repost');
        user.follows = notifs.filter(n => n.type === 'follow');
        user.badges = notifs.filter(n => n.type === 'badge_awarded');

        const convSnap = await db.collection('conversations')
          .where('participants', 'array-contains', user.uid).get();
        user.unreadMessages = 0;
        convSnap.docs.forEach(d => { user.unreadMessages += (d.data().unreadBy?.[user.uid] || 0); });
      } catch (e) {
        console.warn(`⚠️ Engagement for ${user.email}:`, e.message);
        user.mentions = []; user.likes = []; user.reposts = [];
        user.follows = []; user.badges = []; user.unreadMessages = 0;
      }
    }

    // ── Email template ───────────────────────────────────────────
    const generateEmail = (user) => {
      const name = user.displayName || user.email.split('@')[0];
      const eng = user.mentions.length + user.likes.length + user.reposts.length + user.follows.length;
      const hasEng = eng > 0 || user.unreadMessages > 0 || user.badges.length > 0;
      const hasPlatform = projects.length + jobs.length + communityPosts.length + housingPosts.length + financePosts.length > 0;

      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5;line-height:1.6}
.c{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.1)}
.hd{background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;padding:28px;text-align:center}
.hd h1{margin:0;font-size:22px}.hd p{margin:8px 0 0;font-size:13px;opacity:.9}
.ct{padding:24px}
.sc{margin-bottom:24px}.sc h2{color:#F97316;font-size:16px;border-bottom:2px solid #F97316;padding-bottom:6px;margin-bottom:14px}
.sts{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}
.st{flex:1;min-width:60px;text-align:center;background:#fff8f5;padding:10px 4px;border-radius:8px}
.sn{font-size:20px;font-weight:bold;color:#F97316}.sl{font-size:9px;color:#666;text-transform:uppercase}
.it{padding:12px;margin-bottom:8px;border-radius:8px;border-left:4px solid #F97316;background:#fff8f5}
.it h3{margin:0 0 4px;font-size:13px;color:#333}.it p{margin:0;font-size:12px;color:#666}
.eg{padding:12px;margin-bottom:8px;border-radius:8px;border-left:4px solid #22C55E;background:#f0fdf4}
.mg{padding:12px;margin-bottom:8px;border-radius:8px;border-left:4px solid #3B82F6;background:#eff6ff}
.btn{display:block;padding:12px;border-radius:8px;text-decoration:none;text-align:center;font-weight:600;font-size:13px;margin:6px 0;color:#fff;background:linear-gradient(135deg,#F97316,#EA580C)}
.ft{background:#1f2937;color:#9ca3af;padding:18px;text-align:center;font-size:11px}.ft a{color:#F97316;text-decoration:none}
</style></head><body><div class="c">
<div class="hd"><h1>🌅 Your Daily Update</h1><p>Hi ${name}! Here's what happened on Ascivan</p>
<div style="margin-top:8px;font-size:11px;opacity:.8">${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div></div>
<div class="ct">

${hasEng ? `<div class="sc"><h2>🔔 Your Activity</h2>
<div class="sts">
<div class="st"><div class="sn">${user.mentions.length}</div><div class="sl">Mentions</div></div>
<div class="st"><div class="sn">${user.likes.length}</div><div class="sl">Likes</div></div>
<div class="st"><div class="sn">${user.reposts.length}</div><div class="sl">Reposts</div></div>
<div class="st"><div class="sn">${user.follows.length}</div><div class="sl">Followers</div></div>
<div class="st"><div class="sn">${user.unreadMessages}</div><div class="sl">Messages</div></div>
</div>
${user.mentions.slice(0,3).map(m=>`<div class="eg"><p>💬 <b>${m.mentionedByName||'Someone'}</b> mentioned you</p></div>`).join('')}
${user.follows.length>0?`<div class="eg"><p>👥 <b>${user.follows.length}</b> new follower${user.follows.length>1?'s':''}</p></div>`:''}
${user.likes.length>0?`<div class="eg"><p>❤️ Your posts got <b>${user.likes.length} like${user.likes.length>1?'s':''}</b></p></div>`:''}
${user.reposts.length>0?`<div class="eg"><p>🔄 Your posts were reposted <b>${user.reposts.length} time${user.reposts.length>1?'s':''}</b></p></div>`:''}
${user.unreadMessages>0?`<div class="mg"><p>✉️ <b>${user.unreadMessages} unread message${user.unreadMessages>1?'s':''}</b></p></div>`:''}
${user.badges.length>0?`<div class="eg" style="border-left-color:#EAB308"><p>🏆 You earned <b>${user.badges.length} badge${user.badges.length>1?'s':''}</b>!</p></div>`:''}
<a href="${SITE}/notifications" class="btn" style="background:linear-gradient(135deg,#22C55E,#16A34A)">View All Activity</a>
</div>`:''}

${projects.length>0?`<div class="sc"><h2>🚀 New Projects</h2>
${projects.slice(0,3).map(p=>`<div class="it"><h3>${p.projectTitle||'Project'}</h3><p>${(p.projectDescription||'').substring(0,100)}${(p.projectDescription||'').length>100?'...':''}</p></div>`).join('')}
${projects.length>3?`<p style="color:#666;font-size:11px;text-align:center">+ ${projects.length-3} more</p>`:''}
<a href="${SITE}/projects" class="btn">Browse Projects</a></div>`:''}

${jobs.length>0?`<div class="sc"><h2>💼 New Jobs</h2>
${jobs.slice(0,3).map(j=>`<div class="it"><h3>${j.title||'Job'}</h3><p>${j.companyName||''} ${j.location?'• '+j.location:''}</p></div>`).join('')}
<a href="${SITE}/jobs" class="btn">View Jobs</a></div>`:''}

${communityPosts.length>0?`<div class="sc"><h2>💬 Community</h2>
${communityPosts.slice(0,3).map(p=>`<div class="it" style="border-left-color:#8B5CF6"><h3>${p.authorName||'Someone'} posted</h3><p>${(p.content||'').substring(0,80)}...</p></div>`).join('')}
<a href="${SITE}/community" class="btn" style="background:linear-gradient(135deg,#8B5CF6,#7C3AED)">View Community</a></div>`:''}

${housingPosts.length>0?`<div class="sc"><h2>🏠 Housing</h2>
${housingPosts.slice(0,2).map(h=>`<div class="it" style="border-left-color:#3B82F6"><h3>${h.title||'Listing'}</h3><p>${h.city||''}</p></div>`).join('')}
<a href="${SITE}/housing" class="btn" style="background:linear-gradient(135deg,#3B82F6,#2563EB)">Browse Housing</a></div>`:''}

${financePosts.length>0?`<div class="sc"><h2>💰 Finance</h2>
${financePosts.slice(0,2).map(f=>`<div class="it" style="border-left-color:#22C55E"><h3>${f.title||'Resource'}</h3><p>${f.category||f.serviceType||''}</p></div>`).join('')}
<a href="${SITE}/finance" class="btn" style="background:linear-gradient(135deg,#22C55E,#16A34A)">View Resources</a></div>`:''}

${!hasEng&&!hasPlatform?`<div style="text-align:center;padding:24px;background:#f9fafb;border-radius:10px;margin:16px 0">
<div style="font-size:36px;margin-bottom:10px">🌟</div>
<h3 style="color:#333;margin:0 0 6px;font-size:15px">Quiet day on Ascivan</h3>
<p style="color:#666;font-size:12px;margin:0">A perfect time to explore or connect with the community!</p></div>`:''}

<div class="sc"><h2>⚡ Quick Links</h2>
<a href="${SITE}/dashboard" class="btn">Dashboard</a>
<a href="${SITE}/messages" class="btn" style="background:linear-gradient(135deg,#3B82F6,#2563EB)">Messages</a></div>

</div>
<div class="ft"><p><b>Ascivan</b></p><p><a href="${SITE}/dashboard">Dashboard</a> · <a href="${SITE}/community">Community</a></p>
<p style="margin-top:6px">Daily digest · ${new Date().getFullYear()} Ascivan</p></div>
</div></body></html>`;
    };

    // Send emails
    let successful = 0, failed = 0;
    for (const user of users) {
      try {
        const eng = user.mentions.length + user.likes.length + user.reposts.length + user.follows.length + user.unreadMessages;
        const subj = eng > 0
          ? `🔔 ${eng} new activities — Ascivan Daily ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})}`
          : `🌅 Ascivan Daily Update — ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})}`;
        await transporter.sendMail({ from: { name: 'Ascivan', address: process.env.EMAIL_USER }, to: user.email, subject: subj, html: generateEmail(user) });
        successful++;
      } catch (err) { console.error(`❌ ${user.email}:`, err.message); failed++; }
    }
    transporter.close();

    try { await db.collection('email_logs').add({ type: 'daily_digest', timestamp: new Date(), stats: { recipients: users.length, successful, failed } }); } catch (_) {}

    console.log(`🎉 Daily digest: ${successful} sent, ${failed} failed`);
    return res.json({ success: true, stats: { recipients: users.length, successful, failed } });

  } catch (error) {
    console.error('💥 Daily digest error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
