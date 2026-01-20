import { supabase } from "@/src/lib/supabase";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import SummaryCards from "./components/SummaryCards";
import AllocationChart from "./components/AllocationChart";
import HistoryChart from "./components/HistoryChart";
import Header from "./components/Header";

// Força atualização dos dados
export const revalidate = 0;

export default async function Home() {
  // Busca dados
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <div className="p-20 text-center text-red-500">Erro ao carregar dados. Verifique o Supabase.</div>;
  
  const txData = transactions || [];

  // Classe para as "Ilhas" (fundo cinza azulado, bordas redondas)
  const islandClass = "bg-[#1A1F2E]/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300";

  return (
  // Adicionamos um gradiente radial sutil no fundo e texturas
  <main className="min-h-screen bg-[#0B0E14] text-slate-200 font-sans pb-20 relative overflow-hidden">
    
    {/* Efeito de luz (Glow) no topo */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />
    
    <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Passo 2: O Header que criamos */}
        <Header />

        <div className="flex flex-col gap-8">
          
          {/* Passo 1: Os Cards de Resumo (Agora sem ícones para não dar erro) */}
          <section className="w-full">
            <SummaryCards transactions={txData} />
          </section>

          {/* ÁREA PRINCIPAL: Grid de 12 colunas */}
          {/* lg:grid-cols-12 significa: Em telas grandes, use 12 colunas. Senão, use 1. */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUNA DA ESQUERDA (Ocupa 8 espaços) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Gráfico */}
              <div className={islandClass}>
                 <HistoryChart transactions={txData} />
              </div>

              {/* Tabela */}
              <div className={islandClass}>
                <h2 className="text-lg font-bold text-white mb-6 ml-2">Histórico</h2>
                <TransactionTable transactions={txData} />
              </div>
            </div>

            {/* COLUNA DA DIREITA (Ocupa 4 espaços) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Pizza */}
              <div className={`${islandClass} min-h-[350px] flex flex-col justify-center`}>
                <AllocationChart transactions={txData} />
              </div>

              {/* Formulário */}
              <div className={islandClass}>
                <h2 className="text-lg font-bold text-white mb-4 ml-1">Nova Transação</h2>
                <TransactionForm />
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}