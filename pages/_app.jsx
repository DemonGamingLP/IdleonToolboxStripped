import React from 'react';
import { CacheProvider, ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import '../polyfills';
import createEmotionCache from '../utility/createEmotionCache';
import darkTheme from '../styles/theme/darkTheme';
import '../styles/globals.css';
import AppProvider from '@components/common/context/AppProvider';
import NavBar from '../components/common/NavBar';

const clientSideEmotionCache = createEmotionCache();


const MyApp = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={darkTheme}>
          <EmotionThemeProvider theme={darkTheme}>
            <CssBaseline>
              <AppProvider>
                <NavBar>
                  <Component {...pageProps} />
                </NavBar>
              </AppProvider>
            </CssBaseline>
          </EmotionThemeProvider>
        </ThemeProvider>
      </CacheProvider>
    </>
  );
};

export default MyApp;
