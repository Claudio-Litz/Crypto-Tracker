'use client';
import { useEffect, useState } from 'react';

const COIN_MAP: { [key: string]: string } = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana', ada: 'cardano',
  doge: 'dogecoin', dot: 'polkadot', matic: 'matic-network',
  link: 'chainlink', usdt: 'tether', xrp: 'ripple', bnb: 'binancecoin'
};

const formatCurrency = (value: number) => {
  // Configura para compactar números muito grandes se necessário (ex: 1.2M), 
  // mas mantém padrão para valores normais.
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export default function SummaryCards({ transactions }: { transactions: any[] }) {
  const [balance, setBalance] = useState(0);
  const [invested, setInvested] = useState(0);
  const [profit, setProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateData() {
      if (!transactions || transactions.length === 0) {
        setLoading(false);
        return;
      }

      const holdings: { [key: string]: number } = {};
      let totalBuys = 0;
      let totalSells = 0;

      transactions.forEach(t => {
        const sym = t.symbol.toLowerCase();
        if (t.type === 'buy') {
          holdings[sym] = (holdings[sym] || 0) + t.amount;
          totalBuys += (t.amount * t.price);
        } else {
          holdings[sym] = (holdings[sym] || 0) - t.amount;
          totalSells += (t.amount * t.price);
        }
      });

      const activeSymbols = Object.keys(holdings).filter(sym => holdings[sym] > 0);
      let currentPortfolioValue = 0;

      if (activeSymbols.length > 0) {
        const ids = activeSymbols.map(sym => COIN_MAP[sym] || sym).join(',');
        try {
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
          const prices = await res.json();
          activeSymbols.forEach(sym => {
            const coinId = COIN_MAP[sym] || sym;
            const currentPrice = prices[coinId]?.usd || 0;
            currentPortfolioValue += (holdings[sym] * currentPrice);
          });
        } catch (error) {
          console.error("Erro cards:", error);
        }
      }

      setBalance(currentPortfolioValue);
      setInvested(totalBuys);
      setProfit((currentPortfolioValue + totalSells) - totalBuys);
      setLoading(false);
    }

    calculateData();
  }, [transactions]);

  // Aumentei o min-h para 150px para dar mais ar para as letras grandes
  const baseCardStyle = "flex flex-col justify-center items-center text-center p-4 rounded-[32px] shadow-lg min-h-[150px]";

  // Classes de texto ajustadas:
  // Título: text-xs (celular) -> text-sm (telas maiores)
  // Valor: text-xl (celular muito pequeno) -> text-2xl (celular normal) -> text-4xl ou 5xl (desktop)
  const labelClass = "text-xs md:text-sm font-bold uppercase tracking-widest mb-2 opacity-80";
  const valueClass = "text-2xl md:text-3xl lg:text-5xl font-black tracking-tight";

  if (loading) return <div className="w-full text-center py-4 text-gray-500">...</div>;

  return (
    <div className="grid grid-cols-3 gap-6 w-full">
      
      {/* Saldo Atual */}
      <div className={`${baseCardStyle} bg-[#172554]`}>
        <p className={`${labelClass} text-blue-200`}>Saldo Atual</p>
        <p className={`${valueClass} text-white`}>{formatCurrency(balance)}</p>
      </div>

      {/* Total Aportado */}
      <div className={`${baseCardStyle} bg-[#2e1065]`}>
        <p className={`${labelClass} text-purple-200`}>Aportado</p>
        <p className={`${valueClass} text-white`}>{formatCurrency(invested)}</p>
      </div>

      {/* Lucro/Prejuízo */}
      <div className={`${baseCardStyle} ${profit >= 0 ? 'bg-[#064e3b]' : 'bg-[#881337]'}`}>
        <p className={`${labelClass} ${profit >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
          Lucro/Prejuízo
        </p>
        <p className={`${valueClass} text-white`}>
          {profit > 0 ? '+' : ''}{formatCurrency(profit)}
        </p>
      </div>
    </div>
  );
}