import React, { useContext, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { MyAppContext } from '../AppContext/MyContext'

const Section = () => {
  const { user } = useContext(MyAppContext);

  useEffect(() => {
    let observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        let targetElement = entry.target;
        if (targetElement.classList.contains('headText')) {
          targetElement.classList.toggle('headCome', entry.isIntersecting);
        } else if (targetElement.classList.contains('headText2')) {
          targetElement.classList.toggle('headCome2', entry.isIntersecting);
        }
        else if (targetElement.classList.contains('bodyText')) {
          targetElement.classList.toggle('bodyCome', entry.isIntersecting);
        }
      });
    });

    let animDivs = document.querySelectorAll('.headText, .headText2, .bodyText');
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
    <section id='about' className='w-full h-auto scroll-m-20 flex items-center justify-center my-5'>
      <div className='w-full h-full flex flex-col items-start justify-center xl:px-28'>
        <div className=' z-10 w-full md:w-[600px] xl:w-[650px] h-auto p-4 px-10 md:px-10'>
          <h3 className='headText font-semibold tracking-wider dark:text-slate-100 text-xl text-slate-950 py-1'>
            Why PQ Hub?
          </h3>
          <p className='bodyText mt-2 dark:text-slate-300 text-lg tracking-wide'>
            In the academic landscape, sharing past questions has been a persistent challenge for students. PQ Hub, founded by
            <a href="https://instagram.com/devnasfam" className=' text-blue-500'> devnasfam</a>, steps in,
            eliminating the struggle of hunting for past questions and transforming your study journey into a seamless experience.
            Ready to make an impact? Create your account now and share your past questions on PQ Hub.
            Your contributions can make a real difference and help others on their academic journey.
          </p>
        </div>
        <div className=' z-10 my-4 w-full md:w-[600px] xl:w-[650px] h-auto p-4 px-10 md:px-10 self-end'>
          <h3 className='headText2 font-semibold tracking-wider dark:text-slate-100 text-xl text-slate-950 py-1'>
            About Us
          </h3>
          <p className='bodyText mt-2 dark:text-slate-300 text-lg tracking-wide'>
            PQ Hub is an integrated platform designed to revolutionize the way students engage with past questions.
            With a dedicated feed showcasing popular and recent past questions, students can explore relevant content effortlessly.
            The platform offers a seamless user experience, incorporating authentication for secure signup and login processes.
            Key features include a dynamic page for filtering and searching past questions, allowing students to tailor their study needs effectively
            <Link to='/about' className=' text-blue-500'> read more...</Link>
          </p>
        </div>
        <div className='w-[80%] bodyText mx-auto mt-10 md:w-[60%] p-5 lg:p-12 bg-slate-100 dark:bg-[rgba(2,6,23,.55)] backdrop-blur-md rounded-xl flex flex-col md:flex-row items-center justify-around shadow-lg text-slate-700 dark:text-slate-200'>
          <h2 className='text-slate-800 dark:text-slate-200 lg:text-lg md:pr-2 px-3'>
            Embark on a learning adventure at Past Questions Hub.
          </h2>
          <div className='flex items-center justify-center h-full mt-3 md:mt-0'>
            {!user &&
              <button
                className="w-[100%] relative group overflow-hidden bg-blue-500 ring-2 ring-blue-400 shadow font-medium text-md text-white p-1.5 px-5 rounded-full transition-all hover:scale-95"
              >
                <Link to='/signup' className=' overflow-hidden'>
                  <div className=' z-10 group-hover:text-blue-500 w-full flex items-center justify-center'>
                    <FontAwesomeIcon icon={faSignInAlt} className='px-1 pl-0 duration-150 group-hover:scale-110 group-hover:mr-0' />
                    <p className=' tracking-wide whitespace-nowrap'>Sign Up</p>
                  </div>
                  <div className=' -z-10 transform scale-0 top-full left-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:top-1/2 group-hover:scale-100 rounded-full duration-300 w-full bg-slate-100 h-full absolute'></div>
                </Link>
              </button>
            }
          </div>
        </div>
      </div>
    </section>
  )
}

export default Section
