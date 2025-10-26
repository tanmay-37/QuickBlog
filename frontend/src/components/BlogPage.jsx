import {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import parse from "html-react-parser";


const BlogPage =  () => {
    const {id} = useParams();
    const [blog, setBlog] = useState(null);
    const [translatedContent, setTranslatedContent] = useState(null); // holds Hindi text
    const [isHindi, setIsHindi] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userSub, setUserSub] = useState('');
    const navigate = useNavigate();

    // fetch blog by id
    useEffect(() => {
        if (!id) return;
        const fetchBlog = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/blogs/${id}`);
                setBlog(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        // get user id from localStorage token (Cognito)
        const token = localStorage.getItem('idToken');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserSub(payload.sub);
        }

        fetchBlog();
    }, [id]);

    if(!blog) return <p>Loading...</p>;

    const cleanHtml = (html) => html.replace(/ class="[^"]*"/g, ""); // removes all classes
    const parsedContent = parse(cleanHtml(isHindi && translatedContent ? translatedContent : blog.content));


      const handleTranslate = async () => {
        try {
        setLoading(true);
        if (!isHindi) {
            // If Hindi version not loaded yet, translate and cache it
            if (!translatedContent) {
            const res = await axios.post('http://localhost:5000/api/translate', {
                text: blog.content,
                targetLanguage: 'hi',
            });
            setTranslatedContent(res.data.translatedText);
            }
            setIsHindi(true);
        } else {
            // Show original English
            setIsHindi(false);
        }
        } catch (error) {
            console.error("Translation failed", error);
            alert("Translation failed! Check server logs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 lg:px-0 px-4">
            <img src={blog.coverImage} alt={blog.title} className="w-full rounded-xl" />
            <div className='flex md:flex-row flex-col md:justify-between md:items-center'>
                <div>
                    <h1 className="text-3xl font-bold mt-6">{blog.title}</h1>
                    {Array.isArray(blog.tags) && blog.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4 mt-2">
                        {blog.tags.map((t, index) => (
                        <span
                            key={index}
                            className="text-white text-sm bg-brand-purple px-2 py-1 rounded-full"
                        >
                            #{t}
                        </span>
                        ))}
                    </div>
                    ) : (
                        <p className="text-gray-500 mb-4">No tags attached</p>
                    )}
                </div>

                {/* Translate Button */}
                <button
                    onClick={handleTranslate}
                    disabled={loading}
                    className="bg-brand-purple text-white px-4 py-2 rounded-lg text-sm md:w-54 mb-6 hover:bg-purple-700 transition-all"
                >
                    {loading
                    ? "Translating..."
                    : isHindi
                    ? "Show English"
                    : "Translate to Hindi"}
                </button>
            </div>

            <div
            className="prose prose-lg">
                {parsedContent}
            </div>

            {blog.authorId === userSub && (
                <button
                onClick={() => navigate(`/blogs/edit/${blog._id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Edit Blog
                </button>
            )}

        </div>
    );
};

export default BlogPage;