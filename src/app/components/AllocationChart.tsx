'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Transaction {
  symbol: string;
  amount: number;
  price: number;
  type: string;
}

const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function AllocationChart({ transactions }: { transactions: any[] }) {
  
  if (!transactions || transactions.length === 0) {
    return (
        <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
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
    }));

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Alocação Atual</h3>
      </div>
      
      {/* Container com altura FIXA para garantir que o gráfico renderize */}
      <div className="w-full h-[300px] relative"> 
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
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Valor']}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}