import React, { useState, useEffect } from 'react';

const CreateOffering = () => {
    // Service type options
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

    // State for the form
    const [newOffering, setNewOffering] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        serviceType: '',
        providerId: '' // This will be set from auth context in a real app
    });

    // Error and success messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewOffering(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // In a real application, you would get the providerId from authentication context
            // For this example, we'll use a placeholder value
            const offeringData = {
                ...newOffering,
                providerId: localStorage.getItem('userId') || '64a5b7e32b3d4e001234abcd' // Example placeholder
            };

            // Call the API to create the offering
            const response = await fetch('http://localhost:5003/api/offering/add-offer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(offeringData)
            });
            
            if(response.ok){
                setSuccess('Offering created successfully!');
            
            // Reset the form after successful submission
            setNewOffering({
                title: '',
                description: '',
                price: '',
                location: '',
                serviceType: '',
                providerId: ''
            });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create offering. Please try again.');
            console.error('Error creating offering:', err);
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const styles = {
        pageContainer: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px'
        },
        formContainer: {
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            padding: '30px',
            marginTop: '20px'
        },
        formTitle: {
            fontSize: '24px',
            marginBottom: '20px',
            color: '#333',
            textAlign: 'center'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
        },
        formRow: {
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            width: '100%'
        },
        label: {
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#555'
        },
        input: {
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px'
        },
        textarea: {
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px',
            minHeight: '150px',
            resize: 'vertical'
        },
        select: {
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px',
            backgroundColor: '#fff'
        },
        submitButton: {
            padding: '14px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: '0.3s',
            marginTop: '10px'
        },
        error: {
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
        },
        success: {
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
        },
        loading: {
            textAlign: 'center',
            padding: '10px'
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.formContainer}>
                <h2 style={styles.formTitle}>Post a New Service Offering</h2>
                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Title</label>
                        <input 
                            type="text" 
                            name="title" 
                            value={newOffering.title} 
                            onChange={handleChange} 
                            placeholder="Enter a clear title for your service offering" 
                            style={styles.input} 
                            required 
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea 
                            name="description" 
                            value={newOffering.description} 
                            onChange={handleChange} 
                            placeholder="Describe the service you're offering in detail" 
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
                                value={newOffering.price} 
                                onChange={handleChange} 
                                placeholder="Your service price" 
                                style={styles.input} 
                                required 
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Location</label>
                            <input 
                                type="text" 
                                name="location" 
                                value={newOffering.location} 
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
                            value={newOffering.serviceType} 
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
                    
                    <button 
                        type="submit" 
                        style={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Posting...' : 'Post Offering'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateOffering;