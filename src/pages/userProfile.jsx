import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSchool, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons'
import fresh from '../assets/user.png'
import useCheckAuth from './customHooks/useCheckAuth'
import { MyAppContext } from '../AppContext/MyContext'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../firebase/firebaseService'
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { detectLevel } from '../detectLevel'
import PostCard from '../components/PostCard'
import toast, { Toaster } from 'react-hot-toast'
import { CircularProgress, Tooltip } from '@mui/material'

const userProfile = () => {

    const { user } = useContext(MyAppContext);
    const [userData, setUserdata] = useState([]);
    const [loading, setLoad] = useState(true)
    const [loading2, setLoad2] = useState(true)
    const [posts, setPosts] = useState([])
    const [isFollowed, setisFollowed] = useState(false)
    const [combinedIds, setCombinedIds] = useState('')
    const { username } = useParams();
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate()
    const [forWing, setForWing] = useState('')
    const [forWingList, setForWingList] = useState([])
    const [loadCount, setLoadCount] = useState(0);
    const [isShowModal, setIsShowModal] = useState(false);

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userQuery = query(collection(db, 'Users'), where('username', '==', username));
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                    const userDoc = userSnapshot.docs[0];
                    const userData = userDoc.data();
                    setUserId(userData.id);
                    setUserdata(userData);
                    setLoad(false)
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (username) {
            fetchUserData();
        }
    }, [username]);

    const fetchPosts = async () => {
        if (!userId) return;
        try {
            const postCollect = query(collection(db, 'Posts'), where("userId", "==", userId));
            const postsCollection = query(postCollect, where("isPrivate", "==", false))
            const snapshot = await getDocs(postsCollection);
            const postsData = []
            snapshot.forEach((doc) => {
                postsData.push(doc.data());
            })
            postsData.sort((a, b) => b.createdAt - a.createdAt)
            return postsData;
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    };

    useEffect(() => {
        if (!userId || !user || !user.uid) return;
        const checkIsFollowed = async () => {
            try {
                if (user && user.uid && user.uid !== null) {
                    const currentUserID = user.uid;
                    const userRef = doc(db, 'Users', currentUserID);
                    const userSnapshot = await getDoc(userRef);

                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        const following = userData.following || [];
                        const userAlreadyFollowed = following.includes(userId);
                        setisFollowed(userAlreadyFollowed);
                    }
                }
            } catch (error) {
                console.error('Error checking user followed:', error);
            }
        };
        checkIsFollowed()
    }, [userId, user])

    useEffect(() => {
        if (!userId || !user || !user.uid) return;
        setCombinedIds(user?.uid + '-' + userId)
    }, [userId, user, combinedIds])

    const follow = async () => {
        setisFollowed((prev) => !prev);

        if (!isFollowed && userData) {
            toast.success('You\'re now following ' + userData?.username)
        } else {
            toast('You\'ve unfollowed ' + userData?.username, {
                icon: '👎',
                duration: 1500
            })
        }
        try {
            if (userId && user && user.uid) {
                const userRef = doc(db, 'Users', userId && userId);
                // const theUser = await getDoc(userRef);
                // const theUserData = theUser.data();
                const currentUserRef = doc(db, 'Users', user && user.uid);
                if (!isFollowed) {
                    await updateDoc(userRef, {
                        followers: arrayUnion(user.uid)
                    })
                    await updateDoc(currentUserRef, {
                        following: arrayUnion(userId)
                    })
                    // toast.success('You\'re now following '+theUserData?.username)
                } else {
                    await updateDoc(userRef, {
                        followers: arrayRemove(user.uid)
                    })
                    await updateDoc(currentUserRef, {
                        following: arrayRemove(userId)
                    })
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const checkChatRoomExists = async (currentUser, visitedUser) => {
        const chatRoomId1 = `${currentUser}-${visitedUser}`;
        const chatRoomId2 = `${visitedUser}-${currentUser}`;

        // Check if the chat room exists using either of the IDs
        const chatRoom1 = await getDoc(doc(db, 'Chats', chatRoomId1));
        const chatRoom2 = await getDoc(doc(db, 'Chats', chatRoomId2));

        // Return the chat room ID if it exists, otherwise return null
        if (chatRoom1.exists()) {
            return chatRoomId1;
        } else if (chatRoom2.exists()) {
            return chatRoomId2;
        } else {
            return null;
        }
    };

    useEffect(() => {
        if (!userId) return;
        const getPosts = async () => {
            const posts = await fetchPosts();
            setPosts(posts);
        };
        getPosts();
        document.title = userData.fullName || 'User Profile'
    }, [document.title, user, isFollowed, userId, posts, username])

    const handleChatButtonClick = async () => {
        const chatRoomId = await checkChatRoomExists(user.uid, userId);

        if (chatRoomId) {
            navigate(`/chats/${chatRoomId}`);
        } else {
            const newChatRoomId = `${user.uid}-${userId}`;
            navigate(`/chats/${newChatRoomId}`);
        }
    };

    const handleFollowingList = async () => {
        setForWing('followings');
        setIsShowModal(true);
        try {
            if (!userId) return;
            const currentUserRef = doc(db, 'Users', userId);
            const currentUserDoc = await getDoc(currentUserRef);
            const following = currentUserDoc.data().following;
            const list = [];
            if (following?.length > 0) {

                for (const id of following) {
                    const userRef = doc(db, 'Users', id);
                    const userDoc = await getDoc(userRef);
                    list.push(userDoc.data())
                }
                setForWingList(list);
                setLoadCount(list?.length)
                setLoad2(false);
            } else {
                setForWingList([]);
                setLoadCount(0)
                setLoad2(false);
            }
        } catch (error) {
            console.log(error)
        }
    }
    const handleFollowersList = async () => {
        setForWing('followers');
        setIsShowModal(true);
        try {
            if (!userId) return;
            const currentUserRef = doc(db, 'Users', userId);
            const currentUserDoc = await getDoc(currentUserRef);
            const followers = currentUserDoc.data().followers;
            const list2 = [];
            if (followers?.length > 0) {
                for (const id of followers) {
                    const userRef = doc(db, 'Users', id);
                    const userDoc = await getDoc(userRef);
                    list2.push(userDoc.data())
                }
                setForWingList(list2);
                setLoadCount(list2?.length)
                setLoad2(false);
            } else {
                setForWingList([]);
                setLoadCount(0)
                setLoad2(false);
            }
        } catch (error) {
            console.log(error)
        }
    }
    const handleCloseModal = () => {
        setIsShowModal(false)
        setLoad2(true)
        setForWingList([])
    }



    useCheckAuth()

    return (
        <div className={` ${isShowModal ? ' overflow-hidden' : ' overflow-y-auto'} overflow-hidden bg-sky-50 dark:bg-slate-950 w-full pb-[50px] md:pb-0 md:pl-[140px] pt-[56px]`}>
            <TopNav>
                <div className='flex items-center justify-center cursor-pointer'>
                    <Link to='/feed'>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Link>
                    <h2 className='text-lgtext-white ml-3 font-medium'>{userData?.fullName}</h2>
                </div>
            </TopNav>
            <div className=' w-full flex items-center justify-start flex-col text-slate-700 dark:text-slate-200 sm:pb-[85px] md:pb-0  md:pl-20 select-none sm:mt-3'>

                <div className=' w-full sm:w-[85%] lg:w-[69%] h-auto flex items-center justify-center sm:justify-start flex-col sm:flex-row sm:rounded-xl bg-sky-100 dark:bg-slate-900'>
                    <div className=' relative z-20 w-full py-5 h-full flex items-center justify-center sm:justify-start flex-col sm:flex-row p-5 sm:rounded-md'>
                        <img src={userData?.profilePicture || fresh} className=' z-10 mt-3 md:mt-0 w-28 h-28 object-cover rounded-full shrink-0' />
                        <div className='p-2 z-10'>
                            {userData && <div className='text-slate-700 dark:text-slate-300 font-medium text-xl text-center md:text-left'>{userData?.fullName}</div>}
                            {userData && <div className='text-slate-700 dark:text-slate-300 text-lg md:px-5 md:pl-3 text-center flex items-center gap-x-1 justify-center md:justify-start'>{!loading && '@'}{userData?.username} {userData?.isVerified && <span className="material-symbols-outlined text-lg bg-white rounded-full w-3 h-3 flex items-center justify-center text-blue-500">
                                verified
                            </span>}</div>}
                            {userData && <div className='text-slate-700 dark:text-slate-300 text-lg text-center md:text-left'>{userData?.level}</div>}
                            {loading && <div className='animate-pulse dark:bg-slate-800 bg-slate-300 rounded-md backdrop-blur-md my-2 h-7 w-[200px] mx-auto px-10 text-lg text-center md:text-left'></div>}
                            {userData && <div className='text-slate-700 dark:text-slate-400 text text-center'>
                                {!loading && <FontAwesomeIcon className=' px-1' icon={faSchool} />}
                                {userData?.department}
                            </div>}
                            {loading && <div className='animate-pulse dark:bg-slate-800 bg-slate-300 rounded-md backdrop-blur-md my-2 h-7 w-[200px] mx-auto px-10 text-lg text-center md:text-left'></div>}
                            <div className='text-slate-700 dark:text-slate-300 text-center p-0.5 md:text-left md:ml-4'>
                                {!loading && `Level: ${detectLevel(userData?.admNumber, userData?.department)}`}
                                {user && userId && userId !== user?.uid &&
                                    <div className=' w-full flex items-center justify-center gap-x-2 p-1 my-1 md:-ml-2'>
                                        <button onClick={follow} className={`p-1 rounded-lg ${isFollowed ? ' text-slate-700 dark:text-slate-50 px-2.5 text-sm border border-slate-600 dark:border-slate-200' : 'bg-blue-500 px-3'} text-slate-50 text-sm hover:scal-[0.94]`}>
                                            {userData.following.includes(user.uid) && !isFollowed ? 'Follow back' : (isFollowed ? 'Following' : 'Follow')}
                                        </button>
                                        <button onClick={handleChatButtonClick} className=' p-1 rounded-lg text-slate-700 dark:text-slate-50 px-2 text-sm border border-slate-600 dark:border-slate-200 hover:scal-[0.98]'>Message</button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className=' w-full sm:rounded-xl sm:w-[85%] lg:w-[69%] mx-auto sm:mt-2 bg-slate-300 dark:bg-slate-800 flex shadow-lg shadow-[rgba(0,0,0,.2)] items-center justify-around p-2'>
                    <div className=' flex items-center justify-center flex-col p-2 py-1'>
                        <div className=' font-semibold tracking-wide text-lg'>{posts?.length || '0'}</div>
                        <div className=' text-sm text-slate-700 dark:text-slate-300'>{posts?.length > 1 ? 'Posts' : 'Post'}</div>
                    </div>
                    <div onClick={handleFollowersList} className=' cursor-pointer flex items-center justify-center flex-col p-2 py-1'>
                        <div className=' font-semibold tracking-wide text-lg'>{userData?.followers?.length || '0'}</div>
                        <div className=' text-sm text-slate-700 dark:text-slate-300'>{userData?.followers?.length > 1 ? 'Followers' : 'Follower'}</div>
                    </div>
                    <div onClick={handleFollowingList} className=' cursor-pointer flex items-center justify-center flex-col p-2 py-1'>
                        <div className=' font-semibold tracking-wide text-lg'>{userData?.following?.length || '0'}</div>
                        <div className=' text-sm text-slate-700 dark:text-slate-300'>{userData?.following?.length > 1 ? 'Followings' : 'Following'}</div>
                    </div>
                </div>
                {loading && <div className=' w-full mt-4 flex items-center justify-center gap-2 text-xl text-white'>
                    <CircularProgress size={30} thickness={4} />
                </div>}
                <div className=' z-10 w-full h-auto flex items-center justify-center flex-col p-2 md:p-10 md:pt-0'>
                    {posts?.length > 0 && <div className='w-full h-auto p-0 flex items-center justify-center pt-3 pb-20'>
                        <div className='w-[90%] h-auto flex items-center justify-center gap-3 flex-col md:flex-row flex-wrap'>
                            {posts?.map((post, index) => (
                                <PostCard key={index} post={post} />
                            ))}
                        </div>
                    </div>}
                </div>
            </div>
            <Navigations />
            {/* followers Modal */}
            <div className={` ${isShowModal ? ' flex' : ' hidden'} scrollMsgbody  w-full h-full bg-[rgba(0,0,0,.45)] items-center justify-center fixed top-0 left-0 z-50`}>
                <div className={`${isShowModal ? ' scale-100' : ' scale-0'} scrollMsgbody overflow-hidden w-[70%] flex items-center justify-start flex-col sm:w-[60%] md:w-[40%] xl:w-[35%] ring-1 ring-slate-300 dark:ring-slate-700 bg-white dark:bg-[rgba(30,41,59,.85)] backdrop-blur-md shadow-[0_4px_3px_rgba(0,0,0,.05)] max-[380px]:h-[50%] h-[40%] lg:h-[50%] rounded-lg`}>
                    <div className=' w-full flex items-center justify-between p-2.5 px-4 tracking-wider text-slate-800 dark:text-slate-100 border-b border-b-slate-200 dark:border-b-slate-700'>
                        {userData?.username && userData?.username + '\'s ' + forWing || 'Followers'}
                        <Tooltip title='Close' arrow enterDelay={500} leaveDelay={0}>
                            <FontAwesomeIcon onClick={handleCloseModal} className=' cursor-pointer p-1' icon={faTimes} />
                        </Tooltip>
                    </div>
                    <div className=' w-full flex items-center justify-center overflow-y-auto'>
                        {loading2 && (
                            <div className='w-full flex items-center justify-center flex-col'>
                                {[...Array(loadCount || 7)].map((_, index) => (
                                    <div className='w-full flex items-center justify-start gap-2 p-2' key={index}>
                                        <div className='animate-pulse dark:bg-slate-900 bg-slate-200 backdrop-blur-md h-10 w-10 rounded-full my-2'></div>
                                        <div className='animate-pulse dark:bg-slate-900 bg-slate-200 rounded-md backdrop-blur-md h-7 w-[200px] px-10 my-2'></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className=' flex items-start justify-start flex-col w-full'>
                            {forWingList && forWingList?.map((userf, i) => (
                                <Link key={i} to={`/${userf?.username}`} onClick={handleCloseModal} className=' w-full flex items-center justify-start gap-2 p-3 border-b-[0.5px] border-b-slate-200 dark:border-b-slate-700'>
                                    <img src={userf?.profilePicture || fresh} className=' w-9 h-9 rounded-full object-cover' alt="" />
                                    <div className=' text-slate-900 flex items-center justify-center gap-x-1 dark:text-slate-100'>
                                        {userf?.username}
                                        {userf?.isVerified && <span className="material-symbols-outlined text-lg bg-white rounded-full w-3 h-3 flex items-center justify-center text-blue-500">
                                            verified
                                        </span>}
                                    </div>
                                </Link>
                            ))}
                            {!loading2 && !loadCount &&
                                <div className=' p-3 text-slate-50 w-full flex items-center justify-center '>{forWing === 'followers' ? ' No followers' : 'Not following anyone'}</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position='top-right' />
        </div>
    )
}

export default userProfile
