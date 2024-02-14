import React, { useContext, useEffect, useRef, useState } from 'react'
import book from '../assets/openbook.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faEye, faEyeSlash, faLock, faSignIn, faUserGraduate } from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/firebaseService'
import { MyAppContext } from '../AppContext/MyContext'
const Login = () => {

  const { setUser } = useContext(MyAppContext)

  const [signInDetails, setSignInDetails] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({
    general: ''
  })

  const [isopen, setIsopen] = useState(false)

  const [success, setSuccess] = useState(false);
  const [successMsg, setsuccessMsg] = useState('')

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
    setErrors((prevError) => ({
      ...prevError,
      general: '',
      [name]: ''
    }))
  }

  const HandleLogin = async () => {
    try {
      if (signInDetails.email == "" || signInDetails.email == null) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: errorMessages.email.required
        }))
      }
      else if (signInDetails.email.indexOf('@') < 1 || signInDetails.email.lastIndexOf(".") < signInDetails.email.indexOf("@") + 2 || signInDetails.email.lastIndexOf(".") + 2 >= signInDetails.email.length) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: errorMessages.email.invalidFormat
        }))
      }
      else if (signInDetails.password == "" || signInDetails.password == null) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: errorMessages.password.required
        }))
      }
      else if (signInDetails.password.length < 6) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: errorMessages.password.invalidFormat
        }))
      } else {
        const email = signInDetails.email
        const password = signInDetails.password
        setsuccessMsg('Logging in...')
        try {
          const loginCredential = await signInWithEmailAndPassword(auth, email, password)
          const regUser = loginCredential.user;
          btnRef.current.disabled = true
          setSuccess(true)
          setUser(regUser)
          setsuccessMsg('')
        } catch (error) {
          setsuccessMsg('')
          if (error.code === 'auth/user-not-found') {
            setErrors((prevErrors) => ({
              ...prevErrors,
              general: 'User not found. Please register to create an account'
            }))
          } else if (error.code === 'auth/invalid-credential') {
            setErrors((prevErrors) => ({
              ...prevErrors,
              general: 'Incorrect password/email. Please try another or reset your password'
            }))
          } else {
            setErrors((prevErrors) => ({
              ...prevErrors,
              general: error
            }))
          }
          setSuccess(false)
        }
      }
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: error
      }))
      console.log(error)
    }
  }

  const navigate = useNavigate()
  useEffect(() => {
    document.title = 'Log In'
    const AuthCheck = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        setTimeout(() => {
          navigate('/feed')
        }, 1000)
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
          <img src={book} loading='lazy' className=' object-cover w-[260px] h-[260px]' alt="PQ Hub Logo" />
        </div>
        <div className='w-[85%] xl:-ml-[220px] sm:w-[65%] md:w-[50%] lg:w-[40%] xl:w-[30%] h-auto p-3 py-9 pt-5 border border-slate-200 dark:border-slate-700 bg-[rgba(255,255,255,.75)] dark:bg-[rgba(30,41,59,.75)] backdrop-blur-md shadow-[10px_10px_10px_rgba(0,0,0,.05)] rounded-lg'>
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
            {errors &&
              <div className=' max-w-[70%] -mt-1 my-1 mb-1.5 px-5 h-auto text-center text-red-500 text-base'>
                <span>{errors.general}</span>
              </div>
            }
            {success &&
              <div className=' max-w-[70%] -mt-1 my-1 mb-1.5 px-5 h-auto text-center text-green-500 text-base'>
                <span>Login Successfull!</span>
              </div>
            }
            <button onClick={HandleLogin} ref={btnRef} className='p-2 px-3 shadow bg-blue-500 text-white rounded-md w-[85%] font-medium tracking-wide text-lg outline-none border-none -mt-2'><span>{successMsg || 'Log in'}</span> <FontAwesomeIcon icon={!successMsg ? faSignIn : ''} /></button>

            <div className='w-full flex items-center justify-center gap-2 text-slate-900 dark:text-slate-50 text-sm mt-1'>Don't have an account? <Link to='/signup' className='text-slate-700 dark:text-slate-50 font-medium underline'>Sign Up</Link></div>
            <div className='w-full flex items-center justify-center gap-2 text-slate-900 dark:text-slate-50 text-sm mt-1'>Forgot Password? <Link to='/reset-password' className='text-slate-700 dark:text-slate-50 font-medium underline'>Reset </Link></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login