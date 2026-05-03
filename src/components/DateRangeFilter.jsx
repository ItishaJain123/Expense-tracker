import { useState, useEffect } from "react";
import Button from "./Button";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const DateRangeFilter = ({ handleDateChange, setInitialDateRange }) => {
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);

    const format = (date) =>
      date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    const initialStart = format(tenDaysAgo);
    const initialEnd = format(today);

    setTempStartDate(initialStart);
    setTempEndDate(initialEnd);

    if (setInitialDateRange) {
      setInitialDateRange({ start: initialStart, end: initialEnd });
    }
  }, []);

  const handleSubmit = () => {
    if (new Date(tempStartDate) > new Date(tempEndDate)) {
      toast.error("Start date cannot be after end date.");
      return;
    }
    handleDateChange(tempStartDate, tempEndDate);
  };

  return (
    <div className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5 shadow-xl mb-8">
      <h3 className="text-gray-300 font-semibold mb-4 flex items-center gap-2 text-sm">
        <span>📅</span> Filter by Date Range
      </h3>
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Start Date
          </label>
          <DatePicker
            value={tempStartDate ? dayjs(tempStartDate) : null}
            format="D MMM YYYY"
            onChange={(date) =>
              setTempStartDate(dayjs(date).format("YYYY-MM-DD"))
            }
            className="rounded-xl border-gray-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            End Date
          </label>
          <DatePicker
            value={tempEndDate ? dayjs(tempEndDate) : null}
            format="D MMM YYYY"
            onChange={(date) =>
              setTempEndDate(dayjs(date).format("YYYY-MM-DD"))
            }
            className="rounded-xl border-gray-200"
          />
        </div>
        <Button text="Apply Filter" onClick={handleSubmit} blue />
      </div>
    </div>
  );
};

export default DateRangeFilter;
