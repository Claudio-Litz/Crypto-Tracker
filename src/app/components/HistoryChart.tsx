'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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
  link: 'chainlink', usdt: 'tether', xrp: 'ripple',
};

export default function HistoryChart({ transactions }: { transactions: Transaction[] }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function buildHistory() {
      if (transactions.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Configurar datas
      const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const startDate = new Date(sortedTx[0].date);
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(Date.now() / 1000);

      const uniqueSymbols = [...new Set(transactions.map(t => t.symbol.toLowerCase()))];
      const historicalPrices: { [key: string]: number[][] } = {};

      try {
        // MUDANÇA AQUI: Loop "For" em vez de map/Promise.all para controlar a velocidade
        for (const sym of uniqueSymbols) {
          const id = COIN_MAP[sym] || sym;
          
          try {
            const res = await fetch(
              `https://api.coingecko.com/api/v3/coins/${id}/market_chart/range?vs_currency=usd&from=${startTimestamp}&to=${endTimestamp}`
            );
            
            if (!res.ok) {
                console.warn(`Erro ao buscar ${sym}: ${res.status}`);
                continue; // Pula essa moeda se der erro, mas não quebra tudo
            }

            const json = await res.json();
            if (json.prices) {
              historicalPrices[sym] = json.prices;
            }

            // PAUSA ESTRATÉGICA: Espera 1.5 segundos entre cada pedido para não ser bloqueado
            await new Promise(resolve => setTimeout(resolve, 1500));

          } catch (err) {
            console.error(`Falha na conexão para ${sym}`, err);
          }
        }

        // Se não conseguiu pegar dados de NENHUMA moeda (bloqueio total)
        const timeReference = Object.values(historicalPrices)[0];
        if (!timeReference) {
          setErrorMsg('API sobrecarregada. Aguarde uns minutos.');
          setLoading(false);
          return;
        }

        // 4. Montar o gráfico (igual ao anterior)
        const chartPoints: any[] = [];
        
        timeReference.forEach(([timestamp]) => {
          let totalPortfolioValue = 0;
          const pointDate = new Date(timestamp);

          uniqueSymbols.forEach(sym => {
            const coinHistory = historicalPrices[sym];
            if (!coinHistory) return;

            const pricePoint = coinHistory.find(p => Math.abs(p[0] - timestamp) < 24 * 60 * 60 * 1000);
            const priceAtDate = pricePoint ? pricePoint[1] : 0;

            const amountOwnedAtDate = transactions
              .filter(t => t.symbol.toLowerCase() === sym && new Date(t.date).getTime() <= pointDate.getTime())
              .reduce((acc, t) => (t.type === 'buy' ? acc + t.amount : acc - t.amount), 0);

            totalPortfolioValue += amountOwnedAtDate * priceAtDate;
          });

          chartPoints.push({
            date: pointDate.toLocaleDateString('pt-BR'),
            valor: totalPortfolioValue,
          });
        });

        setData(chartPoints);
        setErrorMsg(''); // Limpa erro se deu certo
      } catch (error) {
        console.error("Erro geral:", error);
        setErrorMsg('Erro ao gerar gráfico.');
      } finally {
        setLoading(false);
      }
    }

    buildHistory();
  }, [transactions]);

  if (loading) return <div className="text-gray-400 p-4 animate-pulse">Carregando histórico ponto a ponto... ⏳</div>;
  if (errorMsg) return <div className="text-yellow-500 p-4 border border-yellow-700 rounded bg-yellow-900/20">{errorMsg}</div>;
  if (data.length === 0) return <div className="text-gray-400 p-4">Sem dados suficientes.</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg w-full h-[400px]">
      <h3 className="text-gray-200 font-bold mb-6">Evolução do Patrimônio 📈</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF" 
            tick={{fontSize: 12}}
            minTickGap={40}
          />
          <YAxis 
            stroke="#9CA3AF" 
            tickFormatter={(value) => `$${value}`}
            tick={{fontSize: 12}}
            width={80}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Patrimônio']}
          />
          <Area 
            type="monotone" 
            dataKey="valor" 
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#colorValor)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}