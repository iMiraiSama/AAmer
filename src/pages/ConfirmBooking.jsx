import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Rating from '../components/Rating';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
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
    AlertCircle,
    User,
    DollarSign,
    Check,
    X
} from 'lucide-react';

function ConfirmBooking() {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const token = localStorage.getItem('token');
    const isAuthenticated = token !== null;
    const userId = localStorage.getItem('userId');

    const location = useLocation();
    const { requestTitle, provider, isPaymentOnly, bookingDetails: paymentBookingDetails, amount } = location.state || {};
    // Booking details state
    const [bookingDetails, setBookingDetails] = useState(paymentBookingDetails || null);
    const [loading, setLoading] = useState(!paymentBookingDetails);
    console.log(amount)
    // Payment state
    const [paymentType, setPaymentType] = useState('');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    const [error, setError] = useState('');
    const [processingBooking, setProcessingBooking] = useState(false);
    
    // Review state
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Fetch reviews for a provider
    const fetchReviews = useCallback(async (providerId) => {
        try {
            console.log("Fetching reviews for provider:", providerId);
            
            const response = await fetch(`http://localhost:5003/api/reviews/provider/${providerId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
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
                console.error("Failed to fetch provider reviews:", await response.text());
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    }, [token]);

    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5003/api/booking/get-booking-id/${bookingId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch booking details');
                }

                const data = await response.json();
                setBookingDetails(data);
                setLoading(false);
                
                // Only fetch reviews if not in payment-only mode
                if (!isPaymentOnly && data && data.providerId) {
                    fetchReviews(data.providerId);
                }
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (isAuthenticated && !paymentBookingDetails) {
            fetchBookingDetails();
        }
    }, [bookingId, token, isAuthenticated, fetchReviews, paymentBookingDetails, isPaymentOnly]);
    
    // Handle review submission
    const handleReviewSubmit = async (reviewData) => {
        if (!bookingDetails) return;
        
        setReviewLoading(true);
        
        try {
            const response = await fetch(`http://localhost:5003/api/reviews/add-review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    serviceId: bookingDetails.serviceId,
                    bookingId: bookingId,
                    userId: userId,
                    providerId: bookingDetails.providerId,
                    rating: reviewData.rating,
                    comment: reviewData.comment
                })
            });
            
            if (response.ok) {
                // Refresh reviews
                fetchReviews(bookingDetails.providerId);
                setShowReviewForm(false);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to submit review');
            }
        } catch (err) {
            setError('Error submitting review');
            console.error('Error submitting review:', err);
        } finally {
            setReviewLoading(false);
        }
    };
    
    // Check if user has already reviewed this provider
    const hasUserReviewed = () => {
        return reviews.some(review => review.userId === userId);
    };

    // Validation and booking confirmation functions
    const validateCardDetails = () => {
        const { cardNumber, cardName, expiryDate, cvv } = cardDetails;
        
        if (paymentType === 'credit-card') {
            if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
                setError('Please enter a valid 16-digit card number');
                return false;
            }
            if (!cardName) {
                setError('Please enter the name on the card');
                return false;
            }
            if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
                setError('Please enter a valid expiry date (MM/YY)');
                return false;
            }
            if (!cvv || cvv.length < 3 || cvv.length > 4) {
                setError('Please enter a valid CVV');
                return false;
            }
        }
        return true;
    };

    const handleConfirmBooking = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!paymentType) {
            setError('Please select a payment method');
            return;
        }

        if (!validateCardDetails()) {
            return;
        }

        setProcessingBooking(true);
        setError('');

        try {
            // Log booking details to understand the structure
            console.log("Booking details:", bookingDetails);
            
            // Get the correct user ID from the booking
            const bookingUserId = bookingDetails?.userId;
            console.log("Booking user ID:", bookingUserId);
            console.log("Current user ID from localStorage:", userId);
            
            let bookingData = null;
            
            // Only call confirm-booking API if not in payment-only mode
            if (!isPaymentOnly) {
                // Booking confirmation API call
                const bookingResponse = await fetch('http://localhost:5003/api/booking/confirm-booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        bookingId: bookingId,
                        providerId: provider._id
                    })
                });

                if (!bookingResponse.ok) {
                    throw new Error('Failed to confirm booking');
                }

                bookingData = await bookingResponse.json();
            }

            // Payment processing API call
            const paymentResponse = await fetch('http://localhost:5003/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookingId: bookingId,
                    paymentMethod: paymentType === 'credit-card' ? 'credit_card' : 'cash',
                    amount: amount || 0,
                    transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    userId: bookingUserId || userId // Use booking's user ID if available, otherwise use localStorage user ID
                })
            });

            if (!paymentResponse.ok) {
                const errorData = await paymentResponse.json();
                throw new Error(errorData.error || 'Payment processing failed');
            }

            // Set booking success
            setBookingSuccess(true);
            
            // Navigate to success page after a delay
            setTimeout(() => {
                navigate('/booking-success', { 
                    state: { 
                        bookingId: bookingData?.confirmedBooking?._id || bookingId 
                    } 
                });
            }, 2000);

        } catch (err) {
            setError(err.message);
            setProcessingBooking(false);
        }
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
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

    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading booking details...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentContainer}>
                <div style={styles.header}>
                    {!isPaymentOnly && (
                        <button 
                            style={styles.backButton}
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={20} style={styles.backIcon} />
                            Back
                        </button>
                    )}
                    <div style={styles.headerTitle}>
                        <h1 style={styles.pageTitle}>Confirm Booking</h1>
                        <p style={styles.pageSubtitle}>{requestTitle}</p>
                    </div>
                </div>

                <div style={styles.mainContent}>
                    {loading ? (
                        <div style={styles.loadingContainer}>
                            <h2>Loading booking details...</h2>
                        </div>
                    ) : error ? (
                        <div style={styles.errorContainer}>
                            <h2>Error: {error}</h2>
                        </div>
                    ) : (
                        <>
                            {!isPaymentOnly && (
                                <div style={styles.bookingDetailsCard}>
                                    <div style={styles.cardHeader}>
                                        <h2 style={styles.cardTitle}>Booking Details</h2>
                                        <div style={{
                                            ...styles.statusBadge,
                                            backgroundColor: getStatusColor(bookingDetails?.status)
                                        }}>
                                            {bookingDetails?.status || 'Pending'}
                                        </div>
                                    </div>
                                    
                                    <div style={styles.providerInfo}>
                                        <div style={styles.providerAvatar}>
                                            {provider?.firstName?.charAt(0)}{provider?.lastName?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={styles.providerName}>
                                                {provider?.firstName} {provider?.lastName}
                                            </h3>
                                            <div style={styles.providerCompany}>
                                                <Building size={14} style={styles.infoIcon} />
                                                {provider?.companyName}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <MapPin size={16} style={styles.infoIcon} />
                                            <span style={styles.infoText}>{provider?.location}</span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <User size={16} style={styles.infoIcon} />
                                            <span style={styles.infoText}>Provider ID: {provider?._id?.substring(0, 8)}</span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <Calendar size={16} style={styles.infoIcon} />
                                            <span style={styles.infoText}>Booking ID: {bookingId?.substring(0, 8)}</span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <DollarSign size={16} style={styles.infoIcon} />
                                            <span style={styles.infoText}>Service: {requestTitle}</span>
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
                                    
                                    {reviews.length > 0 && (
                                        <div style={styles.reviewsSection}>
                                            <h3 style={styles.reviewsTitle}>Recent Reviews</h3>
                                            <div style={styles.reviewsList}>
                                                {reviews.slice(0, 3).map((review, index) => (
                                                    <div key={index} style={styles.reviewItem}>
                                                        <div style={styles.reviewHeader}>
                                                            <span style={styles.reviewerName}>
                                                                {review.userName || 'Anonymous User'}
                                                            </span>
                                                            <Rating 
                                                                initialRating={review.rating} 
                                                                readOnly={true} 
                                                                size="small"
                                                                showLabel={false}
                                                            />
                                                        </div>
                                                        <p style={styles.reviewText}>
                                                            {review.comment}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div style={styles.paymentCard}>
                                <h2 style={styles.cardTitle}>
                                    {isPaymentOnly ? 'Complete Payment' : 'Payment Information'}
                                </h2>
                                
                                {bookingSuccess ? (
                                    <div style={styles.successMessage}>
                                        <CheckCircle size={24} style={{ color: '#28a745', marginRight: '10px' }} />
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', color: '#28a745' }}>Booking Confirmed!</h3>
                                            <p style={{ margin: 0, color: '#6c757d' }}>Redirecting to success page...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={styles.paymentMethods}>
                                            <div 
                                                style={{
                                                    ...styles.paymentMethod,
                                                    ...(paymentType === 'credit-card' ? styles.selectedPaymentMethod : {})
                                                }}
                                                onClick={() => setPaymentType('credit-card')}
                                            >
                                                <CreditCard size={20} style={styles.paymentIcon} />
                                                <span>Credit Card</span>
                                            </div>
                                            <div 
                                                style={{
                                                    ...styles.paymentMethod,
                                                    ...(paymentType === 'cash' ? styles.selectedPaymentMethod : {})
                                                }}
                                                onClick={() => setPaymentType('cash')}
                                            >
                                                <DollarSign size={20} style={styles.paymentIcon} />
                                                <span>Cash</span>
                                            </div>
                                        </div>

                                        {paymentType === 'credit-card' && (
                                            <div style={styles.cardDetails}>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.inputLabel}>Card Number</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="1234 5678 9012 3456"
                                                        value={cardDetails.cardNumber}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                                            setCardDetails(prev => ({ ...prev, cardNumber: value }));
                                                        }}
                                                        maxLength="19"
                                                        style={styles.input}
                                                    />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.inputLabel}>Name on Card</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="John Doe"
                                                        value={cardDetails.cardName}
                                                        onChange={(e) => setCardDetails(prev => ({ ...prev, cardName: e.target.value }))}
                                                        style={styles.input}
                                                    />
                                                </div>
                                                <div style={styles.cardDetailsRow}>
                                                    <div style={styles.inputGroup}>
                                                        <label style={styles.inputLabel}>Expiry Date</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="MM/YY"
                                                            value={cardDetails.expiryDate}
                                                            onChange={(e) => {
                                                                let value = e.target.value.replace(/\D/g, '');
                                                                if (value.length > 2) {
                                                                    value = `${value.slice(0,2)}/${value.slice(2,4)}`;
                                                                }
                                                                setCardDetails(prev => ({ ...prev, expiryDate: value }));
                                                            }}
                                                            maxLength="5"
                                                            style={styles.input}
                                                        />
                                                    </div>
                                                    <div style={styles.inputGroup}>
                                                        <label style={styles.inputLabel}>CVV</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="123"
                                                            value={cardDetails.cvv}
                                                            onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                                            maxLength="4"
                                                            style={styles.input}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {error && (
                                            <div style={styles.errorMessage}>
                                                <AlertCircle size={18} style={{ marginRight: '8px' }} />
                                                {error}
                                            </div>
                                        )}

                                        <div style={styles.bookingActions}>
                                            <button 
                                                style={styles.cancelButton}
                                                onClick={() => navigate(-1)}
                                            >
                                                <X size={18} style={{ marginRight: '8px' }} />
                                                Cancel
                                            </button>
                                            <button 
                                                style={{
                                                    ...styles.confirmButton,
                                                    ...((!paymentType || processingBooking) && styles.disabledButton)
                                                }}
                                                onClick={handleConfirmBooking}
                                                disabled={!paymentType || processingBooking}
                                            >
                                                {processingBooking ? (
                                                    <>
                                                        <div style={styles.smallSpinner}></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={18} style={{ marginRight: '8px' }} />
                                                        Confirm Payment
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            {/* Review Form Modal */}
            {showReviewForm && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <ReviewForm 
                            onSubmit={handleReviewSubmit}
                            onCancel={() => setShowReviewForm(false)}
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
        padding: "90px 20px",
        boxSizing: "border-box",
    },
    contentContainer: {
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
    },
    header: {
        display: "flex",
        alignItems: "center",
        marginBottom: "30px",
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
    backIcon: {
        marginRight: "8px"
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
    mainContent: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "30px",
        "@media (max-width: 768px)": {
            gridTemplateColumns: "1fr"
        }
    },
    bookingDetailsCard: {
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e9ecef",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },
    paymentCard: {
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e9ecef",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px"
    },
    cardTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#2c3e50",
        margin: 0
    },
    statusBadge: {
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "500",
        color: "white",
        textTransform: "capitalize"
    },
    providerInfo: {
        display: "flex",
        alignItems: "center",
        marginBottom: "15px"
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
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
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
    reviewsSection: {
        marginTop: "10px",
        borderTop: "1px solid #e9ecef",
        paddingTop: "15px"
    },
    reviewsTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#2c3e50",
        margin: "0 0 15px 0"
    },
    reviewsList: {
        maxHeight: "200px",
        overflowY: "auto"
    },
    reviewItem: {
        marginBottom: "15px",
        padding: "10px",
        backgroundColor: "#f8f9fa",
        borderRadius: "6px"
    },
    reviewHeader: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "5px"
    },
    reviewerName: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#2c3e50"
    },
    reviewText: {
        fontSize: "14px",
        color: "#6c757d",
        lineHeight: "1.4",
        margin: 0
    },
    paymentMethods: {
        display: "flex",
        gap: "15px",
        marginBottom: "20px"
    },
    paymentMethod: {
        flex: 1,
        border: "2px solid #e0e0e0",
        borderRadius: "10px",
        padding: "15px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px"
    },
    selectedPaymentMethod: {
        borderColor: "#0056b3",
        backgroundColor: "#e6f2ff"
    },
    paymentIcon: {
        color: "#0056b3"
    },
    cardDetails: {
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "5px"
    },
    inputLabel: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#6c757d"
    },
    input: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d8e0",
        borderRadius: "6px",
        fontSize: "14px"
    },
    cardDetailsRow: {
        display: "flex",
        gap: "15px"
    },
    errorMessage: {
        backgroundColor: "#ffebee",
        color: "#d32f2f",
        padding: "15px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center"
    },
    successMessage: {
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
        padding: "15px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center"
    },
    bookingActions: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "20px"
    },
    cancelButton: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        color: "#6c757d",
        border: "none",
        borderRadius: "6px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.3s ease"
    },
    confirmButton: {
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
    disabledButton: {
        backgroundColor: "#a9a9a9",
        cursor: "not-allowed"
    },
    smallSpinner: {
        border: "2px solid #ffffff",
        borderTop: "2px solid transparent",
        borderRadius: "50%",
        width: "16px",
        height: "16px",
        animation: "spin 1s linear infinite",
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
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #0056b3",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        animation: "spin 1s linear infinite",
        marginBottom: "15px"
    },
    loadingText: {
        fontSize: "16px",
        color: "#6c757d"
    },
    errorContainer: {
        backgroundColor: "#ffebee",
        color: "#d32f2f",
        padding: "15px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center"
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
    }
};

export default ConfirmBooking;