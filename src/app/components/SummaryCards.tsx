'use client';

import { useEffect, useState } from 'react';

interface Transaction {
  symbol: string;
  amount: number;
  price: number;
  type: string;
}

const COIN_MAP: { [key: string]: string } = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana', ada: 'cardano',
  doge: 'dogecoin', dot: 'polkadot', matic: 'matic-network',
  link: 'chainlink', usdt: 'tether', xrp: 'ripple',
};

export default function SummaryCards({ transactions }: { transactions: Transaction[] }) {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateFinances() {
      if (transactions.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Calcular Saldo de Moedas (Holdings) e Total Investido (Cash Outflow)
      const holdings: { [key: string]: number } = {};
      let investedSum = 0; // Dinheiro que saiu do bolso
      let soldSum = 0;     // Dinheiro que voltou pro bolso (Vendas)

      transactions.forEach((t) => {
        const sym = t.symbol.toLowerCase();
        
        if (!holdings[sym]) holdings[sym] = 0;

        if (t.type === 'buy') {
          holdings[sym] += t.amount;
          investedSum += (t.amount * t.price);
        } else {
          holdings[sym] -= t.amount;
          soldSum += (t.amount * t.price); // Cash In
        }
      });

      // 2. Buscar preço ATUAL das moedas que você ainda tem
      const uniqueSymbols = Object.keys(holdings).filter(sym => holdings[sym] > 0);
      let currentPortfolioValue = 0;

      if (uniqueSymbols.length > 0) {
        try {
           // Mapeia símbolos para IDs da API
           const ids = uniqueSymbols.map(s => COIN_MAP[s] || s).join(',');
           
           const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
           const prices = await res.json();

           // Calcula quanto valem suas moedas HOJE
           uniqueSymbols.forEach(sym => {
             const id = COIN_MAP[sym] || sym;
             const price = prices[id]?.usd || 0;
             currentPortfolioValue += (holdings[sym] * price);
           });

        } catch (error) {
          console.error("Erro ao atualizar preços atuais", error);
        }
      }

      // 3. Atualizar Estados
      setCurrentBalance(currentPortfolioValue);
      setTotalInvested(investedSum);
      
      // Lucro = (O que eu tenho hoje + O que eu já embolsei com vendas) - O que gastei comprando
      const profit = (currentPortfolioValue + soldSum) - investedSum;
      setTotalProfit(profit);
      
      setLoading(false);
    }

    calculateFinances();
  }, [transactions]);

  const formatCurrency = (val: number) => 
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  if (loading) return <div className="text-gray-400 animate-pulse">Calculando patrimônio...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* CARD 1: Saldo Atual (Quanto suas moedas valem AGORA) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-gray-900 border border-blue-500/30 backdrop-blur shadow-lg">
        <h3 className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-2">Saldo Atual (Holdings)</h3>
        <p className="text-3xl font-bold text-white">
          {formatCurrency(currentBalance)}
        </p>
      </div>

      {/* CARD 2: Total Aportado (Quanto saiu do seu bolso em compras) */}
      <div className="p-6 rounded-2xl bg-gray-800/40 border border-gray-700 backdrop-blur shadow-lg">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Aportado</h3>
        <p className="text-3xl font-bold text-gray-200">
          {formatCurrency(totalInvested)}
        </p>
      </div>

      {/* CARD 3: Lucro/Prejuízo Líquido */}
      <div className={`p-6 rounded-2xl border backdrop-blur shadow-lg ${totalProfit >= 0 ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
        <h3 className={`${totalProfit >= 0 ? 'text-green-300' : 'text-red-300'} text-sm font-medium uppercase tracking-wider mb-2`}>
          Resultado Líquido
        </h3>
        <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
        </p>
        <span className="text-xs text-gray-500 mt-1 block">
           (Saldo Atual + Vendas) - Aportes
        </span>
      </div>
    </div>
  );
}