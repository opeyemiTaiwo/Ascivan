// =================================================================
// VERCEL-COMPATIBLE: api/email/send-daily-digest.js
// =================================================================

const nodemailer = require('nodemailer');
const { subDays } = require('date-fns');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: "favored-online-f3e8b",
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "favored-online-f3e8b"
    });

    console.log('✅ Firebase Admin initialized for daily digest');
  } catch (initError) {
    console.error('❌ Firebase Admin initialization failed:', initError.message);
    throw new Error('Firebase configuration error');
  }
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
  // Enhanced CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔥 VERCEL CRON AUTHENTICATION (Updated for Vercel limitations)
  const isVercelCron = req.headers['x-vercel-cron'] || 
                      req.headers['user-agent']?.includes('vercel') ||
                      req.headers['x-forwarded-host']?.includes('vercel.app');
  
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.DAILY_DIGEST_API_KEY || 'favored-daily-2025';
  
  // Skip API key for localhost/development or Vercel cron
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       req.headers.host?.includes('localhost') ||
                       req.headers.host?.includes('127.0.0.1');

  // 🔥 Allow Vercel cron jobs without API key
  if (!isDevelopment && !isVercelCron && (!apiKey || apiKey !== validApiKey)) {
    console.log('❌ Unauthorized daily digest access attempt');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    return res.status(401).json({ 
      error: 'Unauthorized - API key required or Vercel cron expected',
      hint: 'Add x-api-key header or ?apiKey=... parameter'
    });
  }

  console.log('✅ Daily digest access authorized', { 
    isVercelCron, 
    hasApiKey: !!apiKey,
    isDevelopment 
  });

  // Debug mode for testing
  const isDebug = req.query.debug === 'true';

  // Debug endpoint (GET request)
  if (req.method === 'GET' && isDebug) {
    try {
      console.log('🐛 DEBUG MODE - Testing daily digest setup...');
      
      // Test environment variables
      const envCheck = {
        firebase_client_email: !!process.env.FIREBASE_CLIENT_EMAIL,
        firebase_private_key: !!process.env.FIREBASE_PRIVATE_KEY,
        email_user: !!process.env.EMAIL_USER,
        email_password: !!process.env.EMAIL_PASSWORD,
        daily_digest_api_key: !!process.env.DAILY_DIGEST_API_KEY,
        is_vercel_cron: isVercelCron,
        request_headers: Object.keys(req.headers)
      };
      
      console.log('Environment check:', envCheck);
      
      // Test Firebase connection
      const testDoc = await db.collection('users').limit(1).get();
      console.log(`✅ Firebase connected, found ${testDoc.size} users`);
      
      // Test email transporter - FIXED: Use createTransport instead of createTransporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      await transporter.verify();
      console.log('✅ Email transporter verified');
      
      // Check for subscribed users
      const usersSnapshot = await db.collection('users')
        .where('emailPreferences.dailyDigest', '==', true)
        .get();
        
      const users = usersSnapshot.docs.map(doc => ({
        email: doc.data().email,
        displayName: doc.data().displayName
      })).filter(user => user.email && user.email.includes('@'));
      
      console.log(`👥 Found ${users.length} users subscribed to daily digest`);
      
      // Check recent content (last 7 days for testing) - FIXED: Extended timeframe
      const threeDaysAgo = subDays(new Date(), 7);
      
      // Check projects - Enhanced debugging
      let projectsDebugInfo = {};
      
      try {
        console.log('🔍 Debugging client_projects collection...');
        
        // First, check if the projects collection exists and get basic info
        const allProjectsSnapshot = await db.collection('client_projects').limit(5).get();
        console.log(`📝 Total projects found (first 5): ${allProjectsSnapshot.size}`);
        projectsDebugInfo.totalProjectsFound = allProjectsSnapshot.size;
        
        if (allProjectsSnapshot.size > 0) {
          const sampleProject = allProjectsSnapshot.docs[0].data();
          console.log('📄 Sample project structure:', Object.keys(sampleProject));
          
          projectsDebugInfo.sampleProjectFields = Object.keys(sampleProject);
          projectsDebugInfo.sampleProjectStatus = sampleProject.status;
          projectsDebugInfo.sampleProjectDate = sampleProject.postedDate || sampleProject.createdAt || sampleProject.dateCreated;
          
          // Try different possible status values
          const statusesToTry = ['approved', 'active', 'published', 'open', 'available', 'pending'];
          for (const status of statusesToTry) {
            try {
              const statusSnapshot = await db.collection('client_projects')
                .where('status', '==', status)
                .limit(3)
                .get();
              if (statusSnapshot.size > 0) {
                console.log(`✅ Found ${statusSnapshot.size} projects with status: ${status}`);
                projectsDebugInfo[`status_${status}`] = statusSnapshot.size;
              }
            } catch (err) {
              console.log(`❌ Error checking status ${status}:`, err.message);
              projectsDebugInfo[`status_${status}_error`] = err.message;
            }
          }
          
          // Try different possible date fields
          const dateFieldsToTry = ['postedDate', 'createdAt', 'timestamp', 'dateCreated', 'created_at', 'publishedAt'];
          for (const dateField of dateFieldsToTry) {
            try {
              const dateSnapshot = await db.collection('client_projects')
                .where(dateField, '>=', threeDaysAgo)
                .limit(3)
                .get();
              if (dateSnapshot.size > 0) {
                console.log(`✅ Found ${dateSnapshot.size} recent projects using date field: ${dateField}`);
                projectsDebugInfo[`dateField_${dateField}`] = dateSnapshot.size;
              }
            } catch (err) {
              console.log(`❌ Error checking date field ${dateField}:`, err.message);
              projectsDebugInfo[`dateField_${dateField}_error`] = err.message;
            }
          }
        } else {
          projectsDebugInfo.note = "No projects found in client_projects collection";
          console.log('📝 No projects found in collection');
        }
        
        // Try the original query - FIXED: Extended timeframe
        try {
          const projectsSnapshot = await db.collection('client_projects')
            .where('status', 'in', ['approved', 'active'])
            .where('postedDate', '>=', threeDaysAgo)
            .limit(5)
            .get();
            
          console.log(`📊 Original projects query result: ${projectsSnapshot.size} projects`);
          projectsDebugInfo.originalQueryResult = projectsSnapshot.size;
        } catch (originalError) {
          console.log('❌ Original query failed:', originalError.message);
          projectsDebugInfo.originalQueryError = originalError.message;
        }
        
      } catch (projectsError) {
        console.log('⚠️ Projects debug error:', projectsError.message);
        projectsDebugInfo.debugError = projectsError.message;
      }
      
      // Check projects with simplified query for debug
      let projectsSnapshot;
      try {
        projectsSnapshot = await db.collection('client_projects')
          .where('status', 'in', ['approved', 'active'])
          .where('postedDate', '>=', threeDaysAgo)
          .limit(5)
          .get();
      } catch (err) {
        console.log('⚠️ Using fallback project query...');
        // Fallback: try without date filter first
        try {
          projectsSnapshot = await db.collection('client_projects')
            .where('status', 'in', ['approved', 'active'])
            .limit(5)
            .get();
          projectsDebugInfo.fallbackQuery = 'Used status-only query';
        } catch (err2) {
          // Last resort: get any projects
          projectsSnapshot = await db.collection('client_projects')
            .limit(5)
            .get();
          projectsDebugInfo.fallbackQuery = 'Used no-filter query';
        }
      }
      
      // Check posts - Enhanced debugging
      let postsCount = 0;
      let postsDebugInfo = {};
      
      try {
        console.log('🔍 Debugging posts collection...');
        
        // First, check if the posts collection exists and get basic info
        const allPostsSnapshot = await db.collection('posts').limit(5).get();
        console.log(`📝 Total posts found (first 5): ${allPostsSnapshot.size}`);
        
        if (allPostsSnapshot.size > 0) {
          const samplePost = allPostsSnapshot.docs[0].data();
          console.log('📄 Sample post structure:', Object.keys(samplePost));
          
          postsDebugInfo.samplePostFields = Object.keys(samplePost);
          postsDebugInfo.samplePostStatus = samplePost.status;
          postsDebugInfo.samplePostDate = samplePost.createdAt || samplePost.timestamp || samplePost.dateCreated;
        }
        
        // Try different possible date fields
        const dateFieldsToTry = ['createdAt', 'timestamp', 'dateCreated', 'postedAt', 'created_at'];
        for (const dateField of dateFieldsToTry) {
          try {
            const dateSnapshot = await db.collection('posts')
              .where(dateField, '>=', threeDaysAgo)
              .limit(3)
              .get();
            if (dateSnapshot.size > 0) {
              console.log(`✅ Found ${dateSnapshot.size} recent posts using date field: ${dateField}`);
              postsDebugInfo[`dateField_${dateField}`] = dateSnapshot.size;
            }
          } catch (err) {
            console.log(`❌ Error checking date field ${dateField}:`, err.message);
          }
        }
        
        // Try the original query - FIXED: Removed status filter
        const postsSnapshot = await db.collection('posts')
          .where('createdAt', '>=', threeDaysAgo)
          .limit(5)
          .get();
        postsCount = postsSnapshot.size;
        
        console.log(`📊 Original posts query result: ${postsCount} posts`);
        
      } catch (postsError) {
        console.log('⚠️ Posts query issue:', postsError.message);
        postsDebugInfo.error = postsError.message;
      }

      // Check events - Enhanced debugging  
      let eventsCount = 0;
      let eventsDebugInfo = {};
      
      try {
        console.log('🔍 Debugging tech_events collection...');
        
        // First, check if the events collection exists and get basic info
        const allEventsSnapshot = await db.collection('tech_events').limit(5).get();
        console.log(`📝 Total events found (first 5): ${allEventsSnapshot.size}`);
        eventsDebugInfo.totalEventsFound = allEventsSnapshot.size;
        
        if (allEventsSnapshot.size > 0) {
          const sampleEvent = allEventsSnapshot.docs[0].data();
          console.log('📄 Sample event structure:', Object.keys(sampleEvent));
          
          eventsDebugInfo.sampleEventFields = Object.keys(sampleEvent);
          eventsDebugInfo.sampleEventStatus = sampleEvent.status;
          eventsDebugInfo.sampleEventDate = sampleEvent.eventDate || sampleEvent.createdAt || sampleEvent.submissionDate;
          
          // Try different possible status values
          const statusesToTry = ['approved', 'active', 'published', 'open', 'available', 'pending'];
          for (const status of statusesToTry) {
            try {
              const statusSnapshot = await db.collection('tech_events')
                .where('status', '==', status)
                .limit(3)
                .get();
              if (statusSnapshot.size > 0) {
                console.log(`✅ Found ${statusSnapshot.size} events with status: ${status}`);
                eventsDebugInfo[`status_${status}`] = statusSnapshot.size;
              }
            } catch (err) {
              console.log(`❌ Error checking status ${status}:`, err.message);
              eventsDebugInfo[`status_${status}_error`] = err.message;
            }
          }
          
          // Try different possible date fields
          const dateFieldsToTry = ['eventDate', 'submissionDate', 'createdAt', 'timestamp', 'dateCreated'];
          for (const dateField of dateFieldsToTry) {
            try {
              const dateSnapshot = await db.collection('tech_events')
                .where(dateField, '>=', threeDaysAgo)
                .limit(3)
                .get();
              if (dateSnapshot.size > 0) {
                console.log(`✅ Found ${dateSnapshot.size} recent events using date field: ${dateField}`);
                eventsDebugInfo[`dateField_${dateField}`] = dateSnapshot.size;
              }
            } catch (err) {
              console.log(`❌ Error checking date field ${dateField}:`, err.message);
              eventsDebugInfo[`dateField_${dateField}_error`] = err.message;
            }
          }
        } else {
          eventsDebugInfo.note = "No events found in tech_events collection";
          console.log('📝 No events found in collection');
        }
        
        // Try the original query (using submissionDate as it's more likely for recent events)
        try {
          const eventsSnapshot = await db.collection('tech_events')
            .where('status', '==', 'approved')
            .where('submissionDate', '>=', threeDaysAgo)
            .limit(5)
            .get();
            
          console.log(`📊 Original events query result: ${eventsSnapshot.size} events`);
          eventsDebugInfo.originalQueryResult = eventsSnapshot.size;
          eventsCount = eventsSnapshot.size;
        } catch (originalError) {
          console.log('❌ Original events query failed:', originalError.message);
          eventsDebugInfo.originalQueryError = originalError.message;
          
          // Fallback: try without status filter
          try {
            const fallbackSnapshot = await db.collection('tech_events')
              .where('submissionDate', '>=', threeDaysAgo)
              .limit(5)
              .get();
            eventsCount = fallbackSnapshot.size;
            eventsDebugInfo.fallbackQuery = 'Used submissionDate-only query';
          } catch (err2) {
            eventsCount = 0;
            eventsDebugInfo.fallbackQuery = 'All queries failed';
          }
        }
        
      } catch (eventsError) {
        console.log('⚠️ Events debug error:', eventsError.message);
        eventsDebugInfo.debugError = eventsError.message;
      }

      // Check group posts - NEW: Enhanced debugging for group posts
      let groupPostsCount = 0;
      let groupPostsDebugInfo = {};
      
      try {
        console.log('🔍 Debugging group_posts collection...');
        
        // First, check if the group posts collection exists and get basic info
        const allGroupPostsSnapshot = await db.collection('group_posts').limit(5).get();
        console.log(`📝 Total group posts found (first 5): ${allGroupPostsSnapshot.size}`);
        groupPostsDebugInfo.totalGroupPostsFound = allGroupPostsSnapshot.size;
        
        if (allGroupPostsSnapshot.size > 0) {
          const sampleGroupPost = allGroupPostsSnapshot.docs[0].data();
          console.log('📄 Sample group post structure:', Object.keys(sampleGroupPost));
          
          groupPostsDebugInfo.sampleGroupPostFields = Object.keys(sampleGroupPost);
          groupPostsDebugInfo.sampleGroupPostType = sampleGroupPost.type;
          groupPostsDebugInfo.sampleGroupPostDate = sampleGroupPost.createdAt;
          groupPostsDebugInfo.sampleGroupId = sampleGroupPost.groupId;
          
          // Try different possible date fields
          const dateFieldsToTry = ['createdAt', 'timestamp', 'updatedAt', 'postedAt'];
          for (const dateField of dateFieldsToTry) {
            try {
              const dateSnapshot = await db.collection('group_posts')
                .where(dateField, '>=', threeDaysAgo)
                .limit(3)
                .get();
              if (dateSnapshot.size > 0) {
                console.log(`✅ Found ${dateSnapshot.size} recent group posts using date field: ${dateField}`);
                groupPostsDebugInfo[`dateField_${dateField}`] = dateSnapshot.size;
              }
            } catch (err) {
              console.log(`❌ Error checking date field ${dateField}:`, err.message);
              groupPostsDebugInfo[`dateField_${dateField}_error`] = err.message;
            }
          }
        } else {
          groupPostsDebugInfo.note = "No group posts found in group_posts collection";
          console.log('📝 No group posts found in collection');
        }
        
        // Try the original query
        try {
          const groupPostsSnapshot = await db.collection('group_posts')
            .where('createdAt', '>=', threeDaysAgo)
            .limit(5)
            .get();
            
          console.log(`📊 Original group posts query result: ${groupPostsSnapshot.size} group posts`);
          groupPostsDebugInfo.originalQueryResult = groupPostsSnapshot.size;
          groupPostsCount = groupPostsSnapshot.size;
        } catch (originalError) {
          console.log('❌ Original group posts query failed:', originalError.message);
          groupPostsDebugInfo.originalQueryError = originalError.message;
          groupPostsCount = 0;
        }
        
        // Check group memberships
        try {
          const allMembershipsSnapshot = await db.collection('group_members').limit(5).get();
          console.log(`👥 Total group memberships found (first 5): ${allMembershipsSnapshot.size}`);
          groupPostsDebugInfo.totalMemberships = allMembershipsSnapshot.size;
          
          if (allMembershipsSnapshot.size > 0) {
            const sampleMembership = allMembershipsSnapshot.docs[0].data();
            groupPostsDebugInfo.sampleMembershipFields = Object.keys(sampleMembership);
          }
        } catch (membershipError) {
          console.log('⚠️ Could not check group memberships:', membershipError.message);
          groupPostsDebugInfo.membershipError = membershipError.message;
        }
        
      } catch (groupPostsError) {
        console.log('⚠️ Group posts debug error:', groupPostsError.message);
        groupPostsDebugInfo.debugError = groupPostsError.message;
      }
      
      return res.json({
        success: true,
        debug: true,
        authenticated: isVercelCron ? 'vercel_cron' : 'api_key',
        timestamp: new Date().toISOString(),
        environment: envCheck,
        data: {
          subscribedUsers: users.length,
          sampleUsers: users.slice(0, 3).map(u => u.email),
          recentProjects: projectsSnapshot.size,
          recentPosts: postsCount,
          recentEvents: eventsCount,
          recentGroupPosts: groupPostsCount, // NEW: Added group posts count
          projectsDebugInfo: projectsDebugInfo,
          postsDebugInfo: postsDebugInfo,
          eventsDebugInfo: eventsDebugInfo,
          groupPostsDebugInfo: groupPostsDebugInfo // NEW: Added group posts debug info
        },
        recommendations: users.length > 0 ? [
          `✅ ${users.length} users subscribed to daily digest`,
          '✅ Email setup verified',
          '✅ Firebase connection working',
          '🚀 Ready for daily email automation (sends every day)!'
        ] : [
          '⚠️ No users subscribed to daily digest',
          'Users need emailPreferences.dailyDigest = true',
          'Check your user collection structure'
        ]
      });
      
    } catch (error) {
      console.error('🚨 Debug error:', error);
      return res.status(500).json({
        success: false,
        debug: true,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  
  // Method check - FIXED: Allow GET requests from Vercel cron
  if (req.method !== 'POST' && !(req.method === 'GET' && isVercelCron)) {
    return res.status(405).json({ 
    error: 'Method not allowed',
    allowed: ['POST'],
    hint: 'Use POST for manual triggers, or GET for Vercel cron with ?debug=true to test'
  });
}

  try {
    console.log('🌅 Starting daily digest (always send)...', { 
      source: isVercelCron ? 'vercel-cron' : 'manual' 
    });

    // Create email transporter - FIXED: Use createTransport instead of createTransporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify email connection
    await transporter.verify();
    console.log('✅ Email connection verified');

    // Get data from last 24 hours for posts/events, 7 days for projects
    const oneDayAgo = subDays(new Date(), 1);
    const sevenDaysAgo = subDays(new Date(), 7);
    console.log(`📅 Fetching daily data since: ${oneDayAgo.toLocaleDateString()}`);
    console.log(`📅 Fetching projects since: ${sevenDaysAgo.toLocaleDateString()}`);

    // Get projects from last 7 days - FIXED: Extended timeframe to capture more projects
    const projectsSnapshot = await db.collection('client_projects')
      .where('status', 'in', ['approved', 'active'])
      .where('postedDate', '>=', sevenDaysAgo)
      .orderBy('postedDate', 'desc')
      .limit(10)
      .get();

    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      postedDate: doc.data().postedDate?.toDate?.() || new Date()
    }));

    // Get posts from last 24 hours - FIXED: Removed status filter since posts don't have status field
    let posts = [];
    try {
      const postsSnapshot = await db.collection('posts')
        .where('createdAt', '>=', oneDayAgo)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      posts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
    } catch (postsError) {
      console.warn('⚠️ Could not fetch posts:', postsError.message);
      posts = [];
    }

    // NEW: Get group posts from last 24 hours
    let groupPosts = [];
    try {
      const groupPostsSnapshot = await db.collection('group_posts')
        .where('createdAt', '>=', oneDayAgo)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      groupPosts = groupPostsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      console.log(`📝 Found ${groupPosts.length} recent group posts`);
    } catch (groupPostsError) {
      console.warn('⚠️ Could not fetch group posts:', groupPostsError.message);
      groupPosts = [];
    }

    // Get events from last 24 hours - NEW: Added events to daily digest
    let events = [];
    try {
      const eventsSnapshot = await db.collection('tech_events')
        .where('status', '==', 'approved')
        .where('submissionDate', '>=', oneDayAgo)
        .orderBy('submissionDate', 'desc')
        .limit(10)
        .get();

      events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate?.() || new Date(),
        submissionDate: doc.data().submissionDate?.toDate?.() || new Date()
      }));
    } catch (eventsError) {
      console.warn('⚠️ Could not fetch events:', eventsError.message);
      // Fallback: try without status filter
      try {
        const fallbackSnapshot = await db.collection('tech_events')
          .where('submissionDate', '>=', oneDayAgo)
          .orderBy('submissionDate', 'desc')
          .limit(10)
          .get();

        events = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          eventDate: doc.data().eventDate?.toDate?.() || new Date(),
          submissionDate: doc.data().submissionDate?.toDate?.() || new Date()
        }));
        console.log('✅ Events fetched using fallback query');
      } catch (fallbackError) {
        console.warn('⚠️ Fallback events query also failed:', fallbackError.message);
        events = [];
      }
    }

    console.log(`📊 Daily activity: ${projects.length} projects, ${posts.length} posts, ${events.length} events, ${groupPosts.length} group posts`);

    // 🔥 REMOVED: Skip logic for no content - now always sends email
    // Always continue to send email regardless of content

    // Get users who want daily emails with their group memberships
    const usersSnapshot = await db.collection('users')
      .where('emailPreferences.dailyDigest', '==', true)
      .get();

    let users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      email: doc.data().email,
      displayName: doc.data().displayName
    })).filter(user => user.email && user.email.includes('@'));

    // Get group memberships for all users
    console.log(`👥 Getting group memberships for ${users.length} users...`);
    
    for (let user of users) {
      try {
        const membershipSnapshot = await db.collection('group_members')
          .where('userEmail', '==', user.email)
          .where('status', '==', 'active')
          .get();

        user.groupMemberships = membershipSnapshot.docs.map(doc => ({
          groupId: doc.data().groupId,
          role: doc.data().role,
          userName: doc.data().userName
        }));

        // Filter group posts relevant to this user
        user.relevantGroupPosts = groupPosts.filter(post => 
          user.groupMemberships.some(membership => membership.groupId === post.groupId)
        );

        console.log(`📝 User ${user.email}: ${user.groupMemberships.length} groups, ${user.relevantGroupPosts.length} relevant posts`);
      } catch (membershipError) {
        console.warn(`⚠️ Could not fetch memberships for ${user.email}:`, membershipError.message);
        user.groupMemberships = [];
        user.relevantGroupPosts = [];
      }
    }

    console.log(`👥 Found ${users.length} users subscribed to daily digest`);

    if (users.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No users subscribed to daily digest',
        stats: { 
          projects: projects.length, 
          posts: posts.length, 
          events: events.length, 
          groupPosts: groupPosts.length, // NEW: Added group posts tracking
          users: 0 
        }
      });
    }

    // 🔥 ENHANCED: Generate email HTML with content for zero-content days
    const generateDailyEmail = (user) => {
      const userName = user.displayName || user.email.split('@')[0] || 'Developer';
      const userGroupPosts = user.relevantGroupPosts || [];
      const hasContent = projects.length > 0 || posts.length > 0 || events.length > 0 || userGroupPosts.length > 0;
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      // Motivational messages for days with no new content
      const motivationalMessages = [
        "Every quiet day is a chance to plan your next big breakthrough! 🚀",
        "Sometimes the best opportunities come during the calm before the storm. ⚡",
        "Use today to sharpen your skills and prepare for upcoming projects! 🛠️",
        "Great developers use downtime to learn something new. What will you discover today? 📚",
        "The tech world never sleeps - new opportunities are always around the corner! 🌅",
        "Today's a perfect day to work on that personal project you've been thinking about! 💡",
        "Quiet days in tech often mean big announcements are coming. Stay ready! 🎯"
      ];
      
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Daily Tech Update - Favored Online</title>
            <style>
                body { 
                    font-family: Arial, sans-serif;
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: #f5f5f5;
                    line-height: 1.6;
                }
                .container {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                .header { 
                    background: linear-gradient(135deg, #FF6B35, #F7931E); 
                    color: white; 
                    padding: 30px; 
                    text-align: center; 
                }
                .header h1 {
                    margin: 0;
                    font-size: 26px;
                    font-weight: bold;
                }
                .header p {
                    margin: 12px 0 0 0;
                    font-size: 16px;
                }
                .content { padding: 30px; }
                .section { margin-bottom: 30px; }
                .section h2 { 
                    color: #FF6B35; 
                    font-size: 20px; 
                    border-bottom: 2px solid #FF6B35; 
                    padding-bottom: 8px;
                    margin-bottom: 20px;
                }
                .item { 
                    background: #fff8f5; 
                    padding: 18px; 
                    margin-bottom: 15px; 
                    border-radius: 10px; 
                    border-left: 4px solid #FF6B35;
                }
                .item h3 { 
                    margin: 0 0 10px 0; 
                    color: #333; 
                    font-size: 16px;
                    font-weight: 600;
                }
                .item p { 
                    margin: 0 0 8px 0; 
                    color: #666; 
                    font-size: 13px; 
                }
                .stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin: 20px 0;
                }
                .stat-card {
                    text-align: center;
                    background: #fff8f5;
                    padding: 15px;
                    border-radius: 8px;
                }
                .stat-number {
                    font-size: 20px;
                    font-weight: bold;
                    color: #FF6B35;
                }
                .stat-label {
                    font-size: 10px;
                    color: #666;
                    text-transform: uppercase;
                }
                .footer { 
                    background: #2c3e50; 
                    color: #bdc3c7; 
                    padding: 20px; 
                    text-align: center; 
                    font-size: 12px; 
                }
                .footer a { color: #FF6B35; text-decoration: none; }
                .daily-badge {
                    background: #FF6B35;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-size: 11px;
                    font-weight: 600;
                    display: inline-block;
                    margin-bottom: 15px;
                }
                .motivational {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    margin: 20px 0;
                }
                .no-content {
                    text-align: center;
                    padding: 30px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 2px dashed #ddd;
                    margin: 20px 0;
                }
                .cta-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin: 25px 0;
                }
                .cta-button {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    text-decoration: none;
                    text-align: center;
                    font-weight: 600;
                    display: block;
                }
                .event-item {
                    background: #f0f8ff;
                    padding: 18px;
                    margin-bottom: 15px;
                    border-radius: 10px;
                    border-left: 4px solid #4CAF50;
                }
                .event-date {
                    background: #4CAF50;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    display: inline-block;
                    margin-bottom: 8px;
                }
                .group-post-item {
                    background: #e8f5e8;
                    padding: 18px;
                    margin-bottom: 15px;
                    border-radius: 10px;
                    border-left: 4px solid #4CAF50;
                }
                .group-name {
                    background: #4CAF50;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    display: inline-block;
                    margin-bottom: 8px;
                }
                .post-type-badge {
                    background: #666;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    font-weight: 600;
                    display: inline-block;
                    margin-left: 8px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌅 Favored Online Daily Update</h1>
                    <p>Hi ${userName}! Here's your daily tech check-in</p>
                    <div class="daily-badge">📅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>
                
                <div class="content">
                    <div class="section">
                        <h2>📊 Today's Activity</h2>
                        <div class="stats">
                            <div class="stat-card">
                                <div class="stat-number">${projects.length}</div>
                                <div class="stat-label">Recent Projects</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${posts.length}</div>
                                <div class="stat-label">New Posts</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${events.length}</div>
                                <div class="stat-label">New Events</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${userGroupPosts.length}</div>
                                <div class="stat-label">Group Updates</div>
                            </div>
                        </div>
                    </div>

                    ${projects.length > 0 ? `
                    <div class="section">
                        <h2>🆕 Recent Projects</h2>
                        ${projects.slice(0, 3).map(project => `
                        <div class="item">
                            <h3>${project.projectTitle || 'Untitled Project'}</h3>
                            <p>${(project.projectDescription || 'No description').substring(0, 120)}...</p>
                            <small><strong>Company:</strong> ${project.companyName || 'Not specified'}</small>
                        </div>
                        `).join('')}
                    </div>
                    ` : ''}

                    ${events.length > 0 ? `
                    <div class="section">
                        <h2>🎯 New Events Today</h2>
                        ${events.slice(0, 3).map(event => {
                          const eventDate = new Date(event.eventDate);
                          const formatEventType = (type) => {
                            const typeMap = {
                              'workshop': 'Workshop',
                              'webinar': 'Webinar', 
                              'talk': 'Talk/Panel',
                              'conference': 'Conference',
                              'meetup': 'Meetup'
                            };
                            return typeMap[type] || type;
                          };
                          
                          return `
                          <div class="event-item">
                              <div class="event-date">${formatEventType(event.eventType)} • ${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                              <h3>${event.eventTitle || 'Untitled Event'}</h3>
                              <p>${(event.eventDescription || 'No description').substring(0, 120)}...</p>
                              <small><strong>Host:</strong> ${event.organizerName || 'Not specified'} • <strong>Duration:</strong> ${event.duration || 'TBD'}</small>
                          </div>
                          `;
                        }).join('')}
                    </div>
                    ` : ''}

                    ${userGroupPosts.length > 0 ? `
                    <div class="section">
                        <h2>👥 Your Project Groups Activity</h2>
                        ${userGroupPosts.slice(0, 3).map(groupPost => {
                          const getPostTypeEmoji = (type) => {
                            const typeMap = {
                              'discussion': '💬',
                              'announcement': '📢', 
                              'task': '✅',
                              'update': '📊'
                            };
                            return typeMap[type] || '💬';
                          };
                          
                          const formatPostType = (type) => {
                            const typeMap = {
                              'discussion': 'Discussion',
                              'announcement': 'Announcement',
                              'task': 'Task',
                              'update': 'Update'
                            };
                            return typeMap[type] || type;
                          };
                          
                          return `
                          <div class="group-post-item">
                              <div class="group-name">${groupPost.groupTitle || 'Project Group'}</div>
                              <h3>${getPostTypeEmoji(groupPost.type)} ${groupPost.title || 'Untitled Post'}</h3>
                              <p>${(groupPost.content || 'No content').substring(0, 120)}...</p>
                              <small><strong>By:</strong> ${groupPost.authorName || 'Anonymous'} <span class="post-type-badge">${formatPostType(groupPost.type)}</span></small>
                              ${groupPost.replyCount > 0 ? `<br><small style="color: #4CAF50;">💬 ${groupPost.replyCount} ${groupPost.replyCount === 1 ? 'reply' : 'replies'}</small>` : ''}
                          </div>
                          `;
                        }).join('')}
                        ${userGroupPosts.length > 3 ? `<p style="text-align: center; color: #666; font-style: italic;">... and ${userGroupPosts.length - 3} more updates from your project groups</p>` : ''}
                    </div>
                    ` : ''}

                    ${posts.length > 0 ? `
                    <div class="section">
                        <h2>💬 Today's Community Posts</h2>
                        ${posts.slice(0, 3).map(post => {
                          // Handle both regular posts and reposts
                          const content = post.isRepost ? 
                            (post.repostComment || 'Shared a post') : 
                            (post.content || post.originalPost?.content || 'No content available');
                          const displayTitle = post.title || 
                            (post.isRepost ? '🔄 Repost' : '💬 Community Post');
                          
                          return `
                          <div class="item">
                              <h3>${displayTitle}</h3>
                              <p>${content.substring(0, 100)}...</p>
                              <small><strong>By:</strong> ${post.authorName || post.authorFirstName + ' ' + post.authorLastName || 'Anonymous'}</small>
                          </div>
                          `;
                        }).join('')}
                    </div>
                    ` : ''}

                    ${!hasContent ? `
                    <div class="section">
                        <h2>🌟 Quiet Day, Big Opportunities</h2>
                        <div class="no-content">
                            <div style="font-size: 48px; margin-bottom: 15px;">🤔</div>
                            <h3 style="margin: 0 0 10px 0; color: #333;">No new updates today</h3>
                            <p style="color: #666; margin: 0;">But that doesn't mean there's nothing happening!</p>
                        </div>
                        
                        <div class="motivational">
                            <div style="font-size: 24px; margin-bottom: 10px;">💡</div>
                            <p style="margin: 0; font-size: 16px; font-weight: 500;">${randomMessage}</p>
                        </div>
                    </div>
                    ` : ''}

                    <div class="section">
                        <h2>🚀 What You Can Do Today</h2>
                        <div class="cta-buttons">
                            <a href="https://www.favoredonline.com/projects" class="cta-button">
                                🔍 Browse All Projects
                            </a>
                            <a href="https://www.favoredonline.com/events" class="cta-button">
                                🎯 Join Events & Workshops
                            </a>
                            <a href="https://www.favoredonline.com/community" class="cta-button">
                                💬 Join Discussions
                            </a>
                            <a href="https://www.favoredonline.com/career/dashboard" class="cta-button">
                                📈 Check Your Progress
                            </a>
                        </div>
                    </div>

                    ${!hasContent ? `
                    <div class="section">
                        <h2>📚 Daily Tech Tips</h2>
                        <div class="item">
                            <h3>💡 Pro Tip for ${dayOfWeek}</h3>
                            <p>Use quiet days to update your LinkedIn profile, review your GitHub repositories, or learn about emerging technologies. Consistent small improvements compound into big career advances!</p>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="footer">
                    <p><strong>Favored Online</strong> - Your daily tech companion</p>
                    <p><a href="https://www.favoredonline.com/email-preferences">Email Preferences</a> | <a href="https://www.favoredonline.com">Visit Website</a></p>
                    <p>Daily digest • ${new Date().getFullYear()} Favored Online • Delivered every day</p>
                </div>
            </div>
        </body>
        </html>
      `;
    };

    // Send emails in batches
    let successful = 0;
    let failed = 0;
    const failedEmails = [];

    for (const user of users) {
      try {
        const userGroupPostsCount = user.relevantGroupPosts?.length || 0;
        const hasUserContent = projects.length > 0 || posts.length > 0 || events.length > 0 || userGroupPostsCount > 0;
        
        const subject = hasUserContent
          ? `🌅 Your Daily Tech Update - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
          : `🌅 Daily Check-in - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

        await transporter.sendMail({
          from: {
            name: 'Favored Online',
            address: process.env.EMAIL_USER
          },
          to: user.email,
          subject: subject,
          html: generateDailyEmail(user)
        });
        
        console.log(`✅ Daily email sent to ${user.email} (${userGroupPostsCount} group posts included)`);
        successful++;
      } catch (error) {
        console.error(`❌ Failed to send daily email to ${user.email}:`, error.message);
        failedEmails.push({ email: user.email, error: error.message });
        failed++;
      }
    }

    transporter.close();

    // Log results to Firebase
    try {
      await db.collection('email_logs').add({
        type: 'daily_digest',
        timestamp: new Date(),
        stats: {
          totalRecipients: users.length,
          successful,
          failed,
          projectsIncluded: projects.length,
          postsIncluded: posts.length,
          eventsIncluded: events.length,
          groupPostsIncluded: groupPosts.length, // NEW: Added group posts tracking
          alwaysSend: true // 🔥 NEW: Flag to indicate this always sends
        },
        failedEmails,
        service: 'vercel-cron-daily-digest-always-send'
      });
    } catch (logError) {
      console.warn('⚠️ Could not save daily email log:', logError.message);
    }

    const contentStatus = projects.length > 0 || posts.length > 0 || events.length > 0 || groupPosts.length > 0 ? 'with new content' : 'with motivational content';
    console.log(`🎉 Daily digest completed ${contentStatus}: ${successful} sent, ${failed} failed`);

    return res.json({
      success: true,
      message: `Daily digest sent ${contentStatus}! ${successful} emails delivered successfully.`,
      stats: {
        totalRecipients: users.length,
        successful,
        failed,
        projectsIncluded: projects.length,
        postsIncluded: posts.length,
        eventsIncluded: events.length,
        groupPostsIncluded: groupPosts.length, // NEW: Added group posts tracking
        alwaysSend: true,
        contentType: projects.length > 0 || posts.length > 0 || events.length > 0 || groupPosts.length > 0 ? 'updates' : 'motivational'
      }
    });

  } catch (error) {
    console.error('💥 Error in daily digest:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
