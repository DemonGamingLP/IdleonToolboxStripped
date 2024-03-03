import { Card, CardContent, Stack, Typography } from '@mui/material';
import { cleanUnderscore, notateNumber } from '@utility/helpers';

const WinnerBonuses = ({ winnerBonuses }) => {
  return <>
    <Stack direction={'row'} flexWrap={'wrap'} gap={2}>
      {winnerBonuses?.map(({ rawName, name, bonus, x3, unlocked, value }, index) => {
        bonus = bonus?.includes('{')
          ? bonus.replace('{', notateNumber(value))
          : bonus.replace('<', notateNumber(value, 'MultiplierInfo'));
        return <Card sx={{
          width: 250,
          opacity: value ? 1 : .5
        }} key={'winner-' + index}>
          <CardContent>
            <Stack direction={'row'} gap={1}>
              <Stack>
                <Typography>{cleanUnderscore(name)}</Typography>
                <Typography>{cleanUnderscore(bonus)}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      })}
    </Stack>
  </>
};

export default WinnerBonuses;
