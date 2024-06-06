/* #ProjectDenis Popovers Scripts*/

import { toggleAriaHidden } from '../../modules/aria-tools.js'

export const tuneCardPopover = document.querySelector('#dm-popover-card-tune');

export function showTunePopover() {
  
  tuneCardPopover.showPopover();
  tuneCardPopover.classList.toggle("hidden");
  toggleAriaHidden(tuneCardPopover);
}

export function initPopovers() {

  const closeTuneCardBtn = document.querySelector('#dm-btn-popover-close');

  closeTuneCardBtn.addEventListener('click', () => {

    tuneCardPopover.hidePopover();
    tuneCardPopover.classList.toggle("hidden");
    toggleAriaHidden(tuneCardPopover);
  });
}
