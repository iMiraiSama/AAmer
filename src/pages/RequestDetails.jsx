import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Building, MessageSquare, Star } from "lucide-react";
import ContactModal from "../components/ContactModal";
import LoadingSpinner from "../components/LoadingSpinner";

function RequestDetails() {
    const { requestId } = useParams();
    console.log("Request ID:", requestId);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isAuthenticated = token !== null;
    const userType = localStorage.getItem("userType");

    // State management
    const [request, setRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showContactModal, setShowContactModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    // Authentication check
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    // Fetch request details on load
    useEffect(() => {
        const fetchRequestDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:5003/api/requests/get-request/${requestId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                
                if (response.ok && data) {
                    setRequest(data);
                } else {
                    setError(data?.error || "Failed to load request details.");
                }
            } catch (err) {
                setError("Error fetching request details.");
                console.error("Error fetching request details:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && requestId) {
            fetchRequestDetails();
        }
    }, [isAuthenticated, token, requestId]);

    // Function to get tag color based on service type
    const getServiceTagColor = (serviceType) => {
        const colors = {
            "Home Cleaning": "#4CAF50",
            "Plumbing": "#2196F3",
            "Electrician": "#FFC107",
            "AC Repair": "#03A9F4",
            "Electronics Repair": "#9C27B0",
            "Carpentry": "#795548",
            "Moving Services": "#FF5722",
            "Painting": "#3F51B5",
        };
        return colors[serviceType] || "#607D8B"; // Default color
    };

    // Function to get status color
    const getStatusColor = (status) => {
        const colors = {
            "Pending": "#FFC107", // Yellow
            "In Progress": "#2196F3", // Blue
            "Completed": "#4CAF50", // Green
            "Cancelled": "#F44336", // Red
            "Awaiting Confirmation": "#9C27B0", // Purple
        };
        return colors[status] || "#607D8B"; // Default color
    };

    // Function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle contact click
    const handleContact = () => {
        setShowContactModal(true);
    };

    // Handle continue on website
    const handleContinueOnWebsite = () => {
        if (request) {
            navigate('/ServiceChat?userId=' + request.userId);
            setShowContactModal(false);
        }
    };
    
    // Handle offer service
    const handleOfferService = async () => {
        try {
            const payload = { serviceId: request._id, userId: localStorage.getItem("userId"), bookingType: "request" };
            const response = await fetch(`http://localhost:5003/api/booking/add-booking`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            
            if (response.ok && data) {
                setStatusMessage("You have successfully offered your services for this request.");
                // Optionally update request status or add an offered flag
                setRequest(prev => ({ ...prev, offered: true }));
            } else {
                setError(data?.error || "Failed to offer service.");
            }
        } catch (err) {
            setError("Error offering service. Please try again.");
        }
    };

    // Handle back button
    const handleBack = () => {
        // Navigate to the appropriate tab based on user type
        const activeTab = userType === 'provider' ? 'browse' : 'myRequests';
        navigate("/requests", { state: { activeTab } });
    };

    if (isLoading) {
        return (
            <div style={styles.pageContainer}>
                <LoadingSpinner message="Loading request details..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.errorContainer}>
                    <AlertCircle size={24} style={styles.errorIcon} />
                    <p style={styles.errorText}>{error}</p>
                    <button 
                        style={styles.primaryButton}
                        onClick={handleBack}
                    >
                        <ArrowLeft size={18} style={styles.buttonIcon} />
                        Back to Requests
                    </button>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.errorContainer}>
                    <AlertCircle size={24} style={styles.errorIcon} />
                    <p style={styles.errorText}>Request not found.</p>
                    <button 
                        style={styles.primaryButton}
                        onClick={handleBack}
                    >
                        <ArrowLeft size={18} style={styles.buttonIcon} />
                        Back to Requests
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
                        onClick={handleBack}
                    >
                        <ArrowLeft size={18} style={styles.buttonIcon} />
                        Back
                    </button>
                    <div style={styles.headerTitle}>
                        <h1 style={styles.pageTitle}>Service Request Details</h1>
                        <p style={styles.pageSubtitle}>{request.title}</p>
                    </div>
                </div>

                {statusMessage && (
                    <div style={styles.successMessage}>
                        <CheckCircle size={20} style={{ marginRight: '8px' }} />
                        {statusMessage}
                    </div>
                )}

                <div style={styles.requestCard}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardHeaderLeft}>
                            <h2 style={styles.serviceTitle}>{request.serviceType}</h2>
                            <span 
                                style={{
                                    ...styles.statusTag,
                                    backgroundColor: getStatusColor(request.status || "Pending"),
                                    marginLeft: "10px"
                                }}
                            >
                                {request.status || "Pending"}
                            </span>
                        </div>
                        <span style={styles.date}>{formatDate(request.createdAt)}</span>
                    </div>
                    
                    <div style={styles.cardContent}>
                        <div style={styles.cardDetails}>
                            <div style={styles.detailItem}>
                                <DollarSign size={16} style={styles.detailIcon} />
                                <span style={styles.price}>SAR {request.price}</span>
                            </div>
                            <div style={styles.detailItem}>
                                <MapPin size={16} style={styles.detailIcon} />
                                <span>{request.location}</span>
                            </div>
                        </div>
                        
                        <div style={styles.description}>
                            <h3 style={styles.sectionTitle}>Description</h3>
                            <p style={styles.descriptionText}>
                                {request.description}
                            </p>
                        </div>

                        {request.additionalInfo && (
                            <div style={styles.additionalInfo}>
                                <h3 style={styles.sectionTitle}>Additional Information</h3>
                                <p style={styles.descriptionText}>{request.additionalInfo}</p>
                            </div>
                        )}
                    </div>

                    <div style={styles.cardFooter}>
                        {userType === 'provider' && (
                            <>
                            <button 
                                style={request.offered ? styles.disabledButton : styles.offerButton}
                                onClick={handleOfferService}
                                disabled={request.offered}
                            >
                                {request.offered ? 'Service Offered' : 'Offer Service'}
                            </button>
                            <button 
                                style={styles.contactButton}
                                onClick={handleContact}
                            >
                                <Phone size={16} style={{ marginRight: '8px' }} />
                                Contact Requester
                            </button>                       
                            </>
                        )}
                    </div>
                </div>

                {/* Related Requests Section (Optional) */}
                {request.relatedRequests && request.relatedRequests.length > 0 && (
                    <div style={styles.relatedRequestsSection}>
                        <h3 style={styles.sectionTitle}>Similar Requests</h3>
                        <div style={styles.relatedRequestsList}>
                            {request.relatedRequests.map(relatedRequest => (
                                <div 
                                    key={relatedRequest.id} 
                                    style={styles.relatedRequestCard}
                                    onClick={() => navigate(`/requests/${relatedRequest.id}`)}
                                >
                                    <h4 style={styles.relatedRequestTitle}>{relatedRequest.title}</h4>
                                    <div style={styles.relatedRequestMeta}>
                                        <span style={{
                                            ...styles.relatedRequestService,
                                            backgroundColor: getServiceTagColor(relatedRequest.serviceType)
                                        }}>
                                            {relatedRequest.serviceType}
                                        </span>
                                        <span style={styles.relatedRequestPrice}>SAR {relatedRequest.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            <ContactModal 
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                offer={request}
                onContinueOnWebsite={handleContinueOnWebsite}
            />
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
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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
        backgroundColor: "#f8f9fa",
        color: "#0056b3",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
        marginRight: "20px"
    },
    headerTitle: {
        flex: 1
    },
    pageTitle: {
        fontSize: "24px",
        color: "#0056b3",
        margin: 0,
        fontWeight: "600"
    },
    pageSubtitle: {
        fontSize: "16px",
        color: "#6c757d",
        margin: "5px 0 0 0"
    },
    buttonIcon: {
        marginRight: "8px"
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
    },
    spinner: {
        width: "50px",
        height: "50px",
        border: "3px solid #0056b3",
        borderTop: "3px solid transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "20px"
    },
    loadingText: {
        fontSize: "16px",
        color: "#6c757d"
    },
    errorContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        maxWidth: "600px",
        margin: "0 auto"
    },
    errorIcon: {
        color: "#dc3545",
        marginBottom: "20px"
    },
    errorText: {
        fontSize: "16px",
        color: "#6c757d",
        margin: "0 0 20px 0"
    },
    primaryButton: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#0056b3",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.3s ease"
    },
    successMessage: {
        display: "flex",
        alignItems: "center",
        padding: "15px 20px",
        backgroundColor: "#e8f5e9",
        border: "1px solid #c8e6c9",
        borderRadius: "8px",
        color: "#2e7d32",
        fontSize: "16px",
        marginBottom: "20px",
    },
    requestCard: {
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        overflow: "hidden",
        marginBottom: "30px",
        border: "1px solid #e9ecef",
        display: "flex",
        flexDirection: "column",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #e9ecef"
    },
    cardHeaderLeft: {
        display: "flex",
        alignItems: "center",
    },
    serviceTitle: {
        fontSize: "22px",
        fontWeight: "600",
        color: "#2c3e50",
        margin: 0,
        padding: "8px 12px",
        backgroundColor: "#e9ecef",
        borderRadius: "6px",
        borderLeft: "4px solid #0056b3",
    },
    statusTag: {
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "4px",
        color: "#fff",
        fontSize: "12px",
        fontWeight: "500",
        textTransform: "uppercase",
    },
    date: {
        fontSize: "14px",
        color: "#6c757d",
    },
    cardContent: {
        padding: "20px",
    },
    cardDetails: {
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        marginBottom: "20px",
    },
    detailItem: {
        display: "flex",
        alignItems: "center",
        flex: "1 0 45%",
    },
    detailIcon: {
        marginRight: "8px",
        color: "#0056b3",
    },
    price: {
        fontWeight: "600",
        color: "#0056b3",
    },
    description: {
        marginBottom: "20px",
    },
    sectionTitle: {
        fontSize: "18px",
        color: "#2c3e50",
        marginTop: 0,
        marginBottom: "15px",
        fontWeight: "600",
        borderBottom: "1px solid #e9ecef",
        paddingBottom: "10px",
    },
    descriptionText: {
        fontSize: "16px",
        color: "#34495e",
        lineHeight: "1.6",
        whiteSpace: "pre-line", // Preserves line breaks in description
    },
    additionalInfo: {
        marginTop: "20px",
        paddingTop: "20px",
        borderTop: "1px solid #e9ecef",
    },
    cardFooter: {
        display: "flex",
        justifyContent: "flex-end",
        padding: "15px 20px",
        backgroundColor: "#f9f9f9",
        borderTop: "1px solid #e9ecef",
        gap: "15px",
    },
    offerButton: {
        display: "flex",
        alignItems: "center",
        padding: "12px 24px",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    disabledButton: {
        display: "flex",
        alignItems: "center",
        padding: "12px 24px",
        backgroundColor: "#95a5a6",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "not-allowed",
        opacity: 0.7,
    },
    contactButton: {
        display: "flex",
        alignItems: "center",
        padding: "12px 24px",
        backgroundColor: "#0056b3",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    relatedRequestsSection: {
        marginTop: "30px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        padding: "25px 30px",
        border: "1px solid #e9ecef",
    },
    relatedRequestsList: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
    },
    relatedRequestCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        padding: "15px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        border: "1px solid #e9ecef",
    },
    relatedRequestTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#2c3e50",
        margin: "0 0 10px 0",
    },
    relatedRequestMeta: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "10px",
        fontSize: "14px",
    },
    relatedRequestService: {
        padding: "4px 8px",
        borderRadius: "4px",
        color: "#fff",
        fontSize: "12px",
        fontWeight: "500",
    },
    relatedRequestPrice: {
        fontWeight: "600",
        color: "#0056b3",
    },
};

export default RequestDetails;