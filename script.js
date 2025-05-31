let fabricWidth = null;
const patterns = [];

document.getElementById('setFabricWidthBtn').addEventListener('click', () => {
  const value = parseInt(document.getElementById('fabricWidth').value);
  if (isNaN(value) || value <= 0) {
    alert('عرض پارچه نامعتبر است.');
    return;
  }
  fabricWidth = value;
  showData();
});

document.getElementById('addPatternBtn').addEventListener('click', () => {
  const input = document.getElementById('patternSize').value.trim();
  const [w, h] = input.split('x').map(Number);
  if (isNaN(w) || isNaN(h)) {
    alert('اندازه الگو نادرست است. به‌صورت عرضxطول وارد کنید.');
    return;
  }
  patterns.push({ width: w, height: h });
  showData();
});

function showData() {
  const list = document.getElementById('infoArea');
  list.innerHTML = '';

  if (fabricWidth) {
    const li = document.createElement('li');
    li.textContent = `عرض پارچه: ${fabricWidth} سانتی‌متر`;
    list.appendChild(li);
  }

  patterns.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = `الگو ${i + 1}: ${p.width} × ${p.height} سانتی‌متر`;
    list.appendChild(li);
  });
}
