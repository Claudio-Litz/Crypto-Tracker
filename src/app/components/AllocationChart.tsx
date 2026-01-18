'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Interface corrige o erro vermelho do VS Code
interface Transaction {
  symbol: string;
  amount: number;
  price: number;
  type: string;
}

const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function AllocationChart({ transactions }: { transactions: any[] }) {
  
  if (!transactions || transactions.length === 0) return null;

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
    }));

  return (
    <div className="h-full min-h-[400px] bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center justify-center">
      <h3 className="text-xl font-bold text-white mb-4 w-full text-left">Alocação</h3>
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
              ))}
            </Pie>
            <Tooltip 
                formatter={(value: any) => [`$ ${value.toFixed(2)}`, 'Valor']}
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}