import type { SaveData } from "./schema.ts";

/**
 * Kiểm tra xem dữ liệu SaveData có tiến trình chơi game thực tế hay không.
 * Đối chiếu giữa dữ liệu mới tinh và dữ liệu có tiến trình :
 * - Bản save mới tinh chỉ có name = "New Player", coin = 0, gem = 0, sprout = 0.
 * - levelProps, trophyProps, zombieProps, upgradeProps trống trơn
 * - plantProps chỉ có đúng 4 cây mặc định: peashooter, sunflower, wallnut, potatomine.
 */
export function hasProgress(
  save: SaveData | null | undefined,
): save is SaveData {
  if (
    !save || !save.PvZ2_PlayerProperties ||
    save.PvZ2_PlayerProperties.length === 0
  ) {
    return false;
  }
  return save.PvZ2_PlayerProperties.some((profile) => {
    const levelCount = Object.keys(profile.levelProps || {}).length;
    const trophyCount = Object.keys(profile.trophyProps || {}).length;
    const plantCount = Object.keys(profile.plantProps || {}).length;
    const zombieCount = Object.keys(profile.zombieProps || {}).length;
    const upgradeCount = Object.keys(profile.upgradeProps || {}).length;

    const coinCount = profile.coin || 0;
    const gemCount = profile.gem || 0;
    const sproutCount = profile.sprout || 0;

    // Đã vượt qua ít nhất 1 màn chơi, hoặc có cúp, hoặc mở khóa > 4 cây trồng,
    // hoặc có zombie trong từ điển, hoặc có nâng cấp,
    // hoặc có lượng xu, ngọc, hay sprout tích lũy lớn hơn khởi đầu.
    return (
      levelCount > 0 ||
      trophyCount > 0 ||
      plantCount > 4 ||
      zombieCount > 0 ||
      upgradeCount > 0 ||
      coinCount > 1000 ||
      gemCount > 10 ||
      sproutCount > 0
    );
  });
}
