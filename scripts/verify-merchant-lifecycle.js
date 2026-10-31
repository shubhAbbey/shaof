/**
 * ATEEVRA MVP-2 — Live Merchant Onboarding / Super Admin Approval Lifecycle E2E Verification
 *
 * Verifies the complete onboarding-to-approval lifecycle against live HTTP endpoints (port 9000),
 * Storefront proxy (port 3000), Redis session cache, and PostgreSQL database.
 */

const http = require('http');
const crypto = require('crypto');
const { Redis } = require('ioredis');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:postgres_secure_password@localhost:5432/medusa_db',
});
const redis = new Redis({ host: '127.0.0.1', port: 6379 });

async function httpRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = { ...headers };
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 9000,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        });
      }
    );
    req.on('error', (err) => resolve({ status: null, error: err.message }));
    if (body) req.write(postData);
    req.end();
  });
}

async function storefrontRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = { ...headers };
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        });
      }
    );
    req.on('error', (err) => resolve({ status: null, error: err.message }));
    if (body) req.write(postData);
    req.end();
  });
}

async function createRedisAdminSession(adminUserId) {
  const token = `sess_admin_${crypto.randomBytes(24).toString('hex')}`;
  const now = Date.now();
  const session = {
    token,
    userId: adminUserId,
    email: 'admin@platform.ateevra.in',
    role: 'super_admin',
    authBoundary: 'admin',
    actorType: 'super_admin',
    isMfaVerified: true,
    lastMfaVerifiedAt: now,
    permissions: ['*'],
    createdAt: now,
    expiresAt: now + 8 * 60 * 60 * 1000,
    lastActivityAt: now,
  };
  await redis.set(`session:admin:${token}`, JSON.stringify(session), 'EX', 7200);
  return token;
}

let passes = 0;
let fails = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passes++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    fails++;
  }
}

