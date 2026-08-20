import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized', code: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const summaryId = body.summary_id;
    if (!summaryId) return Response.json({ error: 'Missing summary id' }, { status: 400 });

    // 1. Load student profile (user-scoped).
    const profiles = await base44.entities.StudentProfile.filter({ user_id: user.id });
    const profile = profiles && profiles[0];

    // 2. Activation check.
    if (!profile || !profile.is_activated) {
      return Response.json({ error: 'Account not activated', code: 'not_activated' }, { status: 403 });
    }

    // 3. Load the summary (service role to bypass any RLS).
    const summary = await base44.asServiceRole.entities.CourseSummary.get(summaryId);
    if (!summary || summary.is_active === false) {
      return Response.json({ error: 'Summary not available', code: 'not_found' }, { status: 404 });
    }

    // 4. Department authorization — student may only read summaries for their own department.
    if (summary.department_id && profile.department_id && summary.department_id !== profile.department_id) {
      return Response.json({ error: 'Not authorized for this summary', code: 'not_authorized' }, { status: 403 });
    }

    const fileUri = summary.file_uri || summary.file_url;
    if (!fileUri) return Response.json({ error: 'Summary file missing', code: 'no_file' }, { status: 404 });

    // 5. Issue a short-lived signed URL, fetch the bytes server-side, and stream
    //    them back so the raw Base44 storage link is never exposed to the client.
    const result = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: fileUri,
      expires_in: 60,
    });

    const fileRes = await fetch(result.signed_url);
    if (!fileRes.ok) {
      return Response.json({ error: 'Failed to fetch summary file', code: 'fetch_failed' }, { status: 502 });
    }

    const fileName = (summary.file_name || `${summary.title || 'summary'}.pdf`).replace(/"/g, '');
    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Cache-Control', 'no-store');

    return new Response(fileRes.body, { status: 200, headers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}