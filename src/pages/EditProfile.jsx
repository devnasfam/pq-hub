import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDoubleRight, faAngleRight, faArrowLeft, faBoltLightning, faBook, faBookmark, faCamera, faComputer, faGraduationCap, faLevelUp, faLightbulb, faMoon, faPen, faPencil, faSchool, faSignOut, faSquareShareNodes, faSun, faToggleOff, faToggleOn, faUser, faUserEdit, faUserGraduate } from '@fortawesome/free-solid-svg-icons'
import bgprofile from '../assets/edu.jpg'
import fresh from '../assets/user.png'
import useCheckAuth from './customHooks/useCheckAuth'
import { MyAppContext } from '../AppContext/MyContext'
import { signOut } from 'firebase/auth'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db, storage } from '../firebase/firebaseService'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'

const EditProfile = () => {

    const { user, setUser } = useContext(MyAppContext);
    const [userData, setUserdata] = useState([]);
    const [loading, setLoad] = useState(true)
    const [profilePic, setProfilePic] = useState('');
    const [selectedPhoto, setSelectedPic] = useState(null);
    const [progress, setProgress] = useState(0)
    const [msg, setMsg] = useState('')
    const [showprogress, setShowprogress] = useState(false)

    useLayoutEffect(() => {
        window.scrollTo(0, 0); // Reset scroll position to top when the pathname changes
    }, []);

    useEffect(() => {
        document.title = 'Edit Profile'
        const fetchUserData = async () => {
            try {
                const userRef = doc(db, "Users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserdata(userSnap.data())
                    setLoad(false)
                } else {
                    setUserdata(null);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchUserData();
    }, [document.title])

    useCheckAuth()


    const HandleChangePic = (e) => {
        const photo = e.target.files[0];
        if (photo) {
            const imgUrl = URL.createObjectURL(photo);
            setProfilePic(imgUrl); // Show the new image immediately
            setSelectedPic(photo);
            setShowprogress(true)
            const storageRef = ref(storage, `profilePictures/${userData.username}/${photo.name}`);
            const uploadTask = uploadBytesResumable(storageRef, photo);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progr = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progr);
                },
                (error) => {
                    console.log(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        const userDocRef = doc(db, 'Users', user.uid);
                        // Update the profile picture URL in the local state and database
                        setProfilePic(downloadURL); // Update the local state immediately
                        await updateDoc(userDocRef, {
                            profilePicture: downloadURL,
                        });
                        setMsg('Updated!')
                        setTimeout(() => {
                            setMsg('')
                        }, 1000)
                        setShowprogress(false)
                    } catch (error) {
                        console.log(error);
                    }
                }
            );
        }
    };



    return (
        <div className='bg-sky-50 dark:bg-slate-950 w-full sm:pb-[85px] pb-4 md:pb-0 md:pl-[140px] pt-[77px]'>
            <TopNav name={
                <>
                    <div className=' w-full flex items-center justify-between'>
                        <div className='flex items-center justify-center'>
                            <Link to='/profile'>
                                <FontAwesomeIcon icon={faArrowLeft} className='mr-5 cursor-pointer p-2' />
                            </Link>
                            <FontAwesomeIcon icon={faUserEdit} />
                            <h2 className='text-lgtext-white ml-3 font-medium'>Personal Info</h2>
                        </div>
                        {/* <button className='p-2 bg-blue-500 text-white rounded-md text-sm md:hidden'>Save Changes</button> */}
                    </div>
                </>
            } />
            <div className=' w-full flex items-center justify-start flex-col text-slate-700 dark:text-slate-200  md:pl-20 select-none md:mt-3'>

                <div className=' w-full md:w-[85%] lg:w-[68.5%] h-auto flex items-center justify-center md:justify-start flex-col md:flex-row bg-slate-900 md:rounded-xl'>
                    <div className=' relative w-full h-full flex items-center justify-center md:justify-start flex-col md:flex-row p-5 md:rounded-md '>
                        <div className='bg-blue-500 shadow-xl blur-xl shadow-purple-500 w-[120px] h-[120px] rounded-full z-0 absolute top-[45px] md:top-2 right-5' />
                        <div className='bg-pink-500 shadow-2xl blur-xl shadow-blue-500 w-[100px] h-[100px] rounded-full z-0 absolute bottom-[95px] lg:bottom-5 left-10' />
                        <div className=' z-10 relative shrink-0'>
                            <img src={profilePic || userData.profilePicture || fresh} className=' mt-3 md:mt-0 w-28 h-28 object-cover rounded-full shrink-0 border-[5px] border-blue-500 dark:border-slate-700' />
                            <label htmlFor="pic">
                                <FontAwesomeIcon icon={faCamera} className=' text-slate-100 cursor-pointer absolute right-0 bottom-0 p-3 bg-blue-500 dark:bg-slate-700 rounded-full' />
                                <input type="file" onChange={HandleChangePic} accept='image/*' className='hidden' id='pic' />
                            </label>
                        </div>
                        <div className=' z-10 w-full flex items-center justify-center md:justify-start mt-3'>


                            <div className=' w-[50%] px-5'>
                                {!showprogress && <div className='w-full bg-green-600 rounded-full text-center'>{msg}</div>}
                                <progress value={progress} max='100' className={`upload-progress ${showprogress ? 'block' : 'hidden'}`}></progress>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=' z-10 w-full pb-16 overflow-auto h-auto flex items-center justify-center p-3'>
                    <div className=' w-[95%] sm:w-[85%] md:w-[87%] lg:w-[70%] h-auto bg-sky-100 shadow-md dark:bg-slate-900 rounded-lg'>
                        <div className='w-full h-auto p-4 pb-2 border-b-slate-500 border-b-[.2px] flex items-center justify-center'>
                            <div className=' flex items-start justify-center flex-col'>
                                <div className='text-slate-700 dark:text-slate-300'>Full Name</div>
                                <input type="text" value={userData.fullName} readOnly className='w-auto p-2 text-slate-500 dark:text-slate-400 bg-transparent text-left pl-0 outline-none text-sm' />
                            </div>
                            <div className=' w-full flex items-center justify-end'>
                                {/* <FontAwesomeIcon icon={faPen} className=' p-2 cursor-pointer -mb-3' /> */}
                            </div>
                        </div>
                        <div className='w-full h-auto p-4 pb-2 border-b-slate-500 border-b-[.2px] flex items-center justify-center'>
                            <div className=' flex items-start justify-center flex-col'>
                                <div className='text-slate-700 dark:text-slate-300'>Username</div>
                                <input type="text" value={userData.username} readOnly className='w-auto p-2 text-slate-500 dark:text-slate-400 bg-transparent text-left pl-0 outline-none text-sm' />
                            </div>
                            <div className=' w-full flex items-center justify-end'>
                                {/* <FontAwesomeIcon icon={faPen} className=' p-2 cursor-pointer -mb-3' /> */}
                            </div>
                        </div>
                        <div className='w-full h-auto p-4 pb-2 border-b-slate-500 border-b-[.2px] flex items-center justify-center'>
                            <div className=' flex items-start justify-center flex-col'>
                                <div className='text-slate-700 dark:text-slate-300'>Email Adress</div>
                                <input type="text" value={userData.email} readOnly className='w-auto p-2 text-slate-500 dark:text-slate-400 bg-transparent text-left pl-0 outline-none text-sm px-10' />
                            </div>
                            <div className=' w-full flex items-center justify-end'>
                                {/* <FontAwesomeIcon icon={faPen} className=' p-2 cursor-pointer -mb-3' /> */}
                            </div>
                        </div>
                        <div className='w-full h-auto p-4 pb-2 border-b-slate-500 border-b-[.2px] flex items-center justify-center'>
                            <div className=' flex items-start justify-center flex-col'>
                                <div className='text-slate-700 dark:text-slate-300'>Admission Number</div>
                                <input type="text" value={userData.admNumber} readOnly className='w-auto p-2 text-slate-500 dark:text-slate-400 bg-transparent text-left pl-0 outline-none text-sm' />
                            </div>
                            <div className=' w-full flex items-center justify-end'>
                                {/* <FontAwesomeIcon icon={faPen} className=' p-2 cursor-pointer -mb-3' /> */}
                            </div>
                        </div>
                        <div className='w-full h-auto p-4 pb-2  flex items-center justify-center'>
                            <div className=' flex items-start justify-center flex-col'>
                                <div className='text-slate-700 dark:text-slate-300'>Department</div>
                                <input type="text" value={userData.department} readOnly className='w-auto p-2 text-slate-500 dark:text-slate-400 bg-transparent text-left pl-0 outline-none text-sm' />
                            </div>
                            <div className=' w-full flex items-center justify-end'>
                                {/* <FontAwesomeIcon icon={faPen} className=' p-2 cursor-pointer -mb-3' /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Navigations />
        </div>
    )
}

export default EditProfile
