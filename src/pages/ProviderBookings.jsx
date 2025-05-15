import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    MapPin, 
    Building, 
    User,
    DollarSign
} from 'lucide-react';

function ProviderBookings() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const providerId = localStorage.getItem('userId');
    const isAuthenticated = token !== null;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // Options: 'all', 'request', 'offer'

    useEffect(() => {
        const fetchProviderBookings = async () => {
            try {
                const response = await fetch(`http://localhost:5003/api/booking/get-provider-bookings/${providerId}`, {
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
            fetchProviderBookings();
        }
    }, [providerId, token, isAuthenticated]);

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

    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'all') return true;
        return booking.bookingType === activeTab;
    });
    console.log("Filtered: ",filteredBookings);
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
            <h2 style={styles.title}>Provider Bookings</h2>
            
            <div style={styles.tabs}>
                <button 
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'all' ? styles.activeTab : {})
                    }} 
                    onClick={() => setActiveTab('all')}
                >
                    All Bookings
                </button>
                <button 
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'request' ? styles.activeTab : {})
                    }} 
                    onClick={() => setActiveTab('request')}
                >
                    Service Requests
                </button>
                <button 
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'offer' ? styles.activeTab : {})
                    }} 
                    onClick={() => setActiveTab('offer')}
                >
                    Service Offers
                </button>
            </div>
            
            {filteredBookings.length === 0 ? (
                <div style={styles.emptyState}>
                    <p>No {activeTab === 'request' ? 'service requests' : activeTab === 'offer' ? 'service offers' : 'bookings'} found.</p>
                </div>
            ) : (
                <div style={styles.bookingsList}>
                    {filteredBookings.map((booking) => (
                        <div key={booking._id} style={styles.bookingCard}>
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
                                    <User size={16} style={styles.icon} />
                                    <span>Customer: {booking.userId.name || booking.userId.email}</span>
                                </div>
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
                                    <span>Category: {booking.serviceDetails?.serviceType}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <Calendar size={16} style={styles.icon} />
                                    <span>Booked on: {new Date(booking?.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={styles.bookingTypeBadge}>
                                    {booking.bookingType === 'request' ? 'Service Request' : 'Service Offer'}
                                </div>
                            </div>
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
    tabs: {
        display: 'flex',
        marginBottom: '20px',
        borderBottom: '1px solid #e0e0e0'
    },
    tabButton: {
        background: 'none',
        border: 'none',
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        color: '#666',
        position: 'relative',
        transition: 'all 0.3s ease'
    },
    activeTab: {
        color: '#002855',
        fontWeight: '600',
        borderBottom: '3px solid #002855'
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
        gap: '15px',
        position: 'relative'
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
    bookingTypeBadge: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: '#f0f7ff',
        color: '#0057b8',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        textTransform: 'capitalize',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }
};

export default ProviderBookings;