import axios from 'axios';

// This is the URL of your backend server
const API_URL = 'http://localhost:5000/api/blogs';

/**
 * Creates a new blog post.
 * @param {FormData} formData - The form data (text and file)
 * @param {string} token - The user's Cognito auth token
 */
const createBlog = (formData, token) => {
  return axios.post(API_URL, formData, {
    headers: {
      // --- REMOVED THIS LINE ---
      'Content-Type': 'multipart/form-data', 
      // (Axios will now set this automatically with the correct boundary)

      // This header sends your user's token for verification
      'Authorization': `Bearer ${token}` 
    }
  });
};

// You can add other functions here later (getAllBlogs, etc.)
const blogService = {
  createBlog,
};

export default blogService;