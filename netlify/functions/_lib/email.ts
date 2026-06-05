/**
 * OWNER: P3 (AI)
 * Sends the post-lecture feedback report to the teacher via Resend.
 * No-op (returns { skipped: true }) when RESEND_API_KEY is not configured.
 */
import { Resend } from 'resend';
import type { FeedbackReport } from '../../../shared/types';

interface SendArgs {
  lectureTitle: string;
  lectureSubject: string;
  report: FeedbackReport;
}

interface SendResult {
  skipped?: boolean;
  reason?: string;
  id?: string;
}

export async function sendFeedbackReportEmail(args: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REPORT_EMAIL_TO;
  const from = process.env.RESEND_FROM_EMAIL ?? 'Kürsü <onboarding@resend.dev>';

  if (!apiKey) return { skipped: true, reason: 'RESEND_API_KEY not set' };
  if (!to) return { skipped: true, reason: 'REPORT_EMAIL_TO not set' };

  const resend = new Resend(apiKey);
  const html = renderHtml(args);
  const subject = `Kürsü • Ders Raporu: ${args.lectureTitle}`;

  const res = await resend.emails.send({ from, to, subject, html });
  if (res.error) throw new Error(`resend: ${res.error.message}`);
  return { id: res.data?.id };
}

function renderHtml({ lectureTitle, lectureSubject, report }: SendArgs): string {
  const score = (label: string, value: number) =>
    `<td style="padding:12px 16px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;text-align:center">
       <div style="font-size:11px;letter-spacing:.06em;color:#6b7280;text-transform:uppercase">${label}</div>
       <div style="font-size:28px;font-weight:700;color:#111827;margin-top:4px">${value}<span style="font-size:14px;color:#6b7280">/100</span></div>
     </td>`;

  const rushed = report.rushedConcepts.length
    ? `<ul style="margin:8px 0 0;padding-left:20px;color:#374151">${report.rushedConcepts
        .map(
          (c) =>
            `<li style="margin:4px 0"><strong>${esc(c.concept)}</strong> <span style="color:#6b7280">(${esc(c.timestamp)})</span> — ${esc(c.reason)}</li>`,
        )
        .join('')}</ul>`
    : `<p style="color:#6b7280;margin:8px 0 0">Aceleye gelen bir kavram tespit edilmedi.</p>`;

  const confusion = report.topConfusionPoints.length
    ? `<ul style="margin:8px 0 0;padding-left:20px;color:#374151">${report.topConfusionPoints
        .map(
          (c) =>
            `<li style="margin:4px 0"><strong>${esc(c.theme)}</strong> <span style="color:#6b7280">(${c.question_count} soru)</span><br/><em style="color:#6b7280">"${esc(c.sample_quote)}"</em></li>`,
        )
        .join('')}</ul>`
    : `<p style="color:#6b7280;margin:8px 0 0">Kafa karışıklığı yaratan bir tema öne çıkmadı.</p>`;

  const improvements = report.suggestedImprovements.length
    ? `<ol style="margin:8px 0 0;padding-left:20px;color:#374151">${report.suggestedImprovements
        .map((s) => `<li style="margin:4px 0">${esc(s)}</li>`)
        .join('')}</ol>`
    : `<p style="color:#6b7280;margin:8px 0 0">Bu ders için ek öneri yok.</p>`;

  return `<!doctype html>
<html lang="tr">
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
    <tr><td style="padding:24px 28px;border-bottom:1px solid #e5e7eb">
      <div style="font-size:12px;letter-spacing:.08em;color:#6b7280;text-transform:uppercase">Kürsü • Ders Sonu Raporu</div>
      <h1 style="margin:6px 0 0;font-size:22px;color:#111827">${esc(lectureTitle)}</h1>
      <div style="margin-top:2px;color:#6b7280">${esc(lectureSubject)}</div>
    </td></tr>

    <tr><td style="padding:20px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="8">
        <tr>
          ${score('Anlaşılırlık', report.overallClarityScore)}
          ${score('Tempo', report.overallPacingScore)}
          ${score('Etkileşim', report.overallEngagementScore)}
        </tr>
      </table>
    </td></tr>

    <tr><td style="padding:0 28px 20px">
      <h2 style="font-size:15px;margin:16px 0 0;color:#111827">Aceleye gelen kavramlar</h2>
      ${rushed}

      <h2 style="font-size:15px;margin:20px 0 0;color:#111827">En çok kafa karıştıran konular</h2>
      ${confusion}

      <h2 style="font-size:15px;margin:20px 0 0;color:#111827">Önerilen iyileştirmeler</h2>
      ${improvements}
    </td></tr>

    <tr><td style="padding:16px 28px;border-top:1px solid #e5e7eb;background:#f9fafb;color:#6b7280;font-size:12px">
      Bu rapor ders bitiminde otomatik olarak oluşturuldu. Tam rapora Kürsü panelinden ulaşabilirsiniz.
    </td></tr>
  </table>
</body>
</html>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
