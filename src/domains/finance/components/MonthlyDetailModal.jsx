import { useMemo, useState } from "react";
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
import { Modal } from "../../../components/Modal";
import { LoadError } from "../../../components/LoadError";
import { currencyFormatter, parseMoney } from "../utils/currency";
import { ASSET_TYPES, monthAccounts } from "../utils/monthly";
import {
  useNetWorthHistory,
  useAccounts,
  useCreateAccount,
  useRemoveAccountBalance,
  useSetAccountBalance,
} from "../hooks";
import { useToast } from "../../../context/ToastContext";

// Everything that differs between the Assets and Liabilities sections.
// (Tailwind needs whole class names, so they're spelled out rather than built.)
const SECTION = {
  ASSET: {
    title: "Assets",
    HeadingIcon: TrendingUp,
    RowIcon: Wallet,
    heading: "text-emerald-600",
    solid: "bg-emerald-600 hover:bg-emerald-700",
    row: "bg-emerald-50 border-emerald-200",
    rowIcon: "text-emerald-500",
    badge: { backgroundColor: "#10b98122", color: "#10b981" },
    balance: "text-emerald-700",
    form: "bg-emerald-50 border-emerald-300",
    divider: "border-emerald-200",
    toggleOn: "bg-emerald-600 text-white",
    toggleOff: "bg-white text-emerald-600 border border-emerald-200",
    input: "border-emerald-200 focus:ring-emerald-500",
    namePlaceholder: "e.g., My Crypto Wallet",
    // A rising asset is good news; a rising liability isn't.
    good: (change) => change >= 0,
  },
  LIABILITY: {
    title: "Liabilities",
    HeadingIcon: TrendingDown,
    RowIcon: CreditCard,
    heading: "text-rose-600",
    solid: "bg-rose-600 hover:bg-rose-700",
    row: "bg-rose-50 border-rose-200",
    rowIcon: "text-rose-500",
    badge: { backgroundColor: "#b91c1c22", color: "#b91c1c" },
    balance: "text-rose-700",
    form: "bg-rose-50 border-rose-300",
    divider: "border-rose-200",
    toggleOn: "bg-rose-600 text-white",
    toggleOff: "bg-white text-rose-600 border border-rose-200",
    input: "border-rose-200 focus:ring-rose-500",
    namePlaceholder: "e.g., Personal Loan",
    good: (change) => change < 0,
  },
};

const LABEL = "block text-xs font-semibold text-slate-700 mb-3";
const CANCEL =
  "flex-1 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm transition-colors";

/**
 * One month's accounts. Reads straight from the net-worth query, so every save
 * (which refetches it) updates the totals here and in the table behind.
 */
