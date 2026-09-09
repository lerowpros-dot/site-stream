// Gestion des onglets fluide, robuste et accessible
(function() {
  function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.panel');
    const brand = document.querySelector('.brand');
    const copyDiscordBtn = document.getElementById('copy-discord-btn');

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

    // Copie en un clic du pseudo Discord perso
    if (copyDiscordBtn) {
      copyDiscordBtn.addEventListener('click', function() {
        navigator.clipboard.writeText('.lerow.').then(() => {
          const copyText = copyDiscordBtn.querySelector('.copy-text');
          const copiedText = copyDiscordBtn.querySelector('.copied-text');
          copyDiscordBtn.classList.add('copied');
          if (copyText && copiedText) {
            copyText.style.display = 'none';
            copiedText.style.display = 'inline';
          }
          setTimeout(() => {
            copyDiscordBtn.classList.remove('copied');
            if (copyText && copiedText) {
              copyText.style.display = 'inline';
              copiedText.style.display = 'none';
            }
          }, 2000);
        }).catch(() => {
          // Fallback si l'API Clipboard est bloquée
          alert('Pseudo Discord : .lerow.');
        });
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
