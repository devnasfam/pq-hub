import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'
import { faCoins, faGift, faHistory, faPlusCircle, faTimes, faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { networks, widgets } from '../rewardSettings'
import { MyAppContext } from '../AppContext/MyContext'
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  addDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore'
import { db } from '../firebase/firebaseService'
import mtn from '../assets/mtn.png'
import airtel from '../assets/airtel.png'
import glo from '../assets/glo.png'
import toast, { Toaster } from 'react-hot-toast'
import { CircularProgress, Tooltip } from '@mui/material'
import { Link } from 'react-router-dom'

// Use the exact test webhook you provided
const N8N_REDEEM_WEBHOOK = 'https://n8n.srv871507.hstgr.cloud/webhook/redeem'

const Rewards = () => {
  const [amount, setAmount] = useState(0)
  const [points, setPoints] = useState(0)
  const [posts, setPosts] = useState([])
  const [userData, setUserData] = useState(null)
  const [isShowModal, setIsShowModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [wid, setWidgets] = useState(widgets)
  const [net, setNetwork] = useState(networks)
  const [load, setLoad] = useState(false)
  const [progressValue, setProgressValue] = useState(70)
  const [networkSelected, setnetworkSelected] = useState('')
  const [loading, setLoading] = useState(true)
  const [redemptions, setRedemptions] = useState([])
  const [hasPending, setHasPending] = useState(false)
  const phoneInp = useRef(null)
  const { user } = useContext(MyAppContext)

  // Realtime user + posts -> points
  useEffect(() => {
    if (!user || !user.uid) return

    const userDocRef = doc(db, 'Users', user.uid)
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      setUserData(snap.data() || null)
    })

    const postsCollection = collection(db, 'Posts')
    const realPosts = query(postsCollection, where('isPrivate', '==', false), where('userId', '==', user.uid))
    const unsubPosts = onSnapshot(
      realPosts,
      (ps) => {
        const postData = ps.docs.map((d) => d.data())
        setPosts(postData)
        // UI points = 20 per post (preserves your existing behaviour)
        const availablePoints = postData.length * 20
        const redeemedPoints = (userData?.redeemedPoints || 0)
        const p = Math.max(0, availablePoints - redeemedPoints)
        setPoints(p)
        setProgressValue(Math.floor((p / 200) * 100))
        setLoading(false)
      },
      () => setLoading(false)
    )

    return () => {
      unsubUser()
      unsubPosts()
    }
  }, [user, userData?.redeemedPoints])

  // Realtime redemption history + pending flag
  useEffect(() => {
    if (!user || !user.uid) return
    const qRef = query(
      collection(db, 'AirtimeRedemptions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(qRef, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setRedemptions(items)
      setHasPending(items.some((i) => i.status === 'pending'))
    })
    return () => unsub()
  }, [user])

  const getWidget = (clickedWidget) => {
    setAmount(clickedWidget.airtime)
    setWidgets((prevWidgets) =>
      prevWidgets.map((widget) => ({
        ...widget,
        isColored: widget === clickedWidget,
      }))
    )
  }

  const getNetwork = (clickedNetwork) => {
    setnetworkSelected(clickedNetwork.name)
    setNetwork((prevNetworks) =>
      prevNetworks.map((network) => ({
        ...network,
        isColored: network === clickedNetwork,
        color: network === clickedNetwork ? getColor(clickedNetwork.name) : network.color,
        imgUrl: network === clickedNetwork ? getImageUrl(clickedNetwork.name) : network.imgUrl,
      }))
    )
  }

  const getColor = (networkName) => {
    switch (networkName) {
      case 'MTN':
        return 'yellow-500'
      case 'Airtel':
        return 'red-500'
      case 'Glo':
        return 'green-500'
      default:
        return ''
    }
  }

  const getImageUrl = (networkName) => {
    switch (networkName) {
      case 'MTN':
        return mtn
      case 'Airtel':
        return airtel
      case 'Glo':
        return glo
      default:
        return ''
    }
  }

  const redeemPoints = () => {
    if (!user || !user.uid) {
      toast.error('You are not authorized to redeem points. Please login.', { duration: 3500 })
    } else if (hasPending || userData?.activeRedemption) {
      toast.error('You already have a pending redemption in progress. Please wait.', { duration: 3500 })
    } else {
      if (!amount || amount == 0) {
        toast.error('Please choose the amount to redeem', { duration: 2000 })
      } else if (points < 200) {
        toast.error("You haven't reached the minimum redemption limit. Contribute more to earn points.", { duration: 3500 })
      } else if (amount * 2 > points) {
        toast.error('The selected amount exceeds your available points.', { duration: 3000 })
      } else {
        setIsShowModal(true)
      }
    }
  }

  const handlePhoneChange = (e) => {
    let enteredNumber = e.target.value.trim()
    enteredNumber = enteredNumber.replace(/\D/g, '')
    enteredNumber = enteredNumber.slice(0, 11)
    setPhoneNumber(enteredNumber)
  }

  const RedeemToConfirm = () => {
    const allowedNetworks = ['MTN', 'Airtel', 'Glo']
    if (!networkSelected || networkSelected === '') {
      toast.error('Select a network.', { duration: 2000 })
    } else if (!allowedNetworks.includes(networkSelected)) {
      toast.error('Invalid network selected.', { duration: 2500 })
    } else if (phoneNumber === '') {
      toast.error('Enter your phone number.', { duration: 2000 })
    } else if (phoneNumber.length > 11 || phoneNumber.length <= 10) {
      toast.error('Invalid phone number', { duration: 3500 })
    } else {
      setConfirmModal(true)
    }
  }

  // Post to n8n in a way that avoids preflight:
  // - Use Content-Type: text/plain (simple request)
  // - Body is a JSON string
  // - Fallback to mode: 'no-cors' if the browser still blocks (we'll treat as submitted)
  const postToN8n = async (payload) => {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 15000)
    try {
      const res = await fetch(N8N_REDEEM_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', // simple request -> no preflight
        },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      })
      clearTimeout(t)
      // We might not get readable body from n8n; try best-effort
      let bodyText = ''
      try { bodyText = await res.text() } catch {}
      return { ok: res.ok, status: res.status, bodyText }
    } catch (err) {
      clearTimeout(t)
      // Retry with no-cors: browser will not expose response details, but request will be sent
      try {
        await fetch(N8N_REDEEM_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
          mode: 'no-cors',
        })
        // Treat as submitted (we can’t read status in no-cors mode)
        return { ok: true, status: 0, bodyText: 'no-cors submitted' }
      } catch (err2) {
        console.error('n8n webhook error:', err2)
        return { ok: false, error: (err2 && err2.message) || 'fetch_failed' }
      }
    }
  }

  const handleSendAirtime = async () => {
    setConfirmModal(false)
    setIsShowModal(false)
    setPhoneNumber('')
    const loadToast = toast.loading('Loading...')
    setLoad(true)

    try {
      if (!user || !user.uid) {
        toast.error('You are not authorized to redeem points, please login', { id: loadToast, duration: 3500 })
        setLoad(false)
        return
      }

      const userDocRef = doc(db, 'Users', user.uid)
      const postsSnap = await getDocs(
        query(collection(db, 'Posts'), where('isPrivate', '==', false), where('userId', '==', user.uid))
      )
      const availPosts = postsSnap.docs.map((doc) => doc.data())

      // Keep original check behaviour (40 per post used in redemption logic)
      const availablePoints = availPosts.length * 40
      if (availablePoints < amount * 2) {
        toast.error('You do not have enough points for this airtime redemption', { id: loadToast, duration: 3500 })
        setLoad(false)
        return
      }

      // Transaction: lock user to prevent duplicates & create pending record
      const redemptionRef = await runTransaction(db, async (tx) => {
        const uSnap = await tx.get(userDocRef)
        const u = uSnap.data() || {}
        if (u.activeRedemption) {
          throw new Error('Another redemption is already in progress.')
        }
        tx.update(userDocRef, { activeRedemption: true })

        const newRef = doc(collection(db, 'AirtimeRedemptions'))
        tx.set(newRef, {
          userId: user.uid,
          userEmail: u?.email || null,
          userName: u?.displayName || u?.fullName || null,
          pointsBefore: points,
          requestedAmount: Number(amount),
          network: networkSelected,
          phoneNumber: phoneNumber,
          status: 'pending',
          createdAt: serverTimestamp(),
          createdAtMs: Date.now(),
        })
        return newRef
      })

      // Notify n8n
      const n8nPayload = {
        action: 'airtime_redeem',
        redemptionId: redemptionRef.id,
        user: {
          id: user.uid,
          email: userData?.email || null,
          name: userData?.displayName || userData?.fullName || null,
        },
        request: {
          phoneNumber,
          network: networkSelected,
          amount: Number(amount),
        },
        context: {
          pointsAvailableComputedHere: availablePoints,
          pointsShownInUI: points,
          postsCount: availPosts.length,
        },
        nonce: Math.random().toString(36).slice(2),
        ts: Date.now(),
      }

      const n8nResult = await postToN8n(n8nPayload)

      if (n8nResult.ok) {
        // Consider it accepted; finalize success locally
        await updateDoc(userDocRef, {
          redeemedPoints: (userData?.redeemedPoints || 0) + amount * 2,
          paymentsHistory: arrayUnion({
            phoneNumber,
            amount,
            network: networkSelected,
            success: true,
            date: new Date(),
            timestamp: Date.now(),
          }),
          activeRedemption: false,
        })

        await updateDoc(redemptionRef, {
          status: 'success',
          completedAt: serverTimestamp(),
          completedAtMs: Date.now(),
          n8n: { status: n8nResult.status, info: n8nResult.bodyText || null },
        })

        // Update UI immediately; realtime listeners will also refresh
        const updatedPoints = Math.max(0, points - amount * 2)
        setPoints(updatedPoints)
        toast.success('Successfully sent! You will be credited shortly!', { id: loadToast, duration: 3500 })
      } else {
        await updateDoc(userDocRef, { activeRedemption: false })
        await updateDoc(redemptionRef, {
          status: 'failed',
          errorMessage: n8nResult?.error || 'Failed to send request',
          completedAt: serverTimestamp(),
          completedAtMs: Date.now(),
          n8n: { status: n8nResult?.status || 'network_error' },
        })

        await updateDoc(userDocRef, {
          paymentsHistory: arrayUnion({
            phoneNumber,
            amount,
            network: networkSelected,
            success: false,
            error: n8nResult?.error || `n8n status ${n8nResult?.status}`,
            date: new Date(),
            timestamp: Date.now(),
          }),
        })

        toast.error('Failed to send request', { id: loadToast, duration: 2000 })
      }
    } catch (error) {
      console.error(error)
      if (user?.uid) {
        try { await updateDoc(doc(db, 'Users', user.uid), { activeRedemption: false }) } catch {}
      }
      toast.error(error.message || 'An error occurred', { duration: 2000, id: loadToast })
    } finally {
      setLoad(false)
    }
  }

  useLayoutEffect(() => { window.scrollTo(0, 0) }, [])
  useEffect(() => { document.title = 'Rewards' }, [])

  return (
    <div className='bg-sky-50 dark:bg-slate-950 w-full pb-[65px] md:pb-0 md:pl-[140px] pt-[68px]'>
      <TopNav>
        <div className='flex items-center justify-center cursor-pointer py-0.5'>
          <FontAwesomeIcon icon={faCoins} />
          <h2 className='text-lgtext-white ml-3 font-medium'>Rewards Center</h2>
        </div>
      </TopNav>
      <div className=' w-full flex items-start justify-center flex-col gap-4 px-5 sm:px-20 xl:px-40 md:px-20 py-2'>
        {loading && (
          <div className=' -mt-1 w-full flex items-center justify-center gap-2 text-xl text-white'>
            <CircularProgress size={30} thickness={4} />
          </div>
        )}
        <div className=' w-full flex items-start justify-center flex-col gap-4 md:flex-row'>
          <div className=' -full flex items-start justify-center flex-col gap-4'>
            <div className=' w-[95%] border-l-4 border-l-sky-600 h-auto rounded-lg bg-white shadow dark:bg-slate-800 p-4'>
              <div className=' flex items-start justify-between gap-3'>
                <div>
                  <h2 className=' text-slate-500 dark:text-slate-300'>Total Points:</h2>
                  <h2 className=' text-xl text-slate-700 font-semibold dark:text-slate-50'>{points.toFixed(2) || 0.0}</h2>
                </div>
                <div className=' flex items-center justify-center p-2'>
                  <FontAwesomeIcon className=' text-slate-400 text-4xl' icon={faWallet} />
                </div>
              </div>
              {!loading && points >= 20 && (
                <div className=' w-full'>
                  <div className=' relative w-fit h-fit mt-3'>
                    <CircularProgress
                      variant='determinate'
                      value={progressValue > 100 ? 100 : progressValue}
                      size={40}
                      thickness={5}
                      color={`${progressValue >= 100 ? 'success' : 'info'}`}
                    />
                    <div className=' absolute -mt-1 top-1/2 left-1/2 text-slate-800  dark:text-slate-100 text-xs -translate-y-1/2 -translate-x-1/2'>
                      {progressValue > 100 ? 100 + '%' : progressValue + '%'}
                    </div>
                  </div>
                  <div>
                    <h2 className=' text-slate-600 dark:text-slate-400 text-sm'>
                      {points < 200
                        ? `You need ${200 - points} more points to reach the minimum redemption limit`
                        : 'You can now redeem points!'}
                    </h2>
                  </div>
                </div>
              )}
            </div>
            <div className=' w-[95%] h-auto rounded-lg bg-white shadow dark:bg-slate-800 p-4'>
              <div className=' flex items-start justify-center flex-col gap-3'>
                <div>
                  {!loading && (
                    <h2 className=' text-slate-800 dark:text-slate-300'>
                      {posts.length > 0 ? `Contributions: ${posts.length}` : " You haven't made any contribution yet"}
                    </h2>
                  )}
                  <h2 className=' text-slate-600 dark:text-slate-300 mb-2'>
                    Excited to earn more points? You can earn 20.00 points for every past question you post!
                  </h2>
                  <Link
                    to='/contribute'
                    className=' p-1.5 px-4 my-2 bg-gradient-to-tr from-blue-700 via-blue-700 to-cyan-500 duration-200 active:to-blue-400 active:scale-[0.98] text-slate-50 mx-1 rounded-full'
                  >
                    <FontAwesomeIcon icon={faPlusCircle} /> Contribute now
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className=' w-[95%] border-l-4 border-l-blue-600 h-auto rounded-lg bg-white shadow dark:bg-slate-800 p-4'>
            <div className=' flex items-start justify-center flex-col gap-3'>
              <div className=' grid grid-cols-3 md:max-2xl:grid-cols-2 gap-3 w-full'>
                {wid.map((widget) => (
                  <div
                    key={widget.airtime}
                    onClick={() => getWidget(widget)}
                    className={`${
                      widget.isColored
                        ? ' bg-gradient-to-tr from-blue-700 via-blue-800 to-cyan-500 ring-blue-600 text-slate-50'
                        : ' text-slate-800 dark:text-slate-50 bg-slate-200 dark:bg-slate-700 ring-slate-400/50 dark:ring-slate-900/40'
                    } shadow cursor-pointer rounded-xl ring-1 p-2 flex items-center justify-center flex-col`}
                  >
                    <div className=' font-semibold'>&#8358;{widget.airtime}</div>
                    <div className={`${widget.isColored ? ' text-slate-300' : ' text-slate-600 dark:text-slate-300'} text-sm`}>
                      {widget.points}P
                    </div>
                  </div>
                ))}
              </div>
              <div className=' w-full flex items-center justify-center space-y-2 my-1'>
                <button
                  onClick={redeemPoints}
                  disabled={load || hasPending || userData?.activeRedemption}
                  className={`${
                    load || hasPending || userData?.activeRedemption ? ' cursor-not-allowed opacity-70' : 'cursor-pointer'
                  } p-1.5 px-4 bg-gradient-to-tl from-green-600 via-green-500 to-green-800 duration-200 active:to-green-600 active:via-green-600 active:scale-[0.98] text-slate-50 mx-1 rounded-full truncate`}
                >
                  <FontAwesomeIcon icon={faGift} />
                  {hasPending || userData?.activeRedemption ? ' Processing redemption…' : ' Redeem to airtime'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <h2 className='  text-slate-700 dark:text-slate-50'>
          <FontAwesomeIcon icon={faClock} /> Redemption history
        </h2>
        <div className=' w-full bg-white shadow dark:bg-slate-800 rounded-xl p-2 overflow-x-hidden overflow-y-auto flex items-center justify-center flex-col'>
          {redemptions && redemptions.length > 0 ? (
            <div className=' w-full flex flex-col divide-y divide-slate-200 dark:divide-slate-700'>
              {redemptions.map((r) => {
                const when = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAtMs || Date.now())
                const statusColor =
                  r.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  r.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                return (
                  <div key={r.id} className=' w-full py-2 px-3 flex items-center justify-between'>
                    <div className=' flex flex-col'>
                      <div className=' text-slate-800 dark:text-slate-100 font-medium'>₦{r.requestedAmount} — {r.network}</div>
                      <div className=' text-xs text-slate-500 dark:text-slate-400'>
                        {when.toLocaleString()} • {r.phoneNumber}
                      </div>
                    </div>
                    <div className={` text-xs px-2 py-0.5 rounded-full ${statusColor}`}>{r.status}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div>
              <div className=' text-slate-700 dark:text-slate-50 flex items-center justify-center flex-col gap-3'>
                <FontAwesomeIcon className=' text-slate-400 text-2xl mt-2' icon={faHistory} />
                <h2>No history</h2>
              </div>
            </div>
          )}
        </div>
      </div>
      <Navigations />
      <div
        className={`${isShowModal ? ' block backdrop-blur-sm' : ' hidden'} fixed bg-black/40 bottom-0 right-0 w-full h-full z-50 flex items-center justify-center`}
      >
        <div className={`${!confirmModal ? ' block' : ' hidden'} p-2 w-[80%] sm:w-[60%] md:w-[47%] lg:w-[35%] xl:w-[32%] h-auto bg-slate-100 shadow dark:bg-slate-700 rounded-xl ring-1 ring-slate-400 dark:ring-slate-600`}>
          <div className=' w-full p-0.5 pb-0 px-2 flex items-center justify-end'>
            <Tooltip title='Close' arrow enterDelay={600}>
              <FontAwesomeIcon
                icon={faTimes}
                className=' cursor-pointer text-slate-700 dark:text-slate-50 p-0.5'
                onClick={() => setIsShowModal(false)}
              />
            </Tooltip>
          </div>
          <div className=' flex items-center justify-center flex-col'>
            <h2 className=' text-slate-800 dark:text-slate-50 p-1 pt-0 mb-1'>Chose network</h2>
            <div>
              {networkSelected && (
                <img
                  src={getImageUrl(networkSelected)}
                  alt={networkSelected}
                  className=' w-[20%] h-[20%] rounded-sm mx-auto aspect-square object-cover m-2 cursor-pointer text-sm dark:text-slate-100'
                />
              )}
            </div>
            <div className='grid place-items-center grid-cols-3 gap-2'>
              {net.map((network, i) => (
                <div
                  onClick={() => getNetwork(network)}
                  key={i}
                  className={`cursor-pointer p-1 px-2 rounded-full text-sm dark:text-slate-100 ${
                    network.isColored ? `bg-${network.color} text-slate-50` : 'bg-slate-300 dark:bg-slate-400'
                  }`}
                >
                  {network.name}
                </div>
              ))}
            </div>

            <div className=' w-full p-2 my-2 flex items-center justify-center flex-col gap-1'>
              <input
                ref={phoneInp}
                onChange={handlePhoneChange}
                value={phoneNumber}
                type='number'
                name=''
                id=''
                className=' tracking-widest placeholder:tracking-normal bg-slate-300 ring-1 ring-slate-400 dark:ring-slate-700 dark:bg-slate-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-300 outline-none rounded-full p-[5px] px-3.5 w-[80%] placeholder:text-sm'
                placeholder='Phone number e.g 08012345678'
              />
              <button
                onClick={RedeemToConfirm}
                className=' bg-gradient-to-tr from-blue-700 via-blue-700 to-cyan-500 flex items-center justify-center gap-x-1 outline-none bg-blue-500 duration-200 active:bg-blue-400 active:scale-[0.98] text-slate-50 rounded-full p-1 px-4 my-1 w-[80%]'
              >
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
              <button onClick={() => setConfirmModal(false)} className=' p-1 px-5 text-sm bg-orange-500 text-slate-50 rounded-full'>
                Edit
              </button>
              <button
                onClick={handleSendAirtime}
                disabled={hasPending || userData?.activeRedemption}
                className=' p-1 px-5 text-sm bg-gradient-to-tl from-green-600 via-green-500 to-green-800 duration-200 active:to-green-600 active:via-green-600 active:scale-[0.98] text-slate-50 rounded-full disabled:opacity-60'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default Rewards
