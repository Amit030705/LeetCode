import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { forgotPassword } from '../authSlice';

const forgotPasswordSchema = z.object({
  emailId: z.string().email('Enter a valid email'),
});

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = (data) => {
    setLoading(true);
    setMessage('');
    dispatch(forgotPassword(data.emailId))
      .unwrap()
      .then((successMessage) => {
        setMessage(successMessage);
        toast.success('Reset link sent if the account exists');
      })
      .catch((err) => toast.error(err?.message || 'Could not send reset link'))
      .finally(() => setLoading(false));
  };

  return (
    <main className="login-page-shell min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(139,92,246,0.20),transparent_32%),linear-gradient(180deg,#020617_0%,#08111f_45%,#020617_100%)] px-4 py-8 text-white antialiased sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="login-card-fade w-full max-w-[440px] rounded-[28px] border border-white/10 bg-white/[0.065] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8">
          <NavLink to="/login" className="mb-8 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-slate-400 transition hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </NavLink>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-normal text-white">Forgot password?</h1>
            <p className="text-[15px] leading-6 text-slate-400">Enter your email and we will send a secure reset link.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <div className={`group relative rounded-2xl border bg-slate-950/70 transition-all duration-200 ${
                errors.emailId
                  ? 'border-red-300 shadow-[0_0_0_4px_rgba(239,68,68,0.08)]'
                  : 'border-white/10 shadow-sm hover:border-cyan-300/30 focus-within:border-cyan-300/50 focus-within:shadow-[0_0_0_4px_rgba(34,211,238,0.10)]'
              }`}>
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-[#1a73e8]" />
                <input
                  id="emailId"
                  type="email"
                  placeholder=" "
                  aria-invalid={errors.emailId ? 'true' : 'false'}
                  className="peer h-14 w-full rounded-2xl bg-transparent px-4 pb-2 pl-12 pt-6 text-[15px] font-medium text-white outline-none transition placeholder:text-transparent"
                  {...register('emailId')}
                />
                <label htmlFor="emailId" className={`pointer-events-none absolute left-12 top-2 text-xs font-medium transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium ${
                  errors.emailId ? 'text-red-300' : 'text-slate-400 peer-focus:text-cyan-200'
                }`}>
                  Email
                </label>
              </div>
              {errors.emailId && <p className="text-sm font-medium text-red-600">{errors.emailId.message}</p>}
            </div>

            {message && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1a73e8] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(26,115,232,0.28)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-[#1669d6] focus:outline-none focus:ring-4 focus:ring-[#1a73e8]/20 disabled:cursor-not-allowed disabled:opacity-70"
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
