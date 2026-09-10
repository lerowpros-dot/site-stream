// ======================================================
// Lerow Stream — Script principal
// ======================================================
// 1. Navigation par onglets
// 2. Copie du pseudo Discord
// 3. Detection de stream LIVE Twitch (automatique)
// 4. Panneau Admin pour gerer les Events (localStorage)
// ======================================================

(function() {

  // --- CONFIG ---
  var TWITCH_CONFIG = {
    channel: 'Ler0w_',
    // Forcer un etat pour tester : true = live, false = offline, null = auto
    forceLive: null,
    // Intervalle de verification en ms (60 secondes)
    intervalMs: 60000
  };

  // Mot de passe admin (change-le ici)
  var ADMIN_PASSWORD = 'lerow2026';

  // Cle localStorage
  var STORAGE_KEY = 'lerow_events';


  // --- INITIALISATION ---
  function init() {
    initTabs();
    initDiscordCopy();
    initLiveDetection();
    initAdminPanel();
    renderPublicEvents();
  }


  // ===================================================
  // 1. NAVIGATION PAR ONGLETS
  // ===================================================
  function initTabs() {
    var tabs = document.querySelectorAll('.tab');
    var panels = document.querySelectorAll('.panel');
    var brand = document.querySelector('.brand');

    if (!tabs.length || !panels.length) return;

    var tabOrder = Array.from(tabs).map(function(t) { return t.dataset.tab; });

    function activateTab(target) {
      if (!tabOrder.includes(target)) return;

      var currentTab = document.querySelector('.tab.active');
      var fromIndex = currentTab ? tabOrder.indexOf(currentTab.dataset.tab) : 0;
      var toIndex = tabOrder.indexOf(target);
      var direction = toIndex >= fromIndex ? 'enter-right' : 'enter-left';

      tabs.forEach(function(t) {
        var isTarget = (t.dataset.tab === target);
        t.classList.toggle('active', isTarget);
        t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      });

      panels.forEach(function(panel) {
        panel.classList.remove('enter-right', 'enter-left');
        var isTarget = (panel.id === target);
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

    tabs.forEach(function(tab) {
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

    var hash = window.location.hash.replace('#', '');
    if (hash && tabOrder.includes(hash)) {
      activateTab(hash);
    }
  }


  // ===================================================
  // 2. COPIE DU PSEUDO DISCORD
  // ===================================================
  function initDiscordCopy() {
    var copyDiscordBtn = document.getElementById('copy-discord-btn');
    if (!copyDiscordBtn) return;

    copyDiscordBtn.addEventListener('click', function() {
      navigator.clipboard.writeText('.lerow.').then(function() {
        var copyText = copyDiscordBtn.querySelector('.copy-text');
        var copiedText = copyDiscordBtn.querySelector('.copied-text');
        copyDiscordBtn.classList.add('copied');
        if (copyText && copiedText) {
          copyText.style.display = 'none';
          copiedText.style.display = 'inline';
        }
        setTimeout(function() {
          copyDiscordBtn.classList.remove('copied');
          if (copyText && copiedText) {
            copyText.style.display = 'inline';
            copiedText.style.display = 'none';
          }
        }, 2000);
      }).catch(function() {
        alert('Pseudo Discord : .lerow.');
      });
    });
  }


  // ===================================================
  // 3. DETECTION DE STREAM LIVE TWITCH
  // ===================================================
  var lastLiveState = null;

  function initLiveDetection() {
    checkLiveStatus();
    setInterval(checkLiveStatus, TWITCH_CONFIG.intervalMs);
  }

  function checkLiveStatus() {
    // Override manuel pour tester
    if (TWITCH_CONFIG.forceLive !== null) {
      updateLiveUI(TWITCH_CONFIG.forceLive);
      return;
    }

    // Methode principale : DecAPI (endpoint public, CORS ok)
    fetch('https://decapi.me/twitch/uptime/' + TWITCH_CONFIG.channel.toLowerCase(), { cache: 'no-store' })
        .then(function(response) { return response.text(); })
        .then(function(text) {
          var isLive = !text.toLowerCase().includes('offline') && text.trim().length > 0;
          updateLiveUI(isLive);
        })
        .catch(function() {
          // Fallback : verifier si la thumbnail live existe
          checkThumbnailFallback().then(function(isLive) {
            updateLiveUI(isLive);
          }).catch(function() {
            console.warn('[Live] Erreur de detection');
          });
        });
  }

  function checkThumbnailFallback() {
    return new Promise(function(resolve) {
      var img = new Image();
      var url = 'https://static-cdn.jtvnw.net/previews-ttv/live_user_'
          + TWITCH_CONFIG.channel.toLowerCase()
          + '-320x180.jpg?t=' + Date.now();
      img.onload = function() { resolve(true); };
      img.onerror = function() { resolve(false); };
      img.src = url;
      setTimeout(function() { resolve(false); }, 5000);
    });
  }

  function updateLiveUI(isLive) {
    if (isLive === lastLiveState) return;
    lastLiveState = isLive;

    // 1. Bandeau d'alerte en haut
    var banner = document.getElementById('live-banner');
    if (banner) banner.style.display = isLive ? 'flex' : 'none';

    // 2. Indicateur live sur le logo
    var brandIndicator = document.getElementById('brand-live-indicator');
    if (brandIndicator) brandIndicator.classList.toggle('is-live', isLive);

    // 3. Badge STREAM -> LIVE
    var brandTag = document.getElementById('brand-tag');
    if (brandTag) {
      brandTag.textContent = isLive ? 'LIVE' : 'STREAM';
      brandTag.style.color = isLive ? '#ef4444' : '';
      brandTag.style.borderColor = isLive ? 'rgba(239, 68, 68, 0.5)' : '';
      brandTag.style.background = isLive ? 'rgba(239, 68, 68, 0.12)' : '';
    }

    // 4. Bouton Twitch dans le hero
    var twitchBtn = document.getElementById('twitch-hero-btn');
    var twitchBtnText = document.getElementById('twitch-btn-text');
    if (twitchBtn) twitchBtn.classList.toggle('is-live-now', isLive);
    if (twitchBtnText) twitchBtnText.textContent = isLive ? 'Regarder le LIVE' : 'Mon Twitch';

    // 5. Badge EN LIVE sur l'avatar
    var avatarBadge = document.getElementById('avatar-live-badge');
    if (avatarBadge) avatarBadge.style.display = isLive ? 'flex' : 'none';

    // 6. Statut sous le nom
    var statusSub = document.getElementById('avatar-status-sub');
    if (statusSub) {
      statusSub.textContent = isLive ? 'En live sur Twitch' : 'Hors ligne';
      statusSub.classList.toggle('is-live', isLive);
    }
  }


  // ===================================================
  // 4. PANNEAU ADMIN - GESTION DES EVENTS
  // ===================================================
  var isAdminLoggedIn = false;
  var editingEventId = null;

  function getEvents() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  // --- Afficher les events publics ---
  function renderPublicEvents() {
    var container = document.getElementById('events-container');
    var placeholder = document.getElementById('events-placeholder');
    if (!container) return;

    var events = getEvents();

    if (events.length === 0) {
      container.innerHTML = '';
      if (placeholder) placeholder.style.display = '';
      return;
    }

    if (placeholder) placeholder.style.display = 'none';

    events.sort(function(a, b) { return new Date(a.date) - new Date(b.date); });

    var html = '<div class="event-grid">';
    events.forEach(function(ev) {
      var dateStr = ev.date ? formatDate(ev.date) : '';
      var linkHtml = ev.link
          ? '<a href="' + escapeHtml(ev.link) + '" class="event-card-link" target="_blank" rel="noopener">En savoir plus &#8599;</a>'
          : '';
      html += '<div class="event-card">'
          + '<div class="event-card-header">'
          + '<span class="event-card-title">' + escapeHtml(ev.title) + '</span>'
          + (dateStr ? '<span class="event-card-date">' + dateStr + '</span>' : '')
          + '</div>'
          + (ev.desc ? '<p class="event-card-desc">' + escapeHtml(ev.desc) + '</p>' : '')
          + linkHtml
          + '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function formatDate(dateStr) {
    try {
      var d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return dateStr; }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Admin Panel ---
  function initAdminPanel() {
    var trigger = document.getElementById('admin-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function() { openAdminModal(); });
  }

  function openAdminModal() {
    closeAdminModal();

    var overlay = document.createElement('div');
    overlay.className = 'admin-overlay';
    overlay.id = 'admin-overlay';

    var modal = document.createElement('div');
    modal.className = 'admin-modal';

    if (!isAdminLoggedIn) {
      modal.innerHTML = buildLoginHTML();
    } else {
      modal.innerHTML = buildAdminPanelHTML();
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeAdminModal();
    });

    document.addEventListener('keydown', handleEscapeKey);

    if (!isAdminLoggedIn) {
      bindLoginEvents(modal);
    } else {
      bindAdminEvents(modal);
    }
  }

  function closeAdminModal() {
    var existing = document.getElementById('admin-overlay');
    if (existing) existing.remove();
    document.removeEventListener('keydown', handleEscapeKey);
    editingEventId = null;
  }

  function handleEscapeKey(e) {
    if (e.key === 'Escape') closeAdminModal();
  }

  function buildLoginHTML() {
    return '<div class="admin-modal-header">'
        + '<h3>Connexion Admin</h3>'
        + '<button type="button" class="admin-close-btn" id="admin-close">\u2715</button>'
        + '</div>'
        + '<form class="admin-login-form" id="admin-login-form">'
        + '<input type="password" class="admin-input" id="admin-password" placeholder="Mot de passe admin" autocomplete="off">'
        + '<button type="submit" class="admin-submit-btn">Se connecter</button>'
        + '<p class="admin-error" id="admin-error"></p>'
        + '</form>';
  }

  function bindLoginEvents(modal) {
    modal.querySelector('#admin-close').addEventListener('click', closeAdminModal);

    var form = modal.querySelector('#admin-login-form');
    var passwordInput = modal.querySelector('#admin-password');

    setTimeout(function() { passwordInput.focus(); }, 100);

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var pwd = passwordInput.value;
      if (pwd === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        openAdminModal();
      } else {
        var err = modal.querySelector('#admin-error');
        err.textContent = 'Mot de passe incorrect';
        passwordInput.value = '';
        passwordInput.focus();
        setTimeout(function() { err.textContent = ''; }, 3000);
      }
    });
  }

  function buildAdminPanelHTML() {
    var events = getEvents();

    var eventListHTML = '';
    if (events.length === 0) {
      eventListHTML = '<p class="admin-no-events">Aucun event \u2014 ajoute le premier !</p>';
    } else {
      eventListHTML = '<div class="admin-event-list">';
      events.forEach(function(ev) {
        var dateStr = ev.date ? formatDate(ev.date) : 'Pas de date';
        eventListHTML += '<div class="admin-event-item" data-id="' + ev.id + '">'
            + '<div class="admin-event-info">'
            + '<strong>' + escapeHtml(ev.title) + '</strong>'
            + '<span>' + dateStr + '</span>'
            + '</div>'
            + '<div class="admin-event-actions">'
            + '<button type="button" class="admin-edit-btn" title="Modifier">\u270F</button>'
            + '<button type="button" class="admin-delete-btn" title="Supprimer">\u2716</button>'
            + '</div>'
            + '</div>';
      });
      eventListHTML += '</div>';
    }

    return '<div class="admin-modal-header">'
        + '<h3>Gestion des Events</h3>'
        + '<button type="button" class="admin-close-btn" id="admin-close">\u2715</button>'
        + '</div>'
        + '<div class="admin-section">'
        + '<p class="admin-section-title">' + (editingEventId ? 'Modifier un event' : 'Ajouter un event') + '</p>'
        + '<form class="admin-event-form" id="admin-event-form">'
        + '<input type="text" class="admin-input" id="event-title" placeholder="Titre de l\'event" required>'
        + '<div class="admin-form-row">'
        + '<input type="date" class="admin-input" id="event-date">'
        + '<input type="url" class="admin-input" id="event-link" placeholder="Lien (optionnel)">'
        + '</div>'
        + '<textarea class="admin-textarea" id="event-desc" placeholder="Description (optionnel)"></textarea>'
        + '<button type="submit" class="admin-add-btn" id="admin-add-btn">'
        + (editingEventId ? 'Sauvegarder' : 'Ajouter l\'event')
        + '</button>'
        + '</form>'
        + '</div>'
        + '<div class="admin-section">'
        + '<p class="admin-section-title">Events existants (' + events.length + ')</p>'
        + eventListHTML
        + '</div>'
        + '<button type="button" class="admin-logout-btn" id="admin-logout">Se deconnecter</button>';
  }

  function bindAdminEvents(modal) {
    modal.querySelector('#admin-close').addEventListener('click', closeAdminModal);
    modal.querySelector('#admin-logout').addEventListener('click', function() {
      isAdminLoggedIn = false;
      closeAdminModal();
    });

    var form = modal.querySelector('#admin-event-form');
    var titleInput = modal.querySelector('#event-title');
    var dateInput = modal.querySelector('#event-date');
    var linkInput = modal.querySelector('#event-link');
    var descInput = modal.querySelector('#event-desc');

    if (editingEventId) {
      var events = getEvents();
      var ev = events.find(function(e) { return e.id === editingEventId; });
      if (ev) {
        titleInput.value = ev.title || '';
        dateInput.value = ev.date || '';
        linkInput.value = ev.link || '';
        descInput.value = ev.desc || '';
      }
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var events = getEvents();

      var eventData = {
        title: titleInput.value.trim(),
        date: dateInput.value,
        link: linkInput.value.trim(),
        desc: descInput.value.trim()
      };

      if (!eventData.title) return;

      if (editingEventId) {
        var idx = events.findIndex(function(e) { return e.id === editingEventId; });
        if (idx !== -1) {
          eventData.id = editingEventId;
          events[idx] = eventData;
        }
        editingEventId = null;
      } else {
        eventData.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        events.push(eventData);
      }

      saveEvents(events);
      renderPublicEvents();
      openAdminModal();
    });

    modal.querySelectorAll('.admin-edit-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = this.closest('.admin-event-item');
        editingEventId = item.dataset.id;
        openAdminModal();
      });
    });

    modal.querySelectorAll('.admin-delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = this.closest('.admin-event-item');
        var id = item.dataset.id;
        var events = getEvents();
        events = events.filter(function(e) { return e.id !== id; });
        saveEvents(events);
        renderPublicEvents();
        openAdminModal();
      });
    });

    setTimeout(function() { titleInput.focus(); }, 100);
  }


  // --- LANCEMENT ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();