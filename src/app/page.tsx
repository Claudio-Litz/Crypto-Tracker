import { supabase } from "@/src/lib/supabase";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import SummaryCards from "./components/SummaryCards";
import AllocationChart from "./components/AllocationChart";
import HistoryChart from "./components/HistoryChart";
import Header from "./components/Header";

export const revalidate = 0;

export default async function Home() {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <div className="p-20 text-center text-red-500">Erro ao carregar dados.</div>;
  
  const txData = transactions || [];

  // Configuração Base dos Blocos Principais
  const baseBlock = "rounded-[40px] p-6 shadow-2xl border-none flex flex-col justify-center";

  // Configuração dos Títulos
  const titleClass = "text-xl font-bold text-white mb-1 text-center";
  const subTitleClass = "text-white/40 text-[10px] text-center mb-6 uppercase tracking-[0.2em] font-bold";

  return (
    <main className="min-h-screen bg-[#020202] text-slate-200 font-sans pb-24 relative selection:bg-indigo-500/30">
      
      {/* Luz de fundo suave */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[500px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[500px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 pt-8 relative z-10">
        <Header />

        <div className="flex flex-col gap-8">
          
          {/* 1. SECTION: CARDS (Topo) */}
          <section>
            <SummaryCards transactions={txData} />
          </section>

          {/* 2. SECTION: GRÁFICOS (Lado a Lado) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Gráfico de Evolução (Ocupa 8 colunas - Mais largo) */}
            <div className={`lg:col-span-8 ${baseBlock} bg-[#080b14]`}>
               <HistoryChart transactions={txData} />
            </div>

            {/* Gráfico de Pizza (Ocupa 4 colunas - Mais quadrado) */}
            <div className={`lg:col-span-4 ${baseBlock} bg-[#0f0c1f]`}>
              <div>
                <h3 className={titleClass}>Alocação</h3>
                <p className={subTitleClass}>Distribuição Atual</p>
                <div className="bg-black/20 rounded-[30px] p-2">
                   <AllocationChart transactions={txData} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. SECTION: OPERACIONAL (Formulário + Tabela) */}
          {/* Aqui atendemos seu pedido: Form na Esquerda, Tabela na Direita */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Formulário (Esquerda - 4 Colunas - Mais estreito) */}
            <div className={`lg:col-span-4 ${baseBlock} bg-[#0a0a0a]`}>
              <h2 className={titleClass}>Nova Transação</h2>
              <p className={subTitleClass}>Registrar Operação</p>
              
              {/* O Form já tem seu container interno, então só renderizamos */}
              <TransactionForm />
            </div>

            {/* Tabela (Direita - 8 Colunas - Mais largo para caber dados) */}
            <div className={`lg:col-span-8 ${baseBlock} bg-[#050505]`}>
              <div className="mb-2">
                <h2 className={titleClass}>Histórico</h2>
                <p className={subTitleClass}>Extrato Completo</p>
              </div>
              
              <TransactionTable transactions={txData} />
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}