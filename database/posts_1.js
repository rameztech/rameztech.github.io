// database/posts_1.js

// نجعل المتغير عاماً بشكل صريح
window.postsData = window.postsData || {};

// ندمج البيانات الجديدة في المتغير العام
Object.assign(window.postsData, {
    3: {
        content: `
<h3>إصلاح IMEI لهواتف MediaTek</h3><p>شرح تفصيلي لحل مشكلة IMEI NULL في هواتف MTK باستخدام Miracle Box.</p>
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
} );
