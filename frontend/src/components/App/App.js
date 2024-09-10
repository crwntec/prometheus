import "./App.css";
import Charts from "../Charts/Charts"
import AppBar from "../AppBar"
import Login from "../Login/Login"
import useToken from "./useToken";
import Cookies from 'js-cookie';
import { useState } from "react";


function App() {
  const { token, setToken } = useToken();
  const [classSelectValue, setClassSelectValue] = useState(true)
  const [dateSelectValue, setDateSelectValue] = useState(0);
  const [currentSchoolYear, setCurrentSchoolYear] = useState({})

  if(!token) {
    return <Login setToken={setToken} setCurrentSchoolYear={setCurrentSchoolYear} />
  }

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('userID')
    window.location.href = '/';
    return false;
  }
  
  return (
    <div className="App">
      <div className="wrapper">
        <AppBar
          isLoggedIn={token !== ""}
          logout={logout}
          classSelectValue={classSelectValue}
          setClassSelectValue={setClassSelectValue}
          dateSelectValue={dateSelectValue}
          setDateSelectValue={setDateSelectValue}
        />
        {token && (
          <Charts
            logout={logout}
            classSelectValue={classSelectValue}
            dateSelectValue={dateSelectValue}
            currentSchoolYear={currentSchoolYear}
          />
        )}
      </div>
    </div>
  );
}

export default App;
