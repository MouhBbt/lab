import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Beaker, Zap, Atom, Leaf, FlaskConical, ChevronRight } from 'lucide-react';

const LEVEL_LABELS = { primary: 'Primary School', middle: 'Middle School', high: 'High School' };
const SUBJECT_ICONS = {
  Physics: <Zap className="text-yellow-400" size={18}/>,
  Chemistry: <Atom className="text-purple-400" size={18}/>,
  'Natural Sciences': <Leaf className="text-green-400" size={18}/>,
  'Scientific Education': <Beaker className="text-blue-400" size={18}/>,
  Biology: <Leaf className="text-emerald-400" size={18}/>,
};
const EXPERIMENT_COLORS = {
  'Electricity': 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
  'Mechanics': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  'Inorganic Chemistry': 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  'Biology': 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  'General Science': 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30',
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, resultsRes] = await Promise.all([
          api.get('/students/me'),
          api.get('/results/my')
        ]);
        setStudent(studentRes.data);
        setResults(resultsRes.data);
        const expRes = await api.get(`/experiments?level=${studentRes.data.level}`);
        setExperiments(expRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getResult = (expId) => results.find(r => r.experimentId?._id === expId || r.experimentId === expId);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {student?.name || user?.username}! 👋</h1>
          <p className="text-gray-400">Ready to explore science today?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Education Level</p>
            <p className="text-white font-bold text-xl mt-1">{LEVEL_LABELS[student?.level] || 'N/A'}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Experiments Available</p>
            <p className="text-cyan-400 font-bold text-xl mt-1">{experiments.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-green-400 font-bold text-xl mt-1">{results.filter(r => r.completed).length}</p>
          </div>
        </div>

        {/* Student Info */}
        {student && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
            <h2 className="text-white font-semibold mb-3">Your Profile</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-gray-400">School</p><p className="text-white">{student.school}</p></div>
              <div><p className="text-gray-400">Wilaya</p><p className="text-white">{student.wilaya}</p></div>
              <div><p className="text-gray-400">Commune</p><p className="text-white">{student.commune}</p></div>
              <div><p className="text-gray-400">Level</p><p className="text-white">{LEVEL_LABELS[student.level]}</p></div>
            </div>
          </div>
        )}

        {/* Experiments */}
        <h2 className="text-xl font-bold text-white mb-4">Available Experiments</h2>
        {experiments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FlaskConical size={48} className="mx-auto mb-3 opacity-30"/>
            <p>No experiments available for your level yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map(exp => {
              const result = getResult(exp._id);
              const colorClass = EXPERIMENT_COLORS[exp.category] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
              return (
                <div key={exp._id}
                  className={`bg-gradient-to-br ${colorClass} border rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer`}
                  onClick={() => navigate(`/lab/${exp._id}`)}>
                  {/* Experiment image placeholder */}
                  <div className="h-32 bg-black/20 rounded-lg mb-4 flex items-center justify-center">
                    <FlaskConical size={40} className="text-white/30"/>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {SUBJECT_ICONS[exp.subject] || <Beaker size={18} className="text-gray-400"/>}
                    <span className="text-sm text-gray-300">{exp.subject}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-sm text-gray-400">{exp.category}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">{exp.title}</h3>
                  <div className="flex items-center justify-between">
                    {result?.completed ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                        ✓ Completed — Score: {result.score}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not started</span>
                    )}
                    <button className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
                      Start <ChevronRight size={14}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
