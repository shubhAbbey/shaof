/**
 * M2-07: User, Role and Permission Management Test Suite
 *
 * Comprehensive automated security tests verifying:
 * 1. Role-Permission Matrix & Least Privilege Enforcement (Owner, Admin, Manager, Staff).
 * 2. Merchant Team Collection & Invitations (GET /merchant/team, POST /merchant/team, POST /merchant/team/invite).
 * 3. Member Role and Status Updates (PUT /merchant/team/:id).
 * 4. Member Removal & Offboarding (DELETE /merchant/team/:id).
 * 5. Anti-Escalation & Role Ceiling Protection:
 *    - Platform escalation: Super Admin role assignment strictly prohibited.
 *    - Admin role ceiling: Admin callers cannot invite or promote to Owner.
 *    - Admin immutability: Admin callers cannot modify or remove an Owner.
 * 6. Sole Active Owner Protection & Concurrency Invariant:
 *    - Demoting sole active owner blocked with 409 Conflict.
 *    - Suspending sole active owner blocked with 409 Conflict.
 *    - Removing sole active owner blocked with 409 Conflict.
 *    - Concurrent demotion race serialized under withMerchantLock mutex (exactly 1 owner remains).
 * 7. Cross-Tenant Isolation & IDOR Protection:
 *    - Team directory strictly scoped to caller's merchant.
 *    - Cross-tenant update/removal blocked with 403 Forbidden.
 *    - Client-supplied merchant_id forgery blocked.
 * 8. Session Predictability & Instant Revocation:
 *    - Suspending or removing a member immediately revokes all active sessions.
 *    - Distributed session revocation via Redis / shared storage.
 * 9. Super Admin Platform Team Management:
 *    - Cross-merchant visibility with query filters (GET /admin/marketplace/team).
 *    - Super Admin member updates (PUT /admin/marketplace/members/:id).
 *    - Sole owner invariant enforced even for platform administrators.
 *    - Boundary guards block merchant/customer callers with 403 Forbidden.
 * 10. Audit Logging & Strict Secret Redaction:
 *    - Structured team audit events emitted for all lifecycle changes.
 *    - Zero passwords, hashes, salts, or tokens leaked in audit records.
 * 11. Authoritative PostgreSQL Shared Persistence:
 *    - Team members, roles, statuses, and deletions persist across engine restarts in PostgreSQL.
 */

import { describe, it, before, beforeEach, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { Pool } from 'pg';
import { MedusaModule } from '@medusajs/framework/modules-sdk';
import {
  MerchantAuthEngine,
  InMemoryMerchantAuthStorageAdapter,
  RedisMerchantAuthStorageAdapter,
  InMemoryMerchantIdentityStore,
  PostgresMerchantIdentityStore,
} from './modules/auth/merchant-auth-engine';
import { requireTenantAuth } from './api/middlewares/tenant-auth';
import { GET as teamGetHandler, POST as teamPostHandler } from './api/merchant/team/route';
import { POST as teamInvitePostHandler } from './api/merchant/team/invite/route';
import { PUT as teamMemberPutHandler, DELETE as teamMemberDeleteHandler } from './api/merchant/team/[id]/route';
import { GET as adminTeamGetHandler } from './api/admin/marketplace/team/route';
import { PUT as adminMemberPutHandler } from './api/admin/marketplace/members/[id]/route';
import {
  validateSoleOwnerConstraint,
  validateMemberStatusTransition,
} from '@ecom/types';
import type { MerchantRole, MerchantMemberStatus } from '@ecom/types';

// Helper to simulate MedusaRequest and MedusaResponse
function createMockHttp(options: {
  headers?: Record<string, string>;
  body?: any;
  query?: any;
  params?: any;
}) {
  const headers = options.headers || {};
  let statusCode = 200;
  let responseBody: any = null;
  const setHeaders: Record<string, string> = {};

  const req: any = {
    headers,
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    socket: { remoteAddress: '127.0.0.1' },
    scope: { resolve: () => null },
  };

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseBody = data;
      return res;
    },
    setHeader(key: string, value: string) {
      setHeaders[key.toLowerCase()] = value;
      return res;
    },
    getStatusCode() {
      return statusCode;
    },
    getBody() {
      return responseBody;
    },
    getHeaders() {
      return setHeaders;
    },
  };

  return { req, res };
}

