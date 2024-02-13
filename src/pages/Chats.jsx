import React, { useRef, useState } from 'react'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import Navigations from '../components/Navigations'
import { Link } from 'react-router-dom'

const Chats = () => {
  const [isShowModal, setisShowModal] = useState(false)
  const [searchValue, setSearchvalue] = useState('')

  const inputRef = useRef(null)

  const handleShowModal = () => {
    setisShowModal(true)
    setTimeout(() => {
      inputRef.current.focus()
    }, 100);
  }
  const closeModal = () => {
    setisShowModal(false)
    setSearchvalue('')
  }
  return (
    <div className=' w-full h-auto pt-[74px] pb-[75px]'>
      <TopNav name={
        <>
          <div className=' w-full flex items-center justify-start'>
            <h2 className='text-lgtext-white ml-3 flex items-center justify-center font-medium truncate'>
              <FontAwesomeIcon className=' p-2 text-lg' icon={faComment} />
              PQ Hub Chat Forum
            </h2>
          </div>
          <div className=' md:mr-48'>
            <div onClick={handleShowModal} className={` ${isShowModal ? '' : ' max-[565px]:w-10 max-[565px]:h-10 max-[565px]:mr-3'} cursor-pointer w-full flex items-center bg-sky-50 text-slate-900 dark:text-slate-100 dark:bg-slate-900 p-1 justify-center gap-x-2 rounded-full px-5 -ml-2`}>
              <input ref={inputRef} value={searchValue} onChange={(e) => setSearchvalue(e.target.value)} type="text" placeholder='Search Friends...' className={`${isShowModal ? 'max-[565px]:block cursor-default' : ' max-[565px]:hidden cursor-pointer'} text-[14.3px] outline-none w-[130px] lg:w-[190px] placeholder-slate-800 dark:placeholder-slate-200 bg-transparent px-3`} />
              <FontAwesomeIcon className={`${isShowModal && searchValue.trim() !== '' && 'text-white bg-blue-500'} duration-300 text-slate-900 dark:text-slate-50 p-2 rounded-full cursor-pointer`} icon={faSearch} />
            </div>
          </div>
          <div className={`${isShowModal ? 'scale-100' : ' scale-0'} duration-200 w-[60%] sm:w-[50%] md:w-[40%] xl:w-[25%] h-48 max-h-80 absolute bg-white rounded-xl right-3 md:right-48 top-20 dark:bg-[rgba(30,41,59,.85)] backdrop-blur-md shadow-[0_4px_3px_rgba(0,0,0,.05)] border border-slate-200 dark:border-slate-700 bg-[rgba(255,255,255,.75)]`}>
            <div className=' w-full flex items-center justify-around p-2'>
              <div className=' w-full p-2 border-b-[0.01px] text-slate-800 dark:text-slate-100 text-base border-slate-200 dark:border-b-slate-500'>
                Search results:
              </div>
              <FontAwesomeIcon onClick={closeModal} className=' p-2 cursor-pointer' icon={faTimes} />
            </div>
            {/* Result Body */}
            <div className=' w-full flex items-center justify-center flex-col p-1'>
              <div className=' w-full flex items-center justify-start p-1 gap-2'>
                <div className=' w-9 h-9 bg-slate-300 rounded-full'></div>
                <div className=' flex items-center justify-center gap-2 text-slate-800 dark:text-slate-200'>
                  <div>devnasfam</div>
                  <div className=' text-xs '>(300L)</div>
                </div>
              </div>
              <div className=' w-full flex items-center justify-start p-1 gap-2'>
                <div className=' w-9 h-9 bg-slate-300 rounded-full'></div>
                <div className=' flex items-center justify-center gap-2 text-slate-800 dark:text-slate-200'>
                  <div>shinobite</div>
                  <div className=' text-xs '>(300L)</div>
                </div>
              </div>
            </div>
          </div>
        </>
      } />
      <div className='pb-[78px] w-full h-auto md:pb-0 md:pl-[240px] text-slate-50'>
        <Link to='' className=' cursor-pointer w-full border-b-[0.01px] border-slate-200 dark:border-b-slate-900 p-3 flex items-center gap-2 justify-between'>
          <div className=' flex items-center justify-center gap-2'>
            {/* profile icon */}
            <div className=' w-12 h-12 shrink-0 rounded-full bg-slate-600 p-2' />
            {/* Chat Name */}
            <div className=' p-2 flex items-start justify-center flex-col'>
              <div className=' truncate font-semibold tracking-wide text-slate-700 dark:text-slate-100'>Past Q Discussion Group</div>
              {/* Chat Message */}
              <div className=' text-sm text-slate-500 dark:text-slate-300 overflow-hidden whitespace-nowrap text-ellipsis'>Hello everyone</div>
            </div>
          </div>
          <div className=' w-full px-2 flex items-end justify-center flex-col'>
            <div className=' flex items-center justify-center flex-col gap-1'>
              <div className=' p-1.5 text-xs bg-blue-500 text-slate-100 rounded-full w-auto h-5 flex items-center justify-center'>23</div>
              <div className=' text-xs whitespace-nowrap tracking-tighter text-slate-400 p-1'>12:00 am</div>
            </div>
          </div>
        </Link>
      </div>
      <Navigations />
    </div>
  )
}

export default Chats
//08027082276