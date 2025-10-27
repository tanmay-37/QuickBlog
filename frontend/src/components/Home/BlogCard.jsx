import { useNavigate } from 'react-router-dom';

const BlogCard = ({ id, coverImage, title, subtitle, tags, showEditButton = false }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        // Navigate only if the edit button isn't the primary interaction target
        // (This click handler is now on the faces, not the button itself)
        navigate(`/blogs/${id}`);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        navigate(`/blogs/edit/${id}`);
    };

    // ✨ Conditionally apply hover effect class ✨
    const flipperClasses = `
        relative h-full w-full rounded-2xl shadow-lg transition-all duration-500 [transform-style:preserve-3d] border border-gray-100
        ${!showEditButton ? 'group-hover:[transform:rotateY(180deg)]' : ''}
    `;

    return (
        <div
            className={`group h-96 w-full [perspective:1000px] ${!showEditButton ? 'cursor-pointer' : ''}`} // Only show pointer cursor if flip is enabled
            // onClick removed from here - click handled by faces unless edit button is clicked
        >
            <div className={flipperClasses}> {/* ✨ Use conditional classes ✨ */}

                {/* --- Front Face --- */}
                <div
                    className="absolute inset-0 bg-white rounded-2xl overflow-hidden [backface-visibility:hidden] flex flex-col cursor-pointer"
                    onClick={!showEditButton ? handleCardClick : undefined} // Only allow navigation click if edit button isn't shown
                >
                    <img
                        src={coverImage}
                        alt={title}
                        className="w-full h-48 object-cover flex-shrink-0 pointer-events-none"
                    />
                    <div className="p-5 flex flex-col justify-between flex-grow">
                        <div>
                            {tags && (
                                <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 pointer-events-none">
                                    {Array.isArray(tags) ? tags[0] : tags}
                                </span>
                            )}
                            <h3 className="font-bold text-xl mb-2 text-gray-900 leading-snug line-clamp-2 pointer-events-none">
                                {title}
                            </h3>
                        </div>

                        {/* Edit Button Section */}
                        {showEditButton && (
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleEditClick} // Edit click is always handled
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors z-10 relative pointer-events-auto cursor-pointer" // Ensure cursor is pointer for button
                                >
                                    Edit Blog
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Back Face --- */}
                {/* Only make back face clickable if flip is enabled */}
                <div
                    className="absolute inset-0 rounded-2xl p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-center items-center text-center bg-purple-200/70 backdrop-blur-lg border border-purple-300/50 shadow-inner"
                    onClick={!showEditButton ? handleCardClick : undefined}
                >
                    <p className="text-base leading-relaxed line-clamp-5 px-4 text-purple-900 font-medium mb-3 pointer-events-none">
                        {subtitle || "No description available."}
                    </p>
                    <p className="text-xs text-purple-700/80 mt-auto pt-2 pointer-events-none">
                        (Click to read more)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;