import React, { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins, faComments, faHome, faSignOut, faUser, faUserShield } from '@fortawesome/free-solid-svg-icons'
import { NavLink, useNavigate } from 'react-router-dom'
import fresh from '../assets/user.png'
import { signOut } from 'firebase/auth'
import { auth, db } from '../firebase/firebaseService'
import { MyAppContext } from '../AppContext/MyContext'
import { doc, getDoc } from 'firebase/firestore'
import { Tooltip } from '@mui/material'

const Navigations = () => {
  const { user } = useContext(MyAppContext)
  const [userData, setUserData] = useState('')
  const navigate = useNavigate()
  const HandleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/')
    } catch (error) {
      // console.log(error)
    }
  }
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, 'Users', user && user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data())
        }else{
          setUserData('')
        }
      } catch (error) {
        // console.log(error)
      }
    }
    fetchUserData()
  }, [user])
  return (
    <>
      {/* Desktop View */}
      <div className='fixed top-0 left-0 z-50 w-auto min-h-screen p-2  pt-10 px-3 bg-slate-100 shadow-md dark:bg-slate-900 hidden md:flex flex-col items-start justify-start overflow-auto text-slate-900 dark:text-slate-100 gap-2 select-none'>
        <div className='cursor-pointer bg-sky-100 shadow dark:bg-slate-700 flex items-center justify-start flex-row select-none p-1 px-2 transition-all duration-200 w-full rounded-xl'>
          <div>
            <img src={userData && userData.profilePicture || fresh} className='w-[35px] h-[35px] rounded-full shrink-0 m-1 object-cover'></img>
          </div>
          <div className='text-sm truncate text-slate-700 dark:text-slate-100 ml-1'>
            <div>{userData && userData.fullName.split(" ")[0]}</div>
            <div className='text-xs text-slate-500 dark:text-slate-300'>{userData && '@' + userData.username}</div>
          </div>
        </div>
        <div className='w-full h-auto bg-sky-100 shadow dark:bg-slate-700 rounded-xl p-3 space-y-2'>
          <NavLink to='/feed' className='bg-[rgba(0,0,0,.06)] dark:bg-gray-800 flex items-center justify-start flex-row select-none p-2 transition-all duration-200 gap-x-2 w-full px-5 rounded-xl'>
            <div>
              <FontAwesomeIcon icon={faHome} />
            </div>
            <div className='text-sm truncate'>Feed</div>
          </NavLink>
          <NavLink to='/chats' className='bg-[rgba(0,0,0,.06)] dark:bg-gray-800 flex items-center justify-start flex-row select-none p-2 transition-all duration-200 gap-x-2 w-full px-5 rounded-xl'>
            <div>
              <FontAwesomeIcon icon={faComments} />
            </div>
            <div className='text-sm truncate'>Chats</div>
          </NavLink>
          <NavLink to='/rewards' className='bg-[rgba(0,0,0,.06)] dark:bg-gray-800 flex items-center justify-start flex-row select-none p-2 transition-all duration-200 gap-x-2 w-full px-5 rounded-xl'>
            <div>
              <FontAwesomeIcon icon={faCoins} />
            </div>
            <div className='text-sm truncate'>Rewards</div>
          </NavLink>
          <NavLink to='/profile' className='bg-[rgba(0,0,0,.06)] dark:bg-gray-800 flex items-center justify-start flex-row select-none p-2 transition-all duration-200 gap-x-2 w-full px-5 rounded-xl'>
            <div>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className='text-sm truncate'>Profile</div>
          </NavLink>
        </div>
        <Tooltip title='Log out now!' arrow enterDelay={600}>
        <div onClick={HandleSignOut} className='text-white shadow w-full bg-red-500 text-sm flex items-center justify-center flex-row select-none p-2 cursor-pointer transition-all duration-200 gap-x-2 mt-1 rounded-xl px-5'>
          <div>
            <FontAwesomeIcon icon={faSignOut} />
          </div>
          <div className='text-sm truncate'>Log Out</div>
        </div>
        </Tooltip>
      </div>

      {/* Mobile View */}
      <div className='fixed bottom-0 w-full h-auto bg-slate-100 py-0.5 dark:bg-[rgba(30,41,59,.85)] backdrop-blur-md md:hidden flex items-center justify-around text-slate-900 dark:text-slate-100 gap-2 border-t-[.5px] dark:border-t-slate-700 select-none z-50'>
        <NavLink to='/feed' className='flex items-center justify-center flex-col select-none p-1'>
          <div>
            <FontAwesomeIcon icon={faHome} />
          </div>
          <div className='text-[13px] truncate'>Feed</div>
        </NavLink>
        <NavLink to='/chats' className='flex items-center justify-center flex-col select-none p-1'>
          <div>
            <FontAwesomeIcon icon={faComments} />
          </div>
          <div className='text-[13px] truncate'>Chats</div>
        </NavLink>
        <NavLink to='/rewards' className='flex items-center justify-center flex-col select-none p-1'>
          <div>
            <FontAwesomeIcon icon={faCoins} />
          </div>
          <div className='text-[13px] truncate'>Rewards</div>
        </NavLink>
        <NavLink to='/profile' className='flex items-center justify-center flex-col select-none p-1'>
          <div>
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className='text-[13px] truncate'>Profile</div>
        </NavLink>
      </div>
    </>
  )
}

export default Navigations
