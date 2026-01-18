'use client';

import { supabase } from '@/src/lib/supabase';

// Função auxiliar para formatar data de forma consistente
// Isso evita o erro de "Hydration failed" entre servidor e cliente
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  // Força o formato dia/mês/ano para evitar confusão servidor/navegador
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export default function TransactionTable({ transactions }: { transactions: any[] }) {
  
  async function handleDelete(id: number) {
    if (!confirm('Apagar registro?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert('Erro ao apagar');
    else window.location.reload();
  }

  if (!transactions?.length) return <p className="text-gray-500 text-center py-4">Sem dados.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-gray-800 text-xs uppercase font-bold text-gray-400">
          <tr>
            <th className="p-3">Data</th>
            <th className="p-3">Ativo</th>
            <th className="p-3">Tipo</th>
            <th className="p-3">Qtd</th>
            <th className="p-3">Preço</th>
            <th className="p-3">Total</th>
            <th className="p-3 text-right">#</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-gray-800/50 transition-colors">
              {/* AQUI ESTAVA O ERRO: Agora usamos a função formatDate */}
              <td className="p-3">{formatDate(t.date)}</td>
              <td className="p-3 font-bold text-white uppercase">{t.symbol}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'buy' ? 'bg-green-900 text-green-300 border border-green-800' : 'bg-red-900 text-red-300 border border-red-800'}`}>
                    {t.type === 'buy' ? 'COMPRA' : 'VENDA'}
                </span>
              </td>
              <td className="p-3">{t.amount}</td>
              <td className="p-3 text-blue-300 font-mono">$ {t.price}</td>
              <td className="p-3 font-bold text-white font-mono">$ {(t.price * t.amount).toFixed(2)}</td>
              <td className="p-3 text-right">
                <button 
                  onClick={() => handleDelete(t.id)} 
                  className="text-red-500 hover:text-red-400 hover:bg-red-900/20 p-2 rounded transition-all"
                  title="Excluir Transação"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}