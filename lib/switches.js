import { on } from "./events/events";

export function outerHTML(oldEl, newEl) {
  oldEl.outerHTML = newEl.outerHTML;
  this.onSwitch();
}
export function innerHTML(oldEl, newEl) {
  oldEl.innerHTML = newEl.innerHTML;

  if (newEl.className === "") {
    oldEl.removeAttribute("class");
  } else {
    oldEl.className = newEl.className;
  }

  this.onSwitch();
}
export function switchElementsAlt(oldEl, newEl) {
  oldEl.innerHTML = newEl.innerHTML;

  // Copy attributes from the new element to the old one
  if (newEl.hasAttributes()) {
    let attrs = newEl.attributes;
    for (let i = 0; i < attrs.length; i++) {
      oldEl.attributes.setNamedItem(attrs[i].cloneNode());
    }
  }

  this.onSwitch();
}
export function replaceNode(oldEl, newEl) {
  oldEl.parentNode.replaceChild(newEl, oldEl);
  this.onSwitch();
}
export function sideBySide(oldEl, newEl, options, switchOptions) {
  let forEach = Array.prototype.forEach;
  let elsToRemove = [];
  let elsToAdd = [];
  let fragToAppend = document.createDocumentFragment();
  let animationEventNames = "animationend webkitAnimationEnd MSAnimationEnd oanimationend";
  let animatedElsNumber = 0;
  let sexyAnimationEnd = function (e) {
    if (e.target !== e.currentTarget) {
      // end triggered by an animation on a child
      return;
    }

    animatedElsNumber--;
    if (animatedElsNumber <= 0 && elsToRemove) {
      elsToRemove.forEach(function (el) {
        // browsing quickly can make the el
        // already removed by last page update ?
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });

      elsToAdd.forEach(function (el) {
        el.className = el.className.replace(
          el.getAttribute("data-pjax-classes"),
          ""
        );
        el.removeAttribute("data-pjax-classes");
      });

      elsToAdd = null; // free memory
      elsToRemove = null; // free memory


      // this is to trigger some repaint (example: picturefill)
      this.onSwitch();
    }
  }.bind(this);

  switchOptions = switchOptions || {};

  forEach.call(oldEl.childNodes, function (el) {
    elsToRemove.push(el);
    if (el.classList && !el.classList.contains("js-Pjax-remove")) {
      // for fast switch, clean element that just have been added, & not cleaned yet.
      if (el.hasAttribute("data-pjax-classes")) {
        el.className = el.className.replace(
          el.getAttribute("data-pjax-classes"),
          ""
        );
        el.removeAttribute("data-pjax-classes");
      }
      el.classList.add("js-Pjax-remove");
      if (switchOptions.callbacks && switchOptions.callbacks.removeElement) {
        switchOptions.callbacks.removeElement(el);
      }
      if (switchOptions.classNames) {
        el.className +=
          " " +
          switchOptions.classNames.remove +
          " " +
          (options.backward
            ? switchOptions.classNames.backward
            : switchOptions.classNames.forward);
      }
      animatedElsNumber++;
      on(el, animationEventNames, sexyAnimationEnd, true);
    }
  });

  forEach.call(newEl.childNodes, function (el) {
    if (el.classList) {
      let addClasses = "";
      if (switchOptions.classNames) {
        addClasses =
          " js-Pjax-add " +
          switchOptions.classNames.add +
          " " +
          (options.backward
            ? switchOptions.classNames.forward
            : switchOptions.classNames.backward);
      }
      if (switchOptions.callbacks && switchOptions.callbacks.addElement) {
        switchOptions.callbacks.addElement(el);
      }
      el.className += addClasses;
      el.setAttribute("data-pjax-classes", addClasses);
      elsToAdd.push(el);
      fragToAppend.appendChild(el);
      animatedElsNumber++;
      on(el, animationEventNames, sexyAnimationEnd, true);
    }
  });

  // pass all className of the parent
  oldEl.className = newEl.className;
  oldEl.appendChild(fragToAppend);
}
