import { useState } from "react";

const Navbar = () => {

    const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className='font-sans'>

      {/* for large devices */}
      <div className='flex justify-between items-center md:px-15 px-5 py-5'>
        <a href="/"><img src="/logo.svg" alt="" /></a>

        {/* desktop button */}
        <div className="hidden md:block">
            <a href="/admin">
                <button 
                className='bg-brand-purple text-white flex items-center justify-center gap-1 text-sm font-medium px-6 py-2 rounded-4xl cursor-pointer hover:transform hover:-translate-y-0.5 shadow-lg'
                >
                    Admin Login
                    <img 
                    src="/lock.svg" 
                    className='h-5 pb-1'
                    alt="" 
                    /> 
                </button>
            </a>
        </div>

        {/* hamburgir icon */}
        <div className="md:hidden">
            <a href="/admin">
                <button className="bg-brand-purple py-2 px-4 rounded-2xl">
                    <img 
                        src="/lock.svg" 
                        className='h-5 pb-1'
                        alt="" 
                    /> 
                </button>
            </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;
