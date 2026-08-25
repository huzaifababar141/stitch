/**
 * Seed / promote an admin for TailorLink.pk.
 *
 * Supports two login methods:
 *   • EMAIL + PASSWORD  → logs in at /admin/login  (recommended for admins)
 *   • PHONE + OTP        → logs in via the OTP flow  (legacy / customer-style)
 *
 * Role authority lives in Supabase `app_metadata` (service-role-only, not
 * user-editable). This script creates — or promotes an existing — auth user,
 * stamps `app_metadata.role = 'super_admin'` (and mirrors it into
 * user_metadata so the login page's client-side role check also passes), and
 * keeps the `public.users` record in sync so the app's data layer sees the admin.
 *
 * Usage:
 *   # Email admin (logs in at /admin/login with email + password):
 *   npm run seed:admin -- admin@tailorlink.pk "StrongPass#123" "Super" "Admin"
 *
 *   # Phone admin (logs in via OTP):
 *   npm run seed:admin -- +923001234567 "Super" "Admin"
 *
 * Env alternatives: SEED_ADMIN_EMAIL / SEED_ADMIN_PHONE, SEED_ADMIN_PASSWORD,
 * SEED_ADMIN_FIRST_NAME, SEED_ADMIN_LAST_NAME.
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

config({ path: '.env.local' })
config({ path: '.env' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  fail(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Add real values to .env.local before seeding.'
  )
}

const identifier =
  process.argv[2] || process.env.SEED_ADMIN_EMAIL || process.env.SEED_ADMIN_PHONE

if (!identifier) {
  fail(
    'Provide an admin email or phone, e.g.\n' +
      '  npm run seed:admin -- admin@tailorlink.pk "StrongPass#123" "Super" "Admin"\n' +
      '  npm run seed:admin -- +923001234567 "Super" "Admin"'
  )
}

const isEmail = identifier.includes('@')

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const APP_METADATA = { role: 'super_admin' }

// public.users.phone is UNIQUE NOT NULL, so an email-only admin still needs a
// phone value. Generate a unique +92 placeholder when none exists.
function genPlaceholderPhone() {
  const digits = String(Math.floor(Math.random() * 1e10)).padStart(10, '0')
  return `+92${digits}`
}

async function findAuthUser(predicate) {
  let page = 1
  // Paginate defensively; a fresh project has few users.
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) fail(`Failed to list auth users: ${error.message}`)
    const match = data.users.find(predicate)
    if (match) return match
    if (data.users.length < 200) return null
    page += 1
  }
}

async function upsertPublicUser(authUser, { email, phone, firstName, lastName }) {
  // Preserve an existing phone; otherwise use the provided one or a placeholder.
  const { data: existing } = await admin
    .from('users')
    .select('phone')
    .eq('id', authUser.id)
    .maybeSingle()

  const phoneForDb = phone || existing?.phone || genPlaceholderPhone()

  // updated_at must be supplied for raw upserts because Prisma's @updatedAt is
  // application-level, not a DB default.
  const row = {
    id: authUser.id,
    role: 'super_admin',
    first_name: firstName,
    last_name: lastName,
    phone: phoneForDb,
    is_active: true,
    metadata: {},
    updated_at: new Date().toISOString(),
  }
  if (email) {
    row.email = email.toLowerCase()
    row.email_verified = true
  } else {
    row.phone_verified = true
  }

  const { error } = await admin.from('users').upsert(row, { onConflict: 'id' })
  if (error) fail(`Failed to upsert public.users: ${error.message}`)
}

async function seedEmailAdmin() {
  const email = identifier.toLowerCase()
  const password = process.argv[3] || process.env.SEED_ADMIN_PASSWORD
  const firstName = process.argv[4] || process.env.SEED_ADMIN_FIRST_NAME || 'Super'
  const lastName = process.argv[5] || process.env.SEED_ADMIN_LAST_NAME || 'Admin'

  if (!password || password.length < 8) {
    fail(
      'Email admins need a password (min 8 chars). Usage:\n' +
        '  npm run seed:admin -- admin@tailorlink.pk "StrongPass#123" "Super" "Admin"'
    )
  }

  let authUser = await findAuthUser((u) => u.email?.toLowerCase() === email)

  if (authUser) {
    const { data, error } = await admin.auth.admin.updateUserById(authUser.id, {
      email,
      password,
      email_confirm: true,
      app_metadata: APP_METADATA,
      user_metadata: { ...(authUser.user_metadata || {}), role: 'super_admin' },
    })
    if (error) fail(`Failed to promote existing auth user: ${error.message}`)
    authUser = data.user
    console.log(`↑ Promoted existing auth user ${authUser.id} to super_admin (password reset)`)
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: APP_METADATA,
      user_metadata: { role: 'super_admin' },
    })
    if (error) fail(`Failed to create auth user: ${error.message}`)
    authUser = data.user
    console.log(`＋ Created auth user ${authUser.id}`)
  }

  await upsertPublicUser(authUser, { email, firstName, lastName })

  console.log('\n✓ Super-admin ready (email + password).')
  console.log(`   email : ${email}`)
  console.log(`   name  : ${firstName} ${lastName}`)
  console.log('   Log in at /admin/login with this email + password.\n')
}

async function seedPhoneAdmin() {
  const phone = identifier
  const firstName = process.argv[3] || process.env.SEED_ADMIN_FIRST_NAME || 'Super'
  const lastName = process.argv[4] || process.env.SEED_ADMIN_LAST_NAME || 'Admin'

  if (!/^\+92\d{10}$/.test(phone)) {
    fail(
      'Provide a valid phone in +92XXXXXXXXXX format, e.g.\n' +
        '  npm run seed:admin -- +923001234567 "Super" "Admin"'
    )
  }

  // Supabase stores phone digits without the leading "+".
  const phoneDigits = phone.replace(/^\+/, '')
  let authUser = await findAuthUser((u) => u.phone === phoneDigits || u.phone === phone)

  if (authUser) {
    const { data, error } = await admin.auth.admin.updateUserById(authUser.id, {
      app_metadata: APP_METADATA,
      user_metadata: { ...(authUser.user_metadata || {}), role: 'super_admin' },
      phone_confirm: true,
    })
    if (error) fail(`Failed to promote existing auth user: ${error.message}`)
    authUser = data.user
    console.log(`↑ Promoted existing auth user ${authUser.id} to super_admin`)
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      phone,
      password: process.env.SEED_ADMIN_PASSWORD || randomUUID(),
      phone_confirm: true,
      app_metadata: APP_METADATA,
      user_metadata: { role: 'super_admin' },
    })
    if (error) fail(`Failed to create auth user: ${error.message}`)
    authUser = data.user
    console.log(`＋ Created auth user ${authUser.id}`)
    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log('  (a random password was set; log in with phone OTP)')
    }
  }

  await upsertPublicUser(authUser, { phone, firstName, lastName })

  console.log('\n✓ Super-admin ready (phone + OTP).')
  console.log(`   phone : ${phone}`)
  console.log(`   name  : ${firstName} ${lastName}`)
  console.log('   Log in via the OTP flow, then open /admin/dashboard.\n')
}

async function main() {
  if (isEmail) await seedEmailAdmin()
  else await seedPhoneAdmin()
}

main().catch((err) => fail(err?.message || String(err)))
