import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Rating from "../components/Rating";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";
import LoadingSpinner from "../components/LoadingSpinner";
import { 
    ArrowLeft, 
    Calendar, 
    MapPin, 
    Building, 
    FileText, 
    CheckCircle, 
    Clock, 
    Star, 
    MessageSquare,
    CreditCard,
    AlertCircle
} from "lucide-react";

function BookingDetails({ requestName }) {
    const navigate = useNavigate();
    const { serviceId } = useParams();
    const token = localStorage.getItem("token");
    const isAuthenticated = token !== null;
    const userId = localStorage.getItem("userId");

    const [bookingDetails, setBookingDetails] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Review state
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const fetchBookingDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5003/api/booking/get-booking/${serviceId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok && !response.status === 404) {
                    throw new Error("Failed to fetch booking details");
                }
                const data = await response.json();
                setBookingDetails(data);
                setLoading(false);
                console.log("Booking Details Data:", data);
                console.log("Bookings:", data.bookings);
                if (data.bookings && data.bookings.length > 0) {
                    console.log("First Booking:", data.bookings[0]);
                    console.log("Provider:", data.bookings[0].provider);
                    
                    // Fetch reviews for the provider after we have the booking details
                    const providerId = data.bookings[0].providerId || data.bookings[0].provider?._id;
                    if (providerId) {
                        console.log("Fetching reviews for provider ID:", providerId);
                        fetchReviews(providerId);
                    } else {
                        console.error("No provider ID found in booking data");
                    }
                }
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [serviceId, isAuthenticated, navigate, token]);
    
    // Fetch reviews for a provider
    const fetchReviews = async (providerId) => {
        try {
            setReviewsLoading(true);
            setReviewsError("");
            console.log("Fetching reviews for provider:", providerId);
            
            const response = await fetch(`http://localhost:5003/api/reviews/provider/${providerId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("Provider reviews:", data);
                setReviews(data || []);
                
                // Calculate average rating
                if (data && data.length > 0) {
                    const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
                    setAverageRating(totalRating / data.length);
                }
            } else {
                const errorText = await response.text();
                console.error("Failed to fetch provider reviews:", errorText);
                setReviewsError("Failed to load reviews. Please try again later.");
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setReviewsError("An error occurred while loading reviews.");
        } finally {
            setReviewsLoading(false);
        }
    };
    
    // Handle review submission
    const handleReviewSubmit = async (reviewData) => {
        if (!selectedBooking) return;
        
        setReviewLoading(true);
        
        try {
            const response = await fetch(`http://localhost:5003/api/reviews/add-review`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    serviceId: serviceId,
                    bookingId: selectedBooking._id,
                    userId: userId,
                    rating: reviewData.rating,
                    comment: reviewData.comment
                }),
            });
            
            if (response.ok) {
                // Refresh reviews
                fetchReviews(bookingDetails.bookings[0].provider._id);
                setShowReviewForm(false);
                setSelectedBooking(null);
            } else {
                const data = await response.json();
                setError(data.message || "Failed to submit review");
            }
        } catch (err) {
            setError("Error submitting review");
            console.error("Error submitting review:", err);
        } finally {
            setReviewLoading(false);
        }
    };
    
    // Check if user has already reviewed this service
    const hasUserReviewed = () => {
        return reviews.some(review => review.userId === userId);
    };

    const handleConfirmBooking = async (bookingId, provider) => {
        try {
            if (!bookingId) {
                setError("Invalid booking ID");
                return;
            }
            navigate(`/ConfirmBooking/${bookingId}`, {
                state: { requestTitle: bookingDetails?.requestTitle, provider: provider },
            });
        } catch (err) {
            setError(err.message);
        }
    };
    
    // Handle review button click
    const handleReviewClick = (booking) => {
        setSelectedBooking(booking);
        setShowReviewForm(true);
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return '#28a745';
            case 'pending':
                return '#ffc107';
            case 'cancelled':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <LoadingSpinner message="Loading booking details..." />
            </div>
        );
    }

    // Render error state
    if (bookingDetails == [] || error) {
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

    // Render provider details
    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentContainer}>
                <div style={styles.header}>
                    <button 
                        style={styles.backButton}
                        onClick={() => navigate('/requests', { state: { activeTab: 'myRequests' } })}
                    >
                        <ArrowLeft size={18} style={styles.buttonIcon} />
                        Back
                    </button>
                    <div style={styles.headerTitle}>
                        <h1 style={styles.pageTitle}>Booking Details</h1>
                        <p style={styles.pageSubtitle}>{bookingDetails.requestTitle}</p>
                    </div>
                </div>
                
                {/* No Bookings Found Handling */}
                {(!bookingDetails.bookings || bookingDetails.bookings.length === 0) ? (
                    <div style={styles.emptyStateContainer}>
                        <div style={styles.emptyStateIcon}>
                            <Calendar size={48} color="#6c757d" />
                        </div>
                        <h3 style={styles.emptyStateTitle}>No Bookings Found</h3>
                        <p style={styles.emptyStateText}>There are no bookings available for this service at the moment.</p>
                        <button 
                            style={styles.primaryButton}
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={18} style={styles.buttonIcon} />
                            Back to Requests
                        </button>
                    </div>
                ) : (
                    <div style={styles.bookingCardsContainer}>
                        {bookingDetails.bookings.map((booking, index) => (
                            <div key={booking._id || index} style={styles.bookingCard}>
                                <div style={styles.bookingCardHeader}>
                                    <div style={styles.providerInfo}>
                                        <div style={styles.providerAvatar}>
                                            {booking.provider ? 
                                                `${booking.provider.firstName?.charAt(0) || ''}${booking.provider.lastName?.charAt(0) || ''}` 
                                                : 'NA'}
                                        </div>
                                        <div>
                                            <h3 style={styles.providerName}>
                                                {booking.provider ? 
                                                    `${booking.provider.firstName || 'Unknown'} ${booking.provider.lastName || ''}`
                                                    : 'Provider Not Available'}
                                            </h3>
                                            <div style={styles.providerCompany}>
                                                <Building size={14} style={styles.infoIcon} />
                                                {booking.provider?.companyName || 'Company Not Available'}
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
                                
                                <div style={styles.bookingCardBody}>
                                    <div style={styles.infoRow}>
                                        <div style={styles.infoItem}>
                                            <MapPin size={16} style={styles.infoIcon} />
                                            <span style={styles.infoText}>{booking.provider?.location || 'Location Not Available'}</span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <FileText size={16} style={styles.infoIcon} />
                                            <span style={styles.infoText}>License: {booking.provider?.licenseNumber || 'Not Available'}</span>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.ratingContainer}>
                                        <div style={styles.ratingLabel}>
                                            <Star size={16} style={styles.infoIcon} />
                                            Provider Rating
                                        </div>
                                        <Rating 
                                            initialRating={averageRating} 
                                            readOnly={true} 
                                            size="small"
                                            showLabel={false}
                                        />
                                        <span style={styles.ratingCount}>
                                            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                        </span>
                                    </div>
                                    
                                    <div style={styles.actionButtons}>
                                        {booking?.status === 'pending' && (
                                            <button 
                                                style={styles.confirmButton}
                                                onClick={() => booking && handleConfirmBooking(booking._id, booking.provider)}
                                            >
                                                <CreditCard size={18} style={styles.buttonIcon} />
                                                Confirm and Pay
                                            </button>
                                        )}
                                        
                                        {booking.status === 'completed' && !hasUserReviewed() && (
                                            <button 
                                                style={styles.reviewButton}
                                                onClick={() => handleReviewClick(booking)}
                                            >
                                                <MessageSquare size={18} style={styles.buttonIcon} />
                                                Write a Review
                                            </button>
                                        )}
                                        
                                        {booking.status === 'completed' && hasUserReviewed() && (
                                            <div style={styles.completedBadge}>
                                                <CheckCircle size={18} style={styles.buttonIcon} />
                                                Review Submitted
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reviews Section */}
                <div style={styles.reviewsSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>
                            <Star size={20} style={styles.sectionIcon} />
                            Reviews
                        </h2>
                    </div>
                    {reviewsLoading ? (
                        <div style={styles.loadingContainer}>
                            <LoadingSpinner message="Loading reviews..." />
                        </div>
                    ) : reviewsError ? (
                        <div style={styles.errorContainer}>
                            <AlertCircle size={24} style={styles.errorIcon} />
                            <p style={styles.errorText}>{reviewsError}</p>
                        </div>
                    ) : (
                        <ReviewList 
                            reviews={reviews} 
                            averageRating={averageRating} 
                            totalReviews={reviews.length} 
                        />
                    )}
                </div>
            </div>

            {/* Review Form Modal */}
            {showReviewForm && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <ReviewForm 
                            onSubmit={handleReviewSubmit}
                            onCancel={() => {
                                setShowReviewForm(false);
                                setSelectedBooking(null);
                            }}
                        />
                    </div>
                </div>
            )}
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
    bookingCardsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
    },
    bookingCard: {
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e9ecef",
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        ":hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
        }
    },
    bookingCardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #e9ecef"
    },
    providerInfo: {
        display: "flex",
        alignItems: "center"
    },
    providerAvatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "#0056b3",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        marginRight: "12px"
    },
    providerName: {
        margin: 0,
        fontSize: "16px",
        fontWeight: "600",
        color: "#2c3e50"
    },
    providerCompany: {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        color: "#6c757d",
        marginTop: "2px"
    },
    statusBadge: {
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "500",
        color: "white",
        textTransform: "capitalize"
    },
    bookingCardBody: {
        padding: "15px"
    },
    infoRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: "15px",
        marginBottom: "15px"
    },
    infoItem: {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        color: "#6c757d"
    },
    infoIcon: {
        marginRight: "6px",
        color: "#0056b3"
    },
    infoText: {
        fontSize: "14px"
    },
    ratingContainer: {
        display: "flex",
        alignItems: "center",
        marginBottom: "15px",
        padding: "10px",
        backgroundColor: "#f8f9fa",
        borderRadius: "6px"
    },
    ratingLabel: {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        fontWeight: "500",
        color: "#6c757d",
        marginRight: "10px"
    },
    ratingCount: {
        fontSize: "14px",
        color: "#6c757d",
        marginLeft: "10px"
    },
    actionButtons: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "15px"
    },
    confirmButton: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#0056b3",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.3s ease"
    },
    reviewButton: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.3s ease"
    },
    completedBadge: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#e8f5e9",
        color: "#28a745",
        border: "none",
        borderRadius: "6px",
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: "500"
    },
    reviewsSection: {
        marginTop: "30px",
        borderTop: "1px solid #e9ecef",
        paddingTop: "20px"
    },
    sectionHeader: {
        display: "flex",
        alignItems: "center",
        marginBottom: "20px"
    },
    sectionTitle: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#2c3e50",
        margin: 0,
        display: "flex",
        alignItems: "center"
    },
    sectionIcon: {
        marginRight: "10px",
        color: "#0056b3"
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
        marginBottom: "20px"
    },
    emptyStateTitle: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#2c3e50",
        margin: "0 0 10px 0"
    },
    emptyStateText: {
        fontSize: "16px",
        color: "#6c757d",
        margin: "0 0 20px 0",
        maxWidth: "500px"
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
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modalContent: {
        width: "100%",
        maxWidth: "600px",
        maxHeight: "90vh",
        overflowY: "auto",
    },
    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
    }
};

export default BookingDetails;