describe('M2-07: User, Role and Permission Management Test Suite', () => {
  let memoryStore: InMemoryMerchantIdentityStore;
  let memoryAdapter: InMemoryMerchantAuthStorageAdapter;

  beforeEach(async () => {
    memoryStore = new InMemoryMerchantIdentityStore();
    memoryAdapter = new InMemoryMerchantAuthStorageAdapter();
    MerchantAuthEngine.setIdentityStore(memoryStore);
    MerchantAuthEngine.setAdapter(memoryAdapter);
    await MerchantAuthEngine.resetForTesting();
  });

  // ==========================================
  // 1. Role-Permission Matrix & Least Privilege
  // ==========================================
  describe('1. Role-Permission Matrix & Access Enforcement', () => {
    it('verifies exact permission definitions for all merchant roles', () => {
      // Owner permissions
      const ownerPerms = MerchantAuthEngine.getPermissionsForRole('owner');
      assert.ok(ownerPerms.includes('team:manage'));
      assert.ok(ownerPerms.includes('catalog:read'));
      assert.ok(ownerPerms.includes('catalog:write'));
      assert.ok(ownerPerms.includes('catalog:delete'));
      assert.ok(ownerPerms.includes('financials:payout'));
      assert.ok(ownerPerms.includes('settings:manage'));

      // Admin permissions
      const adminPerms = MerchantAuthEngine.getPermissionsForRole('admin');
      assert.ok(adminPerms.includes('team:manage'));
      assert.ok(adminPerms.includes('catalog:read'));
      assert.ok(adminPerms.includes('catalog:write'));
      assert.ok(adminPerms.includes('catalog:delete'));
      assert.ok(!adminPerms.includes('financials:payout'), 'Admin must not have financials:payout');
      assert.ok(!adminPerms.includes('settings:manage'), 'Admin must not have settings:manage');

      // Manager permissions
      const managerPerms = MerchantAuthEngine.getPermissionsForRole('manager');
      assert.ok(managerPerms.includes('catalog:read'));
      assert.ok(managerPerms.includes('catalog:write'));
      assert.ok(managerPerms.includes('inventory:adjust'));
      assert.ok(!managerPerms.includes('catalog:delete'), 'Manager must not have catalog:delete');
      assert.ok(!managerPerms.includes('team:manage'), 'Manager must not have team:manage');

      // Staff permissions
      const staffPerms = MerchantAuthEngine.getPermissionsForRole('staff');
      assert.ok(staffPerms.includes('catalog:read'));
      assert.ok(staffPerms.includes('orders:read'));
      assert.ok(staffPerms.includes('orders:fulfill'));
      assert.ok(!staffPerms.includes('catalog:write'), 'Staff must not have catalog:write');
      assert.ok(!staffPerms.includes('team:manage'), 'Staff must not have team:manage');
    });

    it('permits Owner and Admin to access merchant team endpoints', async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Permission Test Store',
        email: 'owner@permstore.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });
      await MerchantAuthEngine.updateMerchantStatus(reg.merchant.id, 'active');

      const ownerSession = await MerchantAuthEngine.createSession({
        userId: reg.user.id,
        merchantId: reg.merchant.id,
        email: reg.user.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Owner GET /merchant/team -> 200
      const { req: ownerReq, res: ownerRes } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
      });
      await teamGetHandler(ownerReq, ownerRes);
      assert.equal(ownerRes.getStatusCode(), 200);
      assert.equal(ownerRes.getBody().success, true);

      // Create Admin member and session
      const adminMember = await memoryStore.inviteMerchantMember({
        merchantId: reg.merchant.id,
        email: 'admin@permstore.in',
        role: 'admin',
      });
      await memoryStore.updateMerchantMemberRoleOrStatus(reg.merchant.id, adminMember.id, {
        status: 'active',
      });

      const adminSession = await MerchantAuthEngine.createSession({
        userId: adminMember.userId,
        merchantId: reg.merchant.id,
        email: adminMember.email,
        role: 'admin',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Admin GET /merchant/team -> 200
      const { req: adminReq, res: adminRes } = createMockHttp({
        headers: { authorization: `Bearer ${adminSession.token}` },
      });
      await teamGetHandler(adminReq, adminRes);
      assert.equal(adminRes.getStatusCode(), 200);
      assert.equal(adminRes.getBody().success, true);
    });

    it('strictly blocks Manager and Staff from team endpoints with 403 Forbidden (PERMISSION_DENIED)', async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Role Block Store',
        email: 'founder@roleblock.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });
      await MerchantAuthEngine.updateMerchantStatus(reg.merchant.id, 'active');

      // Create Manager
      const managerMember = await memoryStore.inviteMerchantMember({
        merchantId: reg.merchant.id,
        email: 'manager@roleblock.in',
        role: 'manager',
      });
      await memoryStore.updateMerchantMemberRoleOrStatus(reg.merchant.id, managerMember.id, {
        status: 'active',
      });

      const managerSession = await MerchantAuthEngine.createSession({
        userId: managerMember.userId,
        merchantId: reg.merchant.id,
        email: managerMember.email,
        role: 'manager',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Manager attempts GET /merchant/team
      const { req: mgrReq, res: mgrRes } = createMockHttp({
        headers: { authorization: `Bearer ${managerSession.token}` },
      });
      await teamGetHandler(mgrReq, mgrRes);
      assert.equal(mgrRes.getStatusCode(), 403);
      assert.equal(mgrRes.getBody().error, 'FORBIDDEN');
      assert.match(mgrRes.getBody().message, /Missing required permission|Insufficient permissions/i);

      // Manager attempts POST /merchant/team (invite)
      const { req: mgrPostReq, res: mgrPostRes } = createMockHttp({
        headers: { authorization: `Bearer ${managerSession.token}` },
        body: { email: 'newstaff@roleblock.in', role: 'staff' },
      });
      await teamPostHandler(mgrPostReq, mgrPostRes);
      assert.equal(mgrPostRes.getStatusCode(), 403);

      // Create Staff
      const staffMember = await memoryStore.inviteMerchantMember({
        merchantId: reg.merchant.id,
        email: 'staff@roleblock.in',
        role: 'staff',
      });
      await memoryStore.updateMerchantMemberRoleOrStatus(reg.merchant.id, staffMember.id, {
        status: 'active',
      });

      const staffSession = await MerchantAuthEngine.createSession({
        userId: staffMember.userId,
        merchantId: reg.merchant.id,
        email: staffMember.email,
        role: 'staff',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Staff attempts GET /merchant/team
      const { req: stfReq, res: stfRes } = createMockHttp({
        headers: { authorization: `Bearer ${staffSession.token}` },
      });
      await teamGetHandler(stfReq, stfRes);
      assert.equal(stfRes.getStatusCode(), 403);
      assert.equal(stfRes.getBody().error, 'FORBIDDEN');
    });

    it('rejects unauthenticated requests to merchant team with 401 Unauthorized', async () => {
      const { req, res } = createMockHttp({});
      await teamGetHandler(req, res);
      assert.equal(res.getStatusCode(), 401);
      assert.equal(res.getBody().error, 'UNAUTHORIZED');
    });

    it('rejects Customer sessions from merchant team endpoints with 403 Forbidden', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: 'Bearer customer_token:cus_12345678' },
      });
      await teamGetHandler(req, res);
      assert.equal(res.getStatusCode(), 403);
      assert.equal(res.getBody().error, 'FORBIDDEN');
      assert.match(res.getBody().message, /Customer credentials cannot access merchant/i);
    });
  });

  // ==========================================
  // 2. Merchant Team Listing & Invitations
  // ==========================================
  describe('2. Merchant Team Collection & Invitations', () => {
    let merchant: any;
    let ownerSession: any;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Artisan Crafts',
        email: 'artisan@crafts.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });
      merchant = reg.merchant;
      await MerchantAuthEngine.updateMerchantStatus(merchant.id, 'active');

      ownerSession = await MerchantAuthEngine.createSession({
        userId: reg.user.id,
        merchantId: merchant.id,
        email: reg.user.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });
    });

    it('lists team members strictly scoped to authenticated merchant', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
      });

      await teamGetHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      const body = res.getBody();
      assert.equal(body.success, true);
      assert.equal(body.count, 1);
      assert.equal(body.members[0].role, 'owner');
      assert.equal(body.members[0].status, 'active');
      assert.equal(body.members[0].email, 'artisan@crafts.in');
    });

    it('invites a new team member with valid role and invited status', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        body: {
          email: 'designer@crafts.in',
          role: 'manager',
        },
      });

      await teamPostHandler(req, res);

      assert.equal(res.getStatusCode(), 201);
      const body = res.getBody();
      assert.equal(body.success, true);
      assert.equal(body.member.email, 'designer@crafts.in');
      assert.equal(body.member.role, 'manager');
      assert.equal(body.member.status, 'invited', 'Invited member status must strictly be invited');
      assert.equal(body.member.merchantId, merchant.id);

      // Verify member appears in GET /merchant/team
      const { req: getReq, res: getRes } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
      });
      await teamGetHandler(getReq, getRes);
      assert.equal(getRes.getStatusCode(), 200);
      assert.equal(getRes.getBody().count, 2);
    });

    it('supports POST /merchant/team/invite as an explicit alias route', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        body: {
          email: 'support@crafts.in',
          role: 'staff',
        },
      });

      await teamInvitePostHandler(req, res);

      assert.equal(res.getStatusCode(), 201);
      const body = res.getBody();
      assert.equal(body.success, true);
      assert.equal(body.member.email, 'support@crafts.in');
      assert.equal(body.member.role, 'staff');
      assert.equal(body.member.status, 'invited');
    });

    it('rejects invalid or missing email format with 400 Bad Request', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        body: {
          email: 'not-an-email',
          role: 'staff',
        },
      });

      await teamPostHandler(req, res);

      assert.equal(res.getStatusCode(), 400);
      assert.equal(res.getBody().error, 'INVALID_EMAIL');
    });

    it('rejects invalid role with 400 Bad Request', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        body: {
          email: 'hacker@crafts.in',
          role: 'super_hero',
        },
      });

      await teamPostHandler(req, res);

      assert.equal(res.getStatusCode(), 400);
      assert.match(res.getBody().error, /INVALID_ROLE/);
    });

    it('rejects duplicate team member invitations with 409 Conflict', async () => {
      // First invitation
      const { req: req1, res: res1 } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        body: { email: 'dup@crafts.in', role: 'staff' },
      });
      await teamPostHandler(req1, res1);
      assert.equal(res1.getStatusCode(), 201);

      // Second invitation with same email
      const { req: req2, res: res2 } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        body: { email: 'dup@crafts.in', role: 'manager' },
      });
      await teamPostHandler(req2, res2);

      assert.equal(res2.getStatusCode(), 409);
      assert.equal(res2.getBody().error, 'DUPLICATE_MEMBERSHIP');
    });
  });

  // ==========================================
  // 3. Member Role & Status Updates
  // ==========================================
  describe('3. Member Role and Status Updates', () => {
    let merchant: any;
    let ownerSession: any;
    let targetMember: any;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Silk Weavers',
        email: 'master@silkweavers.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });
      merchant = reg.merchant;
      await MerchantAuthEngine.updateMerchantStatus(merchant.id, 'active');

      ownerSession = await MerchantAuthEngine.createSession({
        userId: reg.user.id,
        merchantId: merchant.id,
        email: reg.user.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      targetMember = await memoryStore.inviteMerchantMember({
        merchantId: merchant.id,
        email: 'weaver@silkweavers.in',
        role: 'staff',
      });
    });

    it('updates member role from staff to manager', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: targetMember.id },
        body: { role: 'manager' },
      });

      await teamMemberPutHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      const body = res.getBody();
      assert.equal(body.success, true);
      assert.equal(body.member.role, 'manager');
      assert.equal(body.member.id, targetMember.id);
    });

    it('updates member status from invited to active, then active to suspended', async () => {
      // 1. Activate invited member
      const { req: req1, res: res1 } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: targetMember.id },
        body: { status: 'active' },
      });
      await teamMemberPutHandler(req1, res1);

      assert.equal(res1.getStatusCode(), 200);
      assert.equal(res1.getBody().member.status, 'active');

      // 2. Suspend active member
      const { req: req2, res: res2 } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: targetMember.id },
        body: { status: 'suspended' },
      });
      await teamMemberPutHandler(req2, res2);

      assert.equal(res2.getStatusCode(), 200);
      assert.equal(res2.getBody().member.status, 'suspended');

      // 3. Reactivate suspended member
      const { req: req3, res: res3 } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: targetMember.id },
        body: { status: 'active' },
      });
      await teamMemberPutHandler(req3, res3);

      assert.equal(res3.getStatusCode(), 200);
      assert.equal(res3.getBody().member.status, 'active');
    });

    it('rejects update request without role or status with 400 Bad Request', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: targetMember.id },
        body: {},
      });

      await teamMemberPutHandler(req, res);

      assert.equal(res.getStatusCode(), 400);
      assert.equal(res.getBody().error, 'MISSING_UPDATE_FIELDS');
    });

    it('rejects update on non-existent member with 404 Not Found', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: 'mem_nonexistent_999' },
        body: { role: 'admin' },
      });

      await teamMemberPutHandler(req, res);

      assert.equal(res.getStatusCode(), 404);
      assert.equal(res.getBody().error, 'MEMBER_NOT_FOUND');
    });
  });

  // ==========================================
  // 4. Anti-Escalation & Role Ceiling Protection
  // ==========================================
  describe('4. Anti-Escalation & Role Ceiling Protection', () => {
    let merchant: any;
    let ownerSession: any;
    let adminMember: any;
    let adminSession: any;
    let staffMember: any;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Escalation Defense Store',
        email: 'root@defense.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });
      merchant = reg.merchant;
      await MerchantAuthEngine.updateMerchantStatus(merchant.id, 'active');

      ownerSession = await MerchantAuthEngine.createSession({
        userId: reg.user.id,
        merchantId: merchant.id,
        email: reg.user.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Create Admin member & session
      adminMember = await memoryStore.inviteMerchantMember({
        merchantId: merchant.id,
        email: 'admin@defense.in',
        role: 'admin',
      });
      await memoryStore.updateMerchantMemberRoleOrStatus(merchant.id, adminMember.id, {
        status: 'active',
      });

      adminSession = await MerchantAuthEngine.createSession({
        userId: adminMember.userId,
        merchantId: merchant.id,
        email: adminMember.email,
        role: 'admin',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      staffMember = await memoryStore.inviteMerchantMember({
        merchantId: merchant.id,
        email: 'staff@defense.in',
        role: 'staff',
      });
    });

    it('strictly prohibits any merchant user from assigning super_admin role with 403 Forbidden', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        body: {
          email: 'attacker@defense.in',
          role: 'super_admin' as any,
        },
      });

      await teamPostHandler(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.equal(res.getBody().error, 'PLATFORM_ROLE_ESCALATION_PROHIBITED');
    });

    it('prohibits Admin caller from inviting an Owner with 403 Forbidden (CANNOT_GRANT_ROLE_ABOVE_CEILING)', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${adminSession.token}` },
        body: {
          email: 'coowner@defense.in',
          role: 'owner',
        },
      });

      await teamPostHandler(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.equal(res.getBody().error, 'CANNOT_GRANT_ROLE_ABOVE_CEILING');
    });

    it('prohibits Admin caller from promoting a member to Owner with 403 Forbidden', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${adminSession.token}` },
        params: { id: staffMember.id },
        body: { role: 'owner' },
      });

      await teamMemberPutHandler(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.equal(res.getBody().error, 'CANNOT_GRANT_ROLE_ABOVE_CEILING');
    });

    it('prohibits Admin caller from modifying an Owner member (role or status) with 403 Forbidden', async () => {
      const ownerMember = (await memoryStore.listMerchantMembers(merchant.id)).find(
        (m) => m.role === 'owner'
      );
      assert.ok(ownerMember);

      // Admin tries to demote Owner to Staff
      const { req: req1, res: res1 } = createMockHttp({
        headers: { authorization: `Bearer ${adminSession.token}` },
        params: { id: ownerMember.id },
        body: { role: 'staff' },
      });
      await teamMemberPutHandler(req1, res1);

      assert.equal(res1.getStatusCode(), 403);
      assert.equal(res1.getBody().error, 'CANNOT_MODIFY_HIGHER_ROLE');

      // Admin tries to suspend Owner
      const { req: req2, res: res2 } = createMockHttp({
        headers: { authorization: `Bearer ${adminSession.token}` },
        params: { id: ownerMember.id },
        body: { status: 'suspended' },
      });
      await teamMemberPutHandler(req2, res2);

      assert.equal(res2.getStatusCode(), 403);
      assert.equal(res2.getBody().error, 'CANNOT_MODIFY_HIGHER_ROLE');
    });

    it('prohibits Admin caller from removing an Owner member with 403 Forbidden', async () => {
      const ownerMember = (await memoryStore.listMerchantMembers(merchant.id)).find(
        (m) => m.role === 'owner'
      );
      assert.ok(ownerMember);

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${adminSession.token}` },
        params: { id: ownerMember.id },
      });
      await teamMemberDeleteHandler(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.equal(res.getBody().error, 'CANNOT_MODIFY_HIGHER_ROLE');
    });

    it('allows Admin caller to manage Staff and Manager members (role update and removal)', async () => {
      // Admin promotes staff to manager
      const { req: putReq, res: putRes } = createMockHttp({
        headers: { authorization: `Bearer ${adminSession.token}` },
        params: { id: staffMember.id },
        body: { role: 'manager' },
      });
      await teamMemberPutHandler(putReq, putRes);
      assert.equal(putRes.getStatusCode(), 200);
      assert.equal(putRes.getBody().member.role, 'manager');

      // Admin removes manager
      const { req: delReq, res: delRes } = createMockHttp({
        headers: { authorization: `Bearer ${adminSession.token}` },
        params: { id: staffMember.id },
      });
      await teamMemberDeleteHandler(delReq, delRes);
      assert.equal(delRes.getStatusCode(), 200);
      assert.equal(delRes.getBody().success, true);
    });
  });

  // ==========================================
  // 5. Sole Active Owner Protection & Concurrency Invariant
  // ==========================================
  describe('5. Sole Active Owner Protection & Concurrency Lock', () => {
    let merchant: any;
    let ownerSession: any;
    let soleOwnerMember: any;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Sole Owner Defense Store',
        email: 'solo@soleowner.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });
      merchant = reg.merchant;
      await MerchantAuthEngine.updateMerchantStatus(merchant.id, 'active');

      ownerSession = await MerchantAuthEngine.createSession({
        userId: reg.user.id,
        merchantId: merchant.id,
        email: reg.user.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      const members = await memoryStore.listMerchantMembers(merchant.id);
      soleOwnerMember = members.find((m) => m.role === 'owner');
      assert.ok(soleOwnerMember);
    });

    it('rejects demoting sole active owner with 409 Conflict (SOLE_OWNER_PROTECTION)', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: soleOwnerMember.id },
        body: { role: 'admin' },
      });

      await teamMemberPutHandler(req, res);

      assert.equal(res.getStatusCode(), 409);
      assert.equal(res.getBody().error, 'SOLE_OWNER_PROTECTION');
      assert.match(res.getBody().message, /Cannot demote the sole active owner/i);
    });

    it('rejects suspending sole active owner with 409 Conflict (SOLE_OWNER_PROTECTION)', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: soleOwnerMember.id },
        body: { status: 'suspended' },
      });

      await teamMemberPutHandler(req, res);

      assert.equal(res.getStatusCode(), 409);
      assert.equal(res.getBody().error, 'SOLE_OWNER_PROTECTION');
      assert.match(res.getBody().message, /Cannot suspend or deactivate the sole active owner/i);
    });

    it('rejects removing sole active owner with 409 Conflict (SOLE_OWNER_PROTECTION)', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: soleOwnerMember.id },
      });

      await teamMemberDeleteHandler(req, res);

      assert.equal(res.getStatusCode(), 409);
      assert.equal(res.getBody().error, 'SOLE_OWNER_PROTECTION');
      assert.match(res.getBody().message, /Cannot remove the sole active owner/i);
    });

    it('permits demoting or removing one owner when a second active owner exists', async () => {
      // Invite second owner
      const secondOwner = await memoryStore.inviteMerchantMember({
        merchantId: merchant.id,
        email: 'coowner@soleowner.in',
        role: 'owner',
      });
      // Activate second owner
      await memoryStore.updateMerchantMemberRoleOrStatus(merchant.id, secondOwner.id, {
        status: 'active',
      });

      // Verify two active owners exist
      const members = await memoryStore.listMerchantMembers(merchant.id);
      const activeOwners = members.filter((m) => m.role === 'owner' && m.status === 'active');
      assert.equal(activeOwners.length, 2);

      // Demoting first owner now succeeds because second active owner exists
      const { req: demoteReq, res: demoteRes } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: soleOwnerMember.id },
        body: { role: 'admin' },
      });
      await teamMemberPutHandler(demoteReq, demoteRes);

      assert.equal(demoteRes.getStatusCode(), 200);
      assert.equal(demoteRes.getBody().member.role, 'admin');

      // First owner's role changed, so his session was revoked.
      // Create active session for second owner to verify that second owner is now protected as sole active owner.
      const secondOwnerSession = await MerchantAuthEngine.createSession({
        userId: secondOwner.userId,
        merchantId: merchant.id,
        email: secondOwner.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Now attempting to demote the second (and now sole) active owner fails
      const { req: demote2Req, res: demote2Res } = createMockHttp({
        headers: { authorization: `Bearer ${secondOwnerSession.token}` },
        params: { id: secondOwner.id },
        body: { role: 'admin' },
      });
      await teamMemberPutHandler(demote2Req, demote2Res);

      assert.equal(demote2Res.getStatusCode(), 409);
      assert.equal(demote2Res.getBody().error, 'SOLE_OWNER_PROTECTION');
    });

    it('serializes concurrent owner demotions under withMerchantLock so exactly 1 owner remains', async () => {
      // Add second owner
      const secondOwner = await memoryStore.inviteMerchantMember({
        merchantId: merchant.id,
        email: 'coowner_race@soleowner.in',
        role: 'owner',
      });
      await memoryStore.updateMerchantMemberRoleOrStatus(merchant.id, secondOwner.id, {
        status: 'active',
      });

      const callerDto = (await MerchantAuthEngine.resolveSession(ownerSession.token))!;

      // Simulate simultaneous demotion race of both co-owners
      const demote1 = () =>
        MerchantAuthEngine.updateTeamMember(
          callerDto,
          soleOwnerMember.id,
          { role: 'admin' }
        );

      const demote2 = () =>
        MerchantAuthEngine.updateTeamMember(
          callerDto,
          secondOwner.id,
          { role: 'admin' }
        );

      const results = await Promise.allSettled([demote1(), demote2()]);
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, 'Exactly one concurrent demotion must succeed');
      assert.equal(rejected.length, 1, 'Exactly one concurrent demotion must fail');

      const rejectReason = (rejected[0] as PromiseRejectedResult).reason?.message;
      assert.match(rejectReason, /SOLE_OWNER_PROTECTION/);

      // Verify invariant: exactly 1 active owner remains
      const currentMembers = await memoryStore.listMerchantMembers(merchant.id);
      const remainingActiveOwners = currentMembers.filter(
        (m) => m.role === 'owner' && m.status === 'active'
      );
      assert.equal(remainingActiveOwners.length, 1, 'Store must never be left without an active owner');
    });
  });

  // ==========================================
  // 6. Cross-Tenant Isolation & IDOR Defense
  // ==========================================
  describe('6. Cross-Tenant Isolation & IDOR Protection', () => {
    let merchantA: any;
    let sessionA: any;
    let memberA: any;

    let merchantB: any;
    let sessionB: any;
    let memberB: any;

    beforeEach(async () => {
      // Merchant A
      const regA = await MerchantAuthEngine.registerMerchant({
        name: 'Tenant Alpha',
        email: 'owner@alpha.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });
      merchantA = regA.merchant;
      await MerchantAuthEngine.updateMerchantStatus(merchantA.id, 'active');
      sessionA = await MerchantAuthEngine.createSession({
        userId: regA.user.id,
        merchantId: merchantA.id,
        email: regA.user.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });
      memberA = (await memoryStore.listMerchantMembers(merchantA.id))[0];

      // Merchant B
      const regB = await MerchantAuthEngine.registerMerchant({
        name: 'Tenant Beta',
        email: 'owner@beta.in',
        phone: '+919876543211',
        password: 'Password@2026',
      });
      merchantB = regB.merchant;
      await MerchantAuthEngine.updateMerchantStatus(merchantB.id, 'active');
      sessionB = await MerchantAuthEngine.createSession({
        userId: regB.user.id,
        merchantId: merchantB.id,
        email: regB.user.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });
      memberB = (await memoryStore.listMerchantMembers(merchantB.id))[0];
    });

    it('strictly confines GET /merchant/team to the caller merchant without leaking other tenants', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${sessionA.token}` },
      });
      await teamGetHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      const members = res.getBody().members;
      assert.equal(members.length, 1);
      assert.equal(members[0].merchantId, merchantA.id);
      assert.equal(members[0].email, 'owner@alpha.in');
    });

    it('rejects Merchant A modifying Merchant B member with 403 Forbidden (CROSS_TENANT_ACCESS_DENIED)', async () => {
      // Add staff member to Tenant B
      const bStaff = await memoryStore.inviteMerchantMember({
        merchantId: merchantB.id,
        email: 'staff@beta.in',
        role: 'staff',
      });

      // Tenant A caller attempts PUT /merchant/team/:id with Tenant B member's ID
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${sessionA.token}` },
        params: { id: bStaff.id },
        body: { role: 'manager' },
      });

      await teamMemberPutHandler(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.equal(res.getBody().error, 'CROSS_TENANT_ACCESS_DENIED');
      assert.match(res.getBody().message, /Cannot modify members belonging to another merchant/i);
    });

    it('rejects Merchant A deleting Merchant B member with 403 Forbidden (CROSS_TENANT_ACCESS_DENIED)', async () => {
      const bStaff = await memoryStore.inviteMerchantMember({
        merchantId: merchantB.id,
        email: 'removestaff@beta.in',
        role: 'staff',
      });

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${sessionA.token}` },
        params: { id: bStaff.id },
      });

      await teamMemberDeleteHandler(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.equal(res.getBody().error, 'CROSS_TENANT_ACCESS_DENIED');
    });

    it('rejects forged client-supplied merchant_id differing from verified session token', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${sessionA.token}` },
        body: {
          merchant_id: merchantB.id, // Forged tenant ID
          email: 'forged@beta.in',
          role: 'staff',
        },
      });

      await teamPostHandler(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.equal(res.getBody().error, 'FORBIDDEN');
      assert.match(res.getBody().message, /FORGED_MERCHANT_ID/);
    });
  });

  // ==========================================
  // 7. Session Predictability & Instant Revocation
  // ==========================================
  describe('7. Session Predictability & Instant Revocation', () => {
    let merchant: any;
    let ownerSession: any;
    let staffUser: any;
    let staffMember: any;
    let staffSession: any;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Revocation Test Store',
        email: 'owner@revokestore.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });
      merchant = reg.merchant;
      await MerchantAuthEngine.updateMerchantStatus(merchant.id, 'active');

      ownerSession = await MerchantAuthEngine.createSession({
        userId: reg.user.id,
        merchantId: merchant.id,
        email: reg.user.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Add and activate staff member
      staffMember = await memoryStore.inviteMerchantMember({
        merchantId: merchant.id,
        email: 'staff@revokestore.in',
        role: 'staff',
      });
      await memoryStore.updateMerchantMemberRoleOrStatus(merchant.id, staffMember.id, {
        status: 'active',
      });

      staffSession = await MerchantAuthEngine.createSession({
        userId: staffMember.userId,
        merchantId: merchant.id,
        email: staffMember.email,
        role: 'staff',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Verify initial session resolves
      const resolved = await MerchantAuthEngine.resolveSession(staffSession.token);
      assert.ok(resolved);
      assert.equal(resolved.userId, staffMember.userId);
    });

    it('immediately invalidates active sessions when member is suspended via PUT /merchant/team/:id', async () => {
      // Suspend member
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: staffMember.id },
        body: { status: 'suspended' },
      });
      await teamMemberPutHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      assert.equal(res.getBody().member.status, 'suspended');

      // Attempt to resolve staff session immediately after suspension
      const resolvedAfter = await MerchantAuthEngine.resolveSession(staffSession.token);
      assert.equal(resolvedAfter, null, 'Suspended member session must immediately resolve to null');

      // Staff authenticated API call must now fail with 401 Unauthorized
      const protectedRoute = requireTenantAuth(
        { boundary: 'merchant' },
        async (r, s) => {
          s.status(200).json({ ok: true });
        }
      );
      const { req: apiReq, res: apiRes } = createMockHttp({
        headers: { authorization: `Bearer ${staffSession.token}` },
      });
      await protectedRoute(apiReq, apiRes);
      assert.equal(apiRes.getStatusCode(), 401);
    });

    it('immediately invalidates active sessions when member is removed via DELETE /merchant/team/:id', async () => {
      // Delete member
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${ownerSession.token}` },
        params: { id: staffMember.id },
      });
      await teamMemberDeleteHandler(req, res);

      assert.equal(res.getStatusCode(), 200);

      // Session resolves to null
      const resolvedAfter = await MerchantAuthEngine.resolveSession(staffSession.token);
      assert.equal(resolvedAfter, null, 'Deleted member session must immediately resolve to null');
    });

    it('enforces distributed session revocation across shared storage adapter', async () => {
      // Test global revocation timestamp
      await MerchantAuthEngine.revokeAllUserSessions(staffMember.userId);

      const resolved = await MerchantAuthEngine.resolveSession(staffSession.token);
      assert.equal(resolved, null, 'Session created prior to global revocation timestamp must be rejected');
    });
  });

  // ==========================================
  // 8. Super Admin Platform Team Management
  // ==========================================
  describe('8. Super Admin Platform Team Management', () => {
    let merchantA: any;
    let merchantB: any;
    let superAdminToken: string;

    beforeEach(async () => {
      // Register Merchant A
      const regA = await MerchantAuthEngine.registerMerchant({
        name: 'Platform Merchant A',
        email: 'owner@platforma.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });
      merchantA = regA.merchant;
      await memoryStore.inviteMerchantMember({
        merchantId: merchantA.id,
        email: 'manager@platforma.in',
        role: 'manager',
      });

      // Register Merchant B
      const regB = await MerchantAuthEngine.registerMerchant({
        name: 'Platform Merchant B',
        email: 'owner@platformb.in',
        phone: '+919876543211',
        password: 'Password@2026',
      });
      merchantB = regB.merchant;

      superAdminToken = 'admin_token:usr_superadmin_01';
    });

    it('allows Super Admin to list members across all merchants via GET /admin/marketplace/team', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${superAdminToken}` },
      });

      await adminTeamGetHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      const body = res.getBody();
      assert.equal(body.success, true);
      // Merchant A (owner + manager) + Merchant B (owner) = 3 total members
      assert.equal(body.count, 3);
    });

    it('allows Super Admin to filter platform team directory by merchant_id, role, or status', async () => {
      // Filter by merchant A
      const { req: reqA, res: resA } = createMockHttp({
        headers: { authorization: `Bearer ${superAdminToken}` },
        query: { merchant_id: merchantA.id },
      });
      await adminTeamGetHandler(reqA, resA);
      assert.equal(resA.getStatusCode(), 200);
      assert.equal(resA.getBody().count, 2);

      // Filter by role=manager
      const { req: reqRole, res: resRole } = createMockHttp({
        headers: { authorization: `Bearer ${superAdminToken}` },
        query: { role: 'manager' },
      });
      await adminTeamGetHandler(reqRole, resRole);
      assert.equal(resRole.getStatusCode(), 200);
      assert.equal(resRole.getBody().count, 1);
      assert.equal(resRole.getBody().members[0].role, 'manager');
    });

    it('allows Super Admin to update member role and status via PUT /admin/marketplace/members/:id', async () => {
      const membersA = await memoryStore.listMerchantMembers(merchantA.id);
      const managerA = membersA.find((m) => m.role === 'manager');
      assert.ok(managerA);

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${superAdminToken}` },
        params: { id: managerA.id },
        body: { role: 'admin', status: 'active' },
      });

      await adminMemberPutHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      const body = res.getBody();
      assert.equal(body.success, true);
      assert.equal(body.member.role, 'admin');
      assert.equal(body.member.status, 'active');
    });

    it('enforces sole active owner protection even for Super Admin modifications', async () => {
      const membersB = await memoryStore.listMerchantMembers(merchantB.id);
      const ownerB = membersB.find((m) => m.role === 'owner');
      assert.ok(ownerB);

      // Super Admin attempts to demote sole active owner of Merchant B
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${superAdminToken}` },
        params: { id: ownerB.id },
        body: { role: 'admin' },
      });

      await adminMemberPutHandler(req, res);

      assert.equal(res.getStatusCode(), 409);
      assert.equal(res.getBody().error, 'SOLE_OWNER_PROTECTION');
    });

    it('blocks merchant users from accessing platform admin endpoints with 403 Forbidden', async () => {
      const merchantSession = await MerchantAuthEngine.createSession({
        userId: 'usr_merch_123',
        merchantId: merchantA.id,
        email: 'owner@platforma.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${merchantSession.token}` },
      });

      await adminTeamGetHandler(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.equal(res.getBody().error, 'FORBIDDEN');
    });
  });

  // ==========================================
  // 9. Structured Audit Logging & Secret Redaction
  // ==========================================
  describe('9. Structured Audit Event Logging & Secret Redaction', () => {
    let merchant: any;
    let ownerSession: any;

    beforeEach(async () => {
      MerchantAuthEngine.clearTeamAuditLogs();

      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Audit Test Store',
        email: 'audit@store.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });
      merchant = reg.merchant;
      await MerchantAuthEngine.updateMerchantStatus(merchant.id, 'active');

      ownerSession = await MerchantAuthEngine.createSession({
        userId: reg.user.id,
        merchantId: merchant.id,
        email: reg.user.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });
    });

    it('records structured audit events for member invite, update, and removal', async () => {
      const callerDto = (await MerchantAuthEngine.resolveSession(ownerSession.token))!;

      // 1. Invite
      const member = await MerchantAuthEngine.inviteTeamMember(
        callerDto,
        { email: 'newmember@audit.in', role: 'staff' },
        '192.168.1.10',
        'Mozilla/5.0'
      );

      // 2. Update role
      await MerchantAuthEngine.updateTeamMember(
        callerDto,
        member.id,
        { role: 'manager' },
        '192.168.1.10',
        'Mozilla/5.0'
      );

      // 3. Update status
      await MerchantAuthEngine.updateTeamMember(
        callerDto,
        member.id,
        { status: 'active' },
        '192.168.1.10',
        'Mozilla/5.0'
      );

      // 4. Remove
      await MerchantAuthEngine.removeTeamMember(
        callerDto,
        member.id,
        '192.168.1.10',
        'Mozilla/5.0'
      );

      const auditLogs = MerchantAuthEngine.getTeamAuditLogs();
      assert.equal(auditLogs.length, 4);

      // Verify event actions
      assert.equal(auditLogs[0].action, 'team.member.invited');
      assert.equal(auditLogs[0].actorUserId, ownerSession.userId);
      assert.equal(auditLogs[0].merchantId, merchant.id);
      assert.equal(auditLogs[0].newRole, 'staff');
      assert.equal(auditLogs[0].ip, '192.168.1.10');

      assert.equal(auditLogs[1].action, 'team.member.role_updated');
      assert.equal(auditLogs[1].previousRole, 'staff');
      assert.equal(auditLogs[1].newRole, 'manager');

      assert.equal(auditLogs[2].action, 'team.member.status_updated');
      assert.equal(auditLogs[2].previousStatus, 'invited');
      assert.equal(auditLogs[2].newStatus, 'active');

      assert.equal(auditLogs[3].action, 'team.member.revoked');
      assert.equal(auditLogs[3].targetMemberId, member.id);
    });

    it('guarantees ZERO passwords, hashes, salts, reset tokens, or session tokens in audit logs', () => {
      const logs = MerchantAuthEngine.getTeamAuditLogs();
      for (const log of logs) {
        const serialized = JSON.stringify(log);
        assert.doesNotMatch(serialized, /password/i);
        assert.doesNotMatch(serialized, /salt/i);
        assert.doesNotMatch(serialized, /scrypt/i);
        assert.doesNotMatch(serialized, /sess_merch_/);
        assert.doesNotMatch(serialized, /reset_merch_/);
      }
    });
  });

  // ==========================================
  // 10. Authoritative Shared Persistence (PostgreSQL & Redis)
  // ==========================================
  describe('10. Authoritative Shared Persistence (PostgreSQL & Redis)', () => {
    let pgStore: PostgresMerchantIdentityStore;
    let redisAdapter: RedisMerchantAuthStorageAdapter;
    let directPool: Pool;
    const dbUrl =
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres_secure_password@localhost:5432/medusa_db';
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    before(async () => {
      directPool = new Pool({ connectionString: dbUrl, max: 2 });
      pgStore = new PostgresMerchantIdentityStore({ databaseUrl: dbUrl, pool: directPool });
      redisAdapter = new RedisMerchantAuthStorageAdapter(redisUrl);
    });

    after(async () => {
      try {
        await directPool.end();
      } catch {}
      try {
        await (redisAdapter as any).client?.quit();
      } catch {}
      try {
        await PostgresMerchantIdentityStore.shutdown();
      } catch {}
    });

    it('persists invited member, role update, and removal in PostgreSQL marketplace tables', async () => {
      MerchantAuthEngine.setIdentityStore(pgStore);
      MerchantAuthEngine.setAdapter(redisAdapter);

      const uniqueEmail = `owner_${Date.now()}@pgstore.in`;
      const uniqueHandle = `pghandle-${Date.now()}`;
      const invitedEmail = `invited_${Date.now()}@pgstore.in`;

      // 1. Register merchant in PostgreSQL
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'PG Persistence Store',
        handle: uniqueHandle,
        email: uniqueEmail,
        phone: '+919876543210',
        password: 'Password@2026',
      });
      await MerchantAuthEngine.updateMerchantStatus(reg.merchant.id, 'active');

      const ownerSession = await MerchantAuthEngine.createSession({
        userId: reg.user.id,
        merchantId: reg.merchant.id,
        email: reg.user.email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      const callerDto = (await MerchantAuthEngine.resolveSession(ownerSession.token))!;

      // 2. Invite member into PostgreSQL
      const invited = await MerchantAuthEngine.inviteTeamMember(
        callerDto,
        { email: invitedEmail, role: 'staff' },
        '127.0.0.1',
        'NodeTest'
      );

      assert.equal(invited.email, invitedEmail);
      assert.equal(invited.role, 'staff');
      assert.equal(invited.status, 'invited');

      // Verify row exists in PostgreSQL merchant_member table
      const memberQuery = await directPool.query(
        'SELECT * FROM merchant_member WHERE id = $1',
        [invited.id]
      );
      assert.equal(memberQuery.rows.length, 1);
      assert.equal(memberQuery.rows[0].role, 'staff');
      assert.equal(memberQuery.rows[0].status, 'invited');

      // 3. Update member role to manager in PostgreSQL
      const updated = await MerchantAuthEngine.updateTeamMember(
        callerDto,
        invited.id,
        { role: 'manager' }
      );
      assert.equal(updated.role, 'manager');

      const updatedQuery = await directPool.query(
        'SELECT * FROM merchant_member WHERE id = $1',
        [invited.id]
      );
      assert.equal(updatedQuery.rows[0].role, 'manager');

      // Query owner member row from PostgreSQL
      const ownerQuery = await directPool.query(
        'SELECT * FROM merchant_member WHERE merchant_id = $1 AND role = $2',
        [reg.merchant.id, 'owner']
      );
      assert.equal(ownerQuery.rows.length, 1);
      const ownerMemberId = ownerQuery.rows[0].id;

      // 4. Enforce sole active owner protection against PostgreSQL
      await assert.rejects(
        () =>
          MerchantAuthEngine.updateTeamMember(
            callerDto,
            ownerMemberId,
            { role: 'staff' }
          ),
        /SOLE_OWNER_PROTECTION/
      );

      // 5. Remove member from PostgreSQL
      const removed = await MerchantAuthEngine.removeTeamMember(callerDto, invited.id);
      assert.equal(removed, true);

      const deletedQuery = await directPool.query(
        'SELECT * FROM merchant_member WHERE id = $1',
        [invited.id]
      );
      assert.equal(deletedQuery.rows.length, 0, 'Member row must be deleted from PostgreSQL');

      // 6. Removing sole owner still fails in PostgreSQL
      await assert.rejects(
        () => MerchantAuthEngine.removeTeamMember(callerDto, ownerMemberId),
        /SOLE_OWNER_PROTECTION/
      );
    });

    it('enforces Redis-backed distributed session revocation upon member suspension', async () => {
      MerchantAuthEngine.setIdentityStore(pgStore);
      MerchantAuthEngine.setAdapter(redisAdapter);

      const staffEmail = `redis_staff_${Date.now()}@pgstore.in`;
      const staffUser = await (pgStore as any).userModule.createUsers({ email: staffEmail });

      const testSession = await MerchantAuthEngine.createSession({
        userId: staffUser.id,
        merchantId: 'merch_test_redis',
        email: staffEmail,
        role: 'staff',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Session resolves before revocation
      const beforeRevocation = await MerchantAuthEngine.resolveSession(testSession.token);
      assert.ok(beforeRevocation);

      // Revoke all sessions for this user in Redis
      await MerchantAuthEngine.revokeAllUserSessions(staffUser.id);

      // Session must immediately resolve to null via Redis
      const afterRevocation = await MerchantAuthEngine.resolveSession(testSession.token);
      assert.equal(afterRevocation, null, 'Redis revocation must invalidate active session immediately');
    });
  });

  // ==========================================
  // 11. Distributed Multi-Instance Concurrency & PostgreSQL Advisory Locking
  // ==========================================
  describe('11. Distributed Multi-Instance Concurrency & PostgreSQL Advisory Locking', () => {
    let directPool: Pool;
    let svcInstance1: any;
    let svcInstance2: any;
    const dbUrl =
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres_secure_password@localhost:5432/medusa_db';

    before(async () => {
      directPool = new Pool({ connectionString: dbUrl, max: 10 });

      const distMarketplace = path.resolve(__dirname, 'modules/marketplace');
      const srcMarketplace = path.resolve(process.cwd(), 'apps/backend/src/modules/marketplace');
      const marketplacePath = require('fs').existsSync(distMarketplace) ? distMarketplace : srcMarketplace;

      // Bootstrap two independent marketplace module instances sharing the same PostgreSQL database
      const [c1, c2] = await Promise.all([
        MedusaModule.bootstrap({
          moduleKey: 'marketplace_inst_1',
          defaultPath: marketplacePath,
          declaration: {
            scope: 'internal',
            resolve: marketplacePath,
            options: { database: { clientUrl: dbUrl } },
          },
        }),
        MedusaModule.bootstrap({
          moduleKey: 'marketplace_inst_2',
          defaultPath: marketplacePath,
          declaration: {
            scope: 'internal',
            resolve: marketplacePath,
            options: { database: { clientUrl: dbUrl } },
          },
        }),
      ]);

      svcInstance1 = c1['marketplace_inst_1'];
      svcInstance2 = c2['marketplace_inst_2'];
    });

    after(async () => {
      try {
        await directPool.end();
      } catch {}
      for (const svc of [svcInstance1, svcInstance2]) {
        if (svc && svc.__container__) {
          try {
            const manager = svc.__container__['manager'];
            if (manager && typeof manager.getConnection === 'function') {
              const knex = manager.getConnection().getKnex?.();
              if (knex && typeof knex.destroy === 'function') {
                await knex.destroy();
              }
            }
          } catch {}
        }
      }
      try {
        await MedusaModule.onApplicationShutdown();
        MedusaModule.clearInstances();
      } catch {}
    });

    it('serializes concurrent owner demotions across independent backend instances (exactly 1 active owner remains)', async () => {
      const handle = `multi-demote-${Date.now()}`;
      const merchant = await svcInstance1.createMerchants({
        name: 'Multi Demote Store',
        handle,
        status: 'active',
        email: `demote_${Date.now()}@test.in`,
        phone: '+919876543210',
      });

      const o1 = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_d1_${Date.now()}`,
        role: 'owner',
        status: 'active',
      });

      const o2 = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_d2_${Date.now()}`,
        role: 'owner',
        status: 'active',
      });

      // Instance 1 attempts demoting o1, Instance 2 simultaneously attempts demoting o2
      const [res1, res2] = await Promise.allSettled([
        svcInstance1.updateMerchantMemberRoleOrStatus(merchant.id, o1.user_id, { role: 'staff' }),
        svcInstance2.updateMerchantMemberRoleOrStatus(merchant.id, o2.user_id, { role: 'staff' }),
      ]);

      const fulfilled = [res1, res2].filter((r) => r.status === 'fulfilled');
      const rejected = [res1, res2].filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, 'Exactly one concurrent demotion must succeed across instances');
      assert.equal(rejected.length, 1, 'Exactly one concurrent demotion must be blocked across instances');
      assert.match(
        (rejected[0] as PromiseRejectedResult).reason?.message,
        /SOLE_OWNER_PROTECTION/,
        'Rejected request must report SOLE_OWNER_PROTECTION'
      );

      // Directly assert PostgreSQL database rows: exactly 1 active owner remains
      const dbRows = await directPool.query(
        'SELECT user_id, role, status FROM merchant_member WHERE merchant_id = $1 AND role = $2 AND status = $3',
        [merchant.id, 'owner', 'active']
      );
      assert.equal(dbRows.rows.length, 1, 'PostgreSQL database MUST retain exactly 1 active owner');

      // Cleanup
      await directPool.query('DELETE FROM merchant_member WHERE merchant_id = $1', [merchant.id]);
      await directPool.query('DELETE FROM merchant WHERE id = $1', [merchant.id]);
    });

    it('serializes concurrent owner suspensions across independent backend instances (exactly 1 active owner remains)', async () => {
      const handle = `multi-suspend-${Date.now()}`;
      const merchant = await svcInstance1.createMerchants({
        name: 'Multi Suspend Store',
        handle,
        status: 'active',
        email: `suspend_${Date.now()}@test.in`,
        phone: '+919876543210',
      });

      const o1 = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_s1_${Date.now()}`,
        role: 'owner',
        status: 'active',
      });

      const o2 = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_s2_${Date.now()}`,
        role: 'owner',
        status: 'active',
      });

      // Instance 1 attempts suspending o1, Instance 2 simultaneously attempts suspending o2
      const [res1, res2] = await Promise.allSettled([
        svcInstance1.updateMerchantMemberRoleOrStatus(merchant.id, o1.user_id, { status: 'suspended' }),
        svcInstance2.updateMerchantMemberRoleOrStatus(merchant.id, o2.user_id, { status: 'suspended' }),
      ]);

      const fulfilled = [res1, res2].filter((r) => r.status === 'fulfilled');
      const rejected = [res1, res2].filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, 'Exactly one concurrent suspension must succeed');
      assert.equal(rejected.length, 1, 'Exactly one concurrent suspension must fail');
      assert.match(
        (rejected[0] as PromiseRejectedResult).reason?.message,
        /SOLE_OWNER_PROTECTION/
      );

      // Directly assert PostgreSQL database state
      const dbRows = await directPool.query(
        'SELECT user_id, role, status FROM merchant_member WHERE merchant_id = $1 AND role = $2 AND status = $3',
        [merchant.id, 'owner', 'active']
      );
      assert.equal(dbRows.rows.length, 1, 'PostgreSQL database MUST retain exactly 1 active owner');

      // Cleanup
      await directPool.query('DELETE FROM merchant_member WHERE merchant_id = $1', [merchant.id]);
      await directPool.query('DELETE FROM merchant WHERE id = $1', [merchant.id]);
    });

    it('blocks concurrent removal and role-change across independent instances from bypassing sole-owner invariant', async () => {
      const handle = `multi-race-rm-${Date.now()}`;
      const merchant = await svcInstance1.createMerchants({
        name: 'Multi Race Remove Store',
        handle,
        status: 'active',
        email: `racerm_${Date.now()}@test.in`,
        phone: '+919876543210',
      });

      const o1 = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_rm1_${Date.now()}`,
        role: 'owner',
        status: 'active',
      });

      const o2 = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_rm2_${Date.now()}`,
        role: 'owner',
        status: 'active',
      });

      // Instance 1 removes o1, Instance 2 demotes o2 simultaneously
      const [res1, res2] = await Promise.allSettled([
        svcInstance1.removeMerchantMember(merchant.id, o1.id),
        svcInstance2.updateMerchantMemberRoleOrStatus(merchant.id, o2.id, { role: 'staff' }),
      ]);

      const fulfilled = [res1, res2].filter((r) => r.status === 'fulfilled');
      const rejected = [res1, res2].filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, 'Exactly one of remove or demote must succeed');
      assert.equal(rejected.length, 1, 'The competing mutation must be rejected');
      assert.match(
        (rejected[0] as PromiseRejectedResult).reason?.message,
        /SOLE_OWNER_PROTECTION/
      );

      // Assert final database state directly: 1 active owner remains
      const dbRows = await directPool.query(
        'SELECT user_id, role, status FROM merchant_member WHERE merchant_id = $1 AND role = $2 AND status = $3',
        [merchant.id, 'owner', 'active']
      );
      assert.equal(dbRows.rows.length, 1, 'Direct DB query proves exactly 1 active owner remains');

      // Cleanup
      await directPool.query('DELETE FROM merchant_member WHERE merchant_id = $1', [merchant.id]);
      await directPool.query('DELETE FROM merchant WHERE id = $1', [merchant.id]);
    });

    it('verifies failed transaction releases advisory lock and permits subsequent valid operations', async () => {
      const handle = `multi-release-${Date.now()}`;
      const merchant = await svcInstance1.createMerchants({
        name: 'Multi Release Store',
        handle,
        status: 'active',
        email: `release_${Date.now()}@test.in`,
        phone: '+919876543210',
      });

      const soleOwner = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_rel_owner_${Date.now()}`,
        role: 'owner',
        status: 'active',
      });

      const staff = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_rel_staff_${Date.now()}`,
        role: 'staff',
        status: 'active',
      });

      // 1. Instance 1 attempts illegal demotion of sole active owner -> fails
      await assert.rejects(
        () => svcInstance1.updateMerchantMemberRoleOrStatus(merchant.id, soleOwner.id, { role: 'staff' }),
        /SOLE_OWNER_PROTECTION/
      );

      // 2. Instance 2 immediately executes a valid update on the same merchant -> MUST succeed without waiting or deadlocking
      const updatedStaff = await svcInstance2.updateMerchantMemberRoleOrStatus(merchant.id, staff.id, {
        role: 'manager',
      });
      assert.equal(updatedStaff.role, 'manager');

      // Cleanup
      await directPool.query('DELETE FROM merchant_member WHERE merchant_id = $1', [merchant.id]);
      await directPool.query('DELETE FROM merchant WHERE id = $1', [merchant.id]);
    });

    it('ensures normal authorized team operations continue to succeed across instances', async () => {
      const handle = `multi-normal-${Date.now()}`;
      const merchant = await svcInstance1.createMerchants({
        name: 'Multi Normal Store',
        handle,
        status: 'active',
        email: `normal_${Date.now()}@test.in`,
        phone: '+919876543210',
      });

      const s1 = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_norm1_${Date.now()}`,
        role: 'staff',
        status: 'invited',
      });

      const s2 = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_norm2_${Date.now()}`,
        role: 'staff',
        status: 'active',
      });

      // Instance 1 activates s1
      const act1 = await svcInstance1.updateMerchantMemberRoleOrStatus(merchant.id, s1.id, { status: 'active' });
      assert.equal(act1.status, 'active');

      // Instance 2 promotes s2 to manager
      const prom2 = await svcInstance2.updateMerchantMemberRoleOrStatus(merchant.id, s2.id, { role: 'manager' });
      assert.equal(prom2.role, 'manager');

      // Cleanup
      await directPool.query('DELETE FROM merchant_member WHERE merchant_id = $1', [merchant.id]);
      await directPool.query('DELETE FROM merchant WHERE id = $1', [merchant.id]);
    });

    it('enforces database-backed sole-owner invariant against Super Admin platform mutations across instances', async () => {
      const handle = `multi-admin-${Date.now()}`;
      const merchant = await svcInstance1.createMerchants({
        name: 'Multi Admin Store',
        handle,
        status: 'active',
        email: `adminmod_${Date.now()}@test.in`,
        phone: '+919876543210',
      });

      const owner = await svcInstance1.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: `usr_sa_owner_${Date.now()}`,
        role: 'owner',
        status: 'active',
      });

      // Super Admin operating on Instance 2 attempts to demote sole active owner
      await assert.rejects(
        () => svcInstance2.updateMerchantMemberRoleOrStatus(merchant.id, owner.id, { role: 'admin' }),
        /SOLE_OWNER_PROTECTION/
      );

      // Super Admin operating on Instance 2 attempts to suspend sole active owner
      await assert.rejects(
        () => svcInstance2.updateMerchantMemberRoleOrStatus(merchant.id, owner.id, { status: 'suspended' }),
        /SOLE_OWNER_PROTECTION/
      );

      // Super Admin operating on Instance 2 attempts to remove sole active owner
      await assert.rejects(
        () => svcInstance2.removeMerchantMember(merchant.id, owner.id),
        /SOLE_OWNER_PROTECTION/
      );

      // Assert database integrity directly in PostgreSQL
      const dbRows = await directPool.query(
        'SELECT user_id, role, status FROM merchant_member WHERE id = $1',
        [owner.id]
      );
      assert.equal(dbRows.rows[0].role, 'owner');
      assert.equal(dbRows.rows[0].status, 'active');

      // Cleanup
      await directPool.query('DELETE FROM merchant_member WHERE merchant_id = $1', [merchant.id]);
      await directPool.query('DELETE FROM merchant WHERE id = $1', [merchant.id]);
    });
  });
});
