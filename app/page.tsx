import { supabase } from "@/lib/supabase";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import SummaryCards from "./components/SummaryCards";
import AllocationChart from "./components/AllocationChart"; // <--- Importar

export const revalidate = 0;

export default async function Home() {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-10 text-red-500">Erro: {error.message}</div>;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto"> {/* Aumentei a largura pra caber tudo */}
        <h1 className="text-4xl font-bold text-center mb-8">
          Minha Carteira Crypto 🚀
        </h1>

        {/* Resumo Financeiro */}
        <SummaryCards transactions={transactions || []} />

        {/* Área Principal: Grid de 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Coluna da Esquerda (Formulário) - Ocupa 1 espaço */}
            <div className="lg:col-span-1">
                <TransactionForm />
            </div>

            {/* Coluna da Direita (Gráfico) - Ocupa 2 espaços */}
            <div className="lg:col-span-2">
                <AllocationChart transactions={transactions || []} />
            </div>
        </div>

        {/* Tabela ocupa largura total */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Histórico de Transações</h2>
          <TransactionTable transactions={transactions || []} />
        </div>
      </div>
    </main>
  );
}