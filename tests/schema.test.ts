import { describe, test, expect } from "vitest";
import { validatePlayerProperties, validateSettings, SaveDataSchema } from "../src/lib/schema";

const validProfile = {
  beachWMX: 0,
  cardDecks: [],
  coin: 999,
  cowboyWMX: 0,
  darkWMX: 0,
  date: {
    date: 12,
    hour: 16,
    minute: 30,
    month: 5,
    plantCostumeToday: [
      { plantID: 1, costume: 1 },
      { plantID: 2, costume: 6 },
    ],
    second: 23,
    year: 2026,
  },
  difficulty: 3,
  egyptWMX: 0,
  epicWMX: 0,
  features: {
    feature_almanac: false,
    feature_coins: false,
    feature_plantfood: false,
    feature_powerup: false,
    feature_shovel: false,
    feature_store: false,
    feature_worldkeys: false,
    feature_worldmap: false,
    feature_zengarden: false,
  },
  forceLevel: "tutorial1",
  futureWMX: 0,
  gem: 99,
  iceageWMX: 0,
  levelProps: {},
  lostcityWMX: 0,
  memoryPlantChoose: [],
  name: "Meow",
  pirateWMX: 0,
  plantProps: {
    peashooter: { boost: 0, costume: -1, costumes: [], medal: false, progress: 1, tutorialLevel: 0 },
    potatomine: { boost: 0, costume: -1, costumes: [], medal: false, progress: 1, tutorialLevel: 0 },
    sunflower: { boost: 0, costume: -1, costumes: [], medal: false, progress: 1, tutorialLevel: 0 },
    wallnut: { boost: 0, costume: -1, costumes: [], medal: false, progress: 1, tutorialLevel: 0 },
  },
  sprout: 0,
  time: 1778578223134,
  trophyProps: {},
  tutorial: {
    almanac_intro: false,
    almanac_open: false,
    plantfood: false,
    premium_bring_out: false,
    premium_light_up: false,
    premium_unlock: false,
    store_intro: false,
    store_open: false,
    worldkey: false,
    worldmap: false,
    zengarden_intro: false,
    zengarden_open: false,
  },
  upgradeProps: {},
  version: "0.8.2",
  worldProgress: [],
  worldProps: {
    "0": {
      endlessMiniGameProps: { level: 1 },
      endlessProps: {
        initialPlants: [], level: 1,
        mower: [true, true, true, true, true],
        obtainedPlants: [], plantChosen: false, plantfood: 0, plantsToChoose: null,
      },
      unlocked: false, viewed: false, wmx: 0,
    },
    currentWM: 0,
    worldChooserPos: 0,
  },
  worldkey: 0,
  zengarden: {
    plantInCart: null,
    plantsInBeach: [], plantsInMain: [], plantsInMushroom: [], plantsInNight: [],
    slotsInBeach: [], slotsInMain: [], slotsInMushroom: [], slotsInNight: [],
    sprout: 0,
  },
  zombieProps: {},
};

