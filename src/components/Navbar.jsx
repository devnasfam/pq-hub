import React, { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import openbook from '../assets/openbook.png'
import { faBars, faContactBook, faContactCard, faFeather, faHandsBound, faHome, faHomeAlt, faHouseChimneyWindow, faInfo, faInfoCircle, faLaptop, faMoon, faPeopleCarry, faSignInAlt, faSun } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import fresh from '../assets/user.png'
import { MyAppContext } from '../AppContext/MyContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebaseService'
import { faFedora } from '@fortawesome/free-brands-svg-icons'

const Navbar = () => {
  const [isOpen, setisopen] = useState(false)
  const { user, theme, setTheme } = useContext(MyAppContext);
  const [userData, setUserData] = useState(null)

  const HandleClick = () => {
    setisopen((prev) => !prev);
  }
  const scale = isOpen ? "1" : "0";
  const closeMenu = () => {
    setisopen(false)
  }
  useEffect(() => {
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
  return (
    <div>
      <nav
        className='w-full h-auto p-3 bg-slate-50 dark:bg-[rgba(0,0,0,.65)] backdrop-blur-md flex flex-row items-center justify-between fixed top-0 right-0 shadow-sm z-50'>
        <div className='flex items-center justify-center cursor-pointer group'>
          <img src={openbook} alt="Logo" className='w-[40px] h-[40px] cursor-pointer transform duration-200 group-hover:scale-125 group-hover:rotate-[360deg]' />
          <div className=' w-auto flex items-center justify-center flex-col'>
            <h2 className='text-xl text-slate-800 dark:text-white ml-3 font-semibold'>PQ Hub</h2>
            <div className='w-0 rounded-lg duration-200 group-hover:w-full ml-3 h-[3.5px] bg-blue-400'></div>
          </div>
        </div>
        <div>
          {/* Desktop */}
          <ul className='text-slate-700 dark:text-white list-none md:flex items-center justify-around space-x-1.5 font-medium hidden select-none'>
            <a href='#feature' className=' w-auto flex items-center justify-center flex-col group hover:bg-slate-700 hover:text-white dark:hover:bg-slate-700 rounded-md rounded-b-none'>
              <div ><li className='cursor-pointer px-3 py-1 transition-all ease-in-out duration-300 group'><FontAwesomeIcon icon={faFedora} className='px-1.5 pl-0 transform duration-200 group-hover:scale-100 group-hover:rotate-[360deg]' />Features</li></div>
              <div className='w-0 rounded-lg duration-200 group-hover:w-full h-[3.5px] bg-blue-400'></div>
            </a>
            <a href='#about' className=' w-auto flex items-center justify-center flex-col group hover:bg-slate-700 hover:text-white dark:hover:bg-slate-700 rounded-md rounded-b-none'>
              <div><li className='cursor-pointer px-3 py-1 transition-all ease-in-out duration-300 group'><FontAwesomeIcon icon={faPeopleCarry} className='px-1.5 pl-0 transform duration-200 group-hover:scale-100 group-hover:rotate-[360deg]' />About</li></div>
              <div className='w-0 rounded-lg duration-200 group-hover:w-full h-[3.5px] bg-blue-400'></div>
            </a>
            <a href='#contact' className=' w-auto flex items-center justify-center flex-col group hover:bg-slate-700 hover:text-white dark:hover:bg-slate-700 rounded-md rounded-b-none'>
              <div><li className='cursor-pointer px-3 py-1 transition-all ease-in-out duration-300 group'><FontAwesomeIcon icon={faContactCard} className='px-1.5 pl-0 transform duration-200 group-hover:scale-100 group-hover:rotate-[360deg]' />Contact</li></div>
              <div className='w-0 rounded-lg duration-200 group-hover:w-full h-[3.5px] bg-blue-400'></div>
            </a>
            <div className='hidden md:flex w-auto md:mr-[200px] shadow border dark:border-slate-600 text-slate-700 dark:text-slate-200 dark:bg-slate-950 rounded-xl px-1 items-center justify-center'>
              <FontAwesomeIcon onClick={() => setTheme('light')} className={` ${theme === "light" && 'text-slate-100 bg-slate-700 p-[7px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faSun} />
              <FontAwesomeIcon onClick={() => setTheme('dark')} className={`${theme === "dark" && 'text-slate-700 bg-slate-200 p-[7px] px-[9px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faMoon} />
              <FontAwesomeIcon onClick={() => setTheme('system')} className={`${theme === "system" && 'text-slate-100 bg-slate-700 p-[7px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faLaptop} />
            </div>
            {!user ?
              <Link to='/login'>
                <li className='cursor-pointer hover:bg-blue-500 dark:hover:bg-blue-500 px-3 transition-all ease-in-out duration-300 p-2 bg-blue-600 text-white rounded-xl py-[5px] flex items-center justify-between hover:scale-95 group'>
                  <div className=' group-hover:text-blue-500 w-full flex items-center justify-center'>
                    <FontAwesomeIcon icon={faSignInAlt} className='px-1 pl-0 duration-150 group-hover:scale-110 group-hover:mr-0' />
                    <p>Log in</p>
                  </div>
                  <div className=' -z-10 transform scale-0 top-full left-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:top-1/2 group-hover:scale-100 rounded-xl duration-300 w-full bg-slate-100 h-full absolute'></div>
                </li>
              </Link>
              : <Link to='/feed'>
                <img src={userData && userData.profilePicture || fresh} className='w-[37px] h-[37px] shadow border border-slate-300 dark:border-slate-300 rounded-full shrink-0 m-1 object-cover'></img>
              </Link>}
          </ul>
          {/* Mobile */}
          <div onClick={HandleClick} className=' space-y-[5px] cursor-pointer md:hidden w-auto h-auto overflow-hidden'>
            <div className={` cursor-pointer w-6 h-[2.235px] rounded-md dark:bg-slate-100 bg-slate-900 transform duration-200 ${isOpen ? ' rotate-45 translate-y-[7px]' : ''}`}></div>
            <div className={` cursor-pointer w-6 h-[2px] rounded-md dark:bg-slate-100 bg-slate-900 transform duration-300 ${isOpen ? ' translate-x-full' : ''}`}></div>
            <div className={` cursor-pointer w-6 h-[2px] rounded-md dark:bg-slate-100 bg-slate-900 transform duration-200 ${isOpen ? ' -rotate-45 -translate-y-[7px]' : ''}`}></div>
          </div>
          <ul
            style={{ transform: `scale(${scale})` }}
            id='menuMobile'
            onClick={closeMenu}
            className="bg-sky-50 text-slate-800 dark:text-white dark:bg-[rgba(0,0,0,.7)] p-2 list-none w-auto min-h-auto fixed top-[65px] right-0 flex flex-col items-center justify-start space-y-3 font-medium rounded-md font-poppins transition-all ease-in-out duration-200 shadow-2xl mt-2 select-none md:hidden">
            <a href="#feature"><li className='cursor-pointer active:text-slate-200 active:bg-slate-500 w-full py-1 px-10 rounded-md transition-all ease-in-out duration-300'><FontAwesomeIcon icon={faFedora} className='px-1.5' />Features</li></a>
            <a href="#about"><li className='cursor-pointer active:text-slate-200 active:bg-slate-500 w-full py-1 px-10 rounded-md transition-all ease-in-out duration-300'><FontAwesomeIcon icon={faPeopleCarry} className='px-1.5' />About</li></a>

            <a href="#contact"><li className='cursor-pointer active:text-slate-200 active:bg-slate-500 w-full py-1 px-10 rounded-md transition-all ease-in-out duration-300'><FontAwesomeIcon icon={faContactCard} className='px-1.5' />Contact</li></a>
            <div className='flex md:hidden w-auto md:mr-[200px] border border-slate-300 dark:border-slate-700 bg-blue-200 text-slate-700 dark:text-slate-200 dark:bg-slate-800 rounded-xl px-2 items-center justify-center'>
              <FontAwesomeIcon onClick={() => setTheme('light')} className={` ${theme === "light" && 'text-slate-100 bg-slate-700 p-[7px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faSun} />
              <FontAwesomeIcon onClick={() => setTheme('dark')} className={`${theme === "dark" && 'text-slate-700 bg-slate-200 p-[7px] px-[9px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faMoon} />
              <FontAwesomeIcon onClick={() => setTheme('system')} className={`${theme === "system" && 'text-slate-100 bg-slate-700 p-[7px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faLaptop} />
            </div>
            {!user ?
              <Link to='/login'><li className='cursor-pointer active:text-slate-200 shrink-0 active:bg-blue-400 w-full px-10 p-2 bg-blue-600 text-white rounded-xl py-1.5 text-center transition-all ease-in-out duration-300'><FontAwesomeIcon icon={faSignInAlt} className='px-2' />Log in</li></Link>
              : <Link to='/feed'>
                <img src={userData && userData.profilePicture || fresh} className='w-[35px] h-[35px] rounded-full border-[1px] border-slate-400 shrink-0 m-1 object-cover'></img>
              </Link>}
          </ul>
        </div>
      </nav>
    </div>
  )
}


export default Navbar
