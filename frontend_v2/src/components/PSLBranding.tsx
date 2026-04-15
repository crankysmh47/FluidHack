import React from 'react';

const PSLBranding: React.FC = () => {
  // Using Raw GitHub Content which is highly reliable for hotlinking and avoids most CORS/Anti-Hotlink issues
  const pslLogo = "https://raw.githubusercontent.com/Tvwap/Tvimage/main/psl.png";
  
  const teams = [
    { name: "Islamabad United", logo: "https://raw.githubusercontent.com/Tvwap/Tvimage/main/islamabad_united.png" },
    { name: "Karachi Kings", logo: "https://raw.githubusercontent.com/Tvwap/Tvimage/main/karachi_kings.png" },
    { name: "Lahore Qalandars", logo: "https://raw.githubusercontent.com/Tvwap/Tvimage/main/lahore_qalandars.png" },
    { name: "Multan Sultans", logo: "https://raw.githubusercontent.com/Tvwap/Tvimage/main/multan_sultans.png" },
    { name: "Peshawar Zalmi", logo: "https://raw.githubusercontent.com/Tvwap/Tvimage/main/peshawar_zalmi.png" },
    { name: "Quetta Gladiators", logo: "https://raw.githubusercontent.com/Tvwap/Tvimage/main/quetta_gladiators.png" }
  ];

  return (
    <>
      {/* Floating Main PSL Logo at Bottom-Right - Guaranteed Visibility */}
      <div 
        className="fixed bottom-8 right-8 z-[999] cursor-pointer group p-3 bg-white/40 backdrop-blur-xl rounded-2xl border-2 border-emerald-500/50 shadow-2xl transition-all hover:scale-110 active:scale-95 hover:rotate-3"
        onClick={() => window.open("https://www.psl-t20.com/", "_blank")}
      >
        <div className="relative flex flex-col items-center">
          <img 
            src={pslLogo} 
            alt="PSL" 
            className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg"
            onError={(e) => {
              // Final fallback to text if even GitHub fails
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                (e.target as HTMLElement).style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = '<div style="font-weight:900; color:#059669; font-size:24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">HBL PSL</div>';
                parent.appendChild(fallback);
              }
            }}
          />
          <div className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full mt-1 tracking-widest uppercase">
            Official
          </div>
        </div>
      </div>

      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-5] select-none">
        {/* Subtle Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] font-black text-[12vw] text-emerald-900 tracking-tighter uppercase whitespace-nowrap rotate-[-8deg]">
            PAKISTAN SUPER LEAGUE
        </div>

        {/* Scattered Team Logos - Robust GitHub URLs */}
        <div className="absolute top-[15%] right-[12%] opacity-[0.15] animate-float-medium">
            <img src={teams[0].logo} alt="" className="w-24 h-24 object-contain" />
        </div>
        <div className="absolute bottom-[22%] left-[8%] opacity-[0.15] animate-float-fast">
            <img src={teams[1].logo} alt="" className="w-28 h-28 object-contain" />
        </div>
        <div className="absolute top-[38%] left-[18%] opacity-[0.15] animate-float-slow">
            <img src={teams[2].logo} alt="" className="w-22 h-22 object-contain" />
        </div>
        <div className="absolute bottom-[48%] right-[18%] opacity-[0.15] animate-float-medium">
            <img src={teams[3].logo} alt="" className="w-26 h-26 object-contain" />
        </div>
        <div className="absolute top-[78%] left-[40%] opacity-[0.15] animate-float-fast">
            <img src={teams[4].logo} alt="" className="w-20 h-20 object-contain" />
        </div>
        <div className="absolute top-[28%] left-[60%] opacity-[0.15] animate-float-slow">
            <img src={teams[5].logo} alt="" className="w-30 h-30 object-contain" />
        </div>

        {/* Cricket Icons */}
        <div className="absolute top-[15%] left-[45%] opacity-[0.1] animate-float-fast text-emerald-900">
            <span className="material-symbols-outlined text-7xl font-bold">sports_cricket</span>
        </div>
        <div className="absolute bottom-[20%] right-[35%] opacity-[0.1] animate-float-slow text-emerald-900">
            <span className="material-symbols-outlined text-6xl font-bold">stadium</span>
        </div>
      </div>
    </>
  );
};

export default PSLBranding;
