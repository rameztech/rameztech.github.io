document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Elements Selection ---
    const postsGrid = document.getElementById('postsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterButtonsContainer = document.getElementById('filterButtons');
    const modal = document.getElementById('postModal');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const yearSpan = document.getElementById('year');
    
    // متغير للتحكم في عدد المنشورات
    let displayLimit = 6; 

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
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        const filteredPosts = allPosts
            .sort((a, b) => b.id - a.id) // الترتيب من الأحدث للأقدم
            .filter(post => {
                const matchesCategory = currentFilter === 'all' || post.category === currentFilter;
                const matchesSearch = post.title.toLowerCase().includes(searchTerm) || post.excerpt.toLowerCase().includes(searchTerm);
                return matchesCategory && matchesSearch;
            });

        if (filteredPosts.length === 0) {
            postsGrid.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1 / -1;">لا توجد منشورات تطابق هذا البحث.</p>';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        } else {
            filteredPosts.slice(0, displayLimit).forEach(post => postsGrid.appendChild(createPostCard(post)));
            if (loadMoreBtn) {
                loadMoreBtn.style.display = (filteredPosts.length > displayLimit) ? 'block' : 'none';
            }
        }
    };

    const openModal = async (postId) => {
        const postIndexData = allPosts.find(p => p.id === postId);
        if (!modal || !modalBody || !postIndexData) return;

        const postUrl = window.location.origin + window.location.pathname + '#post/' + postId;
        const whatsappBtn = document.getElementById('whatsapp-link');
        if (whatsappBtn) {
            whatsappBtn.href = "https://wa.me/+905343593398?text=" + encodeURIComponent(`مرحباً، أريد الاستفسار عن هذا المنشور: ${postUrl}`);
        }

        history.pushState(null, null, `#post/${postId}`);
        modalBody.innerHTML = `<h2 class="modal-title">${postIndexData.title}</h2><p style="text-align: center; padding: 40px;">⏳ جاري تحميل المحتوى...</p>`;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        try {
            const fileName = postIndexData.file || 'posts_1.js';
            await loadPostFile(fileName);
            const postContentData = window.postsData[postId];

            if (!postContentData) {
                modalBody.innerHTML = `<h2 class="modal-title">${postIndexData.title}</h2><p style="color: #ef4444; text-align: center; padding: 40px;">❌ عذراً، محتوى هذا المنشور غير متوفر.</p>`;
            } else {
                modalBody.innerHTML = `
                    <img src="${postIndexData.cover}" alt="${postIndexData.title}" class="modal-cover">
                    <h2 class="modal-title">${postIndexData.title}</h2>
                    <div class="modal-body">${postContentData.content}</div>
                `;
            }
        } catch (error) {
            modalBody.innerHTML = `<p>حدث خطأ في التحميل.</p>`;
        }
    };

    const closeModal = () => {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            history.pushState(null, null, window.location.pathname);
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
                displayLimit = 6; // إعادة التعيين
                renderPosts();
            }
        });
    };

    // --- 5. Initialization ---
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            displayLimit += 6;
            renderPosts();
        });
    }

    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    if (searchInput) searchInput.addEventListener('input', () => { displayLimit = 6; renderPosts(); });
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    if (postsGrid) {
        postsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.post-card');
            if (card) openModal(parseInt(card.dataset.id, 10));
        });
    }

    if (allPosts.length > 0) {
        createFilterButtons();
        renderPosts();
    }
});

// وظائف خارجية
function copyPostLink(postId) {
    navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#post/' + postId);
    alert('تم نسخ الرابط!');
}

function toggleDropdown() { document.getElementById("langDropdown").classList.toggle("show"); }
