function generateLayout() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const fabricWidth = parseInt(document.getElementById('fabricWidth').value);
  const rawSizes = document.getElementById('patternSizes').value;
  const countPerPattern = parseInt(document.getElementById('patternCount').value);

  const allPatterns = [];

  // Parse and replicate patterns
  rawSizes.split(',').forEach(sizeStr => {
    const [w, h] = sizeStr.trim().split(/[x×]/).map(Number);
    for (let i = 0; i < countPerPattern; i++) {
      allPatterns.push({ width: w, height: h });
    }
  });

  // چیدمان بهینه با بررسی چرخش
  const placed = [];
  let currentY = 0;
  let rowHeight = 0;
  let x = 0;

  allPatterns.sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height));

  for (let i = 0; i < allPatterns.length; i++) {
    let p = allPatterns[i];

    // بررسی جا شدن افقی
    let fitsNormal = (x + p.width <= fabricWidth);
    let fitsRotated = (x + p.height <= fabricWidth);

    if (fitsNormal || fitsRotated) {
      let rotate = false;

      if (!fitsNormal && fitsRotated) {
        // چرخش
        rotate = true;
        [p.width, p.height] = [p.height, p.width];
      }

      placed.push({ x, y: currentY, ...p, rotated: rotate });
      x += p.width;
      rowHeight = Math.max(rowHeight, p.height);
    } else {
      // رفتن به سطر بعد
      currentY += rowHeight + 10;
      x = 0;
      rowHeight = 0;
      i--; // بررسی مجدد همین قطعه در ردیف جدید
    }
  }

  // رسم الگوها
  ctx.font = "12px Arial";
  placed.forEach((p, i) => {
    ctx.fillStyle = '#'+Math.floor(Math.random()*16777215).toString(16);
    ctx.fillRect(p.x * 4, p.y * 4, p.width * 4, p.height * 4);
    ctx.strokeRect(p.x * 4, p.y * 4, p.width * 4, p.height * 4);
    ctx.fillStyle = '#000';
    ctx.fillText(`${p.width}×${p.height}${p.rotated ? ' ⟳' : ''}`, p.x * 4 + 4, p.y * 4 + 14);
  });
      }
