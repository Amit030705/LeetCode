import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './authSlice';
import ForgotPassword from './pages/ForgotPassword';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import ProblemPage from './pages/ProblemPage';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import AdminPanel from './pages/AdminPanel';

function RequireAuth({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Navigate to="/problems" replace /> : children;
}

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-200">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-400" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/problems" replace />} />
      <Route
        path="/problems"
        element={
          <RequireAuth>
            <Homepage />
          </RequireAuth>
        }
      />
      <Route
        path="/problem/:problemId"
        element={
          <RequireAuth>
            <ProblemPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminPanel />
          </RequireAuth>
        }
      />
      <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <Signup />
          </PublicOnly>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnly>
            <ForgotPassword />
          </PublicOnly>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicOnly>
            <ResetPassword />
          </PublicOnly>
        }
      />
      <Route path="*" element={<Navigate to="/problems" replace />} />
    </Routes>
  );
}

export default App;
