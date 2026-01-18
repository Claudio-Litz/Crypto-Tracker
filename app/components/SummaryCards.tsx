interface Transaction {
  amount: number;
  price: number;
  type: string;
}

export default function SummaryCards({ transactions }: { transactions: Transaction[] }) {
  
  // 1. Calcular Total Investido
  const totalInvested = transactions.reduce((acc, current) => {
    if (current.type === 'buy') {
      return acc + (current.price * current.amount);
    }
    return acc; // Se fosse venda, a lógica mudaria, mas vamos manter simples
  }, 0);

  // 2. Formatar para Dólar
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Card 1: Total Investido */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 rounded-lg border border-blue-700 shadow-lg">
        <h3 className="text-blue-200 text-sm font-medium uppercase tracking-wider">
          Total Investido
        </h3>
        <p className="text-3xl font-bold text-white mt-2">
          {formatMoney(totalInvested)}
        </p>
        <p className="text-blue-300 text-xs mt-2">
          Soma de todos os aportes realizados
        </p>
      </div>

      {/* Card 2: Quantidade de Operações */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
          Total de Operações
        </h3>
        <p className="text-3xl font-bold text-white mt-2">
          {transactions.length}
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Compras registradas no sistema
        </p>
      </div>
    </div>
  );
}