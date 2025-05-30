function generateLayout() {
    const fabricWidth = parseInt(document.getElementById("fabricWidth").value);
    const inputLines = document.getElementById("patternInput").value.trim().split("\n");

    let patterns = [];

    inputLines.forEach(line => {
        const [w, h, count] = line.split(",").map(Number);
        for (let i = 0; i < count; i++) {
            patterns.push({ w, h });
        }
    });

    // مقیاس برای تبدیل سانتیمتر به پیکسل
    const scale = 3;
    const ctx = document.getElementById("layoutCanvas").getContext("2d");
    ctx.clearRect(0, 0, 1000, 1000);

    let x = 0, y = 0, rowHeight = 0;
    patterns.forEach(p => {
        if (x + p.w > fabricWidth) {
            x = 0;
            y += rowHeight;
            rowHeight = 0;
        }
        ctx.strokeRect(x * scale, y * scale, p.w * scale, p.h * scale);
        ctx.fillText(`${p.w}×${p.h}`, x * scale + 2, y * scale + 12);
        x += p.w;
        if (p.h > rowHeight) rowHeight = p.h;
    });
}

