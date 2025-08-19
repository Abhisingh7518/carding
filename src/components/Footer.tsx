import React, { useState } from 'react';
import { Mail, Send, Facebook, Instagram, Twitter, Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Very basic validation for demo
    const ok = /.+@.+\..+/.test(email);
    if (!ok) {
      setStatus('error');
      return;
    }
    // Simulate success (no backend)
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 2500);
  };

  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/10 backdrop-blur supports-[backdrop-filter]:bg-black/60 bg-black/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">CardHavi</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Discover, collect, and trade the cards you love. Secure, fast, and fun.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a className="hover:text-white transition" href="#">About</a></li>
              <li><a className="hover:text-white transition" href="#">Categories</a></li>
              <li><a className="hover:text-white transition" href="#">Top Sellers</a></li>
              <li><a className="hover:text-white transition" href="#">Support</a></li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide mb-3">Follow Us</h4>
            <div className="flex items-center gap-3">
              <a className="p-2 rounded-md border border-white/10 hover:bg-white/10 transition" href="#" aria-label="Twitter">
                <Twitter className="w-4 h-4 text-white/70" />
              </a>
              <a className="p-2 rounded-md border border-white/10 hover:bg-white/10 transition" href="#" aria-label="Instagram">
                <Instagram className="w-4 h-4 text-white/70" />
              </a>
              <a className="p-2 rounded-md border border-white/10 hover:bg-white/10 transition" href="#" aria-label="Facebook">
                <Facebook className="w-4 h-4 text-white/70" />
              </a>
              <a className="p-2 rounded-md border border-white/10 hover:bg-white/10 transition" href="#" aria-label="GitHub">
                <Github className="w-4 h-4 text-white/70" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide mb-3">Stay Updated</h4>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                <Send className="w-4 h-4" />
                Subscribe
              </button>
            </form>
            {status === 'success' && (
              <p className="text-xs text-green-400 mt-2">Thanks! You are subscribed.</p>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-400 mt-2">Please enter a valid email.</p>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/70">
          <p>© {year} CardHavi. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-rose-400" /> for card lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
