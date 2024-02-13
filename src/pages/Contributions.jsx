import React, { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheckCircle, faInfoCircle, faSpinner, faSquareShareNodes, faTrash } from '@fortawesome/free-solid-svg-icons'
import useCheckAuth from './customHooks/useCheckAuth'
import { MyAppContext } from '../AppContext/MyContext'
import { Link, useNavigate } from 'react-router-dom'
import {TimeAgo} from '../TimeAgo'
import { db } from '../firebase/firebaseService'
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { faFaceSadTear } from '@fortawesome/free-regular-svg-icons'

const Contributions = () => {

  const { user, setUser } = useContext(MyAppContext);
  const [userData, setUserdata] = useState([]);
  const [loading, setLoad] = useState(true)
  const [posts, setPosts] = useState([])
  const [isShow, setShow] = useState(false);
  const [isDeleted, setisdeleted] = useState(false);
  const [clickedPost, setClickedPost] = useState(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0); // Reset scroll position to top when the pathname changes
  }, []);

  const fetchPosts = async () => {
    try {
      const postsCollection = query(collection(db, 'Posts'), where("userId", "==", user.uid));
      const snapshot = await getDocs(postsCollection);
      const postsData = []
      snapshot.forEach((doc) => {
        postsData.push(doc.data());
      })
      return postsData;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };
  useEffect(() => {
    document.title = 'FUBK PQ Hub - My Contributions'
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
    const getPosts = async () => {
      const posts = await fetchPosts();
      setPosts(posts);
    };
    getPosts();
    fetchUserData();
  }, [document.title, user])


  useCheckAuth()

  const deletePost = async (id) => {
    try {
      await deleteDoc(doc(db, 'Posts', id));
      setTimeout(() => {
        setShow(false)
        window.location.reload();
      }, 800)
      setisdeleted(true)
    } catch (error) {
      console.error('Error deleting post:', error);
      // alert('Error deleting post');
    }
  };

  const handleDeleteClick = async (userId, postId) => {
    if (userId === user.uid) {
      await deletePost(postId);
    } else {
      alert('You are not authorized to delete this post.');
    }
  };




  return (
    <div className='bg-sky-50 dark:bg-slate-950 w-full sm:pb-[85px] md:pb-0 md:pl-[140px] pt-[77px]'>
      <TopNav name={
        <>
          <div className=' w-full flex items-center justify-between'>
            <div className='flex items-center justify-center'>
              <Link to='/profile'>
                <FontAwesomeIcon icon={faArrowLeft} className='mr-5 cursor-pointer p-2' />
              </Link>
              <FontAwesomeIcon icon={faSquareShareNodes} />
              <h2 className='text-lgtext-white ml-3 font-medium'>My Contributions</h2>
            </div>
          </div>
        </>
      } />
      <div className=' w-full bg-sky-50 dark:bg-slate-950 pb-[65px] md:pl-[60px]'>
        <div className={` w-full flex items-center ${!loading && 'overflow-y-auto'}to justify-center flex-row flex-wrap gap-2 p-2 select-none`}>
          {posts.map((post, i) => (
            <div key={i} className=' w-[48%] lg:w-[30%] border dark:border-0 h-auto bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              <div className=' w-full text-base p-3 pb-1 px-3 truncate text-slate-600 dark:text-slate-300'>
                {`${post.examType} - ${post.examYear}`}
              </div>
              <div className=' w-full text-xs px-3 pb-2 truncate text-slate-600 dark:text-slate-300'>
                {`${TimeAgo(post.createdAt.toDate().toLocaleString())}`}
              </div>
              <img src={post.images[0]} className=' w-full aspect-square object-cover' alt="" />
              <div className=' w-full p-2 flex items-center justify-between px3 text-slate-100'>
                {post.isPrivate == false && <div>
                  <div className=' flex items-center justify-center gap-x-2 p-1.5 bg-green-500 rounded-md px-2 text-sm'>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <div>Approved</div>
                  </div>
                </div>}
                {post.isPrivate == true && <div>
                  <div className='flex items-center justify-center gap-x-1 truncate p-1.5 bg-orange-500 rounded-md px-2 text-sm'>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <div className=' truncate'>Under Review</div>
                  </div>
                </div>}
                <div>
                  <FontAwesomeIcon onClick={() => setClickedPost(post)} className=' cursor-pointer w-4 h-4 p-2 bg-red-500 rounded-full' icon={faTrash} />
                </div>
              </div>
            </div>
          ))}
          {clickedPost &&
            <div className='confirmbox w-[80%] sm:w-[65%] p-5 md:w-[50%] lg:w-[35%] h-auto bg-white rounded-xl flex items-center justify-center flex-col gap-3'>
              <h3 className='text-slate-700 text-base font-medium p-2'>Are you sure you want to Delete</h3>
              <h3 className='text-slate-700 text-base font-semibold p-2 py-0'>{clickedPost.examType} - {clickedPost.examYear} ?</h3>
              {isDeleted && <div className=' text-green-700 text-sm'>Post Deleted Successfully!</div>}
              <div className=' w-full p-1 h-full flex items-end justify-between'>
                <button onClick={() => setClickedPost(null)} className=' p-2 bg-blue-500 text-white rounded-xl px-5'>No</button>
                <button className=' p-2 bg-red-500 text-white rounded-xl px-5' onClick={() => handleDeleteClick(clickedPost.userId, clickedPost.DocId)}>Yes</button>
              </div>
            </div>}
          {loading &&
            <>
              <div className='flex items-center justify-center w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
                <FontAwesomeIcon className='skeletonloader' icon={faSpinner} />
              </div>
              <div className='flex items-center justify-center w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
                <FontAwesomeIcon className='skeletonloader' icon={faSpinner} />
              </div>
              <div className='flex items-center justify-center w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
                <FontAwesomeIcon className='skeletonloader' icon={faSpinner} />
              </div>
              <div className='flex items-center justify-center w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
                <FontAwesomeIcon className='skeletonloader' icon={faSpinner} />
              </div>
              <div className='flex items-center justify-center w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
                <FontAwesomeIcon className='skeletonloader' icon={faSpinner} />
              </div>
              <div className='flex items-center justify-center w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
                <FontAwesomeIcon className='skeletonloader' icon={faSpinner} />
              </div>
            </>
          }
          {!loading && posts.length < 1 &&
            <div className=' w-full p-5 dark:text-slate-300 text-center'>
              <FontAwesomeIcon className=' px-2' icon={faFaceSadTear} />
              No Contributions made yet! Please contribute on the Contribute Page to help others and track your
              contributions here.
            </div>
          }
        </div>
      </div>
      <Navigations />
    </div>
  )
}

export default Contributions
