import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigations from '../components/Navigations';
import TopNav from '../components/TopNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faBookOpenReader, faFaceSadTear,
  faFilter, faSearch, faSpinner, faTimes
} from '@fortawesome/free-solid-svg-icons';
import PostCard from '../components/PostCard';
import useCheckAuth from './customHooks/useCheckAuth';
import Select from 'react-select';
import { Year, Level } from '../examtypes';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseService';
import toast, { Toaster } from 'react-hot-toast';
import { CircularProgress, Tooltip } from '@mui/material';

const Search = () => {
  useCheckAuth();
  useLayoutEffect(() => window.scrollTo(0, 0), []);

  const [isOpen, setIsOpen] = useState(false);
  const [errmsg, setErrMsg] = useState(false);
  const [examInput, setExamInput] = useState('');
  const [yearSelect, setYearSelect] = useState(null);
  const [levelSelect, setLevelSelect] = useState(null);
  const [posts, setPosts] = useState([]);
  const [noPosts, setNoPosts] = useState(false);
  const [startMsg, setStartMsg] = useState(true);
  const [loading, setLoading] = useState(false);
  const [levelMsg, setLevelMsg] = useState('');
  const [examMsg, setExamMsg] = useState('');
  const [yearMsg, setYearMsg] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const inpRef = useRef(null);

  useEffect(() => {
    document.title = 'Search';
    inpRef.current?.focus();
  }, []);

  const handleFilter = async () => {
    try {
      const postsCollection = collection(db, 'Posts');
      let queryRef = query(postsCollection, where('isPrivate', '==', false));

      if (!examInput.trim() && !yearSelect && !levelSelect) {
        setErrMsg(true);
        toast.error('Please select at least one filter before querying.', {
          duration: 3500, position: 'top-center'
        });
        return;
      }

      setNoPosts(false);
      setLoading(true);
      setIsOpen(false);
      setStartMsg(false);
      setErrMsg(false);
      setSearchValue('');
      window.scrollTo(0, 0);
      setExamMsg('');
      setYearMsg('');
      setLevelMsg('');

      if (examInput.trim()) {
        const formatted = examInput.trim().toUpperCase().replace(/\s+/g, '');
        setExamMsg(formatted);
        queryRef = query(queryRef, where('examType', '==', formatted));
      }
      if (yearSelect) {
        setYearMsg(yearSelect.value);
        queryRef = query(queryRef, where('examYear', '==', yearSelect.value));
      }
      if (levelSelect) {
        setLevelMsg(levelSelect.value);
        queryRef = query(queryRef, where('level', '==', levelSelect.value));
      }

      const snapshot = await getDocs(queryRef);
      if (snapshot.empty) {
        setNoPosts(true);
        setPosts([]);
      } else {
        const postsData = snapshot.docs.map(doc => doc.data()).sort((a, b) => b.likes - a.likes);
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setNoPosts(true);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setStartMsg(false);
    setLoading(true);
    setNoPosts(false);
    setExamMsg(searchValue);
    setYearMsg('');
    setLevelMsg('');
    window.scrollTo(0, 0);

    try {
      const postsCollection = collection(db, 'Posts');
      const formatted = searchValue.trim().toUpperCase().replace(/\s+/g, '');
      let queryRef = query(postsCollection, where('isPrivate', '==', false), where('examType', '==', formatted));

      const snapshot = await getDocs(queryRef);
      if (snapshot.empty) {
        setNoPosts(true);
        setPosts([]);
      } else {
        const postsData = snapshot.docs.map(doc => doc.data()).sort((a, b) => b.likes - a.likes);
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setNoPosts(true);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Enter' && handleSearch();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchValue]);

  const modalVisibility = isOpen ? 'flex' : 'hidden';

  return (
    <div className='w-full h-auto pb-[35px] md:pb-0'>
      <div className='w-full flex items-center justify-center bg-blue-500 dark:bg-[rgba(30,41,59,.85)] fixed top-0 right-0 z-30 backdrop-blur-md p-5'>
        <div className='w-[95%] sm:w-[85%] md:w-[85%] lg:w-[65%] flex items-center justify-center'>
          <Tooltip title='Back' arrow enterDelay={500}>
            <Link to='/feed' className='dark:text-slate-100 text-slate-100'>
              <FontAwesomeIcon className='mr-3 text-md' icon={faArrowLeft} />
            </Link>
          </Tooltip>
          <div className='flex justify-center items-center rounded-full bg-white px-2 py-[2px] w-[85%] md:w-[75%]'>
            <input
              type='text'
              ref={inpRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder='Search...'
              className='placeholder-slate-600 text-slate-700 font-medium px-3 rounded-md w-full outline-none bg-transparent border-none'
            />
            <Tooltip title='Search' arrow>
              <FontAwesomeIcon
                onClick={handleSearch}
                icon={faSearch}
                className={`${searchValue.trim() !== '' && 'text-white bg-blue-500'} duration-300 text-slate-900 text-lg p-[7px] rounded-full cursor-pointer`}
              />
            </Tooltip>
          </div>
          <div onClick={() => setIsOpen(true)} className='flex items-center justify-center p-1.5 px-3 text-md text-white bg-slate-700 rounded-full cursor-pointer ml-3'>
            <FontAwesomeIcon icon={faFilter} className='p-1 py-0' />
            <div className='text-sm'>Filter</div>
          </div>
        </div>
      </div>

      <div className='w-full p-3 pb-0 pt-[95px] flex items-center justify-center gap-x-3'>
        <div className='flex items-center justify-center gap-x-2 text-slate-100'>
          {examMsg && <div className='p-1.5 text-sm bg-blue-500 rounded-full px-3'>{examMsg}</div>}
          {yearMsg && <div className='p-1.5 text-sm bg-blue-500 rounded-full px-3'>{yearMsg}</div>}
          {levelMsg && <div className='p-1.5 text-sm bg-blue-500 rounded-full px-3'>{levelMsg}</div>}
        </div>
      </div>

      {loading && (
        <div className='w-full flex items-center justify-center gap-2 text-xl text-white mt-4'>
          <CircularProgress size={30} thickness={4} />
        </div>
      )}

      {startMsg && (
        <div className='text-slate-700 dark:text-slate-400 p-2 px-5 flex items-center justify-center mt-2 flex-col gap-2'>
          <div className='text-lg font-semibold'>
            <FontAwesomeIcon icon={faBookOpenReader} className='text-[25px] px-2' />
            Find Past Questions
          </div>
          <div className='text-center'>Use the search box or filter options to find the past questions you need.</div>
        </div>
      )}

      {noPosts && (
        <div className='text-slate-700 dark:text-slate-400 p-2 px-5 flex items-center justify-center mt-5 flex-col gap-2'>
          <div className='text-lg font-semibold'>
            <FontAwesomeIcon icon={faFaceSadTear} className='text-[25px] px-2' />
            Uh-oh! No Matches Found
          </div>
          <div className='text-center px-2 sm:px-14 md:px-20 lg:px-72'>
            We couldn't find any past questions matching your criteria.
            <Link to='/contribute' className='text-blue-500'> Share yours</Link> to help others.
          </div>
        </div>
      )}

      <div className='w-full h-auto p-0 flex items-center justify-center pt-3 pb-20'>
        <div className='w-[90%] flex items-center justify-center gap-3 flex-col md:flex-row flex-wrap'>
          {posts.map((post, index) => (
            <PostCard key={index} post={post} />
          ))}
        </div>
      </div>

      <div className={`z-50 w-full h-screen fixed top-0 left-0 bg-[rgba(0,0,0,.4)] items-center justify-center ${modalVisibility}`}>
        <div className='w-[85%] px-3 sm:w-[70%] md:w-[60%] lg:w-[35%] bg-white dark:bg-[rgba(30,41,59,.75)] p-3 mx-auto shadow-xl rounded-xl'>
          <div className='p-2 flex items-center justify-between text-slate-700 dark:text-slate-200 border-b'>
            <h2>Filter Past Questions</h2>
            <Tooltip title='Close' arrow placement='bottom' enterDelay={500}>
              <FontAwesomeIcon icon={faTimes} onClick={() => setIsOpen(false)} className='p-2 cursor-pointer text-lg' />
            </Tooltip>
          </div>
          <div className='p-1.5 font-medium text-slate-600 dark:text-slate-200 mt-1.5'>Select Level</div>
          <Select options={Level} value={levelSelect} isSearchable={false} onChange={setLevelSelect} />
          <div className='p-1.5 font-medium text-slate-600 dark:text-slate-200 mt-1.5'>Exam Type</div>
          <input
            type='text'
            value={examInput}
            onChange={(e) => setExamInput(e.target.value)}
            placeholder='e.g. GST102'
            className='w-full uppercase mt-1 mb-3 px-3 py-2 text-slate-800 bg-white border border-slate-300 rounded-md outline-none'
          />
          <div className='p-1.5 font-medium text-slate-600 dark:text-slate-200'>Session</div>
          <Select options={Year} value={yearSelect} onChange={setYearSelect} />
          <div className='w-full flex items-center justify-center'>
            <button onClick={handleFilter} className='w-[65%] p-1.5 my-3 px-4 bg-blue-500 rounded-xl text-white'>
              <FontAwesomeIcon className='px-2' icon={faFilter} />
              Find Now
            </button>
          </div>
        </div>
      </div>

      <Toaster position='bottom-center' />
    </div>
  );
};

export default Search;
