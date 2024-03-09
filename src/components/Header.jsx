import React, { useContext, useEffect, useState } from 'react'
import openbook from '../assets/openbook.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import bgimage from '../assets/brain2.jpeg'
import Navbar from './Navbar'
import { faCheckCircle, faRobot, faShareAlt, faSignIn } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { MyAppContext } from '../AppContext/MyContext'
import { faComments } from '@fortawesome/free-regular-svg-icons'
const Header = () => {
  const { user } = useContext(MyAppContext);
  useEffect(() => {
    let observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        let targetElement = entry.target;
        if (targetElement.classList.contains('bookNormal')) {
          targetElement.classList.add('bookCome');
        } else if (targetElement.classList.contains('btnNormal')) {
          targetElement.classList.add('btnCome');
        } else if (targetElement.classList.contains('btnNormal2')) {
          targetElement.classList.add('btnCome2');
        }
        else if (targetElement.classList.contains('bodyText')) {
          targetElement.classList.toggle('bodyCome', entry.isIntersecting);
        }
      });
    });

    let animDivs = document.querySelectorAll('.bookNormal, .btnNormal, btnNormal2, .bodyText');
    animDivs.forEach((div) => {
      observer.observe(div);
    });

    return () => {
      animDivs.forEach((div) => {
        observer.unobserve(div);
      });
    };
  }, []);

  return (
    <>
      <Navbar />
      <main id='home'>
        <section className='w-full h-auto py-3 pb-6 px-2 md:px-10 pt-[110px] bg-white dark:bg-[rgba(2,6,23,.55)] flex md:flex-row flex-col items-center justify-around'>
          <div className='sideNormal w-full flex items-start justify-center flex-col pt-5 sm:pt-0 px-5 lg:pl-10'>
            <h2 className='hidden btnNormal sm:block lg:text-[35px] mt-12 md:mt-0 md:text-[30px] text-[33px] text-slate-800 dark:text-slate-100 font-bold leading-tight'>
              Past Questions Hub
            </h2>
            <h2 className=' sm:hidden btnNormal lg:text-[35px] mt-12 md:mt-0 md:text-[30px] text-[33px] text-slate-800 dark:text-slate-100 font-bold leading-tight'>
              Past Questions Hub
            </h2>
            <p className='dark:text-slate-200 bodyText text-slate-500 mt-2 tracking-wide font-medium lg:text-lg'>
              We help students find and share exam past questions.
            </p>
            <ul className=' text-slate-700 bodyText dark:text-white text-lg p-5 py-3 font-medium'>
              <li className=' flex items-center justify-start'><FontAwesomeIcon className=' btnNormal text-green-400 mr-2.5 mb-1 p-[9px] px-3 bg-slate-800 rounded-md' icon={faShareAlt} /> Explore Past Questions</li>
              <li className=' flex items-center justify-start'><FontAwesomeIcon className=' btnNormal text-blue-500 mr-2.5 mb-1 p-2 bg-slate-800 rounded-md' icon={faComments} /> Chat with Friends</li>
              <li className=' flex items-center justify-start'><FontAwesomeIcon className=' btnNormal text-pink-400 mr-2.5 mb-1 p-2 bg-slate-800 rounded-md' icon={faRobot} /> Ask our AI Chatbot</li>
            </ul>
            {!user &&
              <button className=' cursor-default'>
                <Link to='/signup' className="bodyText ring-2 ring-blue-400 shadow overflow-hidden relative group w-full px-7 bg-blue-500 bg-gradient-to-tr font-medium text-white p-1 py-1.5 rounded-full mt-5 hidden sm:block duration-150 hover:bg-opacity-80" >
                  <div className=' z-10 w-full flex items-center justify-center gap-1 group-hover:text-blue-500'>
                    <FontAwesomeIcon icon={faSignIn} />
                    <p className=' font-semibold tracking-wider whitespace-nowrap'>Sign Up Now</p>
                  </div>
                  <div className=' -z-10 transform scale-0 top-full left-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:top-1/2 group-hover:scale-100 rounded-full duration-300 w-full bg-slate-100 h-full absolute'></div>
                </Link>
              </button>
            }
          </div>
          <div className='w-full relative mt-1 flex items-center justify-center'>
            <div className=' delay-200 w-[60%] lg:w-[50%] h-[85%] bg-cyan-600/80 shadow-2xl shadow-pink-600 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full blur-2xl' />
            <img src={openbook} alt="PQ Hub Logo" className='z-10 duration-300 md:w-[310px] md:h-[310px] lg:w-[360px] lg:h-[360px] sm:h-[300px] sm:w-[300px] w-[65%] h-[65%] object-cover mt-5 mb-4 md:mb-0 md:mt-0 hover:scale-105' />
          </div>
          {!user &&
            <Link to='/signup' className="btnNormal ring-2 ring-blue-400 shadow w-[45%] overflow-hidden relative group px-7 bg-blue-500 bg-gradient-to-tr font-medium text-white p-1 py-1.5 rounded-full mt-5 sm:hidden duration-150 hover:bg-opacity-80" >
              <div className=' z-10 w-full flex items-center justify-center gap-1 group-hover:text-blue-500'>
                <FontAwesomeIcon icon={faSignIn} />
                <p className=' font-semibold tracking-wider whitespace-nowrap'>Sign Up Now</p>
              </div>
              <div className=' -z-10 transform scale-0 top-full left-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:top-1/2 group-hover:scale-100 rounded-full duration-300 w-full bg-slate-100 h-full absolute'></div>
            </Link>
          }
        </section>
      </main>
    </>
  )
}

export default Header
