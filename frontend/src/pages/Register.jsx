import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brain } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manager' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
  
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role.toLowerCase().replace('project manager', 'manager')
      })
      navigate('/login')
    } catch (err) {
      console.log('REGISTER ERROR:', err.response?.data)
      setError(
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : JSON.stringify(err.response?.data || { message: 'Registration failed.' })
      )
    } finally {
      setLoading(false)
    }
  }

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join SmartRisk AI System</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input-field" placeholder="Your name" required {...f('name')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" required {...f('email')} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-field" placeholder="Min 8 characters" required {...f('password')} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input-field" {...f('role')}>
                <option value="manager">Project Manager</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
