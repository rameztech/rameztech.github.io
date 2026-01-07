// database/posts_1.js

// نجعل المتغير عاماً بشكل صريح
window.postsData = window.postsData || {};

// ندمج البيانات الجديدة في المتغير العام
Object.assign(window.postsData, {
    2: {
        content: `
<h3>شرح Chimera Tool لتخطي FRP</h3><p>أداة Chimera من أقوى الأدوات لتخطي FRP، وفي هذا الشرح سنتعلم كيفية استخدامها بشكل صحيح.</p><img src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800" alt="Chimera Tool"><h4>مميزات Chimera Tool:</h4><ul><li>دعم واسع للأجهزة</li><li>واجهة سهلة الاستخدام</li><li>تحديثات دورية</li></ul>
`
    },
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
