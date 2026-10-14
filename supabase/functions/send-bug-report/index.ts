// Emails a saved bug report (with its images) to every address in developer_emails.
// The app calls it after inserting the report and uploading the images; spec: docs/specs/sprint-5/design/db.md#báo-lỗi
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL')!;
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: auth } = await asUser.auth.getUser();
  if (!auth.user) return json({ error: 'unauthorized' }, 401);

  const { report_id: reportId } = await req.json().catch(() => ({}));
  if (typeof reportId !== 'string') return json({ error: 'bad_request' }, 400);

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: report } = await admin.from('bug_reports').select('*').eq('id', reportId).maybeSingle();
  if (!report || report.user_id !== auth.user.id) return json({ error: 'not_found' }, 404);
  if (report.email_sent_at) return json({ ok: true });

  // Mail errors keep email_sent_at null and still answer 200: the report is saved, the user need not retry.
  try {
    const { data: rows, error } = await admin.from('developer_emails').select('email');
    if (error) throw error;
    const to = (rows ?? []).map((r) => r.email as string);
    if (to.length === 0) throw new Error('no developer_emails');

    const attachments = [];
    for (const path of report.images as string[]) {
      const { data: file, error: download } = await admin.storage.from('bug-reports').download(path);
      if (download) throw download;
      attachments.push({ filename: path.split('/').pop(), content: new Uint8Array(await file.arrayBuffer()) });
    }

    const user = Deno.env.get('GMAIL_USER')!;
    const mailer = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass: Deno.env.get('GMAIL_APP_PASSWORD')! },
    });
    await mailer.sendMail({
      from: `Daynest <${user}>`,
      to,
      replyTo: auth.user.email,
      subject: `[Daynest] Báo lỗi ${report.app_version ?? ''} — ${auth.user.email ?? auth.user.id}`,
      text: [
        report.body,
        '',
        `Máy: ${report.device ?? ''}`,
        `Hệ điều hành: ${report.os ?? ''}`,
        `Ngôn ngữ: ${report.locale ?? ''}`,
        `Thời gian: ${report.created_at}`,
        `Mã báo cáo: ${report.id}`,
      ].join('\n'),
      attachments,
    });

    await admin.from('bug_reports').update({ email_sent_at: new Date().toISOString() }).eq('id', reportId);
    return json({ ok: true });
  } catch (e) {
    console.error('send-bug-report failed', reportId, e instanceof Error ? e.message : e);
    return json({ ok: true, emailed: false });
  }
});
