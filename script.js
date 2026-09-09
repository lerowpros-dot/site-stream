// Gestion des onglets : un clic affiche le panneau correspondant
// et cache les autres. C'est ici que tu ajouteras la logique
// si tu rajoutes un nouvel onglet plus tard.

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === target);
    });

    // Garde l'onglet choisi dans l'URL (ex: tonsite.vercel.app#events)
    history.replaceState(null, '', '#' + target);
  });
});

// Si quelqu'un ouvre le site avec un lien du type tonsite.vercel.app#events,
// on ouvre directement le bon onglet.
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const matchingTab = document.querySelector(`.tab[data-tab="${hash}"]`);
    if (matchingTab) matchingTab.click();
  }
});
