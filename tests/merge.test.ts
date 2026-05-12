import { describe, test, expect } from 'vitest';
import { mergeValidPart } from '../src/merge';

function makeValidProfile(overrides = {}) {
  return {
    beachWMX: 0, cardDecks: [], coin: 999, cowboyWMX: 0, darkWMX: 0,
    date: {
      date: 12, hour: 16, minute: 30, month: 5,
      plantCostumeToday: [{ plantID: 1, costume: 1 }],
      second: 23, year: 2026
    },
    difficulty: 3, egyptWMX: 0, epicWMX: 0,
    features: {
      feature_almanac: false, feature_coins: false, feature_plantfood: false,
      feature_powerup: false, feature_shovel: false, feature_store: false,
      feature_worldkeys: false, feature_worldmap: false, feature_zengarden: false
    },
    forceLevel: 'tutorial1', futureWMX: 0, gem: 99, iceageWMX: 0,
    levelProps: {}, lostcityWMX: 0, memoryPlantChoose: [], name: 'Player',
    pirateWMX: 0,
    plantProps: {
      peashooter: { boost: 0, costume: -1, costumes: [], medal: false, progress: 1, tutorialLevel: 0 }
    },
    sprout: 0, time: 1778578223134, trophyProps: {},
    tutorial: {
      almanac_intro: false, almanac_open: false, plantfood: false,
      premium_bring_out: false, premium_light_up: false, premium_unlock: false,
      store_intro: false, store_open: false, worldkey: false, worldmap: false,
      zengarden_intro: false, zengarden_open: false
    },
    upgradeProps: {}, version: '0.8.2', worldProgress: [],
    worldProps: {
      '0': {
        endlessMiniGameProps: { level: 1 },
        endlessProps: {
          initialPlants: [], level: 1, mower: [true, true, true, true, true],
          obtainedPlants: [], plantChosen: false, plantfood: 0, plantsToChoose: null
        },
        unlocked: false, viewed: false, wmx: 0
      },
      currentWM: 0, worldChooserPos: 0
    },
    worldkey: 0,
    zengarden: {
      plantInCart: null, plantsInBeach: [], plantsInMain: [], plantsInMushroom: [],
      plantsInNight: [], slotsInBeach: [], slotsInMain: [], slotsInMushroom: [],
      slotsInNight: [], sprout: 0
    },
    zombieProps: {},
    ...overrides
  };
}

function makeValidSettings(overrides = {}) {
  return {
    MusicSpeedMax: 1, MusicSpeedMin: 1, MusicVolume: 1, SFXVolume: 1,
    CardsAtUpper: false, LnCSelectionMode: 0, AllowCheat: true,
    ShowKeyTips: true, PlantKeyTips: true, ShowFPS: false, cursor: 0,
    AnimationFrameRate: 0, Language: 0, bilibiliNumber: null,
    ClassicCardBG: false, CamelPlayedTime: 10800, PocketUI: false,
    AudioLoadMode: 1, PlayerIndex: 0,
    KeyBinds: {
      Game_Pause: 'SPACE', Game_SpeedUp: 'KEY_V',
      Game_Card1: '1', Game_Card2: '2', Game_Card3: '3', Game_Card4: '4',
      Game_Card5: 'Q', Game_Card6: 'W', Game_Card7: 'E', Game_Card8: 'R',
      Game_Plantfood: 'F', Game_Shovel: 'D', Game_CollectAll: 'A',
      Game_ConveyorForward: 'X', Game_ConveyorBackward: 'Z', Game_HideUI: '`',
      Game_UIUpper: 'F3', Game_BananaLauncher: 'B', Game_MissileToe: 'B',
      Game_Bamboozle: 'N', Game_HollyKnight: 'H', Game_IceShroom: 'I',
      AirRaid_W: 'W', AirRaid_S: 'S', AirRaid_A: 'A', AirRaid_D: 'D',
      ZenGarden_Glove: 'M', ZenGarden_Shovel: 'D', ZenGarden_Cart: 'C',
      ZenGarden_DealWithAll: 'A', ZenGarden_HideUI: '`', ZenGarden_Next: 'TAB',
      Sandbox_PushTide: 'BACKSPACE', Sandbox_PullTide: 'ENTER',
      Sandbox_PushTideBy1Square: 'LEFT', Sandbox_PullTideBy1Square: 'RIGHT',
      Sandbox_ChangeJam: 'TAB', Sandbox_SummonZombies: 'F1',
      Sandbox_ChangeLawn: 'F2', Sandbox_TimeFreeze: 'F5',
      Sandbox_SwitchMusic: 'F7', Sandbox_Settings: 'F6',
      Rhythm_PhatBeet1: '2', Rhythm_PhatBeet2: 'W', Rhythm_PhatBeet3: 'S',
      Rhythm_PhatBeet4: 'X', Rhythm_PhatBeet5: 'LALT'
    },
    ZombieAlert: true,
    ...overrides
  };
}

