import { createContext, useEffect, useMemo, useReducer, useState } from 'react';
import { checkUserStatus, signInWithToken, subscribe, userSignOut } from '../../../firebase';
// import { parseData } from '../../../parsers';

import { useRouter } from 'next/router';
import useInterval from '@components/hooks/useInterval';
import { getUserToken } from '../../../logins/google';
import { CircularProgress, Stack } from '@mui/material';
import { getProfile } from '../../../services/profiles';
import { setStorageData } from '@utility/storageApiHelper';

export const AppContext = createContext({});

function appReducer(state, action) {
  switch (action.type) {
    case 'login': {
      return { ...state, ...action.data };
    }
    case 'data': {
      return { ...state, ...action.data };
    }
    case 'logout': {
      return { characters: null, account: null, signedIn: false };
    }
    case 'loginError': {
      return { ...state, loginError: action.data };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {}, undefined);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  const [authCounter, setAuthCounter] = useState(0);
  const [waitingForAuth, setWaitingForAuth] = useState(false);
  const [listener, setListener] = useState({ func: null });


  useEffect(() => {
    // if (!router.isReady) return;
    let unsubscribe;
    (async () => {
      if (!state?.signedIn) {
        console.log("use Effect in appProvider")
        const user = await checkUserStatus();
        if (!state?.account && user) {
          unsubscribe = await subscribe(user?.uid, user?.accessToken, handleCloudUpdate);
          setListener({ func: unsubscribe });
        }
      }
    })();

    return () => {
      typeof unsubscribe === 'function' && unsubscribe();
      typeof listener.func === 'function' && listener.func();
    };
  }, []);


  useEffect(() => {
    if (!waitingForAuth && authCounter !== 0) {
      setAuthCounter(0);
    }
  }, [waitingForAuth])

  useInterval(
    async () => {
      try {
        console.log('signed in?')
        if (state?.signedIn) return;
        console.log('nope!')
        let id_token, uid, accessToken;
        const user = (await getUserToken(state?.loginData?.deviceCode)) || {};
        if (user) {
          id_token = user?.id_token;
        }
        if (id_token) {
          const userData = await signInWithToken(id_token, state?.loginType);
          uid = userData?.uid;
        }

        if (id_token) {
          const unsubscribe = await subscribe(uid, accessToken || id_token?.id_token, handleCloudUpdate);
          if (typeof window?.gtag !== 'undefined') {
            window?.gtag('event', 'login', {
              action: 'login',
              category: 'engagement',
              value: 'google'
            });
          }
          setListener({ func: unsubscribe });
          setWaitingForAuth(false);
          setAuthCounter(0);
        } else if (authCounter > 8) {
          setWaitingForAuth(false);
          dispatch({ type: 'loginError', data: 'Reached maximum retry limit, please re-open this dialog' });
        }
        setAuthCounter((counter) => counter + 1);
      } catch (error) {
        console.error('Error: ', error?.stack)
        dispatch({ type: 'loginError', data: error?.stack });
      }
    },
    waitingForAuth ? authCounter === 0 ? 1000 : 4000 : null
  );

  const logout = () => {
    typeof listener.func === 'function' && listener.func();
    userSignOut();
    if (typeof window?.gtag !== 'undefined') {
      window?.gtag('event', 'logout', {
        action: 'logout',
        category: 'engagement',
        value: 1
      });
    }
    localStorage.removeItem('charactersData');
    localStorage.removeItem('rawJson');
    dispatch({ type: 'logout' });
    setWaitingForAuth(false);
  };

  const handleCloudUpdate = async (data, serverVars, uid, accessToken) => {
    console.info('rawData', {
      data,
      serverVars
    })
    localStorage.setItem('rawJson', JSON.stringify({
      data,
      serverVars,
    }));
    const { parseData } = await import('@parsers/index');
    const parsedData = parseData(data);
    setStorageData(parsedData)
    localStorage.setItem('manualImport', JSON.stringify(false));
    dispatch({
      type: 'data',
      data: {
        ...parsedData,
        signedIn: true,
        manualImport: false,
        profile: false,
        uid,
        accessToken,
      }
    });
  };

  const shouldDisplayPage = () => {
    return value?.state?.account;
  }

  return (
    <AppContext.Provider
      value={{
        ...value,
        logout,
        waitingForAuth,
        setWaitingForAuth
      }}
    >
      {shouldDisplayPage() ? (
        children
      ) : (
        <Stack m={15} direction={'row'} justifyContent={'center'}>
          <CircularProgress/>
        </Stack>
      )}
    </AppContext.Provider>
  );
};

export default AppProvider;
