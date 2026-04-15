import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fa] dark:bg-slate-900">
        <nav className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#10B981]">biotech</span>
            <span className="text-xl font-bold tracking-tighter text-emerald-600 dark:text-emerald-400 font-headline">Carbon Sentinel</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-slate-500 dark:text-slate-400 font-headline tracking-tight font-light">
            <a className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors px-3 py-1" href="#">Sentinel</a>
            <a className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors px-3 py-1" href="#">Analytics</a>
            <a className="text-emerald-700 dark:text-emerald-300 font-medium px-3 py-1" href="#">Architecture</a>
            <a className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors px-3 py-1" href="#">Report</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:bg-emerald-50/50 p-2 rounded-full transition-colors active:scale-95">search</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:bg-emerald-50/50 p-2 rounded-full transition-colors active:scale-95">account_circle</button>
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="mb-16 md:mb-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight text-on-surface mb-6 leading-tight">
              The Tri-Layer Architecture
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl font-light leading-relaxed max-w-2xl opacity-80">
              A clinical synthesis of artificial intelligence, distributed ledgers, and high-frequency data streaming designed for absolute carbon accountability.
            </p>
          </div>
        </section>

        {/* Tri-Layer Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {/* The Brain */}
          <div className="group bg-surface-container-low p-1 rounded-xl transition-all duration-500 hover:bg-primary-fixed/20">
            <div className="bg-surface-container-lowest p-8 h-full rounded-[calc(0.5rem+4px)] clinical-shadow flex flex-col items-start gap-8 border border-outline-variant/15">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold tracking-tight mb-4 text-on-surface">The Brain (AI)</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  Neural-optimized pattern recognition engines that filter environmental noise into actionable carbon intelligence. Our proprietary logic layer executes complex predictive modeling in sub-millisecond cycles.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-medium text-sm">
                <span>Logic Integrity Validated</span>
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            </div>
          </div>

          {/* The Muscle */}
          <div className="group bg-surface-container-low p-1 rounded-xl transition-all duration-500 hover:bg-primary-fixed/20">
            <div className="bg-surface-container-lowest p-8 h-full rounded-[calc(0.5rem+4px)] clinical-shadow flex flex-col items-start gap-8 border border-outline-variant/15">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold tracking-tight mb-4 text-on-surface">The Muscle (Smart Contracts)</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  The immutable enforcement layer. Every emission delta is cryptographically bound to the ledger through WireFluid-compatible smart contracts, ensuring zero-trust verification across all jurisdictions.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-medium text-sm">
                <span>Ledger Consensus: Active</span>
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
              </div>
            </div>
          </div>

          {/* The Engine */}
          <div className="group bg-surface-container-low p-1 rounded-xl transition-all duration-500 hover:bg-primary-fixed/20">
            <div className="bg-surface-container-lowest p-8 h-full rounded-[calc(0.5rem+4px)] clinical-shadow flex flex-col items-start gap-8 border border-outline-variant/15">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold tracking-tight mb-4 text-on-surface">The Engine (WireFluid)</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">
                  High-velocity data transmission protocol. WireFluid handles massive telemetry throughput with ultra-low overhead, enabling the seamless movement of climate data from sensor to ledger without bottlenecks.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-medium text-sm">
                <span>Throughput: 1.2 GB/s</span>
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Deep Dive */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-16 items-start">
          <div className="sticky top-32">
            <div className="mb-8 p-6 bg-surface-container-low rounded-xl">
              <img 
                alt="Technical Visualization" 
                className="w-full h-64 object-cover rounded-lg mix-blend-multiply opacity-80 grayscale hover:grayscale-0 transition-all duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZvQUCCiySfJ-kwZJWijb7jb4EFy7y5HtkMc0Su-IrV62b3Nh7uML9im9jtXt6Vs94Oj-eR2U2l2aximeu5CtzYA2g61ZXkdCmnmPdLBdWidhshomPR2tQYDEXFDq4tOYx97ZS1QnOF4cODfxPLdFbU4BDi5ujq-feUE3AT1SMC6W7ks6Sb4IQ7xd-p43-jZgwvOfroOEkKaFOsc7fR3B96XfUVqYexJQzl_srRRkd7iqzM5O6F5A0XWz7At3hDeQmVzECKE1abZU" 
              />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant">Protocol Specification</span>
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">The Zero-Latency Hashing Mechanism</h2>
          </div>
          <div className="bg-surface-container-lowest p-10 clinical-shadow border border-outline-variant/10">
            <div className="prose prose-slate max-w-none">
              <p className="font-body text-on-surface-variant leading-loose mb-8">
                The fundamental breakthrough of Carbon Sentinel lies in its <span className="text-primary font-medium">zero-latency hashing mechanism</span>. Traditional blockchain integrations often suffer from throughput limitations due to sequential block production. Sentinel bypasses this via a parallel-execution pipeline that segments incoming telemetry.
              </p>
              <div className="mb-8 flex flex-col gap-6">
                <div className="flex gap-6 items-start">
                  <span className="text-4xl text-primary font-headline opacity-40">01</span>
                  <div>
                    <h4 className="font-bold text-on-surface mb-2">Pre-Verification Buffer</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Incoming sensor streams are first ingested into a localized high-speed buffer where the Brain layer performs initial data integrity checks.</p>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-outline-variant/20"></div>
                <div className="flex gap-6 items-start">
                  <span className="text-4xl text-primary font-headline opacity-40">02</span>
                  <div>
                    <h4 className="font-bold text-on-surface mb-2">Vectorized Serialization</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Data is transformed into lightweight cryptographic vectors. This reduces the total payload size by 85%, allowing for rapid network propagation via WireFluid.</p>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-outline-variant/20"></div>
                <div className="flex gap-6 items-start">
                  <span className="text-4xl text-primary font-headline opacity-40">03</span>
                  <div>
                    <h4 className="font-bold text-on-surface mb-2">Asynchronous Settlement</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Final state transitions are pushed to the Muscle layer. The architecture allows for 'Soft Settlement' (immediate) and 'Hard Consensus' (distributed) to occur simultaneously.</p>
                  </div>
                </div>
              </div>
              <p className="font-body text-on-surface-variant leading-loose">
                This clinical separation of duties ensures that even at peak network congestion, the monitoring of critical environmental assets remains uncompromised. The result is a system that observes with the precision of a scientist and reacts with the speed of an algorithm.
              </p>
            </div>
            <div className="mt-12 flex gap-4">
              <button className="bg-gradient-to-r from-primary-container to-primary text-white px-6 py-3 rounded-lg font-medium hover:brightness-110 transition-all flex items-center gap-2">
                <span>Technical Whitepaper</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button className="border border-outline-variant/30 text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary-fixed/10 transition-all">
                View Node Network
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_-10px_40px_rgba(25,28,29,0.04)] border-t border-[#bbcabf]/15">
        <a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-all" href="#">
          <span className="material-symbols-outlined">radar</span>
          <span className="font-body text-[11px] font-medium tracking-wide">Sentinel</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-all" href="#">
          <span className="material-symbols-outlined">insights</span>
          <span className="font-body text-[11px] font-medium tracking-wide">Analytics</span>
        </a>
        <a className="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 after:content-[''] after:w-1 after:h-1 after:bg-emerald-500 after:rounded-full after:mt-1" href="#">
          <span className="material-symbols-outlined">account_tree</span>
          <span className="font-body text-[11px] font-medium tracking-wide">Architecture</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-all" href="#">
          <span className="material-symbols-outlined">description</span>
          <span className="font-body text-[11px] font-medium tracking-wide">Report</span>
        </a>
      </nav>
    </div>
  );
};

export default About;
