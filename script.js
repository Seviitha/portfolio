/**
 * Sevitha A - Personal Portfolio Interactive Logic
 * Fully Accessible, Modern Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initProjectFilter();
  initContactForm();
  initCurrentYear();
});

/**
 * Utility function to announce screen reader live messages
 * @param {string} message - Message to announce to assistive technologies
 */
function announceToScreenReader(message) {
  const announcer = document.getElementById('status-announcer');
  if (announcer) {
    announcer.textContent = message;
  }
}

/* ==========================================
   1. Dark / Light Mode Theme Controller
   ========================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  applyTheme(currentTheme, false);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme, true);
  });

  // Listen to OS theme changes if user hasn't explicitly set a preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light', true);
    }
  });

  function applyTheme(theme, announce = false) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
      if (sunIcon && moonIcon) {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
      localStorage.setItem('theme', 'dark');
      if (announce) announceToScreenReader('Switched to dark theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
      if (sunIcon && moonIcon) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
      localStorage.setItem('theme', 'light');
      if (announce) announceToScreenReader('Switched to light theme');
    }
  }
}

/* ==========================================
   2. Accessible Mobile Navigation
   ========================================== */
function initMobileNav() {
  const menuToggleBtn = document.getElementById('menu-toggle');
  const primaryNav = document.getElementById('primary-nav');

  if (!menuToggleBtn || !primaryNav) return;

  menuToggleBtn.addEventListener('click', () => {
    const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
    setMenuState(!isExpanded);
  });

  // Close navigation menu when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
      setMenuState(false);
      menuToggleBtn.focus();
    }
  });

  // Close navigation menu when a link inside it is clicked
  const navLinks = primaryNav.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (primaryNav.classList.contains('is-open')) {
        setMenuState(false);
      }
    });
  });

  function setMenuState(open) {
    if (open) {
      primaryNav.classList.add('is-open');
      menuToggleBtn.setAttribute('aria-expanded', 'true');
      menuToggleBtn.setAttribute('aria-label', 'Close main navigation');
      announceToScreenReader('Navigation menu expanded');
    } else {
      primaryNav.classList.remove('is-open');
      menuToggleBtn.setAttribute('aria-expanded', 'false');
      menuToggleBtn.setAttribute('aria-label', 'Open main navigation');
      announceToScreenReader('Navigation menu collapsed');
    }
  }
}

/* ==========================================
   3. Accessible Project Category Filter
   ========================================== */
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const filterStatus = document.getElementById('filter-status');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.getAttribute('data-filter');

      // Update button aria-pressed states
      filterBtns.forEach((otherBtn) => {
        otherBtn.setAttribute('aria-pressed', 'false');
      });
      btn.setAttribute('aria-pressed', 'true');

      let visibleCount = 0;

      // Filter project cards
      projectCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        const matches = selectedCategory === 'all' || cardCategory === selectedCategory;

        if (matches) {
          card.removeAttribute('hidden');
          card.style.display = '';
          visibleCount++;
        } else {
          card.setAttribute('hidden', 'until-found');
          card.style.display = 'none';
        }
      });

      // Announce result status to screen readers
      const categoryName = btn.textContent.trim();
      const statusText = `Showing ${visibleCount} project${visibleCount === 1 ? '' : 's'} for filter: ${categoryName}`;
      
      if (filterStatus) {
        filterStatus.textContent = statusText;
      }
      announceToScreenReader(statusText);
    });
  });
}

/* ==========================================
   4. Accessible Form Validation
   ========================================== */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset status box
    if (formStatus) {
      formStatus.className = 'form-status-box';
      formStatus.textContent = '';
      formStatus.style.display = 'none';
    }

    let isValid = true;
    let firstInvalidField = null;

    // Field validators
    const fields = [
      {
        id: 'full-name',
        errorId: 'full-name-error',
        validate: (val) => val.trim().length >= 2,
        errorMessage: 'Please enter your full name (at least 2 characters).'
      },
      {
        id: 'email',
        errorId: 'email-error',
        validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
        errorMessage: 'Please enter a valid email address (e.g. name@example.com).'
      },
      {
        id: 'subject',
        errorId: 'subject-error',
        validate: (val) => val.trim().length >= 3,
        errorMessage: 'Please enter a subject (at least 3 characters).'
      },
      {
        id: 'message',
        errorId: 'message-error',
        validate: (val) => val.trim().length >= 10,
        errorMessage: 'Please enter a message (at least 10 characters).'
      }
    ];

    let errorCount = 0;

    fields.forEach((fieldConfig) => {
      const fieldInput = document.getElementById(fieldConfig.id);
      const errorSpan = document.getElementById(fieldConfig.errorId);

      if (!fieldInput || !errorSpan) return;

      const fieldValue = fieldInput.value;
      const fieldValid = fieldConfig.validate(fieldValue);

      if (!fieldValid) {
        isValid = false;
        errorCount++;
        fieldInput.setAttribute('aria-invalid', 'true');
        errorSpan.textContent = fieldConfig.errorMessage;

        if (!firstInvalidField) {
          firstInvalidField = fieldInput;
        }
      } else {
        fieldInput.setAttribute('aria-invalid', 'false');
        errorSpan.textContent = '';
      }
    });

    if (!isValid) {
      const summaryMsg = `Form submission failed. Please fix ${errorCount} error${errorCount === 1 ? '' : 's'} highlighted below.`;
      
      if (formStatus) {
        formStatus.className = 'form-status-box error';
        formStatus.textContent = summaryMsg;
        formStatus.style.display = 'block';
      }

      announceToScreenReader(summaryMsg);

      // Move focus to the first invalid input automatically
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
    } else {
      const successMsg = 'Thank you! Your message has been sent successfully. Sevitha A will get back to you shortly.';
      
      if (formStatus) {
        formStatus.className = 'form-status-box success';
        formStatus.textContent = successMsg;
        formStatus.style.display = 'block';
      }

      announceToScreenReader(successMsg);
      contactForm.reset();

      // Reset aria-invalid attributes
      fields.forEach((fieldConfig) => {
        const input = document.getElementById(fieldConfig.id);
        if (input) input.setAttribute('aria-invalid', 'false');
      });

      // Move focus to form status container for screen reader focus flow
      if (formStatus) {
        formStatus.tabIndex = -1;
        formStatus.focus();
      }
    }
  });

  // Real-time error clearing when user types in an invalid field
  const inputs = contactForm.querySelectorAll('input, textarea');
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        input.setAttribute('aria-invalid', 'false');
        const errorSpan = document.getElementById(`${input.id}-error`);
        if (errorSpan) errorSpan.textContent = '';
      }
    });
  });
}

/* ==========================================
   5. Dynamic Copyright Year
   ========================================== */
function initCurrentYear() {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}