const validSettings = {
  MusicSpeedMax: 1,
  MusicSpeedMin: 1,
  MusicVolume: 1,
  SFXVolume: 1,
  CardsAtUpper: false,
  LnCSelectionMode: 0,
  AllowCheat: true,
  ShowKeyTips: true,
  PlantKeyTips: true,
  ShowFPS: false,
  cursor: 0,
  AnimationFrameRate: 0,
  Language: 0,
  bilibiliNumber: null,
  ClassicCardBG: false,
  CamelPlayedTime: 10800,
  PocketUI: false,
  AudioLoadMode: 1,
  PlayerIndex: 0,
  KeyBinds: {
    Game_Pause: "SPACE", Game_SpeedUp: "KEY_V",
    Game_Card1: "DIGIT_1", Game_Card2: "DIGIT_2", Game_Card3: "DIGIT_3", Game_Card4: "DIGIT_4",
    Game_Card5: "KEY_Q", Game_Card6: "KEY_W", Game_Card7: "KEY_E", Game_Card8: "KEY_R",
    Game_Plantfood: "KEY_F", Game_Shovel: "KEY_D", Game_CollectAll: "KEY_A",
    Game_ConveyorForward: "KEY_X", Game_ConveyorBackward: "KEY_Z", Game_HideUI: "BACK_QUOTE", Game_UIUpper: "F3",
    Game_BananaLauncher: "KEY_B", Game_MissileToe: "KEY_B", Game_Bamboozle: "KEY_N", Game_HollyKnight: "KEY_H", Game_IceShroom: "KEY_I",
    AirRaid_W: "KEY_W", AirRaid_S: "KEY_S", AirRaid_A: "KEY_A", AirRaid_D: "KEY_D",
    ZenGarden_Glove: "KEY_M", ZenGarden_Shovel: "KEY_D", ZenGarden_Cart: "KEY_C",
    ZenGarden_DealWithAll: "KEY_A", ZenGarden_HideUI: "BACK_QUOTE", ZenGarden_Next: "TAB",
    Sandbox_PushTide: "BACKSPACE", Sandbox_PullTide: "ENTER",
    Sandbox_PushTideBy1Square: "ARROW_LEFT", Sandbox_PullTideBy1Square: "ARROW_RIGHT",
    Sandbox_ChangeJam: "TAB", Sandbox_SummonZombies: "F1", Sandbox_ChangeLawn: "F2",
    Sandbox_TimeFreeze: "F5", Sandbox_SwitchMusic: "F7", Sandbox_Settings: "F6",
    Rhythm_PhatBeet1: "DIGIT_2", Rhythm_PhatBeet2: "KEY_W", Rhythm_PhatBeet3: "KEY_S",
    Rhythm_PhatBeet4: "KEY_X", Rhythm_PhatBeet5: "ALT_LEFT",
  },
  ZombieAlert: true,
};

describe("validatePlayerProperties", () => {
  test("accepts valid player properties", () => {
    const result = validatePlayerProperties([validProfile]);
    expect(result.success).toBe(true);
  });

  test("rejects missing required field", () => {
    const { name, ...incomplete } = validProfile;
    const result = validatePlayerProperties([incomplete]);
    expect(result.success).toBe(false);
  });

  test("rejects extra field with .strict()", () => {
    const result = validatePlayerProperties([{ ...validProfile, extraField: "should not be here" }]);
    expect(result.success).toBe(false);
  });

  test("rejects wrong type for field", () => {
    const result = validatePlayerProperties([{ ...validProfile, coin: "not-a-number" }]);
    expect(result.success).toBe(false);
  });

  test("rejects empty array", () => {
    const result = validatePlayerProperties([]);
    expect(result.success).toBe(true);
  });

  test("rejects null", () => {
    const result = validatePlayerProperties(null);
    expect(result.success).toBe(false);
  });
});

describe("validateSettings", () => {
  test("accepts valid settings", () => {
    const result = validateSettings(validSettings);
    expect(result.success).toBe(true);
  });

  test("rejects missing KeyBinds", () => {
    const { KeyBinds, ...incomplete } = validSettings;
    const result = validateSettings(incomplete);
    expect(result.success).toBe(false);
  });

  test("rejects extra field with .strict()", () => {
    const result = validateSettings({ ...validSettings, unknownField: true });
    expect(result.success).toBe(false);
  });

  test("rejects missing key in KeyBinds", () => {
    const { Game_Pause: _, ...partialKeyBinds } = validSettings.KeyBinds;
    const result = validateSettings({ ...validSettings, KeyBinds: partialKeyBinds });
    expect(result.success).toBe(false);
  });

  test("rejects null", () => {
    const result = validateSettings(null);
    expect(result.success).toBe(false);
  });
});

describe("SaveDataSchema (validateSaveData)", () => {
  test("accepts valid save data", () => {
    const data = {
      PvZ2_PlayerProperties: [validProfile],
      PvZ2_Settings: validSettings,
    };
    const result = SaveDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test("rejects missing PvZ2_Settings", () => {
    const data = { PvZ2_PlayerProperties: [validProfile] };
    const result = SaveDataSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test("rejects extra top-level field with .strict()", () => {
    const data = {
      PvZ2_PlayerProperties: [validProfile],
      PvZ2_Settings: validSettings,
      unknownExtra: "bad",
    };
    const result = SaveDataSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  test("rejects null", () => {
    const result = SaveDataSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
