import React from 'react';
import Rating from './Rating';

const ReviewList = ({ reviews = [], averageRating = 0, totalReviews = 0 }) => {
  if (reviews.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <p style={styles.emptyText}>No reviews yet</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.summaryContainer}>
        <div style={styles.ratingSummary}>
          <div style={styles.averageRating}>
            <span style={styles.ratingNumber}>{averageRating.toFixed(1)}</span>
            <Rating 
              initialRating={averageRating} 
              readOnly={true} 
              size="medium"
              showLabel={false}
            />
          </div>
          <div style={styles.totalReviews}>
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>
      </div>

      <div style={styles.reviewsList}>
        {reviews.map((review, index) => (
          <div key={review.id || index} style={styles.reviewItem}>
            <div style={styles.reviewHeader}>
              <div style={styles.reviewerInfo}>
                <div style={styles.reviewerName}>
                  {review.userName || 'Anonymous User'}
                </div>
                <div style={styles.reviewDate}>
                  {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
              <Rating 
                initialRating={review.rating} 
                readOnly={true} 
                size="small"
                showLabel={false}
              />
            </div>
            <div style={styles.reviewComment}>
              {review.comment}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
  },
  summaryContainer: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  ratingSummary: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  averageRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  ratingNumber: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
  },
  totalReviews: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  reviewItem: {
    padding: '15px',
    borderBottom: '1px solid #eee',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  reviewerInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  reviewerName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  reviewDate: {
    fontSize: '14px',
    color: '#888',
  },
  reviewComment: {
    fontSize: '15px',
    color: '#444',
    lineHeight: '1.5',
  },
  emptyContainer: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#666',
  },
};

export default ReviewList; 