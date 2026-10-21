import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { forgotPassword } from '../authSlice';
import ThemeToggle from '../components/ThemeToggle';

const forgotPasswordSchema = z.object({
  emailId: z.string().trim().email('Enter a valid email'),
});

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage('');
    setRequestError('');
    try {
      const successMessage = await dispatch(forgotPassword(data.emailId.trim())).unwrap();
      setMessage(successMessage);
      toast.success('Reset link sent if the account exists');
    } catch (err) {
      const errorMessage = err?.message || 'Could not send reset link. Please try again.';
      setRequestError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page-shell min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(99,102,241,0.16),transparent_32%),linear-gradient(180deg,#080d16_0%,#0b1320_52%,#080d16_100%)] px-4 py-8 text-white antialiased sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="login-card-fade w-full max-w-[460px] rounded-[28px] border border-slate-700/70 bg-[#101722]/95 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-9">
          <div className="mb-4 flex justify-end"><ThemeToggle /></div>
          <NavLink to="/login" className="mb-8 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-slate-400 transition hover:text-blue-300">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </NavLink>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-normal text-white">Forgot password?</h1>
            <p className="text-[15px] leading-6 text-slate-400">Enter your email and we will send a secure reset link.</p>
          </div>

          {requestError && (
            <div role="alert" className="forgot-request-error mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700">
              {requestError}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <div className={`group relative rounded-2xl border bg-[#0a111d] transition-all duration-200 ${
                errors.emailId
                  ? 'border-red-300 shadow-[0_0_0_4px_rgba(239,68,68,0.08)]'
                  : 'border-slate-700/80 shadow-sm hover:border-blue-400/35 focus-within:border-blue-400/60 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]'
              }`}>
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-400" />
                <input
                  id="emailId"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder=" "
                  aria-invalid={errors.emailId ? 'true' : 'false'}
                  className="peer h-14 w-full rounded-2xl bg-transparent px-4 pb-2 pl-12 pt-6 text-[15px] font-medium text-white outline-none transition placeholder:text-transparent"
                  {...register('emailId')}
                />
                <label htmlFor="emailId" className={`pointer-events-none absolute left-12 top-2 text-xs font-medium transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium ${
                  errors.emailId ? 'text-red-300' : 'text-slate-400 peer-focus:text-blue-300'
                }`}>
                  Email
                </label>
              </div>
              {errors.emailId && <p className="text-sm font-medium text-red-300">{errors.emailId.message}</p>}
            </div>

            {message && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200">
                <p role="status">{message}</p>
              </div>
            )}

            <button
              type="submit"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.30)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Sending link...
                </>
              ) : (
                <>
                  Send reset link
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;
