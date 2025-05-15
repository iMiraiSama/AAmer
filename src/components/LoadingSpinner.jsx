import React from 'react';

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message}</p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    minHeight: "200px",
  },
  spinner: {
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderTop: "4px solid #0056b3",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
  },
  message: {
    marginTop: "20px",
    color: "#6c757d",
    fontSize: "16px",
  },
};

// Add the keyframes animation to the document if it doesn't exist
if (!document.getElementById('spinner-animation')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'spinner-animation';
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default LoadingSpinner; 