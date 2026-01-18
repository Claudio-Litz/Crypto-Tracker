import { supabase } from "@/lib/supabase";

export default async function Home() {
  // Isso aqui vai no banco de dados e busca tudo da tabela 'transactions'
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*');

  // Se der erro, mostra na tela
  if (error) {
    return <div className="p-10 text-red-500">Erro: {error.message}</div>;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold text-center mb-8">
        Minha Carteira Crypto 🚀
      </h1>

      <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Teste de Conexão:</h2>
        
        {/* Aqui mostramos os dados crus que vieram do banco */}
        <pre className="bg-black p-4 rounded overflow-auto text-green-400">
          {JSON.stringify(transactions, null, 2)}
        </pre>
        
        <p className="mt-4 text-center text-gray-400">
          Se você está vendo um código verde acima com "bitcoin", parabéns! O banco está conectado.
        </p>
      </div>
    </main>
  );
}