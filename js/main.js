/* ============================================================
   LIGHTBOX
   Variabili di stato: tengono traccia di quale progetto
   è aperto e quale immagine della gallery è visibile.
============================================================ */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = lightbox.querySelector('.lightbox__img');
const lightboxTitle = lightbox.querySelector('.lightbox__title');
const lightboxDesc  = lightbox.querySelector('.lightbox__desc');
const lightboxDots  = lightbox.querySelector('.lightbox__dots');
const btnClose      = lightbox.querySelector('.lightbox__close');
const btnPrev       = lightbox.querySelector('.lightbox__arrow--prev');
const btnNext       = lightbox.querySelector('.lightbox__arrow--next');
const backdrop      = lightbox.querySelector('.lightbox__backdrop');

let gallery = [];   // array di immagini del progetto corrente
let current = 0;    // indice immagine attiva

// --- Apre il lightbox ---
function openLightbox(card) {
  // Leggiamo il data-gallery (JSON) se esiste, altrimenti
  // prendiamo solo l'immagine della card come array da 1 elemento
  const raw = card.dataset.gallery;
  gallery = raw ? JSON.parse(raw) : [card.querySelector('img').src];
  current = 0;

  // Leggiamo titolo e descrizione direttamente dall'HTML della card
  lightboxTitle.textContent = card.querySelector('h3').textContent;
  lightboxDesc.textContent  = card.querySelector('p').textContent;

  renderLightbox();

  // Aggiungiamo la classe che lo rende visibile
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');

  // Blocchiamo lo scroll della pagina sottostante
  document.body.style.overflow = 'hidden';
}

// --- Chiude il lightbox ---
function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// --- Aggiorna immagine e pallini ---
function renderLightbox() {
  lightboxImg.src = gallery[current];
  lightboxImg.alt = lightboxTitle.textContent;

  // Mostra/nascondi frecce in base alla posizione
  btnPrev.classList.toggle('is-hidden', gallery.length <= 1 || current === 0);
  btnNext.classList.toggle('is-hidden', gallery.length <= 1 || current === gallery.length - 1);

  // Ricostruisce i pallini indicatori
  lightboxDots.innerHTML = '';
  if (gallery.length > 1) {
    gallery.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'lightbox__dot' + (i === current ? ' is-active' : '');
      dot.setAttribute('aria-label', `Immagine ${i + 1}`);
      dot.addEventListener('click', () => { current = i; renderLightbox(); });
      lightboxDots.appendChild(dot);
    });
  }
}

// --- Event listeners ---

// Click su ogni project-card → apre il lightbox
document.querySelectorAll('.project-card').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => openLightbox(card));
});

btnClose.addEventListener('click', closeLightbox);
backdrop.addEventListener('click', closeLightbox);

btnPrev.addEventListener('click', (e) => {
  e.stopPropagation(); // evita che il click si propaghi al backdrop
  if (current > 0) { current--; renderLightbox(); }
});

btnNext.addEventListener('click', (e) => {
  e.stopPropagation();
  if (current < gallery.length - 1) { current++; renderLightbox(); }
});

// Tasto ESC chiude, frecce ← → navigano
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  { if (current > 0) { current--; renderLightbox(); } }
  if (e.key === 'ArrowRight') { if (current < gallery.length - 1) { current++; renderLightbox(); } }
});


/* ============================================================
   1. ANNO AUTOMATICO NEL FOOTER
   document.getElementById cerca nell'HTML l'elemento
   con id="year" e gli inserisce l'anno corrente.
   new Date() crea un oggetto data con il momento attuale.
   .getFullYear() estrae solo l'anno (es. 2026).
============================================================ */
document.getElementById('year').textContent = new Date().getFullYear();


/* ============================================================
   2. NAVBAR CHE CAMBIA ALLO SCROLL
   window.addEventListener('scroll', fn) esegue fn ogni volta
   che l'utente scrolla la pagina.
   window.scrollY è la quantità di pixel scrollati dall'alto.
   Se è maggiore di 20px, aggiungiamo la classe CSS
   'navbar--scrolled' alla navbar — questa classe cambia
   lo stile nel CSS (sfondo più opaco).
   classList.toggle(class, condition) aggiunge la classe
   se condition è true, la rimuove se è false.
============================================================ */
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('navbar--scrolled', window.scrollY > 20);
});


/* ============================================================
   3. SMOOTH SCROLL CON OFFSET PER LA NAVBAR
   Il problema: con position:fixed la navbar copre il titolo
   della sezione quando usi gli anchor link (#about, ecc.).
   La soluzione: intercettiamo il click sui link interni,
   calcoliamo la posizione reale dell'elemento target,
   sottraiamo l'altezza della navbar, e scrolliamo lì.

   querySelectorAll('a[href^="#"]') seleziona tutti i link
   il cui href inizia con "#" — cioè solo i link interni.
   forEach esegue la stessa funzione per ciascuno di essi.
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {

  link.addEventListener('click', event => {

    // Blocchiamo il comportamento di default del browser
    // (che salterebbe alla sezione senza offset)
    event.preventDefault();

    // Leggiamo l'href del link cliccato, es. "#about"
    const targetId = link.getAttribute('href');

    // Troviamo l'elemento HTML corrispondente
    const targetEl = document.querySelector(targetId);

    if (targetEl) {
      // Calcoliamo la posizione dell'elemento dall'alto della pagina
      // offsetTop è la distanza dal top del documento
      // navbar.offsetHeight è l'altezza attuale della navbar in px
      // 24 è un margine extra di respiro visivo
      const offset = targetEl.offsetTop - navbar.offsetHeight - 24;

      window.scrollTo({
        top: offset,
        behavior: 'smooth'  // animazione fluida nativa del browser
      });
    }
  });
});
