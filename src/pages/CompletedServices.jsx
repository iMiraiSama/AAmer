import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Calendar, MapPin, DollarSign, User, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

function CompletedServices() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const isAuthenticated = token !== null;

    // State variables
    const [completedServices, setCompletedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState('');
    const [reviews, setReviews] = useState([]);

    // Fetch completed bookings
    useEffect(() => {
        const fetchCompletedServices = async () => {
            try {
                setLoading(true);
                console.log("📌 Starting to fetch completed services");
                console.log("📌 Current user ID:", userId);
                console.log("📌 Current user type:", userType);
                
                const response = await fetch("http://localhost:5003/api/booking/all-completed-bookings", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                console.log("📌 Raw API response:", data);

                // Filter bookings based on user type
                const filteredBookings = data.filter(booking => {
                    // Convert IDs to strings for comparison
                    const bookingUserId = String(booking.userId);
                    const currentUserId = String(userId);
                    const providerUserId = booking.provider ? String(booking.provider.userId) : null;
                    
                    console.log("📌 ID comparison:", {
                        bookingId: booking._id,
                        bookingUserId,
                        currentUserId,
                        providerUserId,
                        userType
                    });
                    
                    // For users, show bookings where they are either the booking creator or the provider
                    const isUserBooking = bookingUserId === currentUserId || providerUserId === currentUserId;
                    
                    console.log("📌 User booking check:", {
                        bookingId: booking._id,
                        bookingUserId,
                        currentUserId,
                        providerUserId,
                        isUserBooking,
                        bookingType: booking.bookingType
                    });
                    
                    return isUserBooking;
                });

                console.log("📌 Filtered bookings:", filteredBookings);
                setCompletedServices(filteredBookings);
            } catch (error) {
                console.error("Error fetching completed services:", error);
                setError("Failed to load completed services");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && userId && userType) {
            fetchCompletedServices();
        }
    }, [userId, userType, isAuthenticated, token]);

    // Fetch reviews for completed bookings
    useEffect(() => {
        const fetchReviews = async () => {
            if (!isAuthenticated || completedServices.length === 0) return;
            
            try {
                const bookingIds = completedServices.map(booking => booking._id);
                const reviewPromises = bookingIds.map(bookingId => 
                    fetch(`http://localhost:5003/api/reviews/booking/${bookingId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }).then(res => res.json())
                );
                
                const reviewResults = await Promise.all(reviewPromises);
                const validReviews = reviewResults.filter(review => !review.error);
                
                // Create a map of bookingId to review
                const reviewMap = {};
                validReviews.forEach(review => {
                    reviewMap[review.bookingId] = review;
                });
                
                setReviews(reviewMap);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        };

        fetchReviews();
    }, [isAuthenticated, token, completedServices]);

    // Handle review form input change
    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setReviewForm(prev => ({
            ...prev,
            [name]: name === 'rating' ? parseInt(value) : value
        }));
    };

    // Handle review submission
    const handleSubmitReview = async () => {
        if (!selectedBooking) return;
        
        setSubmittingReview(true);
        setError('');
        
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('You must be logged in to submit a review.');
            setSubmittingReview(false);
            return;
        }
        
        try {
            console.log('Submitting review with token:', token.substring(0, 10) + '...');
            
            const response = await fetch('http://localhost:5003/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookingId: selectedBooking._id,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setReviewSuccess('Review submitted successfully!');
                setReviews(prev => ({
                    ...prev,
                    [selectedBooking._id]: data.review
                }));
                setShowReviewModal(false);
                setReviewForm({ rating: 5, comment: '' });
                
                // Reset success message after 3 seconds
                setTimeout(() => {
                    setReviewSuccess('');
                }, 3000);
            } else {
                setError(data.error || 'Failed to submit review.');
                console.error('Review submission error:', data);
            }
        } catch (err) {
            setError('Error submitting review. Please try again.');
            console.error('Error submitting review:', err);
        } finally {
            setSubmittingReview(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Render loading state
    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <LoadingSpinner message="Loading completed services..." />
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.errorContainer}>
                    <AlertCircle size={24} style={styles.errorIcon} />
                    <p style={styles.errorText}>{error}</p>
                    <button 
                        style={styles.primaryButton}
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Render empty state
    if (completedServices.length === 0) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.emptyStateContainer}>
                    <CheckCircle size={48} style={styles.emptyStateIcon} />
                    <h3 style={styles.emptyStateTitle}>No Completed Services</h3>
                    <p style={styles.emptyStateText}>
                        {userType === 'user' 
                            ? "You haven't completed any services yet." 
                            : "You haven't completed any service requests yet."}
                    </p>
                    <button 
                        style={styles.primaryButton}
                        onClick={() => navigate('/requests')}
                    >
                        Browse Services
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentContainer}>
                <header style={styles.header}>
                    <h1 style={styles.title}>Completed Services</h1>
                    <p style={styles.subtitle}>
                        {userType === 'user' 
                            ? "View your completed services and leave reviews" 
                            : "View your completed service requests and received reviews"}
                    </p>
                </header>

                {reviewSuccess && (
                    <div style={styles.successMessage}>
                        <CheckCircle size={20} style={{ marginRight: '8px' }} />
                        {reviewSuccess}
                    </div>
                )}

                <div style={styles.bookingsGrid}>
                    {completedServices.map(booking => (
                        <div key={booking._id} style={styles.bookingCard}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.serviceTitle}>
                                    {booking.serviceType || 'Service Request'}
                                </h3>
                                <span style={styles.date}>{formatDate(booking.createdAt)}</span>
                            </div>
                            
                            <div style={styles.cardDetails}>
                                <div style={styles.detailItem}>
                                    <Calendar size={16} style={styles.detailIcon} />
                                    <span>Completed on {formatDate(booking.updatedAt || booking.createdAt)}</span>
                                </div>
                                {booking.location && (
                                    <div style={styles.detailItem}>
                                        <MapPin size={16} style={styles.detailIcon} />
                                        <span>{booking.location}</span>
                                    </div>
                                )}
                                {booking.price && (
                                    <div style={styles.detailItem}>
                                        <DollarSign size={16} style={styles.detailIcon} />
                                        <span>SAR {booking.price}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div style={styles.reviewSection}>
                                {reviews[booking._id] ? (
                                    <div style={styles.existingReview}>
                                        <div style={styles.ratingContainer}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={16} 
                                                    style={{
                                                        color: i < reviews[booking._id].rating ? '#FFC107' : '#E0E0E0',
                                                        marginRight: '2px'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p style={styles.reviewComment}>{reviews[booking._id].comment}</p>
                                        <p style={styles.reviewDate}>
                                            Reviewed on {formatDate(reviews[booking._id].createdAt)}
                                        </p>
                                    </div>
                                ) : userType === 'user' ? (
                                    <button 
                                        style={styles.reviewButton}
                                        onClick={() => {
                                            setSelectedBooking(booking);
                                            setShowReviewModal(true);
                                        }}
                                    >
                                        <Star size={16} style={{ marginRight: '8px' }} />
                                        Leave a Review
                                    </button>
                                ) : (
                                    <p style={styles.noReviewText}>No review yet</p>
                                )}
                            </div>
                            
                            <div style={styles.cardFooter}>
                                {/* <button 
                                    style={styles.detailButton}
                                    onClick={() => navigate(`/booking-details/${booking._id}`)}
                                >
                                    View Details
                                </button> */}
                                {userType === 'user' && (
                                    <button 
                                        style={styles.contactButton}
                                        onClick={() => navigate(`/ServiceChat?userId=${booking.providerId || booking.serviceId}`)}
                                    >
                                        <MessageSquare size={16} style={{ marginRight: '8px' }} />
                                        Contact Provider
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>Leave a Review</h2>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Rating</label>
                            <div style={styles.ratingContainer}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star 
                                        key={star} 
                                        size={24} 
                                        style={{
                                            color: star <= reviewForm.rating ? '#FFC107' : '#E0E0E0',
                                            cursor: 'pointer',
                                            marginRight: '4px'
                                        }}
                                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Comment</label>
                            <textarea 
                                style={styles.textarea}
                                name="comment"
                                value={reviewForm.comment}
                                onChange={handleReviewChange}
                                placeholder="Share your experience with this service..."
                                rows="4"
                                required
                            />
                        </div>
                        
                        <div style={styles.modalActions}>
                            <button 
                                style={styles.cancelButton}
                                onClick={() => setShowReviewModal(false)}
                                disabled={submittingReview}
                            >
                                Cancel
                            </button>
                            <button 
                                style={styles.submitButton}
                                onClick={handleSubmitReview}
                                disabled={submittingReview || !reviewForm.comment.trim()}
                            >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
    },
    header: {
        marginBottom: '30px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#2c3e50',
        margin: '0 0 10px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#6c757d',
        margin: '0',
    },
    successMessage: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#d4edda',
        color: '#155724',
        borderRadius: '4px',
        marginBottom: '20px',
    },
    bookingsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    bookingCard: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        borderBottom: '1px solid #e9ecef',
    },
    serviceTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        margin: '0',
    },
    date: {
        fontSize: '14px',
        color: '#6c757d',
    },
    cardDetails: {
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    detailItem: {
        display: 'flex',
        alignItems: 'center',
    },
    detailIcon: {
        marginRight: '8px',
        color: '#0056b3',
    },
    reviewSection: {
        padding: '15px',
        borderTop: '1px solid #e9ecef',
    },
    existingReview: {
        backgroundColor: '#f8f9fa',
        padding: '12px',
        borderRadius: '4px',
    },
    ratingContainer: {
        display: 'flex',
        marginBottom: '8px',
    },
    reviewComment: {
        fontSize: '14px',
        color: '#2c3e50',
        margin: '0 0 8px',
    },
    reviewDate: {
        fontSize: '12px',
        color: '#6c757d',
        margin: '0',
    },
    reviewButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        border: '1px dashed #ced4da',
        borderRadius: '4px',
        color: '#0056b3',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    noReviewText: {
        fontSize: '14px',
        color: '#6c757d',
        textAlign: 'center',
        margin: '0',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '15px',
        borderTop: '1px solid #e9ecef',
    },
    detailButton: {
        padding: '8px 16px',
        backgroundColor: '#e9ecef',
        color: '#495057',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    contactButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: '#0056b3',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '20px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50',
        margin: '0 0 20px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#495057',
        marginBottom: '8px',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '14px',
        resize: 'vertical',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#e9ecef',
        color: '#495057',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#0056b3',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
    },
    errorIcon: {
        color: '#dc3545',
        marginBottom: '16px',
    },
    errorText: {
        fontSize: '16px',
        color: '#dc3545',
        margin: '0 0 20px',
    },
    primaryButton: {
        padding: '10px 20px',
        backgroundColor: '#0056b3',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    emptyStateContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
    },
    emptyStateIcon: {
        color: '#6c757d',
        marginBottom: '16px',
    },
    emptyStateTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50',
        margin: '0 0 10px',
    },
    emptyStateText: {
        fontSize: '16px',
        color: '#6c757d',
        margin: '0 0 20px',
    },
};

export default CompletedServices; 