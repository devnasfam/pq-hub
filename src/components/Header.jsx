import React, { useContext, useEffect, useState } from 'react'
import openbook from '../assets/openbook.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import bgimage from '../assets/brain2.jpeg'
import Navbar from './Navbar'
import { faCheckCircle, faSignIn } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { MyAppContext } from '../AppContext/MyContext'
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
        }
      });
    });

    let animDivs = document.querySelectorAll('.bookNormal, .btnNormal');
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
      <main style={{ background: `url(${bgimage})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover' }} id='home'>
        <section className='w-full h-auto py-3 pb-6 px-2 md:px-10 pt-[110px] md:pt-[175px] md:pb-[55px] lg:pt-[135px] xl:pt-[165px] xl:pb-[90px] bg-[rgba(0,0,0,.7)] flex md:flex-row flex-col items-center justify-around'>
          <div className='sideNormal w-full flex items-start justify-center flex-col pt-5 sm:pt-0 px-5 lg:pl-10'>
            <h2 className='hidden sm:block lg:text-[35px] mt-12 md:mt-0 md:text-[30px] text-[33px] text-slate-100 font-bold leading-tight'>
              FUBK Past Questions Hub
            </h2>
            <h2 className=' sm:hidden lg:text-[35px] mt-12 md:mt-0 md:text-[30px] text-[33px] text-slate-100 font-bold leading-tight'>
              FUBK Past Questions Hub
            </h2>
            <p className='text-slate-200 mt-2 tracking-wide font-medium lg:text-lg'>
              We help students find and share exam past questions.
            </p>
            <ul className='text-white text-lg p-5 py-3 font-medium'>
              <li className=' cursor-pointer'><FontAwesomeIcon icon={faCheckCircle} className='text-blue-500 mx-2 ml-0 text-lg bg-white rounded-full' />Explore Past Questions</li>
              <li className=' cursor-pointer'><FontAwesomeIcon icon={faCheckCircle} className='text-blue-500 mx-2 ml-0 text-lg bg-white rounded-full' />Chat with Friends</li>
              <li className=' cursor-pointer'><FontAwesomeIcon icon={faCheckCircle} className='text-blue-500 mx-2 ml-0 text-lg bg-white rounded-full' />Ask our AI Chatbot</li>
            </ul>
            {!user &&
              <button className=' cursor-default'>
                <Link to='/signup' className="btnNormal overflow-hidden relative group w-full px-10 bg-blue-500 bg-gradient-to-tr font-medium text-white p-1.5 py-2 rounded-full mt-5 hidden sm:block duration-150 hover:bg-opacity-80" >
                  <div className=' z-10 w-full flex items-center justify-center gap-1 group-hover:text-blue-500'>
                    <FontAwesomeIcon icon={faSignIn} />
                    <p className=' font-semibold tracking-wider whitespace-nowrap'>Sign Up Now</p>
                  </div>
                  <div className=' -z-10 transform scale-0 top-full left-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:top-1/2 group-hover:scale-100 rounded-full duration-300 w-full bg-slate-100 h-full absolute'></div>
                </Link>
              </button>
            }
          </div>
          <div className='w-full mt-1 flex items-center justify-center'>
            <img src={openbook} alt="PQ Hub Logo" className='bookNormal md:w-[330px] md:h-[330px] lg:w-[400px] lg:h-[400px] sm:h-[330px] sm:w-[330px] w-[70%] h-[70%] object-cover mt-5 mb-4 md:mb-0 md:mt-0 hover:scale-105' />
          </div>
          {!user &&
            <Link to='/signup' className="btnNormal w-1/2 overflow-hidden relative group px-10 bg-blue-500 bg-gradient-to-tr font-medium text-white p-1.5 py-2 rounded-full mt-5 sm:hidden duration-150 hover:bg-opacity-80" >
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
