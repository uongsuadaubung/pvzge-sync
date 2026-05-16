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

const KeyBindsSchema = z.record(z.string(), z.string());

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
});

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
