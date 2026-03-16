import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import VirtualLab from './pages/VirtualLab';

function ProtectedRoute({ children, role }) {
  const { user, token, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/dashboard'} replace />;
  return children;
}

function AppRoutes() {
  const { user, token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!token ? <Login/> : <Navigate to={user?.role === 'teacher' ? '/teacher' : '/dashboard'}/>}/>
      <Route path="/register" element={!token ? <Register/> : <Navigate to={user?.role === 'teacher' ? '/teacher' : '/dashboard'}/>}/>
      <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard/></ProtectedRoute>}/>
      <Route path="/lab/:id" element={<ProtectedRoute role="student"><VirtualLab/></ProtectedRoute>}/>
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard/></ProtectedRoute>}/>
      <Route path="/teacher/students" element={<ProtectedRoute role="teacher"><TeacherDashboard initialTab="students"/></ProtectedRoute>}/>
      <Route path="/teacher/results" element={<ProtectedRoute role="teacher"><TeacherDashboard initialTab="results"/></ProtectedRoute>}/>
      <Route path="/" element={<Navigate to="/login" replace/>}/>
      <Route path="*" element={<Navigate to="/login" replace/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </AuthProvider>
  );
}
