import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBookOpen, faBookOpenReader, faBookQuran, faBookSkull, faBookTanakh, faFaceSadTear, faFilter, faSearch, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons'
import PostCard from '../components/PostCard'
import useCheckAuth from './customHooks/useCheckAuth'
import Select from 'react-select'
import { examTypes, Year, Level } from '../examtypes'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/firebaseService'
import toast, { Toaster } from 'react-hot-toast'
import { CircularProgress, Tooltip } from '@mui/material'

const Search = () => {

  useCheckAuth()
  useLayoutEffect(() => {
    window.scrollTo(0, 0); // Reset scroll position to top when the pathname changes
  }, []);

  const [isOpen, setIopen] = useState(false);
  const [errmsg, seterrmsg] = useState(false);
  const [examSelect, setExamSelect] = useState(null)
  const [yearSelect, setYearSelect] = useState(null)
  const [levelSelect, setLevelSelect] = useState(null)
  const [posts, setPosts] = useState([])
  const [noPosts, setNoposts] = useState(false)
  const [startMsg, setStartMsg] = useState(true)
  const [loading, setLoading] = useState(false)
  const inpRef = useRef(null)
  const [LevelMsg, setLevelMsg] = useState('')
  const [examMsg, setexamMsg] = useState('')
  const [yearMsg, setyearMsg] = useState('')

  useEffect(() => {
    document.title = 'Search'
    inpRef.current.focus();
  }, [document.title])

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
}, [])


  const hide = isOpen ? 'flex' : 'hidden';

  const HanldeOpen = () => {
    setIopen(true);
  }
  const HandleClose = () => {
    setIopen(false);
  }

  let HandleLevelSelect = (e) => {
    setLevelSelect(e)
  }
  let HandleExamSelect = (e) => {
    setExamSelect(e)
  }
  let HandleYearSelect = (e) => {
    setYearSelect(e)
  }


  const HanldeFilter = async () => {
    try {
      const postsCollection = collection(db, 'Posts');
      let queryRef = query(postsCollection, where("isPrivate", "==", false));
      if (!examSelect && !yearSelect && !levelSelect) {
        seterrmsg(true)
        toast.error('Please select at least one filter (exam type, year, or level) before querying.', { duration: 3500, position: 'top-center' });
      } else {
        setNoposts(false)
        setLoading(true);
        setIopen(false);
        setStartMsg(false);
        seterrmsg(false)
        setSearchvalue('')
        window.scrollTo(0, 0);
        setexamMsg('')
        if (examSelect) {
          setexamMsg(examSelect.value)
          queryRef = query(queryRef, where("examType", "==", examSelect.value));
        }

        if (yearSelect) {
          setyearMsg(yearSelect.value)
          queryRef = query(queryRef, where("examYear", "==", yearSelect.value));
        }

        if (levelSelect) {
          setLevelMsg(levelSelect.value)
          queryRef = query(queryRef, where("level", "==", levelSelect.value));
        }
        const snapshot = await getDocs(queryRef);

        if (snapshot.empty) {
          setNoposts(true);
          setLoading(false)
          setPosts([]);
        } else {
          const Sorted = snapshot.docs.map((doc) => doc.data());
          const postsData = Sorted.sort((a, b) => b.likes - a.likes);
          setPosts(postsData);
          setNoposts(false);
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setNoposts(true);
      setLoading(false);
      setPosts([]);
    }
  };

  const [searchValue, setSearchvalue] = useState('')

  const HandleSearch = async () => {
    Search();
  }

  const Search = async () => {
    if (searchValue.trim() == '') {
      return
    } else {
      setStartMsg(false);
      setLoading(true);
      setNoposts(false);
      setexamMsg(searchValue)
      setyearMsg('')
      setLevelMsg('')
      window.scrollTo(0, 0);
      try {
        const postsCollection = collection(db, 'Posts');
        let queryRef = query(postsCollection, where("isPrivate", "==", false));
        queryRef = query(queryRef, where("examType", "==", searchValue.trim().toUpperCase().replace(' ','')));

        const snapshot = await getDocs(queryRef);

        if (snapshot.empty) {
          setNoposts(true);
          setPosts([]);
          setLoading(false)
        } else {
          const Sorted = snapshot.docs.map((doc) => doc.data());
          const postsData = Sorted.sort((a, b) => b.likes - a.likes);
          setPosts(postsData);
          setNoposts(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setNoposts(true);
        setPosts([]);
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const keyDown = (e) => {
      if (e.key === 'Enter') {
        Search();
      }
    };
    window.addEventListener('keydown', keyDown);

    return () => {
      window.removeEventListener('keydown', keyDown);
    };
  }, [searchValue])

  return (
    <div className=' w-full h-auto pb-[35px] md:pb-0'>
      <div className='w-full flex items-center justify-center bg-blue-500 dark:bg-[rgba(30,41,59,.85)] fixed top-0 right-0 z-30 backdrop-blur-md p-5'>
        <div className=' w-[95%] sm:w-[85%] md:w-[85%] lg:w-[65%] flex items-center justify-center'>
         <Tooltip title='Back' arrow enterDelay={500}>
          <Link to='/feed' className=' dark:text-slate-100 text-slate-100'>
              <FontAwesomeIcon className=' mr-3 text-md' icon={faArrowLeft} />
          </Link>
         </Tooltip>
          <div className='flex justify-center items-center rounded-full bg-slate-200 dark:bg-slate-950 px-2 py-[2px] w-[85%] md:w-[75%]'>
            <input type="text" ref={inpRef} value={searchValue} onChange={(e) => setSearchvalue(e.target.value)} placeholder='Search...' className=' dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium px-3 rounded-md w-full outline-none bg-transparent border-none dark:text-slate-50' />
            <Tooltip title='Search' arrow>
              <FontAwesomeIcon onClick={HandleSearch} icon={faSearch} className={`${searchValue.trim() !== '' && 'text-white bg-blue-500'} duration-300 text-slate-900 dark:text-slate-50 text-lg p-[7px] rounded-full cursor-pointer`} />
            </Tooltip>
          </div>
          <div onClick={HanldeOpen} className='flex items-center justify-center p-1.5 px-3 text-md text-white bg-slate-700 dark:bg-slate-700 rounded-full cursor-pointer ml-3 select-none'>
            <FontAwesomeIcon icon={faFilter} className=' p-1 py-0' />
            <div className=' text-sm'>Filter</div>
          </div>
        </div>
      </div>


      <div className=' w-full p-3 pb-0 pt-[95px] flex items-center justify-center gap-x-3'>
        <div className=' flex items-center justify-center gap-x-2 rounded-md text-slate-100'>
          {examMsg && <div className=' w-auto p-1.5 text-sm bg-blue-500 rounded-full px-3 dark:bg-slate-700'>{examMsg && examMsg} </div>}
          {yearMsg && <div className=' w-auto p-1.5 text-sm bg-blue-500 rounded-full px-3 dark:bg-slate-700'>{yearMsg && yearMsg} </div>}
          {LevelMsg && <div className=' w-auto p-1.5 text-sm bg-blue-500 rounded-full px-3 dark:bg-slate-700'>{LevelMsg && LevelMsg} </div>}
        </div>
      </div>

      {loading && <div className=' w-full flex items-center justify-center gap-2 text-xl text-white mt-4'>
        <CircularProgress size={30} thickness={4}/>
      </div>}

      {startMsg && <div className='w-full h-auto text-slate-700 dark:text-slate-400 p-2 px-5 tracking-wider md:pl-[90px] flex items-center justify-center mt-2 flex-col gap-2'>
        <div className=' text-lg font-semibold'>
          <FontAwesomeIcon icon={faBookOpenReader} className='text-[25px] px-2' />
          Find Past Questions
        </div>
        <div className=' text-center'>Use the search box or filter options to find the past questions you need.</div>
      </div>}

      {!posts || noPosts && <div className='w-full h-auto text-slate-700 dark:text-slate-400 p-2 px-5 tracking-wider md:pl-[90px] flex items-center justify-center mt-5 flex-col gap-2'>
        <div className=' text-lg font-semibold'>
          <FontAwesomeIcon icon={faFaceSadTear} className='text-[25px] px-2' />
          Uh-oh! No Matches Found
        </div>
        <div className=' text-center px-2 sm:px-14 md:px-20 lg:px-72'>We could'nt find any past questions matching your criteria. Expand your search or
          <Link to='/contribute' className=' text-blue-500'> share your own past questions</Link> to help our community grow.
        </div>
      </div>}

      {/* This is where i will show cards if query and search matches, it's hidden show it when query matches */}
      {posts && <div className='w-full h-auto p-0 flex items-center justify-center pt-3 pb-20'>
        <div className='w-[90%] h-auto flex items-center justify-center gap-3 flex-col md:flex-row flex-wrap'>
          {posts?.map((post, index) => (
            <PostCard key={index} post={post} />
          ))}
        </div>
      </div>}

      <div className={` z-50 overflow-none w-full h-screen fixed top-0 left-0 bg-[rgba(0,0,0,.4)] items-center justify-center ${hide}`}>

        <div className='w-[85%] px-3 sm:w-[70%] md:w-[60%] lg:w-[35%] h-auto border border-slate-200 dark:border-slate-700 bg-white dark:bg-[rgba(30,41,59,.75)] backdrop-blur-lg p-3 mx-auto shadow-xl rounded-xl'>
          <div className='w-full h-auto p-2 flex items-center justify-between text-slate-700 dark:text-slate-200 border-b-[.15px] border-b-slate-200 dark:border-b-slate-700'>
            <h2>Filter Past Questions</h2>
            <Tooltip title='Close' arrow placement='bottom' enterDelay={500}>
              <FontAwesomeIcon icon={faTimes} onClick={HandleClose} className='p-2 cursor-pointer text-lg' />
            </Tooltip>
          </div>
          <div className=' p-1.5 font-medium text-slate-600 dark:text-slate-200 mt-1.5'>Select Level</div>
          <Select
            options={Level}
            value={levelSelect}
            isSearchable={false}
            onChange={(e) => HandleLevelSelect(e)}
          />
          <div className=' p-1.5 font-medium text-slate-600 dark:text-slate-200'>Exam Type</div>
          <Select
            options={examTypes}
            value={examSelect}
            onChange={(e) => HandleExamSelect(e)}
          />
          <div className=' mt-3 p-1.5 font-medium text-slate-600 dark:text-slate-200'>Select Year</div>
          <Select
            options={Year}
            value={yearSelect}
            onChange={(e) => HandleYearSelect(e)}
          />
          <div className='w-full h-auto p-2 flex items-center justify-center'>
            <button onClick={HanldeFilter} className=' truncate w-[65%] p-1.5 my-3 px-4 bg-blue-500 rounded-xl hover:bg-blue-600 active:bg-blue-400 transform transition-all hover:scale-[0.98] text-white'>
              <FontAwesomeIcon className='px-2' icon={faFilter} />
              Find Now
            </button>
          </div>
        </div>
      </div>
      <Toaster position='bottom-center' />
    </div>
  )
}
export default Search
