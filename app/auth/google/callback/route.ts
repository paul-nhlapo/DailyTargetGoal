// Removed: Google OAuth callback. Supabase-only application.
export const dynamic = 'force-static'
export async function GET() { return new Response(null, { status: 410 }) }
