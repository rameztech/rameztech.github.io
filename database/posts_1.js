// database/posts_1.js

// نجعل المتغير عاماً بشكل صريح
window.postsData = window.postsData || {};

// ندمج البيانات الجديدة في المتغير العام
Object.assign(window.postsData, {
    5: {
        content: `
<h3>دليل فلاش Xiaomi - Mi Flash Tool</h3><p>شرح شامل لعملية الفلاش الكامل لهواتف شاومي باستخدام الأداة الرسمية.</p>
`
    },
} );
