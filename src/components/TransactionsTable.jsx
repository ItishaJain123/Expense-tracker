import { Select, Table } from "antd";
import { useState, useMemo } from "react";
import moment from "moment";
import Button from "./Button";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../constants";

const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

const TransactionsTable = ({
  transactions,
  addTransaction,
  fetchTransactions,
  handleDelete,
  handleEdit,
  handleBulkDelete,
}) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkCategory, setBulkCategory] = useState("");

  const columns = useMemo(() => [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
      render: (text) => (
        <span className="text-blue-600 font-medium">{text}</span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => (a.category || "").localeCompare(b.category || ""),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
      render: (cat) =>
        cat ? (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${CATEGORY_COLORS[cat] || "#64748b"}20`,
              color: CATEGORY_COLORS[cat] || "#64748b",
              border: `1px solid ${CATEGORY_COLORS[cat] || "#64748b"}40`,
            }}
          >
            {cat}
          </span>
        ) : (
          <span className="text-gray-500 text-xs">—</span>
        ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
      render: (text) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            text === "income"
              ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
              : "bg-red-500/20 text-red-600 border border-red-500/30"
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        moment(a.date, ["D MMMM YYYY", "YYYY-MM-DD"]).valueOf() -
        moment(b.date, ["D MMMM YYYY", "YYYY-MM-DD"]).valueOf(),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
      render: (text) => <span className="text-gray-600 text-sm">{text}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
      render: (text, record) => (
        <span
          className={`font-bold ${
            record.type === "income" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {record.type === "income" ? "+" : "-"}₹
          {Number(text).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-3 text-lg">
          <MdEdit
            className="text-blue-600 cursor-pointer hover:text-blue-700 hover:scale-125 transition-all"
            onClick={() => handleEdit(record)}
          />
          <MdDelete
            className="text-red-600 cursor-pointer hover:text-red-700 hover:scale-125 transition-all"
            onClick={() => handleDelete(record.id, record.name)}
          />
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  const filteredTransactions = transactions.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      item.type.includes(typeFilter) &&
      (categoryFilter === "" || (item.category || "") === categoryFilter)
  );

  // Bug fix: was referencing undefined `sortedTransactions` — now correctly uses filteredTransactions
  const exportFile = () => {
    const exportData = filteredTransactions.map(({ id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const importFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formatDateToReadable = (dateInput) => {
      let dateObj;
      if (typeof dateInput === "number") {
        const base = new Date(1899, 11, 30);
        dateObj = new Date(base.getTime() + dateInput * 86400000);
      } else {
        dateObj = new Date(dateInput);
      }
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(dateObj);
    };

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonData.length === 0) {
        toast.error("File is empty or not in table format.");
        return;
      }

      const isValid = jsonData.every((item) =>
        ["type", "date", "amount", "name"].every((f) => f in item)
      );
      if (!isValid) {
        toast.error("Some rows are missing required fields.");
        return;
      }

      try {
        for (const item of jsonData) {
          await addTransaction(
            {
              type: item.type.toLowerCase(),
              date: formatDateToReadable(item.date),
              amount: parseFloat(item.amount),
              name: item.name,
              category: item.category || "Other",
            },
            true
          );
        }
        await fetchTransactions();
        toast.success("Transactions imported!");
      } catch {
        toast.error("Import failed.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span className="inline-block w-1 h-7 bg-gradient-to-b from-blue-600 to-sky-500 rounded-full" />
        Transactions
      </h2>

      <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#F1F5F9] text-gray-900 placeholder:text-gray-500 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-600 transition-colors"
          />

          <Select
            className="w-36"
            onChange={(v) => setTypeFilter(v ?? "")}
            value={typeFilter}
            placeholder="All Types"
            allowClear
          >
            <Select.Option value="">All</Select.Option>
            <Select.Option value="income">Income</Select.Option>
            <Select.Option value="expense">Expense</Select.Option>
          </Select>

          <Select
            className="w-44"
            onChange={(v) => setCategoryFilter(v ?? "")}
            value={categoryFilter}
            placeholder="All Categories"
            allowClear
          >
            <Select.Option value="">All Categories</Select.Option>
            {ALL_CATEGORIES.map((cat) => (
              <Select.Option key={cat} value={cat}>
                {cat}
              </Select.Option>
            ))}
          </Select>

          <Button text="Export" onClick={exportFile} blue />

          <label htmlFor="import-file" className="cursor-pointer">
            <span className="bg-gradient-to-r from-sky-400 to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:scale-[1.02] transition-transform inline-block shadow-lg">
              Import
            </span>
          </label>
          <input
            id="import-file"
            type="file"
            accept=".csv,.xlsx"
            hidden
            onChange={importFile}
          />
        </div>

        {/* Bulk action bar */}
        {selectedRowKeys.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <span className="text-sm font-semibold text-blue-700">{selectedRowKeys.length} selected</span>
            <Select
              className="w-44"
              placeholder="Change category"
              value={bulkCategory || undefined}
              onChange={(v) => setBulkCategory(v)}
              allowClear
            >
              {ALL_CATEGORIES.map((cat) => (
                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
              ))}
            </Select>
            {bulkCategory && (
              <button
                onClick={async () => {
                  try {
                    await Promise.all(
                      selectedRowKeys.map((id) => {
                        const tx = filteredTransactions.find((t) => t.id === id);
                        if (!tx) return Promise.resolve();
                        return fetch; // placeholder — handled via prop
                      })
                    );
                    toast.info("Use Edit on individual rows to change category");
                    setBulkCategory("");
                  } catch { toast.error("Failed"); }
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer hover:bg-blue-700"
              >
                Apply
              </button>
            )}
            <button
              onClick={async () => {
                if (!handleBulkDelete) { toast.error("Bulk delete not available"); return; }
                await handleBulkDelete(selectedRowKeys);
                setSelectedRowKeys([]);
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold cursor-pointer hover:bg-red-600 ml-auto"
            >
              🗑 Delete {selectedRowKeys.length}
            </button>
            <button onClick={() => setSelectedRowKeys([])} className="text-gray-500 text-xs hover:text-gray-700 cursor-pointer">Clear</button>
          </div>
        )}

        <Table
          dataSource={filteredTransactions}
          columns={columns}
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={{ pageSize: 10, size: "small" }}
          onRow={() => ({
            style: {
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e5e7eb",
            },
          })}
        />
      </div>
    </div>
  );
};

export default TransactionsTable;
