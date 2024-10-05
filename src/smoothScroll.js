// butter.js, initial script not by me
// adapted to allow for fixed objects
var Butter = function() {

  var self = this;

  this.defaults = {
      wrapperId: 'root',
      wrapperDamper: 0.1,
      cancelOnTouch: false
  }
  
  this.validateOptions = function(ops) {
      for (var prop in ops) {
          if (self.defaults.hasOwnProperty(prop)) {
              Object.defineProperty(self.defaults, prop, {value: Object.getOwnPropertyDescriptor(ops, prop).value})
          }
      }
  }

  this.wrapperDamper = 0.011;
  this.wrapperId = "root";
  this.cancelOnTouch = false;
  this.wrapper = "";
  this.wrapperOffset = 0;
  this.animateId = "";
  this.resizing = false;
  this.active = false;
  this.wrapperHeight = "";
  this.bodyHeight= "";
};

Butter.prototype = {

  cleanup: function() {
      if (this.active) {
        window.cancelAnimationFrame(this.animateId); // Cancel the animation frame
    
        // Remove event listeners
        window.removeEventListener('resize', this.resize);
        if (this.cancelOnTouch) {
          window.removeEventListener('touchstart', this.cancel);
        }
    
        // Reset CSS styles
        this.wrapper.removeAttribute('style');
        document.body.removeAttribute('style');
    
        // Reset state variables
        this.wrapperOffset = 0;
        this.resizing = false;
        this.animateId = null;
        this.wrapperHeight = null;
        this.bodyHeight = null;
        this.active = false;
      }
    },

  init: function(options) {
      this.cleanup();
      
      if (options) {
          this.validateOptions(options);
      }

      this.active = true;
      this.resizing = false;
      this.wrapperDamper = this.defaults.wrapperDamper;
      this.wrapperId = this.defaults.wrapperId;
      this.cancelOnTouch = this.defaults.cancelOnTouch;

      this.wrapper = document.querySelector("#root")
      this.wrapper.style.position = 'fixed';
      this.wrapper.style.width = '100%';

      this.wrapperHeight = this.wrapper.clientHeight;
      document.body.style.height = this.wrapperHeight + 'px';

      window.addEventListener('resize', this.resize.bind(this));
      if (this.cancelOnTouch) {
          window.addEventListener('touchstart', this.cancel.bind(this));
      }
      this.wrapperOffset = 0.0;
      this.animateId = window.requestAnimationFrame(this.animate.bind(this));

  },

  wrapperUpdate: function() {
      var scrollY = (document.scrollingElement !== undefined) ? document.scrollingElement.scrollTop : (document.documentElement.scrollTop || 0.0);
      this.wrapperOffset += (scrollY - this.wrapperOffset) * this.wrapperDamper;
      var movementContainer = 'translate3d(0,' + (-this.wrapperOffset.toFixed(2)) + 'px, 0)';
      //var movementFixedElements = 'translate3d(0,' + (this.wrapperOffset.toFixed(2)) + 'px, 0)';
      this.wrapper.style.transform = `${movementContainer}` // WORKS
  
      //Check if the ".navbar" element is available in the DOM
      //var navbarElement = document.querySelector(".bg");
      //if (navbarElement) {
        //document.querySelector(".bg").style.transform = `${movementFixedElements}`;
// fixed el here
    
        

    //  }


  },

  checkResize: function() {
      if (this.wrapperHeight !== this.wrapper.clientHeight) {
          this.resize();
      }
  },

  resize: function() {
      var self = this;
      if (!self.resizing) {
          self.resizing = true;
          window.cancelAnimationFrame(self.animateId);
          window.setTimeout(function() {
              self.wrapperHeight = self.wrapper.clientHeight;
              if (parseInt(document.body.style.height) !== parseInt(self.wrapperHeight)) {
                  document.body.style.height = self.wrapperHeight + 'px';
              }
              self.animateId = window.requestAnimationFrame(self.animate.bind(self));
              self.resizing = false;
          }, 0)
      }
  },

  animate: function() {
      this.checkResize();
      this.wrapperUpdate();
      this.animateId = window.requestAnimationFrame(this.animate.bind(this));
  },

  cancel: function() {
      if (this.active) {
          window.cancelAnimationFrame(this.animateId);

          window.removeEventListener('resize', this.resize);
          window.removeEventListener('touchstart', this.cancel);
          this.wrapper.removeAttribute('style');
          document.body.removeAttribute('style');

          this.active = false;
          this.wrapper = "";
          this.wrapperOffset = 0;
          this.resizing = true;
          this.animateId = "";
      }
  },
};

const butterInstance = new Butter();
export default butterInstance;