import { supabase } from "@/src/lib/supabase";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import SummaryCards from "./components/SummaryCards";
import AllocationChart from "./components/AllocationChart";
import HistoryChart from "./components/HistoryChart";

export const revalidate = 0;

export default async function Home() {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <div className="p-10 text-red-500">Erro no Banco de Dados</div>;

  return (
    <main className="min-h-screen p-6 md:p-10 bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Wallet Pro
            </h1>
            <p className="text-gray-400">Gerenciador de Portfólio Cripto</p>
        </div>

        <SummaryCards transactions={transactions || []} />

        <div>
           <HistoryChart transactions={transactions || []} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <TransactionForm />
            </div>
            <div className="md:col-span-2">
                <AllocationChart transactions={transactions || []} />
            </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Histórico de Transações</h2>
          <TransactionTable transactions={transactions || []} />
        </div>

      </div>
    </main>
  );
}