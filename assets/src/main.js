// ============================================================
// index.js - فایل اصلی جاوااسکریپت (با Hash-based Routing)
// ============================================================

// ─── ===== وارد کردن داده‌ها ===== ───
import { topicsData } from '../json/data.js';

// ─── ===== متغیرهای وضعیت ===== ───
let currentPage = '';
let currentTopicTitle = '';
let currentTopicId = '';

// ─── ===== گرفتن المان‌های DOM ===== ───
const pageHome = document.getElementById('page-home');
const pageTopics = document.getElementById('page-topics');
const pageArticle = document.getElementById('page-article');
const topicsGrid = document.getElementById('topics-grid');
const mobileMenu = document.getElementById('mobile-menu');
const hamburger = document.getElementById('hamburger');
const toastEl = document.getElementById('toast');
const body = document.querySelector("body");
const bg_mb = document.querySelector(".allback");
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');
const downloadBtn = document.getElementById('downloadPdfBtn');

// ─── ===== شروع برنامه ===== ───
(function init() {
    if (topicsGrid) {
        renderTopics(topicsData);
    }

    window.addEventListener('hashchange', handleRoute);

    handleRoute();
    initParticles();

    if (searchInput) {
        searchInput.addEventListener('input', window.searchTopics);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                window.searchTopics();
            }
        });
    }

    if (downloadBtn) {
        downloadBtn.style.display = 'none';
    }
})();

// ─── ===== نمایش کارت‌های موضوعات ===== ───
function renderTopics(data) {
    if (!data || !data.length) {
        if (topicsGrid) {
            topicsGrid.innerHTML = '';
        }
        if (noResults) {
            noResults.classList.add('show');
        }
        return;
    }

    if (noResults) {
        noResults.classList.remove('show');
    }

    var html = '';
    for (var i = 0; i < data.length; i++) {
        var t = data[i];
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

// ─── ===== تابع جستجو ===== ───
window.searchTopics = function() {
    if (!searchInput) return;

    var query = searchInput.value.trim().toLowerCase();

    if (!query) {
        renderTopics(topicsData);
        return;
    }

    var filtered = topicsData.filter(function(topic) {
        return topic.title.toLowerCase().includes(query) ||
            topic.category.toLowerCase().includes(query) ||
            topic.summary.toLowerCase().includes(query);
    });

    renderTopics(filtered);
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
        if (searchInput) {
            searchInput.value = '';
            renderTopics(topicsData);
        }
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