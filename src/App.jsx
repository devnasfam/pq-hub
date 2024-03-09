import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Contribue from './pages/Contribue'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
import EditProfile from './pages/EditProfile'
import Contributions from './pages/Contributions'
import PQHubAI from './pages/PQHubAI'
import Search from './pages/Search'
import Chats from './pages/Chats'
import savedPastQ from './pages/savedPastQ'
import userProfile from './pages/userProfile'
import ChatScreen from './pages/ChatScreen'
import About from './pages/AboutUs'
import Rewards from './pages/Rewards'
import Admin from './pages/Admin'

const App = () => {
  return (
    <div className=' w-full min-h-screen bg-sky-50 dark:bg-slate-950'>
      
      <Router>
        <Routes>
          <Route path='/' Component={Home} />
          <Route path='/signup' Component={SignUp} />
          <Route path='/login' Component={Login} />
          <Route path='/about' Component={About} />
          <Route path='/reset-password' Component={ResetPassword} />
          <Route path='/feed' Component={Feed} />
          <Route path='/search' Component={Search} />
          <Route path='/contribute' Component={Contribue} />
          <Route path='/profile' Component={Profile} />
          <Route path='/profile/edit' Component={EditProfile} />
          <Route path='/profile/my-contributions' Component={Contributions} />
          <Route path='/profile/saved' Component={savedPastQ} />
          <Route path='/ai-chatbot' Component={PQHubAI} />
          <Route path='/rewards' Component={Rewards} />
          <Route path='/chats' Component={Chats} />
          <Route path='/:username' Component={userProfile} />
          <Route path='/admin' Component={Admin} />
          <Route path='/chats/:chatId' Component={ChatScreen} />
        </Routes>
      </Router>
    </div>
  )
}
export default App
