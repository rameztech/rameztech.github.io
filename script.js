 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/script.js b/script.js
index fb8e5054dbdc4d2e54cf63e59417f4d7ec683226..efce1076d1cd048af811528e66dcea9f3a157cd6 100644
--- a/script.js
+++ b/script.js
@@ -222,30 +222,67 @@ document.addEventListener('DOMContentLoaded', () => {
     } else if(postsGrid) {
         postsGrid.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1 / -1;">جاري تحميل المشاركات...</p>';
     }
 
     // مراقبة تغييرات الرابط (للخلف وللأمام في المتصفح)
     window.addEventListener('hashchange', handleDeepLink);
 
     // تسجيل معلومات التحميل في Console
     console.log(`📊 عدد المنشورات في الفهرس: ${allPosts.length}`);
     console.log(`📂 ملفات posts محملة مسبقاً: ${window.loadedPostsFiles.length}`);
 });
 
 // وظيفة نسخ الرابط (خارج DOMContentLoaded لتكون متاحة عالمياً)
 function copyPostLink(postId) {
     const url = window.location.origin + window.location.pathname + '#post/' + postId;
     navigator.clipboard.writeText(url).then(() => {
         alert('تم نسخ رابط المنشور بنجاح!');
     }).catch(err => {
         console.error('فشل نسخ الرابط: ', err);
     });
 }
 
 function googleTranslateElementInit() {
     new google.translate.TranslateElement({ 
         pageLanguage: 'ar', 
-        includedLanguages: 'en,tr', 
+        includedLanguages: 'ar,en,tr', 
         layout: google.translate.TranslateElement.InlineLayout.SIMPLE, 
         autoDisplay: false 
     }, 'google_translate_element');
+
+    initLanguageSelector();
+}
+
+function initLanguageSelector() {
+    const languageButtons = document.querySelectorAll('.lang-btn');
+
+    if (!languageButtons.length) return;
+
+    const setActive = (lang) => {
+        languageButtons.forEach((btn) => {
+            btn.classList.toggle('active', btn.dataset.lang === lang);
+        });
+    };
+
+    const applyLanguage = (lang) => {
+        const combo = document.querySelector('.goog-te-combo');
+        if (!combo) return;
+        combo.value = lang;
+        combo.dispatchEvent(new Event('change'));
+        setActive(lang);
+    };
+
+    languageButtons.forEach((btn) => {
+        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
+    });
+
+    const waitForCombo = () => {
+        const combo = document.querySelector('.goog-te-combo');
+        if (combo) {
+            setActive(combo.value || 'ar');
+            return;
+        }
+        window.setTimeout(waitForCombo, 300);
+    };
+
+    waitForCombo();
 }
 
EOF
)
