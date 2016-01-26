var Modal = (function (document, window) {
  'use strict';

  var methods,
    trigger,
    modals,
    modalsbg,
    content,
    closers,
    isOpen,
    contentDelay,
    getId,
    makeDiv,
    moveTrig,
    open,
    close,
    bindActions,
    init;
  
  methods = {
    qsa: function (el) {
      return document.querySelectorAll(el);
    }
  };

  trigger = methods.qsa('.modal__trigger');
  modals = methods.qsa('.modal');
  modalsbg = methods.qsa('.modal__bg');
  content = methods.qsa('.modal__content');
  closers = methods.qsa('.modal__close');
  isOpen = false;
  contentDelay = 400;

  getId = function (event) {
    var self, modalId, len, modalIdTrimmed, modal;
    
    event.preventDefault();
    self = this;
    modalId = self.dataset.modal;
    len = modalId.length;
    modalIdTrimmed = modalId.substring(1, len);
    modal = document.getElementById(modalIdTrimmed);
    makeDiv(self, modal);
  };

  makeDiv = function (self, modal) {
    var tempdiv, div;

    tempdiv = document.getElementById('modal__temp');

    if (tempdiv === null) {
      div = document.createElement('div');
      div.id = 'modal__temp';
      self.appendChild(div);
      div.style.backgroundColor = window.getComputedStyle(self).backgroundColor;
      moveTrig(self, modal, div);
    }
  };

  moveTrig = function (trig, modal, div) {
    var trigProps, mProps, transX, transY, scaleX, scaleY, xc, yc;
    
    trigProps = trig.getBoundingClientRect();
    mProps = modal.querySelector('.modal__content').getBoundingClientRect();
    xc = window.innerWidth / 2;
    yc = window.innerHeight / 2;

    // this class increases z-index value so the button goes overtop the other buttons
    trig.classList.add('modal__trigger--active');

    // these values are used for scale the temporary div to the same size as the modal
    scaleX = mProps.width / trigProps.width;
    scaleY = mProps.height / trigProps.height;

    scaleX = scaleX.toFixed(3); // round to 3 decimal places
    scaleY = scaleY.toFixed(3);

    // these values are used to move the button to the center of the window
    transX = Math.round(xc - trigProps.left - trigProps.width / 2);
    transY = Math.round(yc - trigProps.top - trigProps.height / 2);

    // if the modal is aligned to the top then move the button to the center-y of the modal instead of the window
    if (modal.classList.contains('modal--align-top')) {
      transY = Math.round(mProps.height / 2 + mProps.top - trigProps.top - trigProps.height / 2);
    }

    // translate button to center of screen
    trig.style.transform = 'translate(' + transX + 'px, ' + transY + 'px)';
    trig.style.webkitTransform = 'translate(' + transX + 'px, ' + transY + 'px)';

    // expand temporary div to the same size as the modal
    div.style.backgroundColor = '#fff'; // transitions background color
    div.style.transform = 'scale(' + scaleX + ',' + scaleY + ')';
    div.style.webkitTransform = 'scale(' + scaleX + ',' + scaleY + ')';

    window.setTimeout(function () {
      window.requestAnimationFrame(function () {
        open(modal, div);
      });
    }, contentDelay);
  };

  open = function (m, div) {
    function hideDiv() {
      // fadeout div so that it can't be seen when the window is resized
      div.style.opacity = '0';
      content.removeEventListener('transitionend', hideDiv, false);
    }

    if (!isOpen) {
      // select the content inside the modal
      var content = m.querySelector('.modal__content');
      // reveal the modal
      m.classList.add('modal--active');
      // reveal the modal content
      content.classList.add('modal__content--active');

      content.addEventListener('transitionend', hideDiv, false);

      isOpen = true;
    }
  };

  close = function (event) {
    var target, div, i;
    
    target = event.target;
    div = document.getElementById('modal__temp');

    function removeDiv() {
      setTimeout(function () {
        window.requestAnimationFrame(function () {
          div.remove();
        });
      }, contentDelay - 50);
    }

    if ((isOpen && target.classList.contains('modal__bg')) || target.classList.contains('modal__close')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      // make the hidden div visible again and remove the transforms so it scales back to its original size
      div.style.opacity = '1';
      // div.style.backgroundColor = window.getComputedStyle(self).backgroundColor;
      div.removeAttribute('style');

      /* Remove active classes from triggers */
      for (i = 0; i < trigger.length; i++) {
        trigger[i].style.transform = 'none';
        trigger[i].style.webkitTransform = 'none';
        trigger[i].classList.remove('modal__trigger--active');
      }

      /* Remove active classes from modals */
      for (i = 0; i < modals.length; i++) {
        modals[i].classList.remove('modal--active');
        content[i].classList.remove('modal__content--active');
      }

      // when the temporary div is opacity:1 again, we want to remove it from the dom
      div.addEventListener('transitionend', removeDiv, false);

      isOpen = false;
    }
  };

  bindActions = function () {
    var i;

    /* bind triggers */
    for (i = 0; i < trigger.length; i++) {
      trigger[i].addEventListener('click', getId, false);
    }

    /* bind modals */
    for (i = 0; i < closers.length; i++) {
      closers[i].addEventListener('click', close, false);
    }

    /* bind modal__bgs */
    for (i = 0; i < modalsbg.length; i++) {
      modalsbg[i].addEventListener('click', close, false);
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
