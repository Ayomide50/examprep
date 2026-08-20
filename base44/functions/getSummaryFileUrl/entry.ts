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

    // 5. Issue a short-lived signed URL so the raw file is never publicly linkable.
    const result = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: fileUri,
      expires_in: 300,
    });

    return Response.json({
      signed_url: result.signed_url,
      title: summary.title,
      file_name: summary.file_name,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}