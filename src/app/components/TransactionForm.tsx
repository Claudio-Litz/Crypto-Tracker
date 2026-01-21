'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';

const COIN_MAP: { [key: string]: string } = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana', ada: 'cardano',
  doge: 'dogecoin', dot: 'polkadot', matic: 'matic-network',
  link: 'chainlink', usdt: 'tether', xrp: 'ripple', bnb: 'binancecoin',
  ltc: 'litecoin', atom: 'cosmos', uni: 'uniswap'
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

  // Busca de preço automática
  useEffect(() => {
    const fetchPrice = async () => {
      if (symbol.length < 3 || !date) return;
      setFetchingPrice(true);
      setPrice('');

      try {
        const cleanSymbol = symbol.toLowerCase().trim();
        const coinId = COIN_MAP[cleanSymbol] || cleanSymbol;
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        if (!res.ok) throw new Error('Erro API');
        const data = await res.json();
        const foundPrice = data[coinId]?.usd;
        if (foundPrice) setPrice(foundPrice.toString());
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingPrice(false);
      }
    };

    const timeoutId = setTimeout(() => { if(symbol) fetchPrice(); }, 800);
    return () => clearTimeout(timeoutId);
  }, [symbol, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!price || !symbol || !amount) return;
    setLoading(true);

    const { error } = await supabase.from('transactions').insert({
      type, symbol: symbol.toLowerCase(), amount: parseFloat(amount), price: parseFloat(price), date
    });

    setLoading(false);
    if (error) alert('Erro ao salvar!');
    else {
      setSymbol(''); setAmount(''); setPrice('');
      window.location.reload();
    }
  }

  // Estilos
  const inputClass = "w-full bg-[#0a0a0a] text-white p-3.5 rounded-xl border border-[#222] focus:border-blue-500/50 outline-none transition-all font-bold text-sm placeholder-gray-600 text-center";
  const labelClass = "block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide text-center";

  return (
    // CONTAINER PRINCIPAL: 
    // - overflow-hidden: Corta os botões quadrados para encaixar no arredondado
    // - flex-col: Para empilhar botões em cima e form embaixo
    <div className="w-full bg-[#161616] rounded-[24px] shadow-2xl border border-white/5 mx-auto overflow-hidden flex flex-col">
      
      {/* ÁREA DOS BOTÕES (Topo) */}
      {/* w-full e sem padding para encostar nas bordas */}
      <div className="flex w-full h-16">
        <button 
          type="button" 
          onClick={() => setType('buy')} 
          className={`flex-1 text-sm font-black uppercase tracking-widest transition-all duration-300
            ${type === 'buy' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-[#0f0f0f] text-gray-600 hover:text-gray-400 border-b border-r border-[#222]'
            }`}
        >
          Compra
        </button>
        
        <button 
          type="button" 
          onClick={() => setType('sell')} 
          className={`flex-1 text-sm font-black uppercase tracking-widest transition-all duration-300
            ${type === 'sell' 
              ? 'bg-rose-600 text-white' 
              : 'bg-[#0f0f0f] text-gray-600 hover:text-gray-400 border-b border-l border-[#222]'
            }`}
        >
          Venda
        </button>
      </div>

      {/* ÁREA DO FORMULÁRIO (Corpo) */}
      {/* Aqui colocamos o padding (p-6) para o conteúdo não colar na borda */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 flex flex-col justify-center h-full">
        
        <div>
          <label className={labelClass}>Data</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} text-gray-400`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ativo</label>
            <input type="text" required value={symbol} onChange={(e) => setSymbol(e.target.value)} className={`${inputClass} uppercase`} placeholder="BTC" />
          </div>
          <div>
            <label className={labelClass}>Quantia</label>
            <input type="number" step="any" required value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} placeholder="0.00" />
          </div>
        </div>

        {/* Preço */}
        <div className="flex justify-between items-center px-4 py-3 bg-[#0a0a0a] rounded-xl border border-[#222]">
           <span className="text-[10px] text-gray-500 font-bold uppercase">Cotação:</span>
           {fetchingPrice ? <span className="text-yellow-600 text-xs animate-pulse font-bold">...</span> : <span className="text-blue-400 font-mono font-bold text-lg">{price ? `$${price}` : '-'}</span>}
        </div>

        <button type="submit" disabled={loading || !price} className={`w-full py-4 font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-[0.15em] text-xs mt-2 text-white
          ${type === 'buy' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'}
        `}>
          {loading ? 'Processando...' : 'Confirmar'}
        </button>
      </form>
    </div>
  );
}