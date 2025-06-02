document.addEventListener('DOMContentLoaded', () => {
    const sheetWidthInput = document.getElementById('sheet-width');
    const sheetHeightInput = document.getElementById('sheet-height');
    const patternListDiv = document.getElementById('pattern-list');
    const addPatternButton = document.getElementById('add-pattern');
    const optimizeButton = document.getElementById('optimize-button');
    const canvas = document.getElementById('nesting-canvas');
    const ctx = canvas.getContext('2d');
    const wastePercentageSpan = document.getElementById('waste-percentage');
    const messageLogSpan = document.getElementById('message-log');

    let patternCounter = 0;

    function addPatternEntry() {
        patternCounter++;
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('pattern-entry');
        entryDiv.innerHTML = `
            <input type="text" class="pattern-id" placeholder="شناسه ${patternCounter}" value="P${patternCounter}">
            <input type="number" class="pattern-width" placeholder="عرض">
            <input type="number" class="pattern-height" placeholder="ارتفاع">
            <input type="number" class="pattern-quantity" placeholder="تعداد" value="1">
            <button class="remove-pattern">حذف</button>
        `;
        patternListDiv.appendChild(entryDiv);
        entryDiv.querySelector('.remove-pattern').addEventListener('click', () => {
            entryDiv.remove();
        });
    }

    addPatternButton.addEventListener('click', addPatternEntry);
    addPatternEntry(); // اضافه کردن یک الگوی اولیه

    optimizeButton.addEventListener('click', async () => {
        const sheet = {
            width: parseFloat(sheetWidthInput.value),
            height: parseFloat(sheetHeightInput.value)
        };

        const patterns = [];
        document.querySelectorAll('.pattern-entry').forEach(entry => {
            const id = entry.querySelector('.pattern-id').value;
            const width = parseFloat(entry.querySelector('.pattern-width').value);
            const height = parseFloat(entry.querySelector('.pattern-height').value);
            const quantity = parseInt(entry.querySelector('.pattern-quantity').value);

            if (id && !isNaN(width) && width > 0 && !isNaN(height) && height > 0 && !isNaN(quantity) && quantity > 0) {
                patterns.push({ id, width, height, quantity });
            }
        });

        if (isNaN(sheet.width) || sheet.width <= 0 || isNaN(sheet.height) || sheet.height <= 0) {
            messageLogSpan.textContent = 'لطفاً ابعاد معتبر برای شیت وارد کنید.';
            return;
        }
        if (patterns.length === 0) {
            messageLogSpan.textContent = 'لطفاً حداقل یک الگو وارد کنید.';
            return;
        }

        messageLogSpan.textContent = 'در حال پردازش...';
        wastePercentageSpan.textContent = '--';

        try {
            // آدرس API بک‌اند خود را اینجا قرار دهید
            const response = await fetch('/api/nesting/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ patterns, sheet }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errorMessage || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.errorMessage) {
                messageLogSpan.textContent = `خطا: ${result.errorMessage}`;
                drawSheet(sheet.width, sheet.height); // فقط شیت خالی را رسم کن
            } else {
                messageLogSpan.textContent = 'چیدمان با موفقیت انجام شد.';
                wastePercentageSpan.textContent = result.wastePercentage !== undefined ? result.wastePercentage.toFixed(2) : '--';
                drawLayout(sheet, result.placements, patterns);
            }

        } catch (error) {
            console.error('Error during optimization:', error);
            messageLogSpan.textContent = `خطا در ارتباط با سرور: ${error.message}`;
            drawSheet(sheet.width, sheet.height); // فقط شیت خالی را رسم کن
        }
    });

    function drawSheet(sheetWidth, sheetHeight) {
        // تنظیم ابعاد canvas بر اساس ابعاد شیت برای نمایش بهتر
        // می‌توانید یک مقیاس ثابت یا حداکثر اندازه برای canvas در نظر بگیرید
        const displayMaxWidth = document.getElementById('visualization-area').clientWidth - 2; // -2 for border
        const displayMaxHeight = 380; //ارتفاع ثابت برای نمایش

        let scale;
        if (sheetWidth / sheetHeight > displayMaxWidth / displayMaxHeight) {
            scale = displayMaxWidth / sheetWidth;
        } else {
            scale = displayMaxHeight / sheetHeight;
        }

        canvas.width = sheetWidth * scale;
        canvas.height = sheetHeight * scale;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        return scale;
    }

    function drawLayout(sheet, placements, originalPatterns) {
        const scale = drawSheet(sheet.width, sheet.height);

        if (!placements) return;

        const patternDetails = {};
        originalPatterns.forEach(p => patternDetails[p.id] = p);


        placements.forEach(p => {
            const detail = originalPatterns.find(op => op.id === p.patternId);
            if (!detail) return;

            const rectX = p.x * scale;
            const rectY = p.y * scale;
            const rectWidth = (p.rotated ? detail.height : detail.width) * scale;
            const rectHeight = (p.rotated ? detail.width : detail.height) * scale;


            ctx.fillStyle = getRandomColor(p.patternId);
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

            ctx.fillStyle = '#000';
            ctx.font = `${Math.min(10, rectWidth / 3)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.patternId, rectX + rectWidth / 2, rectY + rectHeight / 2);
        });
    }

    const colorCache = {};
    function getRandomColor(id) {
        if (colorCache[id]) return colorCache[id];

        const r = Math.floor(Math.random() * 200 + 55); // روشن‌تر
        const g = Math.floor(Math.random() * 200 + 55);
        const b = Math.floor(Math.random() * 200 + 55);
        const color = `rgb(${r},${g},${b})`;
        colorCache[id] = color;
        return color;
    }

    // مقداردهی اولیه برای نمایش شیت
    drawSheet(parseFloat(sheetWidthInput.value), parseFloat(sheetHeightInput.value));
});
