export default function Header() {
  return (
    // Alterei pb-4 para pb-2 e mb-9 para mb-6 para aproximar dos blocos
    <header className="flex flex-col items-center justify-center pt-8 pb-2 space-y-4 mb-6">
      <div className="text-center space-y-1">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
          <span className="drop-shadow-md">Wallet</span>
          <span className="text-blue-500 ml-1 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">Pro</span>
        </h1>
        <p className="text-sm font-medium text-slate-400">
          Gerenciamento de Criptoativos
        </p>
      </div>
    </header>
  );
}