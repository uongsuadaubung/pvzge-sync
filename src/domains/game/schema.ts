import { z } from "zod";

const ProgressEntrySchema = z.looseObject({
  progress: z.number().optional(),
});

const UpgradePropSchema = z.looseObject({
  progress: z.number().optional(),
  enabled: z.boolean().optional(),
});

const PlantPropSchema = z.looseObject({
  boost: z.number().optional(),
  costume: z.number().optional(),
  medal: z.boolean().optional(),
  progress: z.number().optional(),
  tutorialLevel: z.number().optional(),
});

const ZenGardenPlantSchema = z.looseObject({
  stuck: z.boolean().optional(),
  waterCD: z.number().optional(),
  oldTime: z.number().optional(),
});

const ZenGardenSchema = z.looseObject({
  plantInCart: ZenGardenPlantSchema.nullable().optional(),
  plantsInBeach: z.array(ZenGardenPlantSchema).optional(),
  plantsInMain: z.array(ZenGardenPlantSchema).optional(),
  plantsInMushroom: z.array(ZenGardenPlantSchema).optional(),
  plantsInNight: z.array(ZenGardenPlantSchema).optional(),
});

const PlayerProfileSchema = z.looseObject({
  name: z.string().optional(),
  coin: z.number().optional(),
  gem: z.number().optional(),
  sprout: z.number().optional(),
  time: z.number().optional(),
  date: z.unknown(), // Giữ nguyên để copy thời gian cục bộ trong sync.ts
  levelProps: z.record(z.string(), ProgressEntrySchema).optional(),
  player_trophies: z.record(z.string(), ProgressEntrySchema).optional(),
  player_upgrades: z.record(z.string(), UpgradePropSchema).optional(),
  plantProps: z.record(z.string(), PlantPropSchema).optional(),
  zombieProps: z.record(z.string(), ProgressEntrySchema).optional(),
  zengarden: ZenGardenSchema.optional(),
});

const KeyBindsSchema = z.looseObject({
  Game_CollectAll: z.string().optional(),
});

const SettingsSchema = z.looseObject({
  KeyBinds: KeyBindsSchema.optional(),
});

export const SaveDataSchema = z.looseObject({
  PvZ2_PlayerProperties: z.array(PlayerProfileSchema),
  PvZ2_Settings: SettingsSchema,
});

export const DateSchema_export = z.unknown();

export function validateSaveData(data: unknown) {
  return SaveDataSchema.safeParse(data);
}

export function validatePlayerProperties(data: unknown) {
  return z.array(PlayerProfileSchema).safeParse(data);
}

export function validateSettings(data: unknown) {
  return SettingsSchema.safeParse(data);
}

export const DateSchema = z.unknown();
export type SaveData = z.infer<typeof SaveDataSchema>;
export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type PvzDate = unknown;
