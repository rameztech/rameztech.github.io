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
            // إذا كان الملف محمّل بالفعل
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

    const openModal = async (postId) => {
        const postIndexData = allPosts.find(p => p.id === postId);

        if (!modal || !modalBody || !postIndexData) return;

        // تحديث الرابط عند فتح المنشور
        history.pushState(null, null, `#post/${postId}`);

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
            // تحميل ملف posts_X.js إذا لم يكن محمّلاً
            const fileName = postIndexData.file || 'posts_1.js';
            await loadPostFile(fileName);

            // الحصول على المحتوى
            const postContentData = window.postsData[postId];

            if (!postContentData) {
                modalBody.innerHTML = `
                    <h2 class="modal-title">${postIndexData.title}</h2>
                    <p style="color: #ef4444; text-align: center; padding: 40px;">
                        ❌ عذراً، محتوى هذا المنشور غير متوفر حالياً.
                    </p>
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="copyPostLink(${postId})" class="filter-btn">🔗 نسخ رابط المنشور</button>
                    </div>
                `;
            } else {
                modalBody.innerHTML = `
                    <img src="${postIndexData.cover}" alt="${postIndexData.title}" class="modal-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span class="post-category">${categoryNames[postIndexData.category] || postIndexData.category}</span>
                        <button onclick="copyPostLink(${postId})" class="filter-btn" style="font-size: 0.8em; padding: 5px 15px;">🔗 مشاركة</button>
                    </div>
                    <h2 class="modal-title">${postIndexData.title}</h2>
                    <div class="modal-body">${postContentData.content}</div>
                `;
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
            // إزالة الـ Hash من الرابط عند الإغلاق
            history.pushState(null, null, window.location.pathname + window.location.search);
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

    // وظيفة للتعامل مع الروابط المباشرة (Deep Linking)
    const handleDeepLink = () => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#post/')) {
            const postId = parseInt(hash.replace('#post/', ''), 10);
            if (!isNaN(postId)) {
                openModal(postId);
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
        // فحص الرابط عند التحميل
        handleDeepLink();
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
    try {
        new google.translate.TranslateElement({
            pageLanguage: 'ar',
            includedLanguages: 'en,tr',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');

        window.googleTranslateLoaded = true;
        console.log('✅ Google Translate تم تحميله بنجاح');
    } catch (error) {
        console.error('❌ فشل تهيئة Google Translate:', error);
        window.googleTranslateLoaded = false;
    }
}



// ========== وظائف القائمة المخصصة للترجمة ==========
function toggleDropdown() {
    var dropdown = document.getElementById("langDropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

// إغلاق القائمة عند الضغط خارجها
document.addEventListener('click', function(event) {
    if (!event.target.closest('.custom-dropdown')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            dropdowns[i].classList.remove('show');
        }
    }
});

// تغيير اللغة عبر Google Translate
function changeLanguage(lang) {
    // إغلاق القائمة
    var dropdown = document.getElementById("langDropdown");
    if (dropdown) {
        dropdown.classList.remove("show");
    }

    var maxAttempts = 10;
    var attempt = 0;

    // البحث عن عنصر select الخاص بـ Google Translate
    function tryChangeLanguage() {
        var selectElement = document.querySelector('.goog-te-combo');

        if (selectElement) {
            // وُجد العنصر - تغيير اللغة
            selectElement.value = lang;

            // استخدام طرق متعددة لتفعيل التغيير
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            selectElement.dispatchEvent(new Event('input', { bubbles: true }));

            if (typeof selectElement.onchange === 'function') {
                selectElement.onchange();
            }

            console.log('✅ تم تغيير اللغة إلى: ' + lang);
            return;
        }

        attempt += 1;

        if (attempt >= maxAttempts) {
            console.warn('⚠️ تعذر العثور على أداة Google Translate. تأكد من السماح بتحميل translate.google.com');
            alert('تعذر تحميل خدمة الترجمة حالياً. يرجى المحاولة لاحقاً أو التحقق من مانع الإعلانات.');
            return;
        }

        // العنصر غير موجود - المحاولة بعد نصف ثانية
        console.log('⏳ انتظار تحميل Google Translate...');
        setTimeout(tryChangeLanguage, 500);
    }

    tryChangeLanguage();
}
