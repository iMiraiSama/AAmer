import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    MapPin, 
    Building, 
    FileText, 
    CheckCircle, 
    Clock, 
    Star, 
    CreditCard,
    AlertCircle,
    User,
    DollarSign,
    Check,
    X
} from 'lucide-react';

function UserBookings() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const isAuthenticated = token !== null;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserBookings = async () => {
            try {
                const response = await fetch(`http://localhost:5003/api/booking/get-user-bookings/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch bookings');
                }

                const data = await response.json();
                setBookings(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchUserBookings();
        }
    }, [userId, token, isAuthenticated]);

    const handlePayNow = (booking) => {
        navigate(`/ConfirmBooking/${booking._id}`, { 
            state: { 
                isPaymentOnly: true,
                bookingDetails: booking,
                amount: booking.serviceDetails.price
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'accepted':
                return '#4CAF50';
            case 'pending':
                return '#FFC107';
            case 'rejected':
                return '#F44336';
            case 'completed':
                return '#2196F3';
            default:
                return '#9E9E9E';
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={styles.container}>
                <h2>Please login to view your bookings</h2>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.container}>
                <h2>Loading your bookings...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <h2>Error: {error}</h2>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>My Bookings</h2>
            
            {bookings.length === 0 ? (
                <div style={styles.emptyState}>
                    <p>You don't have any bookings yet.</p>
                </div>
            ) : (
                <div style={styles.bookingsList}>
                    {bookings.map((booking) => (
                        <div key={booking?._id} style={styles.bookingCard}>
                            <div style={styles.bookingHeader}>
                                <h3 style={styles.serviceTitle}>{booking.serviceDetails?.title}</h3>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: getStatusColor(booking.status)
                                }}>
                                    {booking.status}
                                </span>
                            </div>
                            
                            <div style={styles.bookingDetails}>
                                <div style={styles.detailRow}>
                                    <DollarSign size={16} style={styles.icon} />
                                    <span>Price: SAR {booking.serviceDetails?.price}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <MapPin size={16} style={styles.icon} />
                                    <span>Location: {booking.serviceDetails?.location}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <Building size={16} style={styles.icon} />
                                    <span>Service Type: {booking.serviceDetails?.serviceType}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <Calendar size={16} style={styles.icon} />
                                    <span>Booked on: {new Date(booking?.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {booking?.bookingType === 'offer' && booking?.status === 'accepted' && (
                                <button 
                                    style={styles.payButton}
                                    onClick={() => handlePayNow(booking)}
                                >
                                    <CreditCard size={16} style={styles.buttonIcon} />
                                    Pay Now
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '50px auto',
        padding: '20px',
        fontFamily: '"Poppins", sans-serif'
    },
    title: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#002855',
        marginBottom: '20px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        color: '#666'
    },
    bookingsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    bookingHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    serviceTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#002855',
        margin: 0
    },
    statusBadge: {
        padding: '4px 8px',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '500'
    },
    bookingDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    detailRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#666',
        fontSize: '14px'
    },
    icon: {
        color: '#002855'
    },
    payButton: {
        backgroundColor: '#002855',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: '#001e40'
        }
    },
    buttonIcon: {
        color: '#fff'
    }
};

export default UserBookings; 