import React, { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight, faBookOpen, faDownload, faHeart, faShare, faThumbsUp, faTimes } from '@fortawesome/free-solid-svg-icons'
import fresh from '../assets/user.png'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore'
import { db, storage } from '../firebase/firebaseService'
import { MyAppContext } from '../AppContext/MyContext'
import { faBookmark, faClock } from '@fortawesome/free-regular-svg-icons'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Tooltip from '@mui/material/Tooltip'
import moment from 'moment'
import { Rejects } from '../examtypes'
import Select from 'react-select'
import { deleteObject, ref } from 'firebase/storage'

const AdminPostCard = ({ post }) => {

    const { user } = useContext(MyAppContext)
    const [imgSlideCount, setImgSideCount] = useState(0)
    const { createdAt, examType, examYear, images, DocId, userId } = post
    const [userData, setUserdata] = useState(null);
    const [currentUserData, setCurrentUserdata] = useState(null);
    const [isHeart, setisHeart] = useState(false);
    const [decideMsg, setDecideMsg] = useState('')
    const [isShowModal, setIsShowModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [rejectMsg, setRejectMsg] = useState({})
    const [examToAction, setExamToAction] = useState('')

    const HandleNext = () => {
        const calc = (imgSlideCount + 1) % images.length
        setImgSideCount(calc)
    }
    const HandlePrev = () => {
        const calc = (imgSlideCount - 1 + images.length) % images.length
        setImgSideCount(calc)
    }

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            try {
                const userRef = doc(db, "Users", userId);
                const currentUserRef = doc(db, "Users", user?.uid);
                const userSnap = await getDoc(userRef);
                const currentUserSnap = await getDoc(currentUserRef);
                if (currentUserSnap.exists()) {
                    setCurrentUserdata(currentUserSnap.data())
                } else {
                    setCurrentUserdata(null)
                }
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
    }, [userId, user])

    const RejectPost = async (exam, year) => {
        if (!user) return;
        if (!currentUserData?.isAdmin) {
            toast.error('You don\'t have admin permission to perform this action')
        } else {
            setDecideMsg('Reject')
            setIsShowModal(true)
            setExamToAction(exam + '-' + year)
        }
    }
    const ApprovePost = async (exam, year) => {
        if (!user) return;
        if (!currentUserData?.isAdmin) {
            toast.error('You don\'t have admin permission to perform this action')
        } else {
            setDecideMsg('Approve')
            setIsShowModal(true)
            setExamToAction(exam + '-' + year)
        }
    }

    const handleNoClick = async () => {
        setIsShowModal(false)
    }
    const handleYesClick = async (docId) => {
        try {
            const postRef = doc(db, 'Posts', docId);
            if (decideMsg === 'Approve') {
                const loadToast = toast.loading('Approving post...')
                setIsShowModal(false)
                await updateDoc(postRef, {
                    isPrivate: false
                })
                toast.success('Post has been approved successfully!', { duration: 2000, id: loadToast })
            } else {
                setConfirmModal(true);
            }
        } catch (error) {
            toast.error(error.message, { duration: 2000, id: loadToast })
        }
    }

    const handleRejectClick = async (docId, imgLists) => {
        if (!rejectMsg.value || rejectMsg.value.trim() === '') {
            toast.error('Please select why you are rejecting this post');
            return;
        }
    
        setIsShowModal(false);
        setConfirmModal(false);
        const loadToast = toast.loading('Rejecting post...');
    
        try {
            const postRef = doc(db, 'Posts', docId);
    
            if (imgLists) {
                await Promise.all(imgLists.map(async (imageUrl) => {
                    const imageRef = ref(storage, imageUrl);
                    try {
                        await deleteObject(imageRef);
                    } catch (deleteError) {
                        if (deleteError.code === 'storage/object-not-found') {
                            console.warn(`Object not found: ${imageUrl}`);
                            toast.error(`Object not found: ${imageUrl}`,{id:loadToast, duration:5000})
                        } else {
                            toast.error(deleteError.message,{id:loadToast, duration:5000})
                            throw deleteError; // Re-throw other errors

                        }
                    }
                }));
            }
    
            // Update post with rejection information
            await updateDoc(postRef, {
                isRejected: true,
                rejectMsg: rejectMsg.value,
                images: deleteField()
            });
    
            toast.success('Post has been rejected successfully!', { duration: 2000, id: loadToast });
        } catch (error) {
            toast.error(error.message, { duration: 5000, id: loadToast });
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
                            <img src={images[imgSlideCount]} alt={`${examType} - ${examYear}`} loading='lazy' className='w-full h-[350px] transition-all duration-300 object-cover' />
                            {images.length > 1 && <div className=' w-8 h-8 absolute top-0 right-0 p-3 bg-[rgba(0,0,0,.4)] text-white rounded-full text-xs flex items-center justify-center m-1'>{`${imgSlideCount + 1}/${images.length}`}</div>}
                            {images.length > 1 && <FontAwesomeIcon icon={faAngleLeft} onClick={HandlePrev} className='absolute top-[50%] left-1 p-2 w-4 h-4 rounded-full text-white bg-[rgba(0,0,0,.3)] cursor-pointer' />}
                            {images.length > 1 && <FontAwesomeIcon icon={faAngleRight} onClick={HandleNext} className='absolute top-[50%] right-1 p-2 w-4 h-4 rounded-full text-white bg-[rgba(0,0,0,.3)] cursor-pointer' />}
                        </div>
                        {/* Post Likes, Views, Download  */}
                        <div className='w-full h-auto p-1 text-slate-500 dark:text-slate-300 flex items-center justify-between mt-2'>
                            <div className=' w-full flex items-center justify-between px-3'>
                                <button onClick={() => RejectPost(examType, examYear)} className=' active:scale-[.97] duration-200 p-1 flex items-center justify-center gap-1 bg-red-500 rounded-xl px-3 text-white text-sm'>
                                    <FontAwesomeIcon className='' icon={faTimes} />
                                    Reject
                                </button>
                                <button onClick={() => ApprovePost(examType, examYear)} className=' active:scale-[.97] duration-200 p-1 flex items-center justify-center gap-1 bg-green-500 rounded-xl px-3 text-white text-sm'>
                                    <FontAwesomeIcon className='' icon={faThumbsUp} />
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>}
            <div className={`${isShowModal ? ' block ' : ' hidden'} fixed bottom-0 right-0 w-full h-full z-50 flex items-center justify-center`}>
                <div className={` ${!confirmModal ? ' block' : ' hidden'} p-2 w-[80%] sm:w-[60%] md:w-[47%] lg:w-[35%] xl:w-[32%] h-auto bg-slate-100 dark:bg-slate-700 rounded-xl ring-1 ring-slate-300/70 shadow-2xl dark:ring-slate-600`}>
                    <div className=' w-full flex items-center justify-center flex-col p-2 my-5 mt-1 text-slate-800 dark:text-slate-50'>
                        <h2>Are you sure you want to {decideMsg}</h2>
                        <h2 className=' mt-3 font-semibold'>{examToAction} ?</h2>
                    </div>
                    <div className=' w-full flex items-center justify-around p-2'>
                        <button onClick={handleNoClick} className=' text-sm p-1 px-3 bg-red-500 rounded-md text-slate-50'>No</button>
                        <button onClick={() => handleYesClick(DocId)} className=' text-sm p-1 px-3 bg-blue-500 rounded-md text-slate-50'>Yes</button>
                    </div>
                </div>
                <div className={` ${confirmModal ? ' block' : ' hidden'} p-2 w-[80%] sm:w-[60%] md:w-[47%] lg:w-[35%] xl:w-[32%] h-auto bg-slate-100 shadow dark:bg-slate-700 rounded-xl ring-1 ring-slate-300/70 dark:ring-slate-600`}>
                    <div className=' w-full flex items-center justify-center flex-col p-2 my-5 mt-1 text-slate-800 dark:text-slate-50'>
                        <h2 className=' px-2 text-sm font-semibold tracking-wide'>Please select a reason for rejecting this post!</h2>
                        <h2 className=' px-9 text-center py-1 text-xs tracking-wide text-blue-300'>Providing a reason helps maintain quality standards and assists users in understanding why their post was not approved</h2>
                    </div>
                    <div className=' w-[90%] mx-auto px-5 mb-2'>
                        <Select
                            options={Rejects}
                            value={rejectMsg}
                            defaultValue={'Reason..'}
                            defaultInputValue='Reason'
                            isSearchable={false}
                            onChange={(e) => setRejectMsg(e)}
                        />
                    </div>
                    <div className=' w-full flex items-center justify-center p-2'>
                        <button onClick={() => handleRejectClick(DocId, images)} className=' w-[50%] text-sm p-1.5 px-3 bg-red-500 rounded-lg font-semibold tracking-wide text-slate-50'>Reject</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminPostCard
