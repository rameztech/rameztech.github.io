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
    const postsContent = window.postsData || {};
    const allPosts = window.searchIndex || [];
    let currentFilter = 'all';

    // هذه الأقسام سيتم تحديثها تلقائياً بواسطة برنامج بايثون
    const categoryNames = {
        'all': 'الكل',
        'imei': 'إصلاح IMEI',
        'frp': 'تخطي FRP',
        'tools': 'أدوات',
        'software': 'شروحات سوفتوير',
        'hardware': 'شروحات هاردوير'
    };

    // --- 3. Functions ---
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

    const renderPosts = ( ) => {
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

    const openModal = (postId) => {
        const postIndexData = allPosts.find(p => p.id === postId);
        const postContentData = postsContent[postId];

        if (!modal || !modalBody || !postIndexData) return;

        if (!postContentData) {
            modalBody.innerHTML = `<h2 class="modal-title">${postIndexData.title}</h2><p>محتوى هذا المنشور غير متوفر حالياً.</p>`;
        } else {
            modalBody.innerHTML = `
                <img src="${postIndexData.cover}" alt="${postIndexData.title}" class="modal-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';">
                <span class="post-category">${categoryNames[postIndexData.category] || postIndexData.category}</span>
                <h2 class="modal-title">${postIndexData.title}</h2>
                <div class="modal-body">${postContentData.content}</div>
            `;
        }
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    const closeModal = ( ) => {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    const createFilterButtons = () => {
        if (!filterButtonsContainer) return;
        // استخراج الأقسام الفريدة الموجودة في المنشورات + الأقسام المعرفة في categoryNames
        const usedCategories = new Set(allPosts.map(p => p.category));
        const categories = ['all', ...new Set([...Object.keys(categoryNames), ...usedCategories])];
        
        filterButtonsContainer.innerHTML = categories
            .filter(cat => cat === 'all' || usedCategories.has(cat) || categoryNames[cat])
            .map(cat => 
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

    // --- 4. Event Listeners & Initialization ---
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
        window.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
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
});

function googleTranslateElementInit() {
    new google.translate.TranslateElement({ pageLanguage: 'ar', includedLanguages: 'en,tr', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false }, 'google_translate_element');
}
