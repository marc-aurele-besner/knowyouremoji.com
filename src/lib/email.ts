import { Resend } from 'resend';
import { getEnv } from '@/lib/env';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Check if the email service is configured.
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

/**
 * Send a verification email to a newly registered user.
 */
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const env = getEnv();
  const verifyUrl = `${env.appUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || `noreply@${env.appName.toLowerCase()}.com`,
    to: email,
    subject: `Verify your ${env.appName} account`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to ${env.appName}!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Verify Email
        </a>
        <p style="margin-top: 16px; color: #666; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        <p style="margin-top: 16px; color: #999; font-size: 12px;">
          Or copy this link: ${verifyUrl}
        </p>
      </div>
    `,
  });

  return !error;
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const env = getEnv();
  const resetUrl = `${env.appUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || `noreply@${env.appName.toLowerCase()}.com`,
    to: email,
    subject: `Reset your ${env.appName} password`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Click the button below to set a new password for your ${env.appName} account.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reset Password
        </a>
        <p style="margin-top: 16px; color: #666; font-size: 14px;">
          This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="margin-top: 16px; color: #999; font-size: 12px;">
          Or copy this link: ${resetUrl}
        </p>
      </div>
    `,
  });

  return !error;
}

/**
 * Send a magic link email for passwordless sign-in.
 */
export async function sendMagicLinkEmail(email: string, url: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const env = getEnv();

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || `noreply@${env.appName.toLowerCase()}.com`,
    to: email,
    subject: `Sign in to ${env.appName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Sign in to ${env.appName}</h2>
        <p>Click the button below to sign in to your account.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Sign In
        </a>
        <p style="margin-top: 16px; color: #666; font-size: 14px;">
          This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
        </p>
        <p style="margin-top: 16px; color: #999; font-size: 12px;">
          Or copy this link: ${url}
        </p>
      </div>
    `,
  });

  return !error;
}

/**
 * Clear the cached Resend client (for testing).
 */
export function clearResendClient(): void {
  resendClient = null;
}
