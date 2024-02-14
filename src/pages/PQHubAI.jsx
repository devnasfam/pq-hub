import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBrain, faHandsBubbles, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { faMessage } from '@fortawesome/free-regular-svg-icons'
import { MyAppContext } from '../AppContext/MyContext'
import userPhoto from '../assets/user.png'
import { db } from '../firebase/firebaseService'
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { TimeAgo } from '../TimeAgo'
import Navigations from '../components/Navigations'
import TopNav from '../components/TopNav'

const PQHubAI = () => {
  const [userInput, setUserInput] = useState('');
  const [prevMsgs, setprevMsgs] = useState([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null);
  const inputRef = useRef(null)
  const btnRef = useRef(null)
  const [isNavShow, setisNavShow] = useState(true)
  const { linkFrom, user } = useContext(MyAppContext);

  let HandleChange = (e) => {
    setUserInput(e.target.value)
  }
  let HandleSetFocus = () => {
    inputRef.current.focus();
  }

  const HandleFocus = () =>{
     setisNavShow(false)
  }

  const HandleFocusOut = () =>{
     setisNavShow(true)
  }
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  let send = async () => {
    let userMsg = {
      text: userInput,
      role: 'user',
      date: Date.now(),
      userId: user.uid
    }

    setprevMsgs((prev) => [...prev, userMsg])
    setUserInput('')

    try {
      let chatDoc = doc(db, 'AI-Chats', user && user.uid);
      const chatDocSnapshot = await getDoc(chatDoc);

      if (!chatDocSnapshot.exists()) {
        await setDoc(chatDoc, { messages: [userMsg] }); // Create new document if it doesn't exist
      } else {
        await updateDoc(chatDoc, { messages: arrayUnion(userMsg) }); // Update existing document
      }
    } catch (error) {
      console.log('Error sending message:', error)
    }

    let aiResponse = async () => {
      try {
        let res = await fetch(`https://WellinformedHeavyBootstrapping.yasirmecom.repl.co/ask?question=${userInput}`)
        let data = await res.text();
        alert(data)
        let aiMsg = {
          text: data,
          role: 'ai',
          date: Date.now(),
        }

        setprevMsgs((prev) => [...prev, aiMsg])
      } catch (error) {
        console.log(error)
      }
    }
    // aiResponse()
  }

  let sendMsg = (e) => {
    if (userInput.trim() !== '' && !loading) {
      send()
    }
    return;
  }

  //https://WellinformedHeavyBootstrapping.yasirmecom.repl.co/ask?question=hello
  useEffect(() => {
    document.title = 'AI Chatbot';

    const fetchData = async () => {
      try {
        let chatDoc = doc(db, 'AI-Chats', user && user.uid);
        let chatDocSnapshot = await getDoc(chatDoc);

        if (chatDocSnapshot.exists()) {
          const chatData = chatDocSnapshot.data();
          setprevMsgs([...chatData.messages]);
          setLoading(false);
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
    scrollToBottom()

    return () => {
      //cleanup
    }
  }, [document.title, linkFrom, loading])

  useEffect(() => {
    scrollToBottom();
  }, [prevMsgs])

  //Event listener for 'Enter' key press
  useEffect(() => {
    const keyDown = (e) => {
      if (e.key === 'Enter') {
        sendMsg();
      }
    };
    scrollToBottom();
    window.addEventListener('keydown', keyDown);

    return () => {
      window.removeEventListener('keydown', keyDown);
    };
  }, [userInput, loading]);

  return (
    <div className='md:pl-[13rem] pt-[64px]'>
      {/* Top  */}
      <TopNav name={
        <>
          <header className=' fixed top-0 left-0 z-10 w-full bg-[rgba(30,41,59,.85)] backdrop-blur-md p-3 flex items-center justify-start'>
           <Link to='/feed' className={` p-2 hidden ${isNavShow ? ' max-[768px]:hidden' : ' max-[768px]:block'}`}>
             <FontAwesomeIcon icon={faArrowLeft}/>
           </Link>
             <div className=' w-auto text-slate-100 flex items-center justify-center space-x-2 p-2 text-base font-semibold'>
              <h2>PQ Hub AI</h2>
              <FontAwesomeIcon icon={faBrain} />
            </div>
          </header>
        </>
      } />
      {/* Messages body */}
      <div ref={containerRef} className=' chatscroll w-full h-auto overflow-y-auto p-3 pb-[90px] px-5 md:px-10 lg:px-52 dark:bg-slate-950 text-slate-200 '>
        {loading && <div className=' w-full flex items-center justify-center gap-2 text-xl text-white'>
          <FontAwesomeIcon className='skeletonloader' icon={faSpinner} />
        </div>}
        {!loading && prevMsgs.length < 1 && <div className=' w-[85%] mx-auto flex items-center justify-center gap-2 text-xl p-3 px-5 pt-[40%] md:pt-[35%] text-white'>
          Say hello 👋 to our AI assistant! Type your message below to start chatting. Questions? Just ask! 🤖💬
        </div>}
        {prevMsgs?.map((msg, i) => (
          <div key={i} className={` w-auto h-auto p-2 flex ${msg.role === 'user' ? 'float-rigt justify-end' : 'float-left justify-start'} clear-both items-center gap-x-1.5`}>
            {msg.role === 'ai' && <img src={userPhoto} className=' w-[40px] h-[40px] -mt-0.5 rounded-full self-start' alt="" />}
            <li className={` min-w-auto max-[470px]:max-w-[65%] max-w-[55%] lg:max-w-[65%] break-words ${msg.role === 'user' ? 'bg-slate-700 dark:bg-slate-800' : 'bg-cyan-600'} clear-both p-2.5  rounded-md list-none`}>
              {/* Message */}
              <div className=' w-auto flex flex-col items-center justify-center'>
                <div className=' w-full text-left'>
                  {msg.role === 'ai' && <FontAwesomeIcon icon={faMessage} className=' mr-1' />}
                  {msg.text}
                  {msg.role === 'ai' && <FontAwesomeIcon icon={faHandsBubbles} className=' ml-1' />}
                </div>
              </div>
            </li>
            {msg.role === 'user' && <img src={userPhoto} className=' w-[40px] h-[40px] -mt-0.5 rounded-full self-start' alt="" />}
          </div>
        ))}
      </div>
      {/* Input Container */}
      <div onClick={HandleSetFocus} className={` fixed ${isNavShow ? 'max-[768px]:bottom-20' : ' max-[768px]:bottom-0'} bottom-0 left-0 p-3 md:pl-[13.4rem] bg-slate-950 w-full flex items-center justify-center space-x-2`}>
        <div className=' w-full md:w-[80%] lg:w-[60%] flex items-center justify-center gap-2'>
          <input onFocus={HandleFocus} onBlur={HandleFocusOut} onChange={HandleChange} value={userInput} ref={inputRef} type="text" placeholder='Message AI...' className=' w-full p-2 px-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-200' name="" id="" />
          <FontAwesomeIcon onClick={sendMsg} ref={btnRef} className={` text-lg p-2.5 ${userInput.trim() !== '' ? 'bg-cyan-600' : 'bg-slate-700 dark:bg-slate-800'} text-slate-100 dark:text-white rounded-lg cursor-pointer transform duration-150 active:scale-95`} icon={faPaperPlane} />
        </div>
      </div>
      <div className={`${isNavShow ? '' : ' max-[768px]:hidden'}`}>
       <Navigations />
      </div>
    </div>
  )
}

export default PQHubAI