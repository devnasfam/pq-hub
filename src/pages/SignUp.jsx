import React, { useContext, useEffect, useState } from 'react'
import book from '../assets/openbook.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faEye, faEyeSlash, faListNumeric, faLock, faSignIn, faUserCircle, faUserGraduate } from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/firebaseService'
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { MyAppContext } from '../AppContext/MyContext'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
const SignUp = () => {

  const { setUser } = useContext(MyAppContext);
  const [signUpDetails, setSignUpDetails] = useState({
    username: '',
    fullName: '',
    email: '',
    admNumber: '',
    password: '',
    confirmPassword: '',
    gender: ''
  })

  const [isopen, setIsopen] = useState(false)
  const [isopen2, setIsopen2] = useState(false)
  const [sending, setSending] = useState(false)

  const passRef = useRef(null)
  const confirmpassRef = useRef(null)
  const btnRef = useRef(null)
  const HandleShowPassword = () => {
    setIsopen((prev) => !prev)
    if (isopen) {
      passRef.current.type = 'password'
    } else {
      passRef.current.type = 'text'
    }
  }
  const HandleShowPassword2 = () => {
    setIsopen2((prev) => !prev)
    if (isopen2) {
      confirmpassRef.current.type = 'password'
    } else {
      confirmpassRef.current.type = 'text'
    }
  }
  const errorMessages = {
    usernamee: {
      required: 'Please enter a username',
      minLenght: 'Your username should be at least 6 characters long'
    },
    fullName: {
      required: 'Full Name is required',
      minLenght: 'Invalid Full Name Format'
    },
    email: {
      required: 'Please provide your email address',
      invalidFormat: 'The email format is invalid',
      alreadyExists: 'This email is already in use'
    },
    admNumber: {
      required: 'Please enter your admission number',
      minLenght: 'Your admission number must be 10 characters'
    },
    password: {
      required: 'Create a password for your account',
      invalidFormat: 'Password must be 6 characters long'
    },
    confirmPassword: {
      required: 'Confirm your password',
      misMatch: 'Oops! The passwords you entered do no match'
    },
    gender: {
      required: 'Please select your gender'
    }

  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignUpDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }))
  }

  const handleGender = (e) => {
    const { name, value } = e.target;
    setSignUpDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const HandleSignUpCheck = async () => {

    if (signUpDetails.username == "" || signUpDetails.username == null) {
      toast.error(errorMessages.usernamee.required, { duration: 2000 })
    }
    else if (signUpDetails.username.length < 6) {
      toast.error(errorMessages.usernamee.minLenght, { duration: 2000 })
    }
    else if (signUpDetails.admNumber == "" || signUpDetails.admNumber == null) {
      toast.error(errorMessages.admNumber.required, { duration: 2000 })
    }
    else if (signUpDetails.admNumber.length < 10 || signUpDetails.admNumber.length > 10) {
      toast.error(errorMessages.admNumber.minLenght, { duration: 2000 })
    }
    else if (signUpDetails.fullName == "" || signUpDetails.fullName == null) {
      toast.error(errorMessages.fullName.required, { duration: 2000 })
    }
    else if (signUpDetails.fullName.length < 6) {
      toast.error(errorMessages.fullName.minLenght, { duration: 2000 })
    }
    else if (signUpDetails.email == "" || signUpDetails.email == null) {
      toast.error(errorMessages.email.required, { duration: 2000 })
    }
    else if (signUpDetails.email.indexOf('@') < 1 || signUpDetails.email.lastIndexOf(".") < signUpDetails.email.indexOf("@") + 2 || signUpDetails.email.lastIndexOf(".") + 2 >= signUpDetails.email.length) {
      toast.error(errorMessages.email.invalidFormat, { duration: 2000 })
    }
    else if (signUpDetails.password == "" || signUpDetails.password == null) {
      toast.error(errorMessages.password.required, { duration: 2000 })
    }
    else if (signUpDetails.password.length < 6) {
      toast.error(errorMessages.password.invalidFormat, { duration: 2000 })
    }
    else if (signUpDetails.confirmPassword == "" || signUpDetails.confirmPassword == null) {
      toast.error(errorMessages.confirmPassword.required, { duration: 2000 })
    }
    else if (signUpDetails.password !== signUpDetails.confirmPassword) {
      toast.error(errorMessages.confirmPassword.misMatch, { duration: 2000 })
    }
    else if (!signUpDetails.gender) {
      toast.error(errorMessages.gender.required, { duration: 2000 })
    } else {
      const usersRef = collection(db, "Users");
      toast.dismiss()
      const loadToast = toast.loading('Signing up...', { duration: Infinity })
      setSending(true)
      const usernameSnapshot = await getDocs(query(usersRef, where('username', '==', signUpDetails.username.toLowerCase().trim())));
      if (!usernameSnapshot.empty) {
        setSending(false);
        toast.error('Username already exists!', { duration: 2000, id: loadToast })
        return;
      }

      const admNumberSnapshot = await getDocs(query(usersRef, where('admNumber', '==', signUpDetails.admNumber)));
      if (!admNumberSnapshot.empty) {
        setSending(false);
        toast.error('Admission number already exists!', { duration: 2000, id: loadToast })
        return;
      }

      const email = signUpDetails.email;
      const password = signUpDetails.confirmPassword;
      let department = '';

      if (signUpDetails.admNumber.slice(4, 7) === '204') {
        department = 'Computer Science';
      } else {
        department = '';
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const regUser = userCredential.user;
        setUser(regUser);
        toast.success('Sign up successfull!', { duration: 2000, id: loadToast })
        btnRef.current.disabled = true;
        await setDoc(doc(db, "Users", regUser.uid), {
          id: regUser.uid,
          username: signUpDetails.username.toLowerCase().trim(),
          fullName: signUpDetails.fullName,
          email: signUpDetails.email,
          admNumber: signUpDetails.admNumber,
          department: department,
          profilePicture: '',
          gender:signUpDetails.gender
        });
      } catch (error) {
        setSending(false)
        if (error.code === 'auth/email-already-in-use') {
          toast.error('Email already in use', { duration: 2000, id: loadToast })
        } else if (error.code === 'auth/network-request-failed') {
          toast.error('Network error', { duration: 2000, id: loadToast })
        } else {
          toast.error(error.message, { duration: 2000, id: loadToast })
        }
      }
    }
  };

  const HandleSignUp = async () => {
    await HandleSignUpCheck()
  }

  useEffect(() => {
    const handleEnter = async (e) => {
      if (e.key === 'Enter') {
        await HandleSignUpCheck();
      }
    }
    window.addEventListener('keypress', handleEnter);
    return () => {
      window.removeEventListener('keypress', handleEnter);
    }
  }, [signUpDetails])

  const navigate = useNavigate()
  useEffect(() => {
    document.title = 'Sign Up'
    const AuthCheck = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        setTimeout(() => {
          navigate('/feed')
        }, 2500)
      }
    })
    return () => AuthCheck();
  }, [document.title, navigate])

  return (
    <div className='overflow-hidden w-full min-h-screen'>
      <div className='w-full min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center lg:gap-x-2'>
        <div className='hidden xl:flex items-start justify-center flex-col gap-1 text-white pl-[20px]'>
          <h2 className=' w-[50%] text-2xl text-slate-800 dark:text-slate-100 tracking-wider font-bold'>
            PQ Hub helps you find and share past questions with the students.
          </h2>
          <div className='w-full relative mt-1 flex items-center justify-start'>
            <div className=' delay-200 w-[30%] h-[65%] bg-cyan-600/80 shadow-2xl shadow-pink-600 absolute -translate-y-1/2 top-1/2 left-0 rounded-full blur-2xl' />
            <img src={book} loading='lazy' className=' hover:scale-[1.05] duration-300 object-cover w-[260px] h-[260px] z-10' alt="PQ Hub Logo" />
          </div>
        </div>
        <div className='w-[85%] sm:w-[65%] xl:-ml-[220px] md:w-[50%] lg:w-[40%] xl:w-[30%] h-auto p-3 px-0 py-9 pt-5 border border-slate-200 dark:border-slate-800 bg-[rgba(255,255,255,.75)] dark:bg-[rgba(2,6,23,.55)]/30 backdrop-blur-md shadow-[10px_10px_10px_rgba(0,0,0,.05)] rounded-lg'>
          <div className='w-full p-2 tracking-wide text-slate-700 dark:text-white text-xl flex items-center py-3 mb-2 font-bold gap-2 justify-center'>
            Create an account
            <FontAwesomeIcon icon={faUserGraduate} />
          </div>
          <div className='flex flex-col gap-3 items-center justify-center w-full mx-auto'>
            <div className=' w-full px-8 max-[400px]:px-6 max-[480px]:px-7 max-[320px]:px-5 md:px-[34px] lg:px-8 flex items-center justify-center gap-2'>
              <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[85%] mx-auto'>
                <FontAwesomeIcon icon={faUserGraduate} className='text-slate-700 text-md pl-3' />
                <input type="text" placeholder='Username' value={signUpDetails.username} onChange={handleChange} name='username' autoCapitalize='off' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none text-sm' />
              </div>
              <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[85%] mx-auto'>
                <FontAwesomeIcon icon={faListNumeric} className='text-slate-700 text-md pl-3' />
                <input type="number" placeholder='Admission No.' value={signUpDetails.admNumber} onChange={handleChange} name='admNumber' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none text-sm' />
              </div>
            </div>
            <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[85%] mx-auto'>
              <FontAwesomeIcon icon={faUserCircle} className='text-slate-700 text-md pl-3' />
              <input type="text" placeholder='Full Name' value={signUpDetails.fullName} onChange={handleChange} name='fullName' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none text-sm' />
            </div>
            <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[85%] mx-auto'>
              <FontAwesomeIcon icon={faEnvelope} className='text-slate-700 text-md pl-3' />
              <input type="email" placeholder='Email address' value={signUpDetails.email} onChange={handleChange} name='email' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none text-sm' />
            </div>

            <div className=' w-full px-8 max-[400px]:px-6 max-[480px]:px-7 max-[320px]:px-5 md:px-[34px] lg:px-8 flex items-center justify-center gap-2'>
              <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[85%] mx-auto'>
                <FontAwesomeIcon icon={faLock} className='text-slate-700 text-md pl-3' />
                <input type="password" placeholder='Password' value={signUpDetails.password} onChange={handleChange} ref={passRef} name='password' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none text-sm' />
                <FontAwesomeIcon className='text-slate-700 text-md p-2 mr-1 cursor-pointer' icon={isopen ? faEye : faEyeSlash} onClick={HandleShowPassword} />
              </div>
              <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[85%] mx-auto'>
                <FontAwesomeIcon icon={faLock} className='text-slate-700 text-md pl-3' />
                <input type="password" placeholder='Confirm Password' value={signUpDetails.confirmPassword} onChange={handleChange} ref={confirmpassRef} name='confirmPassword' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none text-sm' />
                <FontAwesomeIcon className='text-slate-700 text-md p-2 mr-1 cursor-pointer' icon={isopen2 ? faEye : faEyeSlash} onClick={HandleShowPassword2} />
              </div>
            </div>

            <div className='flex justify-start items-center rounded-md w-[85%] mx-auto py-0.5'>
              <h2 className=' text-sm text-slate-800 dark:text-slate-50 px-1 mr-1'>Gender </h2>
              <div className=' flex items-center justify-start gap-1 space-x-1'>
                <label htmlFor='gender' className=' shadow ring-[1px] cursor-pointer flex items-center justify-center gap-1 bg-slate-50 p-0.5 px-1.5 rounded-md text-sm'>
                  <input type="radio" className=' cursor-pointer' value={'male'} checked={signUpDetails.gender === 'male'} onChange={handleGender} id='gender' name='gender' />
                  <h2>Male</h2>
                </label>
                <label htmlFor='gender2' className=' shadow ring-[1px] cursor-pointer flex items-center justify-center gap-1 bg-slate-50 p-0.5 px-1.5 rounded-md text-sm'>
                  <input type="radio" className=' cursor-pointer' value={'female'} checked={signUpDetails.gender === 'female'} onChange={handleGender} id='gender2' name='gender' />
                  <h2>Female</h2>
                </label>
              </div>
            </div>

            <button onClick={HandleSignUp} ref={btnRef} disabled={sending} className={`${sending ? ' cursor-not-allowed' : ' cursor-pointer'} p-1.5 px-3 bg-blue-500 text-white rounded-md w-[84%] font-medium outline-none border-none`}><span>{'Sign Up'}</span> <FontAwesomeIcon icon={faSignIn} /></button>
            <div className='w-full flex items-center justify-center gap-2 text-slate-900 dark:text-slate-50 text-sm mt-1'>Already have an account? <Link to='/login' className='text-slate-700 dark:text-slate-50 font-medium underline'>Login</Link></div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default SignUp
