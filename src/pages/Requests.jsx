import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
    Search, 
    Filter, 
    Plus, 
    Calendar, 
    MapPin, 
    DollarSign, 
    Clock, 
    AlertCircle, 
    CheckCircle, 
    FileText, 
    ArrowLeft,
    Building,
    MessageSquare,
    Star,
    ChevronDown
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

function Requests() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const isAuthenticated = token !== null;
    const userType = localStorage.getItem("userType");
    const userId = localStorage.getItem("userId");

    // Authentication check
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    // State management
    const [requests, setRequests] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [sortType, setSortType] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isMyRequestsLoading, setIsMyRequestsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("browse");
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRequests, setFilteredRequests] = useState([]);

    // Set initial tab based on user type or navigation state
    useEffect(() => {
        if (location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab);
        } else if (userType === 'user') {
            setActiveTab("myRequests");
        }
    }, [location.state, userType]);

    // Filter requests based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredRequests(requests);
        } else {
            const filtered = requests.filter(request => 
                request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRequests(filtered);
        }
    }, [searchTerm, requests]);

    useEffect(() => {
        const fetchRequests = async () => {
            if (userType !== 'provider' || !userId) return;
            setIsLoading(true);
            try {
                const response = await fetch("http://localhost:5003/api/requests/get-requests?status=pending", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (response.ok && data) {
                    setRequests(data);
                    setFilteredRequests(data);
                } else {
                    setError(data?.error || "Failed to load requests.");
                }
            } catch (err) {
                setError("Error fetching requests.");
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchRequests();
        }
    }, [isAuthenticated, token]);

    // Fetch user's own requests
    useEffect(() => {
        const fetchMyRequests = async () => {
            if (userType !== 'user' || !userId) return;
            
            setIsMyRequestsLoading(true);
            try {
                const response = await fetch(`http://localhost:5003/api/requests/get-user-requests/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (response.ok && data) {
                    setMyRequests(data);
                } else {
                    setError(data?.error || "Failed to load your requests.");
                }
            } catch (err) {
                setError("Error fetching your requests.");
            } finally {
                setIsMyRequestsLoading(false);
            }
        };

        if (isAuthenticated && userType === 'user') {
            fetchMyRequests();
        }
    }, [isAuthenticated, token, userId, userType]);

    // Sort requests
    const handleSort = (type) => {
        let sortedRequests = [...filteredRequests];

        if (type === "price") {
            sortedRequests.sort((a, b) => a.price - b.price);
        } else if (type === "date") {
            sortedRequests.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (type === "location") {
            sortedRequests.sort((a, b) => a.location.localeCompare(b.location));
        }

        setFilteredRequests(sortedRequests);
        setSortType(type);
    };

    // New request form state
    const [newRequest, setNewRequest] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        serviceType: "",
    });

    const serviceOptions = [
        "Home Cleaning",
        "Plumbing",
        "Electrical",
        "Carpentry",
        "Gardening",
        "Moving",
        "IT Support",
        "Tutoring",
        "Cooking",
        "Childcare"
    ];

    // Form input handler
    const handleChange = (e) => {
        setNewRequest({ ...newRequest, [e.target.name]: e.target.value });
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (!newRequest.title || !newRequest.description || !newRequest.price || !newRequest.location || !newRequest.serviceType) {
            setError("All fields are required.");
            return;
        }

        if (isNaN(newRequest.price) || newRequest.price <= 0) {
            setError("Price must be a valid positive number.");
            return;
        }
        const newRequestUpdated={...newRequest, userId: userId}
        try {
            const response = await fetch("http://localhost:5003/api/requests/post-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newRequestUpdated),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess("Service request posted successfully!");
                setRequests([...requests, data.newRequest]);
                // Add to my requests as well
                setMyRequests([...myRequests, data.newRequest]);
                setNewRequest({ title: "", description: "", price: "", location: "", serviceType: "" });
                // Optionally switch to my requests tab after successful submission
                setActiveTab("myRequests");
            } else {
                setError(data.message || "Failed to post service request.");
            }
        } catch (err) {
            setError("Server error. Please try again.");
        }
    };

    // Function to get tag color based on service type
    const getServiceTagColor = (serviceType) => {
        if (!serviceType) return "#607D8B"; // Default color for undefined serviceType
        
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
        if (!status) return "#607D8B"; // Default color for undefined status
        
        // Convert status to lowercase for case-insensitive comparison
        const statusLower = status.toLowerCase();
        
        const colors = {
            "pending": "#FFC107", // Yellow
            "in progress": "#2196F3", // Blue
            "completed": "#4CAF50", // Green
            "cancelled": "#F44336", // Red
            "awaiting confirmation": "#9C27B0", // Purple
            "accepted": "#4CAF50", // Green
            "rejected": "#F44336", // Red
        };
        
        return colors[statusLower] || "#607D8B"; // Default color
    };

    // Function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle view details click
    const handleViewDetails = (requestId) => {
        navigate(`/RequestDetails/${requestId}`);
    };

    // Handle confirm service click
    const handleBookingDetails = (request) => {
        navigate(`/BookingDetails/${request._id}`);
    };

    // Handle contact click
    const handleContact = (request) => {
        setSelectedRequest(request);
        navigate('/ServiceChat?userId=' + request.userId);
    };

    // Render loading state
    const renderLoadingState = () => {
        return <LoadingSpinner message="Loading requests..." />;
    };

    // Render error state
    const renderErrorState = () => {
        return (
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
        );
    };

    // Render empty state
    const renderEmptyState = (message, buttonText, buttonAction) => {
        return (
            <div style={styles.emptyStateContainer}>
                <FileText size={48} style={styles.emptyStateIcon} />
                <h3 style={styles.emptyStateTitle}>No Requests Found</h3>
                <p style={styles.emptyStateText}>{message}</p>
                <button 
                    style={styles.primaryButton}
                    onClick={buttonAction}
                >
                    {buttonText}
                </button>
            </div>
        );
    };

    // Render request card
    const renderRequestCard = (request) => {
        return (
            <div key={request._id} style={styles.card}>
                <div style={styles.cardHeader}>
                    <span 
                        style={{
                            ...styles.serviceTag,
                            backgroundColor: getServiceTagColor(request.serviceType)
                        }}
                    >
                        {request.serviceType}
                    </span>
                    <span style={styles.date}>{formatDate(request.createdAt)}</span>
                </div>
                <h3 style={styles.cardTitle}>{request.title}</h3>
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
                <p style={styles.description}>
                    {request.description && request.description.length > 100 
                        ? `${request.description.substring(0, 100)}...` 
                        : request.description}
                </p>
                <div style={styles.cardFooter}>
                    <button 
                        style={styles.detailButton}
                        onClick={() => handleViewDetails(request._id)}
                    >
                        View Details
                    </button>
                    <button 
                        style={styles.contactButton}
                        onClick={() => handleContact(request)}
                    >
                        Contact
                    </button>
                </div>
            </div>
        );
    };

    // Render my request card
    const renderMyRequestCard = (request) => {
        if (!request) return null;
        
        // Ensure all required properties exist
        const serviceType = request.serviceType || 'Other';
        const title = request.title || 'Untitled Request';
        const price = request.price || 0;
        const location = request.location || 'Location not specified';
        const description = request.description || 'No description provided';
        const createdAt = request.createdAt || new Date();
        const status = request.status || 'pending';
        
        // Capitalize first letter of status for display
        const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
        
        return (
            <div key={request._id} style={styles.card}>
                <div style={styles.cardHeader}>
                    <span 
                        style={{
                            ...styles.serviceTag,
                            backgroundColor: getServiceTagColor(serviceType)
                        }}
                    >
                        {serviceType}
                    </span>
                    <span style={styles.date}>{formatDate(createdAt)}</span>
                </div>
                <h3 style={styles.cardTitle}>{title}</h3>
                <div style={styles.cardDetails}>
                    <div style={styles.detailItem}>
                        <DollarSign size={16} style={styles.detailIcon} />
                        <span style={styles.price}>SAR {price}</span>
                    </div>
                    <div style={styles.detailItem}>
                        <MapPin size={16} style={styles.detailIcon} />
                        <span>{location}</span>
                    </div>
                </div>
                {/* Status label */}
                <div style={styles.statusContainer}>
                    <span 
                        style={{
                            ...styles.statusTag,
                            backgroundColor: getStatusColor(status)
                        }}
                    >
                        {displayStatus}
                    </span>
                </div>
                <p style={styles.description}>
                    {description.length > 100 ? `${description.substring(0, 100)}...` : description}
                </p>
                <div style={styles.cardFooter}>
                    <button 
                        style={styles.detailButton}
                        onClick={() => handleViewDetails(request._id)}
                    >
                        View Details
                    </button>
                    {status === "pending" && (
                        <button 
                            style={styles.viewOffersButton}
                            onClick={() => handleBookingDetails(request)}
                        >
                            View Offers
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Render create request form
    const renderCreateRequestForm = () => {
        return (
            <div style={styles.formContainer}>
                <h2 style={styles.formTitle}>Post a New Service Request</h2>
                {success && <div style={styles.success}>{success}</div>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Title</label>
                        <input 
                            type="text" 
                            name="title" 
                            value={newRequest.title} 
                            onChange={handleChange} 
                            placeholder="Enter a clear title for your request" 
                            style={styles.input} 
                            required 
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea 
                            name="description" 
                            value={newRequest.description} 
                            onChange={handleChange} 
                            placeholder="Describe what you need help with in detail" 
                            style={styles.textarea} 
                            required
                        ></textarea>
                    </div>
                    
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Price (SAR)</label>
                            <input 
                                type="number" 
                                name="price" 
                                value={newRequest.price} 
                                onChange={handleChange} 
                                placeholder="Your budget" 
                                style={styles.input} 
                                required 
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Location</label>
                            <input 
                                type="text" 
                                name="location" 
                                value={newRequest.location} 
                                onChange={handleChange} 
                                placeholder="City, neighborhood, etc." 
                                style={styles.input} 
                                required 
                            />
                        </div>
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Service Type</label>
                        <select 
                            name="serviceType" 
                            value={newRequest.serviceType} 
                            onChange={handleChange} 
                            style={styles.select} 
                            required
                        >
                            <option value="">Select Service Type</option>
                            {serviceOptions.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button type="submit" style={styles.submitButton}>
                        <Plus size={18} style={styles.buttonIcon} />
                        Post Request
                    </button>
                </form>
            </div>
        );
    };

    // Render browse requests section
    const renderBrowseRequests = () => {
        return (
            <>
                {/* Search and Filter */}
                <div style={styles.searchFilterContainer}>
                    <div style={styles.searchContainer}>
                        <Search size={20} style={styles.searchIcon} />
                        <input 
                            type="text" 
                            placeholder="Search requests..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <div style={styles.filterContainer}>
                        <Filter size={20} style={styles.filterIcon} />
                        <select 
                            onChange={(e) => handleSort(e.target.value)} 
                            value={sortType} 
                            style={styles.filterSelect}
                        >
                            <option value="">Sort by</option>
                            <option value="price">Price (Low to High)</option>
                            <option value="date">Date (Oldest First)</option>
                            <option value="location">Location (A-Z)</option>
                        </select>
                        <ChevronDown size={16} style={styles.selectIcon} />
                    </div>
                </div>

                {/* Display Requests */}
                {isLoading ? (
                    renderLoadingState()
                ) : error ? (
                    renderErrorState()
                ) : filteredRequests.length === 0 ? (
                    renderEmptyState(
                        "No service requests available at the moment.",
                        "Post Your Request",
                        () => setActiveTab("create")
                    )
                ) : (
                    <div style={styles.grid}>
                        {filteredRequests.map(renderRequestCard)}
                    </div>
                )}
            </>
        );
    };

    // Render my requests section
    const renderMyRequests = () => {
        return (
            <>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>My Service Requests</h2>
                </div>

                {/* Display My Requests */}
                {isMyRequestsLoading ? (
                    renderLoadingState()
                ) : myRequests.length === 0 ? (
                    renderEmptyState(
                        "You haven't posted any service requests yet.",
                        "Post Your First Request",
                        () => setActiveTab("create")
                    )
                ) : (
                    <div style={styles.grid}>
                        {myRequests.map(renderMyRequestCard)}
                    </div>
                )}
            </>
        );
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentContainer}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Service Requests</h1>
                        <p style={styles.subtitle}>Find services or post your own request</p>
                    </div>
                    <div style={styles.headerActions}>
                        {userType === 'user' && (
                            <button 
                                style={styles.primaryButton} 
                                onClick={() => setActiveTab("create")}
                            >
                                <Plus size={18} style={styles.buttonIcon} />
                                New Request
                            </button>
                        )}
                    </div>
                </header>

                {error && (
                    <div style={styles.errorBanner}>
                        <AlertCircle size={20} style={styles.errorIcon} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div style={styles.tabs}>
                    {userType === 'provider' && (                
                        <button 
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === "browse" ? styles.activeTab : {})
                            }}
                            onClick={() => setActiveTab("browse")}
                        >
                            Browse Requests
                        </button>
                    )}
                    {userType === 'user' && (
                        <>
                            <button 
                                style={{
                                    ...styles.tabButton,
                                    ...(activeTab === "create" ? styles.activeTab : {})
                                }}
                                onClick={() => setActiveTab("create")}
                            >
                                Post New Request
                            </button>
                            <button 
                                style={{
                                    ...styles.tabButton,
                                    ...(activeTab === "myRequests" ? styles.activeTab : {})
                                }}
                                onClick={() => setActiveTab("myRequests")}
                            >
                                My Requests
                            </button>
                        </>
                    )}
                </div>

                {/* Tab Content */}
                {activeTab === "create" && renderCreateRequestForm()}
                {activeTab === "myRequests" && renderMyRequests()}
                {activeTab === "browse" && renderBrowseRequests()}
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Contact Information</h3>
                            <button 
                                style={styles.closeButton}
                                onClick={() => setShowContactModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div style={styles.modalContent}>
                            <div style={styles.contactInfo}>
                                <div style={styles.contactIcon}>📞</div>
                                <div style={styles.contactNumber}>9623233445</div>
                                <div style={styles.contactNote}>
                                    Please mention that you found this service request on our platform.
                                </div>
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button 
                                style={styles.closeModalButton}
                                onClick={() => setShowContactModal(false)}
                            >
                                Close
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
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        borderBottom: "1px solid #e9ecef",
        paddingBottom: "20px"
    },
    title: {
        fontSize: "24px",
        color: "#0056b3",
        margin: 0,
        fontWeight: "600"
    },
    subtitle: {
        fontSize: "16px",
        color: "#6c757d",
        margin: "5px 0 0 0"
    },
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "15px"
    },
    primaryButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0056b3",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
        gap: "8px"
    },
    buttonIcon: {
        marginRight: "4px"
    },
    tabs: {
        display: "flex",
        marginBottom: "30px",
        borderBottom: "1px solid #e0e0e0",
    },
    tabButton: {
        padding: "12px 24px",
        backgroundColor: "transparent",
        border: "none",
        borderBottom: "3px solid transparent",
        fontSize: "16px",
        fontWeight: "500",
        color: "#7f8c8d",
        cursor: "pointer",
        transition: "all 0.3s ease",
        outline: "none",
    },
    activeTab: {
        borderBottom: "3px solid #0056b3",
        color: "#0056b3",
    },
    formContainer: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "30px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
        marginBottom: "30px",
    },
    formTitle: {
        fontSize: "22px",
        color: "#2c3e50",
        marginTop: 0,
        marginBottom: "20px",
        fontWeight: "500",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
    },
    formRow: {
        display: "flex",
        gap: "20px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "500",
        marginBottom: "8px",
        color: "#34495e",
    },
    input: {
        padding: "12px 15px",
        borderRadius: "6px",
        border: "1px solid #dcdfe6",
        fontSize: "15px",
        transition: "border 0.3s",
        outline: "none",
    },
    textarea: {
        padding: "12px 15px",
        borderRadius: "6px",
        border: "1px solid #dcdfe6",
        fontSize: "15px",
        minHeight: "120px",
        resize: "vertical",
        transition: "border 0.3s",
        outline: "none",
    },
    select: {
        padding: "12px 15px",
        borderRadius: "6px",
        border: "1px solid #dcdfe6",
        fontSize: "15px",
        backgroundColor: "#fff",
        cursor: "pointer",
        appearance: "none",
        backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23666\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        paddingRight: "30px",
    },
    submitButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 20px",
        backgroundColor: "#0056b3",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background 0.3s",
        marginTop: "10px",
    },
    error: {
        padding: "12px 15px",
        backgroundColor: "#ffebee",
        border: "1px solid #ffcdd2",
        borderRadius: "6px",
        color: "#c62828",
        marginBottom: "20px",
    },
    success: {
        padding: "12px 15px",
        backgroundColor: "#e8f5e9",
        border: "1px solid #c8e6c9",
        borderRadius: "6px",
        color: "#2e7d32",
        marginBottom: "20px",
    },
    searchFilterContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        gap: "15px",
    },
    searchContainer: {
        display: "flex",
        alignItems: "center",
        flex: 1,
        backgroundColor: "#f8f9fa",
        borderRadius: "6px",
        padding: "0 15px",
        border: "1px solid #e9ecef",
    },
    searchIcon: {
        color: "#6c757d",
        marginRight: "10px",
    },
    searchInput: {
        flex: 1,
        border: "none",
        backgroundColor: "transparent",
        padding: "12px 0",
        fontSize: "15px",
        outline: "none",
    },
    filterContainer: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        borderRadius: "6px",
        padding: "0 15px",
        border: "1px solid #e9ecef",
        position: "relative",
    },
    filterIcon: {
        color: "#6c757d",
        marginRight: "10px",
    },
    filterSelect: {
        padding: "12px 30px 12px 0",
        border: "none",
        backgroundColor: "transparent",
        fontSize: "15px",
        cursor: "pointer",
        appearance: "none",
        outline: "none",
    },
    selectIcon: {
        position: "absolute",
        right: "10px",
        color: "#6c757d",
        pointerEvents: "none",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "20px",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        transition: "transform 0.3s, box-shadow 0.3s",
        border: "1px solid #e9ecef",
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #e9ecef",
    },
    serviceTag: {
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "20px",
        color: "#fff",
        fontSize: "12px",
        fontWeight: "500",
    },
    date: {
        fontSize: "14px",
        color: "#6c757d",
    },
    cardTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#2c3e50",
        margin: "15px 15px 10px 15px",
        lineHeight: "1.4",
    },
    cardDetails: {
        display: "flex",
        flexWrap: "wrap",
        gap: "15px",
        padding: "0 15px 15px 15px",
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
        fontSize: "14px",
        color: "#6c757d",
        lineHeight: "1.5",
        padding: "0 15px 15px 15px",
        flex: "1 0 auto",
    },
    statusContainer: {
        padding: "0 15px 15px 15px",
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
    cardFooter: {
        display: "flex",
        justifyContent: "space-between",
        padding: "15px",
        borderTop: "1px solid #e9ecef",
        marginTop: "auto",
    },
    detailButton: {
        padding: "8px 16px",
        backgroundColor: "transparent",
        border: "1px solid #0056b3",
        borderRadius: "4px",
        color: "#0056b3",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.3s",
    },
    contactButton: {
        padding: "8px 16px",
        backgroundColor: "#0056b3",
        border: "none",
        borderRadius: "4px",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background 0.3s",
    },
    viewOffersButton: {
        padding: "8px 16px",
        backgroundColor: "#28a745",
        border: "none",
        borderRadius: "4px",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background 0.3s",
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "50px 0",
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "3px solid #f3f3f3",
        borderTop: "3px solid #0056b3",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "15px",
    },
    loadingText: {
        color: "#6c757d",
        fontSize: "16px",
    },
    errorContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 0",
        textAlign: "center",
    },
    errorIcon: {
        color: "#dc3545",
        marginBottom: "15px",
    },
    errorText: {
        color: "#6c757d",
        fontSize: "16px",
        marginBottom: "20px",
    },
    errorBanner: {
        backgroundColor: "#ffebee",
        color: "#c62828",
        padding: "12px 15px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        marginBottom: "20px",
    },
    emptyStateContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 0",
        textAlign: "center",
    },
    emptyStateIcon: {
        color: "#6c757d",
        marginBottom: "15px",
    },
    emptyStateTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#2c3e50",
        margin: "0 0 10px 0",
    },
    emptyStateText: {
        color: "#6c757d",
        fontSize: "16px",
        marginBottom: "20px",
        maxWidth: "500px",
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
    },
    sectionTitle: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#2c3e50",
        margin: 0,
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
    modal: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "400px",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
        overflow: "hidden",
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        borderBottom: "1px solid #e9ecef",
    },
    modalTitle: {
        margin: 0,
        color: "#2c3e50",
        fontSize: "20px",
        fontWeight: "500",
    },
    closeButton: {
        background: "none",
        border: "none",
        fontSize: "24px",
        cursor: "pointer",
        color: "#6c757d",
    },
    modalContent: {
        padding: "20px",
    },
    contactInfo: {
        textAlign: "center",
    },
    contactIcon: {
        fontSize: "36px",
        marginBottom: "15px",
    },
    contactNumber: {
        fontSize: "24px",
        fontWeight: "600",
        color: "#0056b3",
        marginBottom: "15px",
    },
    contactNote: {
        fontSize: "14px",
        color: "#6c757d",
        lineHeight: "1.5",
    },
    modalFooter: {
        padding: "15px 20px",
        borderTop: "1px solid #e9ecef",
        display: "flex",
        justifyContent: "flex-end",
    },
    closeModalButton: {
        padding: "8px 16px",
        backgroundColor: "#e9ecef",
        border: "none",
        borderRadius: "4px",
        color: "#495057",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background 0.3s",
    }
};

export default Requests;