async function run() {
  console.log('========================================================================');
  console.log('ATEEVRA MVP-2 — LIVE MERCHANT ONBOARDING & APPROVAL LIFECYCLE AUDIT');
  console.log('========================================================================\n');

  const ts = Date.now();
  const testMerch = {
    name: 'Kashmir Looms Heritage',
    handle: `kashmir-looms-${ts}`,
    email: `kashmir_${ts}@crafts.in`,
    phone: '+919876543210',
    password: 'SecureSellerPass2026!',
    gstin: '27AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
  };

  const adminUserId = `usr_admin_audit_${ts}`;
  const adminToken = await createRedisAdminSession(adminUserId);

  let merchantToken = null;
  let merchantId = null;
  let suspMerchId = null;
  let suspToken = null;
  let suspMemToken = null;
  let staffToken = null;
  let staffMemberId = null;
  let staffUserId = null;
  let missingRoleToken = null;
  let unknownRoleToken = null;

  try {
    // -------------------------------------------------------------------------
    // Phase 1: Registration Creates Draft Account with Honest Messaging
    // -------------------------------------------------------------------------
    console.log('▶ 1. Merchant Registration (POST /merchant/auth/register)');
    const regRes = await httpRequest('/merchant/auth/register', 'POST', {
      name: testMerch.name,
      handle: testMerch.handle,
      email: testMerch.email,
      phone: testMerch.phone,
      password: testMerch.password,
    });

    assert(regRes.status === 201, `Registration returns HTTP 201 Created (got ${regRes.status})`);
    assert(regRes.body?.merchant?.status === 'draft', `Initial merchant status is strictly 'draft' (got '${regRes.body?.merchant?.status}')`);
    assert(
      typeof regRes.body?.message === 'string' &&
      regRes.body.message.includes('draft status') &&
      !regRes.body.message.includes('awaiting verification by platform staff'),
      `Truthful registration message without false claims of pending verification`
    );
    assert(Boolean(regRes.body?.token), `Issues authenticated session token immediately for onboarding`);

    merchantToken = regRes.body?.token;
    merchantId = regRes.body?.merchant?.id;

    // Direct PostgreSQL Verification
    const pgDraft = await pool.query('SELECT id, status, metadata FROM merchant WHERE id = $1', [merchantId]);
    assert(pgDraft.rows.length === 1, `Merchant record persisted in PostgreSQL`);
    assert(pgDraft.rows[0].status === 'draft', `PostgreSQL status is 'draft'`);
    const draftMeta = typeof pgDraft.rows[0].metadata === 'string' ? JSON.parse(pgDraft.rows[0].metadata) : pgDraft.rows[0].metadata;
    assert(!draftMeta?.verificationSubmittedAt, `Zero verificationSubmittedAt timestamp in draft state`);

    // -------------------------------------------------------------------------
    // Phase 2: Incomplete Application Submission Rejection (400)
    // -------------------------------------------------------------------------
    console.log('\n▶ 2. Incomplete Application Submission Rejection (POST /merchant/application/submit)');
    const submitIncompleteRes = await httpRequest('/merchant/application/submit', 'POST', {}, {
      Authorization: `Bearer ${merchantToken}`,
    });

    assert(submitIncompleteRes.status === 400, `Rejects incomplete submission with HTTP 400 (got ${submitIncompleteRes.status})`);
    assert(submitIncompleteRes.body?.error === 'INCOMPLETE_APPLICATION', `Returns INCOMPLETE_APPLICATION error code`);
    assert(
      Array.isArray(submitIncompleteRes.body?.errors) &&
      submitIncompleteRes.body.errors.some((e) => e.includes('GSTIN')) &&
      submitIncompleteRes.body.errors.some((e) => e.includes('PAN')),
      `Identifies missing businessRegistrationNumber (GSTIN) and taxIdentifier (PAN)`
    );

    // -------------------------------------------------------------------------
    // Phase 3: Update Profile & Tax Identifiers (PUT /merchant/application)
    // -------------------------------------------------------------------------
    console.log('\n▶ 3. Update Application Profile & Tax Identifiers (PUT /merchant/application)');
    const updateRes = await httpRequest(
      '/merchant/application',
      'PUT',
      {
        businessRegistrationNumber: testMerch.gstin,
        taxIdentifier: testMerch.pan,
      },
      { Authorization: `Bearer ${merchantToken}` }
    );

    assert(updateRes.status === 200, `Profile update returns HTTP 200 OK (got ${updateRes.status})`);
    assert(updateRes.body?.merchant?.businessRegistrationNumber === testMerch.gstin, `Persisted GSTIN updated`);
    assert(updateRes.body?.merchant?.taxIdentifier === testMerch.pan, `Persisted PAN updated`);

    // -------------------------------------------------------------------------
    // Phase 4: Valid Application Submission to Pending Approval
    // -------------------------------------------------------------------------
    console.log('\n▶ 4. Submit Completed Application (POST /merchant/application/submit)');
    const submitCompleteRes = await httpRequest('/merchant/application/submit', 'POST', {}, {
      Authorization: `Bearer ${merchantToken}`,
    });

    assert(submitCompleteRes.status === 200, `Submission returns HTTP 200 OK (got ${submitCompleteRes.status})`);
    assert(submitCompleteRes.body?.merchant?.status === 'pending_approval', `Merchant status transitioned to 'pending_approval'`);
    assert(Boolean(submitCompleteRes.body?.merchant?.metadata?.verificationSubmittedAt), `Verification submitted timestamp recorded in metadata`);

    // Verify PostgreSQL State
    const pgPending = await pool.query('SELECT status, metadata FROM merchant WHERE id = $1', [merchantId]);
    assert(pgPending.rows[0].status === 'pending_approval', `PostgreSQL status updated to 'pending_approval'`);
    const pendingMeta = typeof pgPending.rows[0].metadata === 'string' ? JSON.parse(pgPending.rows[0].metadata) : pgPending.rows[0].metadata;
    assert(Boolean(pendingMeta.verificationSubmittedAt), `PostgreSQL contains verificationSubmittedAt timestamp`);
    assert(
      Array.isArray(pendingMeta.lifecycleHistory) &&
      pendingMeta.lifecycleHistory.some((h) => h.toStatus === 'pending_approval'),
      `Lifecycle history recorded transition to pending_approval`
    );

    // -------------------------------------------------------------------------
    // Phase 5: GET /merchant/application Reflects Submitted State
    // -------------------------------------------------------------------------
    console.log('\n▶ 5. Fetch Submitted Application (GET /merchant/application)');
    const getAppRes = await httpRequest('/merchant/application', 'GET', null, {
      Authorization: `Bearer ${merchantToken}`,
    });

    assert(getAppRes.status === 200, `GET /merchant/application returns HTTP 200 OK`);
    assert(getAppRes.body?.merchant?.status === 'pending_approval', `Application returns status 'pending_approval'`);
    assert(getAppRes.body?.merchant?.businessRegistrationNumber === testMerch.gstin, `Returns verified GSTIN`);
    assert(getAppRes.body?.merchant?.taxIdentifier === testMerch.pan, `Returns verified PAN`);

    // -------------------------------------------------------------------------
    // Phase 6: Commercial Access Gating While Inactive (403 Forbidden)
    // -------------------------------------------------------------------------
    console.log('\n▶ 6. Commercial Operations Gated for Inactive Merchant');
    const commercialRes = await httpRequest('/merchant/products', 'GET', null, {
      Authorization: `Bearer ${merchantToken}`,
    });

    assert(commercialRes.status === 403, `Access to /merchant/products blocked with HTTP 403 Forbidden (got ${commercialRes.status})`);
    assert(
      commercialRes.body?.error === 'FORBIDDEN' &&
      commercialRes.body?.message?.includes('not active'),
      `Returns FORBIDDEN with inactive merchant notice`
    );

    // -------------------------------------------------------------------------
    // Phase 7: Super Admin Review Queue & Detail Verification
    // -------------------------------------------------------------------------
    console.log('\n▶ 7. Super Admin Pending Approval Queue (GET /admin/marketplace/merchants)');
    const queueRes = await httpRequest(
      '/admin/marketplace/merchants?status=pending_approval',
      'GET',
      null,
      { Authorization: `Bearer ${adminToken}` }
    );

    assert(queueRes.status === 200, `Super Admin queue query returns HTTP 200 OK (got ${queueRes.status})`);
    const inQueue = Array.isArray(queueRes.body?.merchants) && queueRes.body.merchants.some((m) => m.id === merchantId);
    assert(inQueue, `Submitted merchant appears in Super Admin pending_approval queue`);

    console.log('\n▶ 8. Super Admin Merchant Detail View (GET /admin/marketplace/merchants/:id)');
    const detailRes = await httpRequest(
      `/admin/marketplace/merchants/${merchantId}`,
      'GET',
      null,
      { Authorization: `Bearer ${adminToken}` }
    );

    assert(detailRes.status === 200, `Super Admin detail view returns HTTP 200 OK (got ${detailRes.status})`);
    assert(
      detailRes.body?.merchant?.businessRegistrationNumber === testMerch.gstin,
      `Detail view exposes canonical camelCase GSTIN to Super Admin`
    );
    assert(
      detailRes.body?.merchant?.taxIdentifier === testMerch.pan,
      `Detail view exposes canonical camelCase PAN to Super Admin`
    );
    assert(
      detailRes.body?.merchant?.business_registration_number === undefined,
      `Response adheres to canonical contract (no duplicate snake_case business_registration_number)`
    );
    assert(
      detailRes.body?.merchant?.tax_identifier === undefined,
      `Response adheres to canonical contract (no duplicate snake_case tax_identifier)`
    );
    assert(Boolean(detailRes.body?.merchant?.metadata?.verificationSubmittedAt), `Detail view exposes verification submission timestamp`);

    // -------------------------------------------------------------------------
    // Phase 8: Direct Draft Activation Blocked (400 DIRECT_ACTIVATION_BLOCKED)
    // -------------------------------------------------------------------------
    console.log('\n▶ 9. Direct Draft Activation Block Enforcement');
    // Create separate draft merchant to test direct activation block
    const draftOnlyRes = await httpRequest('/merchant/auth/register', 'POST', {
      name: 'Unsubmitted Draft Ltd',
      handle: `unsubmitted-${ts}`,
      email: `unsubmitted_${ts}@crafts.in`,
      phone: '+919876543211',
      password: 'SecureSellerPass2026!',
    });
    const draftOnlyId = draftOnlyRes.body?.merchant?.id;

    const directActivateRes = await httpRequest(
      `/admin/marketplace/merchants/${draftOnlyId}/status`,
      'PUT',
      { action: 'approve' },
      { Authorization: `Bearer ${adminToken}` }
    );

    assert(directActivateRes.status === 400, `Direct activation of draft merchant returns HTTP 400 (got ${directActivateRes.status})`);
    assert(directActivateRes.body?.error === 'DIRECT_ACTIVATION_BLOCKED', `Returns DIRECT_ACTIVATION_BLOCKED error code`);

    // Clean up draftOnly merchant
    await pool.query('DELETE FROM merchant WHERE id = $1', [draftOnlyId]);

    // -------------------------------------------------------------------------
    // Phase 9: Request Changes Cycle
    // -------------------------------------------------------------------------
    console.log('\n▶ 10. Super Admin Request Changes Cycle');
    // Attempt request-changes without reason (must fail 400)
    const reqChangesNoReason = await httpRequest(
      `/admin/marketplace/merchants/${merchantId}/status`,
      'PUT',
      { action: 'request-changes' },
      { Authorization: `Bearer ${adminToken}` }
    );
    assert(reqChangesNoReason.status === 400, `Request-changes without reason rejected with HTTP 400 (got ${reqChangesNoReason.status})`);
    assert(reqChangesNoReason.body?.error === 'CHANGES_REQUESTED_REASON_REQUIRED', `Returns CHANGES_REQUESTED_REASON_REQUIRED`);

    // Valid request-changes with reason
    const reqChangesValid = await httpRequest(
      `/admin/marketplace/merchants/${merchantId}/status`,
      'PUT',
      {
        action: 'request-changes',
        reason: 'Trade name on GSTIN certificate does not match store handle. Please verify.',
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    assert(reqChangesValid.status === 200, `Request changes returns HTTP 200 OK (got ${reqChangesValid.status})`);
    assert(reqChangesValid.body?.merchant?.status === 'draft', `Merchant returns to 'draft' status for editing`);

    // Merchant re-submits application
    const resubmitRes = await httpRequest('/merchant/application/submit', 'POST', {}, {
      Authorization: `Bearer ${merchantToken}`,
    });
    assert(resubmitRes.status === 200, `Merchant re-submission returns HTTP 200 OK (got ${resubmitRes.status})`);
    assert(resubmitRes.body?.merchant?.status === 'pending_approval', `Status returns to 'pending_approval'`);

    // -------------------------------------------------------------------------
    // Phase 10: Super Admin Approval and Commercial Activation
    // -------------------------------------------------------------------------
    console.log('\n▶ 11. Super Admin Approval (PUT /admin/marketplace/merchants/:id/status -> approve)');
    const approveRes = await httpRequest(
      `/admin/marketplace/merchants/${merchantId}/status`,
      'PUT',
      { action: 'approve' },
      { Authorization: `Bearer ${adminToken}` }
    );

    assert(approveRes.status === 200, `Approval returns HTTP 200 OK (got ${approveRes.status})`);
    assert(approveRes.body?.merchant?.status === 'active', `Merchant status transitioned to 'active'`);
    assert(approveRes.body?.merchant?.metadata?.approvedBy === adminUserId, `ApprovedBy actor ID recorded in metadata`);

    // Verify in PostgreSQL
    const pgActive = await pool.query('SELECT status, metadata FROM merchant WHERE id = $1', [merchantId]);
    assert(pgActive.rows[0].status === 'active', `PostgreSQL status is 'active'`);
    const activeMeta = typeof pgActive.rows[0].metadata === 'string' ? JSON.parse(pgActive.rows[0].metadata) : pgActive.rows[0].metadata;
    assert(Boolean(activeMeta.approvedAt), `ApprovedAt timestamp recorded in PostgreSQL`);

    // Verify Commercial Access Now Permitted
    console.log('\n▶ 12. Commercial Operations Permitted for Active Merchant');
    const commercialActiveRes = await httpRequest('/merchant/products', 'GET', null, {
      Authorization: `Bearer ${merchantToken}`,
    });
    assert(
      commercialActiveRes.status === 200,
      `Access to /merchant/products succeeds with HTTP 200 once active (got ${commercialActiveRes.status})`
    );

    // -------------------------------------------------------------------------
    // Phase 11: Rejection Workflow
    // -------------------------------------------------------------------------
    console.log('\n▶ 13. Application Rejection Workflow');
    const rejectTestRes = await httpRequest('/merchant/auth/register', 'POST', {
      name: 'Disallowed Trades',
      handle: `disallowed-${ts}`,
      email: `disallowed_${ts}@crafts.in`,
      phone: '+919876543212',
      password: 'SecureSellerPass2026!',
    });
    const rejectMerchId = rejectTestRes.body?.merchant?.id;
    const rejectMerchToken = rejectTestRes.body?.token;

    // Update tax info and submit
    await httpRequest(
      '/merchant/application',
      'PUT',
      { businessRegistrationNumber: '29BBBBB1111B1Z2', taxIdentifier: 'BBBBB1111B' },
      { Authorization: `Bearer ${rejectMerchToken}` }
    );
    await httpRequest('/merchant/application/submit', 'POST', {}, {
      Authorization: `Bearer ${rejectMerchToken}`,
    });

    // Attempt rejection without reason (must fail 400)
    const rejectNoReason = await httpRequest(
      `/admin/marketplace/merchants/${rejectMerchId}/status`,
      'PUT',
      { action: 'reject' },
      { Authorization: `Bearer ${adminToken}` }
    );
    assert(rejectNoReason.status === 400, `Rejection without reason rejected with HTTP 400 (got ${rejectNoReason.status})`);
    assert(rejectNoReason.body?.error === 'REJECTION_REASON_REQUIRED', `Returns REJECTION_REASON_REQUIRED`);

    // Valid rejection with reason
    const rejectValid = await httpRequest(
      `/admin/marketplace/merchants/${rejectMerchId}/status`,
      'PUT',
      { action: 'reject', reason: 'Unverified business registration document. Platform standards not met.' },
      { Authorization: `Bearer ${adminToken}` }
    );
    assert(rejectValid.status === 200, `Rejection with reason returns HTTP 200 OK (got ${rejectValid.status})`);
    assert(rejectValid.body?.merchant?.status === 'rejected', `Status transitioned to 'rejected'`);

    // Verify rejected merchant can update profile and re-submit
    const rejectUpdate = await httpRequest(
      '/merchant/application',
      'PUT',
      { businessRegistrationNumber: '29BBBBB1111B1Z3' },
      { Authorization: `Bearer ${rejectMerchToken}` }
    );
    assert(rejectUpdate.status === 200, `Rejected merchant can update application profile`);

    const rejectResubmit = await httpRequest('/merchant/application/submit', 'POST', {}, {
      Authorization: `Bearer ${rejectMerchToken}`,
    });
    assert(rejectResubmit.status === 200, `Rejected merchant can re-submit application for reconsideration (got ${rejectResubmit.status})`);
    assert(rejectResubmit.body?.merchant?.status === 'pending_approval', `Status transitions back to 'pending_approval'`);

    // Clean up reject test merchant
    await pool.query('DELETE FROM merchant WHERE id = $1', [rejectMerchId]);

    // -------------------------------------------------------------------------
    // Phase 12: Storefront Proxy Verification (Port 3000 -> Port 9000)
    // -------------------------------------------------------------------------
    console.log('\n▶ 14. Real Storefront Proxy Integration (Port 3000)');
    // 1. Unauthenticated request to /api/merchant/application returns HTTP 401 JSON (not 200 HTML)
    const sfUnauthRes = await storefrontRequest('/api/merchant/application', 'GET');
    assert(sfUnauthRes.status === 401, `Unauthenticated storefront proxy call returns HTTP 401 Unauthorized (got ${sfUnauthRes.status})`);
    assert(
      sfUnauthRes.headers?.['content-type']?.includes('application/json'),
      `Storefront proxy returns application/json (not an HTML page: got '${sfUnauthRes.headers?.['content-type']}')`
    );
    assert(sfUnauthRes.body?.error === 'UNAUTHORIZED', `Returns expected UNAUTHORIZED error body`);

    // 2. Authenticated request through storefront proxy reaches backend handler
    const sfAuthRes = await storefrontRequest('/api/merchant/application', 'GET', null, {
      Authorization: `Bearer ${merchantToken}`,
    });
    assert(sfAuthRes.status === 200, `Authenticated storefront proxy call returns HTTP 200 OK (got ${sfAuthRes.status})`);
    assert(sfAuthRes.body?.merchant?.id === merchantId, `Storefront proxy returned verified merchant application payload`);
    assert(sfAuthRes.body?.merchant?.businessRegistrationNumber === testMerch.gstin, `Exposes canonical businessRegistrationNumber`);

    // -------------------------------------------------------------------------
    // Phase 13: Tenant Security Hardening & Negative Testing
    // -------------------------------------------------------------------------
    console.log('\n▶ 15. Tenant Security Hardening & Negative Scenarios');
    // 1. Suspended merchant account attempting to access application endpoint
    suspMerchId = `merch_susp_${ts}`;
    await pool.query(
      `INSERT INTO merchant (id, name, handle, status, email, phone, created_at, updated_at)
       VALUES ($1, $2, $3, 'suspended', $4, $5, NOW(), NOW())`,
      [suspMerchId, 'Suspended Looms', `suspended-${ts}`, `susp_${ts}@test.in`, '+919876543210']
    );

    suspToken = `sess_merch_susp_${crypto.randomBytes(16).toString('hex')}`;
    await redis.set(
      `session:merch:${suspToken}`,
      JSON.stringify({
        token: suspToken,
        userId: 'usr_susp_live',
        merchantId: suspMerchId,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'suspended',
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 7200 * 1000,
      }),
      'EX',
      300
    );
    const suspRes = await httpRequest('/merchant/application', 'GET', null, {
      Authorization: `Bearer ${suspToken}`,
    });
    assert(suspRes.status === 403, `Suspended merchant account denied onboarding access with HTTP 403 (got ${suspRes.status})`);
    assert(suspRes.body?.message?.includes('suspended'), `Returns clear suspended account rejection message`);

    // 2. Suspended member attempting to access application endpoint
    suspMemToken = `sess_merch_mem_susp_${crypto.randomBytes(16).toString('hex')}`;
    await redis.set(
      `session:merch:${suspMemToken}`,
      JSON.stringify({
        token: suspMemToken,
        userId: 'usr_susp_mem_live',
        merchantId: merchantId,
        role: 'owner',
        membershipStatus: 'suspended',
        merchantStatus: 'active',
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 7200 * 1000,
      }),
      'EX',
      300
    );
    const suspMemRes = await httpRequest('/merchant/application', 'GET', null, {
      Authorization: `Bearer ${suspMemToken}`,
    });
    assert(suspMemRes.status === 403, `Suspended member denied onboarding access with HTTP 403 (got ${suspMemRes.status})`);
    assert(suspMemRes.body?.message?.includes('membership is not active'), `Returns membership not active rejection message`);

    // 3. Staff role attempting to submit application (must be owner or manager)
    staffUserId = `usr_staff_${ts}`;
    staffMemberId = `mem_staff_${ts}`;
    await pool.query(
      `INSERT INTO "user" (id, email, first_name, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [staffUserId, `staff_${ts}@teststore.in`, 'Test Staff']
    );
    await pool.query(
      `INSERT INTO merchant_member (id, merchant_id, user_id, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'staff', 'active', NOW(), NOW())`,
      [staffMemberId, merchantId, staffUserId]
    );

    staffToken = `sess_merch_staff_${crypto.randomBytes(16).toString('hex')}`;
    await redis.set(
      `session:merch:${staffToken}`,
      JSON.stringify({
        token: staffToken,
        userId: staffUserId,
        merchantId: merchantId,
        role: 'staff',
        membershipStatus: 'active',
        merchantStatus: 'active',
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 7200 * 1000,
      }),
      'EX',
      300
    );
    const staffSubmitRes = await httpRequest('/merchant/application/submit', 'POST', {}, {
      Authorization: `Bearer ${staffToken}`,
    });
    assert(staffSubmitRes.status === 403, `Staff member cannot submit application (HTTP 403 Forbidden)`);
    assert(
      staffSubmitRes.body?.message?.includes('owner or manager') ||
      staffSubmitRes.body?.message?.includes('membership role is required'),
      `Returns role requirement message (got '${staffSubmitRes.body?.message}')`
    );

    // 4. Missing role attempting to submit application (fails closed)
    missingRoleToken = `sess_merch_norole_${crypto.randomBytes(16).toString('hex')}`;
    await redis.set(
      `session:merch:${missingRoleToken}`,
      JSON.stringify({
        token: missingRoleToken,
        userId: 'usr_norole_live',
        merchantId: merchantId,
        role: undefined,
        membershipStatus: 'active',
        merchantStatus: 'active',
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 7200 * 1000,
      }),
      'EX',
      300
    );
    const missingRoleRes = await httpRequest('/merchant/application/submit', 'POST', {}, {
      Authorization: `Bearer ${missingRoleToken}`,
    });
    assert(missingRoleRes.status === 403, `Missing role fails closed with HTTP 403 Forbidden (got ${missingRoleRes.status})`);

    // 5. Unknown role attempting to submit application (fails closed)
    unknownRoleToken = `sess_merch_guest_${crypto.randomBytes(16).toString('hex')}`;
    await redis.set(
      `session:merch:${unknownRoleToken}`,
      JSON.stringify({
        token: unknownRoleToken,
        userId: 'usr_guest_live',
        merchantId: merchantId,
        role: 'guest',
        membershipStatus: 'active',
        merchantStatus: 'active',
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + 7200 * 1000,
      }),
      'EX',
      300
    );
    const unknownRoleRes = await httpRequest('/merchant/application/submit', 'POST', {}, {
      Authorization: `Bearer ${unknownRoleToken}`,
    });
    assert(unknownRoleRes.status === 403, `Unknown role fails closed with HTTP 403 Forbidden (got ${unknownRoleRes.status})`);

    // 6. Anti-forgery check: client-supplied merchant_id mismatch
    const forgeryRes = await httpRequest(
      '/merchant/application',
      'GET',
      null,
      {
        Authorization: `Bearer ${merchantToken}`,
      }
    );
    const forgerySubmitRes = await httpRequest(
      '/merchant/application/submit',
      'POST',
      { merchant_id: 'merch_other_tenant_id' },
      {
        Authorization: `Bearer ${merchantToken}`,
      }
    );
    assert(forgerySubmitRes.status === 403, `Client-supplied merchant_id mismatch rejected with HTTP 403 (got ${forgerySubmitRes.status})`);

    // 7. Merchant user accessing Super Admin endpoints
    const merchantAccessAdmin = await httpRequest(
      '/admin/marketplace/merchants',
      'GET',
      null,
      { Authorization: `Bearer ${merchantToken}` }
    );
    assert(merchantAccessAdmin.status === 403, `Merchant user cannot access Super Admin endpoints (HTTP 403 Forbidden)`);

    // 8. Unauthenticated caller accessing Super Admin detail
    const unauthAdminRes = await httpRequest(`/admin/marketplace/merchants/${merchantId}`, 'GET');
    assert(unauthAdminRes.status === 401, `Unauthenticated caller cannot access Super Admin detail (HTTP 401 Unauthorized)`);

  } finally {
    // -------------------------------------------------------------------------
    // Cleanup: Strictly scoped deletion by exact unique IDs created in this run
    // -------------------------------------------------------------------------
    console.log('\n▶ Teardown: Cleaning disposable test records...');
    const createdMemberIds = [staffMemberId].filter(Boolean);
    for (const memId of createdMemberIds) {
      await pool.query('DELETE FROM merchant_member WHERE id = $1', [memId]).catch(() => {});
    }
    const createdUserIds = [staffUserId].filter(Boolean);
    for (const uid of createdUserIds) {
      await pool.query('DELETE FROM "user" WHERE id = $1', [uid]).catch(() => {});
    }
    const createdMerchantIds = [merchantId, suspMerchId].filter(Boolean);
    for (const id of createdMerchantIds) {
      await pool.query('DELETE FROM merchant_member WHERE merchant_id = $1', [id]).catch(() => {});
      await pool.query('DELETE FROM merchant WHERE id = $1', [id]).catch(() => {});
    }
    const createdTokens = [
      adminToken && `session:admin:${adminToken}`,
      merchantToken && `session:merch:${merchantToken}`,
      suspToken && `session:merch:${suspToken}`,
      suspMemToken && `session:merch:${suspMemToken}`,
      staffToken && `session:merch:${staffToken}`,
      missingRoleToken && `session:merch:${missingRoleToken}`,
      unknownRoleToken && `session:merch:${unknownRoleToken}`,
    ].filter(Boolean);
    for (const key of createdTokens) {
      await redis.del(key).catch(() => {});
    }
    await pool.end();
    await redis.quit();
  }

  console.log('\n========================================================================');
  console.log(`AUDIT RESULTS: ${passes} PASSED | ${fails} FAILED`);
  console.log('========================================================================\n');

  if (fails > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
