import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faArrowLeft, faBook, faBookmark, faBrain, faComputer, faGraduationCap, faLevelUp, faLightbulb, faMessage, faMoon, faSchool, faSignOut, faSquareShareNodes, faUser, faUserEdit, faUserGraduate } from '@fortawesome/free-solid-svg-icons'
import fresh from '../assets/user.png'
import useCheckAuth from './customHooks/useCheckAuth'
import { MyAppContext } from '../AppContext/MyContext'
import { signOut } from 'firebase/auth'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { auth, db } from '../firebase/firebaseService'
import { doc, getDoc } from 'firebase/firestore'

const userProfile = () => {

    const { theme, setTheme, user, setUser } = useContext(MyAppContext);
    const [userData, setUserdata] = useState([]);
    const [loading, setLoad] = useState(true)
    const { userId } = useParams();
    const navigate = useNavigate()

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRef = doc(db, "Users", userId);
                if (userId === user.uid) {
                    navigate('/profile')
                }
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
        document.title = userData.username
    }, [document.title, user])

    useCheckAuth()


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
                        <Link to='/feed'>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                        <h2 className='text-lgtext-white ml-3 font-medium'>{userData.username}</h2>
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
                    a
                </div>
            </div>
            <Navigations />
        </div>
    )
}

export default userProfile
