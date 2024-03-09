import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import {
  faComments,
  faContactBook,
  faLocation,
  faPaperPlane,
  faPhone,
  faUser,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faInstagram,
  faTwitter,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseService";
import { MyAppContext } from "../AppContext/MyContext";
import toast, { Toaster } from "react-hot-toast";
import { Tooltip } from "@mui/material";

const Footer = () => {

  const [feedBack, setfeedBack] = useState('')
  const [errorMsg, seterrorMsg] = useState('')
  const [successMsg, setsuccessMsg] = useState('')
  const [btnContent, setBtnContent] = useState('')
  const [ipInfo, setIpInfo] = useState({});
  const { setscrollTop } = useContext(MyAppContext);

  const HandleChange = (e) => {
    setfeedBack(e.target.value)
    seterrorMsg('')
    setsuccessMsg('')
  }

  const FeedBackToSend = async () => {
    const feedbackRef = collection(db, "Feedbacks");
    try {
      if (feedBack.trim() === '') {
        toast.error('Please feedback before submitting!', { duration: 2000 })
      } else {
        const loadToast = toast.loading('Sending feedback...', { duration: Infinity })
        await addDoc(feedbackRef, {
          feedBack,
          date: new Date(),
          country: ipInfo.country_name || 'Unknown country',
          city: ipInfo.city || 'Unknown city',
          timestamp: Date.now(),
        })
        toast.success('Thanks for your feedback!', { duration: 2000, id:loadToast })
        setfeedBack('')
        setTimeout(() => {
          setsuccessMsg('')
        }, 2500);
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message, { duration: 2000, id:loadToast })
    }
  }

  let sendFeedBack = () => {
    FeedBackToSend()
  }

  const fetchData = async () => {
    try {
      let res = await fetch('https://ipapi.co/json');
      let data = await res.json();
      setIpInfo(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  useEffect(() => {
    const keyDown = (e) => {
      if (e.key === 'Enter') {
        FeedBackToSend();
      }
    };
    window.addEventListener('keydown', keyDown);

    return () => {
      window.removeEventListener('keydown', keyDown);
    };
  }, [feedBack]);

  useEffect(() => {
    let observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        let targetElement = entry.target;
        if (targetElement.classList.contains('footShowScroll')) {
          setscrollTop(entry.isIntersecting);
        }
      });
    });

    let animDivs = document.querySelectorAll('.footShowScroll');
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
    <footer
      id="contact"
      className="footShowScroll border-t-[0.1px] border-t-slate-900 scroll-m-14 z-30 w-full bg-slate-950 h-auto flex items-center justify-center py-4">
      <div className="w-[95%] h-auto p-5 flex items-center justify-around gap-3 flex-col xl:flex-row">
        <div className="w-full flex items-center justify-center gap-3 flex-col md:flex-row">
          <div className="w-full h-auto p-2">
            <h2 className="text-xl font-medium text-blue-400">
              <FontAwesomeIcon className="px-2" icon={faContactBook} />
              Contact Us
            </h2>
            <p className="text-slate-300 p-3">
              Have a question in mind? Don't hesitate to reach us!
            </p>
            <ul className="text-slate-200 ml-2">
              <a href="mailto:amajidahmad848@gmail.com">
                <li className="mb-1 truncate">
                  <FontAwesomeIcon className="px-2" icon={faEnvelope} />
                  Email: amajidahmad848@gmail.com
                </li>
              </a>
              <a href="tel:+2347046864411">
                <li>
                  <FontAwesomeIcon className="px-2" icon={faPhone} />
                  Phone: +234-70468-64411
                </li>
              </a>
            </ul>
          </div>
          <div className="w-full h-auto p-2">
            <h2 className="text-xl font-medium text-blue-400">
              <FontAwesomeIcon className="px-2" icon={faLocation} />
              Address
            </h2>
            <address className="text-slate-200 p-2 not-italic truncate">
              Federal University Birnin Kebbi <br />
              Unguwan Jeji. <br /> FUBK Campus <br /> Kebbi State, Nigeria.
            </address>
          </div>
        </div>
        <div className="w-full h-auto p-2 flex items-center flex-col md:flex-row xl:flex-row justify-center">
          <div className="w-full my-5 xl:my-0 xl:-ml-4">
            <h2 className="text-xl font-medium text-blue-400">
              <FontAwesomeIcon className="px-2" icon={faUser} />
              Follow Us
            </h2>
            <p className="text-slate-300 p-2 md:px-4">
              Connect with us for a richer academic experience.
            </p>
            <ul className="text-slate-200 ml-2 py-3 pt-1">
              <div className=" flex items-center justify-start space-x-3">
                <a href="http://github.com/devnasfam">
                  <li className="mb-1">
                    <FontAwesomeIcon className="px-2" icon={faGithub} />
                    GitHub
                  </li>
                </a>
                <a href="http://wa.me/2347046864411">
                  <li className="mb-1">
                    <FontAwesomeIcon className="px-2" icon={faWhatsapp} />
                    WhatsApp
                  </li>
                </a>
              </div>
              <div className=" flex items-center justify-start space-x-3">
                <a href="https://instagram.com/devnasfam">
                  <li>
                    <FontAwesomeIcon className="px-2" icon={faInstagram} />
                    Instagram
                  </li>
                </a>
                <a href="https://x.com/devnasfam">
                  <li>
                    <FontAwesomeIcon className="px-2" icon={faTwitter} />
                    Twitter
                  </li>
                </a>
              </div>
            </ul>
          </div>
          <div className="w-full">
            <h2 className="text-xl font-medium text-blue-400">
              <FontAwesomeIcon className="px-2" icon={faComments} />
              Feedback
            </h2>
            <div className="w-full flex items-center justify-center flex-col my-3">
              <div className=" w-full flex items-center justify-start">
                <input
                  type="text"
                  placeholder="Send Feedback.."
                  value={feedBack}
                  onChange={HandleChange}
                  className="w-[60%] md:w-[65%] xl:w-[85%] rounded-full p-[5px] px-4 pr-14 outline-none"
                />
              <Tooltip title='Send' enterDelay={400} arrow>
                <button onClick={sendFeedBack} className=" outline-none shrink-0 -ml-12 z-10 relative group hover:text-blue-500 bg-blue-500 w-[48px] h-[48px] duration-150 hover:scale-[1] active:bg-blue-400  flex items-center justify-center rounded-full text-slate-50">
                  <FontAwesomeIcon className="px-2 z-10 group-hover:text-blue-500" icon={faPaperPlane} />
                  <div className=' -z-10 transform scale-0 top-full left-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:top-1/2 group-hover:scale-100 rounded-full duration-300 w-full bg-slate-100 h-full absolute'></div>
                </button>
              </Tooltip>
              </div>
            </div>
            <div className=" hidden md:block m-4 mb-1 text-slate-400 text-sm">
              Proudly founded by{" "}
              <a
                href="https://instagram.com/devnasfam"
                className=" text-blue-500">
                @devnasfam{" "}
              </a>{" "}
              <FontAwesomeIcon icon={faUserGraduate} />
            </div>
            <div className=" hidden md:block mx-3 text-slate-500 text-xs">
              &copy; All rights reserved 2023
            </div>
          </div>
        </div>
        <div className="md:hidden text-slate-400 text-sm">
          Proudly founded by{" "}
          <a href="https://instagram.com/devnasfam" className=" text-blue-500">
            @devnasfam{" "}
          </a>{" "}
          <FontAwesomeIcon icon={faUserGraduate} />
        </div>
        <div className="md:hidden text-slate-500 text-xs">
          &copy; All rights reserved 2023
        </div>
      </div>
      <Toaster position="bottom-center" />
    </footer>
  )
};
export default Footer;
