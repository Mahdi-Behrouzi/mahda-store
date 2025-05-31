let fabricWidth = 0;
const patterns = [];

function setFabricWidth() {
  const width = parseInt(document.getElementById('fabricWidth').value);
  if (isNaN(width) || width <= 0) {
    alert("لطفاً عرض پارچه را به‌درستی وارد کنید.");
    return;
  }
  fabricWidth = width;
  updateDisplay();
}

function addPattern() {
  const value = document.getElementById('patternSize').value.trim();
  const parts = value.split('x');
  if (parts.length !== 2) {
    alert("لطفاً به‌صورت عرض x طول وارد کنید.");
    return;
  }
  const w = parseInt(parts[0]);
  const h = parseInt(parts[1]);
  if (isNaN(w) || isNaN(h)) {
    alert("مقدار عددی معتبر نیست.");
    return;
  }
  patterns.push({width: w, height: h});
  updateDisplay();
}

function updateDisplay() {
  const info = document.getElementById('infoArea');
  info.innerHTML = "";

  if (fabricWidth > 0) {
    info.innerHTML += `<div class="item"><strong>عرض پارچه:</strong> ${fabricWidth} سانتی‌متر</div>`;
  }

  if (patterns.length > 0) {
    patterns.forEach((p, i) => {
      info.innerHTML += `<div class="item">الگو ${i + 1}: ${p.width} × ${p.height} سانتی‌متر</div>`;
    });
  }
}
