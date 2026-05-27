import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = "TalentBridge <noreply@talentbridge.io>";
const ADMIN_EMAIL = "laura@concat.tech";

export interface IntroRequestEmailData {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  clientEmail: string;
  clientName: string | null;
  matchScore: number;
}

export async function sendIntroRequestEmails(data: IntroRequestEmailData) {
  if (!resend) {
    // Email not configured — log so it's visible in dev
    console.log("[EMAIL] Intro request (RESEND_API_KEY not set):", data);
    return;
  }

  await Promise.all([
    // Email to candidate
    resend.emails.send({
      from: FROM,
      to: data.candidateEmail,
      subject: `A company is interested in your profile — ${data.jobTitle}`,
      html: `
        <p>Hi ${data.candidateName},</p>
        <p>Great news! A company has shown interest in your profile for the role of <strong>${data.jobTitle}</strong>.</p>
        <p>Our team will be in touch with you shortly to arrange an introduction.</p>
        <p>In the meantime, make sure your profile is up to date.</p>
        <br/>
        <p>Best,<br/>The TalentBridge Team</p>
      `,
    }),

    // Email to admin
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New intro request — ${data.jobTitle}`,
      html: `
        <h2>New Intro Request</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px">
          <tr><td style="padding:6px 0;color:#666">Candidate</td><td style="padding:6px 0;font-weight:bold">${data.candidateName}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Candidate email</td><td style="padding:6px 0">${data.candidateEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Role</td><td style="padding:6px 0;font-weight:bold">${data.jobTitle}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Client</td><td style="padding:6px 0">${data.clientName ?? data.clientEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Client email</td><td style="padding:6px 0">${data.clientEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Match score</td><td style="padding:6px 0">${data.matchScore}%</td></tr>
        </table>
        <br/>
        <p style="color:#888;font-size:13px">Log in to TalentBridge to manage this request.</p>
      `,
    }),
  ]);
}
