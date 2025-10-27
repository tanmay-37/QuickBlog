import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import parse from "html-react-parser";
import { getCurrentUserSession } from "../cognitoAuth.js";
import { toast } from "react-toastify";

const BlogPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [isHindi, setIsHindi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [podcastUrl, setPodcastUrl] = useState(null);
  const [podcastLoading, setPodcastLoading] = useState(false);
  const [userSub, setUserSub] = useState('');
  const navigate = useNavigate();

  // fetch blog by id
  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(res.data);

        // if blog already has a podcast URL saved (from Mongo)
        if (res.data.podcastUrl) {
          setPodcastUrl(res.data.podcastUrl);
        }
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

  if (!blog) return <p>Loading...</p>;

  const cleanHtml = (html) => html.replace(/ class="[^"]*"/g, ""); // removes all classes
  const parsedContent = parse(cleanHtml(isHindi && translatedContent ? translatedContent : blog.content));

  // --- Translate to Hindi / English ---
  const handleTranslate = async () => {
    const user = await getCurrentUserSession();
    if (!user) {
        toast.info("Login to use this feature");
        console.log("Login to use this feature");
        return;
    }

    try {
      setLoading(true);
      if (!isHindi) {
        // If Hindi version not loaded yet, translate and cache it
        if (!translatedContent) {
          const res = await axios.post('http://localhost:5000/api/translate', {
            text: blog.content,
            targetLanguage: 'hi',
          });
          toast.success("Translation successful!");
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

  // --- Generate Podcast via Polly ---
  const handleGeneratePodcast = async () => {
    const user = await getCurrentUserSession();
    if (!user) {
        toast.info("Login to use this feature");
        console.log("Login to use this feature");
        
        return;
    }

    try {
      setPodcastLoading(true);
      const res = await axios.post(`http://localhost:5000/api/podcast/${blog._id}/podcast`);
      toast.success("Podcast generated successfully!");
      setPodcastUrl(res.data.podcastUrl);
    } catch (error) {
      console.error("Podcast generation failed:", error);
      alert("Failed to generate podcast! Check server logs.");
    } finally {
      setPodcastLoading(false);
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

        {/* Translate + Podcast Buttons */}
        <div className="flex flex-col gap-2 mt-4 md:mt-0">
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="bg-brand-purple text-white px-4 py-2 w-44 rounded-lg text-sm hover:bg-purple-700 transition-all"
          >
            {loading
              ? "Translating..."
              : isHindi
              ? "Show English"
              : "Translate to Hindi"}
          </button>

          {podcastUrl ? (<></>) : (
            <button
                onClick={handleGeneratePodcast}
                disabled={podcastLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-all"
            >
                {podcastLoading ? "Generating..." : "🎧 Generate Podcast"}
            </button>
          )}
        </div>
      </div>

      {/* Podcast Audio Player */}
        {podcastUrl && (
        <div className="mt-8 bg-gray-100 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">🎙 Listen to this blog</h2>

            {userSub ? (
            <audio
                controls
                controlsList="nodownload"
                src={podcastUrl}
                className="w-full rounded-lg"
            >
                Your browser does not support the audio element.
            </audio>
            ) : (
            <div className="bg-white p-4 rounded-md text-gray-600 text-center border border-gray-200">
                <p>🔒 Please log in to listen to the podcast.</p>
            </div>
            )}
        </div>
        )}


      <div className="prose prose-lg mt-6">{parsedContent}</div>


      {/* Edit Button (Visible to author only) */}
      {blog.authorId === userSub && (
        <button
          onClick={() => navigate(`/blogs/edit/${blog._id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-6"
        >
          Edit Blog
        </button>
      )}
    </div>
  );
};

export default BlogPage;
