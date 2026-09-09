// Gestion des onglets : un clic affiche le panneau correspondant
// et cache les autres, avec un swipe fluide dans la bonne direction
// (vers la droite si on avance dans les onglets, vers la gauche si on recule).

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const tabOrder = Array.from(tabs).map(t => t.dataset.tab);

function activateTab(target) {
  const currentTab = document.querySelector('.tab.active');
  const fromIndex = tabOrder.indexOf(currentTab ? currentTab.dataset.tab : target);
  const toIndex = tabOrder.indexOf(target);
  const direction = toIndex >= fromIndex ? 'enter-right' : 'enter-left';

  tabs.forEach(t => {
    const isTarget = t.dataset.tab === target;
    t.classList.toggle('active', isTarget);
    t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  panels.forEach(panel => {
    panel.classList.remove('enter-right', 'enter-left');
    const isTarget = panel.id === target;
    panel.classList.toggle('active', isTarget);
    if (isTarget) panel.classList.add(direction);
  });

  history.replaceState(null, '', '#' + target);
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

// Si quelqu'un ouvre le site avec un lien du type tonsite.vercel.app#events,
// on ouvre directement le bon onglet.
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && tabOrder.includes(hash)) activateTab(hash);
});