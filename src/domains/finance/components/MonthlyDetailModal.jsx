import { useState, useEffect, useCallback } from "react";
import {
  X,
  Plus,
  Wallet,
  Edit2,
  Trash2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import Modal from "../../library/components/Modal";
import { Currencyformatter } from "../utils/currency";
import {
  updateAccountBalance,
  getAccounts,
  createAccount,
  deleteAccountBalance,
} from "../api";
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
  const [addingAccountType, setAddingAccountType] = useState(null);
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [allAccounts, setAllAccounts] = useState([]);
  const [addMode, setAddMode] = useState("select"); // "select" or "create"
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountCategory, setNewAccountCategory] =
    useState("Cash & Savings");

  useEffect(() => {
    // Load accounts on mount using IIFE to avoid setState linter warning
    (async () => {
      try {
        const accounts = await getAccounts();
        setAllAccounts(accounts);
      } catch {
        addToast("Failed to load accounts", "error");
      }
    })();
  }, [addToast]);

  // Callback for refetching accounts (used when creating new accounts)
  const refetchAccounts = useCallback(async () => {
    try {
      const accounts = await getAccounts();
      setAllAccounts(accounts);
    } catch {
      addToast("Failed to load accounts", "error");
    }
  }, [addToast]);

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

  const handleAddAccountClick = (accountType) => {
    setAddingAccountType(accountType);
    setNewAccountBalance("");
    setAddMode("select");
    setNewAccountName("");
    setNewAccountCategory("Cash & Savings");
  };

  const handleAddAccountSave = async (account) => {
    if (!newAccountBalance || newAccountBalance === "") {
      addToast("Please enter a balance", "error");
      return;
    }

    const newBalance = parseFloat(newAccountBalance);
    if (isNaN(newBalance)) {
      addToast("Please enter a valid number", "error");
      return;
    }

    setIsLoading(true);
    try {
      await updateAccountBalance(
        account.id || account.accountId,
        displayMonth.date,
        newBalance,
      );

      // Add the new account to display
      const newAccount = {
        ...account,
        balance: newBalance,
      };

      const updatedAccounts = [...displayMonth.accounts, newAccount];
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
        hasData: true,
      });

      addToast(`${account.accountName} added for this month`, "success");
      setAddingAccountType(null);
      setNewAccountBalance("");
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      addToast(err.message || "Failed to add account", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAndAddAccount = async () => {
    if (!newAccountName.trim()) {
      addToast("Please enter an account name", "error");
      return;
    }

    if (!newAccountBalance || newAccountBalance === "") {
      addToast("Please enter a balance", "error");
      return;
    }

    const newBalance = parseFloat(newAccountBalance);
    if (isNaN(newBalance)) {
      addToast("Please enter a valid number", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Create the new account
      const newAccount = await createAccount(
        newAccountName,
        newAccountCategory,
        addingAccountType,
      );

      // Add balance for this month
      await updateAccountBalance(
        newAccount.id || newAccount.accountId,
        displayMonth.date,
        newBalance,
      );

      // Add to display
      const accountWithBalance = {
        ...newAccount,
        balance: newBalance,
      };

      const updatedAccounts = [...displayMonth.accounts, accountWithBalance];
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
        hasData: true,
      });

      // Refresh accounts list
      await refetchAccounts();

      addToast(`${newAccountName} created and added for this month`, "success");
      setAddingAccountType(null);
      setNewAccountBalance("");
      setNewAccountName("");
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      addToast(err.message || "Failed to create account", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setAddingAccountType(null);
    setNewAccountBalance("");
  };

  const handleDeleteAccount = async (account) => {
    if (!confirm(`Delete ${account.accountName} from this month?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteAccountBalance(
        account.id || account.accountId,
        displayMonth.date,
      );

      // Remove the account from display
      const updatedAccounts = displayMonth.accounts.filter(
        (acc) =>
          (acc.id || acc.accountId) !== (account.id || account.accountId),
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
        hasData: updatedAccounts.length > 0,
      });

      addToast(`${account.accountName} removed from this month`, "success");
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      addToast(err.message || "Failed to delete account", "error");
    } finally {
      setIsLoading(false);
    }
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
      <div className="sticky top-0 bg-white border-b border-slate-100 px-3 sm:px-5 py-2.5 sm:py-3.5 z-10 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
              {displayMonth.month} {selectedYear}
            </h2>
            <div className="flex gap-5">
              <div>
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
        {!displayMonth.hasData && (
          <div className="px-3 sm:px-5 py-4 bg-yellow-50 border border-yellow-200 rounded-lg m-3 sm:m-5 flex gap-3">
            <AlertCircle
              size={20}
              className="text-yellow-600 flex-shrink-0 mt-0.5"
            />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">
                No data for this month yet
              </h4>
              <p className="text-sm text-yellow-800">
                Click the + button below to add account balances for{" "}
                {displayMonth.month} {selectedYear}
              </p>
            </div>
          </div>
        )}

        {/* Assets */}
        <div className="px-3 sm:px-5 py-4 sm:py-5 border-b border-slate-100">
          <div className="flex justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-emerald-600">
              <TrendingUp size={16} />
              Assets
            </h3>
            <button
              onClick={() => handleAddAccountClick("ASSET")}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold hover:cursor-pointer flex-shrink-0 disabled:opacity-50 transition-colors"
            >
              <Plus size={14} />
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
                        <button
                          onClick={() => handleDeleteAccount(account)}
                          disabled={isLoading}
                          className="p-1.5 text-rose-500 rounded-md hover:bg-rose-200 hover:text-rose-700 transition-colors duration-200 hover:cursor-pointer disabled:opacity-50"
                        >
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

            {/* Add new asset account form */}
            {addingAccountType === "ASSET" && (
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-300 border-dashed">
                {/* Mode Toggle */}
                <div className="flex gap-2 mb-4 border-b border-emerald-200 pb-2">
                  <button
                    onClick={() => setAddMode("select")}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      addMode === "select"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-emerald-600 border border-emerald-200"
                    }`}
                    disabled={isLoading}
                  >
                    Select Existing
                  </button>
                  <button
                    onClick={() => setAddMode("create")}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      addMode === "create"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-emerald-600 border border-emerald-200"
                    }`}
                    disabled={isLoading}
                  >
                    Create New
                  </button>
                </div>

                {addMode === "select" ? (
                  <>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Select Account
                      </label>
                      <select
                        id="asset-select"
                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        disabled={isLoading}
                      >
                        <option value="">Choose an account...</option>
                        {allAccounts
                          .filter((acc) => acc.category === "ASSET")
                          .map((acc) => (
                            <option
                              key={acc.id || acc.accountId}
                              value={acc.id || acc.accountId}
                            >
                              {acc.accountName} ({catLabel(acc.accountType)})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Balance
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newAccountBalance}
                        onChange={(e) => setNewAccountBalance(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const select =
                            document.getElementById("asset-select");
                          const selectedAccountId = select.value;
                          const account = allAccounts.find((acc) => {
                            const accId = acc.id || acc.accountId;
                            return String(accId) === String(selectedAccountId);
                          });
                          if (account) {
                            handleAddAccountSave(account);
                          } else {
                            addToast("Please select an account", "error");
                          }
                        }}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 text-sm transition-colors"
                      >
                        {isLoading ? "Adding..." : "Add"}
                      </button>
                      <button
                        onClick={handleCancelAdd}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        placeholder="e.g., My Crypto Wallet"
                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Account Type
                      </label>
                      <select
                        value={newAccountCategory}
                        onChange={(e) => setNewAccountCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        disabled={isLoading}
                      >
                        <option value="Cash & Savings">Cash & Savings</option>
                        <option value="Investments">Investments</option>
                        <option value="Retirement">Retirement</option>
                        <option value="Property">Property</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Balance
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newAccountBalance}
                        onChange={(e) => setNewAccountBalance(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateAndAddAccount}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 text-sm transition-colors"
                      >
                        {isLoading ? "Creating..." : "Create & Add"}
                      </button>
                      <button
                        onClick={handleCancelAdd}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Liabilities */}
        <div className="px-3 sm:px-5 py-4 sm:py-5">
          <div className="flex justify-between items-center mb-3 gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-rose-600">
              <TrendingDown size={16} />
              Liabilities
            </h3>
            <button
              onClick={() => handleAddAccountClick("LIABILITY")}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold hover:cursor-pointer flex-shrink-0 disabled:opacity-50 transition-colors"
            >
              <Plus size={14} />
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
                        <button
                          onClick={() => handleDeleteAccount(liability)}
                          disabled={isLoading}
                          className="p-1.5 text-rose-500 rounded-md hover:bg-rose-200 hover:text-rose-700 transition-colors duration-200 hover:cursor-pointer disabled:opacity-50"
                        >
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

            {/* Add new liability account form */}
            {addingAccountType === "LIABILITY" && (
              <div className="bg-rose-50 rounded-lg p-3 border border-rose-300 border-dashed">
                {/* Mode Toggle */}
                <div className="flex gap-2 mb-4 border-b border-rose-200 pb-2">
                  <button
                    onClick={() => setAddMode("select")}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      addMode === "select"
                        ? "bg-rose-600 text-white"
                        : "bg-white text-rose-600 border border-rose-200"
                    }`}
                    disabled={isLoading}
                  >
                    Select Existing
                  </button>
                  <button
                    onClick={() => setAddMode("create")}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      addMode === "create"
                        ? "bg-rose-600 text-white"
                        : "bg-white text-rose-600 border border-rose-200"
                    }`}
                    disabled={isLoading}
                  >
                    Create New
                  </button>
                </div>

                {addMode === "select" ? (
                  <>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Select Account
                      </label>
                      <select
                        id="liability-select"
                        className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                        disabled={isLoading}
                      >
                        <option value="">Choose an account...</option>
                        {allAccounts
                          .filter((acc) => acc.category === "LIABILITY")
                          .map((acc) => (
                            <option
                              key={acc.id || acc.accountId}
                              value={acc.id || acc.accountId}
                            >
                              {acc.accountName} ({acc.accountType})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Balance
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newAccountBalance}
                        onChange={(e) => setNewAccountBalance(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const select =
                            document.getElementById("liability-select");
                          const selectedAccountId = select.value;
                          const account = allAccounts.find((acc) => {
                            const accId = acc.id || acc.accountId;
                            return String(accId) === String(selectedAccountId);
                          });
                          if (account) {
                            handleAddAccountSave(account);
                          } else {
                            addToast("Please select an account", "error");
                          }
                        }}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 disabled:opacity-50 text-sm transition-colors"
                      >
                        {isLoading ? "Adding..." : "Add"}
                      </button>
                      <button
                        onClick={handleCancelAdd}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        placeholder="e.g., Personal Loan"
                        className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Account Type
                      </label>
                      <input
                        type="text"
                        value={newAccountCategory}
                        onChange={(e) => setNewAccountCategory(e.target.value)}
                        placeholder="e.g., Credit Card, Mortgage"
                        className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Balance
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newAccountBalance}
                        onChange={(e) => setNewAccountBalance(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateAndAddAccount}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 disabled:opacity-50 text-sm transition-colors"
                      >
                        {isLoading ? "Creating..." : "Create & Add"}
                      </button>
                      <button
                        onClick={handleCancelAdd}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
