import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { password } = body;

    const adminPassword = Deno.env.get("ADMIN_PANEL_PASSWORD");
    if (!adminPassword) {
      return Response.json({ error: 'Admin password not configured' }, { status: 500 });
    }

    const isMatch = password === adminPassword;
    return Response.json({ authorized: isMatch });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});