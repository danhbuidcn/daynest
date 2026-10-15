// Deletes the caller's own account: bug-report images first (Storage has no cascade), then the auth user,
// whose foreign keys remove every row. Safe to call again after a failure. Spec: docs/specs/sprint-7/design/db.md
import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'bug-reports';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL')!;
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: auth } = await asUser.auth.getUser();
  if (!auth.user) return json({ error: 'unauthorized' }, 401);
  const userId = auth.user.id;

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try {
    // Images live in <user_id>/<report_id>/<n>.jpg; list() returns folders (id === null) next to files.
    const stack = [userId];
    while (stack.length > 0) {
      const prefix = stack.pop()!;
      const paths: string[] = [];
      for (let offset = 0; ; offset += 100) {
        const { data: entries, error } = await admin.storage.from(BUCKET).list(prefix, { limit: 100, offset });
        if (error) throw error;
        for (const entry of entries ?? []) (entry.id === null ? stack : paths).push(`${prefix}/${entry.name}`);
        if (!entries || entries.length < 100) break;
      }
      if (paths.length > 0) {
        const { error } = await admin.storage.from(BUCKET).remove(paths);
        if (error) throw error;
      }
    }

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error && !/not.?found/i.test(error.message)) throw error;
    return json({ ok: true });
  } catch (e) {
    console.error('delete-account failed', userId, e instanceof Error ? e.message : e);
    return json({ error: 'failed' }, 500);
  }
});
