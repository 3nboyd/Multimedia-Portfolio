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
    btn.addEventListener('click', () => openModal(btn));
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
});
