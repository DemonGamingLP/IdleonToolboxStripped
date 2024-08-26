import { AppContext } from '@components/common/context/AppProvider';
import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { cleanUnderscore, notateNumber, numberWithCommas, prefix } from '../utility/helpers';
import HtmlTooltip from '../components/Tooltip';
import { NextSeo } from 'next-seo';
import Image from 'next/image';


const Home = () => {
  const { state } = useContext(AppContext);
  const [items, setItems] = useState();

  useEffect(() => {
    setItems(state?.account?.storage);
  }, [state])

  const renderItems = (items) => {
    if (!items || !Array.isArray(items)) return null;
    return items?.map(({ name, rawName, amount }, index) => {
      return (
        <Card variant={'outlined'} sx={{ width: 75 }} key={`${name}-${index}`}>
          <CardContent>
            <Stack alignItems="center" key={`${rawName}-${index}`} data-index={index}>
              <HtmlTooltip title={cleanUnderscore(name)}>
                <Image loading="lazy" data-index={index} width={30} height={30} style={{ objectFit: 'contain' }}
                       src={`${prefix}data/${rawName}.png`} alt={rawName}/>
              </HtmlTooltip>
              <HtmlTooltip title={numberWithCommas(amount)}>
                <Typography
                  color={amount >= 1e7
                    ? 'success.light'
                    : ''}>{notateNumber(amount, 'Big')}</Typography>
              </HtmlTooltip>
            </Stack>
          </CardContent>
        </Card>
      );
    })
  }

  return (
    <Stack>
      <NextSeo
        title="Storage | Idleon Toolbox"
        description="A list of your storage items"
      />
      <Stack>
          <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
            {renderItems(items)}
          </Stack>
      </Stack>
    </Stack>
  );
};

export default Home;
