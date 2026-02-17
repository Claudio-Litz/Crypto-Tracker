'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
      <div className="flex items-center justify-center text-gray-500 text-sm h-[250px]">
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
    .sort((a, b) => b.value - a.value);

  return (
    /* THE FIX: Explicit style height prevents Recharts from collapsing to 0 */
    <div className="w-full" style={{ height: 280, minHeight: 280 }}> 
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Valor']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}