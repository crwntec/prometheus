import "./App.css";
import Charts from "../Charts/Charts"
import AppBar from "../AppBar"
import Login from "../Login/Login"
import useToken from "./useToken";
import Cookies from 'js-cookie';


function App() {
  const {token, setToken} = useToken();

  if(!token) {
    return <Login setToken={setToken} />
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
          <AppBar isLoggedIn={token!==""} logout={logout} />
          {token && <Charts logout={logout} />}
        </div>
    </div>
  );
}

export default App;
