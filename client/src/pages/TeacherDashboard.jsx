import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { Users, BookOpen, Filter, CheckCircle, XCircle, Trophy } from 'lucide-react';

const LEVEL_LABELS = { primary: 'Primary School', middle: 'Middle School', high: 'High School' };

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({ wilaya: '', commune: '', school: '', level: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studRes, resRes] = await Promise.all([
          api.get('/teacher/students'),
          api.get('/teacher/results')
        ]);
        setStudents(studRes.data);
        setResults(resRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const applyFilters = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await api.get(`/teacher/students?${params}`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const uniqueValues = (key) => [...new Set(students.map(s => s[key]).filter(Boolean))];

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Teacher Dashboard</h1>
          <p className="text-gray-400">Monitor student progress and experiment results</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="text-blue-400" size={24}/>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Students</p>
              <p className="text-white font-bold text-2xl">{students.length}</p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-400" size={24}/>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Completed Experiments</p>
              <p className="text-white font-bold text-2xl">{results.filter(r => r.completed).length}</p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="text-yellow-400" size={24}/>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Score</p>
              <p className="text-white font-bold text-2xl">
                {results.length > 0 ? Math.round(results.reduce((a, r) => a + (r.score || 0), 0) / results.length) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl border border-gray-800 w-fit">
          {[
            { key: 'overview', label: 'Students', icon: <Users size={15}/> },
            { key: 'results', label: 'Results', icon: <BookOpen size={15}/> },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.key ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3 text-gray-400">
            <Filter size={16}/> <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <select value={filters.wilaya} onChange={e => setFilters({...filters, wilaya: e.target.value})}
              className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Wilayas</option>
              {uniqueValues('wilaya').map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={filters.level} onChange={e => setFilters({...filters, level: e.target.value})}
              className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">All Levels</option>
              {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input type="text" placeholder="Filter by school..." value={filters.school}
              onChange={e => setFilters({...filters, school: e.target.value})}
              className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm placeholder-gray-500"/>
            <button onClick={applyFilters} className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Apply
            </button>
            <button onClick={() => {
              setFilters({ wilaya:'', commune:'', school:'', level:'' });
              api.get('/teacher/students').then(r => setStudents(r.data));
            }}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors">
              Reset
            </button>
          </div>
        </div>

        {/* Students Tab */}
        {activeTab === 'overview' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-400 text-sm">
                  {['Name', 'School', 'Wilaya', 'Commune', 'Level', 'Username'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-gray-500 py-8">No students found</td></tr>
                ) : students.map((s, i) => (
                  <tr key={s._id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${i % 2 === 0 ? '' : 'bg-gray-800/10'}`}>
                    <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{s.school}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{s.wilaya}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{s.commune}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{LEVEL_LABELS[s.level]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{s.userId?.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-400 text-sm">
                  {['Student', 'School', 'Experiment', 'Status', 'Score', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-gray-500 py-8">No results yet</td></tr>
                ) : results.map((r, i) => (
                  <tr key={r._id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${i % 2 === 0 ? '' : 'bg-gray-800/10'}`}>
                    <td className="px-4 py-3 text-white font-medium">{r.studentId?.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{r.studentId?.school}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{r.experimentId?.title}</td>
                    <td className="px-4 py-3">
                      {r.completed
                        ? <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle size={12}/> Completed</span>
                        : <span className="flex items-center gap-1 text-xs text-gray-500"><XCircle size={12}/> In Progress</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${r.score >= 70 ? 'text-green-400' : r.score > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {r.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
