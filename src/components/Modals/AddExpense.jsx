import { Form, Modal, Input, DatePicker, Button, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { EXPENSE_CATEGORIES } from "../../constants";

const MODAL_STYLES = {
  content: { background: "#FFFFFF", borderRadius: "1rem", border: "1px solid #e5e7eb" },
  header: { background: "#FFFFFF", borderBottom: "1px solid #e5e7eb" },
  mask: { backdropFilter: "blur(4px)" },
};

const detectCategory = (text) => {
  const t = text.toLowerCase();
  if (/food|lunch|dinner|breakfast|restaurant|zomato|swiggy|cafe|coffee|tea|snack|meal|eat|pizza|burger|biryani/.test(t)) return "Food & Dining";
  if (/uber|ola|auto|cab|metro|bus|train|petrol|fuel|bike|taxi|ride|transport|toll/.test(t)) return "Transport";
  if (/netflix|prime|movie|cinema|game|gaming|entertainment|show|concert|hotstar|disney/.test(t)) return "Entertainment";
  if (/amazon|flipkart|shopping|clothes|shirt|shoes|dress|bag|mall|meesho|myntra/.test(t)) return "Shopping";
  if (/doctor|hospital|medicine|pharmacy|gym|health|medical|clinic|tablet|checkup/.test(t)) return "Health";
  if (/electricity|water|internet|wifi|bill|mobile|recharge|utility|broadband/.test(t)) return "Utilities";
  if (/rent|house|flat|apartment|maintenance|housing|society/.test(t)) return "Rent & Housing";
  if (/school|college|book|course|education|tuition|class|study|fees/.test(t)) return "Education";
  if (/flight|hotel|trip|tour|vacation|holiday|travel|oyo|airbnb/.test(t)) return "Travel";
  return null;
};

const detectDate = (text) => {
  const t = text.toLowerCase();
  if (/today/.test(t)) return dayjs();
  if (/yesterday/.test(t)) return dayjs().subtract(1, "day");
  if (/day before yesterday/.test(t)) return dayjs().subtract(2, "day");
  const daysAgoMatch = t.match(/(\d+)\s*days?\s*ago/);
  if (daysAgoMatch) return dayjs().subtract(Number(daysAgoMatch[1]), "day");
  const weekdays = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  for (let i = 0; i < weekdays.length; i++) {
    if (t.includes(weekdays[i])) {
      const todayIdx = dayjs().day();
      const diff = ((todayIdx - i) + 7) % 7 || 7;
      return dayjs().subtract(diff, "day");
    }
  }
  return dayjs();
};

const AddExpense = ({ isExpenseModalVisible, handleExpenseCancel, onFinish }) => {
  const [form] = Form.useForm();
  const [ocrLoading, setOcrLoading] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!isExpenseModalVisible) form.resetFields();
  }, [isExpenseModalVisible, form]);

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
      const cleanName = text
        .replace(/\b\d+(\.\d+)?\b/g, "")
        .replace(/\b(rupees?|rs\.?|spent|paid|on|for|at|today|yesterday|day before yesterday|\d+ days? ago|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
      const category = detectCategory(text);
      const date = detectDate(text);
      form.setFieldsValue({
        name: cleanName || text,
        amount,
        ...(category ? { category } : {}),
        date,
      });
      toast.success(`🎤 "${text}" — filled in!`);
    };
    rec.start();
  };

  const handleReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      toast.error("Add VITE_GEMINI_API_KEY=your_key to your .env file to use Receipt OCR");
      return;
    }
    setOcrLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: `Extract from this receipt:
- name: merchant name or main item (2-4 words)
- amount: total amount as number only
- category: one of [Food & Dining, Shopping, Transport, Entertainment, Health, Utilities, Rent & Housing, Education, Travel, Other]
Reply ONLY with JSON: {"name":"","amount":0,"category":""}`
                  },
                  { inlineData: { mimeType: file.type, data: base64 } }
                ]
              }]
            }),
          }
        );
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const match = text.match(/\{[\s\S]*?\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          form.setFieldsValue({
            name: parsed.name || "",
            amount: parsed.amount || "",
            category: EXPENSE_CATEGORIES.includes(parsed.category) ? parsed.category : undefined,
            date: dayjs(),
          });
          toast.success("Receipt scanned!");
        } else {
          toast.error("Could not parse receipt — fill manually");
        }
      } catch {
        toast.error("Receipt scan failed");
      }
      setOcrLoading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <Modal
      title={<span className="text-lg font-semibold text-red-600">➖ Add Expense</span>}
      open={isExpenseModalVisible}
      onCancel={handleExpenseCancel}
      footer={null}
      centered
      styles={MODAL_STYLES}
    >
      {/* AI Toolbar */}
      <div className="flex flex-wrap gap-2 mt-4 mb-4">
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
        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${ocrLoading ? "bg-blue-50 border-blue-300 text-blue-600" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600"}`}>
          {ocrLoading ? "⏳ Scanning…" : "📷 Scan Receipt"}
          <input type="file" accept="image/*" hidden onChange={handleReceipt} disabled={ocrLoading} />
        </label>
        <span className="text-xs text-gray-400 self-center">auto-fills name, amount, category & date</span>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => { onFinish(values, "expense"); form.resetFields(); }}
      >
        <Form.Item label={<span className="text-gray-600 text-sm">Name</span>} name="name" rules={[{ required: true, message: "Please enter a name" }]}>
          <Input placeholder="e.g. Zomato Order, Netflix, Petrol" className="bg-gray-50 border-gray-200 text-gray-900 rounded-lg" />
        </Form.Item>
        <Form.Item label={<span className="text-gray-600 text-sm">Category</span>} name="category" rules={[{ required: true, message: "Please select a category" }]}>
          <Select placeholder="Select category" className="w-full">
            {EXPENSE_CATEGORIES.map((cat) => <Select.Option key={cat} value={cat}>{cat}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item label={<span className="text-gray-600 text-sm">Amount (₹)</span>} name="amount" rules={[{ required: true, message: "Please enter an amount" }]}>
          <Input type="number" min={0} placeholder="e.g. 2500" className="bg-gray-50 border-gray-200 text-gray-900 rounded-lg" />
        </Form.Item>
        <Form.Item label={<span className="text-gray-600 text-sm">Date</span>} name="date" rules={[{ required: true, message: "Please select a date" }]}>
          <DatePicker format="D MMMM YYYY" className="w-full rounded-lg border-gray-200" />
        </Form.Item>
        <Form.Item className="mb-0 text-right mt-6">
          <Button htmlType="submit" className="bg-red-500 hover:bg-red-600 border-none text-white font-semibold px-6 rounded-xl">
            Add Expense
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddExpense;
