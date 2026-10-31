import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import Modal from "../../library/components/Modal";
import { useIncomeSources } from "../hooks/useIncomeSources.js";
import {
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
} from "../api.js";
import { INCOME_SOURCES_KEY } from "../hooks/queryKeys.js";
import { Currencyformatter } from "../utils/currency.js";
import {
  getIncomeYears,
  getSourcesForYear,
  getYearTotal,
  getIncomeYoY,
} from "../utils/income.js";
import { useToast } from "../../../context/ToastContext";

export const IncomeHistory = () => {
  const { data: incomeSources, isLoading } = useIncomeSources();
  const queryClient = useQueryClient();
  const addToast = useToast();

  const years = useMemo(() => getIncomeYears(incomeSources), [incomeSources]);
  const currentYear = new Date().getFullYear();
  // Years added locally via "+ Year" before they have any data saved yet
  const [manualYears, setManualYears] = useState([]);
  const availableYears = useMemo(
    () => [...new Set([...years, ...manualYears])].sort((a, b) => a - b),
    [years, manualYears],
  );
  const [selectedYear, setSelectedYear] = useState(null);
  const activeYear =
    selectedYear ?? availableYears[availableYears.length - 1] ?? null;

  const [editingSource, setEditingSource] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", amount: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [yearInput, setYearInput] = useState("");

  const sources = getSourcesForYear(incomeSources, activeYear);
  const total = getYearTotal(incomeSources, activeYear);
  const { change, changePercent } = getIncomeYoY(incomeSources, activeYear);

  const openAddForm = () => {
    setFormData({ name: "", amount: "" });
    setIsAdding(true);
  };

  const openEditForm = (source) => {
    setFormData({ name: source.name, amount: source.amount.toString() });
    setEditingSource(source);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingSource(null);
  };

  const handleSave = async () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      addToast("Please enter a valid amount", "error");
      return;
    }
    if (!formData.name.trim()) {
      addToast("Please enter a source name", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (editingSource) {
        await updateIncomeSource(editingSource.id, formData.name, amount);
        addToast("Income source updated", "success");
      } else {
        await createIncomeSource(activeYear, formData.name, amount);
        addToast("Income source added", "success");
      }
      await queryClient.invalidateQueries({ queryKey: INCOME_SOURCES_KEY });
      closeForm();
    } catch (err) {
      addToast(err.message || "Failed to save income source", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openAddYearForm = () => {
    setYearInput(String(currentYear - 1));
    setIsAddingYear(true);
  };

  const closeAddYearForm = () => {
    setIsAddingYear(false);
    setYearInput("");
  };

  const handleSaveYear = () => {
    const year = parseInt(yearInput, 10);
    if (isNaN(year) || String(year).length !== 4) {
      addToast("Please enter a valid 4-digit year", "error");
      return;
    }

    setManualYears((prev) => [...new Set([...prev, year])]);
    setSelectedYear(year);
    closeAddYearForm();
  };

  const handleDelete = async (source) => {
    if (!confirm(`Delete ${source.name}?`)) return;

    try {
      await deleteIncomeSource(source.id);
      addToast(`${source.name} deleted`, "success");
      await queryClient.invalidateQueries({ queryKey: INCOME_SOURCES_KEY });
    } catch (err) {
      addToast(err.message || "Failed to delete income source", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  }

  if (!activeYear) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 bg-white rounded-2xl p-10 border border-slate-200 shadow-xl text-center">
        <p className="text-slate-500 text-sm">
          No income history yet. Add a year to get started.
        </p>
        <button
          onClick={openAddYearForm}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm hover:cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Year</span>
        </button>
        {isAddingYear && (
          <Modal
            onClose={closeAddYearForm}
            panelClassName="bg-white w-full max-w-xs rounded-xl border border-slate-200 shadow-2xl mx-4 sm:mx-0 p-5 text-left"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Year</h3>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Year
            </label>
            <input
              type="number"
              autoFocus
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={String(currentYear - 1)}
            />
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeAddYearForm}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-100 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveYear}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white hover:cursor-pointer"
              >
                Save
              </button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 md:gap-2 overflow-x-auto">
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-3 md:px-5 py-1.5 rounded-lg font-semibold text-xs md:text-sm transition-all whitespace-nowrap border hover:cursor-pointer ${
              activeYear === year
                ? "bg-emerald-600 text-white border-emerald-600 shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
            }`}
          >
            {year}
          </button>
        ))}
        <button
          onClick={openAddYearForm}
          title="Add a previous year"
          className="flex items-center gap-1 px-3 md:px-4 py-1.5 rounded-lg font-semibold text-xs md:text-sm whitespace-nowrap border border-dashed border-slate-300 text-slate-500 hover:bg-slate-100 hover:cursor-pointer"
        >
          <Plus size={14} />
          <span>Year</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            Income — {activeYear}
          </h2>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm hover:cursor-pointer"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>

        <div className="grid grid-cols-2 pb-2 border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div>Source</div>
          <div className="text-right">Amount</div>
        </div>

        {sources.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-sm">
            No income sources yet for {activeYear}. Click + Add to get started.
          </div>
        )}

        {sources.map((source) => (
          <div
            key={source.id}
            className="grid grid-cols-2 items-center py-3 border-b border-slate-100"
          >
            <div className="font-semibold text-slate-800 truncate pr-2">
              {source.name}
            </div>
            <div className="flex items-center justify-end gap-3 sm:gap-4">
              <span className="font-bold text-emerald-600 whitespace-nowrap">
                {Currencyformatter.format(source.amount)}
              </span>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => openEditForm(source)}
                  className="p-1 text-blue-600 hover:text-blue-700 hover:cursor-pointer"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(source)}
                  className="p-1 text-rose-600 hover:text-rose-700 hover:cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 items-center py-3 px-3 mt-1 bg-emerald-50 rounded-lg border border-emerald-100">
          <div className="font-bold text-slate-800">Total</div>
          <div className="text-right font-extrabold text-base sm:text-lg text-emerald-700 whitespace-nowrap">
            {Currencyformatter.format(total)}
          </div>
        </div>

        <div className="grid grid-cols-2 items-center pt-3">
          <div className="text-xs sm:text-sm text-slate-400">
            Year-over-Year Change
          </div>
          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
            {change >= 0 ? (
              <TrendingUp className="text-emerald-600" size={16} />
            ) : (
              <TrendingDown className="text-rose-600" size={16} />
            )}
            <span
              className={`font-semibold ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}
            >
              {change >= 0 ? "+" : ""}
              {Currencyformatter.format(change)} ({change >= 0 ? "+" : "-"}
              {Math.abs(changePercent).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {(isAdding || editingSource) && (
        <Modal
          onClose={closeForm}
          panelClassName="bg-white w-full max-w-sm rounded-xl border border-slate-200 shadow-2xl mx-4 sm:mx-0 p-5"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingSource
              ? "Edit Income Source"
              : `Add Income Source — ${activeYear}`}
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Source
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Base Salary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={closeForm}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-100 hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white hover:cursor-pointer disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {isAddingYear && (
        <Modal
          onClose={closeAddYearForm}
          panelClassName="bg-white w-full max-w-xs rounded-xl border border-slate-200 shadow-2xl mx-4 sm:mx-0 p-5"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">Add Year</h3>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Year
          </label>
          <input
            type="number"
            autoFocus
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={String(currentYear - 1)}
          />
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={closeAddYearForm}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-100 hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveYear}
              className="px-4 py-2 rounded-lg font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white hover:cursor-pointer"
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
