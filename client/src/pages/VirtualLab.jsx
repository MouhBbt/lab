import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import ReactMarkdown from 'react-markdown';
import Layout from '../components/Layout';
import api from '../api/axios';
import { ArrowLeft, Lightbulb, CheckCircle, Info, HelpCircle, Trophy } from 'lucide-react';

// ---- 3D Components ----

function LabTable() {
  return (
    <group>
      <Box args={[8, 0.15, 4]} position={[0, -0.07, 0]}>
        <meshStandardMaterial color="#4a3728" roughness={0.8}/>
      </Box>
      {[[-3.7, -1, -1.7], [3.7, -1, -1.7], [-3.7, -1, 1.7], [3.7, -1, 1.7]].map((pos, i) => (
        <Box key={i} args={[0.2, 2, 0.2]} position={pos}>
          <meshStandardMaterial color="#3d2e22" roughness={0.9}/>
        </Box>
      ))}
    </group>
  );
}

function Battery({ position, onClick, connected }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <Cylinder args={[0.25, 0.25, 0.7, 16]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color={hovered ? '#22c55e' : '#16a34a'} emissive={connected ? '#052e16' : '#000000'}/>
      </Cylinder>
      <Cylinder args={[0.08, 0.08, 0.12, 8]} position={[0.42, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#ef4444"/>
      </Cylinder>
      <Cylinder args={[0.08, 0.08, 0.08, 8]} position={[-0.42, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <meshStandardMaterial color="#1e293b"/>
      </Cylinder>
      <Text position={[0, 0.35, 0]} fontSize={0.15} color="white" anchorX="center">Battery</Text>
      {connected && <Text position={[0, -0.4, 0]} fontSize={0.1} color="#4ade80" anchorX="center">Connected</Text>}
    </group>
  );
}

function Bulb({ position, isLit, onClick }) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef();
  
  useFrame((state) => {
    if (glowRef.current && isLit) {
      glowRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
    }
  });

  return (
    <group position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <Cylinder args={[0.12, 0.15, 0.25, 16]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#d4d4d4"/>
      </Cylinder>
      <Sphere args={[0.25, 16, 16]} position={[0, 0.1, 0]}>
        <meshStandardMaterial
          color={isLit ? '#fef08a' : '#e2e8f0'}
          emissive={isLit ? '#fbbf24' : '#000000'}
          emissiveIntensity={isLit ? 1.5 : 0}
          transparent
          opacity={0.85}
        />
      </Sphere>
      {isLit && <pointLight ref={glowRef} intensity={2} distance={3} color="#fbbf24"/>}
      <Text position={[0, 0.5, 0]} fontSize={0.15} color="white" anchorX="center">Bulb</Text>
      {isLit && <Text position={[0, -0.55, 0]} fontSize={0.1} color="#fbbf24" anchorX="center">Lit!</Text>}
    </group>
  );
}

function Switch({ position, isOn, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <Box args={[0.5, 0.15, 0.3]}>
        <meshStandardMaterial color={hovered ? '#64748b' : '#475569'}/>
      </Box>
      <Box args={[0.1, 0.25, 0.25]} position={[isOn ? 0.1 : -0.1, 0.15, 0]}>
        <meshStandardMaterial color={isOn ? '#22c55e' : '#ef4444'} emissive={isOn ? '#14532d' : '#450a0a'}/>
      </Box>
      <Text position={[0, 0.35, 0]} fontSize={0.15} color="white" anchorX="center">Switch</Text>
      <Text position={[0, -0.3, 0]} fontSize={0.1} color={isOn ? '#4ade80' : '#f87171'} anchorX="center">
        {isOn ? 'ON' : 'OFF'}
      </Text>
    </group>
  );
}

function Wire({ from, to, connected }) {
  if (!connected) return null;
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#f59e0b" linewidth={2}/>
    </line>
  );
}

function CircuitScene({ onCircuitComplete }) {
  const [batteryConn, setBatteryConn] = useState(false);
  const [bulbConn, setBulbConn] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);
  const [step, setStep] = useState(0);

  const isComplete = batteryConn && bulbConn && switchOn;

  useEffect(() => {
    if (isComplete) onCircuitComplete(true);
  }, [isComplete, onCircuitComplete]);

  const handleBattery = () => {
    if (step === 0) { setBatteryConn(true); setStep(1); }
  };
  const handleBulb = () => {
    if (step === 1) { setBulbConn(true); setStep(2); }
  };
  const handleSwitch = () => {
    if (step >= 2) setSwitchOn(s => !s);
  };

  return (
    <>
      <ambientLight intensity={0.4}/>
      <directionalLight position={[5, 10, 5]} intensity={1}/>
      <LabTable/>
      <Battery position={[-2.5, 0.3, 0]} onClick={handleBattery} connected={batteryConn}/>
      <Switch position={[0, 0.3, 0]} isOn={switchOn} onClick={handleSwitch}/>
      <Bulb position={[2.5, 0.5, 0]} isLit={isComplete} onClick={handleBulb}/>
      <Wire from={[-2.08, 0.3, 0]} to={[-0.25, 0.3, 0]} connected={batteryConn}/>
      <Wire from={[0.25, 0.3, 0]} to={[2.25, 0.3, 0]} connected={bulbConn}/>
      <Wire from={[2.5, 0.07, 0]} to={[2.5, -0.15, 0]} connected={bulbConn}/>
      <Wire from={[2.5, -0.15, 0]} to={[-2.5, -0.15, 0]} connected={bulbConn}/>
      <Wire from={[-2.5, -0.15, 0]} to={[-2.5, 0.06, 0]} connected={batteryConn}/>
      <OrbitControls enablePan={false} minDistance={3} maxDistance={12}/>
    </>
  );
}

// ---- Quiz ----
function Quiz({ quiz, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const pct = Math.round((correct / quiz.length) * 100);
    setScore(pct);
    setSubmitted(true);
    onComplete(pct, Object.values(answers));
  };

  if (submitted) return (
    <div className="text-center p-8">
      <Trophy className="mx-auto text-yellow-400 mb-4" size={48}/>
      <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
      <p className="text-gray-400 mb-4">You scored</p>
      <div className="text-5xl font-bold text-cyan-400 mb-4">{score}%</div>
      <div className={`text-sm px-4 py-2 rounded-full inline-block ${score >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {score >= 70 ? '🎉 Excellent!' : '📚 Keep studying!'}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Post-Experiment Quiz</h3>
      {quiz.map((q, i) => (
        <div key={i} className="bg-gray-800 rounded-xl p-4">
          <p className="text-white font-medium mb-3">{i+1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, j) => (
              <button key={j} onClick={() => setAnswers({...answers, [i]: j})}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                  answers[i] === j ? 'bg-cyan-500/30 border border-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                {String.fromCharCode(65+j)}. {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < quiz.length}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity">
        Submit Quiz
      </button>
    </div>
  );
}

// ---- Main VirtualLab page ----
export default function VirtualLab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('lab');
  const [circuitDone, setCircuitDone] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  useEffect(() => {
    api.get(`/experiments/${id}`)
      .then(r => { setExperiment(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleCircuitComplete = (done) => {
    setCircuitDone(done);
  };

  const handleQuizComplete = async (score, answers) => {
    setFinalScore(score);
    try {
      await api.post('/results', {
        experimentId: id,
        completed: true,
        score,
        circuitCorrect: circuitDone,
        quizAnswers: answers
      });
    } catch (err) {
      console.error('Failed to save result:', err);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
      </div>
    </Layout>
  );

  if (!experiment) return (
    <Layout>
      <div className="p-8 text-white">Experiment not found.</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="h-screen flex flex-col">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20}/>
          </button>
          <div>
            <h1 className="text-white font-bold">{experiment.title}</h1>
            <p className="text-gray-400 text-sm">{experiment.subject} | {experiment.category}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {circuitDone && (
              <span className="flex items-center gap-1 text-green-400 text-sm bg-green-500/10 px-3 py-1 rounded-full">
                <CheckCircle size={14}/> Circuit Complete!
              </span>
            )}
            {finalScore !== null && (
              <span className="flex items-center gap-1 text-yellow-400 text-sm bg-yellow-500/10 px-3 py-1 rounded-full">
                <Trophy size={14}/> Score: {finalScore}%
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 flex gap-1">
          {[
            { key: 'instructions', icon: <Info size={14}/>, label: 'Instructions' },
            { key: 'lab', icon: <Lightbulb size={14}/>, label: '3D Lab' },
            { key: 'quiz', icon: <HelpCircle size={14}/>, label: 'Quiz', disabled: !circuitDone },
          ].map(t => (
            <button key={t.key}
              onClick={() => !t.disabled && setTab(t.key)}
              disabled={t.disabled}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-cyan-400 text-cyan-400'
                  : t.disabled
                  ? 'border-transparent text-gray-600 cursor-not-allowed'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              {t.icon} {t.label}
              {t.key === 'quiz' && t.disabled && <span className="text-xs">(Complete lab first)</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {tab === 'instructions' && (
            <div className="h-full overflow-auto p-8 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">{experiment.title}</h2>
              {experiment.description && (
                <div className="prose prose-invert prose-sm max-w-none mb-6 text-gray-300">
                  <ReactMarkdown>{experiment.description}</ReactMarkdown>
                </div>
              )}
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Info size={18} className="text-cyan-400"/> Step-by-Step Instructions
              </h3>
              <ol className="space-y-3 mb-8">
                {experiment.instructions?.map((inst, i) => (
                  <li key={i} className="flex gap-3 text-gray-300">
                    <span className="flex-shrink-0 w-7 h-7 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">{i+1}</span>
                    <div className="prose prose-invert prose-sm max-w-none pt-0.5">
                      <ReactMarkdown>{inst}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ol>
              <button onClick={() => setTab('lab')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                Start Experiment →
              </button>
            </div>
          )}

          {tab === 'lab' && (
            <div className="h-full relative">
              <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
                <CircuitScene onCircuitComplete={handleCircuitComplete}/>
              </Canvas>
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur rounded-xl p-4 text-sm text-white max-w-xs">
                <p className="font-semibold text-cyan-400 mb-2">Instructions:</p>
                <ol className="space-y-1 text-gray-300">
                  <li className={`${circuitDone ? 'line-through text-gray-500' : ''}`}>1. Click Battery to connect it</li>
                  <li>2. Click Bulb to connect it</li>
                  <li>3. Click Switch to turn it ON</li>
                </ol>
                {circuitDone && (
                  <div className="mt-3 text-green-400 font-semibold">✓ Circuit Complete! The bulb is lit!</div>
                )}
              </div>
              {circuitDone && (
                <div className="absolute bottom-4 right-4">
                  <button onClick={() => setTab('quiz')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg">
                    Take Quiz →
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'quiz' && (
            <div className="h-full overflow-auto p-8 max-w-2xl mx-auto">
              {experiment.quiz?.length > 0 ? (
                <Quiz quiz={experiment.quiz} onComplete={handleQuizComplete}/>
              ) : (
                <div className="text-center text-gray-400 mt-12">No quiz available for this experiment.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
