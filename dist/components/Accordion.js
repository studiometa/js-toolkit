"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _abstracts = require("../abstracts");

function _createSuper(Derived) { return function () { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * AccorionItem class.
 */
var AccordionItem = /*#__PURE__*/function (_Base) {
  (0, _inherits2["default"])(AccordionItem, _Base);

  var _super = _createSuper(AccordionItem);

  function AccordionItem() {
    (0, _classCallCheck2["default"])(this, AccordionItem);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(AccordionItem, [{
    key: "mounted",

    /**
     * Initialize the component's behaviours.
     *
     * @return {AccordionItem} The current instance.
     */
    value: function mounted() {
      this.$refs.btn.setAttribute('id', this.$id);
      this.$refs.btn.addEventListener('click', this);
      this.$refs.content.setAttribute('aria-labelledby', this.$id); // Animation properties

      this.animationTimeStart = 0; // Padding top

      this.animationPaddingTopFrom = 0;
      this.animationPaddingTopTo = 0; // Height

      this.animationHeightFrom = 0;
      this.animationHeightTo = 0; // Padding bottom

      this.animationPaddingBottomFrom = 0;
      this.animationPaddingBottomTo = 0;

      if (!this.isOpen) {
        this.close(false);
      }

      return this;
    }
    /**
     * Unbind all events on destroy.
     *
     * @return {AccordionItem} The AccordionItem instance.
     */

  }, {
    key: "destroyed",
    value: function destroyed() {
      this.$el.removeEventListener('click', this);
      return this;
    }
    /**
     * Accordion animation renderer.
     */

  }, {
    key: "ticked",
    value: function ticked(_ref) {
      var time = _ref.time;

      if (this.animationTimeStart) {
        if (this.$refs.content.style.overflow !== 'hidden') {
          this.$refs.content.style.display = '';
          this.$refs.content.style.overflow = 'hidden';
        }

        if (time <= this.animationTimeStart + this.$options.animationDuration) {
          if (!this.isOpen) {
            /**
             * Percent calcul:
             * -((time - this.animationTimeStart) / this.$options.animationDuration) * this.animationHeightFrom + this.animationHeightFrom
             */
            this.$refs.content.style.paddingTop = "".concat(parseInt(-((time - this.animationTimeStart) / this.$options.animationDuration) * this.animationPaddingTopFrom + this.animationPaddingTopFrom, 10), "px");
            this.$refs.content.style.height = "".concat(parseInt(-((time - this.animationTimeStart) / this.$options.animationDuration) * this.animationHeightFrom + this.animationHeightFrom, 10), "px");
            this.$refs.content.style.paddingBottom = "".concat(parseInt(-((time - this.animationTimeStart) / this.$options.animationDuration) * this.animationPaddingBottomFrom + this.animationPaddingBottomFrom, 10), "px");
          } else {
            /**
             * Percent calcul:
             * this.animationHeightTo * ((time - this.animationTimeStart) / this.$options.animationDuration)
             */
            this.$refs.content.style.paddingTop = "".concat(parseInt(this.animationPaddingTopTo * ((time - this.animationTimeStart) / this.$options.animationDuration), 10), "px");
            this.$refs.content.style.height = "".concat(parseInt(this.animationHeightTo * ((time - this.animationTimeStart) / this.$options.animationDuration), 10), "px");
            this.$refs.content.style.paddingBottom = "".concat(parseInt(this.animationPaddingBottomTo * ((time - this.animationTimeStart) / this.$options.animationDuration), 10), "px");
          }
        } else {
          this.animationTimeStart = 0; // Padding top

          this.animationPaddingTopFrom = 0;
          this.animationPaddingTopTo = 0; // Height

          this.animationHeightFrom = 0;
          this.animationHeightTo = 0; // Padding bottom

          this.animationPaddingBottomFrom = 0;
          this.animationPaddingBottomTo = 0; // Styles

          this.$refs.content.style.paddingTop = '';
          this.$refs.content.style.paddingBottom = '';
          this.$refs.content.style.height = '';
          this.$refs.content.style.overflow = '';
          this.onComplete();
        }
      }
    }
    /**
     * AccordionItem is animation complete.
     */

  }, {
    key: "onComplete",
    value: function onComplete() {
      if (this.isOpen) {
        this.$refs.content.style.display = '';
      } else {
        this.$refs.content.style.display = 'none';
      }

      this.$emit('afterAnimation', this);
    }
    /**
     * AccordionItem register event.
     */

  }, {
    key: "handleEvent",
    value: function handleEvent(event) {
      try {
        this["".concat(event.type, "Handler")](event);
      } catch (err) {
        console.warn("The method `".concat(event.type, "Handler` does not exists."));
      }
    }
    /**
     * AccordionItem click event.
     */

  }, {
    key: "clickHandler",
    value: function clickHandler() {
      this.$log('clickHandler');

      if (this.animationTimeStart) {
        return;
      }

      this.$emit('beforeAnimation', this);

      if (this.isOpen) {
        this.close(this.$options.animation);
      } else {
        this.open(this.$options.animation);
      }
    }
    /**
     * AccordionItem open function.
     *
     * @param {Boolean} animate Open the AccordionItem or not.
     */

  }, {
    key: "open",
    value: function open() {
      var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      this.$emit('open', this);
      this.$refs.content.setAttribute('aria-hidden', 'false');
      this.$refs.content.removeAttribute('tabindex');

      if (!animate) {
        this.$refs.content.style.display = '';
        this.$el.classList.remove('is-close');
        this.$el.classList.add('is-open');
        return;
      }

      this.animationPaddingTopFrom = parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-top')) || 0;
      this.animationHeightFrom = parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('height')) || 0;
      this.animationPaddingBottomFrom = parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-bottom')) || 0;
      this.$refs.content.style.display = 'block';
      this.$refs.content.style.paddingTop = '';
      this.$refs.content.style.height = '';
      this.$refs.content.style.paddingBottom = '';
      this.$refs.content.style.transition = 'none';
      this.$refs.content.style.animationDuration = '0s';
      this.animationPaddingTopTo = parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-top')) || 0;
      this.animationHeightTo = parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('height')) || 0;
      this.animationPaddingBottomTo = parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-bottom')) || 0;

      if (this.animationTimeStart) {
        this.$refs.content.style.display = '';
        this.$refs.content.style.paddingTop = "".concat(this.animationPaddingTopFrom, "px");
        this.$refs.content.style.height = "".concat(this.animationHeightFrom, "px");
        this.$refs.content.style.paddingBottom = "".concat(this.animationPaddingBottomFrom, "px");
      } else {
        this.$refs.content.style.display = 'none';
      }

      this.$refs.content.style.transition = '';
      this.$refs.content.style.animationDuration = ''; // eslint-disable-next-line no-undef

      this.animationTimeStart = performance.now();
    }
    /**
     * AccordionItem close function.
     *
     * @param {Boolean} animate Close the AccordionItem or not.
     */

  }, {
    key: "close",
    value: function close() {
      var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      this.$emit('close', this);
      this.$refs.content.setAttribute('aria-hidden', 'true');
      this.$refs.content.setAttribute('tabindex', '-1');

      if (!animate) {
        this.$refs.content.style.display = 'none';
        this.$el.classList.remove('is-open');
        this.$el.classList.add('is-close');
        return;
      }

      this.animationPaddingTopFrom = parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-top')) || 0;
      this.animationHeightFrom = parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('height')) || 0;
      this.animationPaddingBottomFrom = parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-bottom')) || 0;
      this.animationPaddingTopTo = 0;
      this.animationHeightTo = 0;
      this.animationPaddingBottomTo = 0; // eslint-disable-next-line no-undef

      this.animationTimeStart = performance.now();
    }
    /**
     * AccordionItem is open getter.
     */

  }, {
    key: "config",

    /**
     * AccordionItem options.
     */
    get: function get() {
      return {
        name: 'AccordionItem',
        animation: true,
        animationDuration: 300
      };
    }
  }, {
    key: "isOpen",
    get: function get() {
      return this.$refs.content.getAttribute('aria-hidden') === 'false' || this.$refs.content.getAttribute('aria-hidden') === null;
    }
  }]);
  return AccordionItem;
}(_abstracts.Base);
/**
 * Accordion class.
 */


