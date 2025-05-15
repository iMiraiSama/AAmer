import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ViewOffers() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isAuthenticated = token !== null;

    // ✅ Redirect to login if the user is not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    const [offers, setOffers] = useState([]);
    const [sortType, setSortType] = useState("");
    const [error, setError] = useState("");

    // ✅ Fetch offers from the backend
    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch("http://localhost:5003/api/view-offers", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (data.success) {
                    setOffers(data.offers);
                } else {
                    setError("Failed to load offers.");
                }
            } catch (err) {
                setError("Error fetching offers.");
            }
        };

        if (isAuthenticated) {
            fetchOffers();
        }
    }, [isAuthenticated, token]);

    // ✅ Sorting function
    const handleSort = (type) => {
        let sortedOffers = [...offers];

        if (type === "price") {
            sortedOffers.sort((a, b) => a.price - b.price);
        } else if (type === "date") {
            sortedOffers.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (type === "provider") {
            sortedOffers.sort((a, b) => a.provider.localeCompare(b.provider));
        }

        setOffers(sortedOffers);
        setSortType(type);
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Service Offers</h2>

            {/* ✅ Sorting Options */}
            <div style={styles.sortContainer}>
                <label>Sort by: </label>
                <select onChange={(e) => handleSort(e.target.value)} value={sortType} style={styles.select}>
                    <option value="">Select</option>
                    <option value="price">Price</option>
                    <option value="date">Date</option>
                    <option value="provider">Provider</option>
                </select>
            </div>

            {/* ✅ Display Offers */}
            {error && <p style={styles.error}>{error}</p>}
            {offers.length === 0 ? (
                <p style={styles.noOffers}>No offers available at the moment.</p>
            ) : (
                <div style={styles.grid}>
                    {offers.map((offer) => (
                        <div key={offer.id} style={styles.card}>
                            <h3>{offer.provider}</h3>
                            <p><strong>Price:</strong> {offer.price} SAR</p>
                            <p><strong>Message:</strong> {offer.message}</p>
                            <p><strong>Date:</strong> {offer.date}</p>
                            <button style={styles.button}>Accept Offer</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ✅ Improved styling to match the overall app design
const styles = {
    container: {
        padding: "20px",
        textAlign: "center",
        marginTop: "60px", // Improved spacing between navbar and content
    },
    title: {
        fontSize: "24px",
        color: "#0056b3", // Updated color
        fontWeight: "bold",
    },
    sortContainer: {
        marginBottom: "15px",
    },
    select: {
        padding: "8px",
        fontSize: "16px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        cursor: "pointer",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "15px",
        marginTop: "20px",
    },
    card: {
        backgroundColor: "#f8f9fa",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        transition: "0.3s",
        textAlign: "left",
    },
    button: {
        backgroundColor: "#0056b3", // Updated color
        color: "white",
        padding: "10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        marginTop: "10px",
    },
    noOffers: {
        fontSize: "18px",
        color: "gray",
        marginTop: "20px",
    },
    error: {
        color: "red",
        fontSize: "14px",
        marginTop: "10px",
    },
};

export default ViewOffers;