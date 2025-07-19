// import { Form, Modal, Button, Input, DatePicker, Select } from "antd";

// const AddExpense = ({
//   isExpenseModalVisible,
//   handleExpenseCancel,
//   onFinish,
// }) => {
//   const [form] = Form.useForm();

//   return (
//     <div>
//       <Modal
//         title="Add Expense"
//         open={isExpenseModalVisible}
//         onCancel={handleExpenseCancel}
//         footer={null}
//       >
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={(values) => {
//             onFinish(values, "expense");
//             form.resetFields();
//           }}
//         >
//           <Form.Item
//             label="Name"
//             name="name"
//             rules={[
//               {
//                 required: true,
//                 message: "Please input the name of the transaction!",
//               },
//             ]}
//           >
//             <Input type="text" />
//           </Form.Item>

//           <Form.Item
//             label="Amount"
//             name="amount"
//             rules={[
//               { required: true, message: "Please input the expense amount!" },
//             ]}
//           >
//             <Input type="number" />
//           </Form.Item>

//           <Form.Item
//             label="Date"
//             name="date"
//             rules={[
//               { required: true, message: "Please select the expense date!" },
//             ]}
//           >
//             <DatePicker format="D MMMM YYYY" />
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit">
//               Add Expense
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default AddExpense;

import { Form, Modal, Input, DatePicker, Button } from "antd";
import { useEffect } from "react";

const AddExpense = ({
  isExpenseModalVisible,
  handleExpenseCancel,
  onFinish,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isExpenseModalVisible) {
      form.resetFields();
    }
  }, [isExpenseModalVisible, form]);

  return (
    <Modal
      title={
        <div className="text-xl font-semibold text-red-500 text-center">
          ➕ Add New Expense
        </div>
      }
      open={isExpenseModalVisible}
      onCancel={handleExpenseCancel}
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
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onFinish(values, "expense");
          form.resetFields();
        }}
        className="flex flex-col justify-center px-10 py-4"
      >
        <Form.Item
          label={
            <span className="text-base font-medium text-gray-800">Name</span>
          }
          name="name"
          rules={[
            {
              required: true,
              message: "Please input the name of the transaction!",
            },
          ]}
        >
          <Input
            className="rounded-md px-3 py-2 border border-gray-300 focus:border-red-400 focus:shadow-md transition-all"
            placeholder="e.g. Grocery, Netflix"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-base font-medium text-gray-800">Amount</span>
          }
          name="amount"
          rules={[
            { required: true, message: "Please input the expense amount!" },
          ]}
        >
          <Input
            type="number"
            className="rounded-md px-3 py-2 border border-gray-300 focus:border-red-400 focus:shadow-md transition-all"
            placeholder="e.g. 2500"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-base font-medium text-gray-800">Date</span>
          }
          name="date"
          rules={[
            { required: true, message: "Please select the expense date!" },
          ]}
        >
          <DatePicker
            format="D MMMM YYYY"
            className="w-full rounded-md px-3 py-2 border border-gray-300 focus:border-red-400 focus:shadow-md transition-all"
          />
        </Form.Item>

        <Form.Item className="mt-6 text-right">
          <Button
            htmlType="submit"
            className="bg-red-500 hover:bg-red-600 text-black px-5 py-2 rounded-md text-sm font-semibold transition-all "
          >
            💸 Add Expense
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddExpense;
