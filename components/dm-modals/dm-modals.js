/* #ProjectDenis: Modal Dialogs Scripts */

export function initModals() {

  const modalListTunes = document.querySelector('#dm-modal-list-tunes');
  const generateTunelistBtn = document.querySelector('#dm-btn-generate-tunelist');
  const closeTunelistBtn = document.querySelector('#dm-btn-modal-close');

  generateTunelistBtn.addEventListener('click', () => {

    modalListTunes.showModal();
  });

  closeTunelistBtn.addEventListener('click', () => {

    modalListTunes.close();
  });
}