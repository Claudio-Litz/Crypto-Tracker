'use client';

import { useEffect, useState } from 'react';

interface Transaction {
  symbol: string;
  amount: number;
  price: number;
  type: string;
}

// Pequeno dicionário para traduzir os símbolos mais comuns
// A CoinGecko usa IDs específicos, não símbolos.
const COIN_MAP: { [key: string]: string } = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  ada: 'cardano',
  doge: 'dogecoin',
  dot: 'polkadot',
  matic: 'matic-network',
  link: 'chainlink',
  usdt: 'tether',
  xrp: 'ripple',
};

export default function SummaryCards({ transactions }: { transactions: Transaction[] }) {
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // 1. Calcular Total Investido (Dinheiro que saiu do bolso)
  const totalInvested = transactions.reduce((acc, current) => {
    return current.type === 'buy' ? acc + (current.price * current.amount) : acc;
  }, 0);

  // 2. Buscar Preços Atuais na API
  useEffect(() => {
    async function fetchPrices() {
      if (transactions.length === 0) {
        setLoading(false);
        return;
      }

      // Pega os símbolos únicos da sua lista (ex: ['btc', 'eth'])
      const symbols = [...new Set(transactions.map((t) => t.symbol.toLowerCase()))];
      
      // Traduz para o nome da API (ex: ['bitcoin', 'ethereum'])
      const ids = symbols.map(s => COIN_MAP[s] || s).join(',');

      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );
        const data = await response.json();
        
        // Organiza os dados para ficar fácil de usar
        // Ex: { bitcoin: 95000, ethereum: 3000 }
        const priceMap: { [key: string]: number } = {};
        symbols.forEach(sym => {
          const id = COIN_MAP[sym] || sym;
          if (data[id]) {
            priceMap[sym] = data[id].usd;
          }
        });

        setPrices(priceMap);
      } catch (error) {
        console.error('Erro ao buscar preços:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, [transactions]);

  // 3. Calcular Saldo Atual (Quanto vale hoje)
  const currentBalance = transactions.reduce((acc, t) => {
    const currentPrice = prices[t.symbol.toLowerCase()] || 0; // Se não achar preço, usa 0
    return acc + (t.amount * currentPrice);
  }, 0);

  // 4. Calcular Lucro
  const profit = currentBalance - totalInvested;
  const isProfit = profit >= 0;

  // Formatador de Dinheiro
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Card 1: Total Investido */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
          Total Investido
        </h3>
        <p className="text-3xl font-bold text-white mt-2">
          {formatMoney(totalInvested)}
        </p>
        <p className="text-gray-500 text-xs mt-2">Custo de aquisição</p>
      </div>

      {/* Card 2: Saldo Atual (Com cotação em tempo real) */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
        <h3 className="text-blue-400 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
          Saldo Atual {loading && <span className="text-xs animate-pulse">(Atualizando...)</span>}
        </h3>
        <p className="text-3xl font-bold text-white mt-2">
          {formatMoney(currentBalance)}
        </p>
        <p className="text-gray-500 text-xs mt-2">Valor de mercado hoje</p>
      </div>

      {/* Card 3: Lucro / Prejuízo */}
      <div className={`p-6 rounded-lg border shadow-lg ${
        isProfit 
          ? 'bg-green-900/20 border-green-800' 
          : 'bg-red-900/20 border-red-800'
      }`}>
        <h3 className={`${isProfit ? 'text-green-400' : 'text-red-400'} text-sm font-medium uppercase tracking-wider`}>
          {isProfit ? 'Lucro Total 🚀' : 'Prejuízo 📉'}
        </h3>
        <p className={`text-3xl font-bold mt-2 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          {isProfit ? '+' : ''}{formatMoney(profit)}
        </p>
        <p className={`${isProfit ? 'text-green-600' : 'text-red-600'} text-xs mt-2`}>
          Variação da carteira
        </p>
      </div>
    </div>
  );
}