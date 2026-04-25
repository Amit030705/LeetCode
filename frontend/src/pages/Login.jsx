import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { googleAuthUser, loginUser } from '../authSlice';

const loginSchema = z.object({
  emailId: z.string().email('Invalid Email'),
  password: z.string().min(8, 'Password is too weak'),
});

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1a73e8] text-lg font-semibold text-white shadow-[0_14px_30px_rgba(26,115,232,0.28)]">
        L
      </div>
      <div>
        <p className="text-sm font-semibold text-white">LeecoAI</p>
        <p className="text-xs font-medium text-slate-400">Developer workspace</p>
      </div>
    </div>
  );
}

function FloatingInput({
  id,
  label,
  type = 'text',
  icon: Icon,
  error,
  registration,
  rightAction,
}) {
  return (
    <div className="space-y-2">
      <div
        className={`group relative rounded-2xl border bg-slate-950/70 transition-all duration-200 ${
          error
            ? 'border-red-300 shadow-[0_0_0_4px_rgba(239,68,68,0.08)]'
            : 'border-white/10 shadow-sm hover:border-cyan-300/30 focus-within:border-cyan-300/50 focus-within:shadow-[0_0_0_4px_rgba(34,211,238,0.10)]'
        }`}
      >
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-[#1a73e8]" />
        )}
        <input
          id={id}
          type={type}
          placeholder=" "
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`peer h-14 w-full rounded-2xl bg-transparent px-4 pb-2 pt-6 text-[15px] font-medium text-white outline-none transition placeholder:text-transparent ${
            Icon ? 'pl-12' : ''
          } ${rightAction ? 'pr-14' : ''}`}
          {...registration}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute top-2 text-xs font-medium transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium ${
            Icon ? 'left-12' : 'left-4'
          } ${error ? 'text-red-300' : 'text-slate-400 peer-focus:text-cyan-200'}`}
        >
          {label}
        </label>
        {rightAction}
      </div>
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-sm font-medium text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error.message}
        </p>
      )}
    </div>
  );
}

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data))
      .unwrap()
      .then(() => toast.success('Signed in successfully'))
      .catch((err) => toast.error(err?.message || 'Login failed'));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google did not return a valid credential');
      return;
    }

    dispatch(googleAuthUser(credentialResponse.credential))
      .unwrap()
      .then(() => toast.success('Signed in with Google'))
      .catch((err) => toast.error(err?.message || 'Google sign-in failed'));
  };

  return (
    <main className="login-page-shell min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(139,92,246,0.20),transparent_32%),linear-gradient(180deg,#020617_0%,#08111f_45%,#020617_100%)] px-4 py-8 text-white antialiased sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="login-card-fade w-full max-w-[440px] rounded-[28px] border border-white/10 bg-white/[0.065] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8">
          <div className="mb-10">
            <BrandMark />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-normal text-white">Sign in</h1>
            <p className="text-[15px] leading-6 text-slate-400">Use your account to continue</p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{typeof error === 'string' ? error : 'Unable to sign in. Please try again.'}</span>
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FloatingInput
              id="emailId"
              label="Email or phone"
              type="email"
              icon={Mail}
              error={errors.emailId}
              registration={register('emailId')}
            />

            <FloatingInput
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={LockKeyhole}
              error={errors.password}
              registration={register('password')}
              rightAction={
                <button
                  type="button"
                  className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />

            <div className="flex justify-start">
              <NavLink
                to="/forgot-password"
                className="rounded-full px-1 text-sm font-semibold text-[#1a73e8] transition hover:text-[#1558b0] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/25"
              >
                Forgot password?
              </NavLink>
            </div>

            <button
              type="submit"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1a73e8] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(26,115,232,0.28)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-[#1669d6] hover:shadow-[0_18px_34px_rgba(26,115,232,0.34)] focus:outline-none focus:ring-4 focus:ring-[#1a73e8]/20 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:scale-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="overflow-hidden rounded-full border border-white/10 bg-white p-1 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-cyan-300/30">
            {googleClientId ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-in was cancelled')}
                theme="outline"
                size="large"
                text="continue_with"
                shape="pill"
                width="390"
                useOneTap={false}
              />
            ) : (
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-500"
                onClick={() => toast.error('Add VITE_GOOGLE_CLIENT_ID in frontend/.env')}
              >
                Configure Google Sign-In
              </button>
            )}
          </div>

          <div className="mt-8 text-center text-sm text-slate-400">
            New to LeecoAI?{' '}
            <NavLink
              to="/signup"
              className="font-semibold text-[#1a73e8] transition hover:text-[#1558b0] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/25"
            >
              Create account
            </NavLink>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
