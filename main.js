/* ES-SIRAJ Barber Shop — scripts */

// Numéro WhatsApp du salon (06 08 16 26 98), format international sans + ni espaces
var WA_NUMBER = '212608162698';

function waLink(msg) {
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
}

/* Prestations : utilisées sur la page Réservation.
   Remplacer [PRIX] par les vrais tarifs (ex. '80 DH'). */
var SERVICES = [
  { id: 'coupe',   name: 'Coupe homme',          dur: '30 min', price: '[PRIX] DH' },
  { id: 'degrade', name: 'Dégradé / Fade',        dur: '40 min', price: '[PRIX] DH' },
  { id: 'barbe',   name: 'Taille de barbe',       dur: '20 min', price: '[PRIX] DH' },
  { id: 'combo',   name: 'Coupe + barbe',         dur: '50 min', price: '[PRIX] DH' },
  { id: 'proteine',name: 'Soin protéine cheveux', dur: '45 min', price: '[PRIX] DH' },
  { id: 'visage',  name: 'Soin visage',           dur: '30 min', price: '[PRIX] DH' },
  { id: 'enfant',  name: 'Coupe enfant',          dur: '25 min', price: '[PRIX] DH' },
  { id: 'marie',   name: 'Pack marié',            dur: '2 h',    price: '[PRIX] DH' }
];
var BARBERS = [
  { id: 'abdelkhalek', name: 'Abdel Khalek', role: 'Fondateur' },
  { id: 'b2', name: '[NOM BARBIER 2]', role: 'Barbier' },
  { id: 'b3', name: '[NOM BARBIER 3]', role: 'Barbier' },
  { id: 'any', name: 'Peu importe', role: 'Le premier disponible' }
];
// Horaires à confirmer : jour fermé (0 = dimanche … 6 = samedi) et créneaux
var CLOSED_DAYS = [];
var SLOTS = ['10:00','10:45','11:30','12:15','14:00','14:45','15:30','16:15','17:00','17:45','18:30','19:15','20:00','20:45'];

document.addEventListener('DOMContentLoaded', function () {
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa') || 'Bonjour ES-SIRAJ !');
    a.target = '_blank';
    a.rel = 'noopener';
  });
  initGallery();
  initBooking();
});

/* ---------- Galerie ---------- */
function initGallery() {
  var g = document.getElementById('gallery');
  if (!g) return;
  var box = document.getElementById('lightbox');
  var cap = box.querySelector('.lcap');
  var items = g.querySelectorAll('button');
  function close() { box.classList.remove('open'); document.body.style.overflow = ''; }
  items.forEach(function (b) {
    b.addEventListener('click', function () {
      cap.textContent = b.getAttribute('aria-label');
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
      box.querySelector('.close').focus();
    });
  });
  box.querySelector('.close').addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  var pills = document.querySelectorAll('#gfilters .pill');
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      var c = p.getAttribute('data-cat');
      pills.forEach(function (x) { x.classList.toggle('on', x === p); x.setAttribute('aria-pressed', x === p ? 'true' : 'false'); });
      items.forEach(function (b) { b.hidden = !(c === 'Tout' || b.getAttribute('data-cat') === c); });
    });
  });
}

