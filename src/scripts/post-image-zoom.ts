let dialog: HTMLDialogElement | undefined;
let previousFocus: HTMLElement | null = null;

function prepareImages() {
  document.querySelectorAll<HTMLImageElement>('.posttext img:not(a img)').forEach((image) => {
    image.dataset.zoomable = '';
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', image.alt ? `Enlarge image: ${image.alt}` : 'Enlarge image');
  });
}

function closeZoom() {
  if (!dialog) return;
  dialog.close();
  dialog.remove();
  dialog = undefined;
  if (previousFocus?.isConnected) previousFocus.focus();
  previousFocus = null;
}

function openZoom(image: HTMLImageElement) {
  if (dialog) return;
  previousFocus = image;
  dialog = document.createElement('dialog');
  dialog.className = 'post-image-zoom';
  dialog.setAttribute('aria-label', 'Enlarged image');
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close image');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', closeZoom);
  const enlarged = document.createElement('img');
  enlarged.src = image.currentSrc || image.src;
  enlarged.alt = image.alt;
  dialog.append(closeButton, enlarged);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeZoom(); });
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeZoom(); });
  document.body.append(dialog);
  dialog.showModal();
}

document.addEventListener('astro:page-load', prepareImages);
document.addEventListener('astro:before-swap', closeZoom);
document.addEventListener('click', (event) => {
  const image = (event.target as Element).closest<HTMLImageElement>('.posttext img[data-zoomable]');
  if (image) openZoom(image);
});
document.addEventListener('keydown', (event) => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.matches('.posttext img[data-zoomable]') && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    openZoom(image);
  }
});
