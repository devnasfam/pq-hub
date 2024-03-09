import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import TopNav from '../components/TopNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faSpinner, faThumbTack } from '@fortawesome/free-solid-svg-icons'
import Navigations from '../components/Navigations'
import { Link } from 'react-router-dom'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebaseService'
import userPhoto from '../assets/user.png'
import chatbot from '../assets/chatbot.png'
import { MyAppContext, useChatRoom } from '../AppContext/MyContext'
import { CircularProgress } from '@mui/material'

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [noChats, setnoChats] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useContext(MyAppContext)
  const { setViewingChatRoom, viewingChatRoom } = useChatRoom();

  useLayoutEffect(() => {
    window.scrollTo(0, 0); // Reset scroll position to top when the pathname changes
  }, []);
  useEffect(() => {
    if (!user) return;

    let unsubscribeFuncs = [];

    const fetchChats = async () => {
      setViewingChatRoom(false);
      try {
        const userDocRef = doc(db, 'Users', user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();

        if (!userData || !userData.chatIds) {
          console.log('User data or chatIds are not available.');
          setnoChats(true);
          setLoading(false);
          return;
        }

        const chatIds = userData.chatIds;
        let docsArr = [];

        for (const id of chatIds) {
          const chatDocRef = doc(db, 'Chats', id);
          const unsubscribe = onSnapshot(chatDocRef, async (chatDocSnapshot) => {
            const chatData = chatDocSnapshot.data();

            if (!chatData) {
              console.log(`Chat data not found for ID: ${id}`);
              return;
            }

            const senderDocRef = doc(db, 'Users', chatData.senderId);
            const receiverDocRef = doc(db, 'Users', chatData.receiverId);

            const senderDocSnapshot = await getDoc(senderDocRef);
            const receiverDocSnapshot = await getDoc(receiverDocRef);

            const senderData = senderDocSnapshot.data();
            const receiverData = receiverDocSnapshot.data();

            const chatWithUserData = {
              ...chatData,
              senderData,
              receiverData
            };

            // Check if the chat already exists in the array
            const existingChatIndex = docsArr.findIndex((chat) => chat.chatRoomId === id);

            if (existingChatIndex !== -1) {
              // If the chat exists, replace it with the updated data
              docsArr[existingChatIndex] = chatWithUserData;
            } else {
              // Otherwise, add it to the array
              docsArr.push(chatWithUserData);
            }

            // Sort chats by the timestamp of the last message in descending order
            docsArr.sort((a, b) => b.timestamp - a.timestamp);
            setViewingChatRoom(false);
            setChats([...docsArr]); // Update the state with the sorted array
            setnoChats(false);
            setLoading(false);
          });

          unsubscribeFuncs.push(unsubscribe); // Store the unsubscribe function
        }
        setViewingChatRoom(false)
      } catch (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    };

    document.title = 'Chats'
    fetchChats();

    return () => {
      // Cleanup function to unsubscribe from all listeners
      unsubscribeFuncs.forEach((unsubscribe) => unsubscribe());
    };
  }, [user, document.title]);

  useEffect(() => {
    setViewingChatRoom(false);
  }, [viewingChatRoom])

  const formatLastMessage = (lastMessage, currentUserUid) => {
    if (lastMessage.senderId === currentUserUid) {
      return 'You: ' + lastMessage.message;
    } else {
      return lastMessage.message;
    }
  };

  const handleViewChat = () => {
    setViewingChatRoom(true);
  }

  return (
    <div className=' scrollMsgbody w-full h-auto pt-[74px] pb-[75px] overflow-hidden'>
      <TopNav>
          <div className=' w-full flex items-center justify-start'>
            <h2 className='text-lgtext-white ml-3 flex items-center justify-center font-medium truncate'>
              <FontAwesomeIcon className=' p-2 text-lg' icon={faComment} />
              Chats
            </h2>
          </div>
      </TopNav>
      <div className='pb-[78px] w-full h-auto md:pb-0 md:pl-[170px] text-slate-50'>
        {!loading && chats &&
          <Link to={'/ai-chatbot'} className='cursor-pointer duration-200 w-full border-b border-slate-200 dark:border-b-slate-900 p-3 flex items-center gap-2 justify-between'>
            <div className='flex items-center gap-2'>
              {/* Profile icon */}
              <img src={ chatbot || userPhoto} className='w-12 h-12 shrink-0' />
              {/* Chat info */}
              <div className='flex flex-col w-full truncate p-1.5'>
                <div className=' text-[17px] py-0.5 w-full text-slate-700 dark:text-slate-100 truncate'>
                  AI Assistant
                </div>
                <div className='text-sm text-slate-500 flex items-center justify-start gap-x-0.5 dark:text-slate-300 whitespace-pre-wrap'>
                  hi
                </div>
              </div>
            </div>
            <div className='flex items-center flex-col justify-center gap-1'>
              {/* Time */}
              <div className='text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap'>
                <FontAwesomeIcon icon={faThumbTack}/>
              </div>
            </div>

          </Link>
        }
        {chats?.map((chat) => (
          <Link key={chat.chatRoomId} onClick={handleViewChat} to={chat.chatRoomId} className='cursor-pointer duration-200 w-full border-b border-slate-200 dark:border-b-slate-900 p-3 flex items-center gap-2 justify-between'>
            <div className='flex items-center gap-2'>
              {/* Profile icon */}
              <img src={user?.uid === chat.senderData?.id ? chat?.receiverData?.profilePicture || userPhoto : chat.senderData?.profilePicture || userPhoto} className='w-12 h-12 shrink-0 rounded-full border-[.4px] border-slate-300 dark:border-slate-800' />
              {/* Chat info */}
              <div className='flex flex-col w-full truncate p-1.5'>
                <div className=' text-[17px] py-0.5 w-full text-slate-700 dark:text-slate-100 truncate'>
                  {user?.uid === chat.senderData?.id ? chat?.receiverData?.username : chat.senderData?.username}
                </div>
                <div className='text-sm text-slate-500 flex items-center justify-start gap-x-0.5 dark:text-slate-300 whitespace-pre-wrap'>
                  {chat.messages.length > 0 ? formatLastMessage(chat.messages[chat.messages.length - 1], user.uid) : 'No messages'}
                  {chat.messages[chat.messages.length - 1].senderId === user.uid && (chat.messages[chat.messages.length - 1].seen ?
                    <span className="material-symbols-outlined flex items-center justify-center text-sm text-blue-500">done_all</span>
                    :
                    <span className="material-symbols-outlined flex items-center justify-center text-sm text-slate-200">done</span>)}
                </div>
              </div>
            </div>
            <div className='flex items-center flex-col justify-center gap-1'>
              {/* Unread count */}
              {chat.messages.filter(message => !message.seen && message.senderId !== user.uid && message.receiverId === user.uid).length > 0 &&
                <div className={`text-xs bg-blue-500 text-slate-100 rounded-full p-1.5 py-1 m-1 ${chat.messages.filter(message => !message.seen && message.senderId !== user.uid && message.receiverId === user.uid).length < 10 ? ' w-5 flex items-center justify-center h-5 p-0' : ' w-auto h-auto flex items-center justify-center'}`}>
                  {chat.messages.filter(message => !message.seen && message.senderId !== user.uid && message.receiverId === user.uid).length}
                </div>
              }

              {/* Time */}
              <div className='text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap'>
                {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].time : ''}
              </div>
            </div>

          </Link>
        ))}
        {loading && <div className=' w-full flex items-center justify-center gap-2 text-xl text-white mt-4'>
        <CircularProgress size={30} thickness={4}/>
        </div>}
        {chats?.length < 1 && noChats &&
          <div className=' w-full flex items-center justify-center p-4'>No chats history...</div>
        }
      </div>
      <Navigations />
    </div>
  )
}

export default Chats