const localData = {
  PvZ2_PlayerProperties: [makeValidProfile({ name: 'LocalPlayer', coin: 100 })],
  PvZ2_Settings: makeValidSettings({ MusicVolume: 0.5 })
};

const validRemoteProps = [makeValidProfile({ name: 'RemotePlayer', coin: 999 })];
const validRemoteSettings = makeValidSettings({ MusicVolume: 1 });

describe('mergeValidPart', () => {
  test('keeps remote data when both parts are valid', () => {
    const remote = {
      PvZ2_PlayerProperties: validRemoteProps,
      PvZ2_Settings: validRemoteSettings
    };
    const result = mergeValidPart(remote, localData);
    expect(result.PvZ2_PlayerProperties).toBe(remote.PvZ2_PlayerProperties);
    expect(result.PvZ2_Settings).toBe(remote.PvZ2_Settings);
  });

  test('replaces invalid remote PlayerProperties with local', () => {
    const remote = {
      PvZ2_PlayerProperties: [makeValidProfile({ name: 'BAD', coin: 'not-a-number' })],
      PvZ2_Settings: validRemoteSettings
    };
    const result = mergeValidPart(remote, localData);
    expect(result.PvZ2_PlayerProperties).toBe(localData.PvZ2_PlayerProperties);
    expect(result.PvZ2_Settings).toBe(remote.PvZ2_Settings);
  });

  test('replaces invalid remote Settings with local', () => {
    const remote = {
      PvZ2_PlayerProperties: validRemoteProps,
      PvZ2_Settings: makeValidSettings({ bilibiliNumber: 'should-be-number' })
    };
    const result = mergeValidPart(remote, localData);
    expect(result.PvZ2_PlayerProperties).toBe(remote.PvZ2_PlayerProperties);
    expect(result.PvZ2_Settings).toBe(localData.PvZ2_Settings);
  });

  test('replaces both invalid parts with local', () => {
    const remote = {
      PvZ2_PlayerProperties: [{ coin: 'bad' }],
      PvZ2_Settings: { MusicVolume: 'bad' }
    };
    const result = mergeValidPart(remote, localData);
    expect(result.PvZ2_PlayerProperties).toBe(localData.PvZ2_PlayerProperties);
    expect(result.PvZ2_Settings).toBe(localData.PvZ2_Settings);
  });

  test('keeps remote PlayerProperties valid even if Settings is invalid', () => {
    const validButDifferent = [makeValidProfile({ name: 'DifferentPlayer', coin: 500 })];
    const remote = {
      PvZ2_PlayerProperties: validButDifferent,
      PvZ2_Settings: makeValidSettings({ AllowCheat: 'not-boolean' })
    };
    const result = mergeValidPart(remote, localData);
    expect(result.PvZ2_PlayerProperties).toBe(remote.PvZ2_PlayerProperties);
    expect(result.PvZ2_Settings).toBe(localData.PvZ2_Settings);
  });

  test('does not spread extra top-level fields from local', () => {
    const remote = {
      PvZ2_PlayerProperties: validRemoteProps,
      PvZ2_Settings: validRemoteSettings,
      extraRemoteField: 'should-stay'
    };
    const localWithExtra = { ...localData, extraLocalField: 'should-not-appear' };
    const result = mergeValidPart(remote, localWithExtra);
    expect(result.extraRemoteField).toBe('should-stay');
    expect((result as Record<string, unknown>).extraLocalField).toBeUndefined();
  });
});
