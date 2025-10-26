import { Link } from 'react-router-dom';

// --- Blog Card Component ---
const BlogCard = ({ id, coverImage, title, subtitle, tags }) => (
  <Link to={`/blogs/${id}`}>
    <div className="h-96 bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border border-gray-100"> {/* Added subtle border */}
      {/* Image */}
      <img 
        src={coverImage} 
        alt={title} 
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
      />
      
      {/* Content */}
      <div className="p-5">
        {/* Tag */} 
        {tags && (
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {tags}
          </span>
        )}

        {/* Title */}
        <h3 className="font-bold text-xl mb-2 text-gray-900 leading-snug overflow-hidden"> {/* Adjusted text size and line height */}
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-base leading-relaxed overflow-hidden pb"> {/* Adjusted text size and line height */}
          {subtitle}
        </p>
      </div>
    </div>
  </Link>
);

export default BlogCard;