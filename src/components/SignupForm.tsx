import React, { useMemo, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';

interface SignupFormProps {
  onBack: () => void;
  onSubmit: (name: string, email: string, password: string, confirmPassword: string) => void;
  error?: string;
  siteName?: string;
  onSwitchToLogin?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onBack, onSubmit, error, siteName, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const brand = useMemo(() => siteName || (import.meta.env.VITE_SITE_NAME as string) || 'Your Brand', [siteName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, email, password, confirmPassword);
  };

  return (
    <div className="min-h-screen w-full brand-auth-bg flex items-center justify-center p-4 auth-fade-in">
      <div className="w-full max-w-6xl rounded-2xl brand-auth-container overflow-hidden auth-pop">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Branding side */}
          <div className="hidden md:flex items-center justify-center p-10 relative">
            <div className="relative z-10 select-none">
              <div className="text-5xl font-extrabold tracking-widest gradient-text-animated">
                {brand}
              </div>
              <div className="mt-3 text-sm tracking-[0.35em] text-white/70 uppercase">Next Generation Market</div>
            </div>
          </div>

          {/* Form side */}
          <div className="p-6 md:p-10">
            <button onClick={onBack} className="flex items-center text-white/80 hover:text-white mb-6">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Store
            </button>

            <div className="brand-auth-surface brand-auth-surface--gradient rounded-2xl p-6 md:p-8 auth-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold gradient-text">Create Account</h2>
                <p className="text-sm brand-muted mt-1">Join {brand} to start collecting</p>
                <p className="text-sm brand-muted mt-1">
                  Already have an account?{' '}
                  <a
                    className="brand-link cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onSwitchToLogin && onSwitchToLogin();
                    }}
                  >
                    Sign in
                  </a>
                </p>
              </div>

              <div className="auth-divider mb-4" />

              {error && (
                <div className="bg-red-900/40 border border-red-400/40 text-red-200 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium brand-label mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg brand-input focus:outline-none focus:ring-2 focus:ring-red-500/60"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium brand-label mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg brand-input focus:outline-none focus:ring-2 focus:ring-red-500/60"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium brand-label mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 rounded-lg brand-input focus:outline-none focus:ring-2 focus:ring-red-500/60"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-white/50 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium brand-label mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg brand-input focus:outline-none focus:ring-2 focus:ring-red-500/60"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input type="checkbox" required className="rounded bg-white/10 border-white/20 text-red-500 focus:ring-red-500/60" />
                  <span className="ml-2 text-sm brand-muted">I agree to the Terms and Privacy Policy</span>
                </div>

                <button type="submit" className="w-full brand-button py-3 rounded-lg font-semibold transition">
                  Create Account
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
;

export default SignupForm;
