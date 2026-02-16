// api/notifications/send-project-review-approved.js
// Sends email to project owner when admin approves their project completion review

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { 
      projectOwnerEmail,
      projectOwnerName,
      projectTitle,
      groupId,
      teamSize,
      approvalDate,
      adminEmail
    } = req.body;
    
    console.log('📧 Project approval email request:', {
      projectOwnerEmail,
      projectTitle,
      groupId
    });
    
    if (!projectOwnerEmail || !projectTitle || !groupId) {
      console.log('❌ Validation failed for project approval email');
      return res.status(400).json({
        success: false, 
        error: 'Project owner email, project title, and group ID are required'
      });
    }

    // Environment variables check
    const envVars = {
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
    };

    const missing = Object.entries(envVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.log('❌ Missing environment variables:', missing);
      return res.status(500).json({
        success: false,
        error: `Missing environment variables: ${missing.join(', ')}`
      });
    }

    console.log('✅ Environment variables check passed');

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: envVars.EMAIL_USER,
        pass: envVars.EMAIL_PASSWORD
      }
    });

    console.log('🔧 Transporter created, verifying...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully');

    const badgeAssignmentUrl = `https://loomiqhq.com/career/project-completion/${groupId}`;
    const emailSubject = `Project Approved: Ready to Award TechTalent Badges - "${projectTitle}"`;
    
    console.log('📧 Sending project approval email to:', projectOwnerEmail);
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Project Approved - Award Badges</title>
          <style>
            .container { max-width: 700px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .button { background-color: #FF9800; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; font-size: 16px; }
            .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
            .success-box { background: #e8f5e9; border: 2px solid #4CAF50; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .info-section { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            .badge-box { background: #fff3e0; border: 2px solid #FF9800; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .steps-box { background: #f3e5f5; border: 1px solid #9c27b0; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Project Approved! 🎉</h1>
              <p style="margin: 5px 0; font-size: 18px;">Time to Award TechTalent Badges</p>
            </div>
            <div class="content">
              <h2>Congratulations, ${projectOwnerName || 'Project Owner'}!</h2>
              
              <div class="success-box">
                <h3 style="color: #2E7D32; margin: 0 0 10px 0;">Your Project Has Been Approved!</h3>
                <p style="margin: 10px 0; color: #2E7D32; font-size: 18px; font-weight: bold;">
                  "${projectTitle}"
                </p>
                <p style="margin: 10px 0; color: #666;">
                  Your project completion has been reviewed and approved by our admin team. Great work!
                </p>
              </div>
              
              <div class="info-section">
                <h3 style="color: #4CAF50; margin-top: 0;">Project Details</h3>
                <p><strong>Project:</strong> ${projectTitle}</p>
                <p><strong>Team Size:</strong> ${teamSize || 'Not specified'} member(s)</p>
                <p><strong>Approval Date:</strong> ${new Date(approvalDate || Date.now()).toLocaleDateString()}</p>
                <p><strong>Group ID:</strong> ${groupId}</p>
              </div>

              <div class="badge-box">
                <h3 style="color: #E65100; margin-top: 0;">Next Step: Award TechTalent Badges 🏆</h3>
                <p style="color: #666; margin: 15px 0; line-height: 1.6;">
                  You can now assign <strong>TechTalent Badges</strong> to your team members based on their contributions and skill level. 
                  These badges are permanent credentials that showcase their real-world project experience!
                </p>
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${badgeAssignmentUrl}" class="button">
                    🏆 Assign Badges Now
                  </a>
                </div>
              </div>

              <div class="steps-box">
                <h3 style="color: #7b1fa2; margin-top: 0;">Badge Assignment Process</h3>
                <ol style="color: #7b1fa2; font-size: 14px; line-height: 1.8; margin: 10px 0;">
                  <li><strong>Review Team Contributions:</strong> Evaluate each member's work and impact</li>
                  <li><strong>Select Badge Levels:</strong> Choose appropriate badge level for each member
                    <ul style="margin-top: 5px; color: #9c27b0;">
                      <li>🔰 Novice - First project completion</li>
                      <li>📈 Beginner - 5+ projects completed</li>
                      <li>⭐ Intermediate - 10+ projects completed</li>
                      <li>🏆 Expert - 15+ projects completed</li>
                    </ul>
                  </li>
                  <li><strong>Assign Badges:</strong> Award badges to all team members</li>
                  <li><strong>Generate Certificate:</strong> Your completion certificate will be created</li>
                </ol>
              </div>

              <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #2e7d32; margin-top: 0;">Important Reminders:</h4>
                <ul style="color: #2e7d32; font-size: 14px; margin: 5px 0;">
                  <li>Assign badges based on actual contributions and skill level</li>
                  <li>All active team members should receive a badge</li>
                  <li>Badge levels reflect project count and experience</li>
                  <li>Once assigned, badges are permanent credentials</li>
                  <li>Your certificate will be ready after badge assignment</li>
                </ul>
              </div>

              <div style="background: #fff3e0; border: 1px solid #ff9800; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #e65100; margin-top: 0;">Badge Level Guidelines:</h4>
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 5px 0;">
                  Check each team member's project history in their profile to determine the correct badge level. 
                  The badge system automatically tracks completed projects to ensure accurate credentialing.
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Thank you for leading your team through this project! The badges you award will become part of your team members' 
                permanent professional credentials, helping them showcase their skills to future employers.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${badgeAssignmentUrl}" class="button">
                  🏆 Go to Badge Assignment
                </a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Loomiq ProjectX. All rights reserved.</p>
              <p><em>Where Projects Power Careers</em></p>
              <p style="font-size: 12px; margin-top: 10px; color: #999;">
                Empowering students with real-world, project-driven learning
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textVersion = `
Project Approved: Ready to Award TechTalent Badges

Congratulations, ${projectOwnerName || 'Project Owner'}!

YOUR PROJECT HAS BEEN APPROVED!
"${projectTitle}"

Your project completion has been reviewed and approved by our admin team. Great work!

PROJECT DETAILS:
- Project: ${projectTitle}
- Team Size: ${teamSize || 'Not specified'} member(s)
- Approval Date: ${new Date(approvalDate || Date.now()).toLocaleDateString()}
- Group ID: ${groupId}

NEXT STEP: AWARD TECHTALENT BADGES 🏆
You can now assign TechTalent Badges to your team members based on their contributions and skill level. These badges are permanent credentials that showcase their real-world project experience!

Assign Badges Now: ${badgeAssignmentUrl}

BADGE ASSIGNMENT PROCESS:
1. Review Team Contributions: Evaluate each member's work and impact
2. Select Badge Levels: Choose appropriate badge level for each member
   - 🔰 Novice - First project completion
   - 📈 Beginner - 5+ projects completed
   - ⭐ Intermediate - 10+ projects completed
   - 🏆 Expert - 15+ projects completed
3. Assign Badges: Award badges to all team members
4. Generate Certificate: Your completion certificate will be created

IMPORTANT REMINDERS:
- Assign badges based on actual contributions and skill level
- All active team members should receive a badge
- Badge levels reflect project count and experience
- Once assigned, badges are permanent credentials
- Your certificate will be ready after badge assignment

BADGE LEVEL GUIDELINES:
Check each team member's project history in their profile to determine the correct badge level. The badge system automatically tracks completed projects to ensure accurate credentialing.

Thank you for leading your team through this project! The badges you award will become part of your team members' permanent professional credentials, helping them showcase their skills to future employers.

Go to Badge Assignment: ${badgeAssignmentUrl}

---
Loomiq ProjectX - Where Projects Power Careers
Empowering students with real-world, project-driven learning
    `;

    console.log('📧 About to send project approval email...');
    const result = await transporter.sendMail({
      from: { 
        name: 'Loomiq ProjectX', 
        address: envVars.EMAIL_USER 
      },
      to: projectOwnerEmail,
      subject: emailSubject,
      text: textVersion,
      html: htmlTemplate
    });

    console.log('✅ Project approval email sent successfully:', result.messageId);
    transporter.close();

    return res.status(200).json({ 
      success: true, 
      message: 'Project approval notification email sent successfully',
      results: [{ 
        type: 'project_review_approved',
        recipient: projectOwnerEmail,
        project: projectTitle,
        groupId: groupId,
        messageId: result.messageId
      }]
    });

  } catch (error) {
    console.error('❌ Error sending project approval email:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false, 
      error: error.message
    });
  }
};
