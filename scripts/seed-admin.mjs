/**
 * Seed / promote a super-admin for TailorLink.pk.
 *
 * Role authority lives in Supabase `app_metadata` (service-role-only, not
 * user-editable). This script creates — or promotes an existing — auth user
 * for the given phone, stamps `app_metadata.role = 'super_admin'`, and keeps
 * the `public.users` record in sync so the app's data layer sees the admin.
 *
 * The admin logs in with the normal phone-OTP flow afterwards; the session
 * then carries the super_admin role that middleware + requireRole read.
 *
 * Usage:
 *   npm run seed:admin -- +923001234567 "Super" "Admin"
 *   SEED_ADMIN_PHONE=+923001234567 npm run seed:admin
 *
 * Optional env:
 *   SEED_ADMIN_PASSWORD  also set a password (OTP login does not need it)
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

config({ path: '.env.local' })
config({ path: '.env' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const phone = process.argv[2] || process.env.SEED_ADMIN_PHONE
const firstName = process.argv[3] || process.env.SEED_ADMIN_FIRST_NAME || 'Super'
const lastName = process.argv[4] || process.env.SEED_ADMIN_LAST_NAME || 'Admin'

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  fail(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Add them to .env.local before seeding.'
  )
}

if (!phone || !/^\+92\d{10}$/.test(phone)) {
  fail(
    'Provide a valid phone in +92XXXXXXXXXX format, e.g.\n' +
      '  npm run seed:admin -- +923001234567 "Super" "Admin"'
  )
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Supabase stores phone digits without the leading "+".
const phoneDigits = phone.replace(/^\+/, '')

async function findAuthUserByPhone() {
  let page = 1
  // Paginate defensively; a fresh project has few users.
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) fail(`Failed to list auth users: ${error.message}`)
    const match = data.users.find(
      (u) => u.phone === phoneDigits || u.phone === phone
    )
    if (match) return match
    if (data.users.length < 200) return null
    page += 1
  }
}

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD || randomUUID()
  const appMetadata = { role: 'super_admin' }
  const userMetadata = { role: 'super_admin' }

  let authUser = await findAuthUserByPhone()

  if (authUser) {
    const { data, error } = await admin.auth.admin.updateUserById(authUser.id, {
      app_metadata: appMetadata,
      user_metadata: { ...(authUser.user_metadata || {}), ...userMetadata },
      phone_confirm: true,
    })
    if (error) fail(`Failed to promote existing auth user: ${error.message}`)
    authUser = data.user
    console.log(`↑ Promoted existing auth user ${authUser.id} to super_admin`)
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      phone,
      password,
      phone_confirm: true,
      app_metadata: appMetadata,
      user_metadata: userMetadata,
    })
    if (error) fail(`Failed to create auth user: ${error.message}`)
    authUser = data.user
    console.log(`＋ Created auth user ${authUser.id}`)
    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log('  (a random password was set; log in with phone OTP)')
    }
  }

  // Keep public.users in sync. updated_at must be supplied for raw upserts
  // because Prisma's @updatedAt is application-level, not a DB default.
  const { error: upsertError } = await admin
    .from('users')
    .upsert(
      {
        id: authUser.id,
        phone,
        role: 'super_admin',
        first_name: firstName,
        last_name: lastName,
        is_active: true,
        phone_verified: true,
        metadata: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
  if (upsertError) fail(`Failed to upsert public.users: ${upsertError.message}`)

  console.log('\n✓ Super-admin ready.')
  console.log(`   phone : ${phone}`)
  console.log(`   name  : ${firstName} ${lastName}`)
  console.log('   Log in via the normal OTP flow, then open /admin/dashboard.\n')
}

main().catch((err) => fail(err?.message || String(err)))
