// api/notifications/send-project-review-rejected.js

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      projectOwnerEmail,
      projectOwnerName,
      projectTitle,
      groupId,
      rejectionReason,
      rejectionDate,
      adminEmail,
      resubmissionUrl
    } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const formattedDate = new Date(rejectionDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Project Review Update</h1>
              <p style="color: #FFF3E0; margin: 10px 0 0 0; font-size: 16px;">Revision Required</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${projectOwnerName}</strong>,
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for submitting your project <strong>"${projectTitle}"</strong> for completion review. 
                After careful examination, we need you to make some revisions before we can approve the project.
              </p>

              <!-- Rejection Reason Box -->
              <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h3 style="color: #F57C00; margin: 0 0 10px 0; font-size: 18px;">Required Changes:</h3>
                <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-line;">${rejectionReason}</p>
              </div>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                <strong>What happens next?</strong>
              </p>

              <ol style="color: #333333; font-size: 15px; line-height: 1.8; margin: 0 0 25px 0; padding-left: 20px;">
                <li>Address the issues mentioned above</li>
                <li>Update your project repository accordingly</li>
                <li>Return to your group page and resubmit for review</li>
                <li>Our team will review your updated submission</li>
              </ol>

              <!-- Important Notes -->
              <div style="background-color: #E3F2FD; border-left: 4px solid #2196F3; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <p style="color: #1976D2; font-size: 14px; line-height: 1.6; margin: 0; font-weight: bold;">
                  Common Issues to Check:
                </p>
                <ul style="color: #333333; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Repository must be public and accessible</li>
                  <li>Loomiq must be added as a collaborator</li>
                  <li>All team member names should be visible in the project</li>
                  <li>Repository URL should be valid and working</li>
                  <li>Project should be complete and functional</li>
                </ul>
              </div>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                We appreciate your hard work and look forward to seeing your improved submission!
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resubmissionUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 25px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(245, 124, 0, 0.3);">
                      Go to Group Page
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Project Details -->
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <h4 style="color: #666666; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Submission Details</h4>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #999999; font-size: 14px; width: 40%;">Project:</td>
                    <td style="color: #333333; font-size: 14px; font-weight: bold;">${projectTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #999999; font-size: 14px;">Review Date:</td>
                    <td style="color: #333333; font-size: 14px;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #999999; font-size: 14px;">Group ID:</td>
                    <td style="color: #333333; font-size: 14px; font-family: monospace;">${groupId}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                Need help? Contact us at <a href="mailto:support@loomiqhq.com" style="color: #FF9800; text-decoration: none;">support@loomiqhq.com</a>
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Loomiq ProjectX | Building Tomorrow's Tech Leaders
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const mailOptions = {
      from: `"Loomiq" <${process.env.EMAIL_USER}>`,
      to: projectOwnerEmail,
      subject: `Project Review Update: "${projectTitle}" - Revision Required`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);

    console.log('✅ Project rejection email sent to:', projectOwnerEmail);
    res.status(200).json({ 
      success: true, 
      message: 'Project rejection email sent successfully' 
    });

  } catch (error) {
    console.error('❌ Error sending project rejection email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
