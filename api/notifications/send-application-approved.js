// api/notifications/send-application-approved.js
// Sends email to applicant when their application is approved

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { applicationData, projectData } = req.body;
    
    console.log('📧 Application approved email request:', {
      applicantEmail: applicationData?.applicantEmail,
      projectTitle: projectData?.projectTitle,
      groupId: projectData?.groupId
    });
    
    if (!applicationData || !applicationData.applicantEmail) {
      console.log('❌ Validation failed:', { 
        hasApplicationData: !!applicationData, 
        hasApplicantEmail: !!applicationData?.applicantEmail 
      });
      return res.status(400).json({
        success: false, 
        error: 'Application data and applicant email are required'
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

    const projectTitle = projectData?.projectTitle || applicationData.projectTitle || 'Project';
    const groupId = projectData?.groupId;
    const groupUrl = groupId 
      ? `https://loomiqhq.com/groups/${groupId}` 
      : 'https://loomiqhq.com/my-groups';
    
    const emailSubject = `Application Approved: Welcome to ${projectTitle}`;
    
    console.log('📧 Sending to:', applicationData.applicantEmail);
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Application Approved</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #9C27B0, #7B1FA2); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .button { background-color: #9C27B0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
            .welcome-box { background: #f3e5f5; border: 2px solid #9C27B0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .badge-box { background: #fff3e0; border: 2px solid #FF9800; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to the Team!</h1>
            </div>
            <div class="content">
              <h2>Congratulations, ${applicationData.applicantName || 'Team Member'}!</h2>
              
              <div class="welcome-box">
                <h3 style="color: #9C27B0; margin: 0;">You're In!</h3>
                <p style="margin: 10px 0; color: #7B1FA2; font-size: 18px;">
                  Your application has been approved!
                </p>
              </div>
              
              <p>The project owner has reviewed your application and is excited to have you join their team. This is the beginning of your journey to earning valuable TechTalent Badges!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #9C27B0; margin-top: 0;">Project Details:</h3>
                <p><strong>Project:</strong> ${projectTitle}</p>
                <p><strong>Your Role:</strong> ${applicationData.roleAppliedFor || 'Team Member'}</p>
                <p><strong>Project Owner:</strong> ${projectData?.contactName || applicationData.projectOwner || 'Project Team'}</p>
                <p><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div class="badge-box">
                <h3 style="color: #E65100; margin-top: 0;">Earn TechTalent Badges</h3>
                <p style="color: #666; margin: 10px 0;">
                  As you work on this project, you'll earn <strong>TechTalent Badges</strong> that showcase your skills, achievements, and problem-solving abilities. These badges are your proof of real-world experience!
                </p>
              </div>
              
              <h3 style="color: #9C27B0;">What's Next?</h3>
              <ul>
                <li>Join your project group and meet your team members</li>
                <li>Review project requirements and timeline</li>
                <li>Start contributing and earning your badges</li>
                <li>Collaborate with your team in the group workspace</li>
                <li>Use our AI-powered Career Navigator for personalized guidance</li>
              </ul>
              
              <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #2e7d32; margin-top: 0;">Getting Started Tips:</h4>
                <ul style="color: #2e7d32; font-size: 14px; margin: 5px 0;">
                  <li>Introduce yourself to the team</li>
                  <li>Ask questions if anything is unclear</li>
                  <li>Set up your development environment</li>
                  <li>Review the project documentation</li>
                  <li>Be proactive and communicate regularly</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${groupUrl}" class="button">
                  Join Your Team Group
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Welcome to Loomiq ProjectX! This is where your projects power your career. We're excited to see what amazing things you'll build together.
              </p>
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
Application Approved: Welcome to ${projectTitle}

Congratulations, ${applicationData.applicantName || 'Team Member'}!

Your application has been approved and you're now part of the team!

Project Details:
- Project: ${projectTitle}
- Your Role: ${applicationData.roleAppliedFor || 'Team Member'}
- Project Owner: ${projectData?.contactName || applicationData.projectOwner || 'Project Team'}
- Approval Date: ${new Date().toLocaleDateString()}

EARN TECHTALENT BADGES:
As you work on this project, you'll earn TechTalent Badges that showcase your skills, achievements, and problem-solving abilities. These badges are your proof of real-world experience!

What's Next:
✓ Join your project group and meet your team members
✓ Review project requirements and timeline
✓ Start contributing and earning your badges
✓ Collaborate with your team in the group workspace
✓ Use our AI-powered Career Navigator for personalized guidance

Join Your Team Group: ${groupUrl}

GETTING STARTED TIPS:
- Introduce yourself to the team
- Ask questions if anything is unclear
- Set up your development environment
- Review the project documentation
- Be proactive and communicate regularly

Welcome to Loomiq ProjectX - Where Projects Power Careers!

Best regards,
The Loomiq ProjectX Team
    `;

    console.log('📧 About to send email...');
    const result = await transporter.sendMail({
      from: { 
        name: 'Loomiq ProjectX', 
        address: envVars.EMAIL_USER 
      },
      to: applicationData.applicantEmail,
      cc: applicationData.additionalEmails || [],
      subject: emailSubject,
      text: textVersion,
      html: htmlTemplate
    });

    console.log('✅ Email sent successfully:', result.messageId);
    transporter.close();

    return res.status(200).json({ 
      success: true, 
      message: 'Application approval email sent successfully',
      results: [{ 
        type: 'application_approved',
        recipient: applicationData.applicantEmail,
        messageId: result.messageId 
      }]
    });

  } catch (error) {
    console.error('❌ Error sending application approval email:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false, 
      error: error.message
    });
  }
};
