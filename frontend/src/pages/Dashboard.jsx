import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { predictionsAPI, projectsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import RiskBadge from '../components/RiskBadge'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { FolderOpen, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

const COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e', unpredicted: '#64748b' }

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([predictionsAPI.summary(), projectsAPI.list()])
      .then(([s, p]) => { setSummary(s.data); setProjects(p.data) })
      .finally(() => setLoading(false))
  }, [])

  const pieData = summary ? [
    { name: 'High Risk',   value: summary.high_risk,   color: COLORS.High },
    { name: 'Medium Risk', value: summary.medium_risk,  color: COLORS.Medium },
    { name: 'Low Risk',    value: summary.low_risk,    color: COLORS.Low },
    { name: 'Unanalysed', value: summary.unpredicted, color: COLORS.unpredicted },
  ].filter(d => d.value > 0) : []

  const recentProjects = projects.slice(0, 5)

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading dashboard...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Here's your project risk overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Projects"     value={summary?.total_projects || 0}  icon={FolderOpen}     color="indigo" />
        <StatCard label="High Risk Projects" value={summary?.high_risk || 0}       icon={AlertTriangle}  color="red" />
        <StatCard label="Medium Risk"        value={summary?.medium_risk || 0}     icon={Clock}          color="yellow" />
        <StatCard label="Low Risk"           value={summary?.low_risk || 0}        icon={CheckCircle}    color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Risk Distribution
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm text-center py-10">No prediction data yet</p>}
        </div>

        {/* Bar */}
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">Risk Score by Project</h2>
          {projects.filter(p => p.risk_score).length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projects.filter(p => p.risk_score).slice(0, 6).map(p => ({
                name: p.project_name.substring(0, 12),
                score: p.risk_score,
                fill: p.predicted_risk === 'High' ? '#ef4444' : p.predicted_risk === 'Medium' ? '#f59e0b' : '#22c55e'
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {projects.filter(p => p.risk_score).slice(0, 6).map((p, i) => (
                    <Cell key={i} fill={p.predicted_risk === 'High' ? '#ef4444' : p.predicted_risk === 'Medium' ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm text-center py-10">Run predictions to see chart</p>}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recent Projects</h2>
          <Link to="/projects" className="text-indigo-400 text-sm hover:underline">View all →</Link>
        </div>
        {recentProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-3">No projects yet</p>
            <Link to="/add-project" className="btn-primary text-sm">Add First Project</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-700">
                  <th className="pb-2 pr-4">Project Name</th>
                  <th className="pb-2 pr-4">Team</th>
                  <th className="pb-2 pr-4">Budget</th>
                  <th className="pb-2 pr-4">Risk Level</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentProjects.map(p => (
                  <tr key={p.id} className="hover:bg-slate-700/30">
                    <td className="py-3 pr-4 text-slate-200 font-medium">{p.project_name}</td>
                    <td className="py-3 pr-4 text-slate-400">{p.team_size} devs</td>
                    <td className="py-3 pr-4 text-slate-400">${p.project_budget?.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      {p.predicted_risk
                        ? <RiskBadge level={p.predicted_risk} score={p.risk_score} />
                        : <span className="text-slate-500 text-xs">Not analysed</span>}
                    </td>
                    <td className="py-3">
                      <Link to={`/projects/${p.id}`} className="text-indigo-400 hover:underline text-xs">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
