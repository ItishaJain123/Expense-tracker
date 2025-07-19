import { Modal, Button } from "antd";

const DeleteConfirmationModal = ({
  deleteModalVisible,
  handleCancel,
  handleConfirm,
  selectedTransaction,
}) => {
  return (
    <Modal
      title="Confirm Deletion"
      open={deleteModalVisible}
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
        <Button key="delete" type="primary" danger onClick={handleConfirm}>
          Delete
        </Button>,
      ]}
    >
      <p>
        Are you sure you want to delete{" "}
        <strong>{selectedTransaction?.name || "this transaction"}</strong>?
      </p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
