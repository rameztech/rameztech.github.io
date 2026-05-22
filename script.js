document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Elements Selection ---
    const postsGrid = document.getElementById('postsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterButtonsContainer = document.getElementById('filterButtons');
    const modal = document.getElementById('postModal');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const yearSpan = document.getElementById('year');
    let displayLimit = 6; 

    // --- 2. Data Initialization ---
    window.postsData = window.postsData || {};
    window.loadedPostsFiles = window.loadedPostsFiles || [];
    const allPosts = window.searchIndex || [];
    let currentFilter = 'all';

    const categoryNames = {
        'all': 'الكل', 'frp': 'تخطي FRP', 'hardware': 'شروحات هاردوير',
        'imei': 'إصلاح IMEI', 'software': 'شروحات سوفتوير', 'tools': 'أدوات',
    };

    const loadPostFile = (fileName) => {
        return new Promise((resolve, reject) => {
            if (window.loadedPostsFiles.includes(fileName)) { resolve(); return; }
            const script = document.createElement('script');
            script.src = `database/${fileName}`;
            script.onload = () => { window.loadedPostsFiles.push(fileName); resolve(); };
            script.onerror = () => reject();
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
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        const filteredPosts = allPosts.sort((a, b) => b.id - a.id).filter(post => {
            const matchesCategory = currentFilter === 'all' || post.category === currentFilter;
            const matchesSearch = post.title.toLowerCase().includes(searchTerm) || post.excerpt.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        if (filteredPosts.length === 0) {
            postsGrid.innerHTML = '<p style="text-align: center;">لا توجد منشورات.</p>';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        } else {
            filteredPosts.slice(0, displayLimit).forEach(post => postsGrid.appendChild(createPostCard(post)));
            if (loadMoreBtn) loadMoreBtn.style.display = (filteredPosts.length > displayLimit) ? 'block' : 'none';
        }
    };

    const openModal = async (postId) => {
        const postIndexData = allPosts.find(p => p.id === postId);
        if (!modal || !modalBody || !postIndexData) return;

        // تحديث الرابط والواتس
        const postUrl = window.location.origin + window.location.pathname + '#post/' + postId;
        const whatsappBtn = document.getElementById('whatsapp-link');
        if (whatsappBtn) whatsappBtn.href = "https://wa.me/+905343593398?text=" + encodeURIComponent(`استفسار عن المنشور: ${postUrl}`);

        history.pushState(null, null, `#post/${postId}`);
        modalBody.innerHTML = `<h2 class="modal-title">${postIndexData.title}</h2><p style="text-align: center;">⏳ جاري التحميل...</p>`;
        modal.style.display = 'block';

        try {
            await loadPostFile(postIndexData.file || 'posts_1.js');
            const postContentData = window.postsData[postId];
            modalBody.innerHTML = `
                <img src="${postIndexData.cover}" class="modal-cover">
                <div style="text-align: left; margin: 10px 0;"><button onclick="copyPostLink(${postId})" class="filter-btn">🔗 مشاركة</button></div>
                <h2 class="modal-title">${postIndexData.title}</h2>
                <div class="modal-body">${postContentData ? postContentData.content : 'خطأ في تحميل المحتوى'}</div>
            `;
        } catch (e) { modalBody.innerHTML = `<p>حدث خطأ.</p>`; }
    };

    const handleDeepLink = () => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#post/')) {
            const postId = parseInt(hash.replace('#post/', ''), 10);
            if (!isNaN(postId)) openModal(postId);
        }
    };

    // --- Event Listeners ---
    document.getElementById('loadMoreBtn')?.addEventListener('click', () => { displayLimit += 6; renderPosts(); });
    window.addEventListener('hashchange', handleDeepLink);
    
    // تشغيل عند التحميل
    if (allPosts.length > 0) {
        renderPosts();
        handleDeepLink(); // هذا السطر يحل مشكلة الرابط
    }
});

function copyPostLink(postId) {
    const url = window.location.origin + window.location.pathname + '#post/' + postId;
    navigator.clipboard.writeText(url).then(() => alert('تم نسخ الرابط!'));
}
