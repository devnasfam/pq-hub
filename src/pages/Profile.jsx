import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faBoltLightning, faBook, faBookmark, faBrain, faComputer, faGraduationCap, faLevelUp, faLightbulb, faMessage, faMoon, faSchool, faSignOut, faSquareShareNodes, faSun, faToggleOff, faToggleOn, faUser, faUserEdit, faUserGraduate } from '@fortawesome/free-solid-svg-icons'
import bgprofile from '../assets/edu.jpg'
import fresh from '../assets/user.png'
import useCheckAuth from './customHooks/useCheckAuth'
import { MyAppContext } from '../AppContext/MyContext'
import { signOut } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/firebaseService'
import { doc, getDoc } from 'firebase/firestore'

const Profile = () => {

  const { theme, setTheme, user, setUser } = useContext(MyAppContext);
  const [userData, setUserdata] = useState([]);
  const [loading, setLoad] = useState(true)

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = 'My Profile'
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "Users", user && user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserdata(userSnap.data())
          setLoad(false)
        } else {
          setUserdata(null);
        }
      } catch (error) {

      }
    }
    fetchUserData();
  }, [document.title, user])

  useCheckAuth()

  const navigate = useNavigate()



  const HandleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  const [isShow, setShow] = useState(false);


  return (
    <div className='bg-sky-50 dark:bg-slate-950 w-full pb-[50px] md:pb-0 md:pl-[140px] pt-[65px]'>
      <TopNav name={
        <>
          <div className='flex items-center justify-center cursor-pointer'>
            <FontAwesomeIcon icon={faUserGraduate} />
            <h2 className='text-lgtext-white ml-3 font-medium'>My Profile</h2>
          </div>
        </>
      } />
      <div className=' w-full flex items-center justify-start flex-col text-slate-700 dark:text-slate-200 sm:pb-[85px] md:pb-0  md:pl-20 select-none md:mt-3'>

        <div className=' w-full md:w-[85%] lg:w-[69%] h-auto flex items-center justify-center md:justify-start flex-col md:flex-row md:rounded-xl bg-slate-900'>
          <div className=' relative z-20 w-full py-5 h-full flex items-center justify-center sm:justify-start flex-col sm:flex-row p-5 sm:rounded-md'>
            <div className='bg-blue-500 shadow-xl blur-xl shadow-purple-500 w-[120px] h-[120px] rounded-full z-0 absolute top-[45px] md:top-2 right-5' />
            <div className='bg-pink-500 shadow-2xl blur-xl shadow-blue-500 w-[100px] h-[100px] rounded-full z-0 absolute bottom-[95px] lg:bottom-5 left-10' />
            <img src={userData.profilePicture || fresh} className=' z-10 mt-3 md:mt-0 w-28 h-28 object-cover rounded-full shrink-0' />
            <div className='p-2 z-10'>
              {userData && <div className='text-slate-300 dark:text-slate-300 font-medium text-xl text-center md:text-left'>{userData.fullName}</div>}
              {userData && <div className='text-slate-300 dark:text-slate-300 text-lg md:-ml-10 text-center md:text-left flex items-center gap-x-1 justify-center'>{!loading && '@'}{userData.username} {userData.isVerified && <span class="material-symbols-outlined text-lg bg-white rounded-full w-3 h-3 flex items-center justify-center text-blue-500">
                verified
              </span>}</div>}
              {userData && <div className='text-slate-300 dark:text-slate-300 text-lg text-center md:text-left'>{userData.level}</div>}
              {loading && <div className='bg-[rgba(0,0,0,.4)] rounded-md backdrop-blur-md h-7 w-[200px] px-10 text-lg text-center md:text-left my-2'></div>}
              {userData && <div className='text-slate-300 dark:text-slate-400 text-sm text-center md:text-left'>
                {!loading && <FontAwesomeIcon className=' px-1' icon={faSchool} />}
                {userData.department}
              </div>}
              {loading && <div className='bg-[rgba(0,0,0,.4)] rounded-md backdrop-blur-md my-2 h-7 w-[200px] px-10 text-lg text-center md:text-left'></div>}
            </div>
          </div>
        </div>

        <div className=' z-10 w-full h-auto flex items-center justify-center flex-col p-2 md:p-10'>
          <ul className='w-full sm:w-[75%] md:w-[100%] lg:w-[75%] space-y-2 select-none p-4 md:p-2 md:self-start lg:self-center'>
            <Link to='/profile/edit' className=' bg-sky-100 shadow-inner dark:bg-slate-900 rounded-xl p-4 hover:bg-blue-500 hover:text-white dark:hover:bg-slate-600 cursor-pointer pl-8 flex items-center justify-between'>
              <div className='flex items-center justify-center gap-2'>
                <FontAwesomeIcon icon={faUserEdit} />
                <div>Personal Info</div>
              </div>
              <FontAwesomeIcon icon={faAngleRight} />
            </Link>
            <Link to='/profile/my-contributions' className=' bg-sky-100 shadow-inner dark:bg-slate-900 rounded-xl p-4 hover:bg-blue-500 hover:text-white dark:hover:bg-slate-600 cursor-pointer pl-8 flex items-center justify-between'>
              <div className='flex items-center justify-center gap-2'>
                <FontAwesomeIcon icon={faSquareShareNodes} />
                <div>My Contributions</div>
              </div>
              <FontAwesomeIcon icon={faAngleRight} />
            </Link>
            <Link to='/profile/saved' className=' bg-sky-100 shadow-inner dark:bg-slate-900 rounded-xl p-4 hover:bg-blue-500 hover:text-white dark:hover:bg-slate-600 cursor-pointer pl-8 flex items-center justify-between'>
              <div className='flex items-center justify-center gap-2'>
                <FontAwesomeIcon icon={faBookmark} />
                <div>Save Past Questions</div>
              </div>
              <FontAwesomeIcon icon={faAngleRight} />
            </Link>
            {/* {theme !== 'system' &&
            <li className=' transition-all gap-3 bg-sky-100 shadow-inner dark:bg-slate-800 rounded-xl p-4 hover:bg-blue-500 hover:text-white dark:hover:bg-slate-600 cursor-pointer pl-8 flex items-center justify-between'>
             <div onClick={toggleTheme} className='flex items-center justify-center gap-2'>
                <FontAwesomeIcon icon={faSun} />
                <div>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</div>
              </div>
              <FontAwesomeIcon icon={faToggleOff} className=' p-2 text-xl py-0 cursor-pointer' />
            </li>} */}
            <a href='https://wa.me/2347046864411' className='gap-3 bg-sky-100 shadow-inner dark:bg-slate-900 rounded-xl p-4 hover:bg-blue-500 hover:text-white dark:hover:bg-slate-600 cursor-pointer pl-8 flex items-center justify-start'>
              <FontAwesomeIcon icon={faUser} />
              Help & Support
            </a>
            <li onClick={() => setShow(true)} className='gap-3 md:hidden text-white shadow-inner bg-red-600  rounded-xl p-4 hover:bg-red-400 cursor-pointer pl-8 flex items-center justify-start'>
              <FontAwesomeIcon icon={faSignOut} />
              Log Out
            </li>
          </ul>
        </div>
        <div className={`w-full h-screen fixed z-[999] bg-[rgba(0,0,0,.5)] flex items-center justify-center ${isShow ? 'flex' : 'hidden'}`}>
          <div className='w-[80%] sm:w-[65%] p-5 md:w-[50%] lg:w-[35%] h-auto bg-white rounded-xl -mt-28 flex items-center justify-center flex-col gap-3'>
            <h3 className='text-slate-700 text-sm font-medium p-2'>Are you sure you want to Log Out ?</h3>
            <div className=' w-full p-1 h-full flex items-end justify-between'>
              <button onClick={() => setShow(false)} className=' p-2 bg-blue-500 text-white rounded-xl px-5'>No</button>
              <button className=' p-2 bg-red-500 text-white rounded-xl px-5' onClick={HandleSignOut}>Yes</button>
            </div>
          </div>
        </div>
      </div>
      <Navigations />
    </div>
  )
}

export default Profile
