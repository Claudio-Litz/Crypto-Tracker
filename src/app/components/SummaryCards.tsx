'use client';
import { useEffect, useState } from 'react';

// Mapeamento para API do CoinGecko
const COIN_MAP: { [key: string]: string } = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana', ada: 'cardano',
  doge: 'dogecoin', dot: 'polkadot', matic: 'matic-network',
  link: 'chainlink', usdt: 'tether', xrp: 'ripple', bnb: 'binancecoin'
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export default function SummaryCards({ transactions }: { transactions: any[] }) {
  const [balance, setBalance] = useState(0); // Valor atual de mercado
  const [invested, setInvested] = useState(0); // Total gasto em compras
  const [profit, setProfit] = useState(0);     // Lucro (Saldo + Vendas - Compras)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateData() {
      if (!transactions || transactions.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Calcular Holdings (Quantidade de moedas) e Fluxo de Caixa
      const holdings: { [key: string]: number } = {};
      let totalBuys = 0; // Tudo que saiu do bolso
      let totalSells = 0; // Tudo que voltou pro bolso

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

      // 2. Buscar preços atuais apenas das moedas que você possui saldo > 0
      const activeSymbols = Object.keys(holdings).filter(sym => holdings[sym] > 0);
      let currentPortfolioValue = 0;

      if (activeSymbols.length > 0) {
        const ids = activeSymbols.map(sym => COIN_MAP[sym] || sym).join(',');
        
        try {
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
          const prices = await res.json();

          // 3. Calcular valor atual do portfólio
          activeSymbols.forEach(sym => {
            const coinId = COIN_MAP[sym] || sym;
            const currentPrice = prices[coinId]?.usd || 0;
            currentPortfolioValue += (holdings[sym] * currentPrice);
          });
        } catch (error) {
          console.error("Erro ao atualizar preços no card:", error);
          // Fallback: Se a API falhar, o saldo fica zerado ou mantém o anterior para não quebrar
        }
      }

      setBalance(currentPortfolioValue);
      setInvested(totalBuys);
      // Lucro Real = (O que tenho hoje + O que já saquei) - (O que gastei)
      setProfit((currentPortfolioValue + totalSells) - totalBuys);
      setLoading(false);
    }

    calculateData();
  }, [transactions]);

  // Mantive o estilo que você já tinha ou o que definimos antes, sem inventar moda visual nova
  const cardStyle = "flex flex-col justify-center items-center text-center p-6 rounded-3xl bg-[#1A1F2E] shadow-lg min-h-[120px] border border-white/5";

  if (loading) return <div className="w-full text-center py-10 text-gray-500">Calculando patrimônio...</div>;

  return (
    // MUDANÇA AQUI: Tirei o "grid-cols-1 md:" e deixei fixo "grid-cols-3"
    // Isso obriga a ficar sempre na mesma linha horizontal, dividida em 3 partes
    <div className="grid grid-cols-3 gap-6 w-full">
      
      {/* Saldo Atual */}
      <div className={cardStyle}>
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Saldo Atual</p>
        <p className="text-3xl font-extrabold text-blue-50">{formatCurrency(balance)}</p>
      </div>

      {/* Total Aportado */}
      <div className={cardStyle}>
        <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">Total Aportado</p>
        <p className="text-3xl font-extrabold text-purple-50">{formatCurrency(invested)}</p>
      </div>

      {/* Resultado Geral */}
      <div className={cardStyle}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          Resultado Geral
        </p>
        <div className="flex items-end gap-2">
          <p className={`text-3xl font-extrabold ${profit >= 0 ? 'text-emerald-50' : 'text-rose-50'}`}>
            {profit > 0 ? '+' : ''}{formatCurrency(profit)}
          </p>
        </div>
      </div>
    </div>
  );
}