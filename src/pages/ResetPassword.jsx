import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import book from '../assets/openbook.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faHistory, faLockOpen, faRefresh, faTrashRestore, faWindowRestore } from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase/firebaseService'
import { MyAppContext } from '../AppContext/MyContext'

const ResetPassword = () => {

    const navigate = useNavigate()
    const { user, setUser } = useContext(MyAppContext)
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    useEffect(() => {
        document.title = 'FUBK PQ Hub - Reset Password'
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

    const [signInDetails, setResetDetails] = useState({
        email: ''
    })

    const [errors, setErrors] = useState({
        general: ''
    })

    const [success, setSuccess] = useState(false);
    const [successMsg, setsuccessMsg] = useState('')

    const errorMessages = {
        email: {
            required: 'Please provide your email address',
            invalidFormat: 'The email format is invalid',
            alreadyExists: 'This email is already in use'
        }
    }

    const btnRef = useRef(null)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setResetDetails((prevDetails) => ({
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
        } else {
            const email = signInDetails.email
            setsuccessMsg('Sending link...')
            try {
                await sendPasswordResetEmail(auth, email)
                btnRef.current.disabled = true
                setSuccess(true)
                setsuccessMsg('')
                setTimeout(() => {
                    navigate('/login')
                }, 2500)
            } catch (error) {
                setsuccessMsg('')
                if (error.code === 'auth/invalid-email') {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        general: 'User not found. Please create an account'
                    }))
                } else if (error.code === 'auth/invalid-credential') {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        general: 'Incorrect email.'
                    }))
                } else {
                    console.log(error)
                }
                setSuccess(false)
            }
        }
    }
    return (
        <div className='overflow-hidden w-full min-h-screen'>
            <div className='w-full min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center'>
                <div className='hidden xl:flex items-start justify-center flex-col gap-1 text-white pl-[20px]'>
                    <h2 className=' w-[50%] text-2xl text-slate-800 dark:text-slate-100 tracking-wider font-bold'>
                        PQ Hub helps you find and share past questions with the students.
                    </h2>
                    <img src={book} loading='lazy' className=' object-cover w-[260px] h-[260px]' alt="PQ Hub Logo" />
                </div>
                <div className='w-[85%] xl:-ml-[220px] sm:w-[65%] md:w-[50%] lg:w-[40%] xl:w-[30%] h-auto p-3 py-9 pt-5 border border-slate-200 dark:border-slate-700 bg-[rgba(255,255,255,.75)] dark:bg-[rgba(30,41,59,.75)] backdrop-blur-md shadow-[10px_10px_10px_rgba(0,0,0,.05)] rounded-lg'>
                    <div className='w-full p-2 text-slate-700 tracking-wide dark:text-white text-xl flex items-center py-3 mb-2 font-bold gap-2 justify-center'>
                        Reset Password
                        <FontAwesomeIcon icon={faLockOpen} />
                    </div>
                    <div className='flex flex-col gap-3 items-center justify-center w-full mx-auto'>
                        <div className='flex justify-center bg-slate-50 items-center dark:border-slate-100 border-[0.5px] border-slate-300 rounded-md w-[85%] mx-auto'>
                            <FontAwesomeIcon icon={faEnvelope} className='text-slate-700 text-lg pl-3' />
                            <input type="email" placeholder='Email address' value={signInDetails.email} onChange={handleChange} name='email' className='dark:placeholder-slate-500 placeholder-slate-600 text-slate-700 font-medium p-2 px-3 rounded-md w-full outline-none bg-transparent border-none' />
                        </div>
                        {errors &&
                            <div className=' max-w-[70%] -mt-1 my-1 mb-1.5 px-5 h-auto text-center text-red-500 text-[15px]'>
                                <span>{errors.general}</span>
                            </div>
                        }
                        {success &&
                            <div className=' max-w-[70%] -mt-1 my-1 mb-1.5 px-5 h-auto text-center text-green-500 text-[15px]'>
                                <span>Password reset link has been sent to your email</span>
                            </div>
                        }
                        <button onClick={HandleLogin} ref={btnRef} className=' -mt-2 p-2 px-3 outline-none border-none bg-blue-500 text-white rounded-md w-[85%] font-medium'><span>{successMsg || 'Send Reset Link'}</span> <FontAwesomeIcon icon={!successMsg ? faRefresh : ''} /></button>

                        <div className='w-full flex items-center justify-center gap-2 text-slate-900 dark:text-slate-50 text-sm mt-1'>Back to <Link to='/login' className='text-slate-700 dark:text-slate-50 font-medium underline'>Log In</Link></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword