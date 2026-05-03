const NoTransaction = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-20 px-4">
      <div className="text-8xl mb-6 animate-bounce">💸</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Transactions Yet</h3>
      <p className="text-gray-600 text-center max-w-sm">
        Start tracking your finances by adding your first income or expense.
      </p>
    </div>
  );
};

export default NoTransaction;
