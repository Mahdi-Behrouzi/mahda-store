async function محاسبه_چیدمان() {
    const عرض_پارچه = parseFloat(document.getElementById("عرض_پارچه").value);
    const الگوها_ورودی = document.getElementById("الگوها").value.trim().split('\n');
    const الگوها = الگوها_ورودی.map(خط => {
        const ابعاد = خط.split(',').map(s => parseFloat(s.trim()));
        if (ابعاد.length === 2 && !isNaN(ابعاد[0]) && !isNaN(ابعاد[1])) {
            return [ابعاد[0], ابعاد[1]];
        }
        return null;
    }).filter(الگو => الگو !== null);

    if (isNaN(عرض_پارچه) || الگوها.length === 0) {
        document.getElementById("نتایج_چیدمان").textContent = "لطفاً عرض پارچه و ابعاد الگوها را به درستی وارد کنید.";
        return;
    }

    const response = await fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            عرض_پارچه: عرض_پارچه,
            الگوها: الگوها
        })
    });

    if (response.ok) {
        const data = await response.json();
        document.getElementById("نتایج_چیدمان").textContent = JSON.stringify(data, null, 2);

        // تابع برای رسم الگوها روی Canvas
        نمایش_بصری(عرض_پارچه, data);
    } else {
        document.getElementById("نتایج_چیدمان").textContent = "خطا در برقراری ارتباط با سرور.";
    }
}

function نمایش_بصری(عرض_پارچه_نمایش, نتایج_چیدمان_نمایش) {
    const canvas = document.getElementById("patternCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // پاک کردن Canvas

    if (!نتایج_چیدمان_نمایش || !Array.isArray(نتایج_چیدمان_نمایش)) {
        console.error("فرمت داده های چیدمان برای نمایش بصری نامعتبر است.");
        return;
    }

    // تنظیم مقیاس برای نمایش الگوها در Canvas
    const مقیاس = canvas.width / عرض_پارچه_نمایش; // فرض می کنیم عرض Canvas متناسب با عرض پارچه است

    let موقعیت_فعلی_y_نمایش = 0;

    نتایج_چیدمان_نمایش.forEach(نتیجه => {
        if (نتیجه && Array.isArray(نتیجه) && نتیجه.length === 4) {
            const x = نتیجه[0] * مقیاس;
            const y = موقعیت_فعلی_y_نمایش * مقیاس; // در این مثال ساده، فقط در راستای Y چیده می شوند
            const طول = نتیجه[2] * مقیاس;
            const عرض = نتیجه[3] * مقیاس;

            ctx.strokeRect(x, y, عرض, طول); // توجه: طول و عرض اینجا جابجا شده اند چون در چیدمان خطی Y را افزایش دادیم
            ctx.fillText(`(${نتیجه[2]}, ${نتیجه[3]})`, x + 5, y + 15);

            موقعیت_فعلی_y_نمایش += نتیجه[2]; // افزایش موقعیت برای الگوی بعدی
        }
    });
}
