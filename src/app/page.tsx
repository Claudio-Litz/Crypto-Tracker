import { supabase } from "@/src/lib/supabase";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import SummaryCards from "./components/SummaryCards";
import AllocationChart from "./components/AllocationChart";
import HistoryChart from "./components/HistoryChart";
import Header from "./components/Header";

// Força atualização dos dados a cada acesso
export const revalidate = 0;

export default async function Home() {
  // Busca dados ordenados
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <div className="p-20 text-center text-red-500">Erro ao carregar dados.</div>;
  
  const txData = transactions || [];

  // Estilo dos Cards (Vidro translúcido)
  const islandClass = "bg-[#1A1F2E]/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/5 h-full";

  return (
    <main className="min-h-screen bg-[#0B0E14] text-slate-200 font-sans pb-20 relative overflow-hidden">
      
      {/* Luz de fundo (Glow) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <Header />

        <div className="flex flex-col gap-8">
          
          {/* 1. Resumo do Patrimônio (Cards Superiores) */}
          <section className="w-full">
            <SummaryCards transactions={txData} />
          </section>

          {/* 2. Gráfico de Evolução (Largura Total) */}
          <section className={islandClass}>
             <HistoryChart transactions={txData} />
          </section>

          {/* 3. AQUI ESTÁ A MUDANÇA: GRID LADO A LADO */}
          {/* md:grid-cols-2 garante que em notebooks e monitores eles fiquem lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            {/* Bloco Esquerda: Gráfico de Pizza */}
            <div className={islandClass}>
              <h3 className="text-lg font-bold text-white mb-4 ml-2 border-l-4 border-purple-500 pl-3">
                Alocação de Ativos
              </h3>
              <div className="flex items-center justify-center min-h-[400px]">
                <AllocationChart transactions={txData} />
              </div>
            </div>

            {/* Bloco Direita: Formulário */}
            <div className={islandClass}>
              <h2 className="text-lg font-bold text-white mb-6 ml-2 border-l-4 border-blue-500 pl-3">
                Nova Transação
              </h2>
              <TransactionForm />
            </div>

          </div>

          {/* 4. Tabela de Histórico (Fica embaixo ocupando tudo) */}
          <section className={islandClass}>
            <h2 className="text-lg font-bold text-white mb-6 ml-2 border-l-4 border-emerald-500 pl-3">
              Histórico Completo
            </h2>
            <TransactionTable transactions={txData} />
          </section>

        </div>
      </div>
    </main>
  );
}