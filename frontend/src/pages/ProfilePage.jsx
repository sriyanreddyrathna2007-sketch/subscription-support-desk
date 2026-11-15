import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { User, Mail, Shield, Calendar, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateProfile(name, email);
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Account Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal information and view role authorizations.
        </p>
      </div>

      <Card title="Personal Information" subtitle="Update your contact email and display name.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={loading} icon={Save}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Security & Role Authorization" subtitle="System role and tenant credentials.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-2 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-slate-400 font-semibold uppercase flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Assigned Role</span>
            </div>
            <div className="mt-1">
              <Badge variant={user?.role}>{user?.role?.toUpperCase()}</Badge>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-slate-400 font-semibold uppercase flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Member Since</span>
            </div>
            <div className="mt-1 font-bold text-slate-800">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-slate-400 font-semibold uppercase mb-1">Account State</div>
            <div className="mt-1 font-bold text-emerald-600">Active &bull; Verified</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
