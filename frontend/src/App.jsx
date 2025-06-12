import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Signuppage from './pages/auth/Signuppage';
import Loginpage from './pages/auth/Loginpage';
import Homepage from './pages/home/Homepage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import {Toaster} from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';
function App() {
  const {data:authUser,isLoading,error,isError} = useQuery({
    queryKey:["authUser"],
    queryFn:async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if(data.error) return null;
        if(!res.ok) throw new Error(data.error || "Something went wrong")
        console.log("authUser is here:",data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry:false
  })
  if(isLoading){
    return(
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size="lg"/>
      </div>
    )
  }
  
  const location = useLocation();
  const hidePanelsOn = ['/signup', '/login'];

  const shouldShowPanels = !hidePanelsOn.includes(location.pathname);

  return (
    <>
      <div className={`flex ${shouldShowPanels ? 'max-w-6xl mx-auto' : ''}`}>
        {shouldShowPanels && <Sidebar />}
        <Routes>
          <Route path="/" element={authUser?<Homepage />:<Navigate to="/login"/>} />
          <Route path="/signup" element={!authUser?<Signuppage />:<Navigate to="/"/>} />
          <Route path="/login" element={!authUser?<Loginpage />:<Navigate to="/"/>} />
          <Route path="/notifications" element={authUser?<NotificationPage />:<Navigate to="/login"/>} />
          <Route path="/profile/:username" element={authUser?<ProfilePage />:<Navigate to="/login"/>} />
        </Routes>
        {shouldShowPanels && <RightPanel />}
        <Toaster/>
      </div>
    </>
  );
}

export default App;
