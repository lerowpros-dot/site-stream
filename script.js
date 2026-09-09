// Gestion des onglets fluide, robuste et accessible
(function() {
  function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.panel');
    const brand = document.querySelector('.brand');
    if (!tabs.length || !panels.length) return;

    const tabOrder = Array.from(tabs).map(t => t.dataset.tab);

    function activateTab(target) {
      if (!tabOrder.includes(target)) return;

      const currentTab = document.querySelector('.tab.active');
      const fromIndex = currentTab ? tabOrder.indexOf(currentTab.dataset.tab) : 0;
      const toIndex = tabOrder.indexOf(target);
      const direction = toIndex >= fromIndex ? 'enter-right' : 'enter-left';

      tabs.forEach(t => {
        const isTarget = (t.dataset.tab === target);
        t.classList.toggle('active', isTarget);
        t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      });

      panels.forEach(panel => {
        panel.classList.remove('enter-right', 'enter-left');
        const isTarget = (panel.id === target);
        panel.classList.toggle('active', isTarget);
        if (isTarget) {
          panel.classList.add(direction);
        }
      });

      try {
        if (window.location.protocol !== 'file:') {
          history.replaceState(null, '', '#' + target);
        } else {
          window.location.hash = target;
        }
      } catch (e) {}
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        activateTab(this.dataset.tab);
      });
    });

    if (brand) {
      brand.addEventListener('click', function(e) {
        e.preventDefault();
        activateTab('accueil');
      });
    }

    const hash = window.location.hash.replace('#', '');
    if (hash && tabOrder.includes(hash)) {
      activateTab(hash);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }
})();
