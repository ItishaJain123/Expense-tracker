import { Modal, Form, Input, DatePicker, Select, Button } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../../constants";

const MODAL_STYLES = {
  content: {
    background: "#FFFFFF",
    borderRadius: "1rem",
    border: "1px solid #F1F5F9",
  },
  header: { background: "#FFFFFF", borderBottom: "1px solid #F1F5F9" },
  mask: { backdropFilter: "blur(4px)" },
};

const EditModal = ({ editModalVisible, transaction, handleEditCancel, handleUpdate }) => {
  const [form] = Form.useForm();
  const [transactionType, setTransactionType] = useState("expense");

  useEffect(() => {
    if (transaction && editModalVisible) {
      setTransactionType(transaction.type || "expense");
      form.setFieldsValue({
        name: transaction.name || "",
        amount: transaction.amount || "",
        date: transaction.date ? dayjs(transaction.date, "D MMMM YYYY") : null,
        type: transaction.type || "income",
        category: transaction.category || undefined,
      });
    }
  }, [transaction, editModalVisible]);

  const categoryOptions =
    transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      title={
        <span className="text-lg font-semibold text-blue-600">✏️ Edit Transaction</span>
      }
      open={editModalVisible}
      onCancel={() => {
        handleEditCancel();
        form.resetFields();
      }}
      footer={null}
      centered
      styles={MODAL_STYLES}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4">
        <Form.Item
          label={<span className="text-gray-300 text-sm">Name</span>}
          name="name"
          rules={[{ required: true, message: "Please enter a name" }]}
        >
          <Input className="bg-[#F1F5F9] border-gray-200 text-gray-900 rounded-lg" />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-300 text-sm">Type</span>}
          name="type"
          rules={[{ required: true }]}
        >
          <Select
            onChange={(val) => {
              setTransactionType(val);
              form.setFieldValue("category", undefined);
            }}
          >
            <Select.Option value="income">Income</Select.Option>
            <Select.Option value="expense">Expense</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-300 text-sm">Category</span>}
          name="category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Select category">
            {categoryOptions.map((cat) => (
              <Select.Option key={cat} value={cat}>
                {cat}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-300 text-sm">Amount (₹)</span>}
          name="amount"
          rules={[{ required: true, message: "Please enter an amount" }]}
        >
          <Input
            type="number"
            className="bg-[#F1F5F9] border-gray-200 text-gray-900 rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-300 text-sm">Date</span>}
          name="date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker format="D MMMM YYYY" className="w-full rounded-lg" />
        </Form.Item>

        <Form.Item className="mb-0 mt-6">
          <Button
            type="primary"
            htmlType="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 border-none font-semibold rounded-xl"
          >
            Update Transaction
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
