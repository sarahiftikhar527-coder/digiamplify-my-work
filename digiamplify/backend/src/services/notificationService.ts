import nodemailer from 'nodemailer';
import twilio from 'twilio';


const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER || 'no-reply@digiamplify.com';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;


let emailTransporter: nodemailer.Transporter | null = null;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  try {
    emailTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, 
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log('SMTP Email Transporter initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize SMTP Email Transporter:', error);
  }
}


let twilioClient: any = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER) {
  try {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('Twilio SMS Client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Twilio SMS Client:', error);
  }
}

export const sendEmail = async (to: string, subject: string, html: string, text: string): Promise<boolean> => {
  if (emailTransporter) {
    try {
      await emailTransporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        text,
        html,
      });
      console.log(`[EMAIL] Professional notification successfully sent to: ${to}`);
      return true;
    } catch (error) {
      console.error(`[EMAIL] Error occurred while sending email to ${to}:`, error);
      
    }
  }

  
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log('│             [MOCK SMTP EMAIL SEND SIMULATION]          │');
  console.log('├────────────────────────────────────────────────────────┤');
  console.log(`│ TO:      ${to.padEnd(46)} │`);
  console.log(`│ FROM:    ${EMAIL_FROM.padEnd(46)} │`);
  console.log(`│ SUBJECT: ${subject.substring(0, 46).padEnd(46)} │`);
  console.log('├────────────────────────────────────────────────────────┤');
  console.log('│ TEXT BODY:                                             │');
  const lines = text.split('\n');
  for (const line of lines) {
    const chunkedLine = line.match(/.{1,50}/g) || [line];
    for (const chunk of chunkedLine) {
      console.log(`│   ${chunk.padEnd(52)} │`);
    }
  }
  console.log('└────────────────────────────────────────────────────────┘\n');
  return true;
};

export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  if (twilioClient && TWILIO_FROM_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: TWILIO_FROM_NUMBER,
        to,
      });
      console.log(`[SMS] Notification successfully dispatched to: ${to}`);
      return true;
    } catch (error) {
      console.error(`[SMS] Error occurred while sending SMS to ${to}:`, error);
      
    }
  }

  
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log('│               [MOCK TWILIO SMS SIMULATION]             │');
  console.log('├────────────────────────────────────────────────────────┤');
  console.log(`│ TO:      ${to.padEnd(46)} │`);
  console.log(`│ FROM:    ${(TWILIO_FROM_NUMBER || 'MOCK_TWILIO').padEnd(46)} │`);
  console.log('├────────────────────────────────────────────────────────┤');
  console.log('│ MESSAGE BODY:                                          │');
  const lines = message.split('\n');
  for (const line of lines) {
    const chunkedLine = line.match(/.{1,50}/g) || [line];
    for (const chunk of chunkedLine) {
      console.log(`│   ${chunk.padEnd(52)} │`);
    }
  }
  console.log('└────────────────────────────────────────────────────────┘\n');
  return true;
};
