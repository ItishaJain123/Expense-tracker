import { Form, Modal, Input, DatePicker, Button, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { INCOME_CATEGORIES } from "../../constants";

const MODAL_STYLES = {
  content: { background: "#FFFFFF", borderRadius: "1rem", border: "1px solid #e5e7eb" },
  header: { background: "#FFFFFF", borderBottom: "1px solid #e5e7eb" },
  mask: { backdropFilter: "blur(4px)" },
};

const AddIncome = ({ isIncomeModalVisible, handleIncomeCancel, onFinish, accounts = [] }) => {
  const [form] = Form.useForm();
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (isIncomeModalVisible && accounts.length > 0) {
      form.setFieldsValue({ accountId: accounts[0].id });
    }
    if (!isIncomeModalVisible) form.resetFields();
  }, [isIncomeModalVisible, accounts, form]);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input not supported in this browser"); return; }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); toast.error("Could not understand, please try again"); };
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      const amountMatch = text.match(/\b\d+(\.\d+)?\b/);
      const amount = amountMatch ? amountMatch[0] : "";
      const name = text
        .replace(/\b\d+(\.\d+)?\b/g, "")
        .replace(/\b(rupees?|rs\.?|received|got|earned|from)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
      form.setFieldsValue({ name: name || text, amount });
      toast.success(`Heard: "${text}"`);
    };
    rec.start();
  };

  return (
    <Modal
      title={<span className="text-lg font-semibold text-emerald-600">➕ Add Income</span>}
      open={isIncomeModalVisible}
      onCancel={handleIncomeCancel}
      footer={null}
      centered
      styles={MODAL_STYLES}
    >
      {/* Voice toolbar */}
      <div className="flex gap-2 mt-4 mb-4">
        <button
          type="button"
          onClick={startListening}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            listening
              ? "bg-red-50 border-red-300 text-red-600 animate-pulse"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          🎤 {listening ? "Listening…" : "Voice Input"}
        </button>
        <span className="text-xs text-gray-400 self-center">speak to auto-fill name & amount</span>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => { onFinish(values, "income"); form.resetFields(); }}
      >
        <Form.Item label={<span className="text-gray-600 text-sm">Name</span>} name="name" rules={[{ required: true, message: "Please enter a name" }]}>
          <Input placeholder="e.g. Monthly Salary" className="bg-gray-50 border-gray-200 text-gray-900 rounded-lg" />
        </Form.Item>
        <Form.Item label={<span className="text-gray-600 text-sm">Category</span>} name="category" rules={[{ required: true, message: "Please select a category" }]}>
          <Select placeholder="Select category" className="w-full">
            {INCOME_CATEGORIES.map((cat) => <Select.Option key={cat} value={cat}>{cat}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item label={<span className="text-gray-600 text-sm">Amount (₹)</span>} name="amount" rules={[{ required: true, message: "Please enter an amount" }]}>
          <Input type="number" min={0} placeholder="e.g. 50000" className="bg-gray-50 border-gray-200 text-gray-900 rounded-lg" />
        </Form.Item>
        <Form.Item label={<span className="text-gray-600 text-sm">Date</span>} name="date" rules={[{ required: true, message: "Please select a date" }]}>
          <DatePicker format="D MMMM YYYY" className="w-full rounded-lg border-gray-200" />
        </Form.Item>
        {accounts.length > 0 && (
          <Form.Item label={<span className="text-gray-600 text-sm">Account</span>} name="accountId" rules={[{ required: true, message: "Please select an account" }]}>
            <Select placeholder="Select account" className="w-full">
              {accounts.map((a) => (
                <Select.Option key={a.id} value={a.id}>
                  {a.name} — ₹{Number(a.balance).toLocaleString("en-IN")}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item className="mb-0 text-right mt-6">
          <Button htmlType="submit" className="bg-emerald-500 hover:bg-emerald-600 border-none text-white font-semibold px-6 rounded-xl">
            Add Income
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddIncome;
