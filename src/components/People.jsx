import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faMicrophoneAlt, faQuoteLeft, faQuoteRight, faUserGraduate } from '@fortawesome/free-solid-svg-icons'
import { useEffect } from 'react'
import classrep from '../assets/classrep.png'
import bena from '../assets/bena.png'
import blaba from '../assets/user.png'
import sakaba from '../assets/sakaba.png'
import { faSpeakerDeck } from '@fortawesome/free-brands-svg-icons'

const People = () => {

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
    }, { rootMargin: '30px' });

    let animDivs = document.querySelectorAll('.cardNormal, .cardNormalr, .cardNormall');
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
    <section className=' relative w-full flex items-center justify-center flex-col my-8'>
      <div className='bg-pink-500 shadow-xl blur-xl shadow-red-500 w-[280px] h-[280px] rounded-full z-0 absolute top-[45px] right-0' />
      <div className='bg-blue-500 shadow-2xl blur-xl shadow-blue-500 w-[280px] h-[280px] rounded-full z-0 absolute bottom-[45px] left-0' />
      <div className='bg-yellow-500 shadow-2xl blur-xl shadow-green-500 w-[310px] h-[310px] lg:w-[280px] lg:h-[280px] rounded-full z-0 absolute top-[42%] lg:top-[25%] left-[40%]' />
      <div className='z-30 w-full flex items-center justify-center py-7 pb-11 text-slate-700 dark:text-slate-100 md:text-2xl text-xl font-semibold px-3'>
        <FontAwesomeIcon className='px-2 text-cyan-600 text-2xl' icon={faMicrophoneAlt} />
        Voices from the Community
      </div>
      <main className='w-[85%] sm:w-[65%] md:w-[85%] max-[767px]:w-[77%] h-auto p-2 xl:w-[95%] flex items-center justify-center gap-4 flex-col xl:flex-row'>
        <div className=' w-full flex items-center justify-center gap-5 flex-col xl:flex-row'>
          <div className=' w-auto flex items-center justify-center flex-col md:flex-row gap-5'>
            <div className=' cardNormall p-5 w-auto h-auto bg-[rgba(255,255,255,.7)] dark:bg-[rgba(2,6,23,.55)]  shadow-md backdrop-blur-md rounded-lg flex items-center justify-center flex-col'>
              <div className=' w-full flex items-center justify-center flex-col gap-y-1 sm:gap-y-0 sm:justify-start sm:flex-row'>
                <img src={sakaba} loading='lazy' className='w-[75px] sm:h-[50px] h-[75px] sm:w-[50px] rounded-full shrink-0 mr-0 sm:mr-3' />
                <div className=' w-full flex items-center sm:items-start justify-center flex-col'>
                  <h3 className=' font-mmedium text-md text-slate-800 dark:text-slate-50'>
                    Anas Sakaba
                  </h3>
                  <p className='text-[13px] text-slate-600 dark:text-slate-300 pt-0 ml-1'>
                    Computer Science
                  </p>
                </div>
              </div>
              <div className='mt-2 p-1 dark:text-slate-200 text-slate-800'>
                <FontAwesomeIcon icon={faQuoteLeft} className='text-2xl text-blue-500 pr-1' />
                Anas Sakaba here, I can't stress enough how crucial the PQ Hub has been to my academic journey.
                It's not just a platform; it's a community that fosters growth and success.
                <FontAwesomeIcon className='text-2xl text-blue-500 pl-1' icon={faQuoteRight} />
              </div>
            </div>
            <div className=' cardNormall p-5 w-auto h-auto bg-[rgba(255,255,255,.7)] dark:bg-[rgba(2,6,23,.55)]  shadow-md backdrop-blur-md rounded-lg flex items-center justify-center flex-col'>
              <div className=' w-full flex items-center justify-center flex-col gap-y-1 sm:gap-y-0 sm:justify-start sm:flex-row'>
                <img src={classrep} loading='lazy' className='w-[75px] sm:h-[50px] h-[75px] sm:w-[50px] rounded-full shrink-0 mr-0 sm:mr-3' />
                <div className=' w-full flex items-center sm:items-start justify-center flex-col'>
                  <h3 className=' font-mmedium text-md text-slate-800 dark:text-slate-50 '>
                    Mustapha Salihu
                  </h3>
                  <p className='text-[13px] text-slate-600 dark:text-slate-300 pt-0 ml-1'>
                    Computer Science
                  </p>
                </div>
              </div>
              <div className='mt-2 p-1 dark:text-slate-200 text-slate-800'>
                <FontAwesomeIcon icon={faQuoteLeft} className='text-2xl text-blue-500 pr-1' />
                PQ Hub transformed my study routine. Past questions are
                now at my fingertips, making my preparation targeted.
                <FontAwesomeIcon className='text-2xl text-blue-500 pl-1' icon={faQuoteRight} />
              </div>
            </div>
          </div>
          <div className=' w-auto h-auto transform flex flex-col items-center justify-center md:flex-row gap-5'>
            <div className=' cardNormalr p-5 w-auto h-auto bg-[rgba(255,255,255,.7)] dark:bg-[rgba(2,6,23,.55)]  shadow-md backdrop-blur-md rounded-lg flex items-center justify-center flex-col'>
              <div className=' w-full flex items-center justify-center flex-col gap-y-1 sm:gap-y-0 sm:justify-start sm:flex-row'>
                <img src={bena} loading='lazy' className='w-[75px] sm:h-[50px] h-[75px] sm:w-[50px] rounded-full shrink-0 mr-0 sm:mr-3' />
                <div className=' w-full flex items-center sm:items-start justify-center flex-col'>
                  <h3 className=' font-mmedium text-md text-slate-800 dark:text-slate-50 '>
                    Abbaty Bena
                  </h3>
                  <p className='text-[13px] text-slate-600 dark:text-slate-300 pt-0 ml-1'>
                    Computer Science
                  </p>
                </div>
              </div>
              <div className='mt-2 p-1 dark:text-slate-200 text-slate-800'>
                <FontAwesomeIcon icon={faQuoteLeft} className='text-2xl text-blue-500 pr-1' />
                PQ Hub is a game-changer for me.
                With access to well-organized past questions, my study sessions are more focused and productive.
                <FontAwesomeIcon className='text-2xl text-blue-500 pl-1' icon={faQuoteRight} />
              </div>
            </div>
            <div className=' cardNormalr p-5 w-auto h-auto bg-[rgba(255,255,255,.7)] dark:bg-[rgba(2,6,23,.55)]  shadow-md backdrop-blur-md rounded-lg flex items-center justify-center flex-col'>
              <div className=' w-full flex items-center justify-center flex-col gap-y-1 sm:gap-y-0 sm:justify-start sm:flex-row'>
                <img src={blaba} loading='lazy' className='w-[75px] sm:h-[50px] h-[75px] sm:w-[50px] rounded-full shrink-0 mr-0 sm:mr-3' />
                <div className=' w-full flex items-center sm:items-start justify-center flex-col'>
                  <h3 className=' font-mmedium text-md text-slate-800 dark:text-slate-50 '>
                    Lois Olamide
                  </h3>
                  <p className='text-[13px] text-slate-600 dark:text-slate-300 pt-0 ml-1'>
                    Computer Science
                  </p>
                </div>
              </div>
              <div className='mt-2 p-1 dark:text-slate-200 text-slate-800'>
                <FontAwesomeIcon icon={faQuoteLeft} className='text-2xl text-blue-500 pr-1' />
                As a student in Computer Science, PQ Hub has been my secret weapon.
                The shared contributions and collaborative spirit make learning more engaging and effective.
                <FontAwesomeIcon className='text-2xl text-blue-500 pl-1' icon={faQuoteRight} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  )
}

export default People