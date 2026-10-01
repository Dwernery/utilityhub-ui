import {
  Plus,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactions } from "../hooks/useTransactions.js";
import { updateTransaction, clearAllPaid } from "../api.js";
import { Currencyformatter } from "../utils/currency";
import { useToast } from "../../../context/ToastContext";
import { TRANSACTIONS_KEY } from "../hooks/queryKeys.js";

export const IncomeExpenses = () => {
  const { data: transactions = [], isLoading } = useTransactions();
  const queryClient = useQueryClient();
  const addToast = useToast();
  const [paidFilter, setPaidFilter] = useState("ALL"); // "ALL", "PAID", "UNPAID"
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    amount: "",
    paid: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const C = {
    networth: "text-blue-700",
    asset: "text-emerald-700",
    liab: "text-rose-700",
    pos: "text-emerald-600",
    neg: "text-rose-600",
    posBadge: "bg-emerald-100 text-emerald-700",
    negBadge: "bg-rose-100 text-rose-700",
  };

  // Filter transactions based on paid status
  const filteredTransactions = transactions.filter((transaction) => {
    if (paidFilter === "PAID") return transaction.paid === true;
    if (paidFilter === "UNPAID") return transaction.paid === false;
    return true; // ALL
  });

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      name: transaction.name,
      amount: transaction.amount.toString(),
      paid: transaction.paid || false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;

    const newAmount = parseFloat(editFormData.amount);
    if (isNaN(newAmount)) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    if (!editFormData.name.trim()) {
      addToast("Please enter a transaction name", "error");
      return;
    }

    setIsSaving(true);
    try {
      await updateTransaction(
        editingTransaction.id,
        editFormData.name,
        newAmount,
        editFormData.paid,
      );

      addToast("Transaction updated successfully", "success");
      setEditingTransaction(null);

      // Refetch transactions
      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    } catch (err) {
      addToast(err.message || "Failed to update transaction", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAllPaid = async () => {
    if (
      !confirm("Clear paid status from all income and expense transactions?")
    ) {
      return;
    }

    setIsSaving(true);
    try {
      await clearAllPaid();
      addToast("Cleared paid status from all transactions", "success");
      // Refetch transactions
      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    } catch (err) {
      addToast(err.message || "Failed to clear paid status", "error");
    } finally {
      setIsSaving(false);
    }
  };

  let income =
    filteredTransactions
      ?.filter((transaction) => transaction.transactionType === "INCOME")
      .reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
  let expenses =
    filteredTransactions
      ?.filter((transaction) => transaction.transactionType === "EXPENSE")
      .reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
  let netCashFlow =
    (filteredTransactions
      ?.filter(
        (transaction) =>
          transaction.transactionType === "INCOME" && transaction.cash,
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0) || 0) -
      filteredTransactions
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

      <div className="bg-white rounded-2xl px-4 py-2 shadow-xl border border-slate-200 mb-4">
        {/* Paid Status Filter */}
        <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-200 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Filter:
            </span>
            <div className="flex gap-2">
              {["ALL", "PAID", "UNPAID"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPaidFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    paidFilter === filter
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleClearAllPaid}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs"
            title="Clear paid status from all transactions"
          >
            <X size={14} />
            <span>Clear All Paid</span>
          </button>
        </div>
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
                  className={`flex items-center gap-2 px-3 py-1.5 text-white rounded-lg font-semibold hover:cursor-pointer ${dir === "INCOME" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {filteredTransactions
                  .filter((transaction) => transaction.transactionType === dir)
                  .map((transaction) => {
                    const isEditing = editingTransaction?.id === transaction.id;
                    return (
                      <div key={transaction.id}>
                        <div
                          className={`rounded-lg p-3 border flex justify-between items-center hover:shadow-sm transition-all ${dir === "INCOME" ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-800 font-medium text-sm">
                              {transaction.name}
                            </span>
                            {transaction.paid && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-700 text-white">
                                <Check size={12} />
                                <span>Paid</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${dir === "INCOME" ? C.asset : C.liab}`}
                            >
                              {Currencyformatter.format(transaction.amount)}
                            </span>
                            <button
                              onClick={() => handleEditClick(transaction)}
                              className="p-1 text-blue-600 hover:text-blue-700 ml-2"
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

                        {isEditing && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="space-y-3">
                              <div className="flex gap-2 flex-col sm:flex-row">
                                <input
                                  type="text"
                                  value={editFormData.name}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="Transaction name"
                                  className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  autoFocus
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editFormData.amount}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      amount: e.target.value,
                                    })
                                  }
                                  placeholder="0.00"
                                  className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editFormData.paid}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        paid: e.target.checked,
                                      })
                                    }
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm font-medium text-slate-700">
                                    Mark as Paid
                                  </span>
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSaveEdit}
                                  disabled={isSaving}
                                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm"
                                >
                                  {isSaving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={() => setEditingTransaction(null)}
                                  disabled={isSaving}
                                  className="flex-1 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {filteredTransactions.filter(
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
