import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, Search, Shield, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react';

export const AdminUsers = ({ setTab }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${roleFilter}&search=${search}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleUpdateStatus = async (userId, updates) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, updates);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast('Status update failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => setTab('admin-dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-400 mb-1">
          <Users className="w-4 h-4" />
          <span>User Directory & Permissions</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white">Platform Users</h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or department..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'admin', 'organizer', 'participant'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                roleFilter === role
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">College / Club</th>
              <th className="px-5 py-4">Account Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  Loading user directory...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  No users match the search filter.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-white text-xs block">{u.name}</span>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : u.role === 'organizer'
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-slate-300">
                    {u.organization || 'University Campus'}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isActive
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right space-x-2">
                    {u.role === 'organizer' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(u._id, {
                            isApprovedOrganizer: !u.isApprovedOrganizer
                          })
                        }
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                      >
                        {u.isApprovedOrganizer ? 'Verified Org' : 'Approve Org'}
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(u._id, { isActive: !u.isActive })}
                      className={`px-2.5 py-1 rounded font-medium ${
                        u.isActive
                          ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300'
                          : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
