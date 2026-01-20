'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';

const COIN_MAP: { [key: string]: string } = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana', ada: 'cardano',
  doge: 'dogecoin', dot: 'polkadot', matic: 'matic-network',
  link: 'chainlink', usdt: 'tether', xrp: 'ripple', bnb: 'binancecoin'
};

export default function TransactionForm() {
  const [type, setType] = useState('buy');
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState<string>('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  useEffect(() => {
    const fetchPrice = async () => {
      if (symbol.length < 3 || !date) return;
      setFetchingPrice(true);
      setPrice('');

      try {
        const cleanSymbol = symbol.toLowerCase().trim();
        const coinId = COIN_MAP[cleanSymbol] || cleanSymbol;
        
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        const data = await res.json();
        
        if (data[coinId]?.usd) {
          setPrice(data[coinId].usd.toString());
        }
      } catch (error) {
        console.error('Erro ao buscar preço', error);
      } finally {
        setFetchingPrice(false);
      }
    };

    const timer = setTimeout(fetchPrice, 800);
    return () => clearTimeout(timer);
  }, [symbol, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !amount || !symbol) return;
    setLoading(true);

    const { error } = await supabase.from('transactions').insert([{
      symbol: symbol.toUpperCase(),
      amount: parseFloat(amount),
      price: parseFloat(price),
      date: date, // YYYY-MM-DD
      type
    }]);

    setLoading(false);
    if (error) alert('Erro ao salvar!');
    else window.location.reload();
  };

  // Estilo comum para os inputs para garantir consistência visual
  const inputClass = "w-full p-3 rounded-xl bg-[#1A1F2E] border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium";
  const labelClass = "block text-xs font-bold text-gray-400 mb-1.5 ml-1";

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      
      {/* Seletor de Tipo (Compra/Venda) */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-[#1A1F2E] rounded-xl border border-gray-700">
        <button
          type="button"
          onClick={() => setType('buy')}
          className={`py-2 rounded-lg text-sm font-bold transition-all ${type === 'buy' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          Comprar
        </button>
        <button
          type="button"
          onClick={() => setType('sell')}
          className={`py-2 rounded-lg text-sm font-bold transition-all ${type === 'sell' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          Vender
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Data</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Moeda (Ex: BTC)</label>
            <input type="text" required value={symbol} onChange={(e) => setSymbol(e.target.value)} className={`${inputClass} uppercase`} placeholder="BTC" />
          </div>
          <div>
            <label className={labelClass}>Quantidade</label>
            <input type="number" step="any" required value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} placeholder="0.00" />
          </div>
        </div>

        {/* Campo de Preço com Feedback Visual */}
        <div className={`p-4 rounded-xl border flex justify-between items-center transition-colors ${price ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[#1A1F2E] border-gray-700'}`}>
          <span className="text-sm text-gray-400 font-medium">Preço Unitário:</span>
          {fetchingPrice ? (
             <span className="text-yellow-500 text-xs font-bold animate-pulse">Buscando...</span>
          ) : (
             <span className="text-blue-300 font-mono font-bold text-lg">$ {price || '---'}</span>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading || !price} 
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
      >
        {loading ? 'Salvando...' : type === 'buy' ? 'Confirmar Compra' : 'Confirmar Venda'}
      </button>
    </form>
  );
}