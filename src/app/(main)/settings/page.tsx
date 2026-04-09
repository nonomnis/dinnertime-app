'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Card,
  Button,
  LoadingSpinner,
  Avatar,
  Badge,
} from '@/components';
import { LogOut, Trash2, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  isActive: boolean;
}

interface FamilyData {
  id: string;
  name: string;
  createdAt: string;
  members: FamilyMember[];
  lockInDays: number;
  defaultEatOutDay?: string;
  dietaryRestrictions?: string[];
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isParent, setIsParent] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [lockInDays, setLockInDays] = useState(2);
  const [eatingOutDay, setEatingOutDay] = useState('');
  const [restrictions, setRestrictions] = useState('');

  const familyId = (session?.user as any)?.familyId;
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    setIsParent(userRole === 'ADMIN' || userRole === 'MEMBER');
  }, [userRole]);

  useEffect(() => {
    if (familyId) {
      fetchFamilyData();
    }
  }, [familyId]);

  const fetchFamilyData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/families/${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setFamily(data);
        setEditingName(data.name);
        setLockInDays(data.lockInDays || 2);
        setEatingOutDay(data.defaultEatOutDay || '');
        setRestrictions(data.dietaryRestrictions?.join(', ') || '');
        setInviteCode(data.inviteCode || familyId);
      }
    } catch (error) {
      console.error('Error fetching family:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFamilyName = async () => {
    try {
      const response = await fetch(`/api/families/${familyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });

      if (response.ok) {
        await fetchFamilyData();
        setIsEditingName(false);
      }
    } catch (error) {
      console.error('Error updating family name:', error);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const response = await fetch(`/api/families/${familyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lockInDays,
          defaultEatOutDay: eatingOutDay,
          dietaryRestrictions: restrictions
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean),
        }),
      });

      if (response.ok) {
        await fetchFamilyData();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleInviteMember = async () => {
    try {
      const response = await fetch(`/api/families/${familyId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '' }),
      });

      if (response.ok) {
        const data = await response.json();
        setInviteCode(data.inviteCode);
      }
    } catch (error) {
      console.error('Error generating invite:', error);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const handleLeaveFamily = async () => {
    if (
      confirm(
        'Are you sure you want to leave this family? This action cannot be undone.'
      )
    ) {
      try {
        const userId = session?.user?.id;
        const response = await fetch(
          `/api/families/${familyId}/members/${userId}`,
          {
            method: 'DELETE',
          }
        );

        if (response.ok) {
          await signOut({ redirect: false });
          router.push('/login');
        }
      } catch (error) {
        console.error('Error leaving family:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>

      {/* Account Section */}
      <Card variant="elevated">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">Account</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar
              src={session?.user?.image}
              alt={session?.user?.name || 'User'}
              initials={session?.user?.name?.charAt(0) || 'U'}
              size="lg"
            />
            <div className="flex-1">
              <p className="font-semibold text-neutral-900">
                {session?.user?.name}
              </p>
              <p className="text-sm text-neutral-600">{session?.user?.email}</p>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={handleLogout}
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </Card>

      {/* Family Info Section */}
      {family && (
        <Card variant="elevated">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">
            Family Info
          </h2>
          <div className="space-y-4">
            {isParent && (
              <>
                <div>
                  <label className="text-sm font-semibold text-neutral-900 block mb-2">
                    Family Name
                  </label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleUpdateFamilyName}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-neutral-900">{family.name}</p>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-primary-600 text-sm font-semibold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-900 block mb-2">
                    Lock-in Days Before Meal
                  </label>
                  <input
                    type="number"
                    value={lockInDays}
                    onChange={(e) => setLockInDays(Number(e.target.value))}
                    min="0"
                    max="7"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-neutral-600 mt-1">
                    Schedule is locked this many days before the meal
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-900 block mb-2">
                    Default Eat-Out Day
                  </label>
                  <select
                    value={eatingOutDay}
                    onChange={(e) => setEatingOutDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a day</option>
                    {[
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                      'Sunday',
                    ].map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-900 block mb-2">
                    Family Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    placeholder="e.g. Gluten-free, Vegetarian, Nut allergy"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-neutral-600 mt-1">
                    Comma-separated list
                  </p>
                </div>

                <Button
                  variant="primary"
                  onClick={handleUpdateSettings}
                  fullWidth
                >
                  Save Settings
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Family Members Section */}
      {family && (
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">Members</h2>
            {isParent && (
              <Badge variant="primary" size="sm">
                {family.members.length}
              </Badge>
            )}
          </div>
          <div className="space-y-3">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between pb-3 border-b border-neutral-100 last:border-b-0 last:pb-0"
              >
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{member.name}</p>
                  <p className="text-xs text-neutral-600">{member.email}</p>
                </div>
                <Badge
                  variant={
                    member.role === 'ADMIN' ? 'primary' : 'outline'
                  }
                  size="sm"
                >
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>

          {isParent && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Invite Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 text-sm font-mono"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopyInvite}
                  className="flex items-center gap-2 min-w-[100px]"
                >
                  {copiedInvite ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Danger Zone */}
      <Card variant="elevated" className="border-red-200 bg-red-50">
        <h2 className="text-lg font-bold text-red-900 mb-4">Danger Zone</h2>
        <div className="space-y-2">
          <Button
            variant="danger"
            onClick={handleLeaveFamily}
            fullWidth
            className="justify-start"
          >
            <LogOut size={18} />
            Leave Family
          </Button>
          {isParent && (
            <Button
              variant="danger"
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to delete this family? This action cannot be undone.'
                  )
                ) {
                  // Delete family
                }
              }}
              fullWidth
              className="justify-start"
            >
              <Trash2 size={18} />
              Delete Family
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
