import {
  getCharacters,
  getPlayerConstructionExpPerHour,
  getPlayerConstructionSpeed,
  initializeCharacter
} from './character';
import { getCards } from './cards';
import { getObols } from './obols';
import { applyStampsMulti, getStamps } from './stamps';
import { applyStatuesMulti, getStatues } from './statues';
import { getShrineExpBonus, getShrines } from './shrines';
import { getHighscores } from './highScores';
import { getGemShop } from './gemShop';
import { getShops } from './shops';
import {
  applyArtifactBonusOnSigil,
  applyVialsMulti,
  getAlchemy,
  getEquippedBubbles,
  getLiquidCauldrons
} from './alchemy';
import { getStorage } from './storage';
import { getBribes } from './bribes';
import { getConstellations, getStarSigns } from './starSigns';
import { getPrayers } from './prayers';
import { getCoinsArray, tryToParse } from '../utility/helpers';
import { getForge } from './forge';
import { getConstruction, getTowers } from './construction';
import { getAchievements } from './achievements';
import { getRefinery } from './refinery';
import { getTasks } from './tasks';
import { getArcade } from './arcade';
import {
  calculateLeaderboard,
  calculateTotalSkillsLevel,
  enhanceColoTickets,
  enhanceKeysObject,
  getBundles,
  getCompanions,
  getCurrencies,
  getItemCapacity,
  getLibraryBookTimes,
  getLooty,
  getTypeGen,
} from './misc';
import { getSaltLick } from './saltLick';
import { getDungeons } from './dungeons';
import { applyMealsMulti, getCooking, getKitchens } from './cooking';
import { applyBonusDesc, getJewelBonus, getLab, getLabBonus, isLabEnabledBySorcererRaw } from './lab';
import { classes } from '../data/website-data';
import { getGuild } from './guild';
import { getPrinter } from './printer';
import { getTraps } from './traps';
import { getQuests, isWorldFinished } from './quests';
import { getDeathNote } from './deathNote';
import { addBreedingChance, getBreeding } from './breeding';
import { getDivinity } from './divinity';
import { getArtifacts, getSailing } from './sailing';
import { getGaming } from './gaming';
import { getAtoms } from './atomCollider';
import { getRift, isRiftBonusUnlocked } from './world-4/rift';
import { getPostOfficeShipments } from './postoffice';
import { getIslands } from './world-2/islands';
import { getEquinox } from './equinox';
import { getTotems } from './worship';

export const parseData = (idleonData, charNames, companion, guildData, serverVars) => {
  let accountData, charactersData;

  try {
    console.info('%cStart Parsing', 'color:orange');
    if (idleonData?.PlayerDATABASE) {
      charNames = Object.keys(idleonData?.PlayerDATABASE);
      charactersData = Object.values(idleonData?.PlayerDATABASE).reduce(
        (charRes, charData, index) => ({
          ...charRes,
          ...Object.entries(charData)?.reduce((res, [key, value]) => ({ ...res, [`${key}_${index}`]: value }), {})
        }),
        {}
      );
      idleonData = { ...idleonData, ...charactersData };
    }
    const parsed = serializeData(idleonData, charNames, companion, guildData, serverVars);
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
        value: JSON.stringify(err),
      })
    }
  }
};

