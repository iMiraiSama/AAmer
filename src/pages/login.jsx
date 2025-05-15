import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/Login.css";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialCheck, setInitialCheck] = useState(true);
    const navigate = useNavigate();

    // Check authentication once on component mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUserType = localStorage.getItem("userType");

        if (token && storedUserType) {
            const dashboardPath = storedUserType.toLowerCase() === "user" ? "/UserDashboard" : "/ProviderDashboard";
            navigate(dashboardPath);
        }
        setInitialCheck(false);
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!email || !password) {
            setError("Please enter both email and password.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5003/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userType", data.userType);
                localStorage.setItem("userId", data.userId);

                if (onLogin) {
                    onLogin(data.userType);
                }
                
                const dashboardPath = data.userType.toLowerCase() === "user" ? "/UserDashboard" : "/ProviderDashboard";
                navigate(dashboardPath);
            } else {
                setError(data.message || "Invalid email or password.");
                setLoading(false);
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Server error. Please try again later.");
            setLoading(false);
        }
    };

    if (initialCheck) {
        return (
            <div className="login-container">
                <LoadingSpinner message="Checking authentication..." />
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-title">Login</h2>

                {error && (
                    <div className="error-container">
                        <span className="error-icon">⚠️</span>
                        <span className="error-message">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={`login-button ${loading ? 'disabled' : ''}`}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <button
                        type="button"
                        className="forgot-password-button"
                        onClick={() => navigate("/ForgotPassword")}
                    >
                        Forgot Password?
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;