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

  // console.warn("AriaHidden added:", element);
}

// Remove the ARIA-hidden state of an element

export function removeAriaHidden(element) {

  element.removeAttribute("aria-hidden");

  // console.warn("AriaHidden removed:", element);
}

// Toggle links, buttons and inputs inside an element focusable / not focusable

export function toggleTabIndex(element) {

  let focusableItems = ['a[href]', 'button:not([disabled])', 'input:not([disabled])'];

  focusableItems.forEach(itemType => {

    element.querySelectorAll(itemType).forEach(item => {

      let tabIndex = item.getAttribute("tabindex") === "0"? "-1" : "0";

      item.setAttribute("tabindex", tabIndex);

      return;
    });
  });
}

// Remove tabindex from children of element if it matches the value specified

export function groupRemoveTabIndex(element, tabindex) {

  let focusableItems = ['a[href]', 'button:not([disabled])', 'input:not([disabled])'];

  focusableItems.forEach(itemType => {

    element.querySelectorAll(itemType).forEach(item => {

      if (item.getAttribute("tabindex") === tabindex) {

        item.removeAttribute("tabindex");

        // console.warn("Tabindex removed:", item);
      }
    });
  });
}

// Make focusable links, buttons and inputs inside an element focusable/unfocusable

export function groupAddTabIndex(element, tabindex) {

  let focusableItems = ['a[href]', 'button:not([disabled])', 'input:not([disabled])'];

  focusableItems.forEach(itemType => {

    element.querySelectorAll(itemType).forEach(item => {

      item.setAttribute("tabindex", tabindex);

      // console.warn(`Tabindex ${tabindex} added:`, item);
    });
  });
}

// Set ARIA-label of the element to a specific value

export function setAriaLabel(element, value) {

  element.setAttribute("aria-label", value);
}