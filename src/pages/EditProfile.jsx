import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function EditProfile() {
    const navigate = useNavigate();
    const userType = localStorage.getItem("userType");
    const token = localStorage.getItem("token");

    // ✅ بيانات الحساب
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [location, setLocation] = useState("");

    // ✅ بيانات إضافية لمقدمي الخدمات
    const [licenseNumber, setLicenseNumber] = useState("");
    const [serviceType, setServiceType] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ✅ جلب بيانات المستخدم من الباك-إند عند تحميل الصفحة
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("http://localhost:5003/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (data.success) {
                    setEmail(data.user.email);
                    setLocation(data.user.location);
                    if (userType === "provider") {
                        setLicenseNumber(data.user.licenseNumber || "");
                        setServiceType(data.user.serviceType || "");
                    }
                } else {
                    setError("Failed to load profile data.");
                }
            } catch (err) {
                setError("Error fetching profile data.");
            }
        };

        if (token) {
            fetchUserData();
        }
    }, [token, userType]);

    // ✅ إرسال التعديلات إلى الباك-إند
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost:5003/edit-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email,
                    password,
                    location,
                    ...(userType === "provider" && { licenseNumber, serviceType }),
                }),
            });

            const data = await response.json();
            if (data.success) {
                setMessage("Profile updated successfully!");
                setTimeout(() => navigate(userType === "provider" ? "/ProviderDashboard" : "/userdashboard"), 2000);
            } else {
                setError("Failed to update profile.");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Edit Profile</h2>

            {message && <p style={styles.success}>{message}</p>}
            {error && <p style={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />

                <label style={styles.label}>New Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" style={styles.input} />

                <label style={styles.label}>Location:</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={styles.input} required />

                {userType === "provider" && (
                    <>
                        <label style={styles.label}>License Number:</label>
                        <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} style={styles.input} />

                        <label style={styles.label}>Service Type:</label>
                        <input type="text" value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={styles.input} />
                    </>
                )}

                <button type="submit" style={styles.button}>Save Changes</button>
            </form>
        </div>
    );
}

// ✅ تحسين الستايل وتوحيده مع باقي الصفحات
const styles = {
    container: {
        maxWidth: "400px",
        margin: "auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        textAlign: "center",
    },
    title: {
        fontSize: "24px",
        color: "#003366",
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
        backgroundColor: "#003366",
        color: "white",
        padding: "10px",
        fontSize: "16px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        border: "none",
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

export default EditProfile;