// ─────────── 导航滚动 ───────────
const nav = document.getElementById('navbar');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ─────────── 液态扭曲 + 鼠标光晕 ───────────
const hero = document.getElementById('hero');
const heroName = document.getElementById('heroName');
const cursorGlow = document.getElementById('cursorGlow');
const dispFilter = document.getElementById('disp');
const turbFilter = document.getElementById('turb');

if (hero && heroName && dispFilter) {
  let currentScale = 0;
  let targetScale = 0;
  let mouseInName = false;
  let turbSeed = 2;

  const heroRect = () => hero.getBoundingClientRect();
  const nameRect = () => heroName.getBoundingClientRect();

  hero.addEventListener('mousemove', (e) => {
    // 光晕跟随
    const rect = heroRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cursorGlow.style.left = x + 'px';
    cursorGlow.style.top = y + 'px';
    hero.classList.add('cursor-active');

    // 计算鼠标距离名字中心的距离 → 决定扭曲强度
    const nr = nameRect();
    const cx = nr.left + nr.width / 2;
    const cy = nr.top + nr.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // 范围内才扭曲：距离 < 400px 时
    const maxDist = 350;
    if (dist < maxDist) {
      // 距离越近扭曲越强
      const intensity = 1 - (dist / maxDist);
      targetScale = intensity * 35; // 最大扭曲 35
      mouseInName = true;
    } else {
      targetScale = 0;
      mouseInName = false;
    }
  });

  hero.addEventListener('mouseleave', () => {
    targetScale = 0;
    hero.classList.remove('cursor-active');
  });

  // 平滑过渡 + 持续变化 turbulence seed 让扭曲活起来
  function animate() {
    currentScale += (targetScale - currentScale) * 0.12;
    dispFilter.setAttribute('scale', currentScale.toFixed(2));

    // 鼠标在名字附近时，让噪声"流动"
    if (mouseInName || currentScale > 1) {
      turbSeed += 0.015;
      turbFilter.setAttribute('seed', (Math.floor(turbSeed) % 100).toString());
      // 更细腻地变化频率
      const freqShift = 0.012 + Math.sin(turbSeed) * 0.004;
      turbFilter.setAttribute('baseFrequency', `${freqShift.toFixed(4)} ${(freqShift + 0.006).toFixed(4)}`);
    }
    requestAnimationFrame(animate);
  }
  animate();
}


// ─────────── 卡片堆叠 ───────────
const stage = document.getElementById('stackStage');
if (stage) {
  let isHovering = false;
  let spreadTimer = null;

  stage.addEventListener('mouseenter', () => {
    isHovering = true;
    clearTimeout(spreadTimer);
    // 进入舞台稍微延迟散开，避免快速划过
    spreadTimer = setTimeout(() => {
      if (isHovering) stage.classList.add('spread');
    }, 80);
  });

  stage.addEventListener('mouseleave', () => {
    isHovering = false;
    clearTimeout(spreadTimer);
    spreadTimer = setTimeout(() => {
      if (!isHovering) stage.classList.remove('spread');
    }, 200);
  });

  // 移动端：点击切换散开
  stage.addEventListener('click', (e) => {
    if (window.matchMedia('(hover: none)').matches) {
      // 如果点击的是空白舞台（不是卡片）
      if (e.target === stage || e.target.classList.contains('stack-cards')) {
        stage.classList.toggle('spread');
      }
    }
  });
}


// ─────────── 滚动揭示 ───────────
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in');
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
