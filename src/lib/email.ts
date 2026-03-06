import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({
  to,
  name,
  waitlistName,
  position,
  referralLink,
}: {
  to: string;
  name: string;
  waitlistName: string;
  position: number;
  referralLink: string;
}) {
  await resend.emails.send({
    from: "QueuePath <noreply@yourdomain.com>",
    to,
    subject: `You're on the ${waitlistName} waitlist! 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Welcome, ${name}!</h2>
        <p>You're <strong>#${position}</strong> on the <strong>${waitlistName}</strong> waitlist.</p>
        <p>Move up faster by sharing your referral link:</p>
        <a href="${referralLink}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Share my link
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">
          ${referralLink}
        </p>
      </div>
    `,
  });
}