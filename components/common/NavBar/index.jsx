import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import React from 'react';
import Box from '@mui/material/Box';
import LoginButton from './LoginButton';
import { drawerWidth, navBarHeight } from '../../constants';
import { useRouter } from 'next/router';
import { shouldDisplayDrawer } from '../../../utility/helpers';
import { useMediaQuery } from '@mui/material';

const NavBar = ({ children }) => {
  const router = useRouter();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'), { noSsr: true });
  const displayDrawer = shouldDisplayDrawer(router?.pathname);

  return <>
    <Box sx={{}}>
      <AppBar>
          <LoginButton/>
      </AppBar>
    </Box>
    <Box sx={{ height: navBarHeight }}></Box>
    <Box component={'main'} sx={{
      pt: 3,
      pr: 3,
      pl: { xs: 3, lg: displayDrawer ? `${drawerWidth + 24}px` : 3 },
      mb: isXs ? '75px' : '110px'
    }}>
      {children}
    </Box>
  </>
};

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

export default NavBar;
