import Cookies from 'js-cookie';
import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    return Cookies.get('token');
  };

  const [token, setToken] = useState(getToken());

  const saveToken = userToken => {
    if (userToken==="") return;
    Cookies.set('token', userToken, { expires: 7 });
    setToken(userToken);
  };

  return {
    setToken: saveToken,
    token
  }
}
