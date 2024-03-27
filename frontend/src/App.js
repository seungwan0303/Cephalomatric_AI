import './App.css';
import NavigationBar from './component/NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import {useEffect, useState} from 'react';
import MainPage from './pages/MainPage';
import AccountPage from './pages/AccountPage';
import AnimatedCursor from 'react-animated-cursor';

function App() {

  const [session, setSession] = useState();

  const createSession = (sessionKey) => {
    setSession(sessionKey);
  }



  return (
    <div className="App">
      <header className="App-header">
        {session !== undefined && <MainPage session={session} setSession={createSession}/>}
        {session === undefined && <AccountPage createSession={createSession}/>}
      </header>
    </div>
  );
}

export default App;
