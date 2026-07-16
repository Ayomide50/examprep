Deno.serve(async (req) => {
  try {
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