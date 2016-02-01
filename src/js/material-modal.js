var Modal = (function (document, window) {
  'use strict';

  var methods,
    triggers,
    modals,
    modalBackdrops,
    content,
    closers,
    isOpen,
    contentDelay,
    getTargetModal,
    getHelperDiv,
    animateTrigger,
    fadeIn,
    close,
    bindActions,
    init,
    open;
  
  methods = {
    // Shorthand method for convenience.
    qsa: function (el) {
      return document.querySelectorAll(el);
    }
  };

  isOpen = false;

  open = function (event) {
    var triggerButton, modal, helperDiv;
    
    event.preventDefault();
    
    triggerButton = this;
    
    // Determine target modal.
    modal = getTargetModal(triggerButton);
    
    // Retrieve helper div for animation.
    // The helper div has the same dimensions as the trigger button.
    helperDiv = getHelperDiv(triggerButton);
    
    // Animate the helper div to the position and size of the modal.
    animateTrigger(triggerButton, modal, helperDiv);
  };

  getTargetModal = function (triggerButton) {
    var modalId;
    
    modalId = triggerButton.dataset.modal;
    
    // Remove # symbol at the beginning
    modalId = modalId.substring(1, modalId.length);
    return document.getElementById(modalId);
  };

  getHelperDiv = function (triggerButton) {
    var tempdiv, div;

    tempdiv = document.getElementById('modal__temp');

    if (tempdiv === null) {
      div = document.createElement('div');
      div.id = 'modal__temp';
      triggerButton.appendChild(div);
      div.style.backgroundColor = window.getComputedStyle(triggerButton).backgroundColor;
      return div;
    }
  };

  animateTrigger = function (triggerButton, modal, helperDiv) {
    var triggerProperties, modalProperties, translateX, translateY, scaleX, scaleY;
    
    triggerProperties = triggerButton.getBoundingClientRect();
    modalProperties = modal.querySelector('.modal__content').getBoundingClientRect();

    // This class increases the z-index value, so the button goes overtop the other buttons.
    triggerButton.classList.add('modal__trigger--active');

    // These values are used to scale the helper div to the same size as the modal.
    scaleX = modalProperties.width / triggerProperties.width;
    scaleY = modalProperties.height / triggerProperties.height;

    // Round to 3 decimal places.
    scaleX = scaleX.toFixed(3);
    scaleY = scaleY.toFixed(3);

    // These values are used to move the button to the center of the window.
    translateX = Math.round((window.innerWidth / 2) -
                            triggerProperties.left -
                            (triggerProperties.width / 2));
    translateY = Math.round((window.innerHeight / 2) -
                            triggerProperties.top -
                            (triggerProperties.height / 2));

    // If the modal is aligned to the top, then move the button to the center-y of the modal instead
    // of the window.
    if (modal.classList.contains('modal--align-top')) {
      translateY = Math.round(modalProperties.top +
                              (modalProperties.height / 2) -
                              triggerProperties.top -
                              (triggerProperties.height / 2));
    }

    // Translate the button to the center where the modal is about to appear (transition).
    triggerButton.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px)';
    triggerButton.style.webkitTransform = 'translate(' + translateX + 'px, ' + translateY + 'px)';

    // Expand the helper div to the same size as the modal (transition).
    // Destination properties: background-color and transform.
    helperDiv.style.backgroundColor = '#fff';
    helperDiv.style.transform = 'scale(' + scaleX + ', ' + scaleY + ')';
    helperDiv.style.webkitTransform = 'scale(' + scaleX + ', ' + scaleY + ')';

    // Fade in modal with a css defined delay of 0.4s.
    fadeIn(modal, helperDiv);
  };

  fadeIn = function (modal, helperDiv) {
    function hideDiv() {
      // fadeout div so that it can't be seen when the window is resized
      helperDiv.style.opacity = '0';
      content.removeEventListener('transitionend', hideDiv, false);
    }

    if (!isOpen) {
      // select the content inside the modal
      var content = modal.querySelector('.modal__content');
      // Reveal the modal (includes backdrop).
      modal.classList.add('modal--active');
      // Reveal the modal content (actual modal window).
      content.classList.add('modal__content--active');

      content.addEventListener('transitionend', hideDiv, false);

      isOpen = true;
    }
  };

  close = function (event) {
    var target, helperDiv, i;
    
    target = event.target;
    helperDiv = document.getElementById('modal__temp');

    function removeHelperDiv(event) {
      if(event.target === helperDiv &&
         event.propertyName === 'transform') {
        // The event listener is removed, too.
        helperDiv.remove();
      }
    }

    if ((isOpen && target.classList.contains('modal__backdrop')) ||
        target.classList.contains('modal__close')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      
      // Make the helper div visible again and remove the transforms so it scales back to its
      // original size.
      // When the helper div finished transforming back, remove it from the DOM.
      helperDiv.addEventListener('transitionend', removeHelperDiv, false);
      helperDiv.style.opacity = '1';
      helperDiv.removeAttribute('style');

      // Remove active classes from triggers.
      for (i = 0; i < triggers.length; i++) {
        triggers[i].style.transform = 'none';
        triggers[i].style.webkitTransform = 'none';
        triggers[i].classList.remove('modal__trigger--active');
      }

      // Remove active classes from modals.
      for (i = 0; i < modals.length; i++) {
        modals[i].classList.remove('modal--active');
        content[i].classList.remove('modal__content--active');
      }

      isOpen = false;
    }
  };

  bindActions = function () {
    var i;

    // Initialize arrays.
    triggers = methods.qsa('.modal__trigger');
    modals = methods.qsa('.modal');
    modalBackdrops = methods.qsa('.modal__backdrop');
    content = methods.qsa('.modal__content');
    closers = methods.qsa('.modal__close');
    
    // Auto-bind triggers.
    for (i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', open, false);
    }

    // Auto-bind modal close buttons.
    for (i = 0; i < closers.length; i++) {
      closers[i].addEventListener('click', close, false);
    }

    // Auto-bind modal backgrounds.
    for (i = 0; i < modalBackdrops.length; i++) {
      modalBackdrops[i].addEventListener('click', close, false);
    }
  };

  init = function () {
    bindActions();
  };

  return {
    init: init
  };

}(document, window));

Modal.init();
