import { Plus, TrendingUp, TrendingDown, Edit2, Trash2 } from "lucide-react";
import { useTransactions } from "../hooks/useTransactions.js";
import { Currencyformatter } from "../utils/currency";

export const IncomeExpenses = () => {
  const { data: transactions = [], isLoading } = useTransactions();
  const C = {
    networth: "text-blue-700",
    asset: "text-emerald-700",
    liab: "text-rose-700",
    pos: "text-emerald-600",
    neg: "text-rose-600",
    posBadge: "bg-emerald-100 text-emerald-700",
    negBadge: "bg-rose-100 text-rose-700",
  };
  let income =
    transactions
      ?.filter((transaction) => transaction.transactionType === "INCOME")
      .reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
  let expenses =
    transactions
      ?.filter((transaction) => transaction.transactionType === "EXPENSE")
      .reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
  let netCashFlow =
    (transactions
      ?.filter(
        (transaction) =>
          transaction.transactionType === "INCOME" && transaction.cash,
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0) || 0) -
      transactions
        ?.filter(
          (transaction) =>
            transaction.transactionType === "EXPENSE" && transaction.cash,
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg text-center">
          <div className="text-emerald-100 text-xs font-medium uppercase tracking-wide mb-0.5">
            Total Income
          </div>
          <div className="text-base md:text-lg lg:text-2xl font-bold text-white">
            {Currencyformatter.format(income)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg text-center">
          <div className="text-rose-100 text-xs font-medium uppercase tracking-wide mb-0.5">
            Total Expenses
          </div>
          <div className="text-base md:text-lg lg:text-2xl font-bold text-white">
            {Currencyformatter.format(expenses)}
          </div>
        </div>
        <div
          className={`bg-gradient-to-br ${income - expenses >= 0 ? "from-blue-500 to-blue-600" : "from-orange-500 to-orange-600"} rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg text-center`}
        >
          <div className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-0.5">
            Net Cash Flow
          </div>
          <div className="text-base md:text-lg lg:text-2xl font-bold text-white">
            {Currencyformatter.format(netCashFlow)}
          </div>
        </div>
        <div
          className={`bg-gradient-to-br ${income - expenses >= 0 ? "from-blue-500 to-blue-600" : "from-orange-500 to-orange-600"} rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg text-center`}
        >
          <div className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-0.5">
            Net Income
          </div>
          <div className="text-base md:text-lg lg:text-2xl font-bold text-white">
            {Currencyformatter.format(income - expenses)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl px-4 py-2 shadow-xl border border-slate-200 mb-2">
        {/* {isAddingTransaction && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4 border-2 border-blue-200">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Transaction name"
                value={newTransaction.name}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
              />
              <select
                value={newTransaction.direction}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    direction: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
              >
                <option value="in">Income</option>
                <option value="out">Expense</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddTransaction}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAddingTransaction(false);
                    setNewTransaction({
                      name: "",
                      direction: "in",
                      amount: "",
                    });
                  }}
                  className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}  */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["INCOME", "EXPENSE"].map((dir) => (
            <div key={dir} className="mb-3">
              <div className="flex justify-between mb-2">
                <h3
                  className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${dir === "INCOME" ? C.pos : C.neg}`}
                >
                  {dir === "INCOME" ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {dir === "INCOME" ? "Income" : "Expenses"}
                </h3>
                <button
                  // onClick={() => setIsAddingTransaction(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold hover:cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {transactions
                  .filter((transaction) => transaction.transactionType === dir)
                  .map((transaction) => {
                    // if (
                    //   deleteConfirm?.type === "tx" &&
                    //   deleteConfirm?.id === tx.id
                    // )
                    //   return (
                    //     <DeleteConfirmRow
                    //       key={tx.id}
                    //       label={tx.name}
                    //       onConfirm={() => handleDeleteTransaction(tx.id)}
                    //       onCancel={() => setDeleteConfirm(null)}
                    //     />
                    //   );
                    // if (editingTransaction?.id === tx.id)
                    //   return (
                    //     <div
                    //       key={tx.id}
                    //       className={`rounded-lg p-3 border-2 ${dir === "in" ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
                    //     >
                    //       <div className="space-y-2">
                    //         <input
                    //           type="text"
                    //           value={editingTransaction.name}
                    //           onChange={(e) =>
                    //             setEditingTransaction({
                    //               ...editingTransaction,
                    //               name: e.target.value,
                    //             })
                    //           }
                    //           className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
                    //         />
                    //         <input
                    //           type="number"
                    //           value={editingTransaction.amount}
                    //           onChange={(e) =>
                    //             setEditingTransaction({
                    //               ...editingTransaction,
                    //               amount: e.target.value,
                    //             })
                    //           }
                    //           className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
                    //         />
                    //         <div className="flex gap-2">
                    //           <button
                    //             onClick={handleSaveTransaction}
                    //             className={`flex-1 py-2 ${dir === "in" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} text-white rounded-lg font-semibold text-sm`}
                    //           >
                    //             Save
                    //           </button>
                    //           <button
                    //             onClick={() => setEditingTransaction(null)}
                    //             className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm"
                    //           >
                    //             Cancel
                    //           </button>
                    //         </div>
                    //       </div>
                    //     </div>
                    //   );
                    return (
                      <div
                        key={transaction.id}
                        className={`rounded-lg p-3 border flex justify-between items-center hover:shadow-sm transition-all ${dir === "INCOME" ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
                      >
                        <span className="text-slate-800 font-medium text-sm">
                          {transaction.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold ${dir === "INCOME" ? C.asset : C.liab}`}
                          >
                            {Currencyformatter.format(transaction.amount)}
                          </span>
                          <button
                            // onClick={() =>
                            //   setEditingTransaction({
                            //     ...tx,
                            //     amount: tx.amount.toString(),
                            //   })
                            // }
                            className="p-1 text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            // onClick={() =>
                            //   setDeleteConfirm({ type: "tx", id: tx.id })
                            // }
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                {transactions.filter(
                  (transaction) => transaction.transactionType === dir,
                ).length === 0 &&
                  !isLoading && (
                    <p className="text-slate-400 text-sm italic">
                      No {dir === "INCOME" ? "income" : "expense"} transactions
                      yet
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
