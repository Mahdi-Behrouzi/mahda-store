async function محاسبه_چیدمان() {
    const عرض_پارچه_ورودی = document.getElementById("عرض_پارچه").value;
    const الگوها_ورودی_متن = document.getElementById("الگوها").value.trim();
    const نتایج_متنی_عنصر = document.getElementById("نتایج_متنی");
    const canvas = document.getElementById("patternCanvas");
    const ctx = canvas.getContext("2d");

    // پاک کردن نتایج قبلی
    نتایج_متنی_عنصر.textContent = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!عرض_پارچه_ورودی || !الگوها_ورودی_متن) {
        نتایج_متنی_عنصر.textContent = "لطفاً عرض پارچه و ابعاد الگوها را وارد کنید.";
        return;
    }

    const عرض_پارچه = parseFloat(عرض_پارچه_ورودی);
    const الگوها = الگوها_ورودی_متن.split('\n').map(خط => {
        const ابعاد = خط.split(',').map(s => parseFloat(s.trim()));
        if (ابعاد.length === 2 && !isNaN(ابعاد[0]) && !isNaN(ابعاد[1]) && ابعاد[0] > 0 && ابعاد[1] > 0) {
            return [ابعاد[0], ابعاد[1]]; // [طول, عرض]
        }
        return null;
    }).filter(الگو => الگو !== null);

    if (isNaN(عرض_پارچه) || عرض_پارچه <= 0 || الگوها.length === 0) {
        نتایج_متنی_عنصر.textContent = "ورودی نامعتبر است. لطفاً عرض پارچه و حداقل یک الگوی صحیح وارد کنید.";
        return;
    }

    try {
        نتایج_متنی_عنصر.textContent = "در حال محاسبه...";
        // **** کد اتصال به بک‌اند ****
        const response = await fetch('/api/calculate', { // این مسیر باید با مسیر تعریف شده در پایتون یکی باشد
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                عرض_پارچه: عرض_پارچه,
                الگوها: الگوها
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`خطا در سرور: ${response.status} - ${errorData.message || 'پاسخی از سرور دریافت نشد'}`);
        }

        const data = await response.json();

        // نمایش نتایج متنی
        نتایج_متنی_عنصر.textContent = JSON.stringify(data, null, 2);

        // نمایش بصری نتایج (اگر داده‌ها معتبر باشند)
        if (Array.isArray(data)) {
            نمایش_بصری(عرض_پارچه, data, canvas, ctx);
        }

    } catch (error) {
        console.error("خطا در محاسبه چیدمان:", error);
        نتایج_متنی_عنصر.textContent = `خطا: ${error.message}`;
    }
}

function نمایش_بصری(عرض_پارچه_نمایش, نتایج_چیدمان_نمایش, canvas, ctx) {
    // تنظیم ابعاد کانوس بر اساس ابعاد واقعی آن در صفحه (مهم برای دقت در رسم)
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!نتایج_چیدمان_نمایش || !Array.isArray(نتایج_چیدمان_نمایش)) {
        console.error("فرمت داده های چیدمان برای نمایش بصری نامعتبر است.");
        return;
    }

    // پیدا کردن حداکثر ارتفاع مورد نیاز برای چیدمان، برای مقیاس‌بندی صحیح
    let maxHeight = 0;
    نتایج_چیدمان_نمایش.forEach(نتیجه => {
        if (نتیجه && نتیجه.y !== undefined && نتیجه.length !== undefined) {
            if ((نتیجه.y + نتیجه.length) > maxHeight) {
                maxHeight = نتیجه.y + نتیجه.length;
            }
        }
    });
    if (maxHeight === 0) maxHeight = canvas.height / (canvas.width / عرض_پارچه_نمایش); // یک مقدار پیش‌فرض اگر هیچ الگویی چیده نشود

    // مقیاس بر اساس عرض پارچه و عرض کانوس
    const scaleX = canvas.width / عرض_پارچه_نمایش;
    // مقیاس بر اساس ارتفاع چیدمان و ارتفاع کانوس
    const scaleY = canvas.height / maxHeight;
    const scale = Math.min(scaleX, scaleY) * 0.95; // استفاده از ضریب کوچکتر برای اطمینان از جا شدن و کمی حاشیه

    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    نتایج_چیدمان_نمایش.forEach((نتیجه, index) => {
        if (نتیجه) { // یعنی الگو قابل چیدمان بوده و اطلاعات موقعیت دارد
            // نتیجه باید یک آبجکت با فرمت {x: عدد, y: عدد, width: عدد, length: عدد} باشد
            // x: موقعیت شروع در عرض پارچه
            // y: موقعیت شروع در طول پارچه
            // width: عرض الگو
            // length: طول الگو

            const rectX = نتیجه.x * scale;
            const rectY = نتیجه.y * scale;
            const rectWidth = نتیجه.width * scale;
            const rectLength = نتیجه.length * scale;
            
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 1;
            ctx.strokeRect(rectX, rectY, rectWidth, rectLength);
            
            ctx.fillStyle = "black";
            ctx.fillText(`(${نتیجه.width},${نتیجه.length})`, rectX + rectWidth / 2, rectY + rectLength / 2);
        } else {
            // می‌توانید برای الگوهای غیرقابل چیدمان پیامی نمایش دهید
            console.log(`الگوی شماره ${index + 1} قابل چیدمان نبود.`);
        }
    });
}
