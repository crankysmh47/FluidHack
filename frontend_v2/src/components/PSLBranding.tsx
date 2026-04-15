import React from 'react';

const PSLBranding: React.FC = () => {
  // Using the new psl_giants asset
  const pslLogo = "/psl_giants.png";
  
  const teams = [
    { id: 'iu', name: "Islamabad United", color: "text-red-600", icon: "shield" },
    { id: 'kk', name: "Karachi Kings", color: "text-blue-600", icon: "crown" },
    { id: 'lq', name: "Lahore Qalandars", color: "text-emerald-600", icon: "castle" },
    { id: 'ms', name: "Multan Sultans", color: "text-emerald-500", icon: "mosque" },
    { id: 'pz', name: "Peshawar Zalmi", color: "text-emerald-700", icon: "bolt" },
    { id: 'qg', name: "Quetta Gladiators", color: "text-slate-700", icon: "swords" }
  ];

  return (
    <>
      {/* Floating Main PSL Logo at Bottom-Right - Restored Styling */}
      <div 
        className="fixed bottom-8 right-8 z-[999] cursor-pointer group p-3 bg-white/40 backdrop-blur-xl rounded-2xl border-2 border-emerald-500/50 shadow-2xl transition-all hover:scale-110 active:scale-95 hover:rotate-3"
        onClick={() => window.open("https://www.psl-t20.com/", "_blank")}
      >
        <div className="relative flex flex-col items-center">
          <img 
            src={pslLogo} 
            alt="PSL" 
            className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg"
          />
          <div className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full mt-1 tracking-widest uppercase">
            Official
          </div>
        </div>
      </div>

      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-5] select-none">
        {/* Subtle Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] font-black text-[12vw] text-emerald-900 tracking-tighter uppercase whitespace-nowrap rotate-[-8deg]">
            PAKISTAN SUPER LEAGUE
        </div>

        {/* Floating Icons/Logos - Robust SVGs instead of potentially broken URLs */}
        {teams.map((team, idx) => (
          <div 
            key={team.id} 
            className={`absolute opacity-[0.1] dark:opacity-[0.15] animate-float-${['slow', 'medium', 'fast'][idx % 3]}`}
            style={{ 
              top: `${[15, 22, 38, 48, 78, 28][idx]}%`, 
              [idx % 2 === 0 ? 'right' : 'left']: `${[12, 8, 18, 18, 40, 60][idx]}%` 
            }}
          >
            <div className={`flex flex-col items-center ${team.color}`}>
              <span className="material-symbols-outlined text-6xl md:text-8xl select-none">
                {team.icon}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest mt-2">{team.name.split(' ')[0]}</span>
            </div>
          </div>
        ))}

        {/* Cricket Icons */}
        <div className="absolute top-[15%] left-[45%] opacity-[0.08] animate-float-fast text-emerald-900">
            <span className="material-symbols-outlined text-7xl font-bold">sports_cricket</span>
        </div>
        <div className="absolute bottom-[20%] right-[35%] opacity-[0.08] animate-float-slow text-emerald-900">
            <span className="material-symbols-outlined text-6xl font-bold">stadium</span>
        </div>
      </div>
    </>
  );
};

export default PSLBranding;
