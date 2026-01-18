'use client'; // Isso permite interatividade (clicar em botões)

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TransactionForm() {
  // Aqui guardamos o que você digita
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault(); // Evita que a página recarregue do nada
    setLoading(true);

    // Envia para o Supabase
    const { error } = await supabase.from('transactions').insert([
      {
        symbol: symbol.toLowerCase(), // Salva sempre minusculo (btc)
        amount: parseFloat(amount),   // Transforma texto em numero
        price: parseFloat(price),     // Transforma texto em numero
        type: 'buy',                  // Por enquanto, só compras
        date: new Date().toISOString()
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      alert('Investimento salvo com sucesso! 🚀');
      setSymbol(''); // Limpa o campo
      setAmount(''); // Limpa o campo
      setPrice('');  // Limpa o campo
      window.location.reload(); // Recarrega a página para mostrar o novo dado
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Adicionar Novo Aporte</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Campo Símbolo */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Moeda (ex: BTC)</label>
          <input
            type="text"
            required
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none"
            placeholder="BTC"
          />
        </div>

        {/* Campo Quantidade */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Quantidade</label>
          <input
            type="number"
            step="any"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none"
            placeholder="0.005"
          />
        </div>

        {/* Campo Preço Pago */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Preço Pago (USD)</label>
          <input
            type="number"
            step="any"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none"
            placeholder="20000.00"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        {loading ? 'Salvando...' : 'Registrar Investimento'}
      </button>
    </form>
  );
}