var Accordion = /*#__PURE__*/function (_Base2) {
  (0, _inherits2["default"])(Accordion, _Base2);

  var _super2 = _createSuper(Accordion);

  function Accordion() {
    (0, _classCallCheck2["default"])(this, Accordion);
    return _super2.apply(this, arguments);
  }

  (0, _createClass2["default"])(Accordion, [{
    key: "mounted",

    /**
     * Initialize the component's behaviours.
     *
     * @return {Accordion} The current instance.
     */
    value: function mounted() {
      var _this = this;

      if (this.$options.autoClose) {
        this.unbindOpen = this.$children.AccordionItem.map(function (item, index) {
          return item.$on('open', function () {
            _this.openHandler(index);
          });
        });
      }

      return this;
    }
    /**
     * Unbind all events on destroy.
     *
     * @return {Accordion} The Accordion instance.
     */

  }, {
    key: "destroyed",
    value: function destroyed() {
      if (this.unbindOpen) {
        this.unbindOpen.forEach(function (unbind) {
          return unbind();
        });
      }

      return this;
    }
    /**
     * Accordion open event.
     *
     * @param {Integer} index The AccordionItem index.
     */

  }, {
    key: "openHandler",
    value: function openHandler() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      this.$children.AccordionItem.filter(function (el, i) {
        return index !== i;
      }).forEach(function (item) {
        if (item.isOpen) {
          item.close();
        }
      });
    }
  }, {
    key: "config",

    /**
     * Accordion options.
     */
    get: function get() {
      return {
        name: 'Accordion',
        components: {
          AccordionItem: AccordionItem
        },
        autoClose: false
      };
    }
  }]);
  return Accordion;
}(_abstracts.Base);

exports["default"] = Accordion;
//# sourceMappingURL=Accordion.js.map