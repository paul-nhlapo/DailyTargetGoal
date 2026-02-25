// Removed: Google OAuth start endpoint. Supabase-only application.
export const dynamic = 'force-static'
export async function POST() { return new Response(null, { status: 410 }) }
