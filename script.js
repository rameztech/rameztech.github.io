Content is user-generated and unverified.
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Elements Selection ---
    const postsGrid = document.getElementById('postsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterButtonsContainer = document.getElementById('filterButtons');
    const modal = document.getElementById('postModal');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const yearSpan = document.getElementById('year');

    // --- 2. Data Initialization ---
    window.postsData = window.postsData || {};
    window.loadedPostsFiles = window.loadedPostsFiles || [];
    
    const allPosts = window.searchIndex || [];
    let currentFilter = 'all';

    const categoryNames = {
        'all': 'الكل',
        'frp': 'تخطي FRP',
        'hardware': 'شروحات هاردوير',
        'imei': 'إصلاح IMEI',
        'software': 'شروحات سوفتوير',
        'tools': 'أدوات',
    };

    // --- 3. Dynamic Loading Function ---
    const loadPostFile = (fileName) => {
        return new Promise((resolve, reject) => {
            if (window.loadedPostsFiles.includes(fileName)) {
                resolve();
                return;
            }

            console.log(`📥 تحميل ملف: ${fileName}`);

            const script = document.createElement('script');
            script.src = `database/${fileName}`;
            
            script.onload = () => {
                window.loadedPostsFiles.push(fileName);
                console.log(`✅ تم تحميل: ${fileName}`);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`❌ فشل تحميل: ${fileName}`);
                reject(new Error(`Failed to load ${fileName}`));
            };
            
            document.head.appendChild(script);
        });
    };

    // --- 4. Functions ---
    const createPostCard = (post) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.setAttribute('data-id', post.id);
        card.innerHTML = `
            <img src="${post.cover}" alt="${post.title}" class="post-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';">
            <div class="post-content">
                <span class="post-category">${categoryNames[post.category] || post.category}</span>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
            </div>
        `;
        return card;
    };

    const renderPosts = () => {
        if (!postsGrid) return;
        postsGrid.innerHTML = '';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        const filteredPosts = allPosts.filter(post => {
            const matchesCategory = currentFilter === 'all' || post.category === currentFilter;
            const matchesSearch = post.title.toLowerCase().includes(searchTerm) || post.excerpt.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        if (filteredPosts.length === 0) {
            postsGrid.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1 / -1;">لا توجد منشورات تطابق هذا البحث.</p>';
        } else {
            filteredPosts.forEach(post => postsGrid.appendChild(createPostCard(post)));
        }
    };

    // دالة نسخ الرابط (داخلية)
    const sharePost = (postId) => {
        const url = `${window.location.origin}${window.location.pathname}#post-${postId}`;
        
        // محاولة استخدام Web Share API إذا كان متاحاً
        if (navigator.share) {
            const postData = allPosts.find(p => p.id === postId);
            navigator.share({
                title: postData ? postData.title : 'منشور من RAMEZ TECH',
                url: url
            }).catch(err => {
                // إذا فشل، نستخدم النسخ العادي
                copyToClipboard(url);
            });
        } else {
            copyToClipboard(url);
        }
    };

    const copyToClipboard = (text) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('✅ تم نسخ رابط المنشور بنجاح!');
            }).catch(err => {
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    };

    const fallbackCopyTextToClipboard = (text) => {
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
    };

    const showNotification = (message) => {
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
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    const openModal = async (postId) => {
        const postIndexData = allPosts.find(p => p.id === postId);

        if (!modal || !modalBody || !postIndexData) return;

        // تحديث URL Hash
        window.location.hash = `post-${postId}`;

        // عرض رسالة تحميل
        modalBody.innerHTML = `
            <h2 class="modal-title">${postIndexData.title}</h2>
            <p style="text-align: center; padding: 40px;">
                <span style="font-size: 48px;">⏳</span><br>
                <strong>جاري تحميل المحتوى...</strong>
            </p>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        try {
            const fileName = postIndexData.file || 'posts_1.js';
            await loadPostFile(fileName);

            const postContentData = window.postsData[postId];

            if (!postContentData) {
                modalBody.innerHTML = `
                    <h2 class="modal-title">${postIndexData.title}</h2>
                    <p style="color: #ef4444; text-align: center; padding: 40px;">
                        ❌ عذراً، محتوى هذا المنشور غير متوفر حالياً.
                    </p>
                `;
            } else {
                modalBody.innerHTML = `
                    <img src="${postIndexData.cover}" alt="${postIndexData.title}" class="modal-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                        <span class="post-category">${categoryNames[postIndexData.category] || postIndexData.category}</span>
                        <button id="sharePostBtn" class="filter-btn" style="font-size: 0.9em; padding: 8px 20px;">
                            🔗 مشاركة المنشور
                        </button>
                    </div>
                    <h2 class="modal-title">${postIndexData.title}</h2>
                    <div class="modal-body">${postContentData.content}</div>
                `;

                // إضافة Event Listener لزر المشاركة
                const shareBtn = document.getElementById('sharePostBtn');
                if (shareBtn) {
                    shareBtn.addEventListener('click', () => sharePost(postId));
                }
            }
        } catch (error) {
            console.error('خطأ في تحميل المنشور:', error);
            modalBody.innerHTML = `
                <h2 class="modal-title">${postIndexData.title}</h2>
                <p style="color: #ef4444; text-align: center; padding: 40px;">
                    ❌ حدث خطأ أثناء تحميل المحتوى.<br>
                    <small>${error.message}</small>
                </p>
            `;
        }
    };

    const closeModal = () => {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            // إزالة Hash من URL
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    };

    const createFilterButtons = () => {
        if (!filterButtonsContainer) return;
        const categories = ['all', ...new Set(allPosts.map(p => p.category))];
        filterButtonsContainer.innerHTML = categories.map(cat => 
            `<button class="filter-btn ${cat === 'all' ? 'active' : ''}" data-category="${cat}">${categoryNames[cat] || cat}</button>`
        ).join('');

        filterButtonsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                filterButtonsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.category;
                renderPosts();
            }
        });
    };

    // التعامل مع الروابط المباشرة (Deep Linking)
    const handleDeepLink = () => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#post-')) {
            const postId = parseInt(hash.replace('#post-', ''), 10);
            if (!isNaN(postId) && allPosts.find(p => p.id === postId)) {
                setTimeout(() => openModal(postId), 100);
            }
        }
    };

    // --- 5. Event Listeners & Initialization ---
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderPosts);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        window.addEventListener('click', (event) => { 
            if (event.target === modal) closeModal(); 
        });
    }

    if (postsGrid) {
        postsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.post-card');
            if (card) {
                const postId = parseInt(card.dataset.id, 10);
                openModal(postId);
            }
        });
    }

    if (allPosts.length > 0) {
        createFilterButtons();
        renderPosts();
        handleDeepLink();
    } else if(postsGrid) {
        postsGrid.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1 / -1;">جاري تحميل المشاركات...</p>';
    }

    // مراقبة تغييرات Hash
    window.addEventListener('hashchange', handleDeepLink);

    // إضافة CSS للأنيميشن
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    console.log(`📊 عدد المنشورات في الفهرس: ${allPosts.length}`);
    console.log(`📂 ملفات posts محملة مسبقاً: ${window.loadedPostsFiles.length}`);
});

function googleTranslateElementInit() {
    new google.translate.TranslateElement({ 
        pageLanguage: 'ar', 
        includedLanguages: 'en,tr', 
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE, 
        autoDisplay: false 
    }, 'google_translate_element');
}
