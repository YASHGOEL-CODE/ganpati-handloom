export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://via.placeholder.com/400?text=No+Image';
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Static files are served at /uploads (NOT /api/uploads)
  // So use base URL without /api
  const BASE_URL = 'http://localhost:5000';
  return `${BASE_URL}${imagePath}`;
};