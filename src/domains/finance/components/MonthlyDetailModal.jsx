import { X, Plus, Wallet, Edit2, Trash2 } from "lucide-react";
import Modal from "../../library/components/Modal";
import { Currencyformatter } from "../utils/currency";

export function MonthlyDetailModal({ selectedMonth, selectedYear, onClose }) {
  const C = {
    networth: "text-blue-700",
    asset: "text-emerald-700",
    liab: "text-rose-700",
    pos: "text-emerald-600",
    neg: "text-rose-600",
    posBadge: "bg-emerald-100 text-emerald-700",
    negBadge: "bg-rose-100 text-rose-700",
  };

  const CATEGORIES = {
    "Cash & Savings": { label: "Cash & Savings", color: "#10b981" },
    Investments: { label: "Investments", color: "#8b5cf6" },
    Retirement: { label: "Retirement", color: "#3b82f6" },
    Property: { label: "Property", color: "#f59e0b" },
  };
  const catColor = (t) => (CATEGORIES[t] || {}).color;
  const catLabel = (t) => (CATEGORIES[t] || {}).label;

  const assetAccounts = selectedMonth.accounts
    .filter((account) => account.category === "ASSET")
    .sort((a, b) => a.accountType.localeCompare(b.accountType));

  const liabilityAccounts = selectedMonth.accounts
    .filter((account) => account.category === "LIABILITY")
    .sort((a, b) => a.accountType.localeCompare(b.accountType));

  return (
    <Modal
      onClose={onClose}
      panelClassName="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 shadow-2xl"
    >
      <div className="sticky top-0 bg-white border-b border-slate-100 px-4 sm:px-5 py-3.5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              {selectedMonth.month} {selectedYear}
            </h2>
            <div className="flex gap-5">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  Assets
                </div>
                <div className={`text-lg font-bold ${C.asset}`}>
                  {Currencyformatter.format(selectedMonth.assets)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  Liabilities
                </div>
                <div className={`text-lg font-bold ${C.liab}`}>
                  {Currencyformatter.format(selectedMonth.liabilities)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  Net Worth
                </div>
                <div className={`text-lg font-bold ${C.networth}`}>
                  {Currencyformatter.format(selectedMonth.netWorth)}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 hover: cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Assets */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-slate-800">Assets</h3>
            <button
              //onClick={() => setIsAddingAccount(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold"
            >
              <Plus size={14} />
              Add Asset
            </button>
          </div>
          {/* {isAddingAccount && (
            <div className="bg-emerald-50 rounded-lg p-4 mb-3 border-2 border-emerald-200">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Account name"
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
                />
                <input
                  type="number"
                  placeholder="Value"
                  value={newAccount.value}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, value: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
                />
                <select
                  value={newAccount.type}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, type: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
                >
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAccount}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingAccount(false);
                      setNewAccount({ name: "", value: "", type: "cash" });
                    }}
                    className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )} */}
          <div className="space-y-2">
            {assetAccounts.map((account, accountIndex) => {
              //   if (
              //     deleteConfirm?.type === "account" &&
              //     deleteConfirm?.id === accountIndex
              //   )
              //     return (
              //       <DeleteConfirmRow
              //         key={accountIndex}
              //         label={account.name}
              //         onConfirm={() => handleDeleteAccount(accountIndex)}
              //         onCancel={() => setDeleteConfirm(null)}
              //       />
              //     );
              //   if (
              //     editingAccount &&
              //     editingAccount.accountIndex === accountIndex
              //   )
              //     return (
              //       <div
              //         key={accountIndex}
              //         className="bg-emerald-50 rounded-lg p-3 border-2 border-emerald-200"
              //       >
              //         <div className="space-y-2">
              //           <input
              //             type="text"
              //             value={editingAccount.name}
              //             onChange={(e) =>
              //               setEditingAccount({
              //                 ...editingAccount,
              //                 name: e.target.value,
              //               })
              //             }
              //             className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
              //           />
              //           <input
              //             type="number"
              //             value={editingAccount.value}
              //             onChange={(e) =>
              //               setEditingAccount({
              //                 ...editingAccount,
              //                 value: e.target.value,
              //               })
              //             }
              //             className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
              //           />
              //           <div className="flex gap-2">
              //             <button
              //               onClick={() => {
              //                 const u = [...pendingChanges.accounts];
              //                 u[accountIndex] = {
              //                   name: editingAccount.name,
              //                   value: parseFloat(editingAccount.value),
              //                   type: editingAccount.type,
              //                 };
              //                 setPendingChanges({
              //                   ...pendingChanges,
              //                   accounts: u,
              //                 });
              //                 setHasUnsavedChanges(true);
              //                 setEditingAccount(null);
              //               }}
              //               className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm"
              //             >
              //               Update
              //             </button>
              //             <button
              //               onClick={() => setEditingAccount(null)}
              //               className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm"
              //             >
              //               Cancel
              //             </button>
              //           </div>
              //         </div>
              //       </div>
              //     );
              return (
                <div
                  key={accountIndex}
                  className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 flex justify-between items-center hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-emerald-500" />
                    <span className="text-slate-700 font-medium text-sm">
                      {account.accountName}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: catColor(account.accountType) + "22",
                        color: catColor(account.accountType),
                      }}
                    >
                      {catLabel(account.accountType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${C.asset}`}>
                      {Currencyformatter.format(account.balance)}
                    </span>
                    <button
                      //onClick={() => handleEditAccount(account, accountIndex)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      //   onClick={() =>
                      //     setDeleteConfirm({ type: "account", id: accountIndex })
                      //   }
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Liabilities */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-slate-800">
              Liabilities
            </h3>
            <button
              //onClick={() => setIsAddingLiability(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold"
            >
              <Plus size={14} />
              Add Liability
            </button>
          </div>
          {/* {isAddingLiability && (
            <div className="bg-rose-50 rounded-lg p-4 mb-3 border-2 border-rose-200">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Liability name (e.g. Mortgage)"
                  value={newLiability.name}
                  onChange={(e) =>
                    setNewLiability({ ...newLiability, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
                />
                <input
                  type="number"
                  placeholder="Balance owed"
                  value={newLiability.value}
                  onChange={(e) =>
                    setNewLiability({ ...newLiability, value: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
                />
                <select
                  value={newLiability.type}
                  onChange={(e) =>
                    setNewLiability({ ...newLiability, type: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
                >
                  <option value="mortgage">Mortgage</option>
                  <option value="auto">Auto Loan</option>
                  <option value="student">Student Loan</option>
                  <option value="credit">Credit Card</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddLiability}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingLiability(false);
                      setNewLiability({
                        name: "",
                        value: "",
                        type: "mortgage",
                      });
                    }}
                    className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )} */}
          <div className="space-y-2">
            {liabilityAccounts.map((liability, liabIndex) => {
            //   if (
            //     deleteConfirm?.type === "liability" &&
            //     deleteConfirm?.id === liabIndex
            //   )
            //     return (
            //       <DeleteConfirmRow
            //         key={liabIndex}
            //         label={liab.name}
            //         onConfirm={() => handleDeleteLiability(liabIndex)}
            //         onCancel={() => setDeleteConfirm(null)}
            //       />
            //     );
            //   if (editingLiability && editingLiability.liabIndex === liabIndex)
            //     return (
            //       <div
            //         key={liabIndex}
            //         className="bg-rose-50 rounded-lg p-3 border-2 border-rose-200"
            //       >
            //         <div className="space-y-2">
            //           <input
            //             type="text"
            //             value={editingLiability.name}
            //             onChange={(e) =>
            //               setEditingLiability({
            //                 ...editingLiability,
            //                 name: e.target.value,
            //               })
            //             }
            //             className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
            //           />
            //           <input
            //             type="number"
            //             value={editingLiability.value}
            //             onChange={(e) =>
            //               setEditingLiability({
            //                 ...editingLiability,
            //                 value: e.target.value,
            //               })
            //             }
            //             className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 text-sm"
            //           />
            //           <div className="flex gap-2">
            //             <button
            //               onClick={() => {
            //                 const u = [...(pendingChanges.liabilities || [])];
            //                 u[liabIndex] = {
            //                   name: editingLiability.name,
            //                   value: parseFloat(editingLiability.value),
            //                   type: editingLiability.type,
            //                 };
            //                 setPendingChanges({
            //                   ...pendingChanges,
            //                   liabilities: u,
            //                 });
            //                 setHasUnsavedChanges(true);
            //                 setEditingLiability(null);
            //               }}
            //               className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-sm"
            //             >
            //               Update
            //             </button>
            //             <button
            //               onClick={() => setEditingLiability(null)}
            //               className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm"
            //             >
            //               Cancel
            //             </button>
            //           </div>
            //         </div>
            //       </div>
            //     );
              return (
                <div
                  key={liabIndex}
                  className="bg-rose-50 rounded-lg p-3 border border-rose-200 flex justify-between items-center hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2">
                    {/* <LiabilityIcon type={liab.type} /> */}
                    <span className="text-slate-700 font-medium text-sm">
                      {liability.accountName}
                    </span>
                    <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                      {liability.accountType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${C.liab}`}>
                      {Currencyformatter.format(liability.balance)}
                    </span>
                    <button
                      //onClick={() => handleEditLiability(liab, liabIndex)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                    //   onClick={() =>
                    //     setDeleteConfirm({ type: "liability", id: liabIndex })
                    //   }
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })} 
          </div>
        </div>

        {/* {hasUnsavedChanges && (
          <button
            onClick={handleSaveAllChanges}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all mt-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        )} */}
      </div>
    </Modal>
  );
}
