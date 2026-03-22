const nodemailer = require('nodemailer');
const twilio = require('twilio');

/**
 * Sends an email notification to multiple recipients
 * @param {Array} emails - List of recipient emails
 * @param {String} subject - Email subject
 * @param {String} text - Email body
 */
const sendEmail = async (emails, subject, text) => {
  try {
    console.log('📧 Attempting to send emails to:', emails.length, 'recipients');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-password') {
      console.log('⚠️ Email notification skipped: Credentials not configured in .env. EMAIL_USER:', process.env.EMAIL_USER ? 'set' : 'not set');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: (Number(process.env.EMAIL_PORT) === 465 || !process.env.EMAIL_PORT), 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Xtreme Cr8ivity" <${process.env.EMAIL_USER}>`,
      to: emails.join(','),
      subject: subject,
      text: text,
    };

    console.log('📤 Sending email via:', process.env.EMAIL_HOST || 'smtp.gmail.com');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Emails sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return false;
  }
};

/**
 * Sends a WhatsApp notification via Twilio
 * @param {String} phone - Recipient phone number (with country code)
 * @param {String} message - Message content
 */
const sendWhatsApp = async (phone, message) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || accountSid === 'your_twilio_sid' || !authToken || authToken === 'your_twilio_token') {
      console.log('⚠️ WhatsApp notification skipped: Twilio credentials not configured in .env');
      return false;
    }

    const client = twilio(accountSid, authToken);

    // Ensure phone number is in correct format for WhatsApp (whatsapp:+1234567890)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('whatsapp:')) {
      // Remove any non-digit characters if it's just a raw number
      const digits = formattedPhone.replace(/\D/g, '');
      // Ensure it has a plus if it's not already prefixed
      formattedPhone = `whatsapp:+${digits}`;
    }

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: formattedPhone,
      body: message,
    });

    console.log('✅ WhatsApp sent to %s: %s', formattedPhone, result.sid);
    return true;
  } catch (error) {
    console.error('❌ Error sending WhatsApp to %s: %s', phone, error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendWhatsApp,
};
