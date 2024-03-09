import React, { useContext, useEffect, useLayoutEffect } from 'react';
import Footer from '../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faBrain, faCog, faCogs, faCoins, faComments, faCubes, faFire, faMobileAlt, faMobileAndroid, faMoneyBill, faQuestion, faQuestionCircle, faRobot, faSearch, faShareAlt, faSmile, faUserGraduate, faUsers } from '@fortawesome/free-solid-svg-icons';
import { faAndroid, faCss3Alt, faReact } from '@fortawesome/free-brands-svg-icons';
import { MyAppContext } from '../AppContext/MyContext';
import NavForAbout from '../components/NavForAbout';
import { Tooltip } from '@mui/material';

const About = () => {
  const { scrollTop } = useContext(MyAppContext);
  const toTop = () => {
    window.scrollTo(0, 0)
  }
  useEffect(() => {
    document.title = 'About'
  }, [])
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])
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
        else if (targetElement.classList.contains('headText')) {
          targetElement.classList.toggle('headCome', entry.isIntersecting);
        } else if (targetElement.classList.contains('headText2')) {
          targetElement.classList.toggle('headCome2', entry.isIntersecting);
        }
        else if (targetElement.classList.contains('bodyText')) {
          targetElement.classList.toggle('bodyCome', entry.isIntersecting);
        }
      });
    }, { rootMargin: '50px' });

    let animDivs = document.querySelectorAll('.cardNormall, .cardNormalr, .headText, .headText2, .bodyText');
    animDivs.forEach((div) => {
      observer.observe(div);
    });

    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 10);

    // Clean up observer on component unmount
    return () => {
      animDivs.forEach((div) => {
        observer.unobserve(div);
      });
    };
  }, []);
  return (
    <>
      <div className="w-full overflow-x-hidden px-4 py-8 dark:bg-slate-900 pt-24 lg:px-32">
        <NavForAbout />
        <div className="text-left mb-8 px-5 bodyText">
          <h1 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">About Us</h1>
          <p className="text-gray-600 dark:text-gray-400">Get to know more about PQ Hub and our mission</p>
        </div>

        <div className=' flex items-center justify-center flex-col md:flex-row md:gap-4'>
          {/* Introducing PQ Hub */}
          <section className="mb-8 px-5">
            <h2 className="text-2xl cardNormall font-semibold mb-4 text-slate-800 dark:text-slate-100">
              What is PQ Hub  <FontAwesomeIcon icon={faQuestionCircle} />
            </h2>
            <p className="text-gray-600 bodyText dark:text-gray-300">
              PQ Hub, short for Past Questions Hub, is a project designed to address a common challenge faced by students. We understand the persistent challenge students face when it comes to finding and sharing past questions for exam preparations. That's why we're dedicated to eliminating the hassle and bringing past questions right to your fingertips.
            </p>
          </section>

          {/* Meet Dev Nasfam */}
          <section className="mb-8 px-5">
            <h2 className="text-2xl font-semibold cardNormalr mb-4 text-slate-800 dark:text-slate-100">
              Meet Dev Nasfam <FontAwesomeIcon icon={faUserGraduate} />
            </h2>
            <p className="text-gray-600 bodyText dark:text-gray-300">
              Hello there! I'm Abdulmajid Ahmad, but you might know me better as Dev Nasfam. I'm currently pursuing a Bachelor's degree in Computer Science at Federal University Birnin Kebbi. As a web developer, I'm deeply passionate about leveraging my coding skills to tackle real-world challenges.
            </p>
          </section>
        </div>

        <div className=' flex items-start justify-start md:justify-center'>
          {/* Inspiration Behind PQ Hub */}
          <section className="mb-8 px-5 lg:px-32 bodyText">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Inspiration Behind PQ Hub</h2>
            <p className="text-gray-600 dark:text-gray-300 lg:text-justify">
              The inspiration for PQ Hub came from personal experience. As a student myself, along with my friends, I often found ourselves scrambling to gather past questions for exam preparations. Recognizing the universal nature of this challenge, I embarked on a mission to create a solution that would streamline the process for students.
            </p>
          </section>
        </div>

        {/* Key Features */}
        <section className="mb-8 px-5">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Key Features</h2>
          {/* Each feature can be represented as a card or list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Feature Card 1 */}
            <div className="bg-white cardNormalr transform hover:scale-[1.02] dark:bg-slate-950/60 shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-fuchsia-400 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faShareAlt} /> <br />
                Share Past Questions
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                PQ Hub allows students to share and explore past questions effortlessly. Our platform provides a centralized hub where students can easily share and access past questions with fellow peers.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="bg-white cardNormalr transform hover:scale-[1.02] dark:bg-slate-950/60 shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-blue-500 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faComments} /> <br />
                Real-time Chat
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Engage in meaningful discussions with friends about studies, exams, and more with our real-time chat feature. Connect with other students, exchange insights, and support each other's academic journeys.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-white cardNormalr transform hover:scale-[1.02] dark:bg-slate-950/60 shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-pink-400 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faRobot} /> <br />
                AI Assistance
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Stuck on a challenging question? Our AI chatbot is here to help! Get instant assistance and guidance on difficult questions, allowing you to overcome obstacles and excel in your studies.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-white cardNormall transform hover:scale-[1.02] dark:bg-slate-950/60 shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-green-500 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faCoins} /> <br />
                Earn Rewards
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Earn points by sharing past questions and engaging with the PQ Hub community. Redeem your accumulated points for airtime or data rewards, giving you the opportunity to stay connected while you study.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-white cardNormall transform hover:scale-[1.02] dark:bg-slate-950/60 shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold tracking-wide mb-2 text-slate-900 dark:text-slate-200">
                <FontAwesomeIcon className=' text-teal-500 mr-2.5 mb-1 p-2.5 bg-slate-800 rounded-md' icon={faUsers} /> <br />
                Social Networking
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                PQ Hub isn't just about past questions—it's also a social networking platform for students. Connect with friends, follow each other, like posts, and bookmark past questions for later reference.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-white cardNormall transform hover:scale-[1.02] dark:bg-slate-950/60 shadow-md rounded-lg p-6">
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

        {/* Technologies Used */}
        <section className="mb-8 px-5 lg:px-10">
          <h2 className="text-2xl font-bold mb-4 cardNormall text-slate-800 dark:text-slate-100"><FontAwesomeIcon className=' text-cyan-400' icon={faCogs} /> Technologies Used</h2>
          <p className=" lg:w-[65%] text-gray-600 bodyText dark:text-gray-300">
            PQ Hub is powered by cutting-edge technologies to deliver a seamless user experience.
          </p>
          {/* List of technologies */}
          <ul className=" bodyText lg:w-[65%] list-disc list-inside px-5 pt-2 text-gray-600 dark:text-gray-300">
            <li className=' list-outside'><FontAwesomeIcon className=' text-lg text-blue-400' icon={faReact} /> Frontend: Developed using  <a href="https://react.dev/" target='_blank' className=' text-blue-500'>React</a> and styled with <a href="https://tailwindcss.com" target='_blank' className=' text-blue-500'>Tailwind CSS</a> for a sleek and modern look.</li>
            <li className=' list-outside'><FontAwesomeIcon className=' text-lg text-orange-500' icon={faFire} /> Backend: Powered by <a href="https://firebase.google.com/" target='_blank' className=' text-blue-500'>Firebase</a>, ensuring robust performance and seamless data management.</li>
            <li className=' list-outside'><FontAwesomeIcon className=' text-lg text-cyan-500' icon={faCubes} /> Libraries: We've integrated additional libraries such as <a href="https://mui.com" target='_blank' className=' text-blue-500'>MUI</a> for intuitive UI, <a href="https://react-select.com/" className=' text-blue-500' target='_blank'>React-Select</a> for dropdowns and <a href="https://react-hot-toast.com/" target='_blank' className=' text-blue-500'>React-Hot-Toast</a> for user-friendly notifications.</li>
            <li className=' list-outside'><FontAwesomeIcon className=' text-lg text-slate-400' icon={faCog} /> Development Tools: Built with <a href="https://vitejs.dev/" target='_blank' className=' text-blue-500'>Vite</a> for rapid development and efficient maintenance.</li>
          </ul>
        </section>

        {/* Future Plans */}
        <section className="mb-8 px-5 lg:px-10">
          <h2 className="text-2xl cardNormall font-bold mb-4 text-slate-800 dark:text-slate-100">Future Plans</h2>
          <p className=" bodyText lg:w-[65%] text-gray-600 dark:text-gray-300">
            Our journey with PQ Hub doesn't end here. We're committed to continuous improvement and innovation.
          </p>
          <ul className=" bodyText lg:w-[65%] list-disc list-inside px-5 pt-2 text-gray-600 dark:text-gray-300">
            <li className=' list-outside'><FontAwesomeIcon icon={faAndroid} className=' text-lg text-green-400' /> Mobile App Development: We're working on developing a mobile app for both iOS and Android platforms, allowing students to access PQ Hub on the go.</li>
            <li className=' list-outside'><FontAwesomeIcon icon={faBrain} className=' text-lg text-pink-300' /> AI Integration: We're on a mission to make studying even smarter with AI image recognition. Say goodbye to spammy posts and hello to a cleaner, more helpful study feed!</li>
          </ul>
        </section>

        {/* Get in Touch */}
        <section className=' px-5 lg:px-10 cardNormall'>
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Got questions, feedback, or just want to say hi? We'd love to hear from you!
          </p>
        </section>
      </div>
      <Tooltip title='Scroll to top' arrow enterDelay={500}>
        <div onClick={toTop}
          className={`${scrollTop ? 'scale-100' : 'scale-0'} transform duration-200 active:scale-[0.87] border
     border-slate-300 dark:border-slate-700  shadow-2xl shadow-black cursor-pointer 
      flex items-center justify-center w-9 h-9 bg-slate-100 rounded-full fixed z-50 bottom-5 right-5`}>
          <FontAwesomeIcon className=' text-slate-900' icon={faAngleUp} />
        </div>
      </Tooltip>
      <Footer />
    </>
  );
}

export default About;
