'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface MerchantTeamMember {
  id: string;
  merchantId: string;
  userId: string;
  email: string;
  name?: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
  status: 'invited' | 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

interface CallerSession {
  userId: string;
  merchantId: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
  permissions: string[];
}

export default function MerchantTeamPage() {
  const [callerSession, setCallerSession] = useState<CallerSession | null>(null);
  const [members, setMembers] = useState<MerchantTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Invite Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'admin' | 'manager' | 'staff'>('staff');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Edit Modal state
  const [editingMember, setEditingMember] = useState<MerchantTeamMember | null>(null);
  const [editRole, setEditRole] = useState<'owner' | 'admin' | 'manager' | 'staff'>('staff');
  const [editStatus, setEditStatus] = useState<'invited' | 'active' | 'suspended'>('active');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Remove Modal state
  const [removingMember, setRemovingMember] = useState<MerchantTeamMember | null>(null);
  const [isSubmittingRemove, setIsSubmittingRemove] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Fetch current session and team members
  const fetchSessionAndTeam = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Resolve session
      const sessRes = await fetch('/api/merchant/auth/session', { credentials: 'include' });
      let sessionData: CallerSession | null = null;
      if (sessRes.ok) {
        const body = await sessRes.json();
        if (body.success && body.session) {
          sessionData = {
            userId: body.session.userId,
            merchantId: body.session.merchantId,
            email: body.session.email,
            role: body.session.role,
            permissions: body.session.permissions || [],
          };
          setCallerSession(sessionData);
        }
      }

      // 2. Fetch team members
      const teamRes = await fetch('/api/merchant/team', { credentials: 'include' });
      if (teamRes.ok) {
        const teamBody = await teamRes.json();
        if (teamBody.success && Array.isArray(teamBody.members)) {
          setMembers(teamBody.members);
        }
      } else {
        const errBody = await teamRes.json().catch(() => null);
        if (teamRes.status === 401) {
          setErrorMessage('Your session has expired. Please log in to manage team members.');
        } else if (teamRes.status === 403) {
          setErrorMessage('You do not have permission to view or manage team members (team:manage required).');
        } else {
          setErrorMessage(errBody?.message || 'Failed to load team members.');
        }
      }
    } catch {
      setErrorMessage('Network connection error. Unable to load team members.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndTeam();
  }, []);

  const activeOwnersCount = members.filter(
    (m) => m.role === 'owner' && m.status === 'active'
  ).length;

  const canManageTeam =
    callerSession?.permissions.includes('team:manage') ||
    callerSession?.role === 'owner' ||
    callerSession?.role === 'admin';

  const isOwner = callerSession?.role === 'owner';

  // Handle member invitation
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setInviteError('Please provide a valid email address.');
      return;
    }

    if (!isOwner && inviteRole === 'owner') {
      setInviteError('Permission ceiling: Only Store Owners can invite another Owner.');
      return;
    }

    setIsSubmittingInvite(true);
    try {
      const res = await fetch('/api/merchant/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        if (data?.error === 'DUPLICATE_MEMBERSHIP') {
          setInviteError('This user is already a team member of this merchant.');
        } else if (data?.error === 'CANNOT_GRANT_ROLE_ABOVE_CEILING') {
          setInviteError('Permission ceiling: Admin accounts cannot assign Owner privileges.');
        } else {
          setInviteError(data?.message || 'Failed to send invitation.');
        }
        return;
      }

      setSuccessMessage(`Invitation sent successfully to ${inviteEmail}.`);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('staff');
      await fetchSessionAndTeam();
    } catch {
      setInviteError('Network error while sending invitation.');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Handle edit role / status
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setEditError(null);

    // Sole owner protection client pre-check
    if (
      editingMember.role === 'owner' &&
      editingMember.status === 'active' &&
      activeOwnersCount <= 1
    ) {
      if (editRole !== 'owner') {
        setEditError('Sole Owner Protection: Cannot demote the sole active owner. Transfer ownership first.');
        return;
      }
      if (editStatus !== 'active') {
        setEditError('Sole Owner Protection: Cannot suspend or deactivate the sole active owner.');
        return;
      }
    }

    // Anti-escalation client pre-check
    if (!isOwner && editRole === 'owner') {
      setEditError('Permission ceiling: Admin accounts cannot promote members to Owner.');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/merchant/team/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role: editRole,
          status: editStatus,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        if (data?.error === 'SOLE_OWNER_PROTECTION') {
          setEditError('Sole Owner Protection: Cannot modify or deactivate the last active owner.');
        } else if (data?.error === 'CANNOT_GRANT_ROLE_ABOVE_CEILING') {
          setEditError('Permission ceiling: Admin accounts cannot promote members to Owner.');
        } else {
          setEditError(data?.message || 'Failed to update member.');
        }
        return;
      }

      setSuccessMessage(`Team member ${editingMember.email} updated successfully.`);
      setEditingMember(null);
      await fetchSessionAndTeam();
    } catch {
      setEditError('Network error while updating member.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle remove member
  const handleRemoveSubmit = async () => {
    if (!removingMember) return;
    setRemoveError(null);

    if (
      removingMember.role === 'owner' &&
      removingMember.status === 'active' &&
      activeOwnersCount <= 1
    ) {
      setRemoveError('Sole Owner Protection: Cannot remove the sole active owner.');
      return;
    }

    setIsSubmittingRemove(true);
    try {
      const res = await fetch(`/api/merchant/team/${removingMember.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setRemoveError(data?.message || 'Failed to remove member.');
        return;
      }

      setSuccessMessage(`Team member ${removingMember.email} removed. Active sessions terminated.`);
      setRemovingMember(null);
      await fetchSessionAndTeam();
    } catch {
      setRemoveError('Network error while removing member.');
    } finally {
      setIsSubmittingRemove(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            Store Owner
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Store Admin
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Operations Manager
          </span>
        );
      case 'staff':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
            Store Staff
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            Active
          </span>
        );
      case 'invited':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Invited
          </span>
        );
      case 'suspended':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            Suspended
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/merchant/login" className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Ateevra <span className="text-orange-600">Merchant</span>
              </span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Team & Roles
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {callerSession && (
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500">Logged in as</p>
                <p className="text-sm font-medium text-slate-800">{callerSession.email}</p>
              </div>
            )}
            <Link
              href="/merchant/login"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Banner Messages */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-emerald-800 text-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-red-800 text-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-900 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Store Team & Permissions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage authorized members, roles, and access boundaries for your merchant account.
            </p>
          </div>

          <div>
            <button
              disabled={!canManageTeam}
              onClick={() => {
                setInviteError(null);
                setShowInviteModal(true);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition ${
                canManageTeam
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Invite Member
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Members</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{members.length}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Owners</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-purple-700">{activeOwnersCount}</span>
              {activeOwnersCount === 1 && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                  Sole Owner Protected
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admins & Managers</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {members.filter((m) => m.role === 'admin' || m.role === 'manager').length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Invites</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {members.filter((m) => m.status === 'invited').length}
            </p>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Current Members</h2>
            <button
              onClick={fetchSessionAndTeam}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
              Loading merchant team members...
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-2 text-sm text-slate-600 font-medium">No team members found.</p>
              <p className="text-xs text-slate-400 mt-1">Get started by inviting your staff or partners.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 font-semibold">User</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Role</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold">Joined / Invited</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((member) => {
                    const isTargetSoleOwner =
                      member.role === 'owner' &&
                      member.status === 'active' &&
                      activeOwnersCount <= 1;

                    const isTargetHigherRole =
                      callerSession?.role === 'admin' && member.role === 'owner';

                    const canEditThisMember =
                      canManageTeam && !isTargetHigherRole;

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/75 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{member.email || 'Pending Activation'}</div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {member.id}</div>
                        </td>
                        <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                        <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            disabled={!canEditThisMember}
                            onClick={() => {
                              setEditingMember(member);
                              setEditRole(member.role);
                              setEditStatus(member.status);
                              setEditError(null);
                            }}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                              canEditThisMember
                                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                : 'border-slate-200 text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            Edit
                          </button>

                          <button
                            disabled={!canEditThisMember || isTargetSoleOwner}
                            onClick={() => {
                              setRemovingMember(member);
                              setRemoveError(null);
                            }}
                            title={
                              isTargetSoleOwner
                                ? 'Cannot remove sole active owner'
                                : isTargetHigherRole
                                ? 'Admin cannot remove Owner'
                                : 'Remove member'
                            }
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                              canEditThisMember && !isTargetSoleOwner
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-slate-200 text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-5 space-y-4">
              {inviteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {inviteError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="colleague@yourstore.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assigned Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="staff">Store Staff (Catalog view, order fulfillment)</option>
                  <option value="manager">Operations Manager (Catalog edit, inventory, returns)</option>
                  <option value="admin">Store Admin (Full catalog, inventory, team manage)</option>
                  {isOwner && <option value="owner">Store Owner (Unrestricted, financial payouts)</option>}
                </select>
                {!isOwner && (
                  <p className="text-xs text-slate-400 mt-1">
                    Note: Store Owners can only be invited by existing Owners.
                  </p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvite}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {isSubmittingInvite ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role / Status Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Member Role & Status</h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {editError}
                </div>
              )}

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">User Email</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{editingMember.email}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="staff">Store Staff</option>
                  <option value="manager">Operations Manager</option>
                  <option value="admin">Store Admin</option>
                  {isOwner && <option value="owner">Store Owner</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Membership Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended (Access Terminated)</option>
                </select>
                {editStatus === 'suspended' && (
                  <p className="text-xs text-red-500 mt-1">
                    Suspending this member will immediately revoke all active sessions.
                  </p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {removingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Remove Team Member?</h3>
              <p className="text-sm text-slate-600 mt-2">
                Are you sure you want to remove <span className="font-semibold text-slate-800">{removingMember.email}</span> from this merchant? Their active sessions will be terminated immediately.
              </p>
            </div>

            {removeError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {removeError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setRemovingMember(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRemove}
                onClick={handleRemoveSubmit}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {isSubmittingRemove ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
