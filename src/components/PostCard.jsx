import React, { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight, faBookOpen, faDownload, faHeart, faShare } from '@fortawesome/free-solid-svg-icons'
import fresh from '../assets/user.png'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/firebaseService'
import { MyAppContext } from '../AppContext/MyContext'
import { faBookmark, faClock } from '@fortawesome/free-regular-svg-icons'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Tooltip from '@mui/material/Tooltip'
import moment from 'moment'

const PostCard = ({ post }) => {

  const { user } = useContext(MyAppContext)
  const [isLiked, setIsliked] = useState(false)
  const [imgSlideCount, setImgSideCount] = useState(0)
  const { createdAt, examType, examYear, images, usersLiked, DocId, userId } = post
  const [userData, setUserdata] = useState([]);
  const [isbookMark, setIsBookmark] = useState(false);
  const [isHeart, setisHeart] = useState(false)
  const [localLikeCount, setLocalLikeCount] = useState(usersLiked?.length || 0);

  useEffect(() => {
    const checkUserLiked = async () => {
      try {
        const currentUserID = user.uid;
        const postRef = doc(db, 'Posts', DocId);
        const postSnapshot = await getDoc(postRef);

        if (postSnapshot.exists()) {
          const postData = postSnapshot.data();
          const usersLiked = postData.usersLiked || [];
          const userAlreadyLiked = usersLiked.includes(currentUserID);
          setIsliked(userAlreadyLiked);
        }
      } catch (error) {
        console.error('Error checking user liked:', error);
      }
    };

    const checkIsbookMark = async () => {
      try {
        const currentUserID = user.uid;
        const userRef = doc(db, 'Users', currentUserID);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const bookMarks = userData.bookMarks || [];
          const docAlreadyBookMarked = bookMarks.includes(DocId);
          setIsBookmark(docAlreadyBookMarked);
        }
      } catch (error) {
        console.error('Error checking user liked:', error);
      }
    };
    checkIsbookMark()
    checkUserLiked();
  }, [DocId, userId, isLiked]);

  const handleLike = async () => {
    const postRef = doc(db, 'Posts', DocId);
    const currentUserID = user.uid;
    try {
      // Update local like count immediately
      if (!isLiked) {
        setLocalLikeCount(localLikeCount + 1);
      } else {
        setLocalLikeCount(localLikeCount - 1);
      }

      // Toggle like status
      setIsliked(!isLiked);

      if (!isLiked) {
        await updateDoc(postRef, { usersLiked: arrayUnion(currentUserID) });
      } else {
        await updateDoc(postRef, { usersLiked: arrayRemove(currentUserID) });
      }
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  };

  let HandleDoubleTapLike = async () => {
    const postRef = doc(db, 'Posts', DocId);
    const currentUserID = user.uid;

    try {
      // Update local like count immediately
      if (!isLiked) {
        setLocalLikeCount(localLikeCount + 1);
      }
      // Toggle like status      
      setIsliked(true);
      setisHeart(true)
      setTimeout(() => {
        setisHeart(false)
      }, 1000);

      if (!isLiked) {
        await updateDoc(postRef, { usersLiked: arrayUnion(currentUserID) });
      }
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  }

  const HandleNext = () => {
    const calc = (imgSlideCount + 1) % images.length
    setImgSideCount(calc)
  }
  const HandlePrev = () => {
    const calc = (imgSlideCount - 1 + images.length) % images.length
    setImgSideCount(calc)
  }
  //bookmark select
  const bookMark = async () => {
    setIsBookmark((prev) => !prev);
    try {
      const userRef = doc(db, 'Users', user && user.uid);
      if (!isbookMark) {
        toast.success('Saved in bookmarks!', {
          duration: 2000,
        })
        await updateDoc(userRef, {
          bookMarks: arrayUnion(DocId)
        })
      } else {
        toast.error('Removed from bookmarks!', {
          duration: 2000,
        })
        await updateDoc(userRef, {
          bookMarks: arrayRemove(DocId)
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "Users", userId);
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
  }, [userId])

  const handleDownload = () => {
    if (images.length > 0 && imgSlideCount >= 0 && imgSlideCount < images.length) {
      // Create a blob from the image data
      const blob = new Blob([images[imgSlideCount]]);

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `image_${imgSlideCount}.jpg`; // Specify the filename for download

      // Programmatically trigger the click
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <>
      {userData && userData !== null &&
        <div className=' select-none w-[100%] sm:w-[75%] md:w-[85%] lg:w-[40%] xl:w-[35%]  2xl:w-[25%] h-full rounded-lg flex items-center justify-between gap-1 bg-white dark:bg-slate-800 overflow-hidden shadow-[0px_4px_3px_rgba(0,0,0,.07)] mt-2'>
          {/* Post Details  */}
          <div className='w-full h-full flex items-center justify-center flex-col py-2'>
            {/* User details  */}
            <div className='w-full h-auto flex items-center justify-center px-[2px]'>
              <div className='w-full h-auto flex items-center justify-start'>
                {/* Profile Icon  */}
                <Link className=' p-1 w-auto h-auto shrink-0 ml-2' to={`/${userData.username}`}>
                  <img src={userData.profilePicture || fresh} alt={`${userData.username}'s Profile Picture`} loading='lazy' className='w-[42px] h-[42px] rounded-full shrink-0 object-cover'></img>
                </Link>
                <div className=' w-full flex items-start justify-center flex-col'>
                  <Link to={`/${userData.username}`} className='w-auto flex items-center gap-x-1 justify-center h-auto p-1 text-slate-700 dark:text-slate-300 pb-0'>
                    {userData.username} {userData.isVerified && <span className="material-symbols-outlined text-lg bg-white rounded-full w-3 h-3 flex items-center justify-center text-blue-500">
                      verified
                    </span>}
                  </Link>
                  <div className='text-xs flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 ml-2'>
                    <FontAwesomeIcon icon={faClock} />
                    {moment(createdAt.toDate()).fromNow()}
                  </div>
                </div>
              </div>
            </div>
            {/* Type Details  */}
            <div className='w-full text-base font-medium px-4 py-2 text-slate-600 dark:text-slate-300 md:text-base flex items-center justify-start gap-x-1.5 ml-5'>
              <FontAwesomeIcon icon={faBookOpen} />
              {`${examType} - ${examYear}`}
            </div>
            {/* Post Images  */}
            <div className='w-full relative border-y-[0.05px] border-y-slate-200 dark:border-y-slate-500'>
              <div className={`${isHeart ? ' scale-100 ' : ' scale-0'} duration-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
                <FontAwesomeIcon className=' text-7xl text-red-500' icon={faHeart} />
              </div>
              <img src={images[imgSlideCount]} alt={`${examType} - ${examYear}`} onDoubleClick={HandleDoubleTapLike} loading='lazy' className='w-full h-[350px] transition-all duration-300 object-cover' />
              {images.length > 1 && <div className=' w-8 h-8 absolute top-0 right-0 p-3 bg-[rgba(0,0,0,.4)] text-white rounded-full text-xs flex items-center justify-center m-1'>{`${imgSlideCount + 1}/${images.length}`}</div>}
              {images.length > 1 && <FontAwesomeIcon icon={faAngleLeft} onClick={HandlePrev} className='absolute top-[50%] left-1 p-2 w-4 h-4 rounded-full text-white bg-[rgba(0,0,0,.3)] cursor-pointer' />}
              {images.length > 1 && <FontAwesomeIcon icon={faAngleRight} onClick={HandleNext} className='absolute top-[50%] right-1 p-2 w-4 h-4 rounded-full text-white bg-[rgba(0,0,0,.3)] cursor-pointer' />}
            </div>
            {/* Post Likes, Views, Download  */}
            <div className='w-full h-auto p-1 text-slate-500 dark:text-slate-300 flex items-center justify-between mt-2'>
              {/* Likes  */}
              <div className='w-full flex items-center justify-start pl-5 gap-2'>
                <div onClick={handleLike} className='flex items-center justify-center  cursor-pointer p-2 py-1 gap-1'>
                  <Tooltip title='like' arrow enterDelay={400}>
                    <FontAwesomeIcon style={{ color: `${!isLiked ? 'gray' : 'red'}` }} className='text-xl' icon={faHeart} />
                  </Tooltip>
                  <h2 className=' text-md'>{localLikeCount} {localLikeCount > 1 ? 'likes' : 'like'}</h2>
                </div>
              </div>
              {/* Download  */}
              {user &&
              <div className=' w-full flex items-center justify-end gap-x-2 p-3'>
                <Tooltip title='Download' arrow enterDelay={400}>
                  <FontAwesomeIcon onClick={handleDownload} className=' p-2 -mb-1 cursor-pointer' icon={faDownload} />
                </Tooltip>
                <Tooltip title='Save to bookmarks' arrow enterDelay={400}>
                  <FontAwesomeIcon onClick={bookMark} className={`${isbookMark ? ' bg-slate-800 text-slate-100 dark:bg-white dark:text-slate-700' : ''} rounded-md py-1.5 p-2 cursor-pointer`} icon={faBookmark} />
                </Tooltip>
                <Tooltip title='Share' arrow enterDelay={400}>
                  <FontAwesomeIcon className=' p-2 cursor-pointer' icon={faShare} />
                </Tooltip>
              </div>
              // :
              //  <div className=' p-1 flex items-center justify-center gap-1'>
              //   <Link className=' text-slate-50 p-1 px-3 bg-blue-500 rounded-xl text-sm truncate' to={`/login`}>Login</Link>
              //   <Link className=' text-slate-50 p-1 px-3 bg-blue-500 rounded-xl text-sm truncate' to={`/signup`}>Sign Up</Link>
              //  </div>
              }
            </div>
          </div>
        </div>}
    </>
  )
}

export default PostCard
