import { Radio, Select, Table } from "antd";
import { useState } from "react";
import Button from "./Button";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { MdEdit, MdDelete } from "react-icons/md";

const TransactionsTable = ({
  transactions,
  addTransaction,
  fetchTransactions,
  handleDelete,
  handleEdit,
}) => {
  const { Option } = Select;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [exportType, setExportType] = useState("xlsx");

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-blue-500">{text}</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <span
          className={`font-semibold ${
            text === "income" ? "text-green-500" : "text-red-500"
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
      render: (text) => <span className="text-pink-500">{text}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <span className="text-yellow-500">₹{text}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-4 text-lg">
          <MdEdit
            className="text-green-400 cursor-pointer hover:scale-150 transition"
            onClick={() => handleEdit(record)}
          />
          <MdDelete
            className="text-red-400 cursor-pointer hover:scale-150 transition"
            onClick={() => handleDelete(record.id, record.name)}
          />
        </div>
      ),
    },
  ];

  const filteredTransactions = transactions.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      item.type.includes(typeFilter)
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    } else {
      return 0;
    }
  });

  const exportFile = () => {
    const exportData = sortedTransactions.map(({ id, ...rest }) => rest);

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    const fileName = `transactions_${new Date()
      .toISOString()
      .slice(0, 10)}.${exportType}`;

    XLSX.writeFile(wb, fileName);
  };

  const importFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formatDateToReadable = (dateInput) => {
      let dateObj;

      if (typeof dateInput === "number") {
        const excelBaseDate = new Date(1899, 11, 30);
        dateObj = new Date(excelBaseDate.getTime() + dateInput * 86400000);
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

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonData.length === 0) {
        toast.error("Imported file is empty or not in table format.");
        return;
      }

      const requiredFields = ["type", "date", "amount", "tag", "name"];
      const isValid = jsonData.every((item) =>
        requiredFields.every((field) => field in item)
      );

      if (!isValid) {
        toast.error("Some rows are missing required fields.");
        return;
      }

      try {
        for (const item of jsonData) {
          const formatted = {
            type: item.type.toLowerCase(),
            date: formatDateToReadable(item.date),
            amount: parseFloat(item.amount),
            name: item.name,
            tag: item.tag,
          };
          await addTransaction(formatted, true);
        }

        await fetchTransactions();
        toast.success("File imported and transactions saved!");
      } catch (err) {
        console.log(err);
        toast.error("Import failed. Try again.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <div className="my-6">
        <h2 className="text-3xl font-bold text-center text-white py-6">
          📊 Transactions
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Search by Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1e293b] text-white placeholder:text-gray-400 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:border-blue-400 transition-all duration-300"
            />
          </div>

          <Select
            className="w-40"
            onChange={(value) => setTypeFilter(value)}
            value={typeFilter}
            placeholder="Filter"
            allowClear
          >
            <Option value="">All</Option>
            <Option value="income">Income</Option>
            <Option value="expense">Expense</Option>
          </Select>

          <Radio.Group
            onChange={(e) => setSortKey(e.target.value)}
            value={sortKey}
            className="text-white"
          >
            <Radio.Button value="">No Sort</Radio.Button>
            <Radio.Button value="date">Sort by Date</Radio.Button>
            <Radio.Button value="amount">Sort by Amount</Radio.Button>
          </Radio.Group>

          <Button text="Export File" onClick={exportFile} blue />

          <label htmlFor="file-csv" className="cursor-pointer text-white">
            <span className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
              Import File
            </span>
          </label>
          <input
            id="file-csv"
            type="file"
            accept=".csv, .xlsx"
            hidden
            onChange={importFile}
          />
        </div>

        <Table
          dataSource={sortedTransactions}
          columns={columns}
          pagination={{ pageSize: 15 }}
          bordered={false}
          rowClassName={() => "ant-table-row-no-hover"}
          className="text-black"
          onRow={() => ({
            style: {
              backgroundColor: "#1f2937",
              color: "white",
            },
          })}
        />
      </div>
    </>
  );
};

export default TransactionsTable;
