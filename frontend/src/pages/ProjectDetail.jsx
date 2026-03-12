import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectsAPI, predictionsAPI } from '../services/api'
import RiskBadge from '../components/RiskBadge'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { Brain, Trash2, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    projectsAPI.get(id)
      .then(r => setProject(r.data))
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false))
  }, [id])

  const runPrediction = async () => {
    setPredicting(true)
    setError('')
    try {
      const res = await predictionsAPI.predict(id)
      setPrediction(res.data)
      setProject(prev => ({ ...prev, predicted_risk: res.data.risk_level, risk_score: res.data.risk_score }))
    } catch (e) {
      setError('Prediction failed. Make sure the ML model is loaded.')
    } finally {
      setPredicting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this project?')) return
    await projectsAPI.delete(id)
    navigate('/projects')
  }

  if (loading) return <div className="text-slate-400 text-center py-20">Loading...</div>
  if (!project) return null

  const detailRows = [
    ['Team Size', `${project.team_size} developers`],
    ['Budget', `$${project.project_budget?.toLocaleString()}`],
    ['Duration', `${project.project_duration} months`],
    ['Bug Count', project.bug_count],
    ['Req. Changes', project.requirement_change_count],
    ['Avg Sprint Delay', `${project.average_sprint_delay} days`],
    ['Testing Coverage', `${project.testing_coverage}%`],
    ['Code Complexity', `${project.code_complexity}/10`],
    ['Dev Experience', `${project.developer_experience} yrs`],
    ['Communication', `${project.communication_frequency} mtgs/wk`],
    ['Task Completion', `${project.task_completion_rate}%`],
    ['Client Changes', project.client_change_requests],
    ['Past Success Rate', `${project.previous_project_success_rate}%`],
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.project_name}</h1>
          <p className="text-slate-400 text-sm mt-1">Created {new Date(project.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={runPrediction} disabled={predicting} className="btn-primary flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4" />
            {predicting ? 'Analysing...' : 'Run AI Analysis'}
          </button>
          <button onClick={handleDelete} className="btn-secondary flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>}

      {/* Risk Banner (if predicted) */}
      {project.predicted_risk && (
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${
          project.predicted_risk === 'High'   ? 'bg-red-900/20 border-red-800' :
          project.predicted_risk === 'Medium' ? 'bg-yellow-900/20 border-yellow-800' :
                                                'bg-green-900/20 border-green-800'}`}>
          {project.predicted_risk === 'High'
            ? <AlertTriangle className="w-8 h-8 text-red-400" />
            : <CheckCircle2 className="w-8 h-8 text-green-400" />}
          <div>
            <p className="font-semibold text-white">AI Risk Assessment Complete</p>
            <RiskBadge level={project.predicted_risk} score={project.risk_score} />
          </div>
        </div>
      )}

      {/* Project Details grid */}
      <div className="card">
        <h2 className="text-base font-semibold text-white mb-4">Project Parameters</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {detailRows.map(([label, value]) => (
            <div key={label} className="bg-slate-900 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <>
          {/* Feature importance */}
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-4">Top Risk Factors</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={prediction.top_factors.map(f => ({ name: f.label, value: +(f.importance * 100).toFixed(1) }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <YAxis dataKey="name" type="category" width={170} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v) => `${v}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {prediction.top_factors.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recommendations */}
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Process Optimisation Recommendations
            </h2>
            <div className="space-y-3">
              {prediction.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div>
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-0.5">{rec.category}</p>
                    <p className="text-sm text-slate-300">{rec.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Probabilities */}
          <div className="card">
            <h2 className="text-base font-semibold text-white mb-4">Risk Probability Breakdown</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {Object.entries(prediction.probabilities).map(([level, prob]) => (
                <div key={level} className="bg-slate-900 rounded-xl p-4">
                  <p className={`text-2xl font-bold ${level === 'High' ? 'text-red-400' : level === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {(prob * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-400 mt-1">{level} Risk</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
