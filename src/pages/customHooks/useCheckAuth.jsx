import { useEffect } from 'react'
import { auth } from '../../firebase/firebaseService'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth';

const useCheckAuth = () => {
    const navigate = useNavigate();

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, (user)=>{
            if(!user){
            //  navigate('/login')
            }
        })
        return () => unsubscribe();
    },[navigate])
  return null;
}

export default useCheckAuth
