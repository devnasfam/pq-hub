import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { CircularProgress, Tooltip } from '@mui/material'
import { faArrowLeft, faBookOpen, faCalendar, faFaceSadTear, faInfoCircle, faNavicon, faTimes, faUserCircle, faUserShield, faUsers } from '@fortawesome/free-solid-svg-icons'
import TopNav from '../components/TopNav'
import { MyAppContext } from '../AppContext/MyContext'
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase/firebaseService'
import useCheckAuth from './customHooks/useCheckAuth'
import AdminPostCard from '../components/AdminPostCard'
import toast, { Toaster } from 'react-hot-toast'

const Admin = () => {
    const { user } = useContext(MyAppContext);
    const [userData, setUserdata] = useState([]);
    const [annouceModal, setAnnouceModal] = useState(false);
    const [loading, setLoad] = useState(true)
    const [posts, setPosts] = useState([])
    const [annouceDetails, setAnnouceDetails] = useState({
        title: '',
        annoucement: '',
        date: ''
    })

    useLayoutEffect(() => {
        window.scrollTo(0, 0); // Reset scroll position to top when the pathname changes
    }, []);

    const handleChangeAnnouce = (e) => {
        const { name, value } = e.target;
        setAnnouceDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value
        }))
    }

    const fetchPosts = async () => {
        try {
            const postsRef = query(collection(db, 'Posts'), where('isPrivate', '==', true));
            let fetched = await getDocs(postsRef);
            let fetchedDocs = fetched.docs.map(doc => doc.data());
            fetchedDocs.sort((a, b) => b.createdAt - a.createdAt);
            fetchedDocs = fetchedDocs.filter(post => post?.isRejected == false || post.isRejected == null || post.isRejected == undefined)
            return fetchedDocs;
        } catch (error) {
            // console.error('Error fetching posts:', error);
            return [];
        }
    };

    useEffect(() => {
        document.title = 'Admin Panel'
        if (!user) return;
        const fetchUserData = async () => {
            try {
                const userRef = doc(db, "Users", user?.uid);
                const userSnap = await getDoc(userRef);
                const annouceRef = collection(db, 'Announcements');
                const annouceSnap = await getDocs(annouceRef);
        
                if (!annouceSnap.empty) {
                    const annouceDoc = annouceSnap.docs[0];
                    const annouceData = annouceDoc.data();
    
                    setAnnouceDetails({
                        title: annouceData.Heading,
                        annoucement: annouceData.Msg,
                        date: annouceData.Date
                    });
                    }
                if (userSnap.exists()) {
                    setUserdata(userSnap.data())
                    setLoad(false)
                } else {
                    setUserdata(null);
                }
            } catch (error) {
                // console.log(error)
            }
        }
        const getPosts = async () => {
            const posts = await fetchPosts();
            setPosts(posts);
        };
        getPosts();
        fetchUserData();
    }, [document.title, user, posts])

    const handleShowAnnouceModal = () => {
        if (loading) return;
        if (!user) {
            toast.error('You are not authorized to post announcement', { duration: 2000 })
        } else {
            if (!userData.isAdmin) {
                toast.error("You don't have admin permission to post announcement", { duration: 2000 })
                return;
            } else {
                setAnnouceModal(true)
            }
        }
    }

    const handleHideAnnouce = () => {
        setAnnouceModal(false)
    }

    const handlePostAnnouncement = async () => {
        if (!user) {
            toast.error('You are not authorized to post announcements. Please log in.', { duration: 2000 });
            return;
        }
        if (!userData.isAdmin) {
            toast.error("You don't have admin permission to post announcements", { duration: 2000 });
            return;
        }
        if (!annouceDetails.title) {
            toast.error('Please enter announcement title', { duration: 2000 });
            return;
        }
        if (!annouceDetails.annoucement) {
            toast.error('Please enter announcement body', { duration: 2000 });
            return;
        }
        if (!annouceDetails.date) {
            toast.error('Please enter announcement date', { duration: 2000 });
            return;
        }
    
        setAnnouceModal(false);
        const loadToast = toast.loading('Posting announcement...');
        try {
            const annouceRef = collection(db, 'Announcements');
            const annouceSnap = await getDocs(annouceRef);
    
            if (!annouceSnap.empty) {
                const annouceDoc = annouceSnap.docs[0];
                const annouceData = annouceDoc.data();

                setAnnouceDetails({
                    title: annouceData.Heading,
                    annoucement: annouceData.Msg,
                    date: annouceData.Date
                });
                await updateDoc(annouceDoc.ref, {
                    Title: annouceDetails.title,
                    Heading: annouceDetails.title,
                    Msg: annouceDetails.annoucement,
                    Date: new Date(annouceDetails.date),
                    updatedBy: userData?.username,
                    updatedById: user?.uid
                });
            }
    
            const usersRef = collection(db, 'Users');
            const userSnap = await getDocs(usersRef);
    
            userSnap.forEach(async (doc) => {
                try {
                    await updateDoc(doc.ref, {
                        hasViewedAnnouce: false
                    });
                } catch (error) {
                    console.error('Error updating document:', error);
                }
            });
    
            toast.success('Announcement has been posted to all users!', { id: loadToast, duration: 2500 });
        } catch (error) {
            toast.error(error.message, { id: loadToast, duration: 5000 });
            console.error(error);
        }
    };
    

    useCheckAuth()
    return (
        <div className='bg-sky-50 dark:bg-slate-950 w-full sm:pb-[85px] md:pb-0 md:pl-[140px] pt-[70px]'>
            <TopNav>
                <div className=' w-full flex items-center justify-between py-1'>
                    <div className='flex items-center justify-center'>
                        <Tooltip title='Back' arrow enterDelay={400}>
                            <Link to='/profile' className=' dark:text-slate-100 text-slate-100'>
                                <FontAwesomeIcon className=' mr-3 text-md' icon={faArrowLeft} />
                            </Link>
                        </Tooltip>
                        <FontAwesomeIcon icon={faUserShield} />
                        <h2 className='text-lgtext-white ml-3 font-medium'>Admin Panel</h2>
                    </div>
                </div>
            </TopNav>
            <div className=' w-full bg-sky-50 dark:bg-slate-950 pb-[65px] md:pl-[40px] px-7'>
                <div className=' flex items-center justify-center flex-col md:flex-row gap-3 lg:px-20'>
                    <div className=' w-full sm:w-[70%] md:w-[75%] xl:w-[60%] mt-3 mx-auto h-auto flex items-start justify-center flex-col p-2 gap-x-2 bg-slate-800 rounded-xl'>
                        <div className=' w-full flex items-center justify-center gap-2'>
                            <div className=' p-2 w-full flex items-center justify-center flex-col'>
                                <h2 className=' truncate flex items-center justify-center gap-1 text-lg text-slate-800 dark:text-slate-50 '>
                                    <FontAwesomeIcon icon={faUsers} />
                                    Users: 0
                                </h2>
                                <div className=' text-slate-700 dark:text-slate-200 w-full flex items-center justify-center gap-5 mt-3'>
                                    <div className=' text-sm flex items-center justify-center flex-col'>
                                        <h2>Male</h2>
                                        <h2>0</h2>
                                    </div>
                                    <div className=' text-sm flex items-center justify-center flex-col'>
                                        <h2>Female</h2>
                                        <h2>0</h2>
                                    </div>
                                </div>
                            </div>
                            <div className=' p-2 w-full flex items-center justify-center flex-col'>
                                <h2 className=' truncate flex items-center justify-center gap-1 text-lg text-slate-800 dark:text-slate-50 '>
                                    <FontAwesomeIcon icon={faBookOpen} />
                                    Post: 0
                                </h2>
                                <div className=' text-slate-700 dark:text-slate-200 w-full flex items-center justify-center gap-5 mt-3'>
                                    <div className=' flex items-center justify-center flex-col'>
                                        <h2>Approved</h2>
                                        <h2>0</h2>
                                    </div>
                                    <div className=' flex items-center justify-center flex-col'>
                                        <h2>Private</h2>
                                        <h2>0</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className=' p-2 mb-1 w-full flex items-center justify-center'>
                            <button onClick={handleShowAnnouceModal} className=' truncate p-1 w-1/2 px-3 bg-blue-500 text-slate-50 rounded-lg'>Announce</button>
                        </div>
                    </div>
                </div>
                <div className={` w-full flex items-center ${!loading && 'overflow-y-auto'} justify-center flex-row flex-wrap gap-2 select-none`}>
                    {loading && <div className=' w-full flex items-center justify-center gap-2 text-xl my-3 text-white'>
                        <CircularProgress size={30} thickness={5} />
                    </div>}
                    {/* This is where i will show cards if query and search matches, it's hidden show it when query matches */}
                    {posts.length > 0 && <div className='w-full h-auto p-0 flex items-center justify-center pt-3 pb-20'>
                        <div className='w-full md:max-lg:w-[80%] xl:w-full h-auto flex items-center justify-center gap-3 flex-col md:flex-row flex-wrap'>
                            {posts?.map((post, index) => (
                                <AdminPostCard key={index} post={post} />
                            ))}
                        </div>
                    </div>}
                    {!loading && !posts.length &&
                        <div className=' w-full p-5 dark:text-slate-300 text-center'>
                            <FontAwesomeIcon className=' px-2' icon={faFaceSadTear} />
                            No private Posts
                        </div>
                    }
                </div>
            </div>
            <Toaster />
            <Navigations />
            <div className={`${annouceModal ? ' block ' : ' hidden'} fixed bottom-0 right-0 w-full h-full bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center`}>
                <div className={` p-2 w-[80%] sm:w-[60%] md:w-[47%] lg:w-[35%] xl:w-[32%] h-auto bg-slate-100 dark:bg-slate-700 rounded-xl ring-1 ring-slate-300/70 shadow-2xl dark:ring-slate-600`}>
                    <div className=' w-full flex items-center justify-center flex-col p-1 my-2 mt-1 text-slate-800 dark:text-slate-50 gap-2'>
                        <div className=' w-full flex items-center justify-end'>
                            <Tooltip title='Close' enterDelay={400}>
                             <FontAwesomeIcon onClick={handleHideAnnouce} className=' cursor-pointer p-1' icon={faTimes} />
                            </Tooltip>
                        </div>
                        <div className=' -mt-2'>
                            <h2 className=' text-lg tracking-wide p-1 font-semibold'>Announcement</h2>
                        </div>
                        <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[95%] mx-auto'>
                            <FontAwesomeIcon icon={faNavicon} className='text-slate-700 text-md pl-3' />
                            <input type="text" placeholder='Title' value={annouceDetails.title} onChange={handleChangeAnnouce} name='title' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none text-sm' />
                        </div>
                        <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[95%] mx-auto'>
                            <FontAwesomeIcon icon={faInfoCircle} className='text-slate-700 text-md pl-3' />
                            <input type="text" placeholder='Announcement' value={annouceDetails.annoucement} onChange={handleChangeAnnouce} name='annoucement' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none text-sm' />
                        </div>
                        <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[95%] mx-auto'>
                            <FontAwesomeIcon icon={faCalendar} className='text-slate-700 text-md pl-3' />
                            <input type="date" value={annouceDetails.date} onChange={handleChangeAnnouce} name='date' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none text-sm' />
                        </div>
                        <div className=' w-full flex items-center justify-center mt-1'>
                            <button onClick={handlePostAnnouncement} className=' w-[95%] truncate active:bg-blue-400 duration-150 active:scale-[0.97] p-2 px-5 mx-auto bg-blue-500 text-slate-50 font-semibold rounded-lg text-sm tracking-wide'>Post</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Admin 