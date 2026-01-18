'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Transaction {
  symbol: string;
  amount: number;
}

const CORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Dicionário de IDs (igual ao do Summary)
const COIN_MAP: { [key: string]: string } = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana', ada: 'cardano',
  doge: 'dogecoin', dot: 'polkadot', matic: 'matic-network',
  link: 'chainlink', usdt: 'tether', xrp: 'ripple',
};

export default function AllocationChart({ transactions }: { transactions: Transaction[] }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function prepareData() {
      if (transactions.length === 0) return;

      // 1. Agrupar quantidades por moeda (ex: somar todos os BTCs)
      const holdings: { [key: string]: number } = {};
      transactions.forEach((t) => {
        const sym = t.symbol.toLowerCase();
        holdings[sym] = (holdings[sym] || 0) + t.amount;
      });

      // 2. Buscar preços atuais para calcular o valor em Dólar de cada fatia
      const symbols = Object.keys(holdings);
      const ids = symbols.map(s => COIN_MAP[s] || s).join(',');

      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );
        const prices = await response.json();

        // 3. Montar o array que o gráfico entende
        const chartData = symbols.map((sym) => {
          const id = COIN_MAP[sym] || sym;
          const price = prices[id]?.usd || 0;
          const totalValue = holdings[sym] * price;

          return {
            name: sym.toUpperCase(),
            value: totalValue, // O tamanho da fatia é baseado no VALOR em dólar, não na quantidade
          };
        }).filter(item => item.value > 0); // Remove moedas com valor 0

        // Ordenar do maior para o menor
        chartData.sort((a, b) => b.value - a.value);

        setData(chartData);
      } catch (error) {
        console.error('Erro ao montar gráfico:', error);
      }
    }

    prepareData();
  }, [transactions]);

  if (transactions.length === 0) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg flex flex-col items-center">
      <h3 className="text-gray-200 font-bold mb-4 w-full text-left">Alocação da Carteira</h3>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60} // Faz virar uma "Rosca" (Donut Chart)
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`$${value.toFixed(2)}`, 'Valor Total']}
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}