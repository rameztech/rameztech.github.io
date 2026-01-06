// script.js (النسخة المصححة النهائية)
document.addEventListener('DOMContentLoaded', () => {
    const postsGrid = document.getElementById('postsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterButtonsContainer = document.getElementById('filterButtons');
    const modal = document.getElementById('postModal');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // نقرأ المتغيرات العامة مباشرة من الـ window
    const postsContent = window.postsData || {};
    const allPosts = window.searchIndex || [];
    let currentFilter = 'all';

    const createPostCard = (post) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.onclick = () => openModal(post.id);
        const categoryNames = { 'imei': 'إصلاح IMEI', 'frp': 'تخطي FRP', 'tools': 'أدوات', 'software': 'شروحات سوفتوير', 'hardware': 'شروحات هاردوير' };
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

    const renderPosts = ( ) => {
        postsGrid.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();
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

    const openModal = (postId) => {
        const postIndexData = allPosts.find(p => p.id === postId);
        const postContentData = postsContent[postId];
        if (!postIndexData) { console.error(`Post index for ID ${postId} not found.`); return; }
        if (!postContentData) {
            modalBody.innerHTML = `<h2 class="modal-title">${postIndexData.title}</h2><p>محتوى هذا المنشور غير متوفر حالياً.</p>`;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            return;
        }
        const categoryNames = { 'imei': 'إصلاح IMEI', 'frp': 'تخطي FRP', 'tools': 'أدوات', 'software': 'شروحات سوفتوير', 'hardware': 'شروحات هاردوير' };
        modalBody.innerHTML = `
            <img src="${postIndexData.cover}" alt="${postIndexData.title}" class="modal-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';">
            <span class="post-category">${categoryNames[postIndexData.category] || postIndexData.category}</span>
            <h2 class="modal-title">${postIndexData.title}</h2>
            <div class="modal-body">${postContentData.content}</div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    const closeModal = ( ) => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    const createFilterButtons = () => {
        const categories = ['all', ...new Set(allPosts.map(p => p.category))];
        const categoryNames = { 'all': 'الكل', 'imei': 'إصلاح IMEI', 'frp': 'تخطي FRP', 'tools': 'أدوات', 'software': 'شروحات سوفتوير', 'hardware': 'شروحات هاردوير' };
        filterButtonsContainer.innerHTML = categories.map(cat => `<button class="filter-btn ${cat === 'all' ? 'active' : ''}" data-category="${cat}">${categoryNames[cat] || cat}</button>`).join('');
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.category;
                renderPosts();
            });
        });
    };

    searchInput.addEventListener('input', renderPosts);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

    if (allPosts.length > 0) {
        createFilterButtons();
        renderPosts();
    } else {
        postsGrid.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1 / -1;">فشل تحميل فهرس المشاركات. يرجى التحقق من ملف search_index.js</p>';
    }
});

function googleTranslateElementInit() {
    new google.translate.TranslateElement({ pageLanguage: 'ar', includedLanguages: 'en,tr', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false }, 'google_translate_element');
}
