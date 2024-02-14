import React, { useContext, useEffect, useRef } from 'react'
import Header from '../components/Header'
import Feature from '../components/Feature'
import Section from '../components/Section'
import People from '../components/People'
import Footer from '../components/Footer'
import { MyAppContext } from '../AppContext/MyContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp } from '@fortawesome/free-solid-svg-icons'

const Home = () => {
  const { linkFrom, setlinkFrom, scrollTop } = useContext(MyAppContext);

  const toTop = () => {
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    setlinkFrom('/')
    document.title = 'FUBK PQ Hub'
  }, [document.title, linkFrom])

  return (
    <div className='overflow-hidden bg-[#e5f3fd] dark:bg-slate-900 min-h-screen'>
      <Header />
      <Feature />
      <Section />
      <People />
      <Footer />
      <div onClick={toTop}
        className={`${scrollTop ? 'scale-100' : 'scale-0'} transform duration-200 active:scale-[0.87] border
     border-slate-300 dark:border-slate-700  shadow-2xl shadow-black cursor-pointer 
      flex items-center justify-center w-9 h-9 bg-slate-100 rounded-full fixed z-50 bottom-5 right-5`}>
        <FontAwesomeIcon className=' text-slate-900' icon={faAngleUp} />
      </div>
    </div>
  )
}
export default Home

// how can i push my code to existing github repository, this is my first time pushing code to github, please tell me step by step how i can host all my project files and directories and the files in them all on my github repo: https://github.com/devnasfam/fubk-pq-hub
// and also am using vs code to code my project, it's a react, tailwind and firebase project, how can i push the project using commands from my terminal, git bash or from vs code, and do i need to login to my github account before pushing, if yes how can i do all these, please i need detailed answer about all this