/* ---------- Réservation ---------- */
function initBooking() {
  var root = document.getElementById('booking');
  if (!root) return;
  var params = new URLSearchParams(location.search);
  var state = {
    svc: SERVICES.some(function (s) { return s.id === params.get('service'); }) ? params.get('service') : 'coupe',
    barber: BARBERS.some(function (b) { return b.id === params.get('barbier'); }) ? params.get('barbier') : 'any',
    day: null, slot: null
  };
  var DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  var MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var dates = [];
  var today = new Date();
  for (var i = 0; i < 14; i++) {
    var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    dates.push(d);
  }

  function optButtons(el, list, key, sub) {
    el.innerHTML = list.map(function (x) {
      return '<button type="button" class="opt" data-id="' + x.id + '" aria-pressed="false"><b>' + x.name + '</b><small>' + sub(x) + '</small></button>';
    }).join('');
    el.querySelectorAll('.opt').forEach(function (b) {
      b.addEventListener('click', function () { state[key] = b.getAttribute('data-id'); render(); });
    });
  }
  optButtons(document.getElementById('svc-list'), SERVICES, 'svc', function (s) { return s.dur + ' · ' + s.price; });
  optButtons(document.getElementById('barber-list'), BARBERS, 'barber', function (b) { return b.role; });

  var dayEl = document.getElementById('day-list');
  dayEl.innerHTML = dates.map(function (d, i) {
    var closed = CLOSED_DAYS.indexOf(d.getDay()) !== -1;
    return '<button type="button" class="day" data-i="' + i + '"' + (closed ? ' disabled' : '') + ' aria-pressed="false" aria-label="' + DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + '"><small>' + (i === 0 ? 'Auj.' : DAYS[d.getDay()]) + '</small><b>' + d.getDate() + '</b><small>' + MONTHS[d.getMonth()] + '</small></button>';
  }).join('');
  dayEl.querySelectorAll('.day').forEach(function (b) {
    b.addEventListener('click', function () { state.day = +b.getAttribute('data-i'); state.slot = null; render(); });
  });

  var slotEl = document.getElementById('slot-list');
  function renderSlots() {
    if (state.day === null) { slotEl.innerHTML = '<p class="note" style="grid-column:1/-1">Choisissez d\'abord un jour.</p>'; return; }
    var now = new Date();
    var isToday = state.day === 0;
    slotEl.innerHTML = SLOTS.map(function (s) {
      var parts = s.split(':');
      var past = isToday && (+parts[0] * 60 + +parts[1]) <= (now.getHours() * 60 + now.getMinutes() + 30);
      if (past) return '';
      return '<button type="button" class="slot' + (state.slot === s ? ' on' : '') + '" data-s="' + s + '" aria-pressed="' + (state.slot === s) + '">' + s.replace(':', 'h') + '</button>';
    }).join('') || '<p class="note" style="grid-column:1/-1">Plus de créneau aujourd\'hui, choisissez un autre jour.</p>';
    slotEl.querySelectorAll('.slot').forEach(function (b) {
      b.addEventListener('click', function () { state.slot = b.getAttribute('data-s'); render(); });
    });
  }

  ['fname', 'fphone', 'fnote'].forEach(function (id) { document.getElementById(id).addEventListener('input', render); });

  function dayLabel() {
    if (state.day === null) return '—';
    var d = dates[state.day];
    return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function render() {
    document.querySelectorAll('#svc-list .opt').forEach(function (b) { var on = b.getAttribute('data-id') === state.svc; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    document.querySelectorAll('#barber-list .opt').forEach(function (b) { var on = b.getAttribute('data-id') === state.barber; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    dayEl.querySelectorAll('.day').forEach(function (b) { var on = +b.getAttribute('data-i') === state.day; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    renderSlots();

    var svc = SERVICES.filter(function (s) { return s.id === state.svc; })[0];
    var barber = BARBERS.filter(function (b) { return b.id === state.barber; })[0];
    var name = document.getElementById('fname').value.trim();
    var phone = document.getElementById('fphone').value.trim();
    var note = document.getElementById('fnote').value.trim();
    var time = state.slot ? state.slot.replace(':', 'h') : '—';

    document.getElementById('r-svc').textContent = svc.name;
    document.getElementById('r-barber').textContent = barber.name;
    document.getElementById('r-day').textContent = dayLabel();
    document.getElementById('r-time').textContent = time;
    document.getElementById('r-price').textContent = svc.price;

    var ready = state.day !== null && state.slot && name && phone;
    var btn = document.getElementById('send');
    var hint = document.getElementById('hint');
    var missing = [];
    if (state.day === null) missing.push('un jour');
    if (!state.slot) missing.push('une heure');
    if (!name) missing.push('votre nom');
    if (!phone) missing.push('votre téléphone');
    hint.textContent = ready ? 'Tout est prêt : envoyez votre demande.' : 'Il manque : ' + missing.join(', ') + '.';
    btn.setAttribute('aria-disabled', ready ? 'false' : 'true');
    btn.style.opacity = ready ? '1' : '.45';
    btn.href = ready ? waLink('Bonjour ES-SIRAJ ! Je souhaite réserver :\n' +
      '✂️ Prestation : ' + svc.name + '\n' +
      '💈 Barbier : ' + barber.name + '\n' +
      '📅 Date : ' + dayLabel() + ' à ' + time + '\n' +
      '👤 Nom : ' + name + '\n' +
      '📞 Tél : ' + phone + (note ? '\n📝 ' + note : '')) : '#reserver-form';
  }
  document.getElementById('send').addEventListener('click', function (e) {
    if (this.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      var first = state.day === null ? dayEl : !state.slot ? slotEl : document.getElementById(document.getElementById('fname').value.trim() ? 'fphone' : 'fname');
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (first.focus) first.focus();
    }
  });
  render();
}
