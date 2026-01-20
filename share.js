// نظام المشاركة - يعمل بشكل مستقل عن script.js
(function() {
    'use strict';

    // دوال المشاركة
    window.sharePost = function(postId) {
        const url = `${window.location.origin}${window.location.pathname}#post-${postId}`;
        
        if (navigator.share) {
            const allPosts = window.searchIndex || [];
            const postData = allPosts.find(p => p.id === postId);
            navigator.share({
                title: postData ? postData.title : 'منشور من RAMEZ TECH',
                url: url
            }).catch(() => copyToClipboard(url));
        } else {
            copyToClipboard(url);
        }
    };

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('✅ تم نسخ رابط المنشور بنجاح!');
            }).catch(() => fallbackCopyTextToClipboard(text));
        } else {
            fallbackCopyTextToClipboard(text);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('✅ تم نسخ رابط المنشور!');
        } catch (err) {
            showNotification('❌ فشل نسخ الرابط');
        }
        document.body.removeChild(textArea);
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: shareSlideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'shareSlideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // إضافة CSS للأنيميشن
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shareSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shareSlideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // التعامل مع Deep Linking عند تحميل الصفحة
    function handleDeepLink() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#post-')) {
            const postId = parseInt(hash.replace('#post-', ''), 10);
            if (!isNaN(postId)) {
                // انتظر تحميل script.js الرئيسي
                const checkInterval = setInterval(() => {
                    if (window.searchIndex && window.searchIndex.length > 0) {
                        clearInterval(checkInterval);
                        const post = window.searchIndex.find(p => p.id === postId);
                        if (post && typeof window.openModalFromHash === 'function') {
                            setTimeout(() => window.openModalFromHash(postId), 100);
                        }
                    }
                }, 100);
            }
        }
    }

    // تشغيل عند التحميل
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleDeepLink);
    } else {
        handleDeepLink();
    }

    // مراقبة تغييرات Hash
    window.addEventListener('hashchange', handleDeepLink);

    console.log('✅ نظام المشاركة جاهز');
})();