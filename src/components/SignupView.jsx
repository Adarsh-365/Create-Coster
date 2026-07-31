import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Layers, ArrowRight, Lock, Mail, User, Phone, Shield, 
  AlertCircle, Loader2, CheckCircle2, RefreshCw, KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupView() {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  
  const { signup, verifyAndCompleteSignup, resendVerificationEmail, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!firstName.trim() || !surname.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !phone.trim()) {
      setError('Please fill in all required fields to create your account.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    try {
      await signup({
        firstName: firstName.trim(),
        surname: surname.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim()
      });
      // setIsVerificationSent(true);
      navigate('/create');
    } catch (err) {
      setError(err.message || 'Signup failed. Please check your network connection.');
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setError('');
    try {
      await verifyAndCompleteSignup(email, verificationCode, {
        firstName,
        surname,
        phone
      });
      navigate('/create');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    }
  };

  const handleResend = async () => {
    try {
      await resendVerificationEmail(email);
      setResendStatus('A new verification email has been sent!');
      setTimeout(() => setResendStatus(''), 4000);
    } catch (err) {
      setError('Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-500 mx-auto mb-4 shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isVerificationSent ? 'Verify Your Email' : 'Create ManimFlow Account'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto">
            {isVerificationSent 
              ? `We sent a verification code to ${email}`
              : 'Enter your credentials to synthesize programmatic Manim AI videos.'
            }
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-card rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xl">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resendStatus && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{resendStatus}</span>
            </div>
          )}

          {!isVerificationSent ? (
            /* Standard Signup Form */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* First Name & Surname Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alex"
                      className="w-full bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Surname
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      placeholder="Rivera"
                      className="w-full bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 text-xs justify-center font-medium mt-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Verification Email...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Email Verification Code Form Screen */
            <form onSubmit={handleVerifySubmit} className="space-y-5 py-2">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-500 flex items-center justify-center mx-auto shadow-inner">
                  <Mail className="w-8 h-8 text-blue-500 animate-bounce" />
                </div>
                <div className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Please check your inbox at <strong className="text-slate-900 dark:text-white">{email}</strong> and enter your 6-digit security code.
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1 text-center font-mono uppercase tracking-wider">
                  Verification Security Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="849201"
                    className="w-full bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-lg px-4 py-3 text-center text-lg font-mono tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500 text-center mt-1 font-mono">
                  Enter 6-digit code or click email link
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 text-xs justify-center font-medium shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Verify Email & Access Studio</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVerificationSent(false)}
                  className="text-slate-500 dark:text-zinc-400 hover:underline"
                >
                  Edit Email
                </button>
              </div>
            </form>
          )}

          {!isVerificationSent && (
            <div className="mt-6 text-center text-xs text-slate-600 dark:text-zinc-400">
              Already registered?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500 dark:text-zinc-500">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>SOC2 Type II Encrypted & Isolated GPU Sandboxes</span>
        </div>
      </div>
    </div>
  );
}
