document.addEventListener('DOMContentLoaded', () => {
    const postsGrid = document.getElementById('postsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterButtonsContainer = document.getElementById('filterButtons');
    const modal = document.getElementById('postModal');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const yearSpan = document.getElementById('year');

    window.postsData = window.postsData || {};
    window.loadedPostsFiles = window.loadedPostsFiles || [];
    
    const allPosts = window.searchIndex || [];
    let currentFilter = 'all';
    let currentPostId = null;

    const categoryNames = {
        'all': 'الكل',
        'imei': 'إصلاح IMEI',
        'frp': 'تخطي FRP',
        'tools': 'أدوات',
        'software': 'شروحات سوفتوير',
        'hardware': 'شروحات هاردوير'
    };

    const sharePost = (postId) => {
        const post = allPosts.find(p => p.id === postId);
        if (!post) return;

        const shareUrl = window.location.origin + window.location.pathname + '?post=' + postId;
        const shareText = post.title + ' - RAMEZ TECH';

        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: shareText,
                url: shareUrl
            }).catch(() => copyToClipboard(shareUrl));
        } else {
            copyToClipboard(shareUrl);
        }
    };

    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('✅ تم نسخ الرابط!');
            });
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('✅ تم نسخ الرابط!');
        }
    };

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    const loadPostFile = (fileName) => {
        return new Promise((resolve, reject) => {
            if (window.loadedPostsFiles.includes(fileName)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `database/${fileName}`;
            
            script.onload = () => {
                window.loadedPostsFiles.push(fileName);
                resolve();
            };
            
            script.onerror = () => reject(new Error(`Failed to load ${fileName}`));
            
            document.head.appendChild(script);
        });
    };

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
        currentPostId = postId;
        const postIndexData = allPosts.find(p => p.id === postId);

        if (!modal || !modalBody || !postIndexData) return;

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
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <button onclick="sharePost(${postId})" style="
                            background: #3b82f6;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 14px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            📤 مشاركة
                        </button>
                    </div>
                    <img src="${postIndexData.cover}" alt="${postIndexData.title}" class="modal-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';">
                    <span class="post-category">${categoryNames[postIndexData.category] || postIndexData.category}</span>
                    <h2 class="modal-title">${postIndexData.title}</h2>
                    <div class="modal-body">${postContentData.content}</div>
                `;
            }
        } catch (error) {
            modalBody.innerHTML = `
                <h2 class="modal-title">${postIndexData.title}</h2>
                <p style="color: #ef4444; text-align: center; padding: 40px;">
                    ❌ حدث خطأ أثناء تحميل المحتوى.
                </p>
            `;
        }
    };

    window.sharePost = sharePost;

    const closeModal = () => {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            currentPostId = null;
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

    const urlParams = new URLSearchParams(window.location.search);
    const sharedPostId = urlParams.get('post');
    if (sharedPostId) {
        setTimeout(() => openModal(parseInt(sharedPostId)), 500);
    }

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
    } else if(postsGrid) {
        postsGrid.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1 / -1;">جاري تحميل المشاركات...</p>';
    }

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
});

function googleTranslateElementInit() {
    new google.translate.TranslateElement({ 
        pageLanguage: 'ar', 
        includedLanguages: 'en,tr', 
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE, 
        autoDisplay: false 
    }, 'google_translate_element');
}
