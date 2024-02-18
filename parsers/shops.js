import { tryToParse } from '../utility/helpers';
import { shops } from '../data/website-data';

export const getShops = (idleonData) => {
  const shopsRaw = idleonData?.ShopStock || tryToParse(idleonData?.ShopStock);
  return parseShops(shopsRaw);
}

export const parseShops = (shopsRaw) => {
  return shopsRaw.reduce((res, shopObject, shopIndex) => {
    const mapped = Object.values(shopObject)?.reduce((res, item, itemIndex) => {
      const isIncluded = shopMapping?.[shopIndex]?.[itemIndex];
      const amount = parseInt(item) || 0;
      return amount > 0 && isIncluded ? [...res,
        {
          amount: item, ...shops[shopIndex]?.items?.[itemIndex],
          shopName: shops[shopIndex]?.name
        }] : res;
    }, [])
    return [...res, mapped]
  }, []);
}

export const getRawShopItems = () => {
  return Object.entries(shops)?.reduce((res, [key, { items }]) => {
    const filtered = items?.filter((_, index) => shopMapping?.[key]?.[index])?.map(({ rawName }) => rawName);
    return [...res, ...filtered]
  }, []).toSimpleObject();
}

export const shopMapping = {
  0: [3, 8, 13,14, 17, 23].toSimpleObject(), // 'Blunder_Hills'
  1: [2, 8, 9, 13].toSimpleObject(), // 'Encroaching_Forest_Villas'
  2: [0, 1, 2, 3, 4, 8, 9, 10, 18].toSimpleObject(), // 'YumYum_Grotto'
  3: [12].toSimpleObject(), // 'Faraway_Piers'
  4: [0, 1, 2, 8, 9, 10, 19, 22].toSimpleObject(), // 'Frostbite_Towndra'
  5: [2, 3, 4, 8, 9, 10, 11].toSimpleObject(), // 'Hyperion_Nebula'
  6: [0, 1, 2, 3, 4, 5].toSimpleObject(), // 'Smolderin\'_Plateau',
  7: [0,  2, 3, 4, 5,6,7].toSimpleObject() // 'Spirited_Valley'
};

export const shopNameMapping = {
  0: 'Blunder_Hills',
  1: 'Encroaching_Forest_Villas',
  2: 'YumYum_Grotto',
  3: 'Faraway_Piers',
  4: 'Frostbite_Towndra',
  5: 'Hyperion_Nebula',
  6: 'Smolderin\'_Plateau',
  7: 'Spirited_Valley'
}