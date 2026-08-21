(function () {
  'use strict';

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  class DisclosureNav {
    constructor(root) {
      this.root = root;
      this.toggle = root.querySelector('[data-disclosure-toggle]');
      this.closeButton = root.querySelector('[data-disclosure-close]');
      this.panel = null;
      this.lastFocused = null;

      if (!this.toggle) return;

      const panelId = this.toggle.getAttribute('aria-controls');
      this.panel = panelId ? document.getElementById(panelId) : null;
      if (!this.panel) return;

      this.toggle.setAttribute('aria-expanded', 'false');
      this.panel.hidden = true;
      this.toggle.addEventListener('click', () => this.togglePanel());
      this.closeButton?.addEventListener('click', () => this.close());
      this.panel.addEventListener('keydown', (event) => this.trapFocus(event));
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.isOpen()) this.close();
      });
    }

    isOpen() {
      return this.toggle?.getAttribute('aria-expanded') === 'true';
    }

    togglePanel() {
      if (this.isOpen()) this.close();
      else this.open();
    }

    open() {
      if (!this.panel || !this.toggle) return;

      this.lastFocused = document.activeElement;
      this.panel.hidden = false;
      this.toggle.setAttribute('aria-expanded', 'true');
      this.root.dataset.disclosureOpen = 'true';
      this.getFocusableItems()[0]?.focus();
    }

    close() {
      if (!this.panel || !this.toggle) return;

      this.panel.hidden = true;
      this.toggle.setAttribute('aria-expanded', 'false');
      delete this.root.dataset.disclosureOpen;
      (this.lastFocused || this.toggle).focus();
    }

    getFocusableItems() {
      if (!this.panel) return [];
      return Array.from(this.panel.querySelectorAll(focusableSelector)).filter(
        (element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true'
      );
    }

    trapFocus(event) {
      if (event.key !== 'Tab') return;

      const items = this.getFocusableItems();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function initializeDisclosureNavigation() {
    document.querySelectorAll('[data-disclosure-nav]').forEach((root) => {
      if (!root.dataset.disclosureInitialized) {
        root.dataset.disclosureInitialized = 'true';
        new DisclosureNav(root);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDisclosureNavigation, { once: true });
  } else {
    initializeDisclosureNavigation();
  }

  window.DisclosureNav = DisclosureNav;
})();
