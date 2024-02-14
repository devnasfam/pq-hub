import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faImage, faImagePortrait, faInfo, faInfoCircle, faPhotoFilm, faPhotoVideo, faSquareShareNodes } from '@fortawesome/free-solid-svg-icons'
import useCheckAuth from './customHooks/useCheckAuth'
import Select from 'react-select'
import { examTypes, Year } from '../examtypes'
import { Link } from 'react-router-dom'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase/firebaseService'
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { MyAppContext } from '../AppContext/MyContext'

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
      throw error;
    }
  };

  const HandleSubmitPassQ = async () => {
    if (!examSelect || !yearSelect || !pqpic || pqpic.length === 0) {
      setError(true);
      setErrorMsg('Please select exam type, year, and file(s)');
      setFilecount(false)
      setSuccess(false);
      return;
    }

    setError(false);
    setErrorMsg('');
    setIsUploading(true);

    try {
      const imageUrls = await uploadImagesToStorage(pqpic, userData.username);
      const level = '';

      await createPostInFirestore(examSelect.value, level, yearSelect.value, imageUrls, userData.username);

      setSuccess(true);
      setIsUploading(false);
      setFilecount(false)
      // console.log('Images uploaded and post created successfully!');
      setExamSelect(null);
      setYearSelect(null);
      setPqpic([]);
    } catch (error) {
      setError(true);
      setFilecount(false)
      setErrorMsg('Error uploading images or creating post' + error);
      setIsUploading(false);
      // console.error('Error handling post upload:', error);
      // Handle errors
    }
  };

  useEffect(() => {
    document.title = 'Contribute'
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
    fetchUserData();
  }, [document.title, user])
  return (
    <div className='bg-sky-50 min-h-screen dark:bg-slate-950 w-full pt-[40px] lg:py-0'>
      <div className='w-full flex items-center justify-center bg-blue-500 dark:bg-[rgba(30,41,59,.85)] fixed top-0 right-0 z-30 backdrop-blur-md p-5'>
        <div className=' w-[95%] sm:w-[85%] md:w-[75%] lg:w-[45%] flex items-center justify-center'>
          <Link to='/feed' className=' p-1 dark:text-slate-100 text-slate-100'>
            <FontAwesomeIcon className=' mr-3 text-md' icon={faArrowLeft} />
          </Link>
          <div className=' w-full text-slate-50 dark:text-slate-200 font-semibold tracking-wide'>
            Contribute to help students
          </div>
        </div>
      </div>
      <div className=' w-full min-h-screen flex items-center justify-center'>
        <div className=' w-[90%] sm:w-[80%]  md:w-[70%]  lg:w-[43%] h-auto border border-slate-200 dark:border-slate-700 bg-white shadow-xl dark:bg-slate-800 p-4 rounded-xl'>

          <div className=' font-medium text-slate-600 shadow bg-blue-100 dark:bg-red-200 rounded-md p-3 dark:text-slate-700 my-2'>
            <FontAwesomeIcon icon={faInfoCircle} className=' pr-1' />
            Contribute wisely! Choose the right exam type, year and upload past question images only. Other images will be deleted by admins.
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
          {error &&
            <div className=' text-red-500 w-full flex items-center justify-center text-sm'>{errorMsg}</div>
          }
          {fileCount &&
            <div className=' text-slate-500 dark:text-slate-300 w-full flex items-center justify-center text-sm'>{fileCountMsg}</div>
          }
          {success &&
            <div className=' p-2 px-[35px] text-green-500 mx-auto w-full flex items-center justify-center text-sm'>
              <h2>Congratulations! Your contribution has been successfully submitted. You can track the review
              progress on your profile under My Contributions. keep contributing to empower others.</h2>
            </div>
          }
          <div className=' w-full px-4'>
            <button onClick={HandleSubmitPassQ} disabled={isUploading} className=' font-medium w-full mx-auto bg-blue-500 text-slate-50 p-2 rounded-xl my-2'>
              {isUploading ? 'Uploading...' : 'Post Past Question'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contribue
