import { Modal, Button } from "antd";

const ResetConfirmationModal = ({
  resetModalVisible,
  handleCancel,
  handleConfirm,
}) => {
  return (
    <Modal
      title={
        <span className="text-lg font-semibold text-red-600">
          Confirm Reset
        </span>
      }
      open={resetModalVisible}
      onCancel={handleCancel}
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
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="reset" type="primary" danger onClick={handleConfirm}>
          Yes, Reset All
        </Button>,
      ]}
    >
      <div className="text-gray-700 text-base">
        <span>This action will:</span>
        <ul className="list-disc list-inside mt-2 text-sm">
          <li>Reset your current balance to ₹0</li>
          <li>Clear all transactions (Income & Expenses)</li>
        </ul>
      </div>
      <p className="text-red-500 mt-3 font-medium">
        Are you sure you want to proceed?
      </p>
    </Modal>
  );
};

export default ResetConfirmationModal;
