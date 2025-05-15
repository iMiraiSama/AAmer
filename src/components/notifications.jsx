import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");  
    const isAuthenticated = token !== null;

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchNotifications = async () => {
            try {
                const response = await fetch(`http://localhost:5003/api/notifications/get-latest-notifications/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (data) {
                    setNotifications(data);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching notifications:", err);
                setError("Failed to fetch notifications");
                setLoading(false);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [isAuthenticated, token, userId]);

    const markNotificationRead = async (notificationId) => {
        try {
            const response = await fetch(`http://localhost:5003/api/notifications/mark-notification-read/${notificationId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.ok) {
                setNotifications(prev => 
                    prev.map(notif => 
                        notif._id === notificationId ? { ...notif, isRead: true } : notif
                    )
                );
            }
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch(`http://localhost:5003/api/notifications/mark-notifications-read/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.ok) {
                setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
            }
        } catch (err) {
            console.error("Error marking notifications as read:", err);
        }
    };

    const handleNotificationClick = (notification) => {
        // Mark notification as read
        if (!notification.isRead) {
            markNotificationRead(notification._id);
        }

        // Route based on notification type
        switch (notification.type) {
            case 'payment':
                // Navigate to booking details
                navigate(`/booking/${notification.entityId}`);
                break;
            case 'review':
                // Navigate to review form
                navigate(`/review/${notification.entityId}`);
                break;
            case 'booking':
                // Navigate to booking details
                navigate(`/ConfirmBooking/${notification.entityId}`);
                break;
            default:
                // Default behavior
                break;
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'payment':
                return '💰';
            case 'review':
                return '⭐';
            case 'booking':
                return '📅';
            default:
                return '🔔';
        }
    };

    const renderNotificationIcon = () => {
        return <Bell size={20} style={{ 
            marginRight: "10px", 
            color: "#0056b3" 
        }} />;
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                {renderNotificationIcon()}
                <h3 style={styles.title}>Notifications</h3>
                {notifications.length > 0 && (
                    <button onClick={markAllAsRead} style={styles.markReadButton}>
                        Mark All as Read
                    </button>
                )}
            </div>

            {loading ? (
                <p style={styles.loadingText}>Loading notifications...</p>
            ) : error ? (
                <p style={styles.errorText}>{error}</p>
            ) : notifications.length === 0 ? (
                <p style={styles.noNotifications}>No new notifications.</p>
            ) : (
                <ul style={styles.list}>
                    {notifications.slice(0, 5).map((notification) => (
                        <li 
                            key={notification._id} 
                            style={{
                                ...styles.notification,
                                backgroundColor: notification.isRead ? '#f8f9fa' : '#e3f2fd',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <span style={styles.notificationIcon}>
                                {getNotificationIcon(notification.type)}
                            </span>
                            {notification.message}
                            {!notification.isRead && <span style={styles.unreadDot}>●</span>}
                        </li>
                    ))}
                    {notifications.length > 5 && (
                        <li style={styles.moreNotifications}>
                            {`+${notifications.length - 5} more notifications`}
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}

// ✅ Improved styling for a modern and readable notification UI
const styles = {
    container: {
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        textAlign: "left",
        maxWidth: "400px",
        margin: "auto",
        border: "1px solid #e9ecef"
    },
    header: {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px",
        borderBottom: "1px solid #dee2e6",
        paddingBottom: "10px",
        justifyContent: "space-between"
    },
    title: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#0056b3",
        margin: 0
    },
    markReadButton: {
        backgroundColor: "#0056b3",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "6px 12px",
        fontSize: "12px",
        cursor: "pointer",
        transition: "background-color 0.2s",
        ':hover': {
            backgroundColor: "#004494",
        }
    },
    noNotifications: {
        fontSize: "14px",
        color: "gray",
        textAlign: "center",
        padding: "10px 0"
    },
    loadingText: {
        fontSize: "14px",
        color: "#6c757d",
        textAlign: "center",
        padding: "10px 0"
    },
    errorText: {
        fontSize: "14px",
        color: "#dc3545",
        textAlign: "center",
        padding: "10px 0"
    },
    list: {
        listStyleType: "none",
        padding: 0,
        margin: 0
    },
    notification: {
        backgroundColor: "white",
        padding: "10px",
        marginBottom: "5px",
        borderRadius: "5px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        fontSize: "14px",
        color: "#333",
        position: "relative",
        transition: "background-color 0.2s",
        display: "flex",
        alignItems: "center"
    },
    notificationIcon: {
        marginRight: "10px",
        fontSize: "16px"
    },
    unreadDot: {
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#2196F3",
        fontSize: "12px"
    },
    moreNotifications: {
        textAlign: "center",
        color: "#6c757d",
        fontSize: "12px",
        padding: "5px 0",
        borderTop: "1px solid #eaeaea"
    }
};

export default Notifications;