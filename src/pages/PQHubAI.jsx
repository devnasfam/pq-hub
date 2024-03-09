import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBrain, faHandsBubbles, faHistory, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { faMessage } from '@fortawesome/free-regular-svg-icons'
import { MyAppContext } from '../AppContext/MyContext'
import userPhoto from '../assets/user.png'
import { db } from '../firebase/firebaseService'
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import chatbot from '../assets/chatbot.png'
import { CircularProgress } from '@mui/material'

const PQHubAI = () => {
  const [userInput, setUserInput] = useState('');
  const [prevMsgs, setprevMsgs] = useState([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null);
  const inputRef = useRef(null)
  const btnRef = useRef(null)
  const [isNavShow, setisNavShow] = useState(true)
  const [userData, setUserData] = useState([]);
  const { linkFrom, user } = useContext(MyAppContext);

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  let HandleChange = (e) => {
    setUserInput(e.target.value)
  }
  let HandleSetFocus = () => {
    inputRef.current.focus();
  }

  const HandleFocus = () => {
    setisNavShow(false)
  }

  const HandleFocusOut = () => {
    setisNavShow(true)
  }

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
      let chatDoc = doc(db, 'AI-Chats', user && user?.uid);
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
    if (!user || !user.uid) return;
    const fetchData = async () => {
      try {
        let chatDoc = doc(db, 'AI-Chats', user && user?.uid);
        let userDoc = doc(db, 'Users', user?.uid);
        let userSnapshot = await getDoc(userDoc);
        let chatDocSnapshot = await getDoc(chatDoc);
        setUserData(userSnapshot.data())
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

    return () => {
      //cleanup
    }
  }, [document.title, linkFrom, loading])


  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [prevMsgs]);

  //Event listener for 'Enter' key press
  useEffect(() => {
    const keyDown = (e) => {
      if (e.key === 'Enter') {
        sendMsg();
      }
    };
    window.addEventListener('keydown', keyDown);

    return () => {
      window.removeEventListener('keydown', keyDown);
    };
  }, [userInput, loading]);

  return (
    <div className='scrollMsgbody overflow-hidden flex items-center justify-center'>
      <div className=' text-slate-50 min-h-screen md:w-[40%] lg:w-[30%] p-3 bg-slate-900 hidden md:flex items-center justify-center flex-col'>
        <FontAwesomeIcon className=' p-2 text-lg' icon={faHistory} />
        No chats history
      </div>

      <div className=' w-full flex items-center justify-center flex-col'>
        <div className=' fixed z-40 top-0 right-0 w-full md:w-[70.9%] lg:w-[76.55%] p-3 bg-blue-500 dark:bg-[rgba(30,41,59,.85)] backdrop-blur-md shadow-[0_4px_3px_rgba(0,0,0,.05)] flex items-center justify-between'>
          <div className=' flex items-center justify-start gap-2'>
            <Link to={`/chats`}>
              <FontAwesomeIcon className=' text-slate-100 p-1' icon={faArrowLeft} />
            </Link>
            <img src={chatbot} alt="" loading='lazy' className=' w-10 h-10 rounded-full object-cover shrink-0' />
            <div className=' flex items-start ml-1 justify-center flex-col'>
              <div className=' text-white dark:text-slate-100'>AI Assistant</div>
            </div>
          </div>
          <div></div>
        </div>
        {loading && <div className=' mt-20 md:fixed md:top-0 w-full flex items-center justify-center gap-2 text-xl'>
          <CircularProgress size={30} thickness={4} />
        </div>}
        {/* Messages body */}
        <div ref={containerRef} className=' chatscroll w-full h-auto overflow-y-auto md:py-10 p-3 px-5 md:px-10 lg:px-52 dark:bg-slate-950 text-slate-200 ' style={{ maxHeight: 'calc(100vh - 65px)' }}>
          {!loading && prevMsgs.length < 1 && <div className=' w-[85%] mx-auto flex items-center justify-center gap-2 text-xl p-3 px-5 pt-[40%] md:pt-[35%] text-white'>
            Say hello 👋 to our AI assistant! Type your message below to start chatting. Questions? Just ask! 🤖💬
          </div>}
          {prevMsgs?.map((msg, i) => (
            <div key={i} className={` w-auto h-auto p-2 flex ${msg.role === 'user' ? 'float-rigt justify-end' : 'float-left justify-start'} clear-both items-center gap-x-1.5`}>
              {msg.role === 'ai' && <img src={userPhoto} className=' w-[40px] h-[40px] -mt-0.5 rounded-full self-start' alt="" />}
              <li className={` min-w-auto max-[470px]:max-w-[65%] max-w-[55%] lg:max-w-[65%] break-words ${msg.role === 'user' ? 'bg-cyan-600 text-slate-50 dark:text-slate-100 dark:bg-slate-800' : 'bg-blue-100 dark:bg-cyan-600'} clear-both p-2.5 px-4  rounded-xl list-none`}>
                {/* Message */}
                <div className=' w-auto flex flex-col items-center justify-center'>
                  <div className=' w-full text-left'>
                    {msg.role === 'ai' && <FontAwesomeIcon icon={faMessage} className=' mr-1' />}
                    {msg.text}
                    {msg.role === 'ai' && <FontAwesomeIcon icon={faHandsBubbles} className=' ml-1' />}
                  </div>
                </div>
              </li>
              {msg.role === 'user' && <img src={userData.profilePicture || userPhoto} className=' w-[40px] h-[40px] -mt-0.5 rounded-full self-start border' alt="" />}
            </div>
          ))}
        </div>

        {/* Input Container */}
        <div onClick={HandleSetFocus} className=' fixed z-40 bottom-0 p-2 right-0 w-full md:w-[70.9%] lg:w-[76.55%] flex items-center bg-blue-500 dark:bg-[rgba(30,41,59,.85)] backdrop-blur-md shadow-[0_4px_3px_rgba(0,0,0,.05)] justify-center'>
          <div className=' w-full flex items-center justify-center'>
            <input onFocus={HandleFocus} onBlur={HandleFocusOut} onChange={HandleChange} value={userInput} ref={inputRef} type="text" placeholder='Message...' className=' bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none w-[80%] md:w-[60%] sm:w-[70%] lg:w-[50%] xl:w-[45%] p-1.5 px-2 rounded-lg' />
            <FontAwesomeIcon onClick={sendMsg} className={`${userInput.trim() ? ' bg-blue-600 dark:bg-cyan-600' : ' bg-slate-700'} p-[9.5px] m-1 text-slate-50 rounded-lg cursor-pointer`} icon={faPaperPlane} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PQHubAI