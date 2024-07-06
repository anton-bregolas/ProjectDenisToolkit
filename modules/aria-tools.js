// Toggle the ARIA-expanded state of an element

export function toggleAriaExpanded(element) {

  if (element.getAttribute("aria-expanded") === "false") {

    element.setAttribute("aria-expanded", "true");
    return;
  } 
  
  element.setAttribute("aria-expanded", "false");
}

// Toggle the ARIA-hidden state of an element

export function toggleAriaHidden(element) {

  if (element.getAttribute("aria-hidden") === "true") {

    element.setAttribute("aria-hidden", "false");
    return;
  } 
  
  element.setAttribute("aria-hidden", "true");
}

// Add the ARIA-hidden state of an element

export function addAriaHidden(element) {
  
  element.setAttribute("aria-hidden", "true");
}

// Remove the ARIA-hidden state of an element

export function removeAriaHidden(element) {

  element.removeAttribute("aria-hidden");
}

// Make links, buttons and inputs inside an element focusable / not focusable

export function toggleTabIndex(element) {

  let focusableItems = ['a[href]', 'button:not([disabled])', 'input:not([disabled])'];

  focusableItems.forEach(itemType => {

    element.querySelectorAll(itemType).forEach(item => {

      // let tabIndex = item.getAttribute("tabindex") === "0"? "-1" : "0";

      if (item.getAttribute("tabindex") === "-1") {

        item.removeAttribute("tabindex");

        return;
      }
  
      item.setAttribute("tabindex", "-1");
    });
  });
}

// Set ARIA-label of the element to a specific value

export function setAriaLabel(element, value) {

  element.setAttribute("aria-label", value);
}