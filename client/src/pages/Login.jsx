import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { FlaskConical, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'teacher' ? '/teacher' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="flex items-center justify-center mb-8">
          <FlaskConical className="text-cyan-400 w-10 h-10 mr-3" />
          <h1 className="text-3xl font-bold text-white">Virtual Science Lab</h1>
        </div>
        <h2 className="text-xl font-semibold text-white/80 text-center mb-6">Sign In</h2>
        
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Email or Username</label>
            <input
              type="text"
              value={form.emailOrUsername}
              onChange={e => setForm({...form, emailOrUsername: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
              placeholder="Enter email or username"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 pr-10"
                placeholder="Enter password"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-white/50">
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Role</label>
            <div className="flex gap-3">
              {['student', 'teacher'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({...form, role: r})}
                  className={`flex-1 py-2.5 rounded-lg font-medium capitalize transition-all ${
                    form.role === r 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-white/60 mt-4 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
