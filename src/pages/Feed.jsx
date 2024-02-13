import React, { useContext, useEffect, useLayoutEffect, useState, useRef } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import PostCard from '../components/PostCard'
import openbook from '../assets/openbook.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faBrain, faCalculator, faExclamationCircle, faFeather, faHome, faLaptop, faMoon, faPlugCircleBolt, faPlus, faSearch, faSignInAlt, faSignOut, faSpinner, faSun, faToolbox, faTools } from '@fortawesome/free-solid-svg-icons'
import useCheckAuth from './customHooks/useCheckAuth'
import { collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { auth, db } from '../firebase/firebaseService'
import { MyAppContext } from '../AppContext/MyContext'
import { Link, useNavigate } from 'react-router-dom'
import fresh from '../assets/user.png'
import { signOut } from 'firebase/auth'


const Feed = () => {
  const navigate = useNavigate()
  useCheckAuth();
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [annouce, setAnnouce] = useState(false)
  const [annouceMsg, setAnnouceMsg] = useState('')
  const [annouceDate, setAnnouceDate] = useState('')
  const [userData, setUserData] = useState(null)
  const [isOpen, setisopen] = useState(false)

  const HandleClick = () => {
    setisopen((prev) => !prev);
  }

  const scale = isOpen ? "1" : "0";
  const closeMenu = () => {
    setisopen(false)
  }

  const { theme, setTheme, user, linkFrom, setlinkFrom } = useContext(MyAppContext)

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const announcementsCollection = collection(db, 'Announcements');
      const snapshot = await getDocs(announcementsCollection);
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const announcementData = doc.data();
          const announcementMessage = announcementData.Msg;
          const announcementDate = announcementData.Date;
          // I may set other state variables based on your needs
          setAnnouceMsg(announcementMessage);
          setAnnouceDate(announcementDate)
          setAnnouce(true);
          setLoading(false)
        });
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(db, 'Posts');
      const querySnapshot = await getDocs(
        query(postsCollection, where('isPrivate', '==', false))
      );


      const Sort = querySnapshot.docs.map((doc) => doc.data());
      const postsData = Sort.sort((a, b) => b.createdAt - a.createdAt)

      return postsData;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };

  const HandleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    document.title = 'FUBK PQ Hub - Feed';
    setlinkFrom('/feed')
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

    const getPosts = async () => {
      try {
        const posts = await fetchPosts();
        setPosts(posts);
      } catch (error) {
        // Handle error if fetchPosts() fails
        console.error('Error setting posts:', error);
        setPosts([]);
      }
    };

    getPosts();
    fetchAnnouncement();
  }, [document.title, linkFrom]);




  return (
    <div className='bg-sky-50 dark:bg-slate-950 w-full pb-[78px] md:pb-0 md:pl-[140px] pt-[100px]'>
      <TopNav name={
        <>
          <div className=' w-full flex items-center justify-start'>
            <Link to='/'>
              <img src={openbook} alt="PQ Hub Feed" className='w-[35px] h-[35px] cursor-pointer' />
            </Link>
            <h2 className='text-lgtext-white ml-3 font-medium truncate'>PQ Hub - Feed</h2>
          </div>

          <div>
            <Link to='/search' className=' cursor-pointer w-full max-[565px]:w-10 max-[565px]:h-10 max-[565px]:mr-3 flex items-center bg-sky-50 text-slate-900 dark:text-slate-100 dark:bg-slate-900 p-2 justify-center gap-x-2 rounded-full px-5 -ml-2'>
              <input type="text" placeholder='Search PQ . . .' readOnly className=' max-[565px]:hidden text-[14.3px]  cursor-pointer outline-none w-[130px] lg:w-[190px] placeholder-slate-800 dark:placeholder-slate-200 bg-transparent px-3' />
              <FontAwesomeIcon icon={faSearch} />
            </Link>
          </div>
          <div onClick={HandleClick} className=' space-y-[5px] cursor-pointer md:hidden w-auto h-auto overflow-hidden p-[3px]'>
            <div className={` cursor-pointer w-6 h-[2px] rounded-md bg-slate-100 transform duration-200 ${isOpen ? ' rotate-45 translate-y-[7px]' : ''}`}></div>
            <div className={` cursor-pointer w-6 h-[2px] rounded-md bg-slate-100 transform duration-300 ${isOpen ? ' translate-x-full' : ''}`}></div>
            <div className={` cursor-pointer w-6 h-[2px] rounded-md bg-slate-100 transform duration-200 ${isOpen ? ' -rotate-45 -translate-y-[7px]' : ''}`}></div>
          </div>
          <ul
            style={{ transform: `scale(${scale})` }}
            id='menuMobile'
            onClick={closeMenu}
            className="bg-sky-50 text-slate-800 dark:text-white dark:bg-[rgba(30,41,59,.95)] backdrop-blur-lg p-2 list-none w-auto min-h-auto fixed top-[65px] right-4 flex flex-col items-center justify-start space-y-3 font-medium rounded-md font-poppins transition-all ease-in-out duration-200 shadow-2xl mt-2 py-3 px-1 select-none md:hidden">
            <Link to='/ai-chatbot'><li className='cursor-pointer active:text-slate-200 active:bg-slate-500 w-full py-1 px-10 rounded-md transition-all ease-in-out duration-300 '><FontAwesomeIcon icon={faBrain} className='px-1.5' />AI chatbot</li></Link>
            <Link to='/contribute'><li className='cursor-pointer active:text-slate-200 active:bg-slate-500 w-full py-1 px-10 rounded-md transition-all ease-in-out duration-300 '><FontAwesomeIcon icon={faPlus} className='px-1.5' />Post Past Q</li></Link>
            {/* <Link to=''><li className='cursor-pointer active:text-slate-200 active:bg-slate-500 w-full py-1 px-10 rounded-md transition-all ease-in-out duration-300 '><FontAwesomeIcon icon={faCalculator} className='px-1.5' />Calculate CGPA</li></Link> */}
            <div className='flex md:hidden w-auto md:mr-[200px] border border-slate-300 dark:border-slate-700 bg-blue-200 text-slate-700 dark:text-slate-200 dark:bg-slate-900 rounded-xl px-2 items-center justify-center'>
              <FontAwesomeIcon onClick={() => setTheme('light')} className={` ${theme === "light" && 'text-slate-100 bg-slate-700 p-[7px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faSun} />
              <FontAwesomeIcon onClick={() => setTheme('dark')} className={`${theme === "dark" && 'text-slate-700 bg-slate-200 p-[7px] px-[9px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faMoon} />
              <FontAwesomeIcon onClick={() => setTheme('system')} className={`${theme === "system" && 'text-slate-100 bg-slate-700 p-[7px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faLaptop} />
            </div>
            <div onClick={HandleSignOut} className=' cursor-pointer w-[65%] flex items-center justify-center p-1.5 gap-2 bg-red-500 text-slate-50 rounded-lg'>
              <FontAwesomeIcon icon={faSignOut} />
              Log Out
            </div>
          </ul>
          <div className='hidden md:flex w-auto md:mr-[200px] shadow border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-sky-50 dark:bg-slate-950 rounded-xl px-1 items-center justify-center'>
            <FontAwesomeIcon onClick={() => setTheme('light')} className={` ${theme === "light" && 'text-slate-100 bg-slate-700 p-[7px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faSun} />
            <FontAwesomeIcon onClick={() => setTheme('dark')} className={`${theme === "dark" && 'text-slate-700 bg-slate-200 p-[7px] px-[9px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faMoon} />
            <FontAwesomeIcon onClick={() => setTheme('system')} className={`${theme === "system" && 'text-slate-100 bg-slate-700 p-[7px]'} rounded-lg transition-colors duration-300 text-lg cursor-pointer p-2.5`} icon={faLaptop} />
            </div>
        </>

      } />
      {/* Post Icon */}
      <Link to='/contribute' className=' overflow-hidden group postBtn w-auto h-10 fixed bottom-[85px] md:bottom-10 shadow-black shadow-2xl right-4 md:right-12 xl:right-8 z-50 flex items-center justify-center gap-1 transform-transition duration-200 active:scale-95 cursor-pointer text-slate-100 p-0.5 px-4 rounded-full'>
        <div className=' flex items-center justify-center duration-300 group-hover:text-blue-600 gap-1 z-10'>
         <FontAwesomeIcon className=' duration-150 group-hover:rotate-90' icon={faPlus} />
         <div className=' text-sm font-medium tracking-wide'>Post PQ</div>
        </div>
        <div className=' transform scale-0 translate-y-full group-hover:translate-y-0 group-hover:scale-100 rounded-full duration-300  z-0 w-full bg-slate-100 h-full absolute'></div>
      </Link>
      {loading && <div className=' w-full flex items-center justify-center gap-2 text-xl text-white'>
        <FontAwesomeIcon className='skeletonloader' icon={faSpinner} />
      </div>}
      {annouce && <div className='w-full h-auto flex items-center justify-center my-5 mt-2'>
        <div className="w-[90%] sm:w-[70%] md:w-[78%] lg:w-[64%] rounded-xl overflow-hidden shadow-md">
          <div className=' w-full h-auto bg-white dark:bg-red-200 dark:text-slate-700 flex items-center justify-center flex-col text-slate-600 p-2'>
            <div className='w-full h-auto lg:text-lg text-base mt-2 font-medium'>
              <FontAwesomeIcon className='px-2' icon={faExclamationCircle} />
              Annoucement
            </div>
            <div className=' w-full p-1 px-3 text-sm'>
              {annouceDate.toDate().toLocaleString()}
            </div>
            <div className='w-full h-full p-2 '>
              {annouceMsg}
            </div>
          </div>
        </div>
      </div>}
      <div className='w-full h-auto p-0 lg:pb-[20px] flex items-center justify-center'>
        <div className='w-[90%] min-h-screen flex items-center justify-center gap-3 flex-col md:flex-row flex-wrap'>
          {posts?.map((post, index) => (
            <PostCard key={index} post={post} />
          ))}
        </div>
      </div>
      <Navigations />
    </div>
  )
}

export default Feed