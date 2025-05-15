import React from 'react';
import WhatsAppLink from './WhatsappLink';

const ContactModal = ({ isOpen, onClose, offer, onContinueOnWebsite }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Contact Options</h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div style={styles.modalBody}>
          <p style={styles.modalDescription}>
            Choose how you'd like to contact, about "{offer?.title}".
          </p>
          
          <div style={styles.contactOptions}>
            <button 
              style={styles.contactOption}
              onClick={onContinueOnWebsite}
            >
              <div style={styles.optionIcon}>💬</div>
              <div style={styles.optionContent}>
                <h3 style={styles.optionTitle}>Chat on Website</h3>
                <p style={styles.optionDescription}>Continue the conversation on our platform</p>
              </div>
            </button>
            
            <WhatsAppLink 
              phoneNumber={offer?.phoneNumber} 
              message={`Inquiry about service: ${offer?.title}`}
            >
              <button style={styles.contactOption}>
                <div style={styles.optionIcon}>📱</div>
                <div style={styles.optionContent}>
                  <h3 style={styles.optionTitle}>WhatsApp</h3>
                  <p style={styles.optionDescription}>Contact via WhatsApp</p>
                </div>
              </button>
            </WhatsAppLink>
          </div>
        </div>
        
        <div style={styles.modalFooter}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(3px)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    width: "500px",
    maxWidth: "90%",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #f0f0f0",
  },
  modalTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
    padding: "0",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  modalBody: {
    padding: "24px",
  },
  modalDescription: {
    margin: "0 0 20px 0",
    color: "#666",
    fontSize: "14px",
  },
  contactOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  contactOption: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    textAlign: "left",
    ":hover": {
      borderColor: "#3498db",
      backgroundColor: "#f8f9fa",
    },
  },
  optionIcon: {
    fontSize: "24px",
    marginRight: "16px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f7ff",
    borderRadius: "50%",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
  optionDescription: {
    margin: 0,
    fontSize: "14px",
    color: "#666",
  },
  modalFooter: {
    padding: "16px 24px",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "8px 16px",
    backgroundColor: "#f5f5f5",
    border: "none",
    borderRadius: "6px",
    color: "#666",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#e0e0e0",
    },
  },
};

export default ContactModal; 