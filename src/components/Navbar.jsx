import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import WhatsAppLink from "./WhatsappLink";

function Navbar({ onLogout }) {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    const userId = localStorage.getItem("userId");  
    const isAuthenticated = token !== null;

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
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
                setUnreadCount(0);
                setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
            }
        } catch (err) {
            console.error("Error marking notifications as read:", err);
        }
    };

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
                setUnreadCount(prev => prev - 1);
            }
        } catch (err) {
            console.error("Error marking notification as read:", err);
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
                if(userType === 'provider'){
                    navigate(`/provider-bookings`);
                }
                break;
            case 'review':
                // Navigate to review form
                navigate(`/CompletedServices`);
                break;
            case 'booking':
                // Navigate to booking details based on user type
                if (userType === 'provider') {
                    navigate(`/ServiceBookingDetails/${notification.entityId}`);
                } else {
                    navigate(`/BookingDetails/${notification.entityId}`);
                }
                break;
            case 'message':
                navigate(`/ServiceChat/${notification.entityId}`)
            default:
                // Default behavior
                break;
        }
    };

    // Socket.io integration can be uncommented when needed
    // useEffect(() => {
    //     const socket = io("YOUR_SOCKET_SERVER_URL");
    //     socket.on("new_notification", (notification) => {
    //         setNotifications((prev) => [notification, ...prev]);
    //         setUnreadCount((prev) => prev + 1);
    //     });
    //
    //     return () => {
    //         socket.off("new_notification");
    //     };
    // }, []);
    useEffect(() => {
        if (!isAuthenticated) return;

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
                    setUnreadCount(data.filter(notif => !notif.isRead).length);
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };

        // Fetch notifications immediately and every 30 seconds
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [isAuthenticated, token, userId]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setShowMobileMenu(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications && !event.target.closest('.notification-area')) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showNotifications]);

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContainer}>
                <Link to="/" style={styles.logo}>
                    <img src="/AAMER.JPG" alt="AAMER Logo" style={styles.logoImage} />
                </Link>

                <div 
                    style={styles.hamburger} 
                    className={showMobileMenu ? 'active' : ''} 
                    onClick={toggleMobileMenu}
                >
                    <span style={styles.hamburgerIcon}>☰</span>
                </div>

                <div 
                    style={{
                        ...styles.navLinks,
                        ...((isMobile && !showMobileMenu) ? styles.navLinksMobileHidden : {}),
                        ...(isMobile ? styles.navLinksMobile : {})
                    }}
                >
                    {isAuthenticated ? (
                        <>

                            {userType === 'user' && (
                                <>
                                    <Link to="/search" style={styles.link}>Search Services</Link>
                                    <Link to="/UserDashboard" style={styles.link}>Dashboard</Link>
                                    <Link to="/requests" style={styles.link}>Requests</Link>
                                    <Link to="/user-bookings" style={styles.link}>My Bookings</Link>
                                </>
                            )}
                             {/* {userType === "user" && (
                                <>
                                <Link to="/user-dashboard" style={styles.link}>Dashboard</Link>
                                <Link to="/requests" style={styles.link}>Requests</Link>
                                </>
                            )} */}
                            
                            {userType === "provider" && (
                                <>
                                    <Link to="/requests" style={styles.link}>Requests</Link>
                                    <Link to="/ProviderDashboard" style={styles.link}>Dashboard</Link>
                                    <Link to="/Offering" style={styles.link}>Post Offer</Link>
                                    <Link to="/MyServices" style={styles.link}>My Services</Link>
                                    <Link to="/provider-bookings" style={styles.link}>My Bookings</Link>
                                </>
                            )}
                            <Link to="/ServiceChat" style={styles.link}>My Chats</Link>
                            <Link to="/Chat" style={styles.link}>
                                Live Chat 🤖
                            </Link>
                          
                            <div 
                                className="notification-area" 
                                style={styles.notificationContainer} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotifications(!showNotifications);
                                }}
                            >
                                <span style={styles.notificationIcon}>🔔</span> 
                                {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
                            
                                {showNotifications && (
                                    <div className="notification-area" style={styles.notificationsDropdown}>
                                        <h4 style={styles.notificationHeader}>Notifications</h4>
                                        <div style={styles.notificationList}>
                                            {notifications.length === 0 ? (
                                                <p style={styles.emptyNotification}>No new notifications</p>
                                            ) : (
                                                notifications.map((notif, index) => (
                                                    <div 
                                                        key={index} 
                                                        style={{
                                                            ...styles.notificationItem,
                                                            backgroundColor: notif.isRead ? '#f8f9fa' : '#e3f2fd',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleNotificationClick(notif)}
                                                    >
                                                        <span style={styles.notificationIcon}>
                                                            {notif.type === 'payment' ? '💰' : 
                                                             notif.type === 'review' ? '⭐' : 
                                                             notif.type === 'booking' ? '📅' : '🔔'}
                                                        </span>
                                                        {notif.message}
                                                        {!notif.isRead && <span style={styles.unreadDot}>●</span>}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <button onClick={markAllAsRead} style={styles.markReadButton}>
                                            Mark All as Read
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <button onClick={handleLogout} style={styles.logoutButton}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signup" style={styles.signupButton}>Sign Up</Link>
                            <Link to="/login" style={styles.loginButton}>Login</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        background: "#ffffff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 1050,
        fontFamily: '"Poppins", sans-serif',
        marginBottom: "50px",
    },
    navContainer: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        height: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
    },
    logoImage: {
        height: "40px",
        width: "auto",
    },
    hamburger: {
        display: "none",
        cursor: "pointer",
        zIndex: 1060,
        '@media (maxWidth: 768px)': {
            display: "block",
        }
    },
    hamburgerIcon: {
        fontSize: "24px",
        color: "#002855",
    },
    navLinks: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    navLinksMobile: {
        position: "absolute",
        top: "60px",
        left: 0,
        right: 0,
        flexDirection: "column",
        backgroundColor: "#ffffff",
        padding: "10px 0",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        alignItems: "center",
    },
    navLinksMobileHidden: {
        display: "none",
    },
    link: {
        color: "#002855",
        textDecoration: "none",
        fontSize: "15px",
        fontWeight: "500",
        padding: "8px 12px",
        borderRadius: "4px",
        transition: "background-color 0.2s",
        ':hover': {
            backgroundColor: "#f0f7ff",
        }
    },
    loginButton: {
        color: "#002855",
        textDecoration: "none",
        fontSize: "15px",
        fontWeight: "500",
        padding: "8px 16px",
        borderRadius: "4px",
        transition: "all 0.2s",
        border: "1px solid #002855",
        ':hover': {
            backgroundColor: "#f0f7ff",
        }
    },
    signupButton: {
        backgroundColor: "#002855",
        color: "white",
        textDecoration: "none",
        fontSize: "15px",
        fontWeight: "500",
        padding: "8px 16px",
        borderRadius: "4px",
        transition: "all 0.2s",
        ':hover': {
            backgroundColor: "#001e40",
        }
    },
    notificationContainer: {
        position: "relative",
        cursor: "pointer",
        padding: "8px",
    },
    notificationIcon: {
        fontSize: "18px",
        color: "#002855",
    },
    badge: {
        position: "absolute",
        top: "2px",
        right: "2px",
        backgroundColor: "#e74c3c",
        color: "white",
        fontSize: "10px",
        fontWeight: "bold",
        borderRadius: "50%",
        minWidth: "16px",
        height: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2px",
    },
    notificationsDropdown: {
        position: "absolute",
        top: "40px",
        right: "-100px",
        width: "300px",
        backgroundColor: "#ffffff",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 1070,
        overflow: "hidden",
        '@media (maxWidth: 768px)': {
            right: "-50px",
            width: "280px",
        }
    },
    notificationHeader: {
        margin: 0,
        padding: "12px 16px",
        borderBottom: "1px solid #eaeaea",
        fontSize: "16px",
        fontWeight: "600",
        color: "#002855",
    },
    notificationList: {
        maxHeight: "300px",
        overflowY: "auto",
    },
    notificationItem: {
        padding: "12px 16px",
        borderBottom: "1px solid #eaeaea",
        fontSize: "14px",
        color: "#333",
        position: "relative",
        transition: "background-color 0.2s",
    },
    emptyNotification: {
        padding: "16px",
        textAlign: "center",
        color: "#666",
        fontSize: "14px",
    },
    markReadButton: {
        width: "100%",
        padding: "10px 16px",
        backgroundColor: "#002855",
        color: "white",
        border: "none",
        borderRadius: "0 0 6px 6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "background-color 0.2s",
        ':hover': {
            backgroundColor: "#001e40",
        }
    },
    logoutButton: {
        backgroundColor: "#002855",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "8px 16px",
        fontSize: "15px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.2s",
        ':hover': {
            backgroundColor: "#001e40",
        }
    },
    unreadDot: {
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#2196F3",
        fontSize: "12px",
    },
};

export default Navbar;