import React from 'react'

const Navbar = () => {
  return (
    <nav className='font-sans'>
      <div className='flex justify-between px-15 py-5'>
        <a href="/"><img src="/logo.svg" alt="" /></a>
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
    </nav>
  )
}

export default Navbar;
