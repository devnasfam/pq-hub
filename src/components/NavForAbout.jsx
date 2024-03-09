import React, { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import openbook from '../assets/openbook.png'
import { faContactCard, faFeather, faHandsBound, faHome, faHomeAlt, faHouseChimneyWindow, faInfo, faInfoCircle, faLaptop, faMoon, faPeopleCarry, faSignInAlt, faSun } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import fresh from '../assets/user.png'
import { MyAppContext } from '../AppContext/MyContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebaseService'
import { Tooltip } from '@mui/material'

const NavForAbout = () => {
  const [isOpen, setisopen] = useState(false)
  const { user, theme, setTheme } = useContext(MyAppContext);
  const [userData, setUserData] = useState(null)
  const [isScroll, setIsScroll] = useState(false)

  const HandleClick = () => {
    setisopen((prev) => !prev);
  }
  const scale = isOpen ? "1" : "0";
  const closeMenu = () => {
    setisopen(false)
  }
  useEffect(() => {
    if(!user || !user.uid) return;
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, 'Users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data())
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchUserData()
  }, [user])

  useEffect(() => {
    const detectScroll = () => {
      if (window.scrollY > 20) {
        setIsScroll(true);
      } else {
        setIsScroll(false)
      }
    }
    window.addEventListener('scroll', detectScroll);
    return () => window.removeEventListener('scroll', detectScroll)
  }, [isScroll])

  return (
    <div>
      <nav
        className={`w-full h-auto p-3 ${isScroll ? ' bg-slate-50 dark:bg-[rgba(2,6,23,.75)]' : ''} border-b-[0.2px] dark:border-b-slate-800 backdrop-blur-md flex flex-row items-center justify-between fixed top-0 right-0 shadow-sm z-50`}>
        <Link to='/' className='flex items-center justify-center cursor-pointer group'>
          <img src={openbook} alt="Logo" className='w-[40px] h-[40px] cursor-pointer transform duration-200 group-hover:scale-125 group-hover:rotate-[360deg]' />
          <div className=' w-auto flex items-center justify-center flex-col'>
            <h2 className='text-xl text-slate-800 dark:text-white ml-3 font-semibold mt-1.5'>PQ Hub</h2>
            <div className='w-0 rounded-lg duration-200 group-hover:w-full ml-3 h-[3px] bg-blue-400'></div>
          </div>
        </Link>
        <div>
          {/* Desktop */}
          <ul className='text-slate-700 dark:text-white list-none md:flex items-center justify-around space-x-1.5 font-medium hidden select-none'>
            <Link to='/' className=' w-auto flex items-center justify-center flex-col group hover:bg-slate-700 hover:text-white dark:hover:bg-slate-700 rounded-md rounded-b-none'>
              <div ><li className='cursor-pointer px-3 py-1 transition-all ease-in-out duration-300 group'><FontAwesomeIcon icon={faHome} className='px-1.5 pl-0 transform duration-200 group-hover:text-cyan-500 group-hover:scale-100 group-hover:rotate-[360deg]' />Home</li></div>
              <div className='w-0 rounded-lg duration-200 group-hover:w-full h-[3.5px] bg-blue-400'></div>
            </Link>
            <a href='#contact' className=' w-auto flex items-center justify-center flex-col group hover:bg-slate-700 hover:text-white dark:hover:bg-slate-700 rounded-md rounded-b-none'>
              <div><li className='cursor-pointer px-3 py-1 transition-all ease-in-out duration-300 group'><FontAwesomeIcon icon={faContactCard} className='px-1.5 pl-0 transform duration-200 group-hover:text-pink-500 group-hover:scale-100 group-hover:rotate-[360deg]' />Contact</li></div>
              <div className='w-0 rounded-lg duration-200 group-hover:w-full h-[3.5px] bg-blue-400'></div>
            </a>
            <div className='hidden py-[3.2px] md:flex w-auto md:mr-[200px] border dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full px-1 items-center justify-center'>
              <Tooltip title='Light mode' arrow enterDelay={400}>
                <span onClick={() => setTheme('light')} className={` ${theme === "light" && 'text-slate-100 bg-slate-700'} material-symbols-outlined rounded-full text-lg cursor-pointer p-1.5 py-0`}>wb_sunny</span>
              </Tooltip>
              <Tooltip title='Dark mode' arrow enterDelay={400}>
                <span onClick={() => setTheme('dark')} className={`${theme === "dark" && 'text-slate-700 bg-slate-200'} material-symbols-outlined rounded-full text-lg cursor-pointer p-1.5 py-0`} >brightness_3</span>
              </Tooltip>
              <Tooltip title='Sytem default' arrow enterDelay={400}>
                <span onClick={() => setTheme('system')} className={`${theme === "system" && 'dark:text-slate-700 text-slate-100 dark:bg-slate-200 bg-slate-700'} material-symbols-outlined rounded-full text-lg cursor-pointer p-1.5 py-0`}>desktop_windows</span>
              </Tooltip>
            </div>
            {!user ?
              <Link to='/login'>
                <li className='cursor-pointer ring-2 ring-blue-400 hover:bg-blue-500 dark:hover:bg-blue-500 px-3 transition-all ease-in-out duration-300 p-1 bg-blue-500 text-white rounded-xl py-[2.7px] flex items-center justify-between hover:scale-[0.98] group'>
                  <div className=' group-hover:text-blue-500 w-full flex items-center justify-center'>
                    <FontAwesomeIcon icon={faSignInAlt} className='px-1 pl-0 duration-150 group-hover:scale-110 group-hover:mr-0' />
                    <p>Log in</p>
                  </div>
                  <div className=' -z-10 transform scale-0 top-full left-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:top-1/2 group-hover:scale-100 rounded-xl duration-300 w-full bg-slate-100 h-full absolute'></div>
                </li>
              </Link>
              : <Link to='/feed'>
                <Tooltip title='Go to feed' arrow enterDelay={300}>
                  <img src={userData && userData.profilePicture || fresh} className='w-[37px] h-[37px] shadow border border-slate-300 dark:border-slate-300 rounded-full shrink-0 m-1 object-cover'></img>
                </Tooltip>
              </Link>}
          </ul>
          {/* Mobile */}
          <Tooltip title={`${isOpen ? 'Close' : 'Menu'}`} arrow enterDelay={300}>
            <div onClick={HandleClick} className=' space-y-[5px] cursor-pointer md:hidden w-auto h-auto overflow-hidden'>
              <div className={` cursor-pointer w-6 h-[2.235px] rounded-md dark:bg-slate-100 bg-slate-900 transform duration-200 ${isOpen ? ' rotate-45 translate-y-[7px]' : ''}`}></div>
              <div className={` cursor-pointer w-6 h-[2px] rounded-md dark:bg-slate-100 bg-slate-900 transform duration-300 ${isOpen ? ' translate-x-full' : ''}`}></div>
              <div className={` cursor-pointer w-6 h-[2px] rounded-md dark:bg-slate-100 bg-slate-900 transform duration-200 ${isOpen ? ' -rotate-45 -translate-y-[7px]' : ''}`}></div>
            </div>
          </Tooltip>
          <ul
            style={{ transform: `scale(${scale})` }}
            id='menuMobile'
            onClick={closeMenu}
            className="border dark:border-slate-900 bg-sky-50 text-slate-800 dark:text-white dark:bg-[rgba(2,6,23,.85)] p-2 list-none w-auto min-h-auto fixed top-[65px] right-2 flex flex-col items-center justify-start space-y-3 font-medium rounded-md font-poppins transition-all ease-in-out duration-200 shadow-2xl mt-2 select-none md:hidden">
            <Link to="/"><li className='cursor-pointer active:text-slate-200 active:bg-slate-500 w-full py-1 px-10 rounded-md transition-all ease-in-out duration-300'><FontAwesomeIcon icon={faHome} className='px-1.5' />Home</li></Link>

            <a href="#contact"><li className='cursor-pointer active:text-slate-200 active:bg-slate-500 w-full py-1 px-10 rounded-md transition-all ease-in-out duration-300'><FontAwesomeIcon icon={faContactCard} className='px-1.5' />Contact</li></a>
            <div className='flex py-[3.2px] md:hidden w-auto md:mr-[200px] bg-sky-200 dark:bg-transparent shadow border dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full px-2 items-center justify-center'>
              <Tooltip title='Light mode' arrow enterDelay={400}>
                <span onClick={() => setTheme('light')} className={` ${theme === "light" && 'text-slate-100 bg-slate-700'} material-symbols-outlined rounded-full text-lg cursor-pointer p-1.5 py-0`}>wb_sunny</span>
              </Tooltip>
              <Tooltip title='Dark mode' arrow enterDelay={400}>
                <span onClick={() => setTheme('dark')} className={`${theme === "dark" && 'text-slate-700 bg-slate-200'} material-symbols-outlined rounded-full text-lg cursor-pointer p-1.5 py-0`} >brightness_3</span>
              </Tooltip>
              <Tooltip title='Sytem default' arrow enterDelay={400}>
                <span onClick={() => setTheme('system')} className={`${theme === "system" && 'dark:text-slate-700 text-slate-100 dark:bg-slate-200 bg-slate-700'} material-symbols-outlined rounded-full text-lg cursor-pointer p-1.5 py-0`}>desktop_windows</span>
              </Tooltip>
            </div>
            {!user ?
              <Link to='/login'><li className='cursor-pointer active:text-slate-200 shrink-0 active:bg-blue-400 w-full px-10 p-2 bg-blue-600 text-white rounded-xl py-1.5 text-center transition-all ease-in-out duration-300'><FontAwesomeIcon icon={faSignInAlt} className='px-2' />Log in</li></Link>
              : <Link to='/feed'>
                <Tooltip title='Go to feed' arrow enterDelay={300}>
                  <img src={userData && userData.profilePicture || fresh} className='w-[37px] h-[37px] shadow border border-slate-300 dark:border-slate-300 rounded-full shrink-0 m-1 object-cover'></img>
                </Tooltip>
              </Link>}
          </ul>
        </div>
      </nav>
    </div>
  )
}


export default NavForAbout
