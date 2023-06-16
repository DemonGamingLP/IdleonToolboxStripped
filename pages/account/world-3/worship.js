import React, { useContext, useMemo } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { AppContext } from 'components/common/context/AppProvider';
import ProgressBar from 'components/common/ProgressBar';
import { cleanUnderscore, prefix } from 'utility/helpers';
import Tooltip from '../../../components/Tooltip';
import Box from '@mui/material/Box';
import { NextSeo } from 'next-seo';
import { getCharacterByHighestTalent, getHighestTalentByClass } from '../../../parsers/talents';
import Timer from '../../../components/common/Timer';
import { getClosestWorshiper } from '../../../parsers/worship';

const Worship = () => {
  const { state } = useContext(AppContext);

  const totalCharge = useMemo(() => state?.characters?.reduce((res, { worship }) => res + worship?.currentCharge, 0), [state]);
  const totalChargeRate = useMemo(() => state?.characters?.reduce((res, { worship }) => res + worship?.chargeRate, 0), [state]);
  const bestChargeSyphon = useMemo(() => getHighestTalentByClass(state?.characters, 2, 'Wizard', 'CHARGE_SYPHON', 'y', true), [state])
  const bestWizard = useMemo(() => getCharacterByHighestTalent(state?.characters, 2, 'Wizard', 'CHARGE_SYPHON', 'y', true), [state])
  const closestToFull = getClosestWorshiper(state?.characters);

  return (
    <>
      <NextSeo
        title="Idleon Toolbox | Worship"
        description="Keep track of your worship charge and charge rate for all of your characters"
      />
      <Typography variant={'h2'}>Worship</Typography>
      <Stack direction={'row'} gap={3}>
        <Card sx={{ my: 3 }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>Total Charge</Typography>
            <Typography>{totalCharge}</Typography></CardContent>
        </Card>
        <Card sx={{ my: 3 }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>Total Daily Charge</Typography>
            <Typography>{Math.round(24 * totalChargeRate)}%</Typography>
          </CardContent>
        </Card>
        <Card sx={{ my: 3 }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>First to full</Typography>
            <Typography>{closestToFull?.character}</Typography>
            <Timer type={'countdown'}
                   placeholder={'You have overflowing charge'}
                   date={new Date().getTime() + closestToFull?.timeLeft}
                   lastUpdated={state?.lastUpdated}/>
          </CardContent>
        </Card>
        <Card sx={{ my: 3 }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>Best Wizard
              - {bestWizard?.name}</Typography>
            <Typography>Charge with syphon ({(bestWizard?.worship?.maxCharge + bestChargeSyphon)})</Typography>
            <ProgressBar percent={(totalCharge / (bestWizard?.worship?.maxCharge + bestChargeSyphon)) * 100}
                         bgColor={'secondary.dark'}/>
            <Timer type={'countdown'}
                   placeholder={'You have overflowing charge'}
                   date={new Date().getTime() + (((bestWizard?.worship?.maxCharge + bestChargeSyphon) - totalCharge) / totalChargeRate * 1000 * 3600)}
                   lastUpdated={state?.lastUpdated}/>
          </CardContent>
        </Card>
      </Stack>
      <Stack gap={3} direction="row" flexWrap="wrap">
        {state?.characters?.map(({ worship, tools, name, classIndex, skillsInfo }, index) => {
          const worshipProgress = (worship?.currentCharge / (worship?.maxCharge || worship?.currentCharge)) * 100;
          const skull = tools?.find(({ name }) => name.includes('Skull'));
          const timeLeft = (worship?.maxCharge - worship?.currentCharge) / worship?.chargeRate * 1000 * 3600;

          return (
            <Card key={`${name}-${index}`} sx={{ width: 300 }}>
              <CardContent>
                <Stack direction={'row'}>
                  <img src={`${prefix}data/ClassIcons${classIndex}.png`} alt=""/>
                  {skull && <Tooltip title={cleanUnderscore(skull.name)}>
                    <img style={{ height: 38 }} src={`${prefix}data/${skull.rawName}.png`} alt=""/>
                  </Tooltip>}
                </Stack>
                <Typography sx={{ typography: { xs: 'body2', sm: 'body1' } }}>{name}</Typography>
                <Typography variant={'caption'}>Worship
                  lv. {skillsInfo?.worship?.level}</Typography>
                <ProgressBar percent={worshipProgress > 100 ? 100 : worshipProgress} bgColor={'secondary.dark'}/>
                <Box my={2}>
                  <Typography>
                    Charge: {worship?.currentCharge} / {worship?.maxCharge}
                  </Typography>
                  <Typography>Charge Rate: {Math.round(worship?.chargeRate * 24)}% / day</Typography>
                  <Stack direction={'row'} gap={1}>
                    <Typography>Time to full: </Typography>
                    <Timer type={'countdown'} date={new Date().getTime() + timeLeft}
                           lastUpdated={state?.lastUpdated}/>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </>
  );
};

export default Worship;
