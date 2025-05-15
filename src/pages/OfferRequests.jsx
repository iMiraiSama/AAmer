import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { 
    ArrowLeft, 
    Calendar, 
    User,
    Clock, 
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText
} from "lucide-react";

function OfferRequests() {
    const navigate = useNavigate();
    const { offerId } = useParams();
    const token = localStorage.getItem("token");
    const isAuthenticated = token !== null;

    const [offerDetails, setOfferDetails] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const fetchOfferRequests = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5003/api/booking/get-booking/${offerId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 404) {
                    const data = await response.json();
                    if (data.error === "No bookings found") {
                        setOfferDetails({ bookings: [] });
                        return;
                    }
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch offer requests");
                }
                
                const data = await response.json();
                setOfferDetails(data);
                console.log("Offer Requests Data:", data);
            } catch (err) {
                console.error("Error fetching offer requests:", err);
                setError(err.message || "An error occurred while fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchOfferRequests();
    }, [offerId, isAuthenticated, navigate, token]);

    const handleAcceptRequest = async (bookingId) => {
        try {
            const response = await fetch(`http://localhost:5003/api/booking/confirm-booking-offering`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bookingId: bookingId }),
            });

            if (!response.ok) {
                throw new Error("Failed to accept request");
            }

            // Refresh the data after status update
            const updatedResponse = await fetch(`http://localhost:5003/api/booking/get-booking/${offerId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (updatedResponse.ok) {
                const updatedData = await updatedResponse.json();
                setOfferDetails(updatedData);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRejectRequest = async (bookingId) => {
        try {
            const response = await fetch(`http://localhost:5003/api/booking/update-status/${bookingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "rejected" }),
            });

            if (!response.ok) {
                throw new Error("Failed to reject request");
            }

            // Refresh the data after status update
            const updatedResponse = await fetch(`http://localhost:5003/api/booking/get-booking/${offerId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (updatedResponse.ok) {
                const updatedData = await updatedResponse.json();
                setOfferDetails(updatedData);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'accepted':
                return '#28a745';
            case 'pending':
                return '#ffc107';
            case 'rejected':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <LoadingSpinner message="Loading offer requests..." />
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>
                        <AlertCircle size={24} />
                    </div>
                    <p style={styles.errorText}>{error}</p>
                    <button 
                        style={styles.primaryButton}
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} style={styles.buttonIcon} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentContainer}>
                <div style={styles.header}>
                    <button 
                        style={styles.backButton}
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} style={styles.buttonIcon} />
                        Back
                    </button>
                    <div style={styles.headerTitle}>
                        <h1 style={styles.pageTitle}>Offer Requests</h1>
                        <p style={styles.pageSubtitle}>{offerDetails?.requestTitle || "Service Offer"}</p>
                    </div>
                </div>
                
                {/* No Requests Found Handling */}
                {(!offerDetails?.bookings || offerDetails.bookings.length === 0) ? (
                    <div style={styles.emptyStateContainer}>
                        <div style={styles.emptyStateIcon}>
                            <Calendar size={48} color="#6c757d" />
                        </div>
                        <h3 style={styles.emptyStateTitle}>No Requests Found</h3>
                        <p style={styles.emptyStateText}>There are no requests for this service offer at the moment.</p>
                        <button 
                            style={styles.primaryButton}
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={18} style={styles.buttonIcon} />
                            Back to Services
                        </button>
                    </div>
                ) : (
                    <div style={styles.requestsContainer}>
                        {offerDetails.bookings.map((booking, index) => (
                            <div key={booking._id || index} style={styles.requestCard}>
                                <div style={styles.requestCardHeader}>
                                    <div style={styles.userInfo}>
                                        <div style={styles.userAvatar}>
                                            {booking.user ? 
                                                `${booking.user.email?.charAt(0).toUpperCase() || ''}` 
                                                : 'U'}
                                        </div>
                                        <div>
                                            <h3 style={styles.userName}>
                                                User #{index + 1}
                                            </h3>
                                            <div style={styles.userEmail}>
                                                <Mail size={14} style={styles.infoIcon} />
                                                {booking.user?.email || 'Email not available'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        ...styles.statusBadge,
                                        backgroundColor: getStatusColor(booking.status)
                                    }}>
                                        {booking.status}
                                    </div>
                                </div>
                                
                                <div style={styles.requestCardBody}>
                                    <div style={styles.infoRow}>
                                        <div style={styles.infoItem}>
                                            <Clock size={16} style={styles.infoIcon} />
                                            <span style={styles.infoText}>
                                                Requested on: {formatDate(booking.createdAt)}
                                            </span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <FileText size={16} style={styles.infoIcon} />
                                            <span style={styles.infoText}>
                                                Booking ID: {booking._id}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {booking.status === 'pending' && (
                                        <div style={styles.actionButtons}>
                                            <button 
                                                style={styles.acceptButton}
                                                onClick={() => handleAcceptRequest(booking._id)}
                                            >
                                                <CheckCircle size={18} style={styles.buttonIcon} />
                                                Accept Request
                                            </button>
                                            <button 
                                                style={styles.rejectButton}
                                                onClick={() => handleRejectRequest(booking._id)}
                                            >
                                                <XCircle size={18} style={styles.buttonIcon} />
                                                Reject Request
                                            </button>
                                        </div>
                                    )}
                                    
                                    {booking.status === 'accepted' && (
                                        <div style={styles.statusMessage}>
                                            <CheckCircle size={18} style={{...styles.buttonIcon, color: '#28a745'}} />
                                            You've accepted this request
                                        </div>
                                    )}
                                    
                                    {booking.status === 'rejected' && (
                                        <div style={styles.statusMessage}>
                                            <XCircle size={18} style={{...styles.buttonIcon, color: '#dc3545'}} />
                                            You've rejected this request
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    pageContainer: {
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
        padding: "40px 20px",
        boxSizing: "border-box",
    },
    contentContainer: {
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        padding: "30px",
        width: "100%",
    },
    header: {
        display: "flex",
        alignItems: "center",
        marginBottom: "30px",
        borderBottom: "1px solid #e9ecef",
        paddingBottom: "20px"
    },
    backButton: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f0f4ff",
        color: "#3b82f6",
        border: "none",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginRight: "20px",
        fontWeight: "500"
    },
    headerTitle: {
        flex: 1
    },
    pageTitle: {
        fontSize: "26px",
        color: "#111827",
        margin: 0,
        fontWeight: "700"
    },
    pageSubtitle: {
        fontSize: "16px",
        color: "#6b7280",
        margin: "8px 0 0 0"
    },
    buttonIcon: {
        marginRight: "8px"
    },
    requestsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        marginBottom: "30px"
    },
    requestCard: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #f3f4f6",
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    requestCardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
        backgroundColor: "#f9fafb",
        borderBottom: "1px solid #f3f4f6"
    },
    userInfo: {
        display: "flex",
        alignItems: "center"
    },
    userAvatar: {
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        backgroundColor: "#3b82f6",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        marginRight: "14px",
        fontSize: "18px"
    },
    userName: {
        margin: 0,
        fontSize: "16px",
        fontWeight: "600",
        color: "#111827"
    },
    userEmail: {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        color: "#6b7280",
        marginTop: "4px"
    },
    statusBadge: {
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "500",
        color: "white",
        textTransform: "capitalize"
    },
    requestCardBody: {
        padding: "20px"
    },
    infoRow: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "20px"
    },
    infoItem: {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        color: "#4b5563"
    },
    infoIcon: {
        marginRight: "8px",
        color: "#3b82f6"
    },
    infoText: {
        fontSize: "14px"
    },
    actionButtons: {
        display: "flex",
        gap: "12px",
        marginTop: "16px"
    },
    acceptButton: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#ecfdf5",
        color: "#10b981",
        border: "1px solid #d1fae5",
        borderRadius: "8px",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        flex: 1
    },
    rejectButton: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fef2f2",
        color: "#ef4444",
        border: "1px solid #fee2e2",
        borderRadius: "8px",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        flex: 1
    },
    statusMessage: {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        color: "#4b5563",
        backgroundColor: "#f9fafb",
        padding: "12px 16px",
        borderRadius: "8px",
        marginTop: "16px"
    },
    emptyStateContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center"
    },
    emptyStateIcon: {
        marginBottom: "20px",
        backgroundColor: "#f3f4f6",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    emptyStateTitle: {
        fontSize: "22px",
        fontWeight: "600",
        color: "#111827",
        margin: "0 0 12px 0"
    },
    emptyStateText: {
        fontSize: "16px",
        color: "#6b7280",
        margin: "0 0 24px 0",
        maxWidth: "500px"
    },
    primaryButton: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        padding: "12px 20px",
        fontSize: "15px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.2s ease"
    },
    errorContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        maxWidth: "600px",
        margin: "0 auto"
    },
    errorIcon: {
        color: "#ef4444",
        marginBottom: "20px"
    },
    errorText: {
        fontSize: "16px",
        color: "#6b7280",
        margin: "0 0 24px 0"
    }
};

export default OfferRequests;