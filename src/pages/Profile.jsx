import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faBookmark, faSchool, faShare, faShareAlt, faSignOut, faSquareShareNodes, faSun, faTimes, faToggleOff, faToggleOn, faUser, faUserEdit, faUserGraduate, faUserShield } from '@fortawesome/free-solid-svg-icons'
import fresh from '../assets/user.png'
import useCheckAuth from './customHooks/useCheckAuth'
import { MyAppContext } from '../AppContext/MyContext'
import { signOut } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/firebaseService'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { detectLevel } from '../detectLevel.js'
import { Tooltip } from '@mui/material'
// import Tooltip from '@mui/material/Tooltip';

const Profile = () => {

  const { user } = useContext(MyAppContext);
  const [userData, setUserdata] = useState([]);
  const [loading, setLoad] = useState(true)
  const [loading2, setLoad2] = useState(true)
  const [posts, setPosts] = useState([])
  const [forWing, setForWing] = useState('')
  const [forWingList, setForWingList] = useState([])
  const [loadCount, setLoadCount] = useState(0);
  const [isShowModal, setIsShowModal] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchPosts = async () => {
    if (!user || !user.uid) return;
    try {
      const postsCollection = query(collection(db, 'Posts'), where("userId", "==", user.uid));
      const snapshot = await getDocs(postsCollection);
      const postsData = []
      snapshot.forEach((doc) => {
        postsData.push(doc.data());
      })
      return postsData;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };

  useEffect(() => {
    document.title = 'My Profile'
    const fetchUserData = async () => {
      try {
        if (!user || !user.uid) return;
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
  }, [document.title, user])

  useCheckAuth()

  const navigate = useNavigate()



  const HandleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  const [isShow, setShow] = useState(false);

  const handleFollowingList = async () => {
    setForWing('followings');
    setIsShowModal(true);
    try {
      if (!user) return;
      const currentUserRef = doc(db, 'Users', user && user.uid);
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
      if (!user) return;
      const currentUserRef = doc(db, 'Users', user && user.uid);
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

  return (
    <div className='bg-sky-50 dark:bg-slate-950 w-full pb-[50px] md:pb-0 md:pl-[140px] pt-[60px]'>
      <TopNav>
        <div className='flex items-center justify-center cursor-pointer py-0.5'>
          <FontAwesomeIcon icon={faUser} />
          <h2 className='text-lgtext-white ml-3 font-medium'>My Profile</h2>
        </div>
      </TopNav>
      <div className=' w-full flex items-center justify-start flex-col text-slate-700 dark:text-slate-200 sm:pb-[65px] md:pb-0  md:pl-20 select-none sm:mt-3'>
        <div className=' w-full sm:w-[70%] md:w-[85%] lg:w-[69%] h-auto flex items-center justify-center sm:justify-start flex-col sm:flex-row sm:rounded-xl bg-white sm:shadow dark:bg-slate-900'>
          <div className=' relative z-20 w-full py-5 h-full flex items-center justify-center sm:justify-start flex-col sm:flex-row p-5 sm:rounded-md'>
            <img src={userData.profilePicture || fresh} alt={`Profile Picture`} className=' border border-slate-200 dark:border-slate-800 z-10 mt-3 md:mt-0 w-28 h-28 object-cover rounded-full shrink-0' />
            <div className='p-2 z-10'>
              {userData && <div className='text-slate-700 dark:text-slate-300 font-medium text-xl text-center sm:text-left'>{userData.fullName}</div>}
              {userData && <div className='text-slate-700 dark:text-slate-300 text-lg text-center flex items-center gap-x-1 justify-center sm:justify-start sm:px-5 sm:pl-4'>{!loading && '@'}{userData.username} {userData.isVerified && <span className="material-symbols-outlined text-lg bg-white rounded-full w-3 h-3 flex items-center justify-center text-blue-500">
                verified</span>}</div>}
              {userData && <div className='text-slate-700 dark:text-slate-300 text-lg text-center md:text-left'>{userData.level}</div>}
              {loading && <div className=' animate-pulse dark:bg-slate-800 bg-slate-300 rounded-md backdrop-blur-md h-7 w-[200px] mx-auto px-10 text-lg text-center sm:text-left my-2'></div>}
              {userData && <div className='text-slate-700 dark:text-slate-400 text text-center sm:text-left sm:px-5'>
                {!loading && <FontAwesomeIcon className=' px-1' icon={faSchool} />}
                {userData.department}
              </div>}
              {loading && <div className='animate-pulse dark:bg-slate-800 bg-slate-300 rounded-md backdrop-blur-md my-2 h-7 w-[200px] mx-auto px-10 text-lg text-center md:text-left'></div>}
              {userData && <div className='text-slate-700 dark:text-slate-300 text-center p-0.5 sm:text-left sm:px-5'>
                {!loading && `Level: ${detectLevel(userData.admNumber, userData.department)}`}
              </div>}

              <div className=' w-full flex items-center justify-center gap-5 mt-1'>
                <Link to='/profile/my-contributions' className=' flex items-center justify-center flex-col p-2 py-1'>
                  <div className=' font-medium tracking-wide text-lg'>{posts && posts?.length || '0'}</div>
                  <div className=' text-sm text-slate-700 dark:text-slate-300'>{posts && posts?.length > 1 ? 'Posts' : 'Post'}</div>
                </Link>
                <div onClick={handleFollowersList} className=' cursor-pointer flex items-center justify-center flex-col p-2 py-1'>
                  <div className=' font-medium tracking-wide text-lg'>{userData.followers?.length || '0'}</div>
                  <div className=' text-sm text-slate-700 dark:text-slate-300'>{userData.followers?.length > 1 ? 'Followers' : 'Follower'}</div>
                </div>
                <div onClick={handleFollowingList} className=' cursor-pointer flex items-center justify-center flex-col p-2 py-1'>
                  <div className=' font-medium tracking-wide text-lg'>{userData.following?.length || '0'}</div>
                  <div className=' text-sm text-slate-700 dark:text-slate-300'>{userData.followers?.length > 1 ? 'Followings' : 'Following'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className=' z-10 w-full h-auto flex items-center justify-center flex-col p-2 md:px-10'>
          <ul className='w-full sm:w-[75%] md:w-[100%] lg:w-[75%] space-y-2 select-none p-4 md:p-2 md:self-start lg:self-center'>
            <Link to='/profile/edit' className=' bg-white shadow dark:bg-slate-900 rounded-xl p-4 hover:bg-blue-500 hover:text-white dark:hover:bg-slate-600 cursor-pointer pl-5 flex items-center justify-between'>
              <div className='flex items-center justify-center gap-2'>
                <FontAwesomeIcon className=' p-2 bg-cyan-600 text-white rounded-md' icon={faUserEdit} />
                <div>Personal Info</div>
              </div>
              <FontAwesomeIcon icon={faAngleRight} />
            </Link>
            <Link to='/profile/my-contributions' className=' bg-white shadow dark:bg-slate-900 rounded-xl p-4 hover:bg-blue-500 hover:text-white dark:hover:bg-slate-600 cursor-pointer pl-5 flex items-center justify-between'>
              <div className='flex items-center justify-center gap-2'>
                <FontAwesomeIcon className=' p-[5.5px] py-2 px-2.5 bg-purple-500 text-white rounded-md' icon={faShareAlt} />
                <div>My Contributions</div>
              </div>
              <FontAwesomeIcon icon={faAngleRight} />
            </Link>
            {userData?.isAdmin &&
            <Link to='/admin' className=' bg-white shadow dark:bg-slate-900 rounded-xl p-4 hover:bg-blue-500 hover:text-white dark:hover:bg-slate-600 cursor-pointer pl-5 flex items-center justify-between'>
              <div className='flex items-center justify-center gap-2'>
                <FontAwesomeIcon className=' p-1.5 px-[6.7px] py-2 bg-green-500 text-white rounded-md' icon={faUserShield} />
                <div>Admin Panel</div>
              </div>
              <FontAwesomeIcon icon={faAngleRight} />
            </Link>
            }
            <Link to='/profile/saved' className=' bg-white shadow dark:bg-slate-900 rounded-xl p-4 hover:bg-blue-500 hover:text-white dark:hover:bg-slate-600 cursor-pointer pl-5 flex items-center justify-between'>
              <div className='flex items-center justify-center gap-2'>
                <FontAwesomeIcon className=' p-2 px-2.5 bg-pink-500 text-white rounded-md' icon={faBookmark} />
                <div>Saved Past Questions</div>
              </div>
              <FontAwesomeIcon icon={faAngleRight} />
            </Link>
            <a href='https://wa.me/2347046864411' className='gap-3 bg-white shadow dark:bg-slate-900 rounded-xl p-4 hover:bg-blue-500 hover:text-white dark:hover:bg-slate-600 cursor-pointer pl-5 flex items-center justify-start'>
              <FontAwesomeIcon className=' p-2 px-[9.5px] bg-blue-500 text-white rounded-md' icon={faUser} />
              Help & Support
            </a>
            <li onClick={() => setShow(true)} className='gap-3 md:hidden text-white shadow-inner bg-red-600  rounded-xl p-4 hover:bg-red-400 cursor-pointer pl-8 flex items-center justify-start'>
              <FontAwesomeIcon icon={faSignOut} />
              Log Out
            </li>
          </ul>
        </div>
        <div className={`w-full h-screen fixed z-[999] bg-[rgba(0,0,0,.5)] flex items-center justify-center ${isShow ? 'flex' : 'hidden'}`}>
          <div className='w-[80%] sm:w-[65%] p-5 md:w-[50%] lg:w-[35%] h-auto bg-white border border-slate-300 dark:border-slate-700 dark:bg-[rgba(30,41,59,.85)] backdrop-blur-md shadow-[0_4px_3px_rgba(0,0,0,.05)] rounded-xl -mt-28 flex items-center justify-center flex-col gap-3'>
            <h3 className='text-slate-700 dark:text-slate-50 text-base font-medium p-2'>Are you sure you want to Log Out ?</h3>
            <div className=' w-full p-1 h-full flex items-end justify-between'>
              <button onClick={() => setShow(false)} className=' p-[5px] text-sm bg-blue-500 text-white rounded-lg px-5'>No</button>
              <button className=' p-[5px] text-sm bg-red-500 text-white rounded-lg px-5' onClick={HandleSignOut}>Yes</button>
            </div>
          </div>
        </div>
      </div>
      <Navigations />
      {/* followers Modal */}
      <div className={` ${isShowModal ? ' flex' : ' hidden'} scrollMsgbody  w-full h-full bg-[rgba(0,0,0,.45)] items-center justify-center fixed top-0 left-0 z-50`}>
        <div className={`${isShowModal ? ' scale-100' : ' scale-0'} scrollMsgbody overflow-hidden w-[70%] flex items-center justify-start flex-col sm:w-[60%] md:w-[40%] xl:w-[35%] ring-1 ring-slate-300 dark:ring-slate-700 bg-white dark:bg-[rgba(30,41,59,.85)] backdrop-blur-md shadow-[0_4px_3px_rgba(0,0,0,.05)] max-[380px]:h-[50%] h-[40%] lg:h-[50%] rounded-lg`}>
          <div className=' w-full flex items-center justify-between p-2.5 px-4 tracking-wider text-slate-800 dark:text-slate-100 border-b border-b-slate-200 dark:border-b-slate-700'>
            {'My ' + forWing || 'Followers'}
            <Tooltip title='Close' arrow enterDelay={400}>
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
                <Link key={i} to={`/${userf.username}`} onClick={handleCloseModal} className=' w-full flex items-center justify-start gap-2 p-3 border-b-[0.5px] border-b-slate-200 dark:border-b-slate-700'>
                  <img src={userf.profilePicture || fresh} className=' w-9 h-9 rounded-full object-cover' alt="" />
                  <div className=' text-slate-900 flex items-center justify-center gap-x-1 dark:text-slate-100'>
                    {userf.username}
                    {userf?.isVerified && <span className="material-symbols-outlined text-lg bg-white rounded-full w-3 h-3 flex items-center justify-center text-blue-500">
                      verified
                    </span>}
                  </div>
                </Link>
              ))}
              {!loadCount && !loading2 &&
                <div className=' p-3 text-slate-50 w-full flex items-center justify-center '>{forWing === 'followers' ? ' No followers' : 'Not following anyone'}</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
