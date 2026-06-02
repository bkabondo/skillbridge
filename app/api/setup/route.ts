import { Pool } from 'pg'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('token') !== process.env.SETUP_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS skillbridge_users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL UNIQUE, full_name TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('admin','user')),
        neighborhood TEXT, bio TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      GRANT ALL ON skillbridge_users TO anon, authenticated;
      ALTER TABLE skillbridge_users ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sb_users_self' AND tablename='skillbridge_users') THEN
          CREATE POLICY "sb_users_self" ON skillbridge_users FOR ALL USING (true);
        END IF;
      END $$;
      CREATE TABLE IF NOT EXISTS skillbridge_skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES skillbridge_users(id) ON DELETE CASCADE,
        title TEXT NOT NULL, description TEXT,
        type TEXT NOT NULL CHECK (type IN ('offer','want')),
        category TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      GRANT ALL ON skillbridge_skills TO anon, authenticated;
      ALTER TABLE skillbridge_skills ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sb_skills_all' AND tablename='skillbridge_skills') THEN
          CREATE POLICY "sb_skills_all" ON skillbridge_skills FOR ALL USING (true);
        END IF;
      END $$;
      CREATE TABLE IF NOT EXISTS skillbridge_exchanges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        requester_id UUID NOT NULL REFERENCES skillbridge_users(id) ON DELETE CASCADE,
        provider_id UUID NOT NULL REFERENCES skillbridge_users(id) ON DELETE CASCADE,
        offer_skill_id UUID REFERENCES skillbridge_skills(id),
        want_skill_id UUID REFERENCES skillbridge_skills(id),
        message TEXT, status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      GRANT ALL ON skillbridge_exchanges TO anon, authenticated;
      ALTER TABLE skillbridge_exchanges ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sb_exchanges_parties' AND tablename='skillbridge_exchanges') THEN
          CREATE POLICY "sb_exchanges_parties" ON skillbridge_exchanges FOR ALL USING (requester_id=auth.uid() OR provider_id=auth.uid() OR (SELECT role FROM skillbridge_users WHERE id=auth.uid())='admin');
        END IF;
      END $$;
      CREATE TABLE IF NOT EXISTS skillbridge_matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES skillbridge_users(id) ON DELETE CASCADE,
        matched_user_id UUID NOT NULL REFERENCES skillbridge_users(id) ON DELETE CASCADE,
        match_reason TEXT,
        ai_generated BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      GRANT ALL ON skillbridge_matches TO anon, authenticated;
      ALTER TABLE skillbridge_matches ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sb_matches_all' AND tablename='skillbridge_matches') THEN
          CREATE POLICY "sb_matches_all" ON skillbridge_matches FOR ALL USING (true);
        END IF;
      END $$;
    `)
    return NextResponse.json({ status: 'Migration complete' })
  } catch (e: unknown) {
    const error = e as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    client.release()
    await pool.end()
  }
}
