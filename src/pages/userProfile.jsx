import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSchool, faTimes } from '@fortawesome/free-solid-svg-icons'
import fresh from '../assets/user.png'
import useCheckAuth from './customHooks/useCheckAuth'
import { MyAppContext } from '../AppContext/MyContext'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../firebase/firebaseService'
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { detectLevel } from '../detectLevel'
import PostCard from '../components/PostCard'
import toast, { Toaster } from 'react-hot-toast'
import { CircularProgress, Tooltip } from '@mui/material'

const UserProfile = () => {
  const { user } = useContext(MyAppContext)
  const [userData, setUserData] = useState({})
  const [loading, setLoad] = useState(true)
  const [loading2, setLoad2] = useState(true)
  const [posts, setPosts] = useState([])
  const [isFollowed, setIsFollowed] = useState(false)
  const [combinedIds, setCombinedIds] = useState('')
  const { username } = useParams()
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()
  const [forWing, setForWing] = useState('')
  const [forWingList, setForWingList] = useState([])
  const [loadCount, setLoadCount] = useState(0)
  const [isShowModal, setIsShowModal] = useState(false)

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userQuery = query(collection(db, 'Users'), where('username', '==', username))
        const userSnapshot = await getDocs(userQuery)
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0]
          const userData = userDoc.data()
          setUserId(userData.id)
          setUserData(userData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoad(false)
      }
    }

    if (username) fetchUserData()
  }, [username])

  const fetchPosts = async () => {
    if (!userId) return []
    try {
      const postCollect = query(collection(db, 'Posts'), where('userId', '==', userId), where('isPrivate', '==', false))
      const snapshot = await getDocs(postCollect)
      const postsData = []
      snapshot.forEach(doc => postsData.push(doc.data()))
      postsData.sort((a, b) => b.createdAt - a.createdAt)
      return postsData
    } catch (error) {
      console.error('Error fetching posts:', error)
      return []
    }
  }

  useEffect(() => {
    if (!userId || !user?.uid) return
    const checkIsFollowed = async () => {
      try {
        const currentUserRef = doc(db, 'Users', user.uid)
        const currentUserSnapshot = await getDoc(currentUserRef)
        if (currentUserSnapshot.exists()) {
          const currentUserData = currentUserSnapshot.data()
          const following = currentUserData.following || []
          setIsFollowed(following.includes(userId))
        }
      } catch (error) {
        console.error('Error checking user followed:', error)
      }
    }
    checkIsFollowed()
  }, [userId, user])

  useEffect(() => {
    if (user?.uid && userId) setCombinedIds(`${user.uid}-${userId}`)
  }, [userId, user])

  const follow = async () => {
    if (!userId || !user?.uid) return
    const newFollowState = !isFollowed
    setIsFollowed(newFollowState)

    if (newFollowState) {
      toast.success(`You're now following ${userData?.username}`)
    } else {
      toast(`You've unfollowed ${userData?.username}`, { icon: '👎', duration: 1500 })
    }

    try {
      const userRef = doc(db, 'Users', userId)
      const currentUserRef = doc(db, 'Users', user.uid)

      if (newFollowState) {
        await updateDoc(userRef, { followers: arrayUnion(user.uid) })
        await updateDoc(currentUserRef, { following: arrayUnion(userId) })
      } else {
        await updateDoc(userRef, { followers: arrayRemove(user.uid) })
        await updateDoc(currentUserRef, { following: arrayRemove(userId) })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const checkChatRoomExists = async (currentUser, visitedUser) => {
    const chatRoomId1 = `${currentUser}-${visitedUser}`
    const chatRoomId2 = `${visitedUser}-${currentUser}`

    const chatRoom1 = await getDoc(doc(db, 'Chats', chatRoomId1))
    const chatRoom2 = await getDoc(doc(db, 'Chats', chatRoomId2))

    if (chatRoom1.exists()) return chatRoomId1
    if (chatRoom2.exists()) return chatRoomId2
    return null
  }

  useEffect(() => {
    if (!userId) return
    const getPosts = async () => {
      const posts = await fetchPosts()
      setPosts(posts)
    }
    getPosts()
    document.title = userData?.fullName || 'User Profile'
  }, [userId, username])

  const handleChatButtonClick = async () => {
    const chatRoomId = await checkChatRoomExists(user.uid, userId)
    navigate(`/chats/${chatRoomId || `${user.uid}-${userId}`}`)
  }

  const handleFollowingList = async () => {
    setForWing('followings')
    setIsShowModal(true)
    try {
      const currentUserRef = doc(db, 'Users', userId)
      const currentUserDoc = await getDoc(currentUserRef)
      const following = currentUserDoc.data().following || []
      const list = []
      for (const id of following) {
        const userRef = doc(db, 'Users', id)
        const userDoc = await getDoc(userRef)
        list.push(userDoc.data())
      }
      setForWingList(list)
      setLoadCount(list.length)
    } catch (error) {
      console.error(error)
    } finally {
      setLoad2(false)
    }
  }

  const handleFollowersList = async () => {
    setForWing('followers')
    setIsShowModal(true)
    try {
      const currentUserRef = doc(db, 'Users', userId)
      const currentUserDoc = await getDoc(currentUserRef)
      const followers = currentUserDoc.data().followers || []
      const list2 = []
      for (const id of followers) {
        const userRef = doc(db, 'Users', id)
        const userDoc = await getDoc(userRef)
        list2.push(userDoc.data())
      }
      setForWingList(list2)
      setLoadCount(list2.length)
    } catch (error) {
      console.error(error)
    } finally {
      setLoad2(false)
    }
  }

  const handleCloseModal = () => {
    setIsShowModal(false)
    setLoad2(true)
    setForWingList([])
  }

  useCheckAuth()

  return (
    <div className={`${isShowModal ? 'overflow-hidden' : 'overflow-y-auto'} bg-sky-50 dark:bg-slate-950 w-full pb-[50px] md:pb-0 md:pl-[140px] pt-[56px]`}>
      <TopNav>
        <div className="flex items-center justify-center cursor-pointer">
          <Link to="/feed">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h2 className="text-lg text-white ml-3 font-medium">{userData?.fullName}</h2>
        </div>
      </TopNav>

      <div className="w-full flex items-center justify-start flex-col text-slate-700 dark:text-slate-200 sm:pb-[85px] md:pb-0 md:pl-20 select-none sm:mt-3">
        <div className="w-full sm:w-[85%] lg:w-[69%] flex items-center justify-center sm:justify-start flex-col sm:flex-row sm:rounded-xl bg-sky-100 dark:bg-slate-900">
          <div className="relative w-full py-5 flex items-center justify-center sm:justify-start flex-col sm:flex-row p-5 sm:rounded-md">
            <img src={userData?.profilePicture || fresh} className="mt-3 md:mt-0 w-28 h-28 object-cover rounded-full" />
            <div className="p-2">
              <div className="font-medium text-xl text-center md:text-left">{userData?.fullName}</div>
              <div className="text-lg flex items-center gap-x-1 justify-center md:justify-start">
                {!loading && '@'}{userData?.username}{' '}
                {userData?.isVerified && (
                  <span className="material-symbols-outlined text-lg bg-white rounded-full w-3 h-3 flex items-center justify-center text-blue-500">verified</span>
                )}
              </div>
              <div className="text-lg text-center md:text-left">{userData?.level}</div>

              <div className="text-slate-700 dark:text-slate-400 text-center">
                {!loading && <FontAwesomeIcon className="px-1" icon={faSchool} />}
                {userData?.department}
              </div>

              <div className="text-slate-700 dark:text-slate-300 text-center p-0.5 md:text-left md:ml-4">
                {!loading && `Level: ${detectLevel(userData?.admNumber, userData?.department)}`}
                {user && userId && userId !== user?.uid && (
                  <div className="w-full flex items-center justify-center gap-x-2 p-1 my-1 md:-ml-2">
                    <button
                      onClick={follow}
                      className={`p-1 rounded-lg ${
                        isFollowed ? 'text-slate-700 dark:text-slate-50 px-2.5 text-sm border border-slate-600 dark:border-slate-200' : 'bg-blue-500 px-3 text-slate-50'
                      } text-sm hover:scale-[0.94]`}
                    >
                      {Array.isArray(userData?.following) && userData.following.includes(user.uid) && !isFollowed
                        ? 'Follow back'
                        : isFollowed
                        ? 'Following'
                        : 'Follow'}
                    </button>
                    <button
                      onClick={handleChatButtonClick}
                      className="p-1 rounded-lg text-slate-700 dark:text-slate-50 px-2 text-sm border border-slate-600 dark:border-slate-200 hover:scale-[0.98]"
                    >
                      Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full sm:rounded-xl sm:w-[85%] lg:w-[69%] mx-auto sm:mt-2 bg-slate-300 dark:bg-slate-800 flex shadow-lg items-center justify-around p-2">
          <div className="flex items-center justify-center flex-col p-2 py-1">
            <div className="font-semibold text-lg">{posts?.length || '0'}</div>
            <div className="text-sm">{posts?.length > 1 ? 'Posts' : 'Post'}</div>
          </div>
          <div onClick={handleFollowersList} className="cursor-pointer flex items-center justify-center flex-col p-2 py-1">
            <div className="font-semibold text-lg">{userData?.followers?.length || '0'}</div>
            <div className="text-sm">{userData?.followers?.length > 1 ? 'Followers' : 'Follower'}</div>
          </div>
          <div onClick={handleFollowingList} className="cursor-pointer flex items-center justify-center flex-col p-2 py-1">
            <div className="font-semibold text-lg">{userData?.following?.length || '0'}</div>
            <div className="text-sm">{userData?.following?.length > 1 ? 'Followings' : 'Following'}</div>
          </div>
        </div>

        {loading && (
          <div className="w-full mt-4 flex items-center justify-center gap-2 text-xl text-white">
            <CircularProgress size={30} thickness={4} />
          </div>
        )}

        <div className="w-full h-auto flex items-center justify-center flex-col p-2 md:p-10 md:pt-0">
          {posts?.length > 0 && (
            <div className="w-full p-0 flex items-center justify-center pt-3 pb-20">
              <div className="w-[90%] flex items-center justify-center gap-3 flex-col md:flex-row flex-wrap">
                {posts.map((post, index) => (
                  <PostCard key={index} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Navigations />

      {isShowModal && (
        <div className="scrollMsgbody w-full h-full bg-[rgba(0,0,0,.45)] flex items-center justify-center fixed top-0 left-0 z-50">
          <div className="scrollMsgbody overflow-hidden w-[70%] flex items-center justify-start flex-col sm:w-[60%] md:w-[40%] xl:w-[35%] ring-1 ring-slate-300 dark:ring-slate-700 bg-white dark:bg-[rgba(30,41,59,.85)] backdrop-blur-md shadow-lg h-[40%] lg:h-[50%] rounded-lg">
            <div className="w-full flex items-center justify-between p-2.5 px-4 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
              {userData?.username ? `${userData.username}'s ${forWing}` : 'Followers'}
              <Tooltip title="Close" arrow>
                <FontAwesomeIcon onClick={handleCloseModal} className="cursor-pointer p-1" icon={faTimes} />
              </Tooltip>
            </div>

            <div className="w-full flex items-center justify-center overflow-y-auto">
              {loading2 ? (
                <div className="w-full flex items-center justify-center flex-col">
                  {[...Array(loadCount || 7)].map((_, index) => (
                    <div className="w-full flex items-center justify-start gap-2 p-2" key={index}>
                      <div className="animate-pulse dark:bg-slate-900 bg-slate-200 h-10 w-10 rounded-full my-2"></div>
                      <div className="animate-pulse dark:bg-slate-900 bg-slate-200 rounded-md h-7 w-[200px] px-10 my-2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-start justify-start flex-col w-full">
                  {forWingList.map((userf, i) => (
                    <Link key={i} to={`/${userf?.username}`} onClick={handleCloseModal} className="w-full flex items-center gap-2 p-3 border-b border-slate-200 dark:border-slate-700">
                      <img src={userf?.profilePicture || fresh} className="w-9 h-9 rounded-full object-cover" alt="" />
                      <div className="text-slate-900 flex items-center gap-x-1 dark:text-slate-100">
                        {userf?.username}
                        {userf?.isVerified && (
                          <span className="material-symbols-outlined text-lg bg-white rounded-full w-3 h-3 flex items-center justify-center text-blue-500">verified</span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {!loading2 && !loadCount && (
                    <div className="p-3 text-slate-50 w-full flex items-center justify-center">
                      {forWing === 'followers' ? 'No followers' : 'Not following anyone'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  )
}

export default UserProfile
