const NoTransaction = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full mb-8">
      <img
        src="/transaction.jpeg"
        alt="No Transactions"
        className="w-[300px] md:w-[400px] my-8 rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
      />
      <p className="text-lg md:text-xl text-white text-center px-4">
        You have no transactions currently.
      </p>
    </div>
  );
};

export default NoTransaction;
