import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faImage, faImagePortrait, faInfo, faInfoCircle, faPhotoFilm, faPhotoVideo, faSquareShareNodes } from '@fortawesome/free-solid-svg-icons'
import useCheckAuth from './customHooks/useCheckAuth'
import Select from 'react-select'
import { examTypes, Year } from '../examtypes'
import { Link, useNavigate } from 'react-router-dom'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase/firebaseService'
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { MyAppContext } from '../AppContext/MyContext'
import toast, { Toaster } from 'react-hot-toast'

const Contribue = () => {

  const [examSelect, setExamSelect] = useState(null)
  const [yearSelect, setYearSelect] = useState(null)
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [fileCount, setFilecount] = useState(false)
  const [fileCountMsg, setFilecountMsg] = useState('')
  const [pqpic, setPqpic] = useState(null)
  const [isUploading, setIsUploading] = useState(false);
  const [userData, setUserdata] = useState([]);
  const { user, setUser } = useContext(MyAppContext)
  const navigate = useNavigate();
  // useCheckAuth()

  useLayoutEffect(() => {
    window.scrollTo(0, 0); // Reset scroll position to top when the pathname changes
  }, []);


  const HandleFileUpload = (e) => {
    const files = e.target.files;
    if (files.length < 1 || files.length > 4) {
      setError(true);
      setSuccess(false);
      setErrorMsg('Please select between 1 to 4 images');
      toast.error('Please select between 1 to 4 images', { duration: 2000 })
      setPqpic([]);
    } else {
      setPqpic(Array.from(files));
      setError(false);
      setErrorMsg('');
      const fileInfo = Array.from(files)
        .map((file) => `${file.name}`)
        .join(', ');
      setFilecount(true)
      setSuccess(false);
      setFilecountMsg(`(${files.length}) files selected`)
    }
  };

  const uploadImagesToStorage = async (images, username) => {
    const imageUrls = [];

    for (const image of images) {
      const storageRef = ref(storage, `posts/${username}/${image.name}`);
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);
      imageUrls.push(downloadURL);
    }

    return imageUrls;
  };


  const createPostInFirestore = async (examType, level, examYear, imageUrls, username) => {
    try {
      const postRef = collection(db, 'Posts');
      let calculatedLevel = '';

      if (examType.slice(3, 4) === '1') {
        calculatedLevel = '100L';
      } else if (examType.slice(3, 4) === '2') {
        calculatedLevel = '200L';
      } else if (examType.slice(3, 4) === '3') {
        calculatedLevel = '300L';
      } else if (examType.slice(3, 4) === '4') {
        calculatedLevel = '400L';
      } else if (examType.slice(3, 4) === '5') {
        calculatedLevel = '500L';
      } else if (examType.slice(3, 4) === '6') {
        calculatedLevel = '600L';
      } else {
        calculatedLevel = '';
      }

      const docRef = await addDoc(postRef, {
        examType: examType,
        examYear: examYear,
        images: imageUrls,
        userId: user.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        userName: userData.username,
        profilePicture: userData.profilePicture,
        isPrivate: true,
        level: calculatedLevel,
      });
      const docId = docRef.id;
      await updateDoc(docRef, { DocId: docId })
      // console.log('Post created in Firestore successfully!');
    } catch (error) {
      // console.error('Error creating post:', error);
      toast.error(error.message, { duration: 2000 })
    }
  };

  const HandleSubmitPassQ = async () => {
    if (!examSelect || !yearSelect || !pqpic || pqpic.length === 0) {
        setError(true);
        setErrorMsg('Please select exam type, year, and file(s)');
        toast.error('Please select exam type, year, and file(s)', { duration: 2000 });
        setFilecount(false);
        setSuccess(false);
        return;
    }

    setError(false);
    setErrorMsg('');
    setIsUploading(true);
    const loadToast = toast.loading('Uploading post...');

    try {
        // Check if the user has already posted a past question with the same examType and examYear
        const userExistingPosts = await getUserPostsByCriteria(examSelect.value, yearSelect.value);
        if (userExistingPosts.length > 0) {
            setError(true);
            setErrorMsg('You\'ve already posted this past question. Please post a different one.');
            toast.error('You\'ve already posted this past question. Please post a different one.', { duration: 5000, id: loadToast });
            setIsUploading(false);
            return;
        }

        // Check if there are already two past questions with the same examType and examYear
        const existingPosts = await getPostsByCriteria(examSelect.value, yearSelect.value);
        if (existingPosts.length >= 2) {
            setError(true);
            setErrorMsg('This past question has already been posted by other users. Please choose a different one.');
            toast.error('This past question has already been posted by other users. Please choose a different one.', { duration: 5000, id: loadToast });
            setIsUploading(false);
            return;
        }

        const imageUrls = await uploadImagesToStorage(pqpic, userData.username);
        const level = '';

        await createPostInFirestore(examSelect.value, level, yearSelect.value, imageUrls, userData.username);

        setSuccess(true);
        toast.success('Woohoo!🤸‍♀️ Your post has been submitted. Thanks for helping others. Once your post is approved, you will earn 40 points.', { duration: 5000, id: loadToast })
        setIsUploading(false);
        setFilecount(false);
        setExamSelect(null);
        setYearSelect(null);
        setPqpic([]);
        setTimeout(() => {
            navigate('/profile/my-contributions');
        }, 5500);
    } catch (error) {
        setError(true);
        setFilecount(false);
        setErrorMsg('Error uploading images or creating post' + error);
        setIsUploading(false);
        if (error.code === 'auth/network-request-failed') {
            toast.error('Network error', { duration: 2000, id: loadToast });
        } else {
            toast.error('Error uploading images: ' + error.message, { duration: 2000, id: loadToast });
        }
    }
};


