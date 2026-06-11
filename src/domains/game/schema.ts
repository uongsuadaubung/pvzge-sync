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

const UpgradePropSchema = z.object({
  progress: z.number(),
  enabled: z.boolean(),
}).strict();

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
  initialPlants: z.array(z.number()),
  level: z.number(),
  mower: z.array(z.boolean()),
  obtainedPlants: z.array(z.number()),
  plantChosen: z.boolean(),
  plantfood: z.number(),
  plantsToChoose: z.array(z.number()).nullable(),
}).strict();

const WorldPropEntrySchema = z.object({
  endlessMiniGameProps: EndlessMiniGamePropsSchema,
  endlessProps: EndlessPropsSchema,
  unlocked: z.boolean(),
  viewed: z.boolean(),
  wmx: z.number(),
}).strict();

const WorldPropsSchema = z.object({
  currentWM: z.number().optional(),
  worldChooserPos: z.number().optional(),
}).catchall(WorldPropEntrySchema);

const ZenGardenSlotSchema = z.object({ unlocked: z.boolean() }).strict();

const ZenGardenPlantSchema = z.object({
  ID: z.number(),
  grownTime: z.number(),
  inZen: z.number(),
  oldTime: z.number(),
  pos: z.number(),
  requirement: z.number(),
  stuck: z.boolean(),
  waterCD: z.number(),
  waterLeftTime: z.number(),
}).strict();

const ZenGardenSchema = z.object({
  plantInCart: ZenGardenPlantSchema.nullable(),
  plantsInBeach: z.array(ZenGardenPlantSchema),
  plantsInMain: z.array(ZenGardenPlantSchema),
  plantsInMushroom: z.array(ZenGardenPlantSchema),
  plantsInNight: z.array(ZenGardenPlantSchema),
  slotsInBeach: z.array(ZenGardenSlotSchema),
  slotsInMain: z.array(ZenGardenSlotSchema),
  slotsInMushroom: z.array(ZenGardenSlotSchema),
  slotsInNight: z.array(ZenGardenSlotSchema),
  sprout: z.number(),
}).strict();

const ArcadePlantDecodingSchema = z.object({
  played_today: z.boolean(),
  gem_today: z.number(),
  max_base_count: z.number(),
  max_code_count: z.number(),
}).strict();

const PlayerProfileSchema = z.object({
  arcade_plant_decoding: ArcadePlantDecodingSchema.optional(), //0.9.0
  yeti_spawned_today: z.boolean().optional(), //0.9.0
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
  player_trophies: z.record(z.string(), ProgressEntrySchema).optional(), //0.9.3 chuyển từ trophyProps
  player_upgrades: z.record(z.string(), UpgradePropSchema).optional(), //0.9.3 chuyển từ upgradeProps
  sprout: z.number(),
  time: z.number(),
  trophyProps: z.record(z.string(), ProgressEntrySchema).optional(),
  tutorial: TutorialSchema,
  upgradeProps: z.record(z.string(), UpgradePropSchema).optional(),
  version: z.string(),
  worldProgress: z.array(z.unknown()),
  worldProps: WorldPropsSchema,
  worldkey: z.number(),
  zengarden: ZenGardenSchema,
  zombieProps: z.record(z.string(), ProgressEntrySchema),
}).strict();

const KeyBindsSchema = z.object({
  Game_Pause: z.string(),
  Game_SpeedUp: z.string(),
  Game_Card1: z.string(),
  Game_Card2: z.string(),
  Game_Card3: z.string(),
  Game_Card4: z.string(),
  Game_Card5: z.string(),
  Game_Card6: z.string(),
  Game_Card7: z.string(),
  Game_Card8: z.string(),
  Game_Plantfood: z.string(),
  Game_Shovel: z.string(),
  Game_CollectAll: z.string(),
  Game_ConveyorForward: z.string(),
  Game_ConveyorBackward: z.string(),
  Game_HideUI: z.string(),
  Game_UIUpper: z.string(),
  Game_BananaLauncher: z.string(),
  Game_MissileToe: z.string(),
  Game_Bamboozle: z.string(),
  Game_HollyKnight: z.string(),
  Game_IceShroom: z.string(),
  AirRaid_W: z.string(),
  AirRaid_S: z.string(),
  AirRaid_A: z.string(),
  AirRaid_D: z.string(),
  ZenGarden_Glove: z.string(),
  ZenGarden_Shovel: z.string(),
  ZenGarden_Cart: z.string(),
  ZenGarden_DealWithAll: z.string(),
  ZenGarden_HideUI: z.string(),
  ZenGarden_Next: z.string(),
  Sandbox_PushTide: z.string(),
  Sandbox_PullTide: z.string(),
  Sandbox_PushTideBy1Square: z.string(),
  Sandbox_PullTideBy1Square: z.string(),
  Sandbox_ChangeJam: z.string(),
  Sandbox_SummonZombies: z.string(),
  Sandbox_ChangeLawn: z.string(),
  Sandbox_TimeFreeze: z.string(),
  Sandbox_SwitchMusic: z.string(),
  Sandbox_Settings: z.string(),
  Rhythm_PhatBeet1: z.string(),
  Rhythm_PhatBeet2: z.string(),
  Rhythm_PhatBeet3: z.string(),
  Rhythm_PhatBeet4: z.string(),
  Rhythm_PhatBeet5: z.string(),
}).strict();

const SettingsSchema = z.object({
  MusicSpeedMax: z.number(),
  MusicSpeedMin: z.number(),
  MusicVolume: z.number(),
  SFXVolume: z.number(),
  CardsAtUpper: z.boolean().optional(), // tương thích ngược với save bản cũ
  CardsLayer: z.number().optional(), // tương thích với save bản mới 0.9.0
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

export const SaveDataSchema = z.object({
  PvZ2_PlayerProperties: z.array(PlayerProfileSchema),
  PvZ2_Settings: SettingsSchema,
}).strict();

export const DateSchema_export = DateSchema;

export function validateSaveData(data: unknown) {
  return SaveDataSchema.safeParse(data);
}

export function validatePlayerProperties(data: unknown) {
  return z.array(PlayerProfileSchema).safeParse(data);
}

export function validateSettings(data: unknown) {
  return SettingsSchema.safeParse(data);
}

export { DateSchema };
export type SaveData = z.infer<typeof SaveDataSchema>;
export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type PvzDate = z.infer<typeof DateSchema>;
