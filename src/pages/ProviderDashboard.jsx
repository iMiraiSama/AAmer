import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/ProviderDashboard.css";

function ProviderDashboard() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");
        
        if (!token || userType !== "provider") {
            navigate("/login");
            return;
        }
        
        setIsAuthenticated(true);
        setIsLoading(false);
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="dashboard-container">
                <LoadingSpinner message="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Provider Dashboard</h2>
                <p className="dashboard-subtitle">Welcome! Manage your offers and submitted requests here.</p>
            </div>

            <div className="dashboard-cards">
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title">My Active Offers</h3>
                    </div>
                    <div className="card-content">
                        <p className="card-text">
                            View and manage your active offers
                        </p>
                        <button 
                            className="card-button"
                            onClick={() => navigate("/MyServices")}
                        >
                            View My Offers
                        </button>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title">Accepted Requests</h3>
                    </div>
                    <div className="card-content">
                        <p className="card-text">
                            View and manage your accepted requests
                        </p>
                        <button 
                            className="card-button"
                            onClick={() => navigate("/MyServices")}
                        >
                            View Accepted Requests
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add the keyframes animation to the document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProviderDashboard;