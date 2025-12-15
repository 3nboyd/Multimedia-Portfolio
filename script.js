document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for nav links and other anchors
  const smoothScrollTo = (targetId) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      smoothScrollTo(href.replace('#', ''));
    });
  });

  // Card click handlers (open modal and wire CTA)
  const modal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalSummary = document.getElementById('modal-summary');
  const modalLink = document.getElementById('modal-link');
  const modalClose = document.querySelector('.modal-close');

  const openModal = (btn) => {
    if (!modal || !modalTitle || !modalSummary || !modalLink) return;
    const title = btn.dataset.title || 'Project';
    const summary = btn.dataset.summary || '';
    const target = btn.dataset.target || '';

    modalTitle.textContent = title;
    modalSummary.textContent = summary;
    modalLink.setAttribute('href', `#${target}`);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    modalLink.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  document.querySelectorAll('.view-details').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      if (target) {
        smoothScrollTo(target);
      } else {
        openModal(btn);
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Timeline click handlers
  document.querySelectorAll('.timeline-node').forEach((node) => {
    node.addEventListener('click', () => {
      const target = node.dataset.target;
      if (target) smoothScrollTo(target);
    });
  });

  // Scroll reveal animations
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((el) => observer.observe(el));

  // Tilt + glow effect on project cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / rect.height) * -6;
      const rotateY = ((x - rect.width / 2) / rect.width) * 6;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  // Drag-to-scroll for the horizontal project rail
  const projectRail = document.querySelector('.project-rail');
  if (projectRail) {
    let isDragging = false;
    let startX = 0;
    let startScroll = 0;
    let rafId = null;
    let currentIndex = 0;
    const cards = Array.from(projectRail.querySelectorAll('.project-card'));

    projectRail.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button')) return;
      isDragging = true;
      startX = e.clientX;
      startScroll = projectRail.scrollLeft;
      projectRail.setPointerCapture(e.pointerId);
      projectRail.classList.add('dragging');
    });

    projectRail.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const delta = e.clientX - startX;
      projectRail.scrollLeft = startScroll - delta;
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (projectRail.hasPointerCapture(e.pointerId)) {
        projectRail.releasePointerCapture(e.pointerId);
      }
      projectRail.classList.remove('dragging');
    };

    projectRail.addEventListener('pointerup', endDrag);
    projectRail.addEventListener('pointercancel', endDrag);
    projectRail.addEventListener('pointerleave', endDrag);

    const updateActiveCard = () => {
      const railRect = projectRail.getBoundingClientRect();
      const centerX = railRect.left + railRect.width / 2;
      let closestIdx = 0;
      let minDistance = Infinity;
      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(centerX - cardCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });
      currentIndex = closestIdx;
      cards.forEach((card, idx) => {
        card.classList.toggle('active', idx === closestIdx);
      });
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveCard);
    };

    projectRail.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateActiveCard);
    updateActiveCard();

    // Card click -> scroll to detail section
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button, a')) return;
        const target = card.dataset.target;
        if (target) smoothScrollTo(target);
      });
    });

    // Arrow controls with looping
    const leftArrow = document.querySelector('.carousel-arrow.left');
    const rightArrow = document.querySelector('.carousel-arrow.right');

    const scrollToCard = (index) => {
      if (!cards.length) return;
      const nextIndex = ((index % cards.length) + cards.length) % cards.length;
      cards[nextIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      currentIndex = nextIndex;
    };

    if (leftArrow) {
      leftArrow.addEventListener('click', () => scrollToCard(currentIndex - 1));
    }
    if (rightArrow) {
      rightArrow.addEventListener('click', () => scrollToCard(currentIndex + 1));
    }
  }

  // Gentle parallax on hero shapes
  const hero = document.querySelector('.hero');
  const shapes = document.querySelectorAll('.hero-shapes .shape');
  if (hero && shapes.length) {
    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      shapes.forEach((shape, idx) => {
        if (shape.classList.contains('photo')) return;
        const depth = (idx + 1) * 10;
        shape.style.transform = `translate(${x * depth}px, ${y * depth}px) rotate(${(idx - 1) * 6}deg)`;
      });
    });

    hero.addEventListener('pointerleave', () => {
      shapes.forEach((shape) => {
        if (shape.classList.contains('photo')) return;
        shape.style.transform = '';
      });
    });
  }

  // Reveal email on button click
  const toggleEmailBtn = document.querySelector('.toggle-email');
  const hiddenEmail = document.querySelector('.hidden-email');
  if (toggleEmailBtn && hiddenEmail) {
    toggleEmailBtn.addEventListener('click', () => {
      const isVisible = hiddenEmail.classList.toggle('visible');
      toggleEmailBtn.textContent = isVisible ? 'Click to Hide' : 'Click to Unhide';
      toggleEmailBtn.setAttribute('aria-expanded', String(isVisible));
      hiddenEmail.setAttribute('aria-hidden', String(!isVisible));
    });
  }
});
