import { getStorage } from './storage';

export const parseData = (idleonData: IdleonData) => {
  let accountData, charactersData;

  try {
    console.info('%cStart Parsing', 'color:orange');
    const processedData = serializeData(idleonData);
    const parsed = serializeData(idleonData, processedData);
    accountData = parsed?.accountData;
    charactersData = parsed?.charactersData;
    console.info('data', { account: accountData, characters: charactersData })
    console.info('%cParsed successfully', 'color: green');
    return { account: accountData, characters: charactersData };
  } catch (err) {
    console.error('Error while parsing data', err);
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'error', {
        event_category: 'error',
        event_label: 'engagement',
        value: JSON.stringify(err)
      })
    }
  }
};

const serializeData = (idleonData: IdleonData, processedData?: any) => {
  const accountData: Account = processedData?.accountData || {};
  let charactersData: Character[] = processedData?.charactersData || [];
  accountData.storage = getStorage(idleonData); // changed from inventory
  return { accountData, charactersData };
};
