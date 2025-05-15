import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    CheckCircle, 
    AlertCircle, 
    FileText, 
    Activity,
    EyeIcon 
} from "lucide-react";
import LoadingSpinner from '../components/LoadingSpinner';

function UserDashboard() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeRequests, setActiveRequests] = useState([]);
    const [receivedOffers, setReceivedOffers] = useState([]);
    const [error, setError] = useState("");
    const [userStats, setUserStats] = useState({
        totalRequests: 0,
        completedRequests: 0,
        pendingOffers: 0
    });

    // Check authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");
        const userId = localStorage.getItem("userId");
        
        if (!token || userType !== "user") {
            navigate("/login");
            return;
        }
        
        setIsAuthenticated(true);
        fetchDashboardData(token, userId);
    }, [navigate]);

    const fetchDashboardData = async (token, userId) => {
        try {
            setIsLoading(true);
            
            // Fetch user requests
            const response = await fetch(`http://localhost:5003/api/requests/get-user-requests/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user requests");
            }

            const requestsData = await response.json();
            
            // Process the requests data
            if (Array.isArray(requestsData)) {
                // Filter active and completed requests
                const active = requestsData.filter(req => req.status !== "completed");
                const completed = requestsData.filter(req => req.status === "completed");
                
                setActiveRequests(active);
                setUserStats({
                    totalRequests: requestsData.length,
                    completedRequests: completed.length,
                    pendingOffers: 0 // You might need another API call for this
                });
            } else {
                setError("Invalid response format for requests data");
            }
            
            // You can add additional API calls here for offers if needed
            
            setIsLoading(false);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("Error fetching dashboard data: " + err.message);
            setIsLoading(false);
        }
    };

    const renderStatCard = (icon, title, value) => {
        return (
            <div style={styles.statCard}>
                <div style={styles.statCardIcon}>{icon}</div>
                <h4 style={styles.statCardTitle}>{title}</h4>
                <p style={styles.statCardValue}>{value}</p>
            </div>
        );
    };

    const renderRequestList = () => {
        if (activeRequests.length === 0) {
            return <p style={styles.emptyListText}>No active service requests.</p>;
        }

        return (
            <div style={styles.requestsList}>
                {activeRequests.slice(0, 3).map(request => (
                    <div key={request._id} style={styles.requestItem}>
                        <div style={styles.requestHeader}>
                            <h4 style={styles.requestTitle}>{request.title}</h4>
                            <span style={styles.requestStatus}>{request.status}</span>
                        </div>
                        <p style={styles.requestDescription}>{request.description}</p>
                        <div style={styles.requestDetails}>
                            <span style={styles.requestLocation}>📍 {request.location}</span>
                            <span style={styles.requestPrice}>${request.price}</span>
                            <span style={styles.requestType}>{request.serviceType}</span>
                        </div>
                    </div>
                ))}
                {activeRequests.length > 3 && (
                    <button 
                        style={styles.viewMoreButton}
                        onClick={() => navigate("/requests")}
                    >
                        View all {activeRequests.length} requests
                    </button>
                )}
            </div>
        );
    };

    if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;

    return (
        <div style={styles.pageContainer}>
            <div style={styles.dashboardContainer}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Dashboard</h1>
                        <p style={styles.subtitle}>Welcome! Here's an overview of your current activities.</p>
                    </div>
                    <div style={styles.headerActions}>
                        <div style={styles.headerButtonGroup}>
                            <button 
                                style={styles.primaryButton} 
                                onClick={() => navigate("/requests")}
                            >
                                <FileText size={18} style={styles.buttonIcon} />
                                View Requests
                            </button>
                            <button 
                                style={styles.primaryButton} 
                                onClick={() => navigate("/CompletedServices")}
                            >
                                <CheckCircle size={18} style={styles.buttonIcon} />
                                Completed Services
                            </button>
                        </div>
                    </div>
                </header>

                {error && (
                    <div style={styles.errorBanner}>
                        <AlertCircle size={20} style={styles.errorIcon} />
                        <span>{error}</span>
                    </div>
                )}

                <div style={styles.dashboardContent}>
                    <div style={styles.leftColumn}>
                        <div style={styles.activeRequestsCard}>
                            <div style={styles.cardHeader}>
                                <FileText size={20} style={styles.cardHeaderIcon} />
                                <h3 style={styles.cardHeaderTitle}>Active Requests</h3>
                            </div>
                            {renderRequestList()}
                        </div>
                    </div>

                    <div style={styles.rightColumn}>
                        <div style={styles.statsContainer}>
                            {renderStatCard(
                                <CheckCircle color="#0056b3" size={24} />, 
                                "Total Requests", 
                                userStats.totalRequests
                            )}
                            {renderStatCard(
                                <Activity color="#28a745" size={24} />, 
                                "Completed", 
                                userStats.completedRequests
                            )}
                            {renderStatCard(
                                <AlertCircle color="#ffc107" size={24} />, 
                                "Pending Offers", 
                                userStats.pendingOffers
                            )}
                        </div>

                        <div style={styles.offersCard}>
                            <div style={styles.cardHeader}>
                                <AlertCircle size={20} style={styles.cardHeaderIcon} />
                                <h3 style={styles.cardHeaderTitle}>Offers Received</h3>
                            </div>
                            <p style={styles.offersText}>
                                {receivedOffers.length > 0 
                                    ? `${receivedOffers.length} offers awaiting your response.` 
                                    : "No pending offers."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageContainer: {
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
        padding: "100px",
        boxSizing: "border-box",
    },
    dashboardContainer: {
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        padding: "20px",
        width: "100%",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        borderBottom: "1px solid #e9ecef",
        paddingBottom: "15px"
    },
    title: {
        fontSize: "24px",
        color: "#0056b3",
        margin: 0
    },
    subtitle: {
        color: "#6c757d",
        margin: 0
    },
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "15px"
    },
    headerButtonGroup: {
        display: "flex",
        gap: "10px"
    },
    primaryButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0056b3",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
        gap: "8px"
    },
    buttonIcon: {
        marginRight: "4px"
    },
    dashboardContent: {
        display: "flex",
        gap: "20px"
    },
    leftColumn: {
        flex: 1
    },
    rightColumn: {
        flex: 1
    },
    statsContainer: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px"
    },
    statCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        padding: "15px",
        textAlign: "center",
        width: "30%",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    statCardIcon: {
        marginBottom: "10px",
        display: "flex",
        justifyContent: "center"
    },
    statCardTitle: {
        fontSize: "14px",
        color: "#6c757d",
        marginBottom: "5px"
    },
    statCardValue: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#0056b3"
    },
    activeRequestsCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        padding: "15px",
        marginTop: "20px"
    },
    offersCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        padding: "15px"
    },
    cardHeader: {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px"
    },
    cardHeaderIcon: {
        marginRight: "10px",
        color: "#0056b3"
    },
    cardHeaderTitle: {
        fontSize: "16px",
        color: "#0056b3",
        margin: 0
    },
    activeRequestText: {
        color: "#6c757d"
    },
    offersText: {
        color: "#6c757d"
    },
    errorBanner: {
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "10px",
        borderRadius: "5px",
        display: "flex",
        alignItems: "center",
        marginBottom: "20px"
    },
    errorIcon: {
        marginRight: "10px",
        color: "#721c24"
    },
    requestsList: {
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    requestItem: {
        backgroundColor: "white",
        borderRadius: "6px",
        padding: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    requestHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "5px"
    },
    requestTitle: {
        fontSize: "16px",
        color: "#0056b3",
        margin: 0
    },
    requestStatus: {
        fontSize: "12px",
        backgroundColor: "#e6f7ff",
        color: "#0056b3",
        padding: "3px 8px",
        borderRadius: "12px",
        textTransform: "capitalize"
    },
    requestDescription: {
        fontSize: "14px",
        color: "#6c757d",
        margin: "5px 0"
    },
    requestDetails: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "#6c757d",
        marginTop: "8px"
    },
    requestLocation: {
        color: "#6c757d"
    },
    requestPrice: {
        fontWeight: "bold",
        color: "#28a745"
    },
    requestType: {
        backgroundColor: "#f5f5f5",
        padding: "2px 6px",
        borderRadius: "4px"
    },
    viewMoreButton: {
        backgroundColor: "transparent",
        border: "none",
        color: "#0056b3",
        cursor: "pointer",
        fontSize: "14px",
        padding: "5px",
        textAlign: "center",
        textDecoration: "underline"
    },
    emptyListText: {
        color: "#6c757d",
        fontStyle: "italic",
        textAlign: "center",
        padding: "10px"
    }
};

export default UserDashboard;