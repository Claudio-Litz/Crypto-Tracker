import { supabase } from "@/lib/supabase";
import TransactionForm from "./components/TransactionForm"; // <--- Importamos a peça

export default async function Home() {
  // Busca os dados (ordenados do mais novo para o mais velho)
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-10 text-red-500">Erro: {error.message}</div>;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Minha Carteira Crypto 🚀
        </h1>

        {/* Aqui entra o nosso formulário novo */}
        <TransactionForm />

        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Histórico de Transações:</h2>
          
          {/* Mostra a lista (JSON) */}
          <pre className="bg-black p-4 rounded overflow-auto text-green-400 max-h-96">
            {JSON.stringify(transactions, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}