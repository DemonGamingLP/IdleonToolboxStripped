import React, { useContext, useMemo } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Card, CardContent, Stack, Typography } from '@mui/material';
import { cleanUnderscore, getRealDateInMs, growth, prefix } from 'utility/helpers';
import { AppContext } from 'components/common/context/AppProvider';
import styled from '@emotion/styled';
import Timer from 'components/common/Timer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { calcHappyHours } from '../../../parsers/dungeons';
import { NextSeo } from 'next-seo';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '../../../components/Tooltip';
import { CardTitleAndValue } from '../../../components/common/styles';

const insideDungeonUpgradeMaxLevel = 100;
const flurboUpgradeMaxLevel = 50;

const Dungeons = () => {
  const { state } = useContext(AppContext);
  const { dungeons } = state?.account || {};

  const nextHappyHours = useMemo(() => calcHappyHours(state?.serverVars?.HappyHours) || [], [state]);

  return (
    <>
      <NextSeo
        title="Idleon Toolbox | Dungeons"
        description="Dungeon information including happy hour times, currency, upgrades and more"
      />
      <Typography my={2} variant="h2">
        Dungeons
      </Typography>
      <Stack direction="row" flexWrap={'wrap'} gap={4}>
        <CardTitleAndValue title={'Rank'}>
          <Stack direction={'row'} gap={2}>
            <CurrencyIcon src={`${prefix}data/Dung_Rank${dungeons?.rank}.png`} alt=""/>
            <Stack>
              <Typography>Rank: {dungeons?.rank}</Typography>
              <Typography>Exp: {dungeons?.progress} / {dungeons?.rankReq}</Typography>
            </Stack>
          </Stack>
        </CardTitleAndValue>
        <CardTitleAndValue title={'Boosted runs'}>
          <Stack direction={'row'} gap={1}>
            <img src={`${prefix}etc/boosted-runs.png`} alt=""/>
            <Typography>{dungeons?.boostedRuns}</Typography>
          </Stack>
        </CardTitleAndValue>
        <CardTitleAndValue title={'Credits'}>
          <Stack direction={'row'} gap={1}>
            <CurrencyIcon src={`${prefix}data/DungCredits1.png`} alt=""/>
            {dungeons?.credits}
          </Stack>
        </CardTitleAndValue>
        <CardTitleAndValue title={'Flurbos'}>
          <Stack direction={'row'} gap={1}>
            <CurrencyIcon src={`${prefix}data/DungCredits2.png`} alt=""/>
            {dungeons?.flurbos}
          </Stack>
        </CardTitleAndValue>

      </Stack>

      <Stack my={2} direction="row" gap={4}>
        <Accordion>
          <AccordionSummary expandIcon={nextHappyHours.length > 1 ? <ExpandMoreIcon/> : null}>
            <Stack direction="row" gap={2}>
              <Typography>Next happy hour:</Typography>
              {nextHappyHours?.length > 0 ?
                <>
                  <Timer type={'countdown'} date={nextHappyHours?.[0]} lastUpdated={state?.lastUpdated}/>
                  <Tooltip title={getRealDateInMs(nextHappyHours?.[0])}>
                    <InfoIcon fontSize={'small'}/>
                  </Tooltip>
                </> : 'waiting for lava to set them'}
            </Stack>
          </AccordionSummary>
          {nextHappyHours.length > 1 ? (
            <AccordionDetails>
              <Typography mb={1}>Future happy hours</Typography>
              <Stack gap={2}>
                {nextHappyHours.map((nextHappyHour, index) => {
                  if (index === 0) return null;
                  return <Stack key={`next-happy-hour-${index}`} direction={'row'} gap={3}>
                    <Typography sx={{ width: 40 }}>#{index}</Typography>
                    <Timer key={`happy-${index}`} date={nextHappyHour} lastUpdated={state?.lastUpdated}/>
                    <Tooltip title={getRealDateInMs(nextHappyHour)}>
                      <InfoIcon fontSize={'small'}/>
                    </Tooltip>
                  </Stack>
                })}
              </Stack>
            </AccordionDetails>
          ) : null}
        </Accordion>
      </Stack>

      <Stack direction="row" flexWrap={'wrap'} gap={4}>
        <DungeonUpgrades upgrades={dungeons?.insideUpgrades}/>
        <DungeonUpgrades isFlurbo upgrades={dungeons?.upgrades}/>
      </Stack>
    </>
  );
};

const CardContainer = ({ column, sx = {}, children }) => {
  return (
    <Card sx={sx}>
      <CardContent sx={{ height: '100%', display: 'flex' }}>
        <Stack direction={column ? 'column' : 'row'} gap={1} justifyContent="center" alignItems="center">
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
};

const CurrencyIcon = styled.img`
  width: 25px;
  object-fit: contain;
`;

const DungeonUpgrades = ({ isFlurbo, upgrades = [] }) => {
  const calcBonus = (upgrade) => {
    return growth(upgrade?.func, upgrade?.level, upgrade?.x1, upgrade?.x2);
  };

  const calcCostToMax = (level) => {
    let total = 0;
    for (let i = level; i < (isFlurbo ? 50 : 100); i++) {
      total += calcUpgradeCost(i);
    }
    return total;
  };

  const calcUpgradeCost = (level) => {
    if (isFlurbo) {
      const baseMath = Math.pow(1.7 * level, 1.05);
      const moreMath = 1.027 + ((level - 30) / (level + 30)) * 0.01 * Math.floor((level + 970) / 1000);
      return Math.floor(1 + baseMath * Math.pow(moreMath, level));
    } else {
      const baseMath = Math.pow(1.5 * level, 1.04);
      const moreMath = 1.024 + ((level - 60) / (level + 60)) * 0.01 * Math.floor((level + 940) / 1000);
      return Math.floor(2 + baseMath * Math.pow(moreMath, level));
    }
  };

  return (
    <Stack>
      <Typography my={2} variant="h4">
        {isFlurbo ? 'Flurbo' : 'Dungeon'} Upgrades
      </Typography>
      <Stack gap={1}>
        {upgrades.map((upgrade, index) => {
          const { level, type, effect } = upgrade;
          const isMaxed = level >= (isFlurbo ? flurboUpgradeMaxLevel : insideDungeonUpgradeMaxLevel);
          return (
            <Card key={`${effect}-${index}`} sx={{ width: { md: 450 } }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" gap={2}>
                  <Stack>
                    <Typography>
                      +{calcBonus(upgrade)}
                      {type === '%' ? type : ''} {cleanUnderscore(effect)}
                    </Typography>
                    <Typography
                      color={isMaxed ? 'success.light' : ''}>{isMaxed ? 'MAXED' : `Lv. ${level} / ${isFlurbo
                      ? flurboUpgradeMaxLevel
                      : insideDungeonUpgradeMaxLevel}`}</Typography>
                  </Stack>
                  <Stack direction="row" gap={3}>
                    <Stack>
                      <Typography color={'info.light'}>Cost</Typography>
                      <Typography>{calcUpgradeCost(level)}</Typography>
                    </Stack>
                    <Stack>
                      <Typography color={'info.light'}>Cost to max</Typography>
                      <Typography>{calcCostToMax(level)}</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default Dungeons;
