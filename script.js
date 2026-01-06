// script.js
document.addEventListener('DOMContentLoaded', () => {
    const postsGrid = document.getElementById('postsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterButtonsContainer = document.getElementById('filterButtons');
    const modal = document.getElementById('postModal');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');

    let allPosts = [];
    let postsContent = typeof postsData !== 'undefined' ? postsData : {};
    let currentFilter = 'all';

    // دمج الفهرس مع المحتوى الأولي المحمل
    if (typeof searchIndex !== 'undefined') {
        allPosts = searchIndex;
    }

    // دالة لرسم بطاقة المنشور
    const createPostCard = (post) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.onclick = () => openModal(post.id);

        const categoryNames = { 'imei': 'إصلاح IMEI', 'frp': 'تخطي FRP', 'tools': 'أدوات', 'software': 'شروحات سوفتوير', 'hardware': 'شروحات هاردوير' };

        card.innerHTML = `
            <img src="${post.cover}" alt="${post.title}" class="post-cover">
            <div class="post-content">
                <span class="post-category">${categoryNames[post.category] || post.category}</span>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
            </div>
        `;
        return card;
    };

    // دالة لعرض المشاركات
    const renderPosts = () => {
        postsGrid.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();

        const filteredPosts = allPosts.filter(post => {
            const matchesCategory = currentFilter === 'all' || post.category === currentFilter;
            const matchesSearch = post.title.toLowerCase().includes(searchTerm) || post.excerpt.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        filteredPosts.forEach(post => {
            postsGrid.appendChild(createPostCard(post));
        });
    };

    // دالة لفتح النافذة المنبثقة
    const openModal = (postId) => {
        const postIndex = allPosts.find(p => p.id === postId);
        const postContent = postsContent[postId];

        if (!postIndex || !postContent) {
            // هنا يمكنك إضافة منطق لتحميل ملف JS المناسب إذا لم يكن المحتوى موجوداً
            console.error(`Post content for ID ${postId} not found.`);
            return;
        }
        
        const categoryNames = { 'imei': 'إصلاح IMEI', 'frp': 'تخطي FRP', 'tools': 'أدوات', 'software': 'شروحات سوفتوير', 'hardware': 'شروحات هاردوير' };

        modalBody.innerHTML = `
            <img src="${postIndex.cover}" alt="${postIndex.title}" class="modal-cover">
            <span class="post-category">${categoryNames[postIndex.category] || postIndex.category}</span>
            <h2 class="modal-title">${postIndex.title}</h2>
            <div class="modal-body">${postContent.content}</div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    // دالة لإغلاق النافذة
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    // إنشاء أزرار الفلترة
    const createFilterButtons = () => {
        const categories = ['all', ...new Set(allPosts.map(p => p.category))];
        const categoryNames = { 'all': 'الكل', 'imei': 'إصلاح IMEI', 'frp': 'تخطي FRP', 'tools': 'أدوات', 'software': 'شروحات سوفتوير', 'hardware': 'شروحات هاردوير' };

        filterButtonsContainer.innerHTML = categories.map(cat => `
            <button class="filter-btn ${cat === 'all' ? 'active' : ''}" data-category="${cat}">${categoryNames[cat] || cat}</button>
        `).join('');

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.category;
                renderPosts();
            });
        });
    };

    // ربط الأحداث
    searchInput.addEventListener('input', renderPosts);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // التهيئة الأولية
    createFilterButtons();
    renderPosts();
});

// دالة ترجمة جوجل
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'ar',
        includedLanguages: 'en,tr',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}
