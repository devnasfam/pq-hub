import React, { useContext, useEffect, useRef } from 'react'
import Header from '../components/Header'
import Feature from '../components/Feature'
import Section from '../components/Section'
import People from '../components/People'
import Footer from '../components/Footer'
import { MyAppContext } from '../AppContext/MyContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from '@mui/material'

const Home = () => {
  const { linkFrom, setlinkFrom, scrollTop } = useContext(MyAppContext);

  const toTop = () => {
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    setlinkFrom('/')
    document.title = 'PQ Hub'
  }, [document.title, linkFrom])

  return (
    <div className='overflow-hidden bg-[#e5f3fd] dark:bg-slate-900 min-h-screen'>
      <Header />
      <Feature />
      <Section />
      <People />
      <Footer />
      <Tooltip title='Scroll to top' arrow enterDelay={500}>
        <div onClick={toTop}
          className={`${scrollTop ? 'scale-100' : 'scale-0'} transform duration-200 active:scale-[0.87] border
          border-slate-300 dark:border-slate-700  shadow-2xl shadow-black cursor-pointer 
          flex items-center justify-center w-9 h-9 bg-slate-100 rounded-full fixed z-50 bottom-5 right-5`}>
          <FontAwesomeIcon className=' text-slate-900' icon={faAngleUp} />
        </div>
      </Tooltip>
    </div>
  )
}
export default Home