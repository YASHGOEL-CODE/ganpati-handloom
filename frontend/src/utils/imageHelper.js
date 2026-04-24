// export const getImageUrl = (imagePath) => {
//   if (!imagePath) {
//     return 'https://via.placeholder.com/400?text=No+Image';
//   }
  
//   if (imagePath.startsWith('http')) {
//     return imagePath;
//   }
  
//   // Static files are served at /uploads (NOT /api/uploads)
//   // So use base URL without /api
//   const BASE_URL = 'http://localhost:5000';
//   return `${BASE_URL}${imagePath}`;
// };



export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://via.placeholder.com/400?text=No+Image';
  }

  // If already full URL, return it
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Get base URL from env and remove /api if present
  const baseUrl = (process.env.REACT_APP_API_URL || '')
    .replace('/api', '');

  return `${baseUrl}${imagePath}`;
};