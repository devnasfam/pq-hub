import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheckCircle, faTimes, faInfoCircle, faShareAlt, faTrash } from '@fortawesome/free-solid-svg-icons'
import useCheckAuth from './customHooks/useCheckAuth'
import { MyAppContext } from '../AppContext/MyContext'
import { Link } from 'react-router-dom'
import { db, storage } from '../firebase/firebaseService'
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { faFaceSadTear } from '@fortawesome/free-regular-svg-icons'
import { deleteObject, ref } from 'firebase/storage'
import toast, { Toaster } from 'react-hot-toast'
import moment from 'moment'
import { Tooltip } from '@mui/material'

const Contributions = () => {

  const { user } = useContext(MyAppContext);
  const [userData, setUserdata] = useState([]);
  const [loading, setLoad] = useState(true)
  const [posts, setPosts] = useState([])
  const [clickedPost, setClickedPost] = useState(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0); // Reset scroll position to top when the pathname changes
  }, []);

  useEffect(() => {
    toast.remove()
  }, [])

  const fetchPosts = async () => {
    try {
      if (!user) {
        return [];
      }
      const postsCollection = query(collection(db, 'Posts'), where("userId", "==", user?.uid));
      const snapshot = await getDocs(postsCollection);
      let postsData = []
      snapshot.forEach((doc) => {
        postsData.push(doc.data());
      })
      postsData = postsData.sort((a, b) => b.createdAt - a.createdAt);
      return postsData;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };
  
  useEffect(() => {
    document.title = 'My Contributions';
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "Users", user?.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserdata(userSnap?.data())
          setLoad(false)
        } else {
          setUserdata(null);
        }
      } catch (error) {
        console.log(error)
      }
    }
    const getPosts = async () => {
      const posts = await fetchPosts();
      setPosts(posts);
    };
    getPosts();
    fetchUserData();
  }, [user, posts])


  useCheckAuth()

  const deletePost = async (id, imageUrls) => {
    const loadToast = toast.loading('Deleting post...')
    try {
      if (!id) return;
      const userDoc = doc(db, 'Users', user?.uid);
      const docSnap = await getDoc(doc(db, 'Posts', id));
      const docData = docSnap.data();
      if (!docData.isPrivate && userData?.redeemedPoints >= 40) {
        await updateDoc(userDoc, {
          redeemedPoints: userData?.redeemedPoints - 40
        })
      }
      // Delete document from Firestore
      await deleteDoc(doc(db, 'Posts', id));
      // Delete each image from Firebase Storage
      if(docData.images){
        await Promise.all(imageUrls.map(async (imageUrl) => {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        }));
      }
      // Remove the deleted post from the posts state
      toast.success('Post deleted successfully.', { duration: 2000, id: loadToast });
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post: ' + error.message, { duration: 2000, id: loadToast });
    }
  };

  const handleDeleteIconClick = (post) => {
    setClickedPost(post);
  };

  const handleNoClick = () => {
    setClickedPost(null);
  };

  const handleYesClick = async (userId, postId, imageUrls) => {
    setClickedPost(null);
    if (userId === user.uid) {
      await deletePost(postId, imageUrls);
    } else {
      toast.dismiss();
      toast.error('You are not authorized to delete this post.');
    }
  };

  return (
    <div className={`overflow-x-hidden bg-sky-50 dark:bg-slate-950 w-full sm:pb-[85px] md:pb-0 md:pl-[140px] pt-[70px]`}>
      <TopNav>
        <div className=' w-full flex items-center justify-between py-1'>
          <div className='flex items-center justify-center'>
            <Tooltip title='Back' arrow enterDelay={400}>
              <Link to='/profile' className=' dark:text-slate-100 text-slate-100'>
                <FontAwesomeIcon className=' mr-3 text-md' icon={faArrowLeft} />
              </Link>
            </Tooltip>
            <FontAwesomeIcon icon={faShareAlt} />
            <h2 className='text-lgtext-white ml-3 font-medium'>My Contributions</h2>
          </div>
        </div>
      </TopNav>
      <div className={` ${loading ? ' overflow-hidden' : ' overflow-y-auto'} w-full bg-sky-50 dark:bg-slate-950 pb-[65px] md:pl-[60px]`}>
        <div className={` w-full flex items-center ${!loading && 'overflow-y-auto'} justify-center flex-row flex-wrap gap-2 p-2 select-none`}>
          {posts.map((post, i) => (
            <div key={i} className=' w-[48%] lg:w-[30%] border dark:border-0 h-auto bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              <div className=' w-full text-base p-3 pb-1 px-3 truncate text-slate-600 dark:text-slate-300'>
                {`${post.examType} - ${post.examYear}`}
              </div>
              <div className=' w-full text-xs px-3 pb-2 truncate text-slate-600 dark:text-slate-300'>
                {moment(post.createdAt.toDate()).fromNow()}
              </div>
              {!post.isRejected &&
                <img src={post.images[0]} className=' w-full aspect-square object-cover' alt="" />
              }
              {post.isRejected &&
               <div className=' w-full aspect-square flex items-center justify-center'>
                <h2 className=' text-xl break-words p-5 text-slate-700 dark:text-slate-300'>Reason: {post.rejectMsg}</h2>
               </div>
              }
              <div className=' w-full p-2 flex items-center justify-between px3 text-slate-100'>
                {!post.isPrivate && !post.isRejected && <div>
                  <div className=' flex items-center justify-center gap-x-2 p-1.5 bg-green-500 rounded-md px-2 text-sm'>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <div>Approved</div>
                  </div>
                </div>}
                {post.isPrivate && !post.isRejected && <div>
                  <div className='flex items-center justify-center gap-x-1 truncate p-1.5 bg-orange-500 rounded-md px-2 text-sm'>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <div className=' truncate'>Under Review</div>
                  </div>
                </div>}
                {post.isPrivate && post.isRejected && <div>
                  <div className='flex items-center justify-center gap-x-1 truncate p-1.5 bg-red-500 rounded-md px-2 text-sm'>
                    <FontAwesomeIcon className=' w-3 h-3 p-0.5 rounded-full bg-white text-red-500' icon={faTimes} />
                    <div className=' truncate'>Rejected</div>
                  </div>
                </div>}
                <div>
                  <Tooltip title='Delete' arrow enterDelay={200}>
                    <FontAwesomeIcon onClick={() => handleDeleteIconClick(post)} className=' cursor-pointer w-4 h-4 p-2 bg-red-500 rounded-full' icon={faTrash} />
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
          {clickedPost &&
            <div className='confirmbox w-[80%] sm:w-[65%] p-5 md:w-[50%] lg:w-[35%] h-auto bg-white border border-slate-300 dark:border-slate-600 dark:bg-[rgba(30,41,59,.85)] backdrop-blur-md shadow-[0_4px_3px_rgba(0,0,0,.05)] rounded-xl flex items-center justify-center flex-col gap-3'>
              <h3 className='text-slate-700 dark:text-slate-50 text-base font-medium p-2'>Are you sure you want to Delete</h3>
              <h3 className='text-slate-700 dark:text-slate-200 text-base font-semibold p-1 py-0'>{clickedPost.examType} - {clickedPost.examYear} ?</h3>
              <div className=' w-full p-1 h-full flex items-end justify-between'>
                <button onClick={handleNoClick} className=' p-[5px] text-sm bg-blue-500 text-white rounded-lg px-5'>No</button>
                <button className=' p-[5px] text-sm bg-red-500 text-white rounded-lg px-5' onClick={() => handleYesClick(clickedPost.userId, clickedPost.DocId, clickedPost.images)}>Yes</button>
              </div>
            </div>}
          {loading &&
            <>
              <div className='flex items-center justify-center animate-pulse w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              </div>
              <div className='flex items-center justify-center animate-pulse w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              </div>
              <div className='flex items-center justify-center animate-pulse w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              </div>
              <div className='flex items-center justify-center animate-pulse w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              </div>
              <div className='flex items-center justify-center animate-pulse w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              </div>
              <div className='flex items-center justify-center animate-pulse w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              </div>
              <div className='flex items-center justify-center animate-pulse w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              </div>
              <div className='flex items-center justify-center animate-pulse w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              </div>
              <div className='hidden lg:flex items-center justify-center animate-pulse w-[48%] lg:w-[30%] border dark:border-0 h-[230px] bg-white shadow dark:bg-slate-800 rounded-md overflow-hidden'>
              </div>
            </>
          }
          {!loading && posts.length < 1 &&
            <div className=' w-full p-5 dark:text-slate-300 text-center'>
              <FontAwesomeIcon className=' px-2' icon={faFaceSadTear} />
              No Contributions made yet! Please contribute to help others and track your
              contributions here.
            </div>
          }
        </div>
      </div>
      <Toaster />
      <Navigations />
    </div>
  )
}

export default Contributions
