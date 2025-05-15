import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();
    const [userType, setUserType] = useState("user");
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        location: "",
        licenseNumber: "",
        companyName: "",
        serviceType: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const serviceOptions = [
        "Home Cleaning",
        "Plumbing",
        "Electrical",
        "Carpentry",
        "Gardening",
        "Moving",
        "IT Support",
        "Tutoring",
        "Cooking",
        "Childcare"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true); // ✅ تفعيل التحميل

        if (!formData.email || !formData.firstName || !formData.lastName || !formData.password || !formData.location) {
            setError("⚠️ All fields are required.");
            setLoading(false);
            return;
        }

        // ✅ التحقق من قوة كلمة المرور
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError("⚠️ Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, and one number.");
            setLoading(false);
            return;
        }

        // ✅ التحقق من الحقول الإضافية لمقدمي الخدمات
        if (userType === "provider") {
            if (!formData.licenseNumber || formData.licenseNumber.length < 15 || isNaN(formData.licenseNumber)) {
                setError("⚠️ License number must be at least 15 digits.");
                setLoading(false);
                return;
            }
            if (!formData.companyName) {
                setError("⚠️ Company name is required.");
                setLoading(false);
                return;
            }
            if (!formData.serviceType) {
                setError("⚠️ Please select a service type.");
                setLoading(false);
                return;
            }
        }

        try {
            const response = await fetch("http://localhost:5003/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userType, ...formData }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess("✅ Registration successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(`⚠️ ${data.message || "Registration failed."}`);
            }
        } catch (err) {
            setError("⚠️ Server error. Please try again later.");
        } finally {
            setLoading(false); // ✅ إيقاف التحميل بعد استجابة السيرفر
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Sign Up</h2>

            {/* ✅ عرض رسالة نجاح أو خطأ */}
            {error && (
                <div style={styles.errorContainer}>
                    <span style={styles.errorIcon}>⚠️</span> {error}
                </div>
            )}
            {success && <p style={styles.success}>{success}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>User Type:</label>
                <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    style={styles.select}
                >
                    <option value="user">User</option>
                    <option value="provider">Service Provider</option>
                </select>

                <label style={styles.label}>First Name:</label>
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <label style={styles.label}>Last Name:</label>
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <label style={styles.label}>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <label style={styles.label}>Password:</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <label style={styles.label}>Location:</label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                {/* ✅ الحقول الإضافية لمقدمي الخدمات فقط */}
                {userType === "provider" && (
                    <>
                        <label style={styles.label}>License Number:</label>
                        <input
                            type="text"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            placeholder="Enter 15-digit license number"
                            style={styles.input}
                        />

                        <label style={styles.label}>Company Name:</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Enter company name"
                            style={styles.input}
                        />

                        <label style={styles.label}>Service Type:</label>
                        <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleChange}
                            style={styles.select}
                        >
                            <option value="">Select a service</option>
                            {serviceOptions.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                    </>
                )}

                <button type="submit" style={loading ? styles.buttonDisabled : styles.button} disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
}

// ✅ تحسين الستايل وتوحيده مع باقي الصفحات
const styles = {
    container: {
        maxWidth: "450px",
        margin: "auto",
        padding: "20px",
        paddingTop: "80px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        textAlign: "center",
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
    select: {
        padding: "10px",
        fontSize: "16px",
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
    },
    buttonDisabled: {
        backgroundColor: "#999",
        cursor: "not-allowed",
    },
    errorContainer: {
        backgroundColor: "#ffdddd",
        color: "#cc0000",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
    },
    errorIcon: {
        marginRight: "5px",
    },
    success: {
        color: "green",
        fontSize: "14px",
        marginBottom: "10px",
    },
};

export default Signup;