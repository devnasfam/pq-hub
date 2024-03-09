import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseService';

export const MyAppContext = createContext();

export const useChatRoom = () => useContext(MyAppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [linkFrom, setlinkFrom] = useState('/profile')
  const [scrollTop, setscrollTop] = useState(false)
  const [viewingChatRoom, setViewingChatRoom] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ? localStorage.getItem('theme') : 'system'
  );

  const element = document.documentElement;
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const onWindowMatch = () => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && darkQuery.matches)) {
      element.classList.add('dark');
    } else {
      element.classList.remove('dark');
    }
  };

  useEffect(() => {
    onWindowMatch();

    const handleChange = (e) => {
      if (!('theme' in localStorage)) {
        if (e.matches) {
          element.classList.add('dark');
        } else {
          element.classList.remove('dark');
        }
      }
    };

    darkQuery.addEventListener('change', handleChange);

    return () => {
      darkQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    switch (theme) {
      case 'dark':
        element.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        break;
      case 'light':
        element.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        break;
      default:
        localStorage.removeItem('theme');
        onWindowMatch();
        break;
    }

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [theme]);

  const values = {
    user,
    setUser,
    theme,
    setTheme,
    linkFrom,
    setlinkFrom,
    scrollTop,
    setscrollTop,
    setViewingChatRoom,
    viewingChatRoom
  };

  return (
    <MyAppContext.Provider value={values}>
      {children}
    </MyAppContext.Provider>
  );
};