const serializeData = (idleonData, charsNames, companion, guildData, serverVars) => {
  let accountData = {},
    charactersData;
  const serializedCharactersData = getCharacters(idleonData, charsNames);
  accountData.companions = getCompanions(companion);
  accountData.bundles = getBundles(idleonData);
  accountData.serverVars = serverVars;
  accountData.accountOptions = idleonData?.OptionsListAccount || tryToParse(idleonData?.OptLacc); //
  accountData.bribes = getBribes(idleonData);
  accountData.timeAway = tryToParse(idleonData?.TimeAway) || idleonData?.TimeAway;
  accountData.alchemy = getAlchemy(idleonData, accountData, serializedCharactersData);
  accountData.equippedBubbles = getEquippedBubbles(idleonData, accountData.alchemy?.bubbles, serializedCharactersData);
  accountData.storage = getStorage(idleonData); // changed from inventory
  accountData.saltLick = getSaltLick(idleonData, accountData.storage);
  accountData.dungeons = getDungeons(idleonData, accountData.accountOptions);
  accountData.prayers = getPrayers(idleonData, accountData.storage);
  accountData.cards = getCards(idleonData, accountData);
  accountData.gemShopPurchases = getGemShop(idleonData);
  accountData.guild = getGuild(idleonData, guildData);
  accountData.currencies = getCurrencies(idleonData, accountData);
  accountData.stamps = getStamps(idleonData);
  accountData.obols = getObols(idleonData);
  accountData.looty = getLooty(idleonData);
  const { tasks, tasksDescriptions, meritsDescriptions } = getTasks(idleonData)
  accountData.tasks = tasks; //
  accountData.tasksDescriptions = tasksDescriptions; //
  accountData.meritsDescriptions = meritsDescriptions; //
  accountData.breeding = getBreeding(idleonData, accountData);
  accountData.cooking = getCooking(idleonData, accountData, serializedCharactersData);
  accountData.divinity = getDivinity(idleonData, serializedCharactersData);
  accountData.postOfficeShipments = getPostOfficeShipments(idleonData);

  // lab dependencies: cooking, cards, gemShopPurchases, tasks, accountOptions, breeding, deathNote, storage
  accountData.lab = getLab(idleonData, serializedCharactersData, accountData);
  accountData.towers = getTowers(idleonData, accountData);
  accountData.shrines = getShrines(idleonData, accountData);
  accountData.statues = getStatues(idleonData, serializedCharactersData);
  accountData.achievements = getAchievements(idleonData);

  accountData.lab.connectedPlayers = accountData.lab.connectedPlayers?.map((char) => ({
    ...char,
    isDivinityConnected: accountData?.divinity?.linkedDeities?.[char?.playerId] === 4 || isLabEnabledBySorcererRaw(char, 4)
  }))

  accountData.rift = getRift(idleonData);
  accountData.arcade = getArcade(idleonData, accountData, serverVars);

  // Update values for meals, stamps, vials
  const certifiedStampBookMulti = getLabBonus(accountData.lab.labBonuses, 7); // stamp multi
  accountData.stamps = applyStampsMulti(accountData.stamps, certifiedStampBookMulti);
  const myFirstChemistrySet = getLabBonus(accountData.lab.labBonuses, 10); // vial multi
  accountData.alchemy.vials = applyVialsMulti(accountData.alchemy.vials, myFirstChemistrySet);
  if (isRiftBonusUnlocked(accountData.rift, 'Vial_Mastery')) {
    const maxedVials = accountData?.alchemy?.vials?.filter(({ level }) => level === 13);
    const riftVialMulti = 1 + (2 * maxedVials?.length) / 100;
    accountData.alchemy.vials = applyVialsMulti(accountData.alchemy.vials, myFirstChemistrySet * riftVialMulti)
  }
  accountData.equinox = getEquinox(idleonData, accountData);
  const spelunkerObolMulti = getLabBonus(accountData.lab.labBonuses, 8); // gem multi
  const blackDiamondRhinestone = getJewelBonus(accountData.lab.jewels, 16, spelunkerObolMulti);

  accountData.cooking.meals = applyMealsMulti(accountData.cooking.meals, blackDiamondRhinestone);

  const charactersLevels = serializedCharactersData?.map((char) => {
    const personalValuesMap = char?.[`PersonalValuesMap`];
    return { level: personalValuesMap?.StatList?.[4] ?? 0, class: classes?.[char?.[`CharacterClass`]] ?? '' };
  });
  accountData.starSigns = getStarSigns(idleonData);
  accountData.constellations = getConstellations(idleonData);
  accountData.charactersLevels = charactersLevels;

  charactersData = serializedCharactersData.map((char) => {
    return initializeCharacter(char, charactersLevels, { ...accountData }, idleonData);
  });

  accountData.lab = getLab(idleonData, serializedCharactersData, accountData, charactersData)
  accountData.finishedWorlds = [1, 2, 3, 4, 5]?.reduce((res, world) => {
    return {
      ...res,
      [`World${world}`]: isWorldFinished(charactersData, world)
    }
  }, {});

  accountData.statues = applyStatuesMulti(accountData.statues, charactersData);
  const skills = charactersData?.map(({ name, skillsInfo }) => ({ name, skillsInfo }));
  accountData.totalSkillsLevels = calculateTotalSkillsLevel(skills);
  accountData.construction = getConstruction(idleonData, accountData);
  accountData.atoms = getAtoms(idleonData, accountData);
  const artifacts = getArtifacts(idleonData, charactersData, accountData)
  accountData.alchemy.p2w.sigils = applyArtifactBonusOnSigil(accountData.alchemy.p2w.sigils, artifacts);
  accountData.alchemy.liquidCauldrons = getLiquidCauldrons(accountData);
  accountData.gaming = getGaming(idleonData, charactersData, accountData, serverVars);
  // reapply atoms
  accountData.atoms = getAtoms(idleonData, accountData);
  accountData.sailing = getSailing(idleonData, artifacts, charactersData, accountData, serverVars, charactersLevels);

  const leaderboard = calculateLeaderboard(skills);
  charactersData = charactersData.map((character) => ({ ...character, skillsInfo: leaderboard[character?.name] }));

  accountData.highscores = getHighscores(idleonData);
  accountData.shopStock = getShops(idleonData);

  accountData.forge = getForge(idleonData, accountData);
  accountData.refinery = getRefinery(idleonData, accountData.storage, accountData.tasks);
  accountData.printer = getPrinter(idleonData, charactersData, accountData);
  accountData.traps = getTraps(serializedCharactersData, charactersData, accountData);
  accountData.quests = getQuests(charactersData);
  accountData.islands = getIslands(accountData);
  accountData.deathNote = getDeathNote(charactersData, accountData);

  // reduce anvil
  accountData.anvil = charactersData.map(({ anvil }) => anvil);

  const bankMoney = parseFloat(idleonData?.MoneyBANK);
  const playersMoney = charactersData?.reduce((res, char) => {
    return res + parseFloat(char?.money)
  }, 0);
  const money = bankMoney + playersMoney;
  accountData.currencies.rawMoney = money;
  accountData.currencies.money = getCoinsArray(money);
  accountData.currencies.gems = idleonData?.GemsOwned;
  accountData.currencies.KeysAll = enhanceKeysObject(accountData?.currencies?.KeysAll, charactersData, accountData);
  accountData.currencies.ColosseumTickets = enhanceColoTickets(accountData?.currencies?.ColosseumTickets, charactersData, accountData);
  // kitchens
  accountData.cooking.kitchens = getKitchens(idleonData, charactersData, accountData);
  accountData.libraryTimes = getLibraryBookTimes(idleonData, charactersData, accountData);
  accountData.breeding = addBreedingChance(idleonData, accountData);

  charactersData = charactersData?.map((character) => {
    const { carryCapBags } = character;
    character.carryCapBags = carryCapBags?.map((carryBag) => {
      const typeGen = getTypeGen(carryBag?.Class);
      const capacity = getItemCapacity(typeGen, character, accountData);
      return { ...carryBag, capacityPerSlot: capacity, maxCapacity: capacity * character?.inventorySlots }
    })
    character.constructionSpeed = getPlayerConstructionSpeed(character, accountData);
    character.constructionExpPerHour = getPlayerConstructionExpPerHour(character, accountData);
    return character;
  })
  accountData.shrinesExpBonus = getShrineExpBonus(charactersData, accountData);
  // update lab bonuses
  const greenMushroomKilled = Math.floor(accountData?.deathNote?.[0]?.mobs?.[0].kills / 1e6);
  const fungyFingerBonusFromJewel = accountData.lab.labBonuses?.[13]?.active ? greenMushroomKilled * 1.5 : 0;
  const fungyFingerBonus = greenMushroomKilled * accountData.lab.labBonuses?.[9]?.bonusOn;
  accountData.lab.labBonuses = applyBonusDesc(accountData.lab.labBonuses, fungyFingerBonus + fungyFingerBonusFromJewel, 9);
  accountData.totems = getTotems(idleonData);
  return { accountData, charactersData };
};
