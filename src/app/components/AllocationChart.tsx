'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Transaction {
  symbol: string;
  amount: number;
  price: number;
  type: string;
}

const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export default function AllocationChart({ transactions }: { transactions: any[] }) {
  
  if (!transactions || transactions.length === 0) {
    return (
        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Sem dados para o gráfico.
        </div>
    );
  }

  const holdings: { [key: string]: number } = {};
  const currentPrices: { [key: string]: number } = {};

  transactions.forEach((t: Transaction) => {
    const sym = t.symbol.toUpperCase();
    if (!holdings[sym]) holdings[sym] = 0;
    currentPrices[sym] = t.price;

    if (t.type === 'buy') holdings[sym] += t.amount;
    else holdings[sym] -= t.amount;
  });

  const data = Object.keys(holdings)
    .filter(sym => holdings[sym] > 0)
    .map(sym => ({
      name: sym,
      value: holdings[sym] * currentPrices[sym]
    }))
    .sort((a, b) => b.value - a.value); // Ordena do maior para o menor

  return (
    <div className="w-full h-[350px] relative"> 
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            // AQUI: Aumentei o raio interno e externo para preencher o espaço
            innerRadius={80}
            outerRadius={130}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
            ))}
          </Pie>
          <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: any) => [`$${value.toFixed(2)}`, 'Valor']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-slate-300 ml-1 mr-4">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}