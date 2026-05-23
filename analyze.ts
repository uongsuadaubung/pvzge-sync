// analyze.ts
// Công cụ phân tích dữ liệu lưu game (PvZ2 Save Data Analyzer)

async function run() {
  let content = "";
  let txtFile = "";
  try {
    const txtFiles: { name: string; mtime: number }[] = [];
    for await (const entry of Deno.readDir(".")) {
      if (entry.isFile && entry.name.endsWith(".txt")) {
        let mtime = 0;
        try {
          const stat = await Deno.stat(entry.name);
          mtime = stat.mtime?.getTime() || 0;
        } catch {
          // Bỏ qua lỗi stat
        }
        txtFiles.push({ name: entry.name, mtime });
      }
    }

    if (txtFiles.length === 0) {
      console.error("Không tìm thấy bất kỳ file .txt nào trong thư mục gốc!");
      return;
    }

    // Sắp xếp các file theo thời gian chỉnh sửa mới nhất
    txtFiles.sort((a, b) => b.mtime - a.mtime);

    txtFile = txtFiles[0].name;
    content = await Deno.readTextFile(txtFile);
  } catch (e) {
    console.error(
      "❌ Lỗi khi quét thư mục hoặc đọc file:",
      e instanceof Error ? e.message : String(e),
    );
    return;
  }

  // Tìm và trích xuất dữ liệu PvZ2_PlayerProperties
  const playerPropsMatch = content.match(
    /PvZ2_PlayerProperties\s*:\s*"(\[.*?\])"/,
  );
  if (!playerPropsMatch) {
    console.warn(
      "⚠️ Không tìm thấy khoá PvZ2_PlayerProperties dạng chuỗi JSON!",
    );
    return;
  }

  const jsonStr = playerPropsMatch[1].replace(/\\"/g, '"');
  try {
    const profiles = JSON.parse(jsonStr);
    console.log(`==================================================`);
    console.log(`   PHÂN TÍCH DỮ LIỆU LƯU GAME (PVZGE-SYNC)`);
    console.log(`==================================================`);
    console.log(`📂 Đang đọc file: ${txtFile}`);
    console.log(`Tìm thấy ${profiles.length} hồ sơ người chơi (Profiles).\n`);

    for (const [idx, profile] of profiles.entries()) {
      console.log(`Hồ sơ #${idx + 1}: ${profile.name || "Không tên"}`);
      console.log(`--------------------------------------------------`);
      console.log(`• Xu xu (Coin): ${profile.coin}`);
      console.log(`• Kim cương (Gem): ${profile.gem}`);
      console.log(`• Mầm cây (Sprout): ${profile.sprout}`);
      console.log(`• Phiên bản game (Version): ${profile.version}`);

      // 1. Phân tích cardDecks
      console.log(
        `\n📂 [cardDecks] (Số lượng: ${profile.cardDecks?.length || 0})`,
      );
      if (profile.cardDecks && profile.cardDecks.length > 0) {
        profile.cardDecks.forEach((item: unknown, i: number) => {
          console.log(`   - [${i}]: ${typeof item} ->`, JSON.stringify(item));
        });
        console.log(`\n✨ ĐỀ XUẤT SCHEMA ZOD CHO cardDecks:`);
        console.log(inferZodSchema(profile.cardDecks, ""));
      } else {
        console.log(`   (Mảng trống - Chưa có dữ liệu để suy luận schema)`);
      }

      // 2. Phân tích worldProgress
      console.log(
        `\n📂 [worldProgress] (Số lượng: ${
          profile.worldProgress?.length || 0
        })`,
      );
      if (profile.worldProgress && profile.worldProgress.length > 0) {
        profile.worldProgress.forEach((item: unknown, i: number) => {
          console.log(`   - [${i}]: ${typeof item} ->`, JSON.stringify(item));
        });
        console.log(`\n✨ ĐỀ XUẤT SCHEMA ZOD CHO worldProgress:`);
        console.log(inferZodSchema(profile.worldProgress, ""));
      } else {
        console.log(`   (Mảng trống - Chưa có dữ liệu để suy luận schema)`);
      }

      // 3. Phân tích Zen Garden
      if (profile.zengarden) {
        const zg = profile.zengarden;
        console.log(`\n🏡 [Zen Garden]`);
        console.log(
          `   • plantInCart:`,
          zg.plantInCart ? JSON.stringify(zg.plantInCart) : "null",
        );

        const inspectPlantsArray = (name: string, arr: unknown[]) => {
          console.log(`   • ${name} (Số lượng: ${arr?.length || 0})`);
          if (arr && arr.length > 0) {
            console.log(`     Mẫu 2 cây đầu tiên:`);
            arr.slice(0, 2).forEach((plant, i) => {
              console.log(`     [${i}]:`, JSON.stringify(plant));
            });
          }
        };

        inspectPlantsArray("plantsInMain (Sân chính)", zg.plantsInMain || []);
        inspectPlantsArray(
          "plantsInBeach (Sân bãi biển)",
          zg.plantsInBeach || [],
        );
        inspectPlantsArray(
          "plantsInMushroom (Sân nấm)",
          zg.plantsInMushroom || [],
        );
        inspectPlantsArray(
          "plantsInNight (Sân ban đêm)",
          zg.plantsInNight || [],
        );
      }

      // 4. Phân tích Endless Props
      if (profile.worldProps) {
        console.log(`\n♾️ [Endless Props (Chế độ Vô hạn)]`);
        let hasEndlessData = false;
        for (const worldId of Object.keys(profile.worldProps)) {
          const wp = profile.worldProps[worldId];
          if (wp && wp.endlessProps) {
            const ep = wp.endlessProps;
            const hasInitial = ep.initialPlants && ep.initialPlants.length > 0;
            const hasObtained = ep.obtainedPlants &&
              ep.obtainedPlants.length > 0;
            const hasChoose = ep.plantsToChoose && ep.plantsToChoose.length > 0;

            if (
              hasInitial || hasObtained || hasChoose || ep.plantChosen ||
              ep.level > 1 || ep.plantfood > 0
            ) {
              hasEndlessData = true;
              console.log(`   • 🌎 Thế giới ${worldId}:`);
              console.log(`     - Level đạt được: ${ep.level}`);
              console.log(
                `     - Đã chọn cây (plantChosen): ${ep.plantChosen}`,
              );
              console.log(
                `     - Thức ăn cho cây (plantfood): ${ep.plantfood}`,
              );
              console.log(
                `     - Cây ban đầu (initialPlants):`,
                JSON.stringify(ep.initialPlants),
              );
              console.log(
                `     - Cây hiện có (obtainedPlants):`,
                JSON.stringify(ep.obtainedPlants),
              );
              console.log(
                `     - Cây để chọn (plantsToChoose):`,
                JSON.stringify(ep.plantsToChoose),
              );
            }
          }
        }
        if (!hasEndlessData) {
          console.log(`   (Không thế giới nào có dữ liệu Endless)`);
        }
      }
      console.log(`\n==================================================`);
    }
  } catch (e) {
    console.error(
      "❌ Lỗi khi phân tích dữ liệu JSON:",
      e instanceof Error ? e.message : String(e),
    );
  }
}

// Hàm tự động suy luận schema Zod từ dữ liệu thực tế
function inferZodSchema(data: unknown, indent = ""): string {
  if (data === null) return "z.null()";
  if (Array.isArray(data)) {
    if (data.length === 0) return "z.array(z.unknown())";
    const elementSchemas = Array.from(
      new Set(data.map((item) => inferZodSchema(item, indent))),
    );
    if (elementSchemas.length === 1) {
      return `z.array(${elementSchemas[0]})`;
    }
    return `z.array(z.union([\n${
      elementSchemas.map((s) => `${indent}  ${s}`).join(",\n")
    }\n${indent}]))`;
  }
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) return "z.object({})";
    const entries = keys
      .map((k) => `${indent}  ${k}: ${inferZodSchema(obj[k], indent + "  ")}`)
      .join(",\n");
    return `z.object({\n${entries}\n${indent}}).strict()`;
  }
  if (typeof data === "number") return "z.number()";
  if (typeof data === "string") return "z.string()";
  if (typeof data === "boolean") return "z.boolean()";
  return "z.unknown()";
}

run();
