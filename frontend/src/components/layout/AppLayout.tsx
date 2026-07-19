import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useWorldStore } from '../../stores/worldStore'
import { useWorlds } from '../../api/hooks'

const navItems = [
  { path: '/worlds', label: '世界工坊', icon: '🌍' },
  { path: '/entities', label: '实体画廊', icon: '👤' },
  { path: '/relations', label: '关系图谱', icon: '🔗' },
  { path: '/timeline', label: '时间轴', icon: '⏳' },
  { path: '/memories', label: '记忆库', icon: '🧠' },
  { path: '/rules', label: '规则库', icon: '📜' },
  { path: '/writing', label: '写作工坊', icon: '✍️' },
]

export default function AppLayout() {
  const { currentWorldId, setCurrentWorld } = useWorldStore()
  const { data: worldsRes } = useWorlds()
  const navigate = useNavigate()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worlds = (worldsRes as any)?.data?.items ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentWorld = worlds.find((w: any) => w.world_id === currentWorldId)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-gray-700">
          <h1 className="text-lg font-bold tracking-wide">洛书</h1>
          <p className="text-xs text-gray-400 mt-0.5">AI 叙事系统</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
          v0.1.0-dev
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">
              洛书 · AI叙事系统
            </span>
            {currentWorld && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                当前世界：{currentWorld.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={currentWorldId ?? ''}
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentWorld(e.target.value)
                }
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">选择世界</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {worlds.map((w: any) => (
                <option key={w.world_id} value={w.world_id}>{w.name}</option>
              ))}
            </select>
            <button
              onClick={() => navigate('/worlds')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              管理
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
