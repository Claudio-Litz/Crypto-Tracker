import { supabase } from "@/lib/supabase";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import SummaryCards from "./components/SummaryCards"; // <--- Importação Nova

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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Minha Carteira Crypto 🚀
        </h1>

        {/* Aqui entra o Resumo Financeiro */}
        <SummaryCards transactions={transactions || []} />

        <div className="grid grid-cols-1 gap-8">
            {/* O Formulário de adicionar nova compra */}
            <TransactionForm />

            {/* A Tabela com o histórico */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Histórico de Transações</h2>
              <TransactionTable transactions={transactions || []} />
            </div>
        </div>
      </div>
    </main>
  );
}