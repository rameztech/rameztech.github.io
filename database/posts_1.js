// database/posts_1.js

// نجعل المتغير عاماً بشكل صريح
window.postsData = window.postsData || {};

// ندمج البيانات الجديدة في المتغير العام
Object.assign(window.postsData, {
    1: {
        content: `
ما هي الميزة إصلاح IMEI
<p style="background: #fef3c7; padding: 15px; border-radius: 10px; margin-top: 20px;">
    <strong>⚠️ للأجهزة غير المدعومة:</strong><br>
    إذا كان جهازك غير مدعوم في DFT Pro أو الأدوات الأخرى، يمكنك طلب خدمة السيرفر المتقدمة.
    <a href="#contact">تواصل معنا للحصول على الخدمة</a>
</p>

`
    },
    2: {
        content: `
<h3>شرح Chimera Tool لتخطي FRP</h3><p>أداة Chimera من أقوى الأدوات لتخطي FRP، وفي هذا الشرح سنتعلم كيفية استخدامها بشكل صحيح.</p><img src="https:
    },
    3: {
        content: \\`<h3>إصلاح IMEI لهواتف MediaTek</h3><p>شرح تفصيلي لحل مشكلة IMEI NULL في هواتف MTK باستخدام Miracle Box.</p>
`
    },
    4: {
        content: `
<h3>UMT Dongle Pro - الدليل الكامل</h3><p>UMT Pro واحدة من أقوى الأدوات الشاملة في عالم إصلاح الهواتف.</p>
`
    },
    5: {
        content: `
<h3>دليل فلاش Xiaomi - Mi Flash Tool</h3><p>شرح شامل لعملية الفلاش الكامل لهواتف شاومي باستخدام الأداة الرسمية.</p>
`
    },
    6: {
        content: `
<h3>تغيير شاشة Samsung A32</h3><p>في هذا الشرح سنتعلم كيفية تغيير شاشة A32 بطريقة احترافية وآمنة.</p>
`
    },
} );
