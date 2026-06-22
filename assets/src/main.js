// ============================================================
// index.js - فایل اصلی جاوااسکریپت
// ============================================================

// ─── ===== وارد کردن داده‌ها ===== ───
import { topicsData } from '../json/data.js';

// ─── ===== متغیرهای وضعیت ===== ───
let currentPage = '';
let currentTopicTitle = ''; // برای ذخیره عنوان مقاله فعلی
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
// ─── ===== شروع برنامه ===== ───
(function init() {
  // فقط اگر صفحه اصلی هست (topics وجود داره) رندر کن
  if (topicsGrid) {
    renderTopics();
  }
  handleRoute();
  window.addEventListener('popstate', handleRoute);
  initParticles();
})();

// ─── ===== نمایش کارت‌های موضوعات ===== ───
function renderTopics() {
  if (!topicsData || !topicsData.length) return;

  var html = '';
  for (var i = 0; i < topicsData.length; i++) {
    var t = topicsData[i];
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

// ─── ===== تغییر صفحه ===== ───
function navigate(pageName, pushState) {
  if (pushState === undefined) pushState = true;

  var allPages = document.querySelectorAll('.page');
  for (var i = 0; i < allPages.length; i++) {
    allPages[i].classList.remove('active');
  }
  var target = document.getElementById('page-' + pageName);
  if (target) {
    target.classList.add('active');
  }

  window.scrollTo(0, 0);

  var navLinks = document.querySelectorAll('.nav-links a');
  for (var j = 0; j < navLinks.length; j++) {
    navLinks[j].classList.remove('active');
  }

  var navEl = document.getElementById('nav-' + pageName);
  if (navEl) {
    navEl.classList.add('active');
  }

  currentPage = pageName;

  // ===== تغییر تایتل بر اساس صفحه =====
  const siteName = 'آوای مفاخر';
  if (pageName === 'home') {
    document.title = siteName;
  } else if (pageName === 'topics') {
    document.title = 'موضوعات | ' + siteName;
  } else if (pageName === 'article') {
    // اگر عنوان مقاله ذخیره شده، از آن استفاده کن
    if (currentTopicTitle) {
      document.title = currentTopicTitle + ' | ' + siteName;
    } else {
      document.title = 'مقاله | ' + siteName;
    }
  } else if (pageName === 'about') {
    document.title = 'درباره ما | ' + siteName;
  }

  if (pushState) {
    var url = (pageName === 'home') ? '/' : '/' + pageName;
    history.pushState({ page: pageName }, '', url);
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

  // ذخیره عنوان مقاله برای استفاده در تابع navigate
  currentTopicTitle = topic.title;

  document.getElementById('article-tag').textContent = topic.category;
  document.getElementById('article-title').textContent = topic.title;
  document.getElementById('article-date').innerHTML = '<img class="article-meta-img" width="17px" src="assets/icon/Calendar.png" alt=""> ' + topic.date;
  document.getElementById('article-author').innerHTML = '<img class="article-meta-img" width="17px" src="../assets/icon/Edit.png" alt=""> ' + topic.author;

  // ─── پردازش محتوای مقاله (فقط h3 + p) ───
  var html = '';
  html += '<h3>' + topic.title + '</h3>';
  html += '<p>' + topic.body + '</p>';
  document.getElementById('article-body').innerHTML = html;

  navigate('article', false);
  history.pushState({ page: 'article', id: id }, '', '/topic/' + id);
}


// ─── ===== مدیریت مسیرها (Routing) ===== ───
function handleRoute() {
  var path = location.pathname;

  // برای صفحه about
  if (path.includes('/about') || path.endsWith('about.html')) {
    navigate('about', false);
    return;
  }

  if (path.startsWith('/topic/')) {
    var id = path.replace('/topic/', '');
    navigate('topics', false);

    setTimeout(function() {
      var topic = null;
      for (var i = 0; i < topicsData.length; i++) {
        if (topicsData[i].id === id) {
          topic = topicsData[i];
          break;
        }
      }
      if (topic) {
        openTopic(id);
      }
    }, 50);

  } else if (path.startsWith('/topics')) {
    navigate('topics', false);
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
})
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