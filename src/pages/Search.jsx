import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WhatsAppLink from "../components/WhatsappLink";
import ContactModal from "../components/ContactModal";

function Search() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isAuthenticated = token !== null;

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [sortType, setSortType] = useState("");
    const [error, setError] = useState("");
    
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch("http://localhost:5003/api/offering/get-offers", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (data) {
                    setRequests(data);
                } else {
                    setError("Failed to load service requests.");
                }
            } catch (err) {
                setError("Error fetching service requests.");
            }
        };

        if (isAuthenticated) {
            fetchRequests();
        }
    }, [isAuthenticated, token]);

    const handleSort = (type) => {
        let sortedRequests = [...requests];

        if (type === "price") {
            sortedRequests.sort((a, b) => a.price - b.price);
        } else if (type === "location") {
            sortedRequests.sort((a, b) => a.location.localeCompare(b.location));
        }

        setRequests(sortedRequests);
        setSortType(type);
    };

    // Get unique locations from requests
    const uniqueLocations = [...new Set(requests.map(request => request.location))].sort();

    const filteredRequests = requests.filter(
        (request) =>
            request.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === "" || request.serviceType === selectedCategory) &&
            (selectedLocation === "" || request.location === selectedLocation)
    );

    const handleViewDetails = (request) => {
        navigate(`/OfferDetails/${request._id}`);
    };

    const handleContact = (request) => {
        setSelectedRequest(request);
        setShowContactModal(true);
    };

    const handleContinueOnWebsite = () => {
        if (selectedRequest) {
            navigate('/ServiceChat?userId=' + selectedRequest.userId);
            setShowContactModal(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Find Services</h1>
            
            <div style={styles.filterContainer}>
                <div style={styles.searchInputWrapper}>
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
                
                <div style={styles.filterControls}>
                    <select 
                        onChange={(e) => setSelectedCategory(e.target.value)} 
                        value={selectedCategory} 
                        style={styles.select}
                    >
                        <option value="">All Categories</option>
                        <option value="Home Cleaning">Home Cleaning</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="Gardening">Gardening</option>
                        <option value="Moving">Moving</option>
                        <option value="IT Support">IT Support</option>
                        <option value="Tutoring">Tutoring</option>
                        <option value="Cooking">Cooking</option>
                        <option value="Childcare">Childcare</option>
                    </select>

                    <select 
                        onChange={(e) => setSelectedLocation(e.target.value)} 
                        value={selectedLocation} 
                        style={styles.select}
                    >
                        <option value="">All Locations</option>
                        {uniqueLocations.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                    
                    <select 
                        onChange={(e) => handleSort(e.target.value)} 
                        value={sortType} 
                        style={styles.select}
                    >
                        <option value="">Sort by</option>
                        <option value="price">Price: Low to High</option>
                        <option value="location">Location: A-Z</option>
                    </select>
                </div>
            </div>

            <div style={styles.resultsContainer}>
                {error && <div style={styles.error}>{error}</div>}
                
                {filteredRequests.length > 0 ? (
                    <div style={styles.resultsGrid}>
                        {filteredRequests.map((request) => (
                            <div key={request.id} style={styles.serviceCard}>
                                <div style={styles.serviceHeader}>
                                    <h3 style={styles.serviceTitle}>{request.title}</h3>
                                    <span style={styles.serviceCategory}>{request.serviceType}</span>
                                </div>
                                <div style={styles.serviceDetails}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Price:</span>
                                        <span style={styles.priceValue}>SAR {request.price}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Location:</span>
                                        <span style={styles.detailValue}>{request.location}</span>
                                    </div>
                                </div>
                                <div style={styles.serviceActions}>
                                    <button style={{...styles.actionButton, ...styles.viewButton}}
                                        onClick={() => handleViewDetails(request)}>
                                        View Details
                                    </button>
                                    <button 
                                        style={{...styles.actionButton, ...styles.contactButton}} 
                                        onClick={() => handleContact(request)}
                                    >
                                        Contact
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.noResults}>
                        <p style={styles.noResultsText}>No matching services found</p>
                        <p style={styles.noResultsSuggestion}>Try adjusting your search criteria</p>
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            <ContactModal 
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                offer={selectedRequest}
                onContinueOnWebsite={handleContinueOnWebsite}
            />
        </div>
    );
}

// Comprehensive inline styles
const styles = {
    // Global and Container Styles
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    },
    heading: {
        fontSize: "32px",
        fontWeight: "600",
        color: "#2c3e50",
        textAlign: "center",
        marginBottom: "30px"
    },

    // Filter Container Styles
    filterContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        marginBottom: "40px",
        backgroundColor: "#f8f9fa",
        padding: "25px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    },
    searchInputWrapper: {
        width: "100%"
    },
    searchInput: {
        width: "100%",
        padding: "14px 20px",
        fontSize: "16px",
        border: "1px solid #e0e0e0",
        borderRadius: "6px",
        boxSizing: "border-box",
        transition: "border-color 0.3s, box-shadow 0.3s",
        outline: "none"
    },
    filterControls: {
        display: "flex",
        flexWrap: "wrap",
        gap: "15px",
        justifyContent: "space-between"
    },
    select: {
        flex: "1",
        minWidth: "200px",
        padding: "12px 20px",
        fontSize: "16px",
        border: "1px solid #e0e0e0",
        borderRadius: "6px",
        backgroundColor: "#fff",
        cursor: "pointer",
        outline: "none",
        appearance: "none",
        backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23333\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center"
    },

    // Results Container Styles
    resultsContainer: {
        marginTop: "20px"
    },
    resultsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "25px"
    },
    serviceCard: {
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "transform 0.3s, box-shadow 0.3s",
        border: "1px solid #e6e6e6"
    },
    serviceHeader: {
        padding: "20px",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: "#f9f9f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    serviceTitle: {
        margin: "0",
        fontSize: "18px",
        fontWeight: "600",
        color: "#333"
    },
    serviceCategory: {
        display: "inline-block",
        padding: "4px 10px",
        fontSize: "12px",
        fontWeight: "500",
        color: "#fff",
        backgroundColor: "#3498db",
        borderRadius: "30px"
    },
    serviceDetails: {
        padding: "20px"
    },
    detailItem: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px"
    },
    detailLabel: {
        fontWeight: "500",
        color: "#666"
    },
    detailValue: {
        color: "#333"
    },
    priceValue: {
        fontWeight: "600",
        color: "#2ecc71",
        fontSize: "16px"
    },
    serviceActions: {
        display: "flex",
        borderTop: "1px solid #f0f0f0"
    },
    actionButton: {
        flex: "1",
        padding: "12px",
        border: "none",
        fontWeight: "500",
        fontSize: "16px",
        cursor: "pointer",
        transition: "background-color 0.3s"
    },
    viewButton: {
        backgroundColor: "#3498db",
        color: "#fff"
    },
    contactButton: {
        backgroundColor: "#2ecc71",
        color: "#fff"
    },

    // Other Styles
    error: {
        backgroundColor: "#ffebee",
        color: "#c62828",
        padding: "15px",
        borderRadius: "5px",
        marginBottom: "20px",
        textAlign: "center"
    },
    noResults: {
        textAlign: "center",
        padding: "40px 0"
    },
    noResultsText: {
        fontSize: "20px",
        color: "#7f8c8d",
        margin: "0 0 10px 0"
    },
    noResultsSuggestion: {
        fontSize: "16px",
        color: "#95a5a6",
        margin: 0
    },
};

export default Search;