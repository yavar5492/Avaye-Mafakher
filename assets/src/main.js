// ============================================================
// index.js - فایل اصلی جاوااسکریپت (با Hash-based Routing)
// ============================================================

// ─── ===== وارد کردن داده‌ها ===== ───
import { topicsData } from '../json/data.js';

// ─── ===== متغیرهای وضعیت ===== ───
let currentPage = '';
let currentTopicTitle = '';

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

// ─── ===== شروع برنامه ===== ───
(function init() {
  if (topicsGrid) {
    renderTopics(topicsData);
  }

  // ===== گوش دادن به تغییرات هش =====
  window.addEventListener('hashchange', handleRoute);

  // ===== اجرای اولیه =====
  handleRoute();
  initParticles();

  // ===== رویدادهای سرچ =====
  if (searchInput) {
    searchInput.addEventListener('input', window.searchTopics);
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        window.searchTopics();
      }
    });
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
  } else if (pageName === 'article') {
    if (currentTopicTitle) {
      document.title = currentTopicTitle + ' | ' + siteName;
    } else {
      document.title = 'مقاله | ' + siteName;
    }
  } else if (pageName === 'about') {
    document.title = 'درباره ما | ' + siteName;
  }

  // ===== تغییر هش (hash) در URL =====
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

  currentTopicTitle = topic.title;

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

  // حذف # از ابتدا
  var path = hash.substring(1);

  // بررسی مسیر مقاله
  if (path.startsWith('article/')) {
    var id = path.replace('article/', '');

    // پیدا کردن موضوع
    var topic = null;
    for (var i = 0; i < topicsData.length; i++) {
      if (topicsData[i].id === id) {
        topic = topicsData[i];
        break;
      }
    }

    if (topic) {
      // صفحه موضوعات رو فعال کن بعد مقاله رو باز کن
      navigate('topics', false);
      setTimeout(function() {
        openTopic(id);
      }, 50);
    } else {
      navigate('home', false);
    }

  } else if (path === 'topics') {
    navigate('topics', false);
  } else if (path === 'about') {
    navigate('about', false);
  } else {
    navigate('home', false);
  }
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

// ─── ===== نمایش پیام (Toast) ===== ───
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');

  setTimeout(function() {
    toastEl.classList.remove('show');
  }, 3000);
}

// ─── ===== دسترسی به توابع از طریق window ===== ───
window.navigate = navigate;
window.openTopic = openTopic;
window.scrollTo = scrollTo;
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.showToast = showToast;

// ─── ===== ذرات پس‌زمینه (Particles) ===== ───
function initParticles() {
  var canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var W, H, dots;

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
      ctx.fillStyle = 'rgba(167,139,250,' + d.alpha + ')';
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
          ctx.strokeStyle = 'rgba(167,139,250,' + opacity + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  initParticlesArray();
  draw();
}