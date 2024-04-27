import React, { useContext } from 'react';
import { AppContext } from 'components/common/context/AppProvider';
import { Divider, Grid, Stack, Typography } from '@mui/material';
import { cleanUnderscore, getCoinsArray } from 'utility/helpers';
import CoinDisplay from 'components/common/CoinDisplay';
import CheckIcon from '@mui/icons-material/Check';
import { NextSeo } from 'next-seo';

const Bribes = () => {
  const { state } = useContext(AppContext);

  return <>
    <NextSeo
      title="Bribes | Idleon Toolbox"
      description="Keep track of your bribes status"
    />
    <Stack gap={3} mt={3}>
      {state?.account?.bribes?.map((bribe, index) => {
        const { name, desc, price, done, value } = bribe;
        const money = getCoinsArray(price);
        return <React.Fragment key={name + ' ' + index}>
          <Grid rowGap={2} justifyContent={'center'} container>
            <Grid item
                  xs={12} sm={12} md={4} gap={1}
                  display={'flex'}
                  alignItems={'center'}
                  sx={{ justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' } }}
            >
              {done ? <CheckIcon color={'success'}/> : null}
              <Typography variant={'body1'} component={'span'}>{cleanUnderscore(name)}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography variant={'body1'}
                          component={'span'}>{index === 0 ? cleanUnderscore(desc).replace('5%', `${value}%`) : cleanUnderscore(desc)}</Typography>
            </Grid>
            <Grid item xs={3}>
              <CoinDisplay title={null} money={money}/>
            </Grid>
          </Grid>
          {state?.account?.bribes.length - 1 !== index ? <Divider/> : null}
        </React.Fragment>
      })}
    </Stack>
  </>
};

export default Bribes;
