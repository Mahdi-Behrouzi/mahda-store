function draw() {
  const fabricWidth = parseFloat(document.getElementById("fabricWidth").value);
  const repeat = parseInt(document.getElementById("repeat").value);
  const rawInput = document.getElementById("patternInput").value.trim().split('\n');

  const ctx = document.getElementById("canvas").getContext("2d");
  ctx.clearRect(0, 0, 1000, 1000);

  // مقیاس تبدیل سانتی‌متر به پیکسل
  const scale = 5; // یعنی هر 1 سانتی‌متر = 5 پیکسل
  const fabricWidthPx = fabricWidth * scale;

  // لیست الگوها با تکرار
  let patterns = [];
  rawInput.forEach(line => {
    const [w, h] = line.split('x').map(Number);
    for (let i = 0; i < repeat; i++) {
      patterns.push({ w, h });
    }
  });

  // الگوریتم چیدن در ردیف‌های متوالی
  let x = 0, y = 0, rowHeight = 0;
  ctx.font = "10px sans-serif";

  patterns.forEach((pattern, index) => {
    const pw = pattern.w * scale;
    const ph = pattern.h * scale;

    if (x + pw > fabricWidthPx) {
      // برو به ردیف بعدی
      x = 0;
      y += rowHeight + 10;
      rowHeight = 0;
    }

    // رسم مستطیل
    ctx.fillStyle = "#66b";
    ctx.fillRect(x, y, pw, ph);

    // خط دور و متن
    ctx.strokeStyle = "#000";
    ctx.strokeRect(x, y, pw, ph);
    ctx.fillStyle = "#000";
    ctx.fillText(`${pattern.w}x${pattern.h}`, x + 5, y + 15);

    // آپدیت مکان
    x += pw + 5;
    rowHeight = Math.max(rowHeight, ph);
  });
}
