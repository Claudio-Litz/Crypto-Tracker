'use client';

import { supabase } from '@/src/lib/supabase';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export default function TransactionTable({ transactions }: { transactions: any[] }) {
  
  async function handleDelete(id: number) {
    if (!confirm('Apagar?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert('Erro');
    else window.location.reload();
  }

  if (!transactions?.length) return <p className="text-slate-500 py-4 text-center">Nenhuma transação encontrada.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            <th className="pb-4 pl-4">Data</th>
            <th className="pb-4">Ativo</th>
            <th className="pb-4">Tipo</th>
            <th className="pb-4">Valor</th>
            <th className="pb-4 text-right pr-4">Ação</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            // AQUI: Fundo sutil para cada linha, cantos redondos, SEM borda branca
            <tr key={t.id} className="bg-[#151925] hover:bg-[#12151f] transition-colors group">
              <td className="py-4 pl-4 rounded-l-xl text-slate-400">{formatDate(t.date)}</td>
              <td className="py-4 font-bold text-slate-200">
                {t.symbol.toUpperCase()}
              </td>
              <td className="py-4">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                  t.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                    {t.type === 'buy' ? 'Compra' : 'Venda'}
                </span>
              </td>
              <td className="py-4 text-slate-200 font-medium">
                $ {(t.price * t.amount).toFixed(2)}
              </td>
              <td className="py-4 rounded-r-xl text-right pr-4">
                <button 
                  onClick={() => handleDelete(t.id)} 
                  className="text-slate-600 hover:text-rose-400 transition-colors"
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