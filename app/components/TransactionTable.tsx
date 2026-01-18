'use client'; // Agora este componente aceita interações (cliques)

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: number;
  symbol: string;
  amount: number;
  price: number;
  type: string;
  date: string;
}

export default function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter();

  // Função para formatar dinheiro
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Função para Deletar
  const handleDelete = async (id: number) => {
    // Pergunta se o usuário tem certeza
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta transação?');
    
    if (!confirmDelete) return;

    // Manda deletar no Supabase onde o ID for igual ao ID clicado
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao deletar: ' + error.message);
    } else {
      // Recarrega a página para a linha sumir
      window.location.reload();
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400">Nenhum investimento encontrado. Comece a investir acima! 👆</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
      <table className="w-full text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
          <tr>
            <th className="px-6 py-3">Moeda</th>
            <th className="px-6 py-3">Tipo</th>
            <th className="px-6 py-3">Qtd</th>
            <th className="px-6 py-3">Preço</th>
            <th className="px-6 py-3">Total</th>
            <th className="px-6 py-3">Data</th>
            <th className="px-6 py-3 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-750">
              <td className="px-6 py-4 font-bold text-white">
                {t.symbol.toUpperCase()}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  t.type === 'buy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                  {t.type === 'buy' ? 'COMPRA' : 'VENDA'}
                </span>
              </td>
              <td className="px-6 py-4">{t.amount}</td>
              <td className="px-6 py-4 text-gray-400">{formatCurrency(t.price)}</td>
              <td className="px-6 py-4 font-medium text-white">
                {formatCurrency(t.amount * t.price)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(t.date).toLocaleDateString('pt-BR')}
              </td>
              
              {/* Botão de Excluir */}
              <td className="px-6 py-4 text-center">
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="text-red-500 hover:text-red-400 hover:bg-red-900/30 p-2 rounded transition-colors"
                  title="Excluir Transação"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}