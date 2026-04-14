import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { useCarbonStore } from '../store/useCarbonStore'

const Landing: React.FC = () => {
  const navigate = useNavigate()
  
  const { user, login, signup, isLoading, error } = useCarbonStore()
  
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup'>('none');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      // Small delay for smooth transition if they just signed up
      setTimeout(() => navigate('/dashboard'), 500);
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (authMode === 'login') {
      success = await login(username, password);
    } else {
      success = await signup(username, password);
    }
    if (success) navigate('/dashboard');
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen relative">
      {/* TopAppBar */}
      <header className="absolute top-0 w-full z-50">
        <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">monitoring</span>
            <span className="text-xl font-bold text-slate-900 font-headline tracking-tight">Carbon Sentinel</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-emerald-600 font-medium font-headline tracking-tight hover:bg-slate-100/50 transition-colors px-3 py-1 rounded" href="#">Protocol</a>
            <a className="text-slate-500 font-headline tracking-tight hover:bg-slate-100/50 transition-colors px-3 py-1 rounded" href="#">Whitepaper</a>
            <button 
              onClick={() => {
                if(user) navigate('/dashboard'); else setAuthMode('login');
              }}
              className="bg-emerald-500 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-emerald-600 transition-all scale-95 duration-200"
            >
              {user ? 'Go to Dashboard' : 'Sign In'}
            </button>
          </div>
        </nav>
      </header>

      {/* Auth Modal Overlay */}
      {authMode !== 'none' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface p-8 rounded-3xl biological-shadow w-full max-w-md border border-outline-variant/20 relative">
            <button 
              onClick={() => setAuthMode('none')}
              className="absolute top-4 right-4 text-on-surface-variant hover:opacity-70"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-3xl font-headline font-bold mb-2">
              {authMode === 'login' ? 'Welcome Back' : 'Create Sentinel Identity'}
            </h2>
            <p className="text-on-surface-variant text-sm mb-6">
              {authMode === 'login' ? 'Enter your username to access your dashboard.' : 'Provision your initial carbon offset budget instantly.'}
            </p>

            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">Username</label>
                <input 
                  required 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Enter a unique username"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">Password</label>
                <input 
                  required 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline/30 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Secure password"
                />
              </div>
              
              {error && <p className="text-error text-sm mt-1">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="gradient-pulse text-white w-full py-4 rounded-xl font-bold mt-4 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
              >
                {isLoading ? 'Processing...' : (authMode === 'login' ? 'Authenticate' : 'Initialize Account')}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant mt-6">
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-primary font-bold hover:underline"
              >
                {authMode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      )}

      <main className="pt-24 z-10 relative">
        <section className="relative min-h-[795px] flex items-center px-6 md:px-12 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-7 z-10">
              <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Network Active</span>
              </div>
              <h1 className="font-headline font-extrabold text-5xl md:text-7xl text-on-background leading-[1.1] tracking-tight mb-8">
                Autonomous Carbon <br />
                <span className="text-primary-container">Offsetting</span> for <br />
                Live Events.
              </h1>
              <p className="text-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                Precision telemetry meets blockchain accountability. We automate real-time atmospheric recovery for the world's largest gatherings using algorithmic micro-retirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setAuthMode('signup')}
                  className="gradient-pulse text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                  Create Account
                </button>
                <button 
                  onClick={() => {
                    if (user) navigate('/dashboard'); else setAuthMode('login');
                  }}
                  className="px-8 py-4 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-low transition-colors"
                >
                  Enter Dashboard
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative hidden lg:block">
              {/* Abstract Visual from original */}
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/10 to-transparent blur-3xl"></div>
                <div className="relative glass-panel biological-shadow p-8 rounded-3xl border border-white/20 transform rotate-3">
                  <img 
                    className="w-full h-auto rounded-xl grayscale contrast-125" 
                    alt="Close-up high-tech minimalist data interface" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQYe6EgSbrGM1YZ0-RGZuRafiv1l9NP1dskCUhoLnfP1eKl1GnB6SPW4V-Ttcm9OlMqgiIGGxOWOi0Yd0v13jN2xjO_jMJl5BP-fMqJNsUvZUOwzN9NQL7qfbj77HcVZzC-6Pt399G8fBKtp3eJ2Nl8hDCpR0r-blZsFP-b5qF5OreYksTV5r_XuUeUoYhYU14z5PW6ZGu9EzA-RDKZI9R8NmU9TSpI1dbyPOwvpgNExlkP457rcxJwsNZATDskADvfkqxVGKMkmQ" 
                  />
                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold mb-1">Atmospheric Impact</p>
                      <p className="text-3xl font-headline font-bold text-primary">42.84<span className="text-sm ml-1 text-on-surface-variant">tCO2e</span></p>
                    </div>
                    <div className="w-24 h-12">
                      <svg className="w-full h-full stroke-primary fill-none stroke-2" viewBox="0 0 100 40">
                        <path d="M0 35 Q 25 10, 50 25 T 100 5"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
