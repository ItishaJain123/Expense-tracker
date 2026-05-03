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

const DeleteConfirmationModal = ({
  deleteModalVisible,
  handleCancel,
  handleConfirm,
  selectedTransaction,
}) => {
  return (
    <Modal
      title={
        <span className="text-red-600 font-semibold">🗑️ Delete Transaction</span>
      }
      open={deleteModalVisible}
      onCancel={handleCancel}
      centered
      styles={MODAL_STYLES}
      footer={[
        <Button key="cancel" onClick={handleCancel} className="border-gray-600 text-gray-300">
          Cancel
        </Button>,
        <Button key="delete" type="primary" danger onClick={handleConfirm}>
          Delete
        </Button>,
      ]}
    >
      <p className="text-gray-300 py-2">
        Are you sure you want to delete{" "}
        <strong className="text-gray-900">
          {selectedTransaction?.name || "this transaction"}
        </strong>
        ? This action cannot be undone.
      </p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
