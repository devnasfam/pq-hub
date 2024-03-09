import React from 'react'

const TopNav = ({ children }) => {
  return (
    <nav className='fixed z-50 top-0 left-0 md:left-[166px] p-1 px-4 py-4 w-full h-auto dark:text-slate-100 bg-blue-500 text-white dark:bg-[rgba(30,41,59,.85)] backdrop-blur-md shadow-[0_4px_3px_rgba(0,0,0,.05)] flex items-center justify-between select-none'>
      {children}
    </nav>
  )
}

export default TopNav
