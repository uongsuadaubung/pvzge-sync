import { z } from "zod";

const PlantCostumeSchema = z.object({
  plantID: z.number(),
  costume: z.number(),
}).strict();

const DateSchema = z.object({
  date: z.number(),
  hour: z.number(),
  minute: z.number(),
  month: z.number(),
  plantCostumeToday: z.array(PlantCostumeSchema),
  second: z.number(),
  year: z.number(),
}).strict();

const FeaturesSchema = z.record(z.string(), z.boolean());

const ProgressEntrySchema = z.object({ progress: z.number() }).strict();

const UpgradePropSchema = z.object({ progress: z.number(), enabled: z.boolean() }).strict();

const PlantPropSchema = z.object({
  boost: z.number(),
  costume: z.number(),
  costumes: z.array(z.number()),
  medal: z.boolean(),
  progress: z.number(),
  tutorialLevel: z.number(),
}).strict();

const TutorialSchema = z.record(z.string(), z.boolean());

const EndlessMiniGamePropsSchema = z.object({
  level: z.number(),
}).strict();

const EndlessPropsSchema = z.object({
  initialPlants: z.array(z.unknown()),
  level: z.number(),
  mower: z.array(z.boolean()),
  obtainedPlants: z.array(z.unknown()),
  plantChosen: z.boolean(),
  plantfood: z.number(),
  plantsToChoose: z.array(z.unknown()).nullable(),
}).strict();

const WorldPropEntrySchema = z.object({
  endlessMiniGameProps: EndlessMiniGamePropsSchema,
  endlessProps: EndlessPropsSchema,
  unlocked: z.boolean(),
  viewed: z.boolean(),
  wmx: z.number(),
}).strict();

const WorldPropsSchema = z.object({}).catchall(z.union([WorldPropEntrySchema, z.number()]));

const ZenGardenSlotSchema = z.object({ unlocked: z.boolean() }).strict();

const ZenGardenSchema = z.object({
  plantInCart: z.unknown().nullable(),
  plantsInBeach: z.array(z.unknown()),
  plantsInMain: z.array(z.unknown()),
  plantsInMushroom: z.array(z.unknown()),
  plantsInNight: z.array(z.unknown()),
  slotsInBeach: z.array(ZenGardenSlotSchema),
  slotsInMain: z.array(ZenGardenSlotSchema),
  slotsInMushroom: z.array(ZenGardenSlotSchema),
  slotsInNight: z.array(ZenGardenSlotSchema),
  sprout: z.number(),
}).strict();

const PlayerProfileSchema = z.object({
  beachWMX: z.number(),
  cardDecks: z.array(z.unknown()),
  coin: z.number(),
  cowboyWMX: z.number(),
  darkWMX: z.number(),
  date: DateSchema,
  difficulty: z.number(),
  egyptWMX: z.number(),
  epicWMX: z.number(),
  features: FeaturesSchema,
  forceLevel: z.string(),
  futureWMX: z.number(),
  gem: z.number(),
  iceageWMX: z.number(),
  levelProps: z.record(z.string(), ProgressEntrySchema),
  lostcityWMX: z.number(),
  memoryPlantChoose: z.array(z.string()),
  name: z.string(),
  pirateWMX: z.number(),
  plantProps: z.record(z.string(), PlantPropSchema),
  sprout: z.number(),
  time: z.number(),
  trophyProps: z.record(z.string(), ProgressEntrySchema),
  tutorial: TutorialSchema,
  upgradeProps: z.record(z.string(), UpgradePropSchema),
  version: z.string(),
  worldProgress: z.array(z.unknown()),
  worldProps: WorldPropsSchema,
  worldkey: z.number(),
  zengarden: ZenGardenSchema,
  zombieProps: z.record(z.string(), ProgressEntrySchema),
}).strict();

