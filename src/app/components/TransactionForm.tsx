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
        
        // Busca preço simples na CoinGecko
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        const data = await res.json();

        if (data[coinId]?.usd) {
            setPrice(data[coinId].usd.toFixed(2));
        }
      } catch (error) {
        console.error("Erro ao buscar preço", error);
      } finally {
        setFetchingPrice(false);
      }
    };

    const t = setTimeout(fetchPrice, 1000); 
    return () => clearTimeout(t);
  }, [symbol, date]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!price) return;
    setLoading(true);

    const { error } = await supabase.from('transactions').insert([
      {
        symbol: symbol.toUpperCase().trim(),
        amount: parseFloat(amount),
        price: parseFloat(price),
        type: type,
        date: new Date(date).toISOString(),
        category: 'crypto' // Força sempre crypto
      },
    ]);

    setLoading(false);
    if (error) alert(error.message);
    else window.location.reload();
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
        <h3 className="text-xl font-bold text-white mb-4">Nova Transação</h3>

        <div className="flex gap-2 mb-4">
          <button type="button" onClick={() => setType('buy')} className={`flex-1 py-2 font-bold rounded ${type === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>COMPRAR</button>
          <button type="button" onClick={() => setType('sell')} className={`flex-1 py-2 font-bold rounded ${type === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}>VENDER</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-bold">Data</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:border-blue-500 outline-none" />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold">Moeda (ex: BTC, ETH)</label>
            <input type="text" required value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:border-blue-500 outline-none uppercase font-bold" placeholder="BTC" />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold">Quantidade</label>
            <input type="number" step="any" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:border-blue-500 outline-none" />
          </div>

          <div className={`p-3 rounded flex justify-between items-center ${price ? 'bg-blue-900/30 border border-blue-500/50' : 'bg-gray-900'}`}>
            <span className="text-xs text-gray-400">Preço USD:</span>
            {fetchingPrice ? <span className="text-yellow-500 text-xs animate-pulse">Buscando...</span> : <span className="text-blue-300 font-mono font-bold">$ {price || '---'}</span>}
          </div>
        </div>

        <button type="submit" disabled={loading || !price} className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Salvando...' : 'ADICIONAR'}
        </button>
      </form>
    </div>
  );
}