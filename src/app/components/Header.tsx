export default function Header() {
  return (
    // ADICIONEI "mb-8" AQUI para desgrudar da parte de baixo
    <header className="flex flex-col items-center justify-center pt-12 pb-4 space-y-6 mb-9">
      <div className="text-center space-y-2">
        {/* Título Grande */}
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
          <span className="drop-shadow-md">
            Wallet
          </span>
          
          {/* CORREÇÃO: Cor sólida vibrante (Azul) para não sumir nunca mais */}
          <span className="text-blue-500 ml-1 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            Pro
          </span>
        </h1>
        
        {/* Subtítulo */}
        <p className="text-lg font-medium text-slate-400">
          Gerenciamento de Criptoativos
        </p>
      </div>
      
      {/* Badge da versão */}
      <div>
        <span className="px-5 py-2 rounded-full bg-[#1A1F2E] text-xs font-bold text-blue-200 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          v1.0 Dashboard
        </span>
      </div>
    </header>
  );
}