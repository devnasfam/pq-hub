import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBookmark, faSpinner } from '@fortawesome/free-solid-svg-icons'
import useCheckAuth from './customHooks/useCheckAuth'
import { MyAppContext } from '../AppContext/MyContext'
import { Link } from 'react-router-dom'
import { db } from '../firebase/firebaseService'
import { doc, getDoc } from 'firebase/firestore'
import { faFaceSadTear } from '@fortawesome/free-regular-svg-icons'
import PostCard from '../components/PostCard'
import { Toaster } from 'react-hot-toast'
import { CircularProgress, Tooltip } from '@mui/material'

const savedPastQ = () => {

    const { user } = useContext(MyAppContext);
    const [userData, setUserdata] = useState([]);
    const [loading, setLoad] = useState(true)
    const [posts, setPosts] = useState([])

    useLayoutEffect(() => {
        window.scrollTo(0, 0); // Reset scroll position to top when the pathname changes
    }, []);

    const fetchPosts = async () => {
        try {
            const userDocc = doc(db, 'Users', user.uid);
            const snapshot = await getDoc(userDocc);
            let userDoc = snapshot.data()
            const docIDs = userDoc.bookMarks;
            let fetchedDocs = [];

            for (const bookMark of docIDs) {
                const bookMarkRef = doc(db, 'Posts', bookMark);
                let bookMarkSnapshot = await getDoc(bookMarkRef)
                const post = bookMarkSnapshot.data();
                fetchedDocs.push(post);
            }
            fetchedDocs = fetchedDocs.filter((doc) => doc.isPrivate == false)
            return fetchedDocs;
        } catch (error) {
            // console.error('Error fetching posts:', error);
            return [];
        }
    };

    useEffect(() => {
        document.title = 'Saved Past Q'
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
                        <FontAwesomeIcon icon={faBookmark} />
                        <h2 className='text-lgtext-white ml-3 font-medium'>Saved Past Questions</h2>
                    </div>
                </div>
            </TopNav>
            <div className=' w-full bg-sky-50 dark:bg-slate-950 pb-[65px] md:pl-[60px]'>
                <div className={` w-full flex items-center ${!loading && 'overflow-y-auto'} justify-center flex-row flex-wrap gap-2 p-2 select-none`}>
                    {loading && <div className=' w-full flex items-center justify-center gap-2 text-xl text-white'>
                      <CircularProgress size={30} thickness={5}/>
                    </div>}
                    {/* This is where i will show cards if query and search matches, it's hidden show it when query matches */}
                    {posts.length > 0 && <div className='w-full h-auto p-0 flex items-center justify-center pt-3 pb-20'>
                        <div className='w-[90%] h-auto flex items-center justify-center gap-3 flex-col md:flex-row flex-wrap'>
                            {posts?.map((post, index) => (
                                <PostCard key={index} post={post} />
                            ))}
                        </div>
                    </div>}
                    {!loading && !posts.length &&
                        <div className=' w-full p-5 dark:text-slate-300 text-center'>
                            <FontAwesomeIcon className=' px-2' icon={faFaceSadTear} />
                            No saved past questions here!
                        </div>
                    }
                </div>
            </div>
            <Toaster position='bottom-center' />
            <Navigations />
        </div>
    )
}

export default savedPastQ
