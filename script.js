function optimizeLayout() {
  const fabricWidth = parseFloat(document.getElementById("fabricWidth").value);
  const rawInput = document.getElementById("patternList").value.trim();

  if (!fabricWidth || !rawInput) {
    alert("لطفاً عرض پارچه و الگوها را وارد کنید.");
    return;
  }

  const patterns = rawInput.split('\n').map(line => {
    const [w, h] = line.toLowerCase().split('x').map(Number);
    return { width: w, height: h };
  });

  const placedPatterns = [];
  let currentY = 0;
  let shelfHeight = 0;
  let currentX = 0;

  for (let pattern of patterns) {
    let placed = false;

    // سعی در جا دادن چرخیده
    const tryRotated = [
      pattern,
      { width: pattern.height, height: pattern.width }
    ];

    for (let variant of tryRotated) {
      if (currentX + variant.width <= fabricWidth) {
        placedPatterns.push({ ...variant, x: currentX, y: currentY });
        currentX += variant.width;
        shelfHeight = Math.max(shelfHeight, variant.height);
        placed = true;
        break;
      }
    }

    if (!placed) {
      // رفتن به ردیف جدید
      currentY += shelfHeight;
      currentX = 0;
      shelfHeight = 0;

      let used = false;
      for (let variant of tryRotated) {
        if (variant.width <= fabricWidth) {
          placedPatterns.push({ ...variant, x: currentX, y: currentY });
          currentX += variant.width;
          shelfHeight = variant.height;
          used = true;
          break;
        }
      }

      if (!used) {
        alert("یکی از الگوها بزرگتر از عرض پارچه است!");
        return;
      }
    }
  }

  // ساخت خروجی نمایشی
  let output = `عرض پارچه: ${fabricWidth} سانتی‌متر\n`;
  output += `تعداد کل الگوها: ${patterns.length}\n\n`;
  placedPatterns.forEach((p, i) => {
    output += `الگو ${i + 1}: ${p.width}×${p.height} در موقعیت (${p.x}, ${p.y})\n`;
  });

  document.getElementById("layoutResult").innerText = output;
}
