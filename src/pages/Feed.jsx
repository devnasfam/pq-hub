import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import PostCard from '../components/PostCard'
import openbook from '../assets/openbook.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faRobot, faSearch, faSignOut, faTimes } from '@fortawesome/free-solid-svg-icons'
import useCheckAuth from './customHooks/useCheckAuth'
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '../firebase/firebaseService'
import { MyAppContext } from '../AppContext/MyContext'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import Tooltip from '@mui/material/Tooltip'
import { CircularProgress } from '@mui/material'

const Feed = () => {
  const navigate = useNavigate()
  useCheckAuth();
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isShowModal, setIsShowModal] = useState(false);
  const [annouceData, setAnnouceData] = useState('')
  const [userData, setUserData] = useState(null)
  const [isOpen, setisopen] = useState(false)
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  useEffect(() => {
    let lastScrollTop = window.scrollY || document.documentElement.scrollTop;

    const handleScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      setIsScrollingDown(currentScroll > lastScrollTop);
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    toast.remove()
  }, [])

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
          setAnnouceData(announcementData);
          setIsShowModal(true)
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
    document.title = 'Feed';
    setlinkFrom('/feed')
    const fetchUserData = async () => {
      try {
        if (user && user.uid) {
          const userRef = doc(db, 'Users', user && user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data())
          }
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
    window.scrollTo(0, 0);
  }, [document.title, linkFrom]);

  const hasViewedAnnouce = async () => {
    setIsShowModal(false)
    try {
      const userDoc = doc(db, 'Users', user?.uid);
      await updateDoc(userDoc, {
        hasViewedAnnouce: true
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={`${isShowModal ? ' overflow-hidden' : ' overflow-y-auto'} bg-sky-50 dark:bg-slate-950 w-full pb-[78px] md:pb-0 md:pl-[140px] pt-[93px]`}>
      {!isScrollingDown && <TopNav>
        <div className=' w-full flex items-center justify-start'>
          <Link to='/'>
            <img src={openbook} alt="PQ Hub Feed" className='w-[33px] h-[33px] cursor-pointer' />
          </Link>
          <h2 className='text-lgtext-white ml-3 font-medium truncate'>PQ Hub - Feed</h2>
        </div>
        <div>
          <Tooltip title='Search' arrow enterDelay={400}>
            <Link to='/search' className=' scale-95 md:scale-100 cursor-pointer md:w-full w-10 max-md:h-10 mr-3 sm:mr-1.5 md:mr-0 flex items-center bg-sky-50 text-slate-900 dark:text-slate-100 dark:bg-slate-900 p-2 justify-center gap-x-2 rounded-full px-5 -ml-2'>
              <input type="text" placeholder='Search PQ . . .' readOnly className=' hidden md:block text-[14.3px]  cursor-pointer outline-none w-[130px] lg:w-[190px] placeholder-slate-800 dark:placeholder-slate-200 bg-transparent px-3' />

              <FontAwesomeIcon icon={faSearch} />
            </Link>
          </Tooltip>
        </div>
        <Tooltip title={`${isOpen ? 'Close' : 'Menu'}`} arrow placement='top' enterDelay={500}>
          <div onClick={HandleClick} className=' space-y-[5px] cursor-pointer md:hidden w-auto h-auto overflow-hidden p-[2px]'>
            <div className={` cursor-pointer w-6 h-[2px] rounded-md bg-slate-100 transform duration-200 ${isOpen ? ' rotate-45 translate-y-[7px]' : ''}`}></div>
            <div className={` cursor-pointer w-6 h-[2px] rounded-md bg-slate-100 transform duration-300 ${isOpen ? ' translate-x-full ' : ''}`}></div>
            <div className={` cursor-pointer w-6 h-[2px] rounded-md bg-slate-100 transform duration-200 ${isOpen ? ' -rotate-45 -translate-y-[7px]' : ''}`}></div>
          </div>
        </Tooltip>
        <ul
          style={{ transform: `scale(${scale})` }}
          id='menuMobile'
          onClick={closeMenu}
          className="bg-sky-50 text-slate-800 dark:text-white dark:bg-[rgba(30,41,59,.95)] backdrop-blur-lg p-2 list-none w-auto min-h-auto fixed top-[65px] right-4 flex flex-col items-center justify-start space-y-3 font-medium rounded-md font-poppins transition-all ease-in-out duration-200 shadow-2xl mt-2 py-3 px-1 select-none md:hidden">
          <Link to='/ai-chatbot'><li className='cursor-pointer active:text-slate-200 active:bg-slate-500 w-full py-1 px-10 rounded-md transition-all ease-in-out duration-300 flex items-center justify-center gap-x-1 '><FontAwesomeIcon className=' text-pink-400 p-1.5 bg-slate-700 rounded-full' icon={faRobot} />AI chatbot</li></Link>
          {/* <Link to=''><li className='cursor-pointer active:text-slate-200 active:bg-slate-500 w-full py-1 px-10 rounded-md transition-all ease-in-out duration-300 '><FontAwesomeIcon icon={faCalculator} className='px-1.5' />Calculate CGPA</li></Link> */}
          <div className='flex py-[4px] md:hidden w-auto md:mr-[200px] shadow bg-sky-200 dark:bg-slate-950 dark:border dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full px-2 items-center justify-center'>
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
          <div onClick={HandleSignOut} className=' cursor-pointer w-[65%] flex items-center justify-center p-1.5 gap-2 bg-red-500 text-slate-50 rounded-lg'>
            <FontAwesomeIcon icon={faSignOut} />
            Log Out
          </div>
        </ul>
        <div className='hidden py-[4px] md:flex w-auto md:mr-[180px] shadow bg-slate-100 dark:bg-slate-950 dark:border dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full px-1 items-center justify-center'>
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
      </TopNav>}
      {/* Post Icon */}
      <Link to='/contribute' className={` duration-200 overflow-hidden group postBtn ${!isScrollingDown ? ' w-auto' : ' w-9'} h-9 fixed bottom-[75px] md:bottom-10 shadow-black shadow-2xl right-4 md:right-12 xl:right-8 z-50 flex items-center justify-center gap-1 transform-transition active:scale-95 cursor-pointer text-slate-100 px-3.5 rounded-full`}>
        <Tooltip title={`${isScrollingDown ? 'Post PQ' : ''}`} placement='top' arrow enterDelay={400}>
          <div className=' flex items-center justify-center duration-300 group-hover:text-blue-600 gap-1 z-10'>
            <FontAwesomeIcon className=' duration-150 group-hover:rotate-90' icon={faPlus} />
            {!isScrollingDown &&
              <div className=' text-sm font-medium tracking-wide'>Post PQ</div>
            }
          </div>
        </Tooltip>
        <div className=' transform scale-0 translate-y-full group-hover:translate-y-0 group-hover:scale-100 rounded-full duration-300  z-0 w-full bg-slate-100 h-full absolute'></div>
      </Link>

      {loading && <div className=' -mt-1 w-full flex items-center justify-center gap-2 text-xl text-white'>
        <CircularProgress size={30} thickness={4} />
      </div>}
      {posts.length > 0 &&
        <div className='w-full h-auto p-0 pb-[40px] flex items-center justify-center'>
          <div className='w-[90%] xl:w-full min-h-screen flex items-center justify-center gap-3 flex-col md:flex-row flex-wrap'>
            {posts?.map((post, index) => (
              <PostCard key={index} post={post} />
            ))}
          </div>
        </div>
      }
      <Toaster position='bottom-center' />
      <Navigations />
      <div className={`${isShowModal && !userData?.hasViewedAnnouce ? ' block ' : ' hidden'} fixed bottom-0 right-0 w-full h-full bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center`}>
        <div className={` p-2 w-[85%] sm:w-[60%] md:w-[47%] lg:w-[35%] xl:w-[32%] h-auto max-h-[90%] overflow-y-auto bg-slate-100 dark:bg-slate-700 rounded-xl ring-1 ring-slate-300/70 shadow-2xl dark:ring-slate-600`}>
          <div className=' w-full flex items-center justify-center flex-col p-2 my-5 mt-1 text-slate-800 dark:text-slate-50'>
           <div className=' w-full flex items-center justify-end p-1'>
             <Tooltip title='Close' enterDelay={400}>
               <FontAwesomeIcon onClick={hasViewedAnnouce} className=' cursor-pointer -mt-2' icon={faTimes}/>
            </Tooltip>
           </div>
            <h2 className=' flex items-center justify-center gap-1 text-slate-800 dark:text-slate-50 text-lg font-semibold tracking-wide truncate px-5'>{annouceData.Heading}</h2>
            <h2 className=' text-slate-600 dark:text-slate-200 px-5 py-2'>
              {annouceData.Msg}
            </h2>
            <div className=' w-full flex items-center justify-center mt-3'>
              <button onClick={hasViewedAnnouce} className=' active:bg-blue-400 duration-150 active:scale-[0.97] p-1.5 px-5 w-1/2 mx-auto bg-blue-500 text-slate-50 font-semibold rounded-xl text-sm tracking-wide'>Okay</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Feed