const KeyBindsSchema = z.record(z.string(), z.string()).refine(
  (val) => {
    const expectedKeys = [
      "Game_Pause", "Game_SpeedUp", "Game_Card1", "Game_Card2", "Game_Card3",
      "Game_Card4", "Game_Card5", "Game_Card6", "Game_Card7", "Game_Card8",
      "Game_Plantfood", "Game_Shovel", "Game_CollectAll", "Game_ConveyorForward",
      "Game_ConveyorBackward", "Game_HideUI", "Game_UIUpper", "Game_BananaLauncher",
      "Game_MissileToe", "Game_Bamboozle", "Game_HollyKnight", "Game_IceShroom",
      "AirRaid_W", "AirRaid_S", "AirRaid_A", "AirRaid_D",
      "ZenGarden_Glove", "ZenGarden_Shovel", "ZenGarden_Cart", "ZenGarden_DealWithAll",
      "ZenGarden_HideUI", "ZenGarden_Next",
      "Sandbox_PushTide", "Sandbox_PullTide", "Sandbox_PushTideBy1Square",
      "Sandbox_PullTideBy1Square", "Sandbox_ChangeJam", "Sandbox_SummonZombies",
      "Sandbox_ChangeLawn", "Sandbox_TimeFreeze", "Sandbox_SwitchMusic", "Sandbox_Settings",
      "Rhythm_PhatBeet1", "Rhythm_PhatBeet2", "Rhythm_PhatBeet3", "Rhythm_PhatBeet4", "Rhythm_PhatBeet5",
    ];
    return expectedKeys.every((k) => k in val);
  },
  { message: "KeyBinds missing required keys" },
);

const SettingsSchema = z.object({
  MusicSpeedMax: z.number(),
  MusicSpeedMin: z.number(),
  MusicVolume: z.number(),
  SFXVolume: z.number(),
  CardsAtUpper: z.boolean(),
  LnCSelectionMode: z.number(),
  AllowCheat: z.boolean(),
  ShowKeyTips: z.boolean(),
  PlantKeyTips: z.boolean(),
  ShowFPS: z.boolean(),
  cursor: z.number(),
  AnimationFrameRate: z.number(),
  Language: z.number(),
  bilibiliNumber: z.number().nullable(),
  ClassicCardBG: z.boolean(),
  CamelPlayedTime: z.number(),
  PocketUI: z.boolean(),
  AudioLoadMode: z.number(),
  PlayerIndex: z.number(),
  KeyBinds: KeyBindsSchema,
  ZombieAlert: z.boolean(),
}).strict();

const SaveDataSchema = z.object({
  PvZ2_PlayerProperties: z.array(PlayerProfileSchema),
  PvZ2_Settings: SettingsSchema,
}).strict();

// Used when fetching a specific gist — content may be absent if file is truncated
const GistFileSchema = z.object({
  content: z.string(),
  raw_url: z.string(),
});

// Used when listing gists — GitHub never returns file content in list responses
const GistListFileSchema = z.object({
  raw_url: z.string(),
});

const GistSchema = z.object({
  id: z.string(),
  description: z.string().nullable(),
  updated_at: z.string(),
  files: z.record(z.string(), GistFileSchema),
});

const GistListItemSchema = z.object({
  id: z.string(),
  description: z.string().nullable(),
  files: z.record(z.string(), GistListFileSchema),
});

const GistArraySchema = z.array(GistListItemSchema);

function validateSaveData(data: unknown) {
  return SaveDataSchema.safeParse(data);
}

function validatePlayerProperties(data: unknown) {
  return z.array(PlayerProfileSchema).safeParse(data);
}

function validateSettings(data: unknown) {
  return SettingsSchema.safeParse(data);
}

export { SaveDataSchema, DateSchema, GistSchema, GistArraySchema, validateSaveData, validatePlayerProperties, validateSettings };
export type SaveData = z.infer<typeof SaveDataSchema>;
export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type PvzDate = z.infer<typeof DateSchema>;
export type GistFile = z.infer<typeof GistFileSchema>;
export type Gist = z.infer<typeof GistSchema>;
