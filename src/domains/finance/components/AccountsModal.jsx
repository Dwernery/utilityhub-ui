import { useState } from "react";
import { Archive, Edit2, TrendingDown, TrendingUp, X } from "lucide-react";
import { Modal } from "../../../components/Modal";
import { LoadError } from "../../../components/LoadError";
import { LoadingState } from "../../../components/LoadingState";
import { useAccounts } from "../hooks";
import { groupAccounts } from "../utils/accounts";
import { AccountEditForm } from "./AccountEditForm";

const SECTIONS = [
  {
    key: "assets",
    title: "Assets",
    Icon: TrendingUp,
    heading: "text-emerald-600",
  },
  {
    key: "liabilities",
    title: "Liabilities",
    Icon: TrendingDown,
    heading: "text-rose-600",
  },
  {
    key: "archived",
    title: "Archived",
    Icon: Archive,
    heading: "text-slate-500",
  },
];

/**
 * Every account, archived ones in their own section, each editable inline
 * (rename, retype, archive or unarchive). Mirrors utility-hub-mobile's
 * app/finances/accounts.tsx.
 */
export function AccountsModal({ onClose }) {
  const { data, isPending, isLoadingError, error, refetch, isFetching } =
    useAccounts();
  const [editingId, setEditingId] = useState(null);
  const groups = groupAccounts(data);

  return (
    <Modal
      onClose={onClose}
      panelClassName="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl border border-slate-200 shadow-2xl mx-4 sm:mx-0 flex flex-col"
    >
      <div className="flex justify-between items-center border-b border-slate-100 px-3 sm:px-5 py-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
          Accounts
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-5">
        {isPending ? (
          <LoadingState what="accounts" card={false} />
        ) : isLoadingError ? (
          <LoadError
            what="accounts"
            error={error}
            onRetry={() => refetch()}
            retrying={isFetching}
            card={false}
          />
        ) : (
          SECTIONS.map(({ key, title, Icon, heading }) => {
            const list = groups[key];
            if (key === "archived" && list.length === 0) return null;
            return (
              <section key={key}>
                <h3
                  className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 mb-2 ${heading}`}
                >
                  <Icon size={16} />
                  {title}
                </h3>
                {key === "archived" && (
                  <p className="text-xs text-slate-500 mb-2">
                    Not offered for new months. Past months keep their balances.
                  </p>
                )}
                <div className="space-y-2">
                  {list.length === 0 && (
                    <p className="text-slate-400 text-sm italic">None yet</p>
                  )}
                  {list.map((account) => (
                    <div key={account.id}>
                      <div className="rounded-lg p-2 border border-slate-200 flex justify-between items-center gap-3">
                        <div className="min-w-0">
                          <div
                            className={`font-medium text-sm truncate ${account.archived ? "text-slate-500" : "text-slate-800"}`}
                          >
                            {account.accountName}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {account.accountType}
                            {account.archived &&
                              ` · ${account.category === "ASSET" ? "Asset" : "Liability"}`}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setEditingId(
                              editingId === account.id ? null : account.id,
                            )
                          }
                          aria-label={`Edit ${account.accountName}`}
                          className="p-1.5 text-blue-600 rounded-md hover:bg-blue-100 hover:cursor-pointer flex-shrink-0"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                      {editingId === account.id && (
                        <AccountEditForm
                          account={account}
                          onDone={() => setEditingId(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </Modal>
  );
}