// Function to retrieve user's posts by specific examType and examYear criteria
const getUserPostsByCriteria = async (examType, examYear) => {
  try {
      const userPostsCollection = collection(db, 'Posts');
      const userFiltered = query(userPostsCollection, where("userId", "==", user.uid));
      const userFilteredPosts1 = query(userFiltered, where("examYear", "==", examYear));
      const userFilteredPosts = query(userFilteredPosts1, where("examType", "==", examType));
      const snapshot = await getDocs(userFilteredPosts);
      return snapshot.docs.map(doc => doc.data());
  } catch (error) {
      console.error('Error fetching user posts by criteria:', error);
      return [];
  }
};

// Function to retrieve all posts by specific examType and examYear criteria
const getPostsByCriteria = async (examType, examYear) => {
  try {
      const postsCollection = collection(db, 'Posts');
      const filteredPosts1 = query(postsCollection, where("examType", "==", examType));
      const filteredPosts = query(filteredPosts1, where("examYear", "==", examYear));
      const snapshot = await getDocs(filteredPosts);
      return snapshot.docs.map(doc => doc.data());
  } catch (error) {
      console.error('Error fetching posts by criteria:', error);
      return [];
  }
};





  useEffect(() => {
    document.title = 'Contribute'
    const fetchUserData = async () => {
      try {
        if(!user) return;
        const userRef = doc(db, "Users", user && user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserdata(userSnap.data())
        } else {
          setUserdata(null);
        }
      } catch (error) {
        console.log(error)
        // toast.error(error.message,{duration:2000})
      }
    }
    fetchUserData();
  }, [document.title, user])
  return (
    <div className='bg-sky-50 h-auto dark:bg-slate-950 w-full lg:py-0'>
      <div className='w-full flex items-center justify-center bg-blue-500 dark:bg-[rgba(30,41,59,.85)] z-20 backdrop-blur-md p-5'>
        <div className=' w-[95%] sm:w-[85%] md:w-[75%] lg:w-[45%] flex items-center justify-center'>
          <Link to='/feed' className=' dark:text-slate-100 text-slate-100'>
            <FontAwesomeIcon className=' mr-3 text-md' icon={faArrowLeft} />
          </Link>
          <div className=' w-full text-slate-50 dark:text-slate-200 font-semibold tracking-wide'>
            Contribute to help students
          </div>
        </div>
      </div>
      <div className=' w-full h-auto overflow-y-auto flex items-center justify-center py-9'>
        <div className=' w-[90%] sm:w-[80%]  md:w-[70%]  lg:w-[43%] h-auto border border-slate-200/70 dark:border-slate-700 bg-white shadow-xl dark:bg-slate-800 p-4 rounded-xl'>

          <div className=' text-slate-700 shadow bg-blue-100 dark:bg-red-200 rounded-md p-3 dark:text-slate-700 my-2'>
            <FontAwesomeIcon icon={faInfoCircle} className=' pr-1' />
             Contribute wisely! Upload only past question images. Any other images will be removed by admins. Additionally, for every past question you post, you earn 40 points, which can be <Link to='/rewards' className=' text-blue-500'>redeemed</Link> for airtime!
          </div>
          <div className=' p-1.5 font-medium text-slate-600 dark:text-slate-200'>Exam Type</div>
          <Select
            options={examTypes}
            value={examSelect}
            onChange={(sel) => setExamSelect(sel)}
          />
          <div className=' mt-3 p-1.5 font-medium text-slate-600 dark:text-slate-200'>Select Year</div>
          <Select
            options={Year}
            value={yearSelect}
            onChange={(sel) => setYearSelect(sel)}
          />
          <div className=' mt-3 p-1.5 font-medium text-slate-600 dark:text-slate-200'>Upload Past Question </div>
          <label htmlFor="pastq" className=' select-none'>
            <div className=' w-full cursor-pointer'>
              <FontAwesomeIcon icon={faImage} className='p-2 ml-3 text-[35px] text-slate-600 dark:text-slate-200' />
            </div>
            <input type="file" id='pastq' onChange={HandleFileUpload} accept='image/*' className='hidden' multiple />
          </label>
          {fileCount &&
            <div className=' text-slate-500 dark:text-slate-300 w-full flex items-center justify-center text-sm'>{fileCountMsg}</div>
          }
          <div className=' w-full px-4'>
            <button onClick={HandleSubmitPassQ} disabled={isUploading} className={`${isUploading ? ' cursor-not-allowed' : ' cursor-pointer'} font-medium w-full mx-auto bg-blue-500 text-slate-50 p-2 rounded-xl my-2`}>
              {isUploading ? 'Uploading...' : 'Post Past Question'}</button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default Contribue