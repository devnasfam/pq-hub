import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faNetworkWired, faPrescription, faAngleUp, faBrain, faCog, faCogs, faComments, faCubes, faFire, faMobileAlt, faMobileAndroid, faQuestion, faQuestionCircle, faRobot, faSearch, faShareAlt, faSmile, faUserGraduate, faUsers, faMoneyBill, faCoins } from '@fortawesome/free-solid-svg-icons'

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
      <section id='feature' className=' scroll-m-14 relative w-full h-auto p-4 px-5 sm:px-6 lg:px-10 xl:px-16 flex flex-col items-center justify-around lg:justify-center gap-5 lg:gap-5 lg:pt-5'>
        <div className='bg-blue-500 shadow-xl blur-xl shadow-red-500 w-[280px] h-[280px] rounded-full z-0 absolute top-[125px] md:top-[160px] right-0' />
        <div className='bg-pink-500 shadow-2xl blur-xl shadow-blue-500 w-[280px] h-[280px] rounded-full z-0 absolute bottom-[-15px] left-0' />
        <div className='bg-yellow-500 shadow-2xl blur-xl shadow-green-500 w-[310px] h-[310px] rounded-full z-0 absolute top-[42%] lg:top-[35%] left-[40%]' />
        <div className=' z-20 w-full flex items-center justify-center py-5 text-slate-700 dark:text-slate-100 md:text-2xl text-xl font-semibold'>
          <FontAwesomeIcon className='px-2 text-blue-600 text-2xl' icon={faNetworkWired} />
          Features you'd expect from us.
        </div>
        {/* Key Features */}
        <section className="mb-8 px-5 z-20">
          {/* Each feature can be represented as a card or list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Feature Card 1 */}
            <div className="cardNormall duration-150 transform hover:scale-[1.02] bg-[rgba(255,255,255,.7)] dark:bg-[rgba(2,6,23,.55)] shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-fuchsia-400 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faShareAlt} /> <br />
                Share Past Questions
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                PQ Hub allows students to share and explore past questions effortlessly. Our platform provides a centralized hub where students can easily share and access past questions with fellow peers.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="cardNormall duration-150 transform hover:scale-[1.02] bg-[rgba(255,255,255,.7)] dark:bg-[rgba(2,6,23,.55)] shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-blue-500 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faComments} /> <br />
                Real-time Chat
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Engage in meaningful discussions with friends about studies, exams, and more with our real-time chat feature. Connect with other students, exchange insights, and support each other's academic journeys.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="cardNormall duration-150 transform hover:scale-[1.02] bg-[rgba(255,255,255,.7)] dark:bg-[rgba(2,6,23,.55)] shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-pink-400 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faRobot} /> <br />
                AI Assistance
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Stuck on a challenging question? Our AI chatbot is here to help! Get instant assistance and guidance on difficult questions, allowing you to overcome obstacles and excel in your studies.
              </p>
            </div>
            {/* Feature Card 5 */}
            <div className="cardNormalr duration-150 transform hover:scale-[1.02] bg-[rgba(255,255,255,.7)] dark:bg-[rgba(2,6,23,.55)] shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-green-500 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faCoins} /> <br />
                Earn Rewards
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
               Earn points by sharing past questions and engaging with the PQ Hub community. Redeem your accumulated points for airtime or data rewards, giving you the opportunity to stay connected while you study.        
              </p>
            </div>
            {/* Feature Card 4 */}
            <div className="cardNormalr duration-150 transform hover:scale-[1.02] bg-[rgba(255,255,255,.7)] dark:bg-[rgba(2,6,23,.55)] shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-teal-500 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faUsers} /> <br />
                Social Networking
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                PQ Hub isn't just about past questions—it's also a social networking platform for students. Connect with friends, follow each other, like posts, and bookmark past questions for later reference.
              </p>
            </div>
            {/* Feature Card 6 */}
            <div className="cardNormalr duration-150 transform hover:scale-[1.02] bg-[rgba(255,255,255,.7)] dark:bg-[rgba(2,6,23,.55)] shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-yellow-400 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faSmile} /> <br />
                User-friendly Experience
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We've designed PQ Hub to be user-friendly, fast, and responsive across all devices. Whether you're accessing our platform on your laptop, tablet, or smartphone, you'll enjoy a seamless experience that prioritizes ease of use and accessibility.
              </p>
            </div>
          </div>
        </section>
      </section>
    </>
  )
}

export default Feature
