import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FlaskConical, LayoutDashboard, LogOut, Users, BookOpen } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'teacher'
    ? [
        { to: '/teacher', icon: <LayoutDashboard size={18}/>, label: 'Dashboard', exact: true },
        { to: '/teacher/students', icon: <Users size={18}/>, label: 'Students', exact: false },
        { to: '/teacher/results', icon: <BookOpen size={18}/>, label: 'Results', exact: false },
      ]
    : [
        { to: '/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard', exact: false },
      ];

  const isActive = (item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <FlaskConical className="text-cyan-400 w-7 h-7" />
            <span className="text-white font-bold text-lg">Virtual Lab</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item)
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.username}</p>
              <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm">
            <LogOut size={16}/>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