export function MonthlyDetailModal({ date, title, onClose }) {
  const addToast = useToast();
  const { data: history } = useNetWorthHistory();
  const { data: allAccounts = [] } = useAccounts();
  const month = useMemo(() => monthAccounts(history, date), [history, date]);

  const setAccountBalance = useSetAccountBalance();
  const removeAccountBalance = useRemoveAccountBalance();
  const createAccount = useCreateAccount();
  const isSaving =
    setAccountBalance.isPending ||
    removeAccountBalance.isPending ||
    createAccount.isPending;

  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editBalance, setEditBalance] = useState("");
  const [addingCategory, setAddingCategory] = useState(null);

  // Accounts already in this month can't be added again.
  const presentIds = new Set(
    [...month.assets, ...month.liabilities].map((a) => a.accountId),
  );
  const availableFor = (category) =>
    allAccounts.filter((a) => a.category === category && !presentIds.has(a.id));

  // Balances may be negative (e.g. an overdrawn account), unlike transactions and income.
  const parseBalance = (raw) => {
    const parsed = parseMoney(raw, { allowNegative: true });
    if (!parsed.ok) addToast(parsed.error, "error");
    return parsed.ok ? parsed.value : null;
  };

  /** Set an account's balance for this month; resolves true on success. */
  const saveBalance = async (accountId, accountName, raw, doneMessage) => {
    const balance = parseBalance(raw);
    if (balance === null) return false;
    try {
      await setAccountBalance.mutateAsync({ accountId, date, balance });
      addToast(`${accountName} ${doneMessage}`, "success");
      return true;
    } catch (err) {
      addToast(err.message || "Failed to update balance", "error");
      return false;
    }
  };

  const startEdit = (account) => {
    setEditingAccountId(account.accountId);
    setEditBalance(account.balance.toString());
  };

  const cancelEdit = () => {
    setEditingAccountId(null);
    setEditBalance("");
  };

  const handleSaveEdit = async (account) => {
    const saved = await saveBalance(
      account.accountId,
      account.accountName,
      editBalance,
      "balance updated",
    );
    if (saved) cancelEdit();
  };

  const handleDelete = async (account) => {
    if (!confirm(`Delete ${account.accountName} from this month?`)) return;
    try {
      await removeAccountBalance.mutateAsync({
        accountId: account.accountId,
        date,
      });
      addToast(`${account.accountName} removed from this month`, "success");
    } catch (err) {
      addToast(err.message || "Failed to delete account", "error");
    }
  };

  const handleAddExisting = async (account, raw) => {
    if (!account) {
      addToast("Please select an account", "error");
      return;
    }
    const saved = await saveBalance(
      account.id,
      account.accountName,
      raw,
      "added for this month",
    );
    if (saved) setAddingCategory(null);
  };

  const handleCreate = async (category, { name, type, raw }) => {
    if (!name.trim()) {
      addToast("Please enter an account name", "error");
      return;
    }
    if (!type.trim()) {
      addToast("Please enter an account type", "error");
      return;
    }
    const balance = parseBalance(raw);
    if (balance === null) return;
    try {
      // One request: the API creates the account and this month's balance together.
      await createAccount.mutateAsync({
        accountName: name.trim(),
        accountType: type.trim(),
        category,
        initialBalance: { balance, date },
      });
      addToast(`${name.trim()} created and added for this month`, "success");
      setAddingCategory(null);
    } catch (err) {
      addToast(err.message || "Failed to create account", "error");
    }
  };

  const sectionProps = (category) => ({
    category,
    accounts: category === "ASSET" ? month.assets : month.liabilities,
    available: availableFor(category),
    isSaving,
    editingAccountId,
    editBalance,
    onEditBalanceChange: setEditBalance,
    onStartEdit: startEdit,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: cancelEdit,
    onDelete: handleDelete,
    isAdding: addingCategory === category,
    onStartAdd: () => setAddingCategory(category),
    onCancelAdd: () => setAddingCategory(null),
    onAddExisting: handleAddExisting,
    onCreate: (fields) => handleCreate(category, fields),
  });

  return (
    <Modal
      onClose={onClose}
      panelClassName="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl border border-slate-200 shadow-2xl mx-4 sm:mx-0 flex flex-col"
    >
      <div className="sticky top-0 bg-white border-b border-slate-100 px-3 sm:px-5 py-2.5 sm:py-3.5 z-10 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
              {title}
            </h2>
            <div className="text-lg font-bold text-blue-700">
              {currencyFormatter.format(month.netWorth)}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-700 cursor-pointer flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!month.hasData && (
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
                Click the + button below to add account balances for {title}
              </p>
            </div>
          </div>
        )}

        <div className="border-b border-slate-100">
          <AccountSection {...sectionProps("ASSET")} />
        </div>
        <AccountSection {...sectionProps("LIABILITY")} />
      </div>
    </Modal>
  );
}

function AccountSection({
  category,
  accounts,
  available,
  isSaving,
  editingAccountId,
  editBalance,
  onEditBalanceChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  isAdding,
  onStartAdd,
  onCancelAdd,
  onAddExisting,
  onCreate,
}) {
  const s = SECTION[category];
  const { HeadingIcon, RowIcon } = s;

  return (
    <div className="px-3 sm:px-5 py-4 sm:py-5">
      <div className="flex justify-between items-center mb-3 gap-2">
        <h3
          className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${s.heading}`}
        >
          <HeadingIcon size={16} />
          {s.title}
        </h3>
        <button
          onClick={onStartAdd}
          disabled={isSaving}
          aria-label={`Add to ${s.title.toLowerCase()}`}
          className={`flex items-center gap-2 px-3 py-1.5 text-white rounded-lg font-semibold hover:cursor-pointer flex-shrink-0 disabled:opacity-50 transition-colors ${s.solid}`}
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="space-y-2">
        {accounts.map((account) => (
          <div key={account.accountId}>
            <div
              className={`rounded-lg p-2 border flex justify-between items-center gap-3 ${s.row}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <RowIcon size={16} className={`flex-shrink-0 ${s.rowIcon}`} />
                <span className="text-slate-700 font-medium text-sm truncate">
                  {account.accountName}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-block flex-shrink-0"
                  style={s.badge}
                >
                  {account.accountType}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                <div className="flex flex-col items-end gap-0.5">
                  <span
                    className={`font-bold text-sm sm:text-base ${s.balance}`}
                  >
                    {currencyFormatter.format(account.balance)}
                  </span>
                  {account.change !== null && (
                    <div
                      className={`text-xs font-medium ${s.good(account.change) ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {account.change >= 0 ? "+" : ""}
                      {currencyFormatter.format(account.change)}
                      <span className="ml-1 opacity-75">
                        ({account.change >= 0 ? "+" : ""}
                        {account.changePercent.toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onStartEdit(account)}
                    aria-label={`Edit ${account.accountName}`}
                    className="p-1.5 text-blue-600 rounded-md hover:bg-blue-200 hover:text-blue-800 transition-colors duration-200 hover:cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(account)}
                    disabled={isSaving}
                    aria-label={`Remove ${account.accountName} from this month`}
                    className="p-1.5 text-rose-500 rounded-md hover:bg-rose-200 hover:text-rose-700 transition-colors duration-200 hover:cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            {editingAccountId === account.accountId && (
              <div className="mt-2 sm:p-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editBalance}
                    onChange={(e) => onEditBalanceChange(e.target.value)}
                    placeholder="0.00"
                    aria-label={`New balance for ${account.accountName}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => onSaveEdit(account)}
                    disabled={isSaving}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm flex-shrink-0"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={onCancelEdit}
                    disabled={isSaving}
                    className="px-3 sm:px-4 py-2 text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 text-sm flex-shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <AddAccountForm
            category={category}
            available={available}
            isSaving={isSaving}
            onAddExisting={onAddExisting}
            onCreate={onCreate}
            onCancel={onCancelAdd}
          />
        )}
      </div>
    </div>
  );
}

