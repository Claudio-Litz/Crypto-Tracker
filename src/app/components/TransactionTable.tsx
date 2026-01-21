'use client';

import { supabase } from '@/src/lib/supabase';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export default function TransactionTable({ transactions }: { transactions: any[] }) {
  
  async function handleDelete(id: number) {
    if (!confirm('Excluir registro permanentemente?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) window.location.reload();
  }

  if (!transactions?.length) return <p className="text-white/20 text-sm py-10 text-center uppercase tracking-widest">Sem registros.</p>;

  return (
    <div className="w-full bg-[#151515] rounded-[24px] p-4 border border-white/5 shadow-inner">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          
          <thead className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider">
            <tr>
              <th className="pb-2 text-center">Data</th>
              <th className="pb-2 text-center">Ativo</th>
              <th className="pb-2 text-center">Tipo</th>
              <th className="pb-2 text-center">Valor Total</th>
              <th className="pb-2 text-center w-12"></th>
            </tr>
          </thead>

          <tbody className="text-gray-200">
            {transactions.map((t) => (
              <tr key={t.id} className="bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all group shadow-sm rounded-xl">
                
                {/* Data - Fonte maior */}
                <td className="py-5 px-4 text-center rounded-l-xl font-medium text-sm md:text-base text-gray-400">
                  {formatDate(t.date).slice(0,5)}
                </td>
                
                {/* Ativo - Fonte maior e destaque */}
                <td className="py-5 px-4 text-center font-black text-sm md:text-base text-white">
                    {t.symbol.toUpperCase()}
                </td>
                
                <td className="py-5 px-4 text-center">
                   <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${t.type === 'buy' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20' : 'bg-rose-900/20 text-rose-400 border-rose-500/20'}`}>
                      {t.type === 'buy' ? 'Compra' : 'Venda'}
                   </span>
                </td>
                
                <td className="py-5 px-4 text-center font-mono font-bold text-sm md:text-base text-gray-300">
                  ${(t.price * t.amount).toFixed(2)}
                </td>
                
                <td className="py-5 px-4 text-center rounded-r-xl">
                  <button onClick={() => handleDelete(t.id)} className="text-gray-600 hover:text-red-500 transition-colors p-2" title="Excluir">
                    ✕
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}