import React, { useEffect } from 'react'
import explore from '../assets/exam-result.png'
import contribute from '../assets/contribute.png'
import chatbot from '../assets/chatbot.png'
import connect from '../assets/connect.png'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare, faHandSparkles, faPrescription } from '@fortawesome/free-solid-svg-icons'

const Feature = () => {
  useEffect(() => {
    let observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        let targetElement = entry.target;
        if (targetElement.classList.contains('cardNormall')) {
          targetElement.classList.toggle('cardComel', entry.isIntersecting);
        }
        else if (targetElement.classList.contains('cardNormalr')) {
          targetElement.classList.toggle('cardComer', entry.isIntersecting);
        }
      });
    }, { rootMargin: '50px' });

    let animDivs = document.querySelectorAll('.cardNormall, .cardNormalr');
    animDivs.forEach((div) => {
      observer.observe(div);
    });

    // Clean up observer on component unmount
    return () => {
      animDivs.forEach((div) => {
        observer.unobserve(div);
      });
    };
  }, []);
  return (
    <>
      <section id='feature' className=' scroll-m-14 relative w-full h-auto p-4 px-10 flex flex-col items-center justify-around lg:justify-center gap-5 lg:gap-5 lg:pt-5'>
        <div className='bg-blue-500 shadow-xl blur-xl shadow-red-500 w-[280px] h-[280px] rounded-full z-0 absolute top-[45px] right-0' />
        <div className='bg-pink-500 shadow-2xl blur-xl shadow-blue-500 w-[280px] h-[280px] rounded-full z-0 absolute bottom-[-15px] left-0' />
        <div className='bg-yellow-500 shadow-2xl blur-xl shadow-green-500 w-[310px] h-[310px] rounded-full z-0 absolute top-[42%] lg:top-[35%] left-[40%]' />
        <div className=' z-20 w-full flex items-center justify-center py-7 pb-11 text-slate-700 dark:text-slate-100 text-2xl font-bold'>
          <FontAwesomeIcon className='px-2 text-blue-600 text-3xl' icon={faHandSparkles} />
          Features you'd expect from us.
        </div>
        <div className=' z-20 w-full flex flex-col xl:flex-row gap-y-5 items-center justify-around lg:justify-center'>
          <div className=' w-full flex flex-col items-center justify-center md:flex-row gap-5'>
            <div className=' cardNormall w-[80%] sm:w-[65%] md:w-[35%] xl:w-[45%] xl:aspect-[3/4] bg-[rgba(241,245,249,.3)] shadow-xl dark:bg-[rgba(30,41,59,.5)] backdrop-blur-md rounded-xl flex flex-col items-center justify-center overflow-hidden'>
              <div className='w-full h-full flex items-center justify-center pt-5 lg:pt-10'>
                <img src={explore} alt="" className='w-[70%] h-[70%] xl:w-full xl:h-full object-contain aspect-[3/2] xl:aspect-[3/1] xl:mt-10  xl:scale-95' />
              </div>
              <div className='w-full h-full p-4 md:py-0 mt-2'>
                <Link to='/feed' className='text-slate-700 dark:text-white dark:hover:text-blue-500 hover:text-blue-500 hover:underline text-lg font-medium py-1 xl:pt-5 flex items-center justify-start gap-x-1'>
                  <div className=' truncate'>Explore Past Questions</div>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className=' p-1 text-blue-500' />
                </Link>
                <div className='text-slate-700 dark:text-slate-200 md:h-[192px] mt-2 xl:mb-3 xl:pb-5'>
                  Embark on a learning adventure at FUBK Past Questions Hub,
                  where you'll discover a rich  collection of carefully organized past questions designed
                  for you.
                </div>
              </div>
            </div>
            <div className=' xl:-mr-5 cardNormall w-[80%] sm:w-[65%] md:w-[35%] xl:w-[45%] xl:aspect-[3/4] bg-[rgba(241,245,249,.3)]  shadow-xl dark:bg-[rgba(30,41,59,.5)] backdrop-blur-md rounded-xl flex flex-col items-center justify-center overflow-hidden'>
              <div className='w-full h-full flex items-center justify-center pt-5 xl:pt-10'>
                <img src={contribute} alt="" className='w-[70%] h-[70%] xl:w-full xl:h-full object-contain aspect-[3/2] xl:aspect-[3/1] xl:mt-10  xl:scale-95' />
              </div>
              <div className='w-full h-full p-4 md:py-0 mt-2'>
              <Link to='/contribute' className='text-slate-700 dark:text-white dark:hover:text-blue-500 hover:text-blue-500 hover:underline text-lg font-medium py-1 xl:pt-5 flex items-center justify-start gap-x-1'>
                  <div className=' truncate'>Contribute to Learning</div>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className=' p-1 text-blue-500' />
                </Link>
                <div className='text-slate-700 dark:text-slate-200 md:h-[192px] mt-2 xl:mb-3 xl:pb-5'>
                  Be a changemaker in our academic community. Share Past Questions and shape the academic journey for your
                  friends. Every contribution  adds value to the wisdom Students.
                </div>
              </div>
            </div>
          </div>
          <div className=' w-full flex flex-col items-center justify-center md:flex-row gap-5'>
            <div className=' xl:-ml-5 cardNormalr w-[80%] sm:w-[65%] md:w-[35%] xl:w-[45%] xl:aspect-[3/4] bg-[rgba(241,245,249,.3)]  shadow-xl dark:bg-[rgba(30,41,59,.5)] backdrop-blur-md rounded-xl flex flex-col items-center justify-center overflow-hidden'>
              <div className='w-full h-full flex items-center justify-center pt-5 lg:pt-10'>
                <img src={chatbot} alt="" className='w-[70%] h-[70%] xl:w-full xl:h-full object-contain aspect-[3/2] xl:aspect-[3/1] xl:mt-10  xl:scale-95' />
              </div>
              <div className='w-full h-full p-4 md:py-0 mt-2'>
                <Link to='/ai-chatbot' className='text-slate-700 dark:text-white dark:hover:text-blue-500 hover:text-blue-500 hover:underline text-lg font-medium py-1 xl:pt-5 flex items-center justify-start gap-x-1'>
                  <div className=' truncate'> AI Assistant🤖</div>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className=' p-1 text-blue-500' />
                </Link>
                <div className='text-slate-700 dark:text-slate-200 md:h-[192px] mt-2 xl:mb-3 xl:pb-5'>
                  No more searching endlessly for answers – our smart companion is here to help with any question you have.
                  Get ready for a smoother experience on PQ Hub! 🚀
                </div>
              </div>
            </div>
            <div className=' cardNormalr w-[80%] sm:w-[65%] md:w-[35%] xl:w-[45%] xl:aspect-[3/4] bg-[rgba(241,245,249,.3)]  shadow-xl dark:bg-[rgba(30,41,59,.5)] backdrop-blur-md rounded-xl flex flex-col items-center justify-center overflow-hidden'>
              <div className='w-full h-full flex items-center justify-center pt-5 lg:pt-10'>
                <img src={connect} alt="" className='w-[70%] h-[70%] lg:w-full lg:h-full object-contain aspect-[3/2] lg:aspect-[3/1] lg:mt-10' />
              </div>
              <div className='w-full h-full p-4 md:py-0 mt-2'>
              <Link to='/chats' className='text-slate-700 dark:text-white dark:hover:text-blue-500 hover:text-blue-500 hover:underline text-lg font-medium py-1 xl:pt-5 flex items-center justify-start gap-x-1'>
                  <div className=' truncate'> Connect with Friends</div>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className=' p-1 text-blue-500' />
                </Link>
                <div className='text-slate-700 dark:text-slate-200 md:h-[192px] mt-2 xl:mb-3 xl:pb-5'>
                  In the FUBK Past Questions Hub, academic growth goes beyond individual efforts. Connect with friends who share your passion and commitment to
                  success.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Feature
