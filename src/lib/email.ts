import nodemailer from 'nodemailer'

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = createTransporter()
  
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
  
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Verify your Anoki account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #0ea5e9; text-align: center;">Welcome to Anoki!</h1>
        <p>Thank you for registering with Anoki. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          This verification link will expire in 24 hours. If you didn't create an account with Anoki, you can safely ignore this email.
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const transporter = createTransporter()
  
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Reset your Anoki password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #0ea5e9; text-align: center;">Password Reset Request</h1>
        <p>You requested to reset your password for your Anoki account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendWelcomeEmail(email: string, name: string) {
  const transporter = createTransporter()
  
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Welcome to Anoki!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #0ea5e9; text-align: center;">Welcome to Anoki, ${name}!</h1>
        <p>Your account has been successfully created and verified. You now have access to all of Anoki's powerful tools:</p>
        <ul style="margin: 20px 0; padding-left: 20px;">
          <li>AI Tools Directory - Access to popular AI agents</li>
          <li>File Converters - Convert between different file formats</li>
          <li>AI/Plagiarism Detectors - Detect AI-generated content</li>
          <li>Image/Video Editors - Edit and enhance your media</li>
          <li>Quality Enhancers - Improve resolution and quality</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}" 
             style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Start Using Anoki
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          If you have any questions or need help getting started, feel free to contact our support team.
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
