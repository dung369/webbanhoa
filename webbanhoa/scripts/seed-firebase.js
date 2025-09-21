#!/usr/bin/env node
/**
 * Seed Firebase (Auth + Firestore) with sample data.
 *
 * Usage (PowerShell):
 * $env:FIREBASE_SERVICE_ACCOUNT_PATH='C:\path\to\serviceAccount.json';
 * $env:SEED_ADMIN_EMAIL='trandaidung9a1@gmail.com';
 * $env:SEED_ADMIN_PASSWORD='Dai1212333';
 * node scripts/seed-firebase.js
 *
 * Or set FIREBASE_SERVICE_ACCOUNT_JSON to the JSON contents (not recommended on shared shells).
 *
 * SECURITY: Do NOT commit service account JSON or admin password to source control.
 */

const fs = require('fs')
const path = require('path')
const admin = require('firebase-admin')

async function loadServiceAccount() {
  const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

  if (jsonEnv) {
    try {
      return JSON.parse(jsonEnv)
    } catch (e) {
      console.error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON')
      process.exit(1)
    }
  }

  if (pathEnv) {
    const p = path.resolve(pathEnv)
    if (!fs.existsSync(p)) {
      console.error('Service account file not found at', p)
      process.exit(1)
    }
    return require(p)
  }

  console.error('Please set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON')
  process.exit(1)
}

async function main() {
  const serviceAccount = await loadServiceAccount()

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })

  const auth = admin.auth()
  const db = admin.firestore()

  // Read seed data
  const seedPath = path.join(__dirname, 'seed-data.json')
  if (!fs.existsSync(seedPath)) {
    console.error('Missing seed-data.json in scripts folder')
    process.exit(1)
  }
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'))

  // Create or update admin auth user
  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error('Please set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD as environment variables')
    process.exit(1)
  }

  let adminUser
  try {
    adminUser = await auth.getUserByEmail(adminEmail)
    console.log('Admin user exists, updating password...')
    await auth.updateUser(adminUser.uid, { password: adminPassword })
  } catch (e) {
    if (e.code === 'auth/user-not-found' || e.code === 'auth/user-not-found') {
      console.log('Creating admin user...')
      adminUser = await auth.createUser({
        email: adminEmail,
        emailVerified: true,
        password: adminPassword,
        displayName: 'Admin',
      })
    } else {
      // For other errors, rethrow
      console.error('Error fetching/creating admin user:', e)
      process.exit(1)
    }
  }

  // Set custom claims to mark as admin
  try {
    await auth.setCustomUserClaims(adminUser.uid, { role: 'admin' })
    console.log('Set admin custom claims for', adminEmail)
  } catch (e) {
    console.error('Failed to set custom claims:', e)
  }

  // Seed Firestore collections
  // Products
  if (Array.isArray(seed.products)) {
    const batch = db.batch()
    seed.products.forEach((p) => {
      const docRef = db.collection('products').doc(String(p.id))
      const doc = Object.assign({}, p, { createdAt: admin.firestore.Timestamp.fromDate(new Date(p.createdAt)) })
      batch.set(docRef, doc, { merge: true })
    })
    await batch.commit()
    console.log('Seeded products:', seed.products.length)
  }

  // Users (non-auth Firestore profiles)
  if (Array.isArray(seed.users)) {
    const batch = db.batch()
    seed.users.forEach((u) => {
      const docRef = db.collection('users').doc(String(u.id))
      const doc = Object.assign({}, u, { createdAt: admin.firestore.Timestamp.fromDate(new Date(u.createdAt)) })
      batch.set(docRef, doc, { merge: true })
    })
    await batch.commit()
    console.log('Seeded users:', seed.users.length)
  }

  // Orders
  if (Array.isArray(seed.orders)) {
    const batch = db.batch()
    seed.orders.forEach((o) => {
      const docRef = db.collection('orders').doc(String(o.id))
      const doc = Object.assign({}, o, { createdAt: admin.firestore.Timestamp.fromDate(new Date(o.createdAt)) })
      batch.set(docRef, doc, { merge: true })
    })
    await batch.commit()
    console.log('Seeded orders:', seed.orders.length)
  }

  // Carts (one doc per userId)
  if (Array.isArray(seed.carts)) {
    const batch = db.batch()
    seed.carts.forEach((c) => {
      // store carts collection with doc id = userId
      const docRef = db.collection('carts').doc(String(c.userId))
      const doc = Object.assign({}, c, { updatedAt: admin.firestore.Timestamp.fromDate(new Date(c.updatedAt || Date.now())) })
      batch.set(docRef, doc, { merge: true })
    })
    await batch.commit()
    console.log('Seeded carts:', seed.carts.length)
  }

  // Favorites (one doc per userId)
  if (Array.isArray(seed.favorites)) {
    const batch = db.batch()
    seed.favorites.forEach((f) => {
      const docRef = db.collection('favorites').doc(String(f.userId))
      const doc = Object.assign({}, f)
      batch.set(docRef, doc, { merge: true })
    })
    await batch.commit()
    console.log('Seeded favorites:', seed.favorites.length)
  }

  // Inventory (one doc per productId)
  if (Array.isArray(seed.inventory)) {
    const batch = db.batch()
    seed.inventory.forEach((inv) => {
      const docRef = db.collection('inventory').doc(String(inv.productId))
      const doc = Object.assign({}, inv)
      // remove productId from the stored doc fields (id used as doc key)
      delete doc.productId
      batch.set(docRef, doc, { merge: true })
    })
    await batch.commit()
    console.log('Seeded inventory:', seed.inventory.length)
  }

  // Customers (additional profiles)
  if (Array.isArray(seed.customers)) {
    const batch = db.batch()
    seed.customers.forEach((cust) => {
      const docRef = db.collection('customers').doc(String(cust.id))
      const doc = Object.assign({}, cust, { createdAt: admin.firestore.Timestamp.fromDate(new Date(cust.createdAt || Date.now())) })
      batch.set(docRef, doc, { merge: true })
    })
    await batch.commit()
    console.log('Seeded customers:', seed.customers.length)
  }

  console.log('\nSeeding complete.')
  console.log('IMPORTANT: Change the admin password after first login and do NOT commit credentials to source control.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Unhandled error during seed:', err)
  process.exit(1)
})
