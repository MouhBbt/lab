import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { FlaskConical } from 'lucide-react';

const WILAYAS = ['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','MSila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet','El MGhair','El Meniaa'];

const LEVELS = [
  { value: 'primary', label: 'Primary School' },
  { value: 'middle', label: 'Middle School' },
  { value: 'high', label: 'High School' }
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('student');
  const [account, setAccount] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [profile, setProfile] = useState({ name: '', school: '', wilaya: '', commune: '', level: 'high' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAccountNext = (e) => {
    e.preventDefault();
    if (account.password !== account.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    if (role === 'student') setStep(2);
    else handleSubmit();
  };

  const handleSubmit = async (profileData = null) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        username: account.username,
        email: account.email,
        password: account.password,
        role,
        studentProfile: role === 'student' ? (profileData || profile) : undefined
      };
      const res = await api.post('/auth/register', payload);
      login(res.data.user, res.data.token);
      navigate(role === 'teacher' ? '/teacher' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    handleSubmit(profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <FlaskConical className="text-cyan-400 w-8 h-8 mr-2" />
          <h1 className="text-2xl font-bold text-white">Virtual Science Lab</h1>
        </div>
        <h2 className="text-xl font-semibold text-white/80 text-center mb-2">
          {step === 1 ? 'Create Account' : 'Student Profile'}
        </h2>
        {step === 2 && <p className="text-center text-white/50 text-sm mb-4">Step 2: Complete your profile</p>}

        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleAccountNext} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Role</label>
              <div className="flex gap-3">
                {['student', 'teacher'].map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`flex-1 py-2 rounded-lg font-medium capitalize transition-all ${role === r ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {['username', 'email', 'password', 'confirmPassword'].map(field => (
              <div key={field}>
                <label className="block text-sm text-white/70 mb-1 capitalize">{field.replace('Password', ' Password')}</label>
                <input
                  type={field.includes('assword') ? 'password' : field === 'email' ? 'email' : 'text'}
                  value={account[field]}
                  onChange={e => setAccount({...account, [field]: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            ))}
            <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
              {role === 'student' ? 'Next →' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Full Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400" required />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">School Name</label>
              <input type="text" value={profile.school} onChange={e => setProfile({...profile, school: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400" required />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Wilaya</label>
              <select value={profile.wilaya} onChange={e => setProfile({...profile, wilaya: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400" required>
                <option value="" className="bg-gray-800">Select Wilaya</option>
                {WILAYAS.map(w => <option key={w} value={w} className="bg-gray-800">{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Commune</label>
              <input type="text" value={profile.commune} onChange={e => setProfile({...profile, commune: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400" required />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Education Level</label>
              <select value={profile.level} onChange={e => setProfile({...profile, level: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 bg-indigo-900">
                {LEVELS.map(l => <option key={l.value} value={l.value} className="bg-gray-800">{l.label}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 bg-white/10 text-white py-3 rounded-lg hover:bg-white/20 transition-colors">← Back</button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        )}
        <p className="text-center text-white/60 mt-4 text-sm">
          Already have an account? <Link to="/login" className="text-cyan-400 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
