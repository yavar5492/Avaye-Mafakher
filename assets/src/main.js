// ============================================================
// index.js - فایل اصلی جاوااسکریپت (با Hash-based Routing)
// ============================================================

// ─── ===== وارد کردن داده‌ها ===== ───
import { topicsData } from '../json/data.js';

// ─── ===== متغیرهای وضعیت ===== ───
let currentPage = '';
let currentTopicTitle = '';
let currentTopicId = '';
let selectedCategory = '';
let allTopicsData = [];

// ─── ===== گرفتن المان‌های DOM ===== ───
const pageHome = document.getElementById('page-home');
const pageTopics = document.getElementById('page-topics');
const pageArticle = document.getElementById('page-article');
const mobileMenu = document.getElementById('mobile-menu');
const hamburger = document.getElementById('hamburger');
const toastEl = document.getElementById('toast');
const body = document.querySelector("body");
const bg_mb = document.querySelector(".allback");
const downloadBtn = document.getElementById('downloadPdfBtn');

const categoriesGrid = document.getElementById('categoriesGrid');
const topicsContainer = document.getElementById('topicsContainer');
const topicsGrid = document.getElementById('topicsGrid');
const selectedCategoryTitle = document.getElementById('selectedCategoryTitle');
const noResults = document.getElementById('noResults');
const categorySearchInput = document.getElementById('categorySearchInput');
const topicSearchInput = document.getElementById('topicSearchInput');
const globalSearchContainer = document.getElementById('globalSearchContainer');
const categorySearchContainer = document.getElementById('categorySearchContainer');

// ─── ===== شروع برنامه ===== ───
(function init() {
    allTopicsData = topicsData;

    renderCategories(allTopicsData);

    window.addEventListener('hashchange', handleRoute);

    handleRoute();
    initParticles();

    if (downloadBtn) {
        downloadBtn.style.display = 'none';
    }

    if (categorySearchInput) {
        categorySearchInput.addEventListener('input', function(e) {
            window.searchAllTopics();
        });
        categorySearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                window.searchAllTopics();
            }
        });
    }

    if (topicSearchInput) {
        topicSearchInput.addEventListener('input', function(e) {
            window.searchTopicsInCategory();
        });
        topicSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                window.searchTopicsInCategory();
            }
        });
    }
})();

// ─── ===== دریافت دسته‌بندی‌های منحصر به فرد ===== ───
function getUniqueCategories(data) {
    const categories = [];
    for (var i = 0; i < data.length; i++) {
        if (!categories.includes(data[i].category)) {
            categories.push(data[i].category);
        }
    }
    return categories;
}

// ─── ===== دریافت آیکون هر دسته‌بندی ===== ───
function getCategoryIcon(category) {
    var iconMap = {
        'تاریخ ایران': '🏛️',
        'دانشمندان': '🔬',
        'مخترعان': '💡',
        'کارآفرینان و فناوری': '🚀',
        'رهبران و فعالان': '✊',
        'فرمانروایان و ژنرال‌ها': '⚔️',
        'فرمانروایان و ملکه‌ها': '👑',
        'هنرمندان': '🎨',
        'شاعران و ادیبان': '📜'
    };
    return iconMap[category] || '📁';
}

// ─── ===== رندر دسته‌بندی‌ها (کارت‌ها) ===== ───
function renderCategories(data) {
    var categories = getUniqueCategories(data);

    if (categories.length === 0) {
        categoriesGrid.innerHTML = `<div class="no-results show" style="grid-column:1/-1;">
            <span>📂</span>
            <p>هیچ دسته‌بندی یافت نشد.</p>
        </div>`;
        return;
    }

    var html = '';
    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        var count = 0;
        for (var j = 0; j < data.length; j++) {
            if (data[j].category === cat) count++;
        }

        var icon = getCategoryIcon(cat);

        html += `
            <div class="glass-card category-card" onclick="window.selectCategory('${cat}')" tabindex="0"
                 onkeydown="if(event.key==='Enter')window.selectCategory('${cat}')">
                <span class="category-icon">${icon}</span>
                <h3>${cat}</h3>
                <span class="category-item-count">${count} موضوع</span>
            </div>
        `;
    }
    categoriesGrid.innerHTML = html;
}

