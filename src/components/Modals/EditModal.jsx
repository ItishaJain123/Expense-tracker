import { Modal, Form, Input, DatePicker, Select, Button } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";

const EditModal = ({
  editModalVisible,
  transaction,
  handleEditCancel,
  handleUpdate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (transaction && editModalVisible) {
      form.setFieldsValue({
        name: transaction.name || "",
        amount: transaction.amount || "",
        date: transaction.date ? dayjs(transaction.date, "D MMMM YYYY") : null,
        type: transaction.type || "income",
      });
    }
  }, [transaction, editModalVisible]);

  return (
    <Modal
      title={
        <div className="text-xl font-semibold text-red-500 text-center">
          Edit Transaction
        </div>
      }
      open={editModalVisible}
      onCancel={() => {
        handleEditCancel();
        form.resetFields();
      }}
      footer={null}
      centered
      styles={{
        content: {
          background: "rgba(255, 255, 255, 0.7)",
          borderRadius: "1rem",
          padding: "2rem",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter a name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Please enter an amount" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker format="D MMMM YYYY" className="w-full" />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: "Please select a type" }]}
        >
          <Select>
            <Select.Option value="income">Income</Select.Option>
            <Select.Option value="expense">Expense</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Update Transaction
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