/** "Select Existing" / "Create New". Mounted fresh each time, so it always opens empty. */
function AddAccountForm({
  category,
  available,
  isSaving,
  onAddExisting,
  onCreate,
  onCancel,
}) {
  const s = SECTION[category];
  // Same cached query as the modal's; read here only for its loading/error state.
  const accounts = useAccounts();
  const [mode, setMode] = useState("select");
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState(category === "ASSET" ? ASSET_TYPES[0] : "");
  const [balance, setBalance] = useState("");
  const field = `w-full mt-2 px-3 py-2 border rounded-lg font-normal focus:outline-none focus:ring-2 text-sm ${s.input}`;
  const primary = `flex-1 px-3 py-2 text-white rounded-lg font-semibold disabled:opacity-50 text-sm transition-colors ${s.solid}`;

  const balanceField = (autoFocus) => (
    <label className={LABEL}>
      Balance
      <input
        type="text"
        inputMode="decimal"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        placeholder="0.00"
        className={field}
        disabled={isSaving}
        autoFocus={autoFocus}
      />
    </label>
  );

  return (
    <div className={`rounded-lg p-3 border border-dashed ${s.form}`}>
      <div className={`flex gap-2 mb-4 border-b pb-2 ${s.divider}`}>
        {[
          ["select", "Select Existing"],
          ["create", "Create New"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === key ? s.toggleOn : s.toggleOff}`}
            disabled={isSaving}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "select" && accounts.isLoadingError ? (
        <>
          <LoadError
            what="accounts"
            error={accounts.error}
            onRetry={() => accounts.refetch()}
            retrying={accounts.isFetching}
            card={false}
          />
          <button onClick={onCancel} className={`w-full ${CANCEL}`}>
            Cancel
          </button>
        </>
      ) : mode === "select" ? (
        <>
          <label className={LABEL}>
            Select Account
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={field}
              disabled={isSaving || accounts.isPending}
            >
              <option value="">
                {accounts.isPending
                  ? "Loading accounts…"
                  : available.length
                    ? "Choose an account..."
                    : "All accounts are already in this month"}
              </option>
              {available.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName} ({acc.accountType})
                </option>
              ))}
            </select>
          </label>
          {balanceField(true)}
          <div className="flex gap-2">
            <button
              onClick={() =>
                onAddExisting(
                  available.find((acc) => String(acc.id) === selectedId),
                  balance,
                )
              }
              disabled={isSaving}
              className={primary}
            >
              {isSaving ? "Adding..." : "Add"}
            </button>
            <button onClick={onCancel} disabled={isSaving} className={CANCEL}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <label className={LABEL}>
            Account Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={s.namePlaceholder}
              className={field}
              disabled={isSaving}
              autoFocus
            />
          </label>
          <label className={LABEL}>
            Account Type
            {category === "ASSET" ? (
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={field}
                disabled={isSaving}
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g., Credit Card, Mortgage"
                className={field}
                disabled={isSaving}
              />
            )}
          </label>
          {balanceField(false)}
          <div className="flex gap-2">
            <button
              onClick={() => onCreate({ name, type, raw: balance })}
              disabled={isSaving}
              className={primary}
            >
              {isSaving ? "Creating..." : "Create & Add"}
            </button>
            <button onClick={onCancel} disabled={isSaving} className={CANCEL}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
