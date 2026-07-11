import { validateSaveData } from "@/domains/game/schema.ts";

async function main() {
  let content: string;
  const filePath = "data.txt";
  try {
    content = await Deno.readTextFile(filePath);
  } catch {
    console.error(`❌ Không tìm thấy file '${filePath}' ở thư mục gốc!`);
    Deno.exit(1);
  }

  const lines = content.split("\n").filter((l) => l.trim() !== "");
  const obj: Record<string, unknown> = {};

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const rawVal = line.slice(colonIdx + 1).trim();

    let parsedVal: unknown;
    try {
      if (rawVal.startsWith('"') && rawVal.endsWith('"')) {
        const unescaped = rawVal.slice(1, -1).replace(/\\"/g, '"').replace(
          /\\\\/g,
          "\\",
        );
        parsedVal = JSON.parse(unescaped);
      } else {
        parsedVal = JSON.parse(rawVal);
      }
      obj[key] = parsedVal;
    } catch (e) {
      console.error(`❌ Lỗi phân tích JSON ở khoá '${key}':`, e);
      Deno.exit(1);
    }
  }

  const result = validateSaveData(obj);
  if (!result.success) {
    console.error("❌ Xác thực dữ liệu thất bại (Validation Failed):");
    for (const issue of result.error.issues) {
      console.error(`- Đường dẫn (Path): ${issue.path.join(".")}`);
      console.error(`  Thông báo (Message): ${issue.message}`);
    }
    Deno.exit(1);
  } else {
    console.log("✅ Xác thực dữ liệu thành công (Validation Succeeded)!");
  }
}

main();
