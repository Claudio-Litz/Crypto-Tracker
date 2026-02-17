'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Transaction {
  symbol: string;
  amount: number;
  price: number;
  date: string;
  type: string;
}

const COIN_MAP: { [key: string]: string } = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana', ada: 'cardano',
  doge: 'dogecoin', dot: 'polkadot', matic: 'matic-network',
  link: 'chainlink', usdt: 'tether', xrp: 'ripple', bnb: 'binancecoin'
};

export default function HistoryChart({ transactions }: { transactions: Transaction[] }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function buildRealHistory() {
      if (!transactions || transactions.length === 0) {
        if(isMounted) { setLoading(false); setData([]); }
        return;
      }

      const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstDate = new Date(sortedTx[0].date);
      const today = new Date();
      const startTimestamp = Math.floor(firstDate.getTime() / 1000);
      const endTimestamp = Math.floor(today.getTime() / 1000) + 86400;

      const uniqueSymbols = Array.from(new Set(transactions.map(t => t.symbol.toLowerCase())));
      const priceHistoryMap: { [coinId: string]: { [date: string]: number } } = {};

      // Buscando dados
      await Promise.all(uniqueSymbols.map(async (sym) => {
        const coinId = COIN_MAP[sym] || sym;
        try {
          const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${startTimestamp}&to=${endTimestamp}`;
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            if (json.prices) {
              priceHistoryMap[sym] = {};
              json.prices.forEach(([ts, price]: [number, number]) => {
                const dateKey = new Date(ts).toISOString().split('T')[0];
                priceHistoryMap[sym][dateKey] = price;
              });
            }
          }
        } catch (err) {
          console.warn(`Erro API para ${sym}`);
        }
      }));

      if (isMounted) {
        const chartData = [];
        let currentDate = new Date(firstDate);
        const currentHoldings: { [key: string]: number } = {};

        // Loop dia-a-dia para construir a curva
        while (currentDate <= today) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
          sortedTx.filter(t => t.date === dateStr).forEach(t => {
            const s = t.symbol.toLowerCase();
            if (!currentHoldings[s]) currentHoldings[s] = 0;
            if (t.type === 'buy') currentHoldings[s] += t.amount;
            else currentHoldings[s] -= t.amount;
          });

          let totalValue = 0;
          Object.keys(currentHoldings).forEach(sym => {
            const amount = currentHoldings[sym];
            if (amount > 0) {
              // 1. Tenta pegar preço da API para aquele dia
              let price = (priceHistoryMap[sym] && priceHistoryMap[sym][dateStr]);
              
              // 2. Se falhar, pega o preço da última transação registrada como fallback
              if (!price) {
                const lastTx = sortedTx.filter(t => t.symbol.toLowerCase() === sym && t.date <= dateStr).pop();
                price = lastTx ? lastTx.price : 0;
              }
              
              totalValue += amount * price;
            }
          });

          chartData.push({
            date: currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: totalValue
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Se houver apenas 1 ponto no gráfico, o Recharts não desenha a linha.
        // Duplicamos o ponto para criar uma linha reta se for o primeiro dia de investimento.
        if (chartData.length === 1) {
          chartData.push({ ...chartData[0], date: 'Hoje' });
        }

        setData(chartData);
        setLoading(false);
      }
    }

    buildRealHistory();
    return () => { isMounted = false; };
  }, [transactions]);

  if (loading) return (
    <div className="flex flex-col w-full h-[280px] items-center justify-center text-blue-400 animate-pulse text-xs font-bold uppercase tracking-widest">
      Carregando Gráfico...
    </div>
  );

  return (
    <div className="w-full flex flex-col">
      <div className="mb-4 text-center lg:text-left">
         <h3 className="text-white font-bold text-lg sm:text-xl">Evolução Patrimonial</h3>
         <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Histórico de Valorização</p>
      </div>
      
      {/* THE FIX: Hardcoded inline style to prevent -1px rendering bug in Recharts */}
      <div className="w-full" style={{ height: 280, minHeight: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              tick={{fontSize: 10}} 
              minTickGap={30}
              axisLine={false} 
              tickLine={false} 
              dy={10} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}
              itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
              formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Patrimônio']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={3} 
              fill="url(#colorValue)" 
              activeDot={{ r: 6, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}