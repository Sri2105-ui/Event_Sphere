import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Ethereal mock/test account creation or fallback
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email Service]: Created Ethereal test inbox (${testAccount.user})`);
    } catch {
      // Direct console logger fallback
      transporter = {
        sendMail: async (options) => {
          console.log(`[Mock Email Sent to ${options.to}]: ${options.subject}`);
          return { messageId: `mock-${Date.now()}` };
        }
      };
    }
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailClient = await getTransporter();
    const info = await mailClient.sendMail({
      from: process.env.EMAIL_FROM || '"EventSphere" <no-reply@eventsphere.edu>',
      to,
      subject,
      text: text || '',
      html
    });

    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Preview]: ${previewUrl}`);
      }
    }

    return info;
  } catch (error) {
    console.error('[Email Sending Error]:', error.message);
    // Don't crash caller if email fails
    return null;
  }
};

export const sendRegistrationEmail = async (user, event, registration) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">EventSphere</h1>
        <p style="color: #64748b; margin-top: 4px;">Your Registration is Confirmed!</p>
      </div>
      
      <div style="background-color: #f8fafc; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 20px;">${event.title}</h2>
        <p style="margin: 4px 0; color: #475569;"><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()} at ${new Date(event.startDate).toLocaleTimeString()}</p>
        <p style="margin: 4px 0; color: #475569;"><strong>Venue:</strong> ${event.venueName}, ${event.address}</p>
        <p style="margin: 4px 0; color: #475569;"><strong>Registration #:</strong> ${registration.registrationNumber}</p>
        <p style="margin: 4px 0; color: #475569;"><strong>Ticket Hash:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${registration.ticketHash}</code></p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <p style="color: #334155; font-size: 15px;">Bring your digital ticket QR code or show your Registration # at the entrance counter for instant check-in.</p>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Sent by EventSphere Campus Management System. Questions? Contact your event coordinator.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Confirmed: Ticket for ${event.title}`,
    html
  });
};

export const sendCertificateEmail = async (user, event, certificate) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fde047; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #d97706; margin: 0;">🎓 Certificate Issued!</h1>
        <p style="color: #475569;">Congratulations on completing ${event.title}</p>
      </div>
      <div style="background: #fffbeb; border: 1px solid #fef08a; padding: 18px; border-radius: 8px;">
        <p style="margin: 6px 0;"><strong>Recipient:</strong> ${certificate.recipientName}</p>
        <p style="margin: 6px 0;"><strong>Certificate Number:</strong> ${certificate.certificateNumber}</p>
        <p style="margin: 6px 0;"><strong>Verification Code:</strong> <code>${certificate.verificationCode}</code></p>
      </div>
      <p style="margin-top: 20px; text-align: center;">You can view, download, or share your verifiable digital certificate anytime from your EventSphere participant dashboard.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Your Certificate for ${event.title}`,
    html
  });
};
