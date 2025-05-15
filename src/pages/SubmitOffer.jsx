import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SubmitOffer() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isAuthenticated = token !== null;

    // ✅ Redirect to login if the user is not authenticated
    if (!isAuthenticated) {
        navigate("/login");
    }

    const [offer, setOffer] = useState({
        requestId: "",
        price: "",
        message: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setOffer({ ...offer, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // ✅ Validate input fields before submitting
        if (!offer.requestId || !offer.price || !offer.message) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }

        if (isNaN(offer.price) || offer.price <= 0) {
            setError("Price must be a valid positive number.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5003/api/submit-offer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(offer),
            });

            const data = await response.json();
            if (data.success) {
                setSuccess("Offer submitted successfully!");
                setOffer({ requestId: "", price: "", message: "" });
            } else {
                setError(data.message || "Failed to submit the offer.");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Submit Your Offer</h2>

            {/* ✅ Display success or error messages */}
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Service Request ID:</label>
                <input
                    type="text"
                    name="requestId"
                    value={offer.requestId}
                    onChange={handleChange}
                    placeholder="Enter request ID"
                    style={styles.input}
                    required
                />

                <label style={styles.label}>Your Price (SAR):</label>
                <input
                    type="number"
                    name="price"
                    value={offer.price}
                    onChange={handleChange}
                    placeholder="Enter your price in SAR"
                    style={styles.input}
                    required
                />

                <label style={styles.label}>Message to Client:</label>
                <textarea
                    name="message"
                    value={offer.message}
                    onChange={handleChange}
                    placeholder="Write a short message explaining your offer"
                    style={styles.textarea}
                    required
                ></textarea>

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Submitting..." : "Submit Offer"}
                </button>
            </form>
        </div>
    );
}

// ✅ Improved styling to match the overall app design
const styles = {
    container: {
        maxWidth: "500px",
        margin: "auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        paddingTop: "40px",
        marginTop: "20px",
    },
    title: {
        fontSize: "24px",
        color: "#0056b3",
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
    textarea: {
        padding: "10px",
        fontSize: "16px",
        height: "80px",
        marginBottom: "15px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    button: {
        backgroundColor: "#0056b3",
        color: "white",
        padding: "10px",
        fontSize: "16px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "0.3s",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
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

export default SubmitOffer;