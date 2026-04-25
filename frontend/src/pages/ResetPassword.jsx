import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { resetPassword } from '../authSlice';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = (data) => {
    setLoading(true);
    setSuccess('');
    dispatch(resetPassword({ token, password: data.password }))
      .unwrap()
      .then((message) => {
        setSuccess(message);
        toast.success('Password reset successfully');
        setTimeout(() => navigate('/login'), 1400);
      })
      .catch((err) => toast.error(err?.message || 'Reset link is invalid or expired'))
      .finally(() => setLoading(false));
  };

  const passwordType = showPassword ? 'text' : 'password';

  return (
    <main className="login-page-shell min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(139,92,246,0.20),transparent_32%),linear-gradient(180deg,#020617_0%,#08111f_45%,#020617_100%)] px-4 py-8 text-white antialiased sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="login-card-fade w-full max-w-[440px] rounded-[28px] border border-white/10 bg-white/[0.065] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8">
          <NavLink to="/login" className="mb-8 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-slate-400 transition hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </NavLink>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-normal text-white">Reset password</h1>
            <p className="text-[15px] leading-6 text-slate-400">Choose a new secure password for your account.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {['password', 'confirmPassword'].map((fieldName) => (
              <div className="space-y-2" key={fieldName}>
                <div className={`group relative rounded-2xl border bg-slate-950/70 transition-all duration-200 ${
                  errors[fieldName]
                    ? 'border-red-300 shadow-[0_0_0_4px_rgba(239,68,68,0.08)]'
                    : 'border-white/10 shadow-sm hover:border-cyan-300/30 focus-within:border-cyan-300/50 focus-within:shadow-[0_0_0_4px_rgba(34,211,238,0.10)]'
                }`}>
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-[#1a73e8]" />
                  <input
                    id={fieldName}
                    type={passwordType}
                    placeholder=" "
                    aria-invalid={errors[fieldName] ? 'true' : 'false'}
                    className="peer h-14 w-full rounded-2xl bg-transparent px-4 pb-2 pl-12 pr-14 pt-6 text-[15px] font-medium text-white outline-none transition placeholder:text-transparent"
                    {...register(fieldName)}
                  />
                  <label htmlFor={fieldName} className={`pointer-events-none absolute left-12 top-2 text-xs font-medium transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium ${
                    errors[fieldName] ? 'text-red-300' : 'text-slate-400 peer-focus:text-cyan-200'
                  }`}>
                    {fieldName === 'password' ? 'New password' : 'Confirm password'}
                  </label>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors[fieldName] && <p className="text-sm font-medium text-red-600">{errors[fieldName].message}</p>}
              </div>
            ))}

            {success && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <button
              type="submit"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1a73e8] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(26,115,232,0.28)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-[#1669d6] focus:outline-none focus:ring-4 focus:ring-[#1a73e8]/20 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading || !token}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Updating...
                </>
              ) : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default ResetPassword;
