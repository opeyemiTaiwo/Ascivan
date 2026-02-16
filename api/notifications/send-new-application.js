// api/notifications/send-new-application.js
// Sends email to project owner when someone applies to their project

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
      applicantName,
      applicantEmail,
      roleAppliedFor,
      projectTitle,
      projectType,
      experience,
      skills,
      portfolio,
      motivation,
      hoursPerWeek,
      availableStart,
      applicationDate
    } = req.body;
    
    console.log('📧 New application email request:', {
      projectOwnerEmail,
      applicantName,
      projectTitle
    });
    
    if (!projectOwnerEmail || !applicantEmail || !projectTitle) {
      console.log('❌ Validation failed for new application email');
      return res.status(400).json({
        success: false, 
        error: 'Project owner email, applicant email, and project title are required'
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

    const emailSubject = `New Application: ${applicantName} wants to join "${projectTitle}"`;
    
    console.log('📧 Sending new application notification to:', projectOwnerEmail);
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Project Application</title>
          <style>
            .container { max-width: 700px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .button { background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
            .applicant-box { background: #e8f5e9; border: 2px solid #4CAF50; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-section { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            .action-box { background: #fff3e0; border: 2px solid #FF9800; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Project Application!</h1>
              <p style="margin: 5px 0; font-size: 18px;">Someone wants to join your project</p>
            </div>
            <div class="content">
              <h2>Hi ${projectOwnerName || 'Project Owner'},</h2>
              
              <div class="applicant-box">
                <h3 style="color: #2E7D32; margin: 0 0 15px 0;">New Applicant Details</h3>
                <p style="margin: 8px 0;"><strong>Name:</strong> ${applicantName}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${applicantEmail}" style="color: #4CAF50;">${applicantEmail}</a></p>
                <p style="margin: 8px 0;"><strong>Interested Role:</strong> ${roleAppliedFor || 'Not specified'}</p>
                <p style="margin: 8px 0;"><strong>Availability:</strong> ${hoursPerWeek || 'Not specified'} ${hoursPerWeek ? 'hours/week' : ''}</p>
                <p style="margin: 8px 0;"><strong>Can Start:</strong> ${availableStart ? new Date(availableStart).toLocaleDateString() : 'Immediately'}</p>
                ${portfolio && portfolio !== 'Not provided' ? `<p style="margin: 8px 0;"><strong>Portfolio:</strong> <a href="${portfolio}" style="color: #4CAF50;" target="_blank">View Portfolio</a></p>` : ''}
              </div>
              
              <div class="detail-section">
                <h3 style="color: #4CAF50; margin-top: 0;">Project Applied For</h3>
                <p><strong>Project:</strong> ${projectTitle}</p>
                <p><strong>Project Type:</strong> ${projectType || 'Not specified'}</p>
                <p><strong>Application Date:</strong> ${new Date(applicationDate || Date.now()).toLocaleDateString()}</p>
              </div>

              ${experience ? `
              <div class="detail-section">
                <h3 style="color: #4CAF50; margin-top: 0;">Experience</h3>
                <p style="color: #333; line-height: 1.6; white-space: pre-line;">${experience}</p>
              </div>
              ` : ''}

              ${skills ? `
              <div class="detail-section">
                <h3 style="color: #4CAF50; margin-top: 0;">Skills</h3>
                <p style="color: #333; line-height: 1.6;">${skills}</p>
              </div>
              ` : ''}

              ${motivation ? `
              <div class="detail-section">
                <h3 style="color: #4CAF50; margin-top: 0;">Motivation</h3>
                <p style="color: #333; line-height: 1.6; white-space: pre-line; font-style: italic;">"${motivation}"</p>
              </div>
              ` : ''}

              <div class="action-box">
                <h3 style="color: #E65100; margin-top: 0;">Action Required</h3>
                <p style="color: #666; margin: 15px 0;">
                  Review this application and decide whether to approve or reject it.
                  The applicant is waiting to hear from you!
                </p>
                <a href="https://loomiqhq.com/projects/owner-dashboard" class="button">
                  Review Application Now
                </a>
              </div>
              
              <div style="background: #f3e5f5; border: 1px solid #9c27b0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #7b1fa2; margin-top: 0;">Tips for Reviewing Applications:</h4>
                <ul style="color: #7b1fa2; font-size: 14px; margin: 5px 0;">
                  <li>Review their experience and skills carefully</li>
                  <li>Check their portfolio or previous work if provided</li>
                  <li>Consider their availability and commitment level</li>
                  <li>Respond promptly to keep applicants engaged</li>
                  <li>Provide feedback when rejecting to help them improve</li>
                </ul>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This is an exciting opportunity to grow your team and help someone earn their TechTalent Badges! Log in to your dashboard to review the full application and make your decision.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Loomiq ProjectX. All rights reserved.</p>
              <p><em>Where Projects Power Careers</em></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textVersion = `
New Project Application - ${projectTitle}

Hi ${projectOwnerName || 'Project Owner'},

You have received a new application for your project!

APPLICANT DETAILS:
Name: ${applicantName}
Email: ${applicantEmail}
Interested Role: ${roleAppliedFor || 'Not specified'}
Availability: ${hoursPerWeek || 'Not specified'} ${hoursPerWeek ? 'hours/week' : ''}
Can Start: ${availableStart ? new Date(availableStart).toLocaleDateString() : 'Immediately'}
${portfolio && portfolio !== 'Not provided' ? `Portfolio: ${portfolio}` : ''}

PROJECT:
${projectTitle} (${projectType || 'Project'})
Application Date: ${new Date(applicationDate || Date.now()).toLocaleDateString()}

${experience ? `
EXPERIENCE:
${experience}
` : ''}

${skills ? `
SKILLS:
${skills}
` : ''}

${motivation ? `
MOTIVATION:
"${motivation}"
` : ''}

ACTION REQUIRED:
Review this application and decide whether to approve or reject it. The applicant is waiting to hear from you!

Review Application: https://loomiqhq.com/projects/owner-dashboard

TIPS FOR REVIEWING:
- Review their experience and skills carefully
- Check their portfolio or previous work if provided
- Consider their availability and commitment level
- Respond promptly to keep applicants engaged
- Provide feedback when rejecting to help them improve

This is an exciting opportunity to grow your team and help someone earn their TechTalent Badges!

---
Loomiq ProjectX - Where Projects Power Careers
    `;

    console.log('📧 About to send new application email...');
    const result = await transporter.sendMail({
      from: { 
        name: 'Loomiq ProjectX', 
        address: envVars.EMAIL_USER 
      },
      to: projectOwnerEmail,
      replyTo: applicantEmail,
      subject: emailSubject,
      text: textVersion,
      html: htmlTemplate
    });

    console.log('✅ New application email sent successfully:', result.messageId);
    transporter.close();

    return res.status(200).json({ 
      success: true, 
      message: 'New application notification email sent successfully',
      results: [{ 
        type: 'new_application',
        recipient: projectOwnerEmail,
        applicant: applicantName,
        project: projectTitle,
        messageId: result.messageId
      }]
    });

  } catch (error) {
    console.error('❌ Error sending new application email:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false, 
      error: error.message
    });
  }
};