// ─── ===== جستجوی عمومی در همه موضوعات ===== ───
window.searchAllTopics = function() {
    if (!categorySearchInput) return;

    var query = categorySearchInput.value.trim().toLowerCase();

    var oldResults = document.querySelector('.search-results-list');
    if (oldResults) {
        oldResults.remove();
    }
    var oldNoResults = document.querySelector('.search-no-results');
    if (oldNoResults) {
        oldNoResults.remove();
    }

    if (!query) {
        categoriesGrid.style.display = 'grid';
        topicsContainer.style.display = 'none';
        if (globalSearchContainer) {
            globalSearchContainer.style.display = 'flex';
        }
        if (categorySearchContainer) {
            categorySearchContainer.style.display = 'none';
        }
        if (topicSearchInput) {
            topicSearchInput.value = '';
        }
        noResults.classList.remove('show');
        renderCategories(allTopicsData);
        return;
    }

    var filtered = [];
    for (var i = 0; i < allTopicsData.length; i++) {
        var topic = allTopicsData[i];
        if (topic.title.toLowerCase().includes(query) ||
            topic.category.toLowerCase().includes(query) ||
            topic.summary.toLowerCase().includes(query)) {
            filtered.push(topic);
        }
    }

    categoriesGrid.style.display = 'none';
    topicsContainer.style.display = 'none';
    if (globalSearchContainer) {
        globalSearchContainer.style.display = 'flex';
    }
    if (categorySearchContainer) {
        categorySearchContainer.style.display = 'none';
    }

    var resultsDiv = document.createElement('div');
    resultsDiv.className = 'search-results-list';
    resultsDiv.style.cssText = `
        margin: 20px 0 30px;
        padding: 20px;
        background: var(--glass-bg);
        border-radius: var(--radius);
        border: 1px solid var(--border);
    `;

    if (filtered.length === 0) {
        resultsDiv.innerHTML = `
            <div class="search-no-results" style="text-align:center;padding:40px 20px;color:var(--text-muted);">
                <span style="font-size:2.5rem;display:block;margin-bottom:12px;"><img width="50px" src="assets/icon/Search.png" alt=""></span>
                <p style="font-size:1.05rem;">هیچ موضوعی با جستجوی شما یافت نشد.</p>
            </div>
        `;
        var oldResults2 = document.querySelector('.search-results-list');
        if (oldResults2) oldResults2.remove();

        var searchContainer = document.querySelector('.category-search-container');
        if (searchContainer) {
            searchContainer.parentNode.insertBefore(resultsDiv, searchContainer.nextSibling);
        }
        return;
    }

    var html = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid var(--border);">
            <h3 style="font-size:1.1rem;font-weight:700;color:var(--primary);">نتایج جستجو</h3>
            <span style="font-size:0.85rem;color:var(--text-muted);background:var(--surface);padding:2px 14px;border-radius:20px;">${filtered.length} مورد</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">
    `;

    for (var j = 0; j < filtered.length; j++) {
        var t = filtered[j];
        html += `
            <div class="glass-card topic-card" onclick="window.openTopic('${t.id}')" tabindex="0"
                 onkeydown="if(event.key==='Enter')window.openTopic('${t.id}')" style="cursor:pointer;">
                <span class="topic-tag">${t.category}</span>
                <h3 style="font-size:1.1rem;font-weight:700;line-height:1.4;color:var(--text);">${t.title}</h3>
                <p style="color:var(--text-muted);font-size:0.9rem;flex:1;">${t.summary}</p>
                <div class="topic-footer" style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;border-top:1px solid var(--border);padding-top:10px;">
                    <span class="topic-meta" style="font-size:0.75rem;color:var(--text-muted);display:flex;align-items:end;"> ${t.date} &nbsp;·&nbsp;<img width="17px" src="assets/icon/Calendar.png" alt=""></span>
                </div>
            </div>
        `;
    }

    html += `</div>`;
    resultsDiv.innerHTML = html;

    var oldResults3 = document.querySelector('.search-results-list');
    if (oldResults3) oldResults3.remove();

    var searchContainer2 = document.querySelector('.category-search-container');
    if (searchContainer2) {
        searchContainer2.parentNode.insertBefore(resultsDiv, searchContainer2.nextSibling);
    }
};

// ─── ===== انتخاب دسته‌بندی ===== ───
window.selectCategory = function(category) {
    selectedCategory = category;

    var oldResults = document.querySelector('.search-results-list');
    if (oldResults) oldResults.remove();

    categoriesGrid.style.display = 'none';
    topicsContainer.style.display = 'block';

    if (globalSearchContainer) {
        globalSearchContainer.style.display = 'none';
    }
    if (categorySearchContainer) {
        categorySearchContainer.style.display = 'flex';
    }

    selectedCategoryTitle.textContent = category;

    if (categorySearchInput) {
        categorySearchInput.value = '';
    }

    if (topicSearchInput) {
        topicSearchInput.value = '';
    }

    renderTopicsByCategory(category);
};

// ─── ===== نمایش دوباره دسته‌بندی‌ها ===== ───
window.showCategories = function() {
    var oldResults = document.querySelector('.search-results-list');
    if (oldResults) oldResults.remove();

    selectedCategory = '';
    topicsContainer.style.display = 'none';
    categoriesGrid.style.display = 'grid';

    if (globalSearchContainer) {
        globalSearchContainer.style.display = 'flex';
    }
    if (categorySearchContainer) {
        categorySearchContainer.style.display = 'none';
    }

    if (topicSearchInput) {
        topicSearchInput.value = '';
    }

    if (categorySearchInput) {
        categorySearchInput.value = '';
    }

    noResults.classList.remove('show');
    renderCategories(allTopicsData);
};

// ─── ===== رندر موضوعات بر اساس دسته‌بندی ===== ───
function renderTopicsByCategory(category) {
    var items = [];
    for (var i = 0; i < allTopicsData.length; i++) {
        if (allTopicsData[i].category === category) {
            items.push(allTopicsData[i]);
        }
    }

    if (items.length === 0) {
        topicsGrid.innerHTML = '';
        noResults.classList.add('show');
        noResults.querySelector('p').textContent = 'هیچ موضوعی در این دسته‌بندی یافت نشد.';
        return;
    }

    noResults.classList.remove('show');

    var html = '';
    for (var j = 0; j < items.length; j++) {
        var t = items[j];
        html += `
            <div class="glass-card topic-card" onclick="window.openTopic('${t.id}')" tabindex="0"
                 onkeydown="if(event.key==='Enter')window.openTopic('${t.id}')">
                <span class="topic-tag">${t.category}</span>
                <h3>${t.title}</h3>
                <p>${t.summary}</p>
                <div class="topic-footer">
                    <span class="topic-meta"> ${t.date} &nbsp;·&nbsp;<img width="17px" src="assets/icon/Calendar.png" alt=""></span>
                </div>
            </div>
        `;
    }
    topicsGrid.innerHTML = html;
}

// ─── ===== جستجوی موضوعات داخل دسته ===== ───
window.searchTopicsInCategory = function() {
    if (!topicSearchInput || !selectedCategory) return;

    var query = topicSearchInput.value.trim().toLowerCase();

    var items = [];
    for (var i = 0; i < allTopicsData.length; i++) {
        if (allTopicsData[i].category === selectedCategory) {
            items.push(allTopicsData[i]);
        }
    }

    if (!query) {
        renderTopicsByCategory(selectedCategory);
        return;
    }

    var filtered = [];
    for (var j = 0; j < items.length; j++) {
        if (items[j].title.toLowerCase().includes(query) ||
            items[j].summary.toLowerCase().includes(query)) {
            filtered.push(items[j]);
        }
    }

    if (filtered.length === 0) {
        topicsGrid.innerHTML = '';
        noResults.classList.add('show');
        noResults.querySelector('p').textContent = 'هیچ موضوعی با جستجوی شما در این دسته یافت نشد.';
        return;
    }

    noResults.classList.remove('show');

    var html = '';
    for (var k = 0; k < filtered.length; k++) {
        var t = filtered[k];
        html += `
            <div class="glass-card topic-card" onclick="window.openTopic('${t.id}')" tabindex="0"
                 onkeydown="if(event.key==='Enter')window.openTopic('${t.id}')">
                <span class="topic-tag">${t.category}</span>
                <h3>${t.title}</h3>
                <p>${t.summary}</p>
                <div class="topic-footer">
                    <span class="topic-meta"> ${t.date} &nbsp;·&nbsp;<img width="17px" src="assets/icon/Calendar.png" alt=""></span>
                </div>
            </div>
        `;
    }
    topicsGrid.innerHTML = html;
};

// ─── ===== اسکرول به بالا ===== ───
function scrollToTop() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

// ─── ===== تغییر صفحه ===== ───
function navigate(pageName, pushState, extraData) {
    if (pushState === undefined) pushState = true;

    var allPages = document.querySelectorAll('.page');
    for (var i = 0; i < allPages.length; i++) {
        allPages[i].classList.remove('active');
    }
    var target = document.getElementById('page-' + pageName);
    if (target) {
        target.classList.add('active');
    }

    scrollToTop();

    var navLinks = document.querySelectorAll('.nav-links a');
    for (var j = 0; j < navLinks.length; j++) {
        navLinks[j].classList.remove('active');
    }

    var navEl = document.getElementById('nav-' + pageName);
    if (navEl) {
        navEl.classList.add('active');
    }

    currentPage = pageName;

    const siteName = 'آوای مفاخر';
    if (pageName === 'home') {
        document.title = siteName;
    } else if (pageName === 'topics') {
        document.title = 'موضوعات | ' + siteName;
        var oldResults = document.querySelector('.search-results-list');
        if (oldResults) oldResults.remove();

        categoriesGrid.style.display = 'grid';
        topicsContainer.style.display = 'none';

        if (globalSearchContainer) {
            globalSearchContainer.style.display = 'flex';
        }
        if (categorySearchContainer) {
            categorySearchContainer.style.display = 'none';
        }

        if (categorySearchInput) {
            categorySearchInput.value = '';
        }
        if (topicSearchInput) {
            topicSearchInput.value = '';
        }
        noResults.classList.remove('show');
        renderCategories(allTopicsData);
        if (downloadBtn) {
            downloadBtn.style.display = 'none';
        }
    } else if (pageName === 'article') {
        if (currentTopicTitle) {
            document.title = currentTopicTitle + ' | ' + siteName;
        } else {
            document.title = 'مقاله | ' + siteName;
        }
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-flex';
        }
    } else if (pageName === 'about') {
        document.title = 'درباره ما | ' + siteName;
        if (downloadBtn) {
            downloadBtn.style.display = 'none';
        }
    }

    if (pushState) {
        var hash = '';
        if (pageName === 'home') {
            hash = '#home';
        } else if (pageName === 'topics') {
            hash = '#topics';
        } else if (pageName === 'article') {
            hash = '#article/' + extraData;
        } else if (pageName === 'about') {
            hash = '#about';
        }

        if (hash && window.location.hash !== hash) {
            history.pushState({ page: pageName, extra: extraData }, '', hash);
        }
    }
}

// ─── ===== باز کردن مقاله ===== ───
function openTopic(id) {
    var topic = null;
    for (var i = 0; i < topicsData.length; i++) {
        if (topicsData[i].id === id) {
            topic = topicsData[i];
            break;
        }
    }

    if (!topic) return;

    currentTopicTitle = topic.tab || topic.title;
    currentTopicId = topic.id;

    document.getElementById('article-tag').textContent = topic.category;
    document.getElementById('article-title').textContent = topic.title;
    document.getElementById('article-date').innerHTML = '<img class="article-meta-img" width="17px" src="assets/icon/Calendar.png" alt=""> ' + topic.date;
    document.getElementById('article-author').innerHTML = '<img class="article-meta-img" width="17px" src="assets/icon/Edit.png" alt=""> ' + topic.author;

    var html = '';
    html += '<h3>' + topic.title + '</h3>';
    html += '<p>' + topic.body + '</p>';
    document.getElementById('article-body').innerHTML = html;

    navigate('article', true, id);

    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
    setTimeout(scrollToTop, 300);
    setTimeout(scrollToTop, 500);
}


// ─── ===== مدیریت مسیرها (Routing) با هش ===== ───
function handleRoute() {
    var hash = window.location.hash || '#home';

    var path = hash.substring(1);

    if (path === 'about') {
        navigate('about', false);
        return;
    }

    if (path.startsWith('article/')) {
        var id = path.replace('article/', '');

        var topic = null;
        for (var i = 0; i < topicsData.length; i++) {
            if (topicsData[i].id === id) {
                topic = topicsData[i];
                break;
            }
        }

        if (topic) {
            navigate('topics', false);
            setTimeout(function() {
                openTopic(id);
            }, 50);
        } else {
            navigate('home', false);
        }
        return;
    }

    if (path === 'topics') {
        navigate('topics', false);
        return;
    }

    navigate('home', false);
}

// ─── ===== اسکرول به بخش مورد نظر ===== ───
function scrollTo(id) {
    setTimeout(function() {
        var el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

// ─── ===== منوی موبایل ===== ───
function toggleMenu() {
    if (mobileMenu) {
        mobileMenu.classList.toggle('open');
    }
    if (hamburger) {
        hamburger.classList.toggle('open');
    }
    if (body) {
        body.classList.toggle('bodylock');
    }
    if (bg_mb) {
        bg_mb.classList.toggle('display');
    }
}

function closeMenu() {
    if (mobileMenu) {
        mobileMenu.classList.remove('open');
    }
    if (hamburger) {
        hamburger.classList.remove('open');
    }
    if (body) {
        body.classList.remove('bodylock');
    }
    if (bg_mb) {
        bg_mb.classList.remove('display');
    }
}

if (bg_mb) {
    bg_mb.addEventListener('click', () =>{
        if (mobileMenu) {
            mobileMenu.classList.remove('open');
        }
        if (hamburger) {
            hamburger.classList.remove('open');
        }
        if (body) {
            body.classList.remove('bodylock');
        }
        if (bg_mb) {
            bg_mb.classList.remove('display');
        }
    });
}

// ─── ===== نمایش پیام (Toast) ===== ───
function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');

    setTimeout(function() {
        toastEl.classList.remove('show');
    }, 3000);
}

// ─── ===== دانلود PDF با html2canvas ===== ───
window.downloadArticlePdf = function() {
    var topic = null;
    for (var i = 0; i < topicsData.length; i++) {
        if (topicsData[i].id === currentTopicId) {
            topic = topicsData[i];
            break;
        }
    }

    if (!topic) {
        showToast('❌ خطا: مقاله پیدا نشد');
        return;
    }

    if (typeof html2canvas === 'undefined') {
        showToast('⏳ در حال بارگذاری... لطفاً دوباره کلیک کنید');
        return;
    }

    if (typeof window.jspdf === 'undefined') {
        showToast('⏳ در حال بارگذاری... لطفاً دوباره کلیک کنید');
        return;
    }

    try {
        showToast('⏳ در حال آماده‌سازی PDF...');

        var tempDiv = document.createElement('div');
        tempDiv.style.cssText = `
            position: fixed;
            top: -9999px;
            right: -9999px;
            width: 800px;
            padding: 40px;
            background: #ffffff;
            color: #1a1726;
            font-family: 'Vazirmatn', sans-serif;
            direction: rtl;
            line-height: 2;
            z-index: 9999;
        `;

        tempDiv.innerHTML = `
            <div style="text-align:center;margin-bottom:20px;">
                <h1 style="color:#7c3aed;font-size:28px;font-weight:900;margin:0;">${topic.title}</h1>
                <hr style="border:2px solid #7c3aed;width:60%;margin:16px auto;">
            </div>
            <div style="display:flex;gap:30px;margin-bottom:20px;font-size:14px;color:#555;flex-wrap:wrap;justify-content:center;">
                <div>نویسنده: ${topic.author}</div>
                <div>تاریخ: ${topic.date}</div>
                <div>دسته‌بندی: ${topic.category}</div>
            </div>
            <div style="font-size:16px;color:#333;line-height:2.2;margin-top:10px;">
                ${topic.body.replace(/\n/g, '<br>')}
            </div>
        `;

        document.body.appendChild(tempDiv);

        html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: 800,
            height: tempDiv.scrollHeight
        }).then(function(canvas) {
            document.body.removeChild(tempDiv);

            var imgData = canvas.toDataURL('image/jpeg', 0.95);
            var { jsPDF } = window.jspdf;
            var doc = new jsPDF('p', 'mm', 'a4');
            var pdfWidth = doc.internal.pageSize.getWidth();
            var pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            doc.save(topic.tab + '.pdf');

            showToast('✅ دانلود با موفقیت انجام شد');
        }).catch(function(err) {
            document.body.removeChild(tempDiv);
            console.error('html2canvas Error:', err);
            showToast('❌ خطا در ساخت PDF: ' + err.message);
        });

    } catch (error) {
        console.error('PDF Error:', error);
        showToast('❌ خطا: ' + error.message);
    }
};

// ─── ===== دسترسی به توابع از طریق window ===== ───
window.navigate = navigate;
window.openTopic = openTopic;
window.scrollTo = scrollTo;
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.showToast = showToast;
window.downloadArticlePdf = downloadArticlePdf;
window.selectCategory = selectCategory;
window.showCategories = showCategories;
window.searchAllTopics = searchAllTopics;
window.searchTopicsInCategory = searchTopicsInCategory;

// ─── ===== ذرات پس‌زمینه (Particles) ===== ───
function initParticles() {
    var canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H, dots;
    var particleRGB = { r: 167, g: 139, b: 250 };
    var targetRGB = { r: 167, g: 139, b: 250 };

    function readParticleColor() {
        var raw = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim();
        var parts = raw.split(',');
        return {
            r: parseInt(parts[0], 10),
            g: parseInt(parts[1], 10),
            b: parseInt(parts[2], 10)
        };
    }

    function lerpChannel(from, to, amount) {
        return Math.round(from + (to - from) * amount);
    }

    function syncParticleTarget() {
        targetRGB = readParticleColor();
    }

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function makeDot() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.8 + 0.4,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.5 + 0.15
        };
    }

    function initParticlesArray() {
        resize();
        dots = [];
        for (var i = 0; i < 90; i++) {
            dots.push(makeDot());
        }
    }

    function draw() {
        particleRGB.r = lerpChannel(particleRGB.r, targetRGB.r, 0.08);
        particleRGB.g = lerpChannel(particleRGB.g, targetRGB.g, 0.08);
        particleRGB.b = lerpChannel(particleRGB.b, targetRGB.b, 0.08);

        var colorBase = particleRGB.r + ',' + particleRGB.g + ',' + particleRGB.b;

        ctx.clearRect(0, 0, W, H);

        for (var i = 0; i < dots.length; i++) {
            var d = dots[i];
            d.x += d.vx;
            d.y += d.vy;

            if (d.x < 0) d.x = W;
            if (d.x > W) d.x = 0;
            if (d.y < 0) d.y = H;
            if (d.y > H) d.y = 0;

            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + colorBase + ',' + d.alpha + ')';
            ctx.fill();
        }

        for (var j = 0; j < dots.length; j++) {
            for (var k = j + 1; k < dots.length; k++) {
                var dx = dots[j].x - dots[k].x;
                var dy = dots[j].y - dots[k].y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(dots[j].x, dots[j].y);
                    ctx.lineTo(dots[k].x, dots[k].y);
                    var opacity = 0.12 * (1 - dist / 100);
                    ctx.strokeStyle = 'rgba(' + colorBase + ',' + opacity + ')';
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    syncParticleTarget();
    window.addEventListener('themechange', syncParticleTarget);
    window.addEventListener('resize', resize);
    initParticlesArray();
    draw();
}

// ============================================================
// theme.js — مدیریت دارک/لایت مود
// ============================================================

const THEME_KEY = 'theme';
const TRANSITION_MS = 450;
let transitionTimer = null;

function getTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function startThemeTransition() {
    if (prefersReducedMotion()) return;

    document.documentElement.classList.add('theme-transition');

    if (transitionTimer) clearTimeout(transitionTimer);

    transitionTimer = setTimeout(function () {
        document.documentElement.classList.remove('theme-transition');
        transitionTimer = null;
    }, TRANSITION_MS);
}

function updateThemeUI(theme) {
    var isDark = theme === 'dark';
    var label = isDark ? 'فعال‌سازی حالت روشن' : 'فعال‌سازی حالت تاریک';
    var mobileLabel = isDark ? 'حالت روشن' : 'حالت تاریک';

    var btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.setAttribute('aria-label', label);
        btn.setAttribute('title', label);
    }

    var mobileBtn = document.getElementById('theme-toggle-mobile');
    if (mobileBtn) {
        mobileBtn.setAttribute('aria-label', label);
        mobileBtn.setAttribute('title', label);
        var textEl = mobileBtn.querySelector('.theme-toggle-label');
        if (textEl) textEl.textContent = mobileLabel;
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
        meta.setAttribute('content', isDark ? '#0b0a14' : '#f5f4fa');
    }
}

function setTheme(theme, animate) {
    if (animate !== false) {
        startThemeTransition();
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeUI(theme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
}

function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark', true);
}

function initTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    var theme = saved === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeUI(theme);
}

window.toggleTheme = toggleTheme;

function bootTheme() {
    initTheme();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootTheme);
} else {
    bootTheme();
}