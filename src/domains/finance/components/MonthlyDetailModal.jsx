import { useState } from "react";
import { X, Plus, Wallet, Edit2, Trash2, CreditCard } from "lucide-react";
import Modal from "../../library/components/Modal";
import { Currencyformatter } from "../utils/currency";
import { updateAccountBalance } from "../api";
import { useToast } from "../../../context/ToastContext";

export function MonthlyDetailModal({
  selectedMonth,
  selectedYear,
  onClose,
  onRefresh,
}) {
  const addToast = useToast();
  const [editingAccount, setEditingAccount] = useState(null);
  const [editBalance, setEditBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(selectedMonth);

  const CATEGORIES = {
    "Cash & Savings": { label: "Cash & Savings" },
    Investments: { label: "Investments" },
    Retirement: { label: "Retirement" },
    Property: { label: "Property" },
  };
  const catLabel = (t) => (CATEGORIES[t] || {}).label;

  const handleEditClick = (account) => {
    setEditingAccount(account);
    setEditBalance(account.balance.toString());
  };

  const handleSaveBalance = async () => {
    if (!editingAccount || editBalance === "") return;

    const newBalance = parseFloat(editBalance);
    if (isNaN(newBalance)) {
      addToast("Please enter a valid number", "error");
      return;
    }

    setIsLoading(true);
    try {
      await updateAccountBalance(
        editingAccount.id || editingAccount.accountId,
        displayMonth.date,
        newBalance,
      );

      // Update the displayed month data with new balance
      const updatedAccounts = displayMonth.accounts.map((acc) =>
        acc === editingAccount ? { ...acc, balance: newBalance } : acc,
      );

      const updatedAssets = updatedAccounts
        .filter((acc) => acc.category === "ASSET")
        .reduce((sum, acc) => sum + acc.balance, 0);
      const updatedLiabilities = updatedAccounts
        .filter((acc) => acc.category === "LIABILITY")
        .reduce((sum, acc) => sum + acc.balance, 0);

      setDisplayMonth({
        ...displayMonth,
        accounts: updatedAccounts,
        assets: updatedAssets,
        liabilities: updatedLiabilities,
        netWorth: updatedAssets - updatedLiabilities,
      });

      addToast(`${editingAccount.accountName} balance updated`, "success");
      setEditingAccount(null);
      setEditBalance("");
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      addToast(err.message || "Failed to update balance", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setEditBalance("");
  };

  const assetAccounts = displayMonth.accounts
    .filter((account) => account.category === "ASSET")
    .sort((a, b) => a.accountType.localeCompare(b.accountType));

  const liabilityAccounts = displayMonth.accounts
    .filter((account) => account.category === "LIABILITY")
    .sort((a, b) => a.accountType.localeCompare(b.accountType));

  return (
    <Modal
      onClose={onClose}
      panelClassName="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl border border-slate-200 shadow-2xl mx-4 sm:mx-0 flex flex-col"
    >
      <div className="sticky top-0 bg-white border-b border-slate-100 px-3 sm:px-5 py-2.5 sm:py-3.5 z-10">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
              {displayMonth.month} {selectedYear}
            </h2>
            <div className="flex gap-5">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  Net Worth
                </div>
                <div className={`text-lg font-bold text-blue-700`}>
                  {Currencyformatter.format(displayMonth.netWorth)}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 hover: cursor-pointer flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Assets */}
        <div className="px-3 sm:px-5 py-4 sm:py-5 border-b border-slate-100">
          <div className="flex justify-between items-center mb-3 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Assets
            </h3>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex-shrink-0">
              <Plus size={14} />
              Add Asset
            </button>
          </div>
          <div className="space-y-2">
            {assetAccounts.map((account, accountIndex) => {
              const isEditing = editingAccount === account;
              return (
                <div key={accountIndex}>
                  <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-200 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Wallet
                        size={16}
                        className="text-emerald-500 flex-shrink-0"
                      />
                      <span className="text-slate-700 font-medium text-sm truncate">
                        {account.accountName}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-block flex-shrink-0"
                        style={{
                          backgroundColor: "#10b98122",
                          color: "#10b981",
                        }}
                      >
                        {catLabel(account.accountType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span
                        className={`font-bold text-emerald-700 text-sm sm:text-base`}
                      >
                        {Currencyformatter.format(account.balance)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(account)}
                          className="p-1.5 text-blue-600 rounded-md hover:bg-blue-200 hover:text-blue-800 transition-colors duration-200 hover:cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button className="p-1.5 text-rose-500 rounded-md hover:bg-rose-200 hover:text-rose-700 transition-colors duration-200 hover:cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-2 sm:p-1">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          placeholder="0.00"
                          className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveBalance}
                          disabled={isLoading}
                          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm flex-shrink-0"
                        >
                          {isLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                          className="px-3 sm:px-4 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm flex-shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Liabilities */}
        <div className="px-3 sm:px-5 py-4 sm:py-5">
          <div className="flex justify-between items-center mb-3 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Liabilities
            </h3>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold flex-shrink-0">
              <Plus size={14} />
              Add Liability
            </button>
          </div>
          <div className="space-y-2">
            {liabilityAccounts.map((liability, liabIndex) => {
              const isEditing = editingAccount === liability;
              return (
                <div key={liabIndex}>
                  <div className="bg-rose-50 rounded-lg p-2 border border-rose-200 flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <CreditCard
                        size={16}
                        className="text-rose-500 flex-shrink-0"
                      />
                      <span className="text-slate-700 font-medium text-sm truncate">
                        {liability.accountName}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-block flex-shrink-0"
                        style={{
                          backgroundColor: "#b91c1c22",
                          color: "#b91c1c",
                        }}
                      >
                        {liability.accountType}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span
                        className={`font-bold text-rose-700 text-sm sm:text-base`}
                      >
                        {Currencyformatter.format(liability.balance)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(liability)}
                          className="p-1.5 text-blue-600 rounded-md hover:bg-blue-200 hover:text-blue-800 transition-colors duration-200 hover:cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button className="p-1.5 text-rose-500 rounded-md hover:bg-rose-200 hover:text-rose-700 transition-colors duration-200 hover:cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-2 sm:p-1">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          placeholder="0.00"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveBalance}
                          disabled={isLoading}
                          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm flex-shrink-0"
                        >
                          {isLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                          className="px-3 sm:px-4 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm flex-shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
