import React, { useState } from 'react';
import Rating from './Rating';

const ReviewForm = ({ onSubmit, onCancel, initialValues = {} }) => {
  const [rating, setRating] = useState(initialValues.rating || 0);
  const [comment, setComment] = useState(initialValues.comment || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (comment.trim() === '') {
      setError('Please enter a comment');
      return;
    }
    
    onSubmit({ rating, comment });
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Write a Review</h3>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={styles.ratingContainer}>
          <label style={styles.label}>Your Rating</label>
          <Rating 
            initialRating={rating} 
            onRatingChange={setRating} 
            size="large"
          />
        </div>
        
        <div style={styles.commentContainer}>
          <label style={styles.label}>Your Review</label>
          <textarea
            style={styles.textarea}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this service..."
            rows={4}
          />
        </div>
        
        <div style={styles.buttonContainer}>
          <button 
            type="button" 
            style={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            style={styles.submitButton}
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
  },
  ratingContainer: {
    marginBottom: '20px',
  },
  commentContainer: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '8px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    resize: 'vertical',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelButton: {
    padding: '10px 16px',
    backgroundColor: '#f5f5f5',
    border: 'none',
    borderRadius: '4px',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  submitButton: {
    padding: '10px 16px',
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px',
  },
};

export default ReviewForm; 