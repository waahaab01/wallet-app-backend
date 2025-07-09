const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendMail = async ({ to, subject, html }) => {
  try {
    console.log('sendMail called with:', { to, subject });
    if (!to || typeof to !== 'string' || !to.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      console.error('sendMail error: Invalid or missing email address:', to, typeof to, JSON.stringify(to));
      console.trace('sendMail stack trace');
      throw new Error('Invalid or missing email address');
    }
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    console.log('sendMail success:', result);
    return result;
  } catch (err) {
    console.error('sendMail exception:', err);
    console.trace('sendMail exception stack trace');
    throw err;
  }
};

const getTemplate = (templateName, variables) => {
  const templatePath = path.join(__dirname, '../templates', templateName);
  let html = fs.readFileSync(templatePath, 'utf8');
  for (const key in variables) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
  }
  return html;
};

module.exports = { sendMail, getTemplate };
