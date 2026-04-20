import React from 'react';
import { FiStar, FiCheck } from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';

const ReviewList = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">
          No reviews yet. Be the first to review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {review.user?.fullName || 'Anonymous'}
                </h4>
                {review.isVerifiedPurchase && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                    <FiCheck className="w-3 h-3" />
                    Verified Purchase
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(review.createdAt)}
              </p>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <FiStar
                  key={index}
                  className={`w-4 h-4 ${
                    index < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
            {review.title}
          </h5>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {review.comment}
          </p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;