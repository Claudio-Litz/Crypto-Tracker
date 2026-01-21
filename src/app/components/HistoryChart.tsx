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
  link: 'chainlink', usdt: 'tether', xrp: 'ripple', bnb: 'binancecoin',
  ltc: 'litecoin', atom: 'cosmos', uni: 'uniswap'
};

export default function HistoryChart({ transactions }: { transactions: Transaction[] }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function buildRealHistory() {
      if (!transactions || transactions.length === 0) {
        if(isMounted) { setLoading(false); setData([]); }
        return;
      }

      // Ordenação e datas
      const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstDate = new Date(sortedTx[0].date);
      const today = new Date();
      const startTimestamp = Math.floor(firstDate.getTime() / 1000);
      const endTimestamp = Math.floor(today.getTime() / 1000) + 86400;

      const uniqueSymbols = Array.from(new Set(transactions.map(t => t.symbol.toLowerCase())));
      const priceHistoryMap: { [coinId: string]: { [date: string]: number } } = {};
      let hasApiError = false;

      // Busca dados em paralelo (Promise.all)
      const promises = uniqueSymbols.map(async (sym) => {
        const coinId = COIN_MAP[sym] || sym;
        try {
          const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${startTimestamp}&to=${endTimestamp}`;
          const res = await fetch(url);
          if (!res.ok) {
             if (res.status === 429) throw new Error('Rate Limit');
             throw new Error('Erro API');
          }
          const json = await res.json();
          if (json.prices) {
            priceHistoryMap[sym] = {};
            json.prices.forEach(([ts, price]: [number, number]) => {
              const dateKey = new Date(ts).toISOString().split('T')[0];
              priceHistoryMap[sym][dateKey] = price;
            });
          }
        } catch (err) {
          console.warn(`Falha ao buscar ${sym}`, err);
          hasApiError = true;
        }
      });

      await Promise.all(promises);

      if (isMounted) {
         // Se tudo falhou (API bloqueada), mostra erro
         if (hasApiError && Object.keys(priceHistoryMap).length === 0) {
             setErrorMsg("Gráfico temporariamente indisponível (Limite da API CoinGecko). Tente em 1 min.");
             setLoading(false);
             return;
         }

        // Reconstrói linha do tempo dia a dia
        const chartData = [];
        let currentDate = new Date(firstDate);
        const currentHoldings: { [key: string]: number } = {};

        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            // Atualiza saldo de moedas com as transações do dia
            const txsOnThisDay = sortedTx.filter(t => t.date === dateStr);
            txsOnThisDay.forEach(t => {
                const s = t.symbol.toLowerCase();
                if (!currentHoldings[s]) currentHoldings[s] = 0;
                if (t.type === 'buy') currentHoldings[s] += t.amount;
                else currentHoldings[s] -= t.amount;
            });

            // Calcula valor total no dia
            let totalValue = 0;
            Object.keys(currentHoldings).forEach(sym => {
                const amount = currentHoldings[sym];
                if (amount > 0) {
                    const historyObj = priceHistoryMap[sym] || {};
                    let price = historyObj[dateStr] || 0;
                    
                    // Fallback 1: Preço do dia anterior se hoje estiver vazio
                    if (price === 0 && Object.keys(historyObj).length > 0) {
                        const dates = Object.keys(historyObj).sort();
                        const lastDate = dates.filter(d => d <= dateStr).pop();
                        if (lastDate) price = historyObj[lastDate];
                    }
                    // Fallback 2: Preço da transação (último recurso)
                    if (price === 0) {
                         const lastTx = sortedTx.filter(t => t.symbol.toLowerCase() === sym && t.date <= dateStr).pop();
                         if(lastTx) price = lastTx.price;
                    }

                    totalValue += amount * price;
                }
            });

            chartData.push({
                date: currentDate.toLocaleDateString('pt-BR').slice(0, 5),
                fullDate: dateStr,
                value: totalValue
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        setData(chartData);
        setLoading(false);
      }
    }

    buildRealHistory();
    return () => { isMounted = false; };
  }, [transactions]);

  // Renderização de Erro com estilo
  if (errorMsg) {
      return (
        <div className="w-full h-[300px] flex flex-col items-center justify-center text-center p-6 border border-yellow-500/20 rounded-xl bg-yellow-500/5">
            <span className="text-3xl mb-2">⏳</span>
            <p className="text-yellow-500 font-bold mb-1">Aguardando API</p>
            <p className="text-gray-400 text-xs">{errorMsg}</p>
        </div>
      );
  }

  if (loading) return <div className="flex h-[300px] items-center justify-center text-blue-400 animate-pulse font-bold tracking-widest uppercase text-xs">Carregando Gráfico...</div>;
  if (data.length === 0) return <div className="flex h-[300px] items-center justify-center text-gray-500">Sem dados para exibir.</div>;

  return (
    <div className="w-full flex flex-col">
      <div className="mb-4 text-center lg:text-left pl-2">
         <h3 className="text-white font-bold text-2xl">Evolução Patrimonial</h3>
         <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Histórico de Valorização</p>
      </div>
      
      {/* SOLUÇÃO DO PROBLEMA: Altura fixa definida aqui (h-[350px]) */}
      <div className="w-full h-[350px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              tick={{fontSize: 11, fontWeight: 'bold'}}
              minTickGap={50}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
              itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
              formatter={(value: any) => [`$${value.toFixed(2)}`, 'Patrimônio']}
              labelStyle={{ color: '#94a3b8', marginBottom: '5px', textAlign: 'center' }}
            />
            
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}