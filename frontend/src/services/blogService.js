import axios from 'axios';

// This is the URL of your backend server
const API_URL = 'https://quickblog-0df6.onrender.com/api/blogs';

/**
 * Creates a new blog post.
 * @param {FormData} formData - The form data (text and file)
 * @param {string} token - The user's Cognito auth token
 */
const createBlog = (formData, token) => {
  return axios.post(API_URL, formData, {
    headers: {
      // Axios automatically handles 'Content-Type' for FormData, but keeping for clarity
      'Authorization': `Bearer ${token}` 
    }
  });
};

/**
 * Updates an existing blog post.
 * @param {string} id - The ID of the blog to update
 * @param {FormData} formData - The form data (text and optional new file)
 * @param {string} token - The user's Cognito auth token
 */
const updateBlog = (id, formData, token) => {
  return axios.put(`https://quickblog-0df6.onrender.com/api/blogs/edit/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
};

// ⭐ ADDED: Function to fetch a single blog by ID (Used for editing)
const getBlogById = (id) => {
    // Calls the public route: GET /api/blogs/:id
    return axios.get(`${API_URL}/${id}`);
};

const blogService = {
  createBlog, 
  updateBlog,
  getBlogById, // ⭐ EXPORTED THE NEW FUNCTION
};

export default blogService;