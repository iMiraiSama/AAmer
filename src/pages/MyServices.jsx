import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, FileText, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/MyServices.css';

const MyServices = () => {
    const [offerings, setOfferings] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOfferings, setFilteredOfferings] = useState([]);
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOfferings();
    }, [selectedStatus]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredOfferings(offerings);
        } else {
            const filtered = offerings.filter(offering =>
                offering.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offering.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offering.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offering.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOfferings(filtered);
        }
    }, [searchTerm, offerings]);

    const fetchOfferings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5003/api/offering/get-offers-by-provider/${userId}/${selectedStatus}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch offerings');
            }
            
            const data = await response.json();
            setOfferings(data);
            setFilteredOfferings(data);
        } catch (error) {
            console.error('Error fetching offerings:', error);
            setError('Failed to fetch offerings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (status) => {
        setSelectedStatus(status);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getServiceTagColor = (serviceType) => {
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
        return colors[serviceType] || "#607D8B";
    };

    const renderLoadingState = () => (
        <div className="loading-container">
            <LoadingSpinner />
        </div>
    );

    const renderErrorState = () => (
        <div className="error-container">
            <strong className="error-title">Error!</strong>
            <span> {error}</span>
        </div>
    );

    const renderEmptyState = () => (
        <div className="empty-container">
            <div className="empty-icon">
                <FileText size={32} color="#9ca3af" />
            </div>
            <h3 className="empty-title">No Services Found</h3>
            <p className="empty-message">There are no services with status: {selectedStatus}</p>
        </div>
    );

    const renderServiceCard = (offering) => (
        <div key={offering._id} className="service-card">
            <div className="service-content">
                <div className="service-header">
                    <h3 className="service-title">{offering.title}</h3>
                    <span className={`status-badge ${getStatusColor(offering.status)}`}>
                        {offering.status.charAt(0).toUpperCase() + offering.status.slice(1)}
                    </span>
                </div>
                
                <p className="service-description">{offering.description}</p>
                
                <div className="service-details">
                    <span className="service-detail">
                        <MapPin size={16} />
                        {offering.location}
                    </span>
                    <span className="service-detail">
                        <DollarSign size={16} />
                        {offering.price}
                    </span>
                </div>

                <div className="service-footer">
                    <span 
                        className="service-type"
                        style={{ backgroundColor: getServiceTagColor(offering.serviceType) + '20', color: getServiceTagColor(offering.serviceType) }}
                    >
                        {offering.serviceType}
                    </span>
                </div>
                
                <div className="card-actions">
                    <button
                        onClick={() => navigate(`/OfferDetails/${offering._id}`)}
                        className="action-button details-button"
                    >
                        <FileText size={16} />
                        View Details
                    </button>
                    <button
                        onClick={() => navigate(`/ServiceBookingDetails/${offering._id}`)}
                        className="action-button requests-button"
                    >
                        <Users size={16} />
                        View Requests
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="my-services-container">
            <div className="my-services-header">
                <h1 className="my-services-title">My Services</h1>
                
                <div className="filter-container">
                    <div className="status-buttons">
                        {['pending', 'accepted', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`status-button ${selectedStatus === status ? 'active' : 'inactive'}`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <Search size={20} className="search-icon" />
                    </div>
                </div>
            </div>

            {loading ? (
                renderLoadingState()
            ) : error ? (
                renderErrorState()
            ) : filteredOfferings.length === 0 ? (
                renderEmptyState()
            ) : (
                <div className="services-grid">
                    {filteredOfferings.map(renderServiceCard)}
                </div>
            )}
        </div>
    );
};

export default MyServices;