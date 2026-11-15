import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  ShieldCheck,
  Users,
  CreditCard,
  LifeBuoy,
  CheckCircle2,
  BookOpen,
  ShieldAlert,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  Sliders
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, plans, kb, logs
  const [loading, setLoading] = useState(true);

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [articlesList, setArticlesList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Filter & Search states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  // Modals
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [newRole, setNewRole] = useState('customer');
  const [savingRole, setSavingRole] = useState(false);

  // KB Modal
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [kbCategory, setKbCategory] = useState('Billing');
  const [savingKb, setSavingKb] = useState(false);

  const fetchOverview = async () => {
    try {
      const data = await api.getAdminDashboard();
      setDashboardData(data);
    } catch (err) {
      toast.error('Failed to load admin metrics');
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await api.listAdminUsers(userRoleFilter, userSearch);
      setUsersList(users);
    } catch (err) {
      toast.error('Failed to fetch user accounts');
    }
  };

  const fetchPlans = async () => {
    try {
      const plans = await api.getPlans();
      setPlansList(plans);
    } catch (err) {
      toast.error('Failed to fetch subscription plans');
    }
  };

  const fetchArticles = async () => {
    try {
      const arts = await api.listArticles({ status: 'all' });
      setArticlesList(arts);
    } catch (err) {
      toast.error('Failed to fetch knowledge base articles');
    }
  };

  const fetchLogs = async () => {
    try {
      const logs = await api.getAuditLogs(60);
      setAuditLogs(logs);
    } catch (err) {
      toast.error('Failed to load audit logs');
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchOverview(),
      fetchUsers(),
      fetchPlans(),
      fetchArticles(),
      fetchLogs(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [userRoleFilter]);

  const handleUpdateRole = async () => {
    if (!editRoleUser) return;
    setSavingRole(true);
    try {
      const updated = await api.updateUserRole(editRoleUser.id, newRole);
      toast.success(`Updated ${updated.name}'s role to ${updated.role}`);
      setEditRoleUser(null);
      await fetchUsers();
      await fetchOverview();
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    } finally {
      setSavingRole(false);
    }
  };

  const handleSaveKbArticle = async (e) => {
    e.preventDefault();
    if (!kbTitle.trim() || !kbContent.trim()) {
      toast.warning('Please enter both title and content.');
      return;
    }
    setSavingKb(true);
    try {
      if (editingArticle) {
        await api.updateArticle(editingArticle.id, {
          title: kbTitle.trim(),
          content: kbContent.trim(),
          category: kbCategory,
        });
        toast.success('Knowledge base article updated');
      } else {
        await api.createArticle({
          title: kbTitle.trim(),
          content: kbContent.trim(),
          category: kbCategory,
          status: 'published',
        });
        toast.success('New article published to AI knowledge base');
      }
      setKbModalOpen(false);
      setEditingArticle(null);
      setKbTitle('');
      setKbContent('');
      await fetchArticles();
    } catch (err) {
      toast.error(err.message || 'Failed to save article');
    } finally {
      setSavingKb(false);
    }
  };

  const handleDeleteKbArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.deleteArticle(articleId);
      toast.success('Article deleted');
      await fetchArticles();
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading administration console..." />;
  }

  const metrics = dashboardData?.metrics || {};
  const catDist = dashboardData?.category_distribution || {};
  const prioDist = dashboardData?.priority_distribution || {};

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Administrator Console</h1>
            <Badge size="md" variant="urgent">Admin Role</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure system plans, user roles, approved AI knowledge base, and inspect audit logs.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'users' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'plans' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Plans
          </button>
          <button
            onClick={() => setActiveTab('kb')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'kb' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Knowledge Base ({articlesList.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'logs' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Customers
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#0F172A]">
                {metrics.total_customers ?? 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Registered tenant accounts</div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Active Subscriptions
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-600">
                {metrics.active_subscriptions ?? 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Paid recurring plans</div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Open Support Tickets
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <LifeBuoy className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#0F172A]">
                {metrics.open_tickets ?? 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Pending agent resolution</div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Resolved Tickets
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#0F172A]">
                {metrics.resolved_tickets ?? 0}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">SLA fulfilled</div>
            </Card>
          </div>

          {/* Distribution Breakdown Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Tickets by Category" subtitle="Distribution of support issues reported.">
              <div className="space-y-3 pt-2">
                {Object.keys(catDist).length === 0 ? (
                  <div className="text-xs text-slate-400 py-4 text-center">No category distribution data</div>
                ) : (
                  Object.entries(catDist).map(([cat, count]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{cat}</span>
                        <span>{count} ticket(s)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(15, count * 25))}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="Tickets by Priority" subtitle="Urgency distribution in the active queue.">
              <div className="space-y-3 pt-2">
                {Object.keys(prioDist).length === 0 ? (
                  <div className="text-xs text-slate-400 py-4 text-center">No priority distribution data</div>
                ) : (
                  Object.entries(prioDist).map(([prio, count]) => {
                    const color =
                      prio === 'Urgent' ? 'bg-red-500' : prio === 'High' ? 'bg-amber-500' : 'bg-blue-500';
                    return (
                      <div key={prio} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{prio} Priority</span>
                          <span>{count} ticket(s)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(15, count * 30))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS & ROLES */}
      {activeTab === 'users' && (
        <Card padding={false}>
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchUsers();
              }}
              className="relative max-w-sm w-full"
            >
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Filter Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Roles</option>
                <option value="customer">Customer</option>
                <option value="agent">Support Agent</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Current Role</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Role Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <Badge size="sm" variant={u.role}>{u.role?.toUpperCase()}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditRoleUser(u);
                          setNewRole(u.role);
                        }}
                      >
                        Change Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: SUBSCRIPTION PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansList.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{p.name} Tier</h3>
                  <Badge variant={p.is_active ? 'active' : 'closed'}>
                    {p.is_active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <div className="mt-3 text-2xl font-extrabold text-[#0F172A]">
                  ${p.price} <span className="text-xs text-slate-500 font-normal">/ {p.billing_interval}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{p.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  {p.features?.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE BASE ARTICLES */}
      {activeTab === 'kb' && (
        <Card
          title="Approved Support Documentation"
          subtitle="Articles retrieved by the AI assistant when formulating customer answers."
          headerAction={
            <Button
              size="sm"
              variant="primary"
              icon={PlusCircle}
              onClick={() => {
                setEditingArticle(null);
                setKbTitle('');
                setKbContent('');
                setKbCategory('Billing');
                setKbModalOpen(true);
              }}
            >
              Add Article
            </Button>
          }
          padding={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Last Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articlesList.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-sm">
                      {a.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge size="sm" variant={a.status}>{a.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(a.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingArticle(a);
                          setKbTitle(a.title);
                          setKbContent(a.content);
                          setKbCategory(a.category);
                          setKbModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <button
                        onClick={() => handleDeleteKbArticle(a.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <Card title="Security Audit Logs" subtitle="Immutable log of actions recorded across the application." padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Actor</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Resource</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3 text-slate-400">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {l.actor_email}
                    </td>
                    <td className="px-6 py-3 text-blue-700 font-bold">
                      {l.action}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {l.resource_type} {l.resource_id ? `#${l.resource_id}` : ''}
                    </td>
                    <td className="px-6 py-3 text-slate-500 truncate max-w-xs font-sans">
                      {JSON.stringify(l.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Change User Role Modal */}
      <Modal
        isOpen={!!editRoleUser}
        onClose={() => setEditRoleUser(null)}
        title={`Change Role: ${editRoleUser?.name}`}
        subtitle="Manage access permissions for this account."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Current role is <strong className="text-slate-800 capitalize">{editRoleUser?.role}</strong>. Select the new authorization role:
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="customer">Customer (Access to personal tickets and subscriptions)</option>
              <option value="agent">Support Agent (Access to agent queue and ticket copilot)</option>
              <option value="admin">Administrator (Full control over users, plans, and articles)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setEditRoleUser(null)} disabled={savingRole}>
              Cancel
            </Button>
            <Button variant="primary" loading={savingRole} onClick={handleUpdateRole}>
              Save Role Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Knowledge Base Article Modal */}
      <Modal
        isOpen={kbModalOpen}
        onClose={() => setKbModalOpen(false)}
        title={editingArticle ? 'Edit Knowledge Base Article' : 'Publish Knowledge Base Article'}
        subtitle="The AI Assistant references approved articles to answer customer questions."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveKbArticle} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Article Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={kbTitle}
              onChange={(e) => setKbTitle(e.target.value)}
              placeholder="e.g. How to change or upgrade a subscription plan"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={kbCategory}
              onChange={(e) => setKbCategory(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Billing">Billing</option>
              <option value="Subscriptions">Subscriptions</option>
              <option value="Account Access">Account Access</option>
              <option value="Technical">Technical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Article Content <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={8}
              value={kbContent}
              onChange={(e) => setKbContent(e.target.value)}
              placeholder="Provide the exact troubleshooting steps, policies, and instructions..."
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setKbModalOpen(false)} disabled={savingKb}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingKb}>
              {editingArticle ? 'Save Changes' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
