/**
 * Tiện ích quản lý và kiểm tra máy chủ Localhost chơi game.
 */

/**
 * Kiểm tra xem máy chủ Localhost có đang chạy game PVZGE hay không.
 * Gửi request ngầm không đồng bộ chống cache, đọc HTML và quét từ khóa xác thực.
 *
 * @param port Cổng localhost cần kiểm tra (ví dụ: "8080")
 * @returns Trả về URL sạch (http://localhost:port) nếu online và đúng là game, ngược lại trả về null.
 */
export async function pingLocalGame(port: string): Promise<string | null> {
  const url = `http://localhost:${port}`;
  // Lớp phòng thủ 2: Thêm timestamp để ép trình duyệt không sử dụng cache
  const fetchUrl = `${url}?_t=${Date.now()}`;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

    // Lớp phòng thủ 1: Dùng cache: "no-store" ép bỏ qua bộ nhớ đệm
    const response = await fetch(fetchUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(id);

    if (response.ok) {
      const htmlText = await response.text();
      const lowerText = htmlText.toLowerCase();

      // Kiểm tra xem trang có các từ khóa đặc trưng của game PvZ2 Gardendless hoặc canvas chơi game hay không
      const isPvzGame = lowerText.includes("pvz2") ||
        lowerText.includes("gardendless") ||
        lowerText.includes("pvzge") ||
        lowerText.includes("gamecanvas");

      if (isPvzGame) {
        return url; // Trả về URL sạch ban đầu
      }
    }
  } catch (e) {
    console.debug(
      `[Localhost Utility] Port ${port} is offline or unreachable:`,
      e,
    );
  }
  return null;
}
