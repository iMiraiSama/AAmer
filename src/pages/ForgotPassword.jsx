import React, { useState } from "react";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5003/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (data.success) {
                setMessage("A password reset link has been sent to your email.");
            } else {
                setError("Error: " + data.message);
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Forgot Password?</h2>
            
            {message && <p style={styles.success}>{message}</p>}
            {error && <p style={styles.error}>{error}</p>}

            <form onSubmit={handleResetPassword} style={styles.form}>
                <label style={styles.label}>Enter your email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "400px",
        margin: "auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        textAlign: "center",
        marginTop: "80px", // Added margin to avoid overlap with navbar
    },
    title: {
        fontSize: "24px",
        color: "#0056b3", // Updated color to match branding
        fontWeight: "bold",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
    },
    label: {
        textAlign: "left",
        marginBottom: "5px",
        fontWeight: "bold",
    },
    input: {
        padding: "10px",
        fontSize: "16px",
        marginBottom: "15px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    button: {
        backgroundColor: "#0056b3", // Updated color to match branding
        color: "white",
        padding: "10px",
        fontSize: "16px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    error: {
        color: "red",
        fontSize: "14px",
        marginBottom: "10px",
    },
    success: {
        color: "green",
        fontSize: "14px",
        marginBottom: "10px",
    },
};

export default ForgotPassword;