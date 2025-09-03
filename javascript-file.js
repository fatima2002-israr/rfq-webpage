
document.addEventListener('DOMContentLoaded', () => {

  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });

  
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 992) {
        if (!sidebar.contains(e.target) && e.target !== sidebarToggle && !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove('active');
        }
      }
    });
  }

  
  const easeInOutQuad = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  function smoothScrollTo(element, target, duration = 400, after) {
    const start = element.scrollLeft;
    const distance = target - start;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, start, distance, duration);
      element.scrollLeft = run;
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else if (typeof after === 'function') {
        after();
      }
    }
    requestAnimationFrame(animation);
  }

  function getCardStep(cardEl) {
    if (!cardEl) return 0;
    const style = window.getComputedStyle(cardEl);
    const ml = parseFloat(style.marginLeft) || 0;
    const mr = parseFloat(style.marginRight) || 0;
    return cardEl.offsetWidth + ml + mr;
  }

  
  document.querySelectorAll('.carousel').forEach((carousel) => {
    
    try {
      if (window.jQuery && typeof jQuery.fn.carousel === 'function') {
        jQuery(carousel).carousel('dispose');
      }
    } catch (_) {
    }
    carousel.removeAttribute('data-ride');

    
    const inner = carousel.querySelector('.carousel-inner');
    if (!inner) return;

    const items = Array.from(inner.querySelectorAll('.carousel-item'));
    if (items.length === 0) return;

    const firstItem = items[0];
    if (!firstItem.classList.contains('active')) firstItem.classList.add('active');
    const track = firstItem.querySelector('.d-flex');
    if (!track) return;

    
    for (let i = 1; i < items.length; i++) {
      const donorTrack = items[i].querySelector('.d-flex');
      if (!donorTrack) continue;
      while (donorTrack.firstElementChild) {
        track.appendChild(donorTrack.firstElementChild);
      }
      
      items[i].remove();
    }

    
    track.style.scrollBehavior = 'auto'; 
    track.style.overflowX = track.style.overflowX || 'auto';

   
    const prevBtn = carousel.querySelector('.carousel-control-prev');
    const nextBtn = carousel.querySelector('.carousel-control-next');

    const cards = Array.from(track.querySelectorAll('.rfq-card'));
    if (cards.length === 0) return;

    let step = getCardStep(cards[0]);

    function visibleCount() {
      if (!step) return 1;
      return Math.max(1, Math.floor(track.clientWidth / step));
    }

    function lastIndex() {
      const total = cards.length;
      return Math.max(0, total - visibleCount());
    }

    function currentIndex() {
      if (!step) return 0;
      return Math.round(track.scrollLeft / step);
    }

    function snapToNearest() {
      const idx = currentIndex();
      const clamped = Math.min(Math.max(idx, 0), lastIndex());
      smoothScrollTo(track, clamped * step, 150);
    }

    function goBy(delta) {
      
      step = getCardStep(cards[0]);
      const idx = currentIndex();
      const targetIdx = Math.min(Math.max(idx + delta, 0), lastIndex());
      const target = targetIdx * step;
      smoothScrollTo(track, target, 400);
    }

    function guardClick(handler) {
      return function (e) {
        e.preventDefault();
        
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        e.stopPropagation();
        handler();
      };
    }

    if (prevBtn) prevBtn.addEventListener('click', guardClick(() => goBy(-1)), true);
    if (nextBtn) nextBtn.addEventListener('click', guardClick(() => goBy(1)), true);

   
    (function enableDragScroll(container) {
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

  
      container.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        container.classList.add('dragging');
      });
      container.addEventListener('mouseleave', () => {
        if (isDown) {
          isDown = false;
          container.classList.remove('dragging');
          snapToNearest();
        }
      });
      container.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        container.classList.remove('dragging');
        snapToNearest();
      });
      container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; 
        container.scrollLeft = scrollLeft - walk;
      });

     
      let tStartX = 0;
      let tScrollLeft = 0;
      container.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        tStartX = t.pageX - container.offsetLeft;
        tScrollLeft = container.scrollLeft;
      }, { passive: true });
      container.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        const x = t.pageX - container.offsetLeft;
        const walk = (x - tStartX) * 2;
        container.scrollLeft = tScrollLeft - walk;
      }, { passive: true });
      container.addEventListener('touchend', () => {
        snapToNearest();
      });
    })(track);

    
    window.addEventListener('resize', () => {
      step = getCardStep(cards[0]);
      snapToNearest();
    });
  });

  
  const allCards = document.querySelectorAll('.rfq-card');
  allCards.forEach((card) => {
    card.addEventListener('click', function () {
      this.style.transform = 'translateY(-5px) scale(0.98)';
      setTimeout(() => {
        this.style.transform = 'translateY(-5px) scale(1)';
      }, 150);
    });
    card.addEventListener('mouseenter', function () {
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    card.addEventListener('mouseleave', function () {
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });

  
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

    const hovered = document.querySelector('.carousel:hover');
    const carousel = hovered || document.querySelector('.carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-inner .d-flex');
    const firstCard = track ? track.querySelector('.rfq-card') : null;
    if (!track || !firstCard) return;

    const step = getCardStep(firstCard);
    const idx = Math.round(track.scrollLeft / step);
    const total = track.querySelectorAll('.rfq-card').length;
    const vis = Math.max(1, Math.floor(track.clientWidth / step));
    const lastIdx = Math.max(0, total - vis);

    e.preventDefault();

    if (e.key === 'ArrowLeft') {
      const targetIdx = Math.max(0, idx - 1);
      smoothScrollTo(track, targetIdx * step, 400);
    } else if (e.key === 'ArrowRight') {
      const targetIdx = Math.min(lastIdx, idx + 1);
      smoothScrollTo(track, targetIdx * step, 400);
    }
  });

 
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.rfq-card').forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
});
