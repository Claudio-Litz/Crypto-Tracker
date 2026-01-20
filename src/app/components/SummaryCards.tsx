'use client';
import { useEffect, useState } from 'react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export default function SummaryCards({ transactions }: { transactions: any[] }) {
  const [balance, setBalance] = useState(0);
  const [invested, setInvested] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    let current = 0;
    let input = 0;
    transactions.forEach(t => {
        if(t.type === 'buy') {
            current += (t.amount * t.price);
            input += (t.amount * t.price);
        } else {
            current -= (t.amount * t.price);
        }
    });
    setBalance(current > 0 ? current : 0);
    setInvested(input);
    setProfit(current - input);
  }, [transactions]);

  // Estilo unificado para os cards (Sem bordas, fundo suave)
  const cardStyle = "flex flex-col justify-center p-6 rounded-3xl bg-[#1A1F2E] shadow-lg min-h-[120px]";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      
      {/* Saldo */}
      <div className={cardStyle}>
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Saldo Atual</p>
        <p className="text-3xl font-extrabold text-blue-50">{formatCurrency(balance)}</p>
      </div>

      {/* Investido */}
      <div className={cardStyle}>
        <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">Total Investido</p>
        <p className="text-3xl font-extrabold text-purple-50">{formatCurrency(invested)}</p>
      </div>

      {/* Lucro */}
      <div className={cardStyle}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          Resultado
        </p>
        <p className={`text-3xl font-extrabold ${profit >= 0 ? 'text-emerald-50' : 'text-rose-50'}`}>
          {profit > 0 ? '+' : ''}{formatCurrency(profit)}
        </p>
      </div>
    </div>
  );
}