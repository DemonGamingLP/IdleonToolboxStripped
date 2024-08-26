import { Dialog, DialogContent, DialogTitle, Stack, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import React, { useContext } from 'react';
import GoogleIcon from '@mui/icons-material/Google';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import GoogleLogin from '../Logins/GoogleLogin';
import { AppContext } from '../context/AppProvider';

const methods = [
  { name: 'gmail', icon: <GoogleIcon/> },
]
const LoginDialog = ({ open, onClose }) => {
  const { dispatch, setWaitingForAuth, waitingForAuth } = useContext(AppContext);
  const isSm = useMediaQuery((theme) => theme.breakpoints.down('sm'), { noSsr: true });

  const handleClose = () => {
    dispatch({ type: 'loginError', data: '' });
    setWaitingForAuth(false);
    onClose();
  }

  return <Dialog fullWidth={true} maxWidth={'sm'} open={open} onClose={handleClose}>
    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Stack>
        <Typography>Login</Typography>
        <Typography variant={'caption'}>using your idleon credentials</Typography>
      </Stack>
      <IconButton onClick={handleClose}><CloseIcon/></IconButton>
    </DialogTitle>
    <DialogContent>
      <GoogleLogin/>
    </DialogContent>
  </Dialog>
};

export default LoginDialog;
