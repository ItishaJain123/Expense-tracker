import { Modal, Button } from "antd";

const MODAL_STYLES = {
  content: {
    background: "#FFFFFF",
    borderRadius: "1rem",
    border: "1px solid #F1F5F9",
  },
  header: { background: "#FFFFFF", borderBottom: "1px solid #F1F5F9" },
  mask: { backdropFilter: "blur(4px)" },
};

const ResetConfirmationModal = ({ resetModalVisible, handleCancel, handleConfirm }) => {
  return (
    <Modal
      title={
        <span className="text-red-600 font-semibold">⚠️ Reset All Data</span>
      }
      open={resetModalVisible}
      onCancel={handleCancel}
      centered
      styles={MODAL_STYLES}
      footer={[
        <Button key="cancel" onClick={handleCancel} className="border-gray-600 text-gray-300">
          Cancel
        </Button>,
        <Button key="reset" type="primary" danger onClick={handleConfirm}>
          Yes, Reset All
        </Button>,
      ]}
    >
      <div className="text-gray-300 py-2">
        <p className="mb-3">This will permanently delete:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>All your transactions (income &amp; expenses)</li>
          <li>Your balance will reset to ₹0</li>
        </ul>
        <p className="text-red-600 font-medium mt-4">This action cannot be undone.</p>
      </div>
    </Modal>
  );
};

export default ResetConfirmationModal;
