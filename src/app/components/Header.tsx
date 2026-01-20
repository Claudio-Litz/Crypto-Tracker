export default function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center py-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Wallet<span className="text-blue-500">Pro</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gerenciamento de Criptoativos</p>
      </div>
      
      {/* Botão decorativo (sem função por enquanto) */}
      <div className="mt-4 md:mt-0">
        <span className="px-4 py-2 rounded-full bg-[#1A1F2E] text-xs font-bold text-slate-300 border border-slate-700/50">
          v1.0 Dashboard
        </span>
      </div>
    </header>
  );
}