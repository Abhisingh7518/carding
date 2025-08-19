import React, { useMemo, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginFormProps {
  onBack: () => void;
  onSubmit: (email: string, password: string) => void;
  error?: string;
  siteName?: string; // Optional override for branding
  onSwitchToSignup?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onBack, onSubmit, error, siteName, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const brand = useMemo(() => {
    return siteName || (import.meta.env.VITE_SITE_NAME as string) || 'Your Brand';
  }, [siteName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="min-h-screen w-full animated-gradient flex items-center justify-center p-4 auth-fade-in">
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
                <h2 className="text-2xl md:text-3xl font-bold gradient-text">Sign In</h2>
                <p className="text-sm brand-muted mt-1">
                  Don't have an account?{' '}
                  <a
                    className="brand-link cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onSwitchToSignup && onSwitchToSignup();
                    }}
                  >
                    Register now
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
                  <label className="block text-sm font-medium brand-label mb-2">Username</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg brand-input focus:outline-none focus:ring-2 focus:ring-red-500/60"
                      placeholder="yourname"
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

                {/* Info box styled like captcha instructions */}
                <div className="bg-white/5 brand-border rounded-lg p-3 text-sm brand-muted">
                  To sign in, complete the verification step if prompted. Click the image shown the least number of times.
                  <div className="mt-3 h-16 rounded-md bg-white/5 brand-border flex items-center justify-center text-white/40">
                    Verification placeholder
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded bg-white/10 border-white/20 text-red-500 focus:ring-red-500/60" />
                    <span className="ml-2 text-sm brand-muted">Remember me</span>
                  </label>
                  <a className="text-sm brand-muted hover:text-white cursor-pointer">Forgot your password?</a>
                </div>

                <button type="submit" className="w-full brand-button py-3 rounded-lg font-semibold transition">
                  Sign In
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

export default LoginForm;
