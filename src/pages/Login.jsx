import React, { useContext, useEffect, useRef, useState } from 'react'
import book from '../assets/openbook.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faEye, faEyeSlash, faLock, faSignIn, faUserGraduate } from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/firebaseService'
import { MyAppContext } from '../AppContext/MyContext'
import toast, { Toaster } from 'react-hot-toast'

const Login = () => {
  const [sending, setSending] = useState(false);
  const { setUser } = useContext(MyAppContext)

  const [signInDetails, setSignInDetails] = useState({
    email: '',
    password: '',
  })

  const [isopen, setIsopen] = useState(false)

  const HandleShowPassword = () => {
    setIsopen((prev) => !prev)
    if (isopen) {
      passRef.current.type = 'password'
    } else {
      passRef.current.type = 'text'
    }
  }

  const errorMessages = {
    email: {
      required: 'Please provide your email address',
      invalidFormat: 'The email format is invalid',
      alreadyExists: 'This email is already in use'
    },
    password: {
      required: 'Please enter your password',
      invalidFormat: 'Wrong Password'
    }
  }

  const passRef = useRef(null);
  const btnRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignInDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }))
  }

  const HandleLoginCheck = async () => {
    try {
      if (signInDetails.email == "" || signInDetails.email == null) {
        toast.error(errorMessages.email.required, { duration: 2000 })
      }
      else if (signInDetails.email.indexOf('@') < 1 || signInDetails.email.lastIndexOf(".") < signInDetails.email.indexOf("@") + 2 || signInDetails.email.lastIndexOf(".") + 2 >= signInDetails.email.length) {
        toast.error(errorMessages.email.invalidFormat, { duration: 2000 })
      }
      else if (signInDetails.password == "" || signInDetails.password == null) {
        toast.error(errorMessages.password.required, { duration: 2000 })
      }
      else if (signInDetails.password.length < 6) {
        toast.error(errorMessages.password.invalidFormat, { duration: 2000 })
      } else {
        const email = signInDetails.email
        const password = signInDetails.password
        const loadToast = toast.loading('Logging in...', { duration: Infinity })
        setSending(true);
        try {
          const loginCredential = await signInWithEmailAndPassword(auth, email, password)
          const regUser = loginCredential.user;
          setUser(regUser)
          toast.success('Login Successfull', { duration: 2000, id: loadToast })
        } catch (error) {
          setSending(false)
          if (error.code === 'auth/user-not-found') {
            toast.error('User not found. Please register to create an account', { duration: 2000, id: loadToast })
          } else if (error.code === 'auth/invalid-credential') {
            toast.error('Incorrect password/email. Please try another or reset your password', { duration: 2000, id: loadToast })
          } else if (error.code === 'auth/network-request-failed') {
            toast.error('Network error', { duration: 2000, id: loadToast })
          }
          else {
            toast.error(error.message, { duration: 2000, id: loadToast })
          }
        }
      }
    } catch (error) {
      toast.error(error.message, { duration: 2000 })
      console.log(error)
    }
  }

  const HandleLogin = async () => {
    await HandleLoginCheck()
  }

  useEffect(() => {
    const handleEnter = async (e) => {
      if (e.key === 'Enter') {
        await HandleLoginCheck();
      }
    }
    window.addEventListener('keypress', handleEnter);
    return () => {
      window.removeEventListener('keypress', handleEnter);
    }
  }, [signInDetails])

  const navigate = useNavigate()
  useEffect(() => {
    document.title = 'Log In'
    const AuthCheck = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        setTimeout(() => {
          navigate('/feed')
        }, 2000)
      }
    })
    return () => AuthCheck();
  }, [document.title, navigate])

  return (
    <div className='overflow-hidden w-full min-h-screen'>
      <div className='w-full min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center lg:gap-x-2'>
        <div className='hidden xl:flex items-start justify-center flex-col gap-1 text-white pl-[20px]'>
          <h2 className=' w-[50%] text-slate-800 dark:text-slate-100 text-2xl tracking-wider font-bold'>
            PQ Hub helps you find and share past questions with the students.
          </h2>
          <div className='w-full relative mt-1 flex items-center justify-start'>
            <div className=' delay-200 w-[30%] h-[65%] bg-cyan-600/80 shadow-2xl shadow-pink-600 absolute -translate-y-1/2 top-1/2 left-0 rounded-full blur-2xl' />
            <img src={book} loading='lazy' className=' hover:scale-[1.05] duration-300 object-cover w-[260px] h-[260px] z-10' alt="PQ Hub Logo" />
          </div>
        </div>
        <div className='w-[85%] xl:-ml-[220px] sm:w-[65%] md:w-[50%] lg:w-[40%] xl:w-[30%] h-auto p-3 py-9 pt-5 border border-slate-200 dark:border-slate-800 bg-[rgba(255,255,255,.75)] dark:bg-[rgba(2,6,23,.55)]/30 backdrop-blur-md shadow-[10px_10px_10px_rgba(0,0,0,.05)] rounded-lg'>
          <div className='w-full p-2 text-slate-700 dark:text-white text-xl flex items-center py-3 mb-2 font-bold tracking-wide gap-2 justify-center'>
            Login to your account
            <FontAwesomeIcon icon={faUserGraduate} />
          </div>
          <div className='flex flex-col gap-3 items-center justify-center w-full mx-auto'>
            <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[85%] mx-auto'>
              <FontAwesomeIcon icon={faEnvelope} className='text-slate-700 text-lg pl-3' />
              <input type="email" placeholder='Email address' value={signInDetails.email} onChange={handleChange} name='email' className='dark:placeholder-slate-500 placeholder-slate-600 font-medium p-2 px-3 rounded-md w-full outline-none border-none bg-transparent' />
            </div>
            <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[85%] mx-auto'>
              <FontAwesomeIcon icon={faLock} className='text-slate-700 text-lg pl-3' />
              <input type="password" placeholder='Password' value={signInDetails.password} onChange={handleChange} ref={passRef} name='password' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none' />
              <FontAwesomeIcon className='text-slate-700 text-lg p-2 mr-1 cursor-pointer' icon={isopen ? faEye : faEyeSlash} onClick={HandleShowPassword} />

            </div>
            <button onClick={HandleLogin} ref={btnRef} disabled={sending} className={`${sending ? ' cursor-not-allowed' : ' cursor-pointer'} p-2 px-3 shadow bg-blue-500 text-white rounded-md w-[85%] font-medium tracking-wide text-lg outline-none border-none`}><span>{'Log in'}</span> <FontAwesomeIcon icon={faSignIn} /></button>
            <div className='w-full flex items-center justify-center gap-2 text-slate-900 dark:text-slate-50 text-sm mt-1'>Don't have an account? <Link to='/signup' className='text-slate-700 dark:text-slate-50 font-medium underline'>Sign Up</Link></div>
            <div className='w-full flex items-center justify-center gap-2 text-slate-900 dark:text-slate-50 text-sm mt-1'>Forgot Password? <Link to='/reset-password' className='text-slate-700 dark:text-slate-50 font-medium underline'>Reset </Link></div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default Login