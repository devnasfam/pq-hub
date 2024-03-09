import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { faCoins, faGift, faHistory, faPlusCircle, faTimes, faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { networks, widgets } from '../rewardSettings'
import { MyAppContext } from '../AppContext/MyContext'
import { arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase/firebaseService'
import mtn from '../assets/mtn.png'
import airtel from '../assets/airtel.png'
import glo from '../assets/glo.png'
import toast, { Toaster } from 'react-hot-toast'
import { CircularProgress, Tooltip } from '@mui/material'
import { Link } from 'react-router-dom'

const Rewards = () => {
    const [amount, setAmount] = useState(0);
    const [points, setPoints] = useState(0);
    const [posts, setPosts] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isShowModal, setIsShowModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('')
    const [wid, setWidgets] = useState(widgets);
    const [net, setNetwork] = useState(networks);
    const [load, setLoad] = useState(false);
    const [airtimeData, setAirtimeData] = useState([]);
    const [progressValue, setProgressValue] = useState(70)
    const [networkSelected, setnetworkSelected] = useState('')
    const [loading, setLoading] = useState(true);
    const phoneInp = useRef(null);
    const { user } = useContext(MyAppContext)

    useEffect(() => {
        if (!user || !user.uid) return;
        const postsCollection = collection(db, "Posts");
        const postsQuery = query(postsCollection, where('isPrivate', '==', false));
        const realPosts = query(postsQuery, where('userId', '==', user?.uid));
        const userDoc = doc(db, 'Users', user?.uid);

        const fetchPostsAndUser = async () => {
            try {
                const postsDocs = await getDocs(realPosts);
                const userSnap = await getDoc(userDoc);
                const userData = userSnap.data();
                setUserData(userData);
                if (postsDocs) {
                    const postData = postsDocs.docs.map(doc => doc.data());
                    setPosts(postData);
                    const availablePoints = postData.length * 40;
                    const redeemedPoints = userData?.redeemedPoints || 0;
                    setPoints(availablePoints - redeemedPoints);
                    setProgressValue(Math.floor((points / 200) * 100))
                } else {
                    setPoints(0);
                    setProgressValue(Math.floor((points / 200) * 100))
                    setLoading(false);
                }
                setLoading(false);
            } catch (error) {
                setLoading(false)
                console.log(error);
            }
        };
        fetchPostsAndUser();
    }, [points])


    const getWidget = (clickedWidget) => {
        setAmount(clickedWidget.airtime);
        setWidgets((prevWidgets) =>
            prevWidgets.map(widget =>
            ({
                ...widget,
                isColored: widget === clickedWidget
            })
            )
        );
    }

    const getNetwork = (clickedNetwork) => {
        setnetworkSelected(clickedNetwork.name);
        setNetwork((prevNetworks) =>
            prevNetworks.map(network =>
            ({
                ...network,
                isColored: network === clickedNetwork,
                color: network === clickedNetwork ? getColor(clickedNetwork.name) : network.color,
                imgUrl: network === clickedNetwork ? getImageUrl(clickedNetwork.name) : network.imgUrl
            })
            )
        );
    }

    const getColor = (networkName) => {
        switch (networkName) {
            case 'MTN':
                return 'yellow-500';
            case 'Airtel':
                return 'red-500';
            case 'Glo':
                return 'green-500';
            default:
                return '';
        }
    }
    const getImageUrl = (networkName) => {
        switch (networkName) {
            case 'MTN':
                return mtn
            case 'Airtel':
                return airtel;
            case 'Glo':
                return glo;
            default:
                return '';
        }
    }


    const redeemPoints = () => {
        if (!user || !user.uid) {
            toast.error('You are not authorized to redeem points. Please login.', { duration: 3500 })
        } else {
            if (!amount || amount == 0) {
                toast.error('Please choose the amount to redeem', { duration: 2000 })
            } else {
                if (points < 200) {
                    toast.error('You haven\'t reached the minimum redemption limit. Contribute more to earn points.', { duration: 3500 })
                } else if ((amount * 2) > points) {
                    toast.error('The selected amount exceeds your available points.', { duration: 3000 })
                } else {
                    setIsShowModal(true)
                }
            }
        }
    }

    const handlePhoneChange = (e) => {
        let enteredNumber = e.target.value.trim();
        enteredNumber = enteredNumber.slice(0, 11);
        setPhoneNumber(enteredNumber);
    }



    const RedeemToConfirm = () => {
        if (!networkSelected || networkSelected == '') {
            toast.error('Select a network.', { duration: 2000 })
        } else if (phoneNumber == '') {
            toast.error('Enter your phone number.', { duration: 2000 })
        } else if (phoneNumber.length > 11 || phoneNumber.length <= 10) {
            toast.error('Invalid phone number', { duration: 3500 })
        }
        else {
            setConfirmModal(true)
        }
    }

    const handleSendAirtime = async () => {
        setConfirmModal(false);
        setIsShowModal(false);
        setPhoneNumber('');
        const loadToast = toast.loading('Loading...');
        setLoad(true);

        try {
            if (!user || !user.uid) {
                toast.error('You are not authorized to redeem points, please login', { id: loadToast, duration: 3500 });
            }

            const userDocRef = doc(db, 'Users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();

            if (!userData) {
                toast.error('User data not found', { id: loadToast, duration: 3500 });
            }

            const postsQuery = query(collection(db, 'Posts'), where('isPrivate', '==', false), where('userId', '==', user.uid));
            const postsSnap = await getDocs(postsQuery);
            const availPosts = postsSnap.docs.map(doc => doc.data());

            const availablePoints = availPosts.length * 40;

            if (availablePoints < amount * 2) {
                toast.error('You do not have enough points for this airtime redemption', { id: loadToast, duration: 3500 });
            }

            const airtimeRequestUrl = `http://mobilemila.com/vendor/api/airtime?username=${import.meta.env.VITE_TOP_UP_USERNAME}&password=${import.meta.env.VITE_TOP_UP_PASSWORD}#2020&network=${networkSelected.trim().toLowerCase()}&amount=${amount}&phone=${phoneNumber}`;

            const res = await fetch(airtimeRequestUrl);
            const data = await res.json();

            if (data.response == 'Completed') {
                await updateDoc(userDocRef, {
                    redeemedPoints: (userData.redeemedPoints || 0) + (amount * 2),
                    paymentsHistory: arrayUnion({
                        phoneNumber,
                        amount,
                        network: networkSelected,
                        success: true,
                        date: new Date(),
                        timestamp: Date.now()
                    })
                });
                const updatedPoints = availablePoints - (amount * 2);
                setPoints(updatedPoints);
                toast.success('Successfully sent! You will be credited shortly!', { id: loadToast, duration: 3500 });
            } else {
                await updateDoc(userDocRef, {
                    paymentsHistory: arrayUnion({
                        phoneNumber,
                        amount,
                        network: networkSelected,
                        success: false,
                        error: data.msg,
                        date: new Date(),
                        timestamp: Date.now()
                    })
                });
                toast.error(data.error || 'Failed to send airtime', { id: loadToast, duration: 2000 });
                throw new Error(data.error || 'Failed to send airtime');
            }
        } catch (error) {
            setLoad(false);
            console.error(error);
            toast.error(error.message || 'An error occurred', { duration: 2000, id: loadToast });
        }
    };

    useLayoutEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    useEffect(() => {
        document.title = 'Rewards'
    }, [])
    return (
        <div className='bg-sky-50 dark:bg-slate-950 w-full pb-[65px] md:pb-0 md:pl-[140px] pt-[68px]'>
            <TopNav>
                <div className='flex items-center justify-center cursor-pointer py-0.5'>
                    <FontAwesomeIcon icon={faCoins} />
                    <h2 className='text-lgtext-white ml-3 font-medium'>Rewards Center</h2>
                </div>
                {/* <div className=' md:mr-[170px]'>
                 <Tooltip title='History' arrow enterDelay={400}>
                     <FontAwesomeIcon className=' text-slate-50 p-1 cursor-pointer' icon={faClock}/>
                 </Tooltip>  
                </div> */}
            </TopNav>
            <div className=' w-full flex items-start justify-center flex-col gap-4 px-5 sm:px-20 xl:px-40 md:px-20 py-2'>
                {loading && <div className=' -mt-1 w-full flex items-center justify-center gap-2 text-xl text-white'>
                    <CircularProgress size={30} thickness={4} />
                </div>}
                <div className=' w-full flex items-start justify-center flex-col gap-4 md:flex-row'>
                    <div className=' -full flex items-start justify-center flex-col gap-4'>
                        <div className=' w-[95%] border-l-4 border-l-sky-600 h-auto rounded-lg bg-white shadow dark:bg-slate-800 p-4'>
                            <div className=' flex items-start justify-between gap-3'>
                                <div>
                                    <h2 className=' text-slate-500 dark:text-slate-300'>Total Points:</h2>
                                    <h2 className=' text-xl text-slate-700 font-semibold dark:text-slate-50'>{points.toFixed(2) || 0.00}</h2>
                                </div>
                                <div className=' flex items-center justify-center p-2'>
                                    <FontAwesomeIcon className=' text-slate-400 text-4xl' icon={faWallet} />
                                </div>
                            </div>
                            {!loading && points >= 40 &&
                                <div className=' w-full'>
                                    <div className=' relative w-fit h-fit mt-3'>
                                        <CircularProgress
                                            variant='determinate'
                                            value={progressValue > 100 ? 100 : progressValue}
                                            size={40}
                                            thickness={5}
                                            color={`${progressValue >= 100 ? 'success' : 'info'}`}
                                        />
                                        <div className=' absolute -mt-1 top-1/2 left-1/2 text-slate-800  dark:text-slate-100 text-xs -translate-y-1/2 -translate-x-1/2'>{progressValue > 100 ? 100 + '%' : progressValue + '%'}</div>
                                    </div>
                                    <div>
                                        <h2 className=' text-slate-600 dark:text-slate-400 text-sm'>{points < 200 ? `You need ${200 - points} more points to reach the minimum redemption limit` : 'You can now redeem points!'}</h2>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className=' w-[95%] h-auto rounded-lg bg-white shadow dark:bg-slate-800 p-4'>
                            <div className=' flex items-start justify-center flex-col gap-3'>
                                <div>
                                    {!loading && <h2 className=' text-slate-800 dark:text-slate-300'>{posts.length > 0 ? `Contributions: ${posts.length}` : ' You haven\'t made any contribution yet'}</h2>}
                                    <h2 className=' text-slate-600 dark:text-slate-300 mb-2'>Excited to earn more points? You can earn 40.00 points for every past question you post!</h2>
                                    <Link to='/contribute' className=' p-1.5 px-4 my-2 bg-gradient-to-tr from-blue-700 via-blue-700 to-cyan-500 duration-200 active:to-blue-400 active:scale-[0.98] text-slate-50 mx-1 rounded-full'> <FontAwesomeIcon icon={faPlusCircle} /> Contribute now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=' w-[95%] border-l-4 border-l-blue-600 h-auto rounded-lg bg-white shadow dark:bg-slate-800 p-4'>
                        <div className=' flex items-start justify-center flex-col gap-3'>
                            <div className=' grid grid-cols-3 md:max-2xl:grid-cols-2 gap-3 w-full'>
                                {wid.map((widget) => (
                                    <div key={widget.airtime} onClick={() => getWidget(widget)} className={` ${widget.isColored ? ' bg-gradient-to-tr from-blue-700 via-blue-800 to-cyan-500 ring-blue-600 text-slate-50' : ' text-slate-800 dark:text-slate-50 bg-slate-200 dark:bg-slate-700 ring-slate-400/50 dark:ring-slate-900/40'} shadow cursor-pointer rounded-xl ring-1 p-2 flex items-center justify-center flex-col`}>
                                        <div className=' font-semibold'>&#8358;{widget.airtime}</div>
                                        <div className={`${widget.isColored ? ' text-slate-300' : ' text-slate-600 dark:text-slate-300'} text-sm`}>{widget.points}P</div>
                                    </div>
                                ))}
                            </div>
                            <div className=' w-full flex items-center justify-center space-y-2 my-1'>
                                <button onClick={redeemPoints} disabled={load} className={`${load ? ' cursor-not-allowed' : 'cursor-pointer'} p-1.5 px-4 bg-gradient-to-tl from-green-600 via-green-500 to-green-800 duration-200 active:to-green-600 active:via-green-600 active:scale-[0.98] text-slate-50 mx-1 rounded-full truncate`}> <FontAwesomeIcon icon={faGift} /> Redeem to airtime</button>
                            </div>
                        </div>
                    </div>
                </div>
                <h2 className='  text-slate-700 dark:text-slate-50'><FontAwesomeIcon icon={faClock} /> Redemption history</h2>
                <div className=' w-full bg-white shadow dark:bg-slate-800 rounded-xl p-2 overflow-x-hidden overflow-y-auto flex items-center justify-center flex-col'>
                    <div className=' hidden w-full items-center justify-center gap-2 flex-col my-2 ml-3 divide-y-[0.2px] divide-gray-700'>
                        <div className=' w-full flex items-start justify-center flex-col'>
                            <div className=' text-slate-700 dark:text-slate-50 text-sm'>N300 Redeemed</div>
                            <div className=' text-xs text-slate-500 dark:text-slate-400'>2020/02/01 01:27 am</div>
                        </div>
                    </div>
                    <div>
                        <div className=' text-slate-700 dark:text-slate-50 flex items-center justify-center flex-col gap-3'>
                            <FontAwesomeIcon className=' text-slate-400 text-2xl mt-2' icon={faHistory} />
                            <h2>No history</h2>
                        </div>
                    </div>
                </div>
            </div>
            <Navigations />
            <div className={`${isShowModal ? ' block backdrop-blur-sm' : ' hidden'} fixed bg-black/40 bottom-0 right-0 w-full h-full z-50 flex items-center justify-center`}>
                <div className={`${!confirmModal ? ' block' : ' hidden'} p-2 w-[80%] sm:w-[60%] md:w-[47%] lg:w-[35%] xl:w-[32%] h-auto bg-slate-100 shadow dark:bg-slate-700 rounded-xl ring-1 ring-slate-400 dark:ring-slate-600`}>
                    <div className=' w-full p-0.5 pb-0 px-2 flex items-center justify-end'>
                        <Tooltip title='Close' arrow enterDelay={600}>
                            <FontAwesomeIcon icon={faTimes} className=' cursor-pointer text-slate-700 dark:text-slate-50 p-0.5' onClick={() => setIsShowModal(false)} />
                        </Tooltip>
                    </div>
                    <div className=' flex items-center justify-center flex-col'>
                        <h2 className=' text-slate-800 dark:text-slate-50 p-1 pt-0 mb-1'>Chose network</h2>
                        <div>
                            {networkSelected && (
                                <img
                                    src={getImageUrl(networkSelected)}
                                    alt={networkSelected}
                                    className=" w-[20%] h-[20%] rounded-sm mx-auto aspect-square object-cover m-2 cursor-pointer text-sm dark:text-slate-100"
                                />
                            )}
                        </div>
                        <div className='grid place-items-center grid-cols-3 gap-2'>
                            {net.map((network, i) => (
                                <div onClick={() => getNetwork(network)} key={i} className={`cursor-pointer p-1 px-2 rounded-full text-sm dark:text-slate-100 ${network.isColored ? `bg-${network.color} text-slate-50` : 'bg-slate-300 dark:bg-slate-400'}`}>{network.name}</div>
                            ))}
                        </div>

                        <div className=' w-full p-2 my-2 flex items-center justify-center flex-col gap-1'>
                            <input ref={phoneInp} onChange={handlePhoneChange} value={phoneNumber} type="number" name="" id="" className=' tracking-widest placeholder:tracking-normal bg-slate-300 ring-1 ring-slate-400 dark:ring-slate-700 dark:bg-slate-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-300 outline-none rounded-full p-[5px] px-3.5 w-[80%] placeholder:text-sm' placeholder='Phone number e.g 08012345678' />
                            <button onClick={RedeemToConfirm} className=' bg-gradient-to-tr from-blue-700 via-blue-700 to-cyan-500 flex items-center justify-center gap-x-1 outline-none bg-blue-500 duration-200 active:bg-blue-400 active:scale-[0.98] text-slate-50 rounded-full p-1 px-4 my-1 w-[80%]'>
                                {/* <FontAwesomeIcon icon={faGift}/> */}
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
                {/* Confirm Modal */}
                <div className={`${confirmModal ? ' block' : 'hidden'} p-2 w-[80%] sm:w-[60%] md:w-[47%] lg:w-[35%] xl:w-[32%] h-auto bg-slate-100 dark:bg-slate-700 rounded-xl ring-1 ring-slate-400 dark:ring-slate-600`}>
                    <div className=' flex items-center justify-center flex-col'>
                        <h2 className=' text-slate-700 dark:text-slate-50 p-1'>Confirm Details</h2>
                        <div className=' flex items-start justify-center text-slate-500 dark:text-slate-300 flex-col w-full px-5 mt-1'>
                            <div>Phone number: {phoneNumber}</div>
                            <div>Network: {networkSelected}</div>
                            <div>Amount: N{amount}</div>
                        </div>
                        <div className=' w-full p-2 px-0 my-2 flex items-center justify-around'>
                            <button onClick={() => setConfirmModal(false)} className=' p-1 px-5 text-sm bg-orange-500 text-slate-50 rounded-full'>Edit</button>
                            <button onClick={handleSendAirtime} className=' p-1 px-5 text-sm bg-gradient-to-tl from-green-600 via-green-500 to-green-800 duration-200 active:to-green-600 active:via-green-600 active:scale-[0.98] text-slate-50 rounded-full'>Confirm</button>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    )
}

export default Rewards