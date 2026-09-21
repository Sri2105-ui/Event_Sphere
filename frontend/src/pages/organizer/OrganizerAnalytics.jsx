import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart2, TrendingUp, Users, DollarSign, CheckCircle2, ChevronLeft } from 'lucide-react';

export const OrganizerAnalytics = ({ setTab }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/organizer');
        if (res.data.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading analytics charts...
      </div>
    );
  }

  const { metrics, charts } = analytics || { metrics: {}, charts: {} };
  const monthlyTrend = charts?.monthlyTrend || [];
  const eventPerformance = charts?.eventPerformance || [];
  const attendanceBreakdown = charts?.attendanceBreakdown || [];

  const COLORS = ['#10B981', '#F59E0B', '#6366F1', '#EC4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => setTab('organizer-dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Hub
        </button>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-400 mb-1">
          <BarChart2 className="w-4 h-4" />
          <span>Performance Intelligence</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white">Organizer Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time insights on registration velocities, attendee check-in conversion, and event revenues.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Total Attendees</span>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{metrics.totalRegistrations}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Gate Verified</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{metrics.checkedInCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Check-In Velocity</span>
          <p className="text-2xl font-bold text-brand-400 mt-1 font-mono">{metrics.overallAttendanceRate}%</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Total Ticket Revenue</span>
          <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">${metrics.totalRevenue}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Trajectory Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            Registration Trajectory (Last 6 Months)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorReg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Turnout Donut Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Attendance Ratio
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Checked In
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Absent / Pending
            </span>
          </div>
        </div>
      </div>

      {/* Event Breakdown Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3 p-6">
        <h3 className="font-display font-bold text-base text-white">Event Performance Breakdown</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th className="py-3">Event Title</th>
              <th className="py-3">Capacity</th>
              <th className="py-3">Registered</th>
              <th className="py-3">Checked In</th>
              <th className="py-3">Turnout %</th>
              <th className="py-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {eventPerformance.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 font-bold text-white">{item.title}</td>
                <td className="py-3 font-mono text-slate-400">{item.capacity}</td>
                <td className="py-3 font-mono text-slate-200">{item.registered}</td>
                <td className="py-3 font-mono text-emerald-400">{item.checkedIn}</td>
                <td className="py-3 font-mono font-bold text-brand-400">{item.attendanceRate}%</td>
                <td className="py-3 font-mono font-bold text-amber-400 text-right">
                  ${item.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
