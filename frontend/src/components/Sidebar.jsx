import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FolderOpen, PlusCircle,
  BarChart2, History, LogOut, Brain
} from 'lucide-react'

const links = [
  { to: '/dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/projects',   label: 'My Projects',    icon: FolderOpen },
  { to: '/add-project',label: 'Add Project',    icon: PlusCircle },
  { to: '/reports',    label: 'Reports',        icon: BarChart2 },
  { to: '/history',    label: 'History',        icon: History },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">SmartRisk AI</p>
          <p className="text-xs text-slate-500">Risk Prediction System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
               ${isActive
                 ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                 : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200 truncate max-w-[120px]">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm w-full px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  )
}
