const API_URL = 'http://localhost:5000/api';

export const blogService = {
    createBlog: async (blogData) => {
        try {
            const response = await fetch(`${API_URL}/blogs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(blogData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating blog:', error);
            throw error;
        }
    }
};