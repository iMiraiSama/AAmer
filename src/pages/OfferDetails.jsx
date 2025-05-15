import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContactModal from "../components/ContactModal";
import LoadingSpinner from "../components/LoadingSpinner";

function OfferDetails() {
    const { offerId } = useParams();
    console.log("offer ID:", offerId);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isAuthenticated = token !== null;
    const userType = localStorage.getItem("userType");

    // State management
    const [offer, setOffer] = useState(null);
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

    // Fetch offer details on load
    useEffect(() => {
        const fetchOfferDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:5003/api/offering/get-offer/${offerId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                
                if (response.ok && data) {
                    setOffer(data);
                } else {
                    setError(data?.error || "Failed to load offer details.");
                }
            } catch (err) {
                setError("Error fetching offer details.");
                console.error("Error fetching offer details:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && offerId) {
            fetchOfferDetails();
        }
    }, [isAuthenticated, token, offerId]);

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

    // Function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle contact click
    const handleContact = () => {
        setShowContactModal(true);
    };
    
    // Handle offer service
    const handlebookOffer = async () => {
        try {
            const payload = { serviceId: offer._id, userId: localStorage.getItem("userId"), bookingType: "offer" };
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
                setStatusMessage("You have successfully booked this service");
                // Optionally update offer status or add an offered flag
                setOffer(prev => ({ ...prev, offered: true }));
            } else {
                setError(data?.error || "Failed to offer service.");
            }
        } catch (err) {
            setError("Error offering service. Please try again.");
        }
    };

    // Handle back button
    const handleBack = () => {
        navigate("/MyServices");
    };
    
    const handleContinueOnWebsite = () => {
        if (offer) {
            navigate('/ServiceChat?userId=' + offer.providerId);
            setShowContactModal(false);
        }
    };
    
    if (isLoading) {
        return (
            <div style={styles.container}>
                <LoadingSpinner message="Loading offer details..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorContainer}>
                    <div style={styles.error}>{error}</div>
                    <button style={styles.backButton} onClick={handleBack}>
                        Back to Offers
                    </button>
                </div>
            </div>
        );
    }

    if (!offer) {
        return (
            <div style={styles.container}>
                <div style={styles.errorContainer}>
                    <div style={styles.error}>offer not found.</div>
                    <button style={styles.backButton} onClick={handleBack}>
                        Back to Offers
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.backButton} onClick={handleBack}>
                    ← Back to My Services
                </button>
                <h1 style={styles.title}>Service offer Details</h1>
            </div>

            {statusMessage && <div style={styles.successMessage}>{statusMessage}</div>}

            <div style={styles.offerCard}>
                <div style={styles.offerHeader}>
                    <div style={styles.offerTitleSection}>
                        <h2 style={styles.offerTitle}>{offer.title}</h2>
                        <span 
                            style={{
                                ...styles.serviceTag,
                                backgroundColor: getServiceTagColor(offer.serviceType)
                            }}
                        >
                            {offer.serviceType}
                        </span>
                    </div>
                    <div style={styles.offerMeta}>
                        <div style={styles.offerDate}>
                            <span style={styles.metaLabel}>Posted:</span> {formatDate(offer.createdAt)}
                        </div>
                        <div style={styles.offerPrice}>
                            <span style={styles.metaLabel}>Budget:</span> 
                            <span style={styles.priceValue}>SAR {offer.price}</span>
                        </div>
                        <div style={styles.offerLocation}>
                            <span style={styles.metaLabel}>Location:</span> {offer.location}
                        </div>
                    </div>
                </div>

                <div style={styles.offerBody}>
                    <h3 style={styles.sectionTitle}>Description</h3>
                    <div style={styles.offerDescription}>
                        {offer.description}
                    </div>
                </div>

                {offer.additionalInfo && (
                    <div style={styles.additionalInfo}>
                        <h3 style={styles.sectionTitle}>Additional Information</h3>
                        <p>{offer.additionalInfo}</p>
                    </div>
                )}

                <div style={styles.offerFooter}>
                    {userType === 'user' && (
                        <>
                        <button 
                            style={styles.offerButton}
                            onClick={handlebookOffer}
                            disabled={offer.offered}
                        >
                            {offer.offered ? 'Service Booked' : 'Book Service'}
                        </button>
                        <button 
                            style={styles.contactButton}
                            onClick={handleContact}
                        >
                            Contact Offerer
                        </button>
                        </>
                    )}
                </div>
            </div>

            {/* Related Offers Section (Optional) */}
            {offer.relatedOffers && offer.relatedOffers.length > 0 && (
                <div style={styles.relatedOffersSection}>
                    <h3 style={styles.sectionTitle}>Similar Offers</h3>
                    <div style={styles.relatedOffersList}>
                        {offer.relatedOffers.map(relatedOffer => (
                            <div 
                                key={relatedOffer.id} 
                                style={styles.relatedOfferCard}
                                onClick={() => navigate(`/offers/${relatedOffer.id}`)}
                            >
                                <h4>{relatedOffer.title}</h4>
                                <div style={styles.relatedOfferMeta}>
                                    <span style={styles.relatedOfferService}>{relatedOffer.serviceType}</span>
                                    <span>SAR {relatedOffer.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contact Modal */}
            <ContactModal 
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                offer={offer}
                onContinueOnWebsite={handleContinueOnWebsite}
            />
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "1000px",
        margin: "60px auto",
        padding: "20px",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    },
    header: {
        display: "flex",
        alignItems: "center",
        marginBottom: "30px",
        position: "relative",
    },
    backButton: {
        padding: "8px 16px",
        backgroundColor: "#f5f5f5",
        border: "none",
        borderRadius: "4px",
        color: "#333",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        marginRight: "20px",
        transition: "background 0.3s",
    },
    title: {
        fontSize: "28px",
        color: "#2c3e50",
        margin: 0,
        fontWeight: "600",
        flex: 1,
        textAlign: "center",
    },
    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "300px",
    },
    loading: {
        color: "#7f8c8d",
        fontSize: "18px",
    },
    errorContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        minHeight: "300px",
    },
    error: {
        padding: "15px 20px",
        backgroundColor: "#ffebee",
        border: "1px solid #ffcdd2",
        borderRadius: "6px",
        color: "#c62828",
        fontSize: "16px",
    },
    successMessage: {
        padding: "15px 20px",
        backgroundColor: "#e8f5e9",
        border: "1px solid #c8e6c9",
        borderRadius: "6px",
        color: "#2e7d32",
        fontSize: "16px",
        marginBottom: "20px",
    },
    offerCard: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 15px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        marginBottom: "30px",
    },
    offerHeader: {
        padding: "25px 30px",
        borderBottom: "1px solid #ecf0f1",
    },
    offerTitleSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
    },
    offerTitle: {
        fontSize: "24px",
        color: "#2c3e50",
        margin: 0,
        fontWeight: "600",
        flex: 1,
    },
    serviceTag: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "20px",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "500",
        marginLeft: "15px",
    },
    offerMeta: {
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
    },
    metaLabel: {
        color: "#7f8c8d",
        fontWeight: "500",
        marginRight: "5px",
    },
    offerDate: {
        fontSize: "14px",
        color: "#34495e",
    },
    offerPrice: {
        fontSize: "14px",
        color: "#34495e",
    },
    priceValue: {
        fontWeight: "600",
        color: "#3498db",
    },
    offerLocation: {
        fontSize: "14px",
        color: "#34495e",
    },
    offerBody: {
        padding: "25px 30px",
    },
    sectionTitle: {
        fontSize: "18px",
        color: "#2c3e50",
        marginTop: 0,
        marginBottom: "15px",
        fontWeight: "600",
    },
    offerDescription: {
        fontSize: "16px",
        color: "#34495e",
        lineHeight: "1.6",
        whiteSpace: "pre-line", // Preserves line breaks in description
    },
    additionalInfo: {
        padding: "0 30px 25px 30px",
        borderTop: "1px solid #ecf0f1",
    },
    offerFooter: {
        display: "flex",
        justifyContent: "flex-end",
        padding: "20px 30px",
        backgroundColor: "#f9f9f9",
        borderTop: "1px solid #ecf0f1",
        gap: "15px",
    },
    offerButton: {
        padding: "12px 24px",
        backgroundColor: "#2ecc71",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background 0.3s",
    },
    contactButton: {
        padding: "12px 24px",
        backgroundColor: "#3498db",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background 0.3s",
    },
    relatedOffersSection: {
        marginTop: "30px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 15px rgba(0, 0, 0, 0.1)",
        padding: "25px 30px",
    },
    relatedOffersList: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
    },
    relatedOfferCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: "6px",
        padding: "15px",
        cursor: "pointer",
        transition: "transform 0.3s, box-shadow 0.3s",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
    },
    relatedOfferMeta: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "10px",
        fontSize: "14px",
    },
    relatedOfferService: {
        color: "#3498db",
        fontWeight: "500",
    },
};

export default OfferDetails;