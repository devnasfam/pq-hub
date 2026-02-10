import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faImage, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase/firebaseService'
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { MyAppContext } from '../AppContext/MyContext'
import toast, { Toaster } from 'react-hot-toast'
import Select from 'react-select'
import { Year } from '../examtypes'

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
  const { user } = useContext(MyAppContext)
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const HandleFileUpload = (e) => {
    const files = e.target.files;
    if (files.length < 1 || files.length > 4) {
      setError(true);
      setSuccess(false);
      setErrorMsg('Please select between 1 to 4 images');
      toast.error('Please select between 1 to 4 images');
      setPqpic([]);
    } else {
      setPqpic(Array.from(files));
      setError(false);
      setErrorMsg('');
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

      const digit = examType?.slice(3, 4)
      if (digit === '1') calculatedLevel = '100L';
      else if (digit === '2') calculatedLevel = '200L';
      else if (digit === '3') calculatedLevel = '300L';
      else if (digit === '4') calculatedLevel = '400L';
      else if (digit === '5') calculatedLevel = '500L';
      else if (digit === '6') calculatedLevel = '600L';

      const docRef = await addDoc(postRef, {
        examType,
        examYear,
        images: imageUrls,
        userId: user.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        userName: userData.username,
        profilePicture: userData.profilePicture,
        isPrivate: true,
        level: calculatedLevel,
      });
      await updateDoc(docRef, { DocId: docRef.id })
    } catch (error) {
      toast.error(error.message)
    }
  };

  const HandleSubmitPassQ = async () => {
    if (!examSelect || !yearSelect || !pqpic || pqpic.length === 0) {
      toast.error('Please fill all fields and upload past question image(s)')
      return;
    }

    const courseCode = examSelect.value;
    const validFormat = /^[A-Z]{3}[1-6][0-9]{2}$/;
    if (!validFormat.test(courseCode)) {
      toast.error('Invalid course code. Use format like CSC101, MAT202.');
      return;
    }

    setIsUploading(true);
    const loadToast = toast.loading('Uploading post...');

    try {
      const userExistingPosts = await getUserPostsByCriteria(courseCode, yearSelect.value);
      if (userExistingPosts.length > 0) {
        toast.error('This past question already exists, upload another', { id: loadToast });
        setIsUploading(false);
        return;
      }

      const existingPosts = await getPostsByCriteria(courseCode, yearSelect.value);
      if (existingPosts.length >= 2) {
        toast.error('This course already has enough posts.', { id: loadToast });
        setIsUploading(false);
        return;
      }

      const imageUrls = await uploadImagesToStorage(pqpic, userData.username);
      await createPostInFirestore(courseCode, '', yearSelect.value, imageUrls, userData.username);

      toast.success('Your post has been submitted successfully 🎉', { id: loadToast });
      setTimeout(() => navigate('/profile/my-contributions'), 3000);
    } catch (error) {
      toast.error('Error: ' + error.message, { id: loadToast });
    }

    setIsUploading(false);
    setExamSelect(null);
    setYearSelect(null);
    setPqpic([]);
    setFilecount(false);
  };

  const getUserPostsByCriteria = async (examType, examYear) => {
    const userPostsCollection = collection(db, 'Posts');
    const q = query(userPostsCollection,
      where("userId", "==", user.uid),
      where("examType", "==", examType),
      where("examYear", "==", examYear)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  };

  const getPostsByCriteria = async (examType, examYear) => {
    const postsCollection = collection(db, 'Posts');
    const q = query(postsCollection,
      where("examType", "==", examType),
      where("examYear", "==", examYear)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  };

  useEffect(() => {
    document.title = 'Contribute';
    const fetchUserData = async () => {
      if (!user) return;
      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserdata(userSnap.data())
      }
    }
    fetchUserData();
  }, [user]);

  return (
    <div className='bg-sky-50 h-auto dark:bg-slate-950 w-full lg:py-0'>
      <div className='w-full flex items-center justify-center bg-blue-500 dark:bg-[rgba(30,41,59,.85)] z-20 p-5'>
        <div className=' w-[95%] sm:w-[85%] md:w-[75%] lg:w-[45%] flex items-center justify-center'>
          <Link to='/feed' className=' dark:text-slate-100 text-slate-100'>
            <FontAwesomeIcon className=' mr-3 text-md' icon={faArrowLeft} />
          </Link>
          <div className=' w-full text-slate-50 dark:text-slate-200 font-semibold tracking-wide'>
            Contribute to help students
          </div>
        </div>
      </div>

      <div className=' w-full h-auto flex items-center justify-center py-9'>
        <div className=' w-[90%] sm:w-[80%]  md:w-[70%]  lg:w-[43%] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-xl'>

          <div className='text-slate-700 shadow bg-blue-100 dark:bg-red-200 rounded-md p-3 dark:text-slate-700 my-2'>
            <FontAwesomeIcon icon={faInfoCircle} className=' pr-1' />
            Contribute wisely! Upload only past question images. Any other images will be removed. You earn 20 points per post which can be <Link to='/rewards' className='text-blue-500'>redeemed</Link> for airtime.
          </div>

          <div className=' p-1.5 font-medium text-slate-600 dark:text-slate-200'>Course Code</div>
          <input
            type="text"
            value={examSelect ? examSelect.value : ''}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              const regex = /^[A-Z]{0,3}[0-9]{0,3}$/;
              if (val.length <= 6 && regex.test(val)) {
                setExamSelect({ value: val });
              }
            }}
            onBlur={() => {
              const value = examSelect?.value || '';
              const validFormat = /^[A-Z]{3}[1-6][0-9]{2}$/;
              if (!validFormat.test(value)) {
                setExamSelect(null);
                toast.error('Invalid course code. Example: CSC101');
              }
            }}
            maxLength={6}
            placeholder="e.g. CSC101"
            className='w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring focus:border-blue-400 uppercase'
          />

          <p className='text-sm text-slate-500 mt-1'>
            Must be 3 letters + 3 digits (e.g. CSC101)
          </p>

          <div className='mt-3 p-1.5 font-medium text-slate-600 dark:text-slate-200'>Select Session</div>
          <Select
            options={Year}
            value={yearSelect}
            onChange={(sel) => setYearSelect(sel)}
          />

          <div className=' mt-3 p-1.5 font-medium text-slate-600 dark:text-slate-200'>Upload Past Question</div>
          <label htmlFor="pastq" className=' select-none'>
            <div className=' w-full cursor-pointer'>
              <FontAwesomeIcon icon={faImage} className='p-2 ml-3 text-[35px] text-slate-600 dark:text-slate-200' />
            </div>
            <input type="file" id='pastq' onChange={HandleFileUpload} accept='image/*' className='hidden' multiple />
          </label>

          {fileCount && (
            <div className=' text-slate-500 dark:text-slate-300 w-full flex items-center justify-center text-sm'>
              {fileCountMsg}
            </div>
          )}

          <div className=' w-full px-4'>
            <button onClick={HandleSubmitPassQ} disabled={isUploading} className='font-medium w-full bg-blue-500 text-slate-50 p-2 rounded-xl my-2'>
              {isUploading ? 'Uploading...' : 'Post Past Question'}
            </button>
          </div>

        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default Contribue
