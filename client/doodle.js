"use strict";

/* Intro
 *
 */

//the global object
var doodle = {};
//packages
doodle.geom = {};
doodle.events = {};

/* ES5 compatibility
 */
  
if (typeof Function.prototype.bind !== 'function') {
  Function.prototype.bind = function (thisArg /*, args...*/) {
    var fn = this;
    return function () {
      return fn.apply(thisArg, arguments);
    };
  };
}
/*globals doodle, document*/

/**
 * Doodle utilty functions.
 * @name doodle.utils
 * @class
 * @augments Object
 * @static
 */
doodle.utils = Object.create({}, {

  /*
   * COLOR UTILS
   */

  /**
   * @name hex_to_rgb
   * @param {Color} color
   * @return {Array} [r, g, b]
   * @throws {TypeError}
   * @static
   */
  'hex_to_rgb': {
    enumerable: true,
    writable: false,
    configurable: false,
    value:function (color) {
      //number in octal format or string prefixed with #
      if (typeof color === 'string') {
        color = (color[0] === '#') ? color.slice(1) : color;
        color = parseInt(color, 16);
      }
      return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];
    }
  },

  /**
   * @name hex_to_rgb_str
   * @param {Color} color
   * @param {number} alpha
   * @return {string}
   * @throws {TypeError}
   * @static
   */
  'hex_to_rgb_str': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function (color, alpha) {
      var doodle_utils = doodle.utils;
      alpha = (alpha === undefined) ? 1 : alpha;
      color = doodle_utils.hex_to_rgb(color);
      return doodle_utils.rgb_to_rgb_str(color[0], color[1], color[2], alpha);
    }
  },
  
  /**
   * @name rgb_str_to_hex
   * @param {string} rgb_str
   * @return {string}
   * @throws {TypeError}
   * @static
   */
  'rgb_str_to_hex': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function (rgb_str) {
      var doodle_utils = doodle.utils,
          rgb = doodle_utils.rgb_str_to_rgb(rgb_str);
      return doodle_utils.rgb_to_hex(parseInt(rgb[0], 10), parseInt(rgb[1], 10), parseInt(rgb[2], 10));
    }
  },

  /**
   * @name rgb_str_to_rgb
   * @param {Color} color
   * @return {Array}
   * @throws {TypeError}
   * @throws {SyntaxError}
   * @static
   */
  'rgb_str_to_rgb': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: (function () {
      var rgb_regexp = new RegExp("^rgba?\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,?(.*)\\)$");
      return function (color) {
        color = color.trim().match(rgb_regexp);
        var rgb = [parseInt(color[1], 10),
                   parseInt(color[2], 10),
                   parseInt(color[3], 10)],
            alpha = parseFloat(color[4]);
        if (typeof alpha === 'number' && !isNaN(alpha)) {
          rgb.push(alpha);
        }
        return rgb;
      };
    }())
  },
  
  /**
   * @name rgb_to_hex
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @return {string}
   * @throws {TypeError}
   * @static
   */
  'rgb_to_hex': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function (r, g, b) {
      var hex_color = (b | (g << 8) | (r << 16)).toString(16);
      return '#'+ String('000000'+hex_color).slice(-6); //pad out
    }
  },

  /**
   * @name rgb_to_rgb_str
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} a
   * @return {string}
   * @throws {TypeError}
   * @static
   */
  'rgb_to_rgb_str': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function (r, g, b, a) {
      a = (a === undefined) ? 1 : a;
      a = (a < 0) ? 0 : ((a > 1) ? 1 : a);
      if (a === 1) {
        return "rgb("+ r +","+ g +","+ b +")";
      } else {
        return "rgba("+ r +","+ g +","+ b +","+ a +")";
      }
    }
  },

  /*
   * DOM ACCESS
   */

  /**
   * Returns HTML element from id name or element itself.
   * @name get_element
   * @param {HTMLElement|string} element
   * @return {HTMLElement}
   * @static
   */
  'get_element': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function (element) {
      if (typeof element === 'string') {
        //lop off pound-sign if given
        element = (element[0] === '#') ? element.slice(1) : element;
        return document.getElementById(element);
      } else {
        //if it has an element property, we'll call it an element
        return (element && element.tagName) ? element : null;
      }
    }
  },

  /**
   * Returns css property of element, it's own or inherited.
   * @name get_style_property
   * @param {HTMLElement} element
   * @param {string} property
   * @param {boolean} useComputedStyle
   * @return {*}
   * @throws {TypeError}
   * @throws {ReferenceError}
   * @static
   */
  'get_style_property': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function (element, property, useComputedStyle) {
      useComputedStyle = (useComputedStyle === undefined) ? true : false;
      try {
        if (useComputedStyle && document.defaultView && document.defaultView.getComputedStyle) {
          return document.defaultView.getComputedStyle(element, null)[property];
        } else if (element.currentStyle) {
          return element.currentStyle[property];
        } else if (element.style) {
          return element.style[property];
        } else {
          throw new ReferenceError("get_style_property: Cannot read property '"+property+"' of "+element+".");
        }
      } catch (e) {
        throw new ReferenceError("get_style_property: Cannot read property '"+property+"' of "+element+".");
      }
    }
  },
  
  /**
   * Returns property of an element. CSS properties take precedence over HTML attributes.
   * @name get_element_property
   * @param {HTMLElement} element
   * @param {string} property
   * @param {string} returnType 'int'|'float' Return type.
   * @param {boolean} useComputedStyle
   * @return {*}
   * @throws {ReferenceError}
   * @static
   */
  'get_element_property': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function (element, property, returnType, useComputedStyle) {
      returnType = returnType || false;
      var val,
          obj;
      try {
        val = doodle.utils.get_style_property(element, property, useComputedStyle);
      } catch (e) {
        val = undefined;
      }
      if (val === undefined || val === null || val === '') {
        val = element.getAttribute(property);
      }
      if (returnType !== false) {
        switch (returnType) {
        case 'int':
          val = parseInt(val, 10);
          val = isNaN(val) ? null : val;
          break;
        case 'number':
        case 'float':
          val = parseFloat(val);
          val = isNaN(val) ? null : val;
          break;
        case 'string':
          val = String(val);
          break;
        case 'object':
          obj = {};
          val = obj[property] = val;
          break;
        default:
          break;
        }
      }
      return val;
    }
  },

  /**
   * @name set_element_property
   * @param {HTMLElement} element
   * @param {string} property
   * @param {*} value
   * @param {string} type 'css'|'html' Set CSS property or HTML attribute.
   * @return {*}
   * @throws {TypeError}
   * @throws {SyntaxError}
   * @static
   */
  'set_element_property': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function (element, property, value, type) {
      type = (type === undefined) ? 'css' : type;
      switch (type) {
      case 'css':
        element.style[property] = value;
        break;
      case 'html':
        element.setAttribute(property, value);
        break;
      default:
        throw new SyntaxError("set_element_property: type must be 'css' property or 'html' attribute.");
      }
      return value;
    }
  },

  /*
   * SCENE GRAPH
   */
  
  /**
   * Creates a scene graph path from a given node and all it's descendants.
   * @name create_scene_path
   * @param {Node} node
   * @param {Array} array Array to store the path nodes in.
   * @param {boolean} clearArray Empty array passed as parameter before storing nodes in it.
   * @return {Array} The array passed to the function (modified in place).
   * @throws {TypeError}
   * @static
   */
  'create_scene_path': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: (function () {
      return function create_scene_path (node, array, clearArray) {
        array = (array === undefined) ? [] : array;
        clearArray = (clearArray === undefined) ? false : clearArray;
        var i = node.children.length;
        if (clearArray) {
          array.splice(0, array.length);
        }
        if (i !== 0) {
          while (i--) {
            create_scene_path(node.children[i], array, false);
          }
        }
        array.push(node);
        return array; //return for further operations on array (reverse)
      };
    }())
  }
  
});
/**
 * @name doodle.Keyboard
 * @class
 * @static
 */
Object.defineProperty(doodle, 'Keyboard', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    /**
     * @name BACKSPACE
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'BACKSPACE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 8
    },

    /**
     * @name TAB
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'TAB': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 9
    },

    /**
     * @name ENTER
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'ENTER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 13
    },

    /**
     * @name COMMAND
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'COMMAND': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 15
    },

    /**
     * @name SHIFT
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'SHIFT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 16
    },

    /**
     * @name CONTROL
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'CONTROL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 17
    },

    /**
     * @name ALTERNATE
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'ALTERNATE': { //Option key
      enumerable: true,
      writable: false,
      configurable: false,
      value: 18
    },

    /**
     * @name PAUSE
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'PAUSE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 19
    },

    /**
     * @name CAPS_LOCK
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'CAPS_LOCK': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 20
    },

    /**
     * @name NUMPAD
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 21
    },

    /**
     * @name ESCAPE
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'ESCAPE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 27
    },

    /**
     * @name SPACE
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'SPACE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 32
    },

    /**
     * @name PAGE_UP
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'PAGE_UP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 33
    },

    /**
     * @name PAGE_DOWN
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'PAGE_DOWN': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 34
    },

    /**
     * @name END
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'END': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 35
    },

    /**
     * @name HOME
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'HOME': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 36
    },

    /* ARROWS
     */

    /**
     * @name LEFT
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'LEFT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 37
    },

    /**
     * @name UP
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'UP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 38
    },

    /**
     * @name RIGHT
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'RIGHT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 39
    },

    /**
     * @name DOWN
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'DOWN': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 40
    },

    /**
     * @name INSERT
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'INSERT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 45
    },

    /**
     * @name DELETE
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'DELETE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 46
    },

    /* NUMBERS
     */

    /**
     * @name
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMBER_0': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 48
    },

    /**
     * @name NUMBER_1
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMBER_1': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 49
    },

    /**
     * @name NUMBER_2
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMBER_2': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 50
    },

    /**
     * @name NUMBER_3
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMBER_3': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 51
    },

    /**
     * @name NUMBER_4
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMBER_4': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 52
    },

    /**
     * @name NUMBER_5
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMBER_5': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 53
    },

    /**
     * @name NUMBER_6
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMBER_6': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 54
    },

    /**
     * @name NUMBER_7
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMBER_7': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 55
    },

    /**
     * @name NUMBER_8
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMBER_8': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 56
    },

    /**
     * @name NUMBER_9
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMBER_9': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 57
    },

    /* LETTERS
     */

    /**
     * @name A
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'A': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 65
    },

    /**
     * @name B
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'B': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 66
    },

    /**
     * @name C
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'C': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 67
    },

    /**
     * @name D
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'D': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 68
    },

    /**
     * @name E
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'E': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 69
    },

    /**
     * @name F
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 70
    },

    /**
     * @name G
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'G': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 71
    },

    /**
     * @name H
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'H': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 72
    },

    /**
     * @name I
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'I': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 73
    },

    /**
     * @name J
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'J': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 74
    },

    /**
     * @name K
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'K': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 75
    },

    /**
     * @name L
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'L': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 76
    },

    /**
     * @name M
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'M': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 77
    },

    /**
     * @name N
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'N': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 78
    },

    /**
     * @name O
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'O': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 79
    },

    /**
     * @name P
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'P': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 80
    },

    /**
     * @name Q
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'Q': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 81
    },

    /**
     * @name R
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'R': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 82
    },

    /**
     * @name S
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'S': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 83
    },

    /**
     * @name T
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'T': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 84
    },

    /**
     * @name U
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'U': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 85
    },

    /**
     * @name V
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'V': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 86
    },

    /**
     * @name W
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'W': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 87
    },

    /**
     * @name X
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'X': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 88
    },

    /**
     * @name Y
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'Y': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 89
    },

    /**
     * @name Z
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'Z': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 90
    },

    /**
     * @name WINDOWS_KEY
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'WINDOWS_KEY': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 91
    },

    /* NUMBER PAD
     */

    /**
     * @name NUMPAD_0
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_0': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 96
    },

    /**
     * @name NUMPAD_1
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_1': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 97
    },

    /**
     * @name NUMPAD_2
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_2': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 98
    },

    /**
     * @name NUMPAD_3
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_3': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 99
    },

    /**
     * @name NUMPAD_4
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_4': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 100
    },

    /**
     * @name NUMPAD_5
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_5': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 101
    },

    /**
     * @name NUMPAD_6
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_6': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 102
    },

    /**
     * @name NUMPAD_7
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_7': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 103
    },

    /**
     * @name NUMPAD_8
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_8': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 104
    },

    /**
     * @name NUMPAD_9
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_9': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 105
    },

    /**
     * @name NUMPAD_MULTIPLY
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_MULTIPLY': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 106
    },

    /**
     * @name NUMPAD_ADD
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_ADD': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 107
    },

    /**
     * @name NUMPAD_ENTER
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_ENTER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 108
    },

    /**
     * @name NUMPAD_SUBTRACT
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_SUBTRACT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 109
    },

    /**
     * @name NUMPAD_DECIMAL
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_DECIMAL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 110
    },

    /**
     * @name NUMPAD_DIVIDE
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'NUMPAD_DIVIDE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 111
    },

    /* FUNCTION KEYS
     */

    /**
     * @name F1
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F1': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 112
    },

    /**
     * @name F2
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F2': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 113
    },

    /**
     * @name F3
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F3': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 114
    },

    /**
     * @name F4
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F4': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 115
    },

    /**
     * @name F5
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F5': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 116
    },

    /**
     * @name F6
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F6': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 117
    },

    /**
     * @name F7
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F7': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 118
    },

    /**
     * @name F8
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F8': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 119
    },

    /**
     * @name F9
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F9': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 120
    },

    /**
     * @name F10
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F10': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 121
    },

    /**
     * @name F11
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F11': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 122
    },

    /**
     * @name F12
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F12': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 123
    },

    /**
     * @name F13
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F13': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 124
    },

    /**
     * @name F14
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F14': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 125
    },

    /**
     * @name F15
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'F15': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 126
    },

    /**
     * @name SCROLL
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'SCROLL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 145
    },

    /* PUNCTUATION
     */

    /**
     * @name SEMICOLON
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'SEMICOLON': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 186
    },

    /**
     * @name EQUAL
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'EQUAL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 187
    },

    /**
     * @name COMMA
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'COMMA': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 188
    },

    /**
     * @name MINUS
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'MINUS': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 189
    },

    /**
     * @name PERIOD
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'PERIOD': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 190
    },

    /**
     * @name SLASH
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'SLASH': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 191
    },

    /**
     * @name BACKQUOTE
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'BACKQUOTE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 192
    },

    /**
     * @name LEFTBRACKET
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'LEFTBRACKET': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 219
    },

    /**
     * @name BACKSLASH
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'BACKSLASH': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 220
    },

    /**
     * @name RIGHTBRACKET
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'RIGHTBRACKET': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 221
    },

    /**
     * @name QUOTE
     * @return {number} [read-only]
     * @property
     * @constant
     * @static
     */
    'QUOTE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 222
    }
    
  })
});
/**
 * The GradientType class provides values for the type parameter in the
 * beginGradientFill() and lineGradientStyle() methods of the Graphics class.
 * @name doodle.GradientType
 * @class
 * @static
 */
Object.defineProperty(doodle, 'GradientType', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    /**
     * @name LINEAR
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'LINEAR': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'linearGradient'
    },
    
    /**
     * @name RADIAL
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'RADIAL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'radialGradient'
    }
  })
});
/**
 * @name doodle.Pattern
 * @class
 * @static
 */
Object.defineProperty(doodle, 'Pattern', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    /**
     * @name REPEAT
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'REPEAT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'repeat'
    },

    /**
     * @name REPEAT_X
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'REPEAT_X': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'repeat-x'
    },

    /**
     * @name REPEAT_Y
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'REPEAT_Y': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'repeat-y'
    },

    /**
     * @name NO_REPEAT
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'NO_REPEAT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'no-repeat'
    }
  })
});
/**
 * @name doodle.LineCap
 * @class
 * @static
 */
Object.defineProperty(doodle, 'LineCap', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    /**
     * @name BUTT
     * @return {string} [read-only] Default
     * @property
     * @constant
     * @static
     */
    'BUTT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'butt'
    },

    /**
     * @name ROUND
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'ROUND': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'round'
    },

    /**
     * @name SQUARE
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'SQUARE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'square'
    }
  })
});
/**
 * @name doodle.LineJoin
 * @class
 * @static
 */
Object.defineProperty(doodle, 'LineJoin', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    /**
     * @name MITER
     * @return {string} [read-only] Default
     * @property
     * @constant
     * @static
     */
    'MITER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'miter'
    },

    /**
     * @name ROUND
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'ROUND': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'round'
    },

    /**
     * @name BEVEL
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'BEVEL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'bevel'
    }
  })
});
/*globals doodle*/

/* Will probably want to implement the dom event interface:
 * http://www.w3.org/TR/DOM-Level-3-Events/
 * But this works for now.
 */
(function () {
  var event_prototype,
      event_static_properties,
      isEvent;
  
  /**
   * @name doodle.events.Event
   * @class
   * @augments Object
   * @param {string=} type
   * @param {boolean=} bubbles = false
   * @param {boolean=} cancelable = false
   * @return {doodle.events.Event}
   * @throws {TypeError}
   * @throws {SyntaxError}
   */
  doodle.events.Event = function (type, bubbles, cancelable) {
    var event = Object.create(event_prototype),
        arg_len = arguments.length,
        init_obj, //function, event
        copy_event_properties; //fn declared per event for private vars


    Object.defineProperties(event, event_static_properties);
    //properties that require privacy
    Object.defineProperties(event, (function () {
      var evt_type,
          evt_bubbles,
          evt_cancelable,
          evt_cancelBubble = false,
          evt_defaultPrevented = false,
          evt_eventPhase = 0,
          evt_currentTarget = null,
          evt_target = null,
          evt_srcElement = null,
          evt_timeStamp = new Date(),
          evt_returnValue = true,
          evt_clipboardData,
          //internal use
          __cancel = false,
          __cancelNow = false;

      /**
       * @name copy_event_properties
       * @param {doodle.events.Event} evt Event to copy properties from.
       * @param {Node|boolean|null=} resetTarget Set new event target or null.
       * @param {string|boolean=} resetType Set new event type.
       * @throws {TypeError}
       * @private
       */
      copy_event_properties = function (evt, resetTarget, resetType) {
        resetTarget = (resetTarget === undefined) ? false : resetTarget;
        if (resetTarget !== false) {
          evt_currentTarget = resetTarget;
          evt_target = resetTarget;
        } else {
          evt_currentTarget = evt.currentTarget;
          evt_target = evt.target;
        }
        if (resetType) {
          evt_type = resetType;
        } else {
          evt_type = evt.type;
        }
        evt_bubbles = evt.bubbles;
        evt_cancelable = evt.cancelable;
        evt_cancelBubble = evt.cancelBubble;
        evt_defaultPrevented = evt.defaultPrevented;
        evt_eventPhase = evt.eventPhase;
        evt_srcElement = evt.srcElement;
        evt_timeStamp = evt.timeStamp;
        evt_returnValue = evt.returnValue;
        evt_clipboardData = evt.clipboardData;
        //check for doodle internal event properties
        if (evt.__cancel) {
          __cancel = true;
        }
        if (evt.__cancelNow) {
          __cancelNow = true;
        }
      };
      
      return {
        /**
         * @name type
         * @return {string} [read-only]
         * @property
         */
        'type': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_type; }
        },

        /**
         * @name __setType
         * @param {string} typeArg
         * @throws {TypeError}
         * @private
         */
        '__setType': {
          enumerable: false,
          value: function (typeArg) {
            evt_type = typeArg;
          }
        },

        /**
         * @name bubbles
         * @return {boolean} [read-only]
         * @property
         */
        'bubbles': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_bubbles; }
        },

        /**
         * @name cancelable
         * @return {boolean} [read-only]
         * @property
         */
        'cancelable': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_cancelable; }
        },

        /**
         * @name cancelBubble
         * @param {boolean} cancelArg
         * @throws {TypeError}
         */
        'cancelBubble': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_cancelBubble; },
          set: function (cancelArg) {
            evt_cancelBubble = cancelArg;
          }
        },
        
        /**
         * Test if event propagation should stop after this node.
         * @name __cancel
         * @return {boolean} [read-only]
         * @property
         * @private
         */
        '__cancel': {
          enumerable: false,
          configurable: false,
          get: function () { return __cancel; }
        },
        
        /**
         * Test if event propagation should stop immediately,
         * ignore other handlers on this node.
         * @name __cancelNow
         * @return {boolean} [read-only]
         * @property
         * @private
         */
        '__cancelNow': {
          enumerable: false,
          configurable: false,
          get: function () { return __cancelNow; }
        },

        /**
         * @name currentTarget
         * @return {Node} [read-only]
         * @property
         */
        'currentTarget': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_currentTarget; }
        },
        
        /**
         * @name __setCurrentTarget
         * @param {Node} targetArg
         * @private
         */
        '__setCurrentTarget': {
          enumerable: false,
          value: function (targetArg) {
            evt_currentTarget = targetArg;
            return this;
          }
        },

        /**
         * @name target
         * @return {Node} [read-only]
         * @property
         */
        'target': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_target; }
        },

        /**
         * @name __setTarget
         * @param {Node} targetArg
         * @private
         */
        '__setTarget': {
          enumerable: false,
          value: function (targetArg) {
            evt_target = targetArg;
            return this;
          }
        },

        /**
         * @name eventPhase
         * @return {number} [read-only]
         * @property
         */
        'eventPhase': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_eventPhase; }
        },

        /**
         * @name __setEventPhase
         * @param {number} phaseArg
         * @throws {TypeError}
         * @private
         */
        '__setEventPhase': {
          enumerable: false,
          value: function (phaseArg) {
            evt_eventPhase = phaseArg;
            return this;
          }
        },

        /**
         * @name srcElement
         * @return {EventDispatcher} [read-only]
         * @property
         */
        'srcElement': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_srcElement; }
        },

        /**
         * @name timeStamp
         * @return {Date} [read-only]
         * @property
         */
        'timeStamp': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_timeStamp; }
        },

        /**
         * @name returnValue
         * @return {*} [read-only]
         * @property
         */
        'returnValue': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_returnValue; }
        },
        
        /**
         * @name initEvent
         * @param {string=} typeArg
         * @param {boolean=} canBubbleArg
         * @param {boolean=} cancelableArg
         * @return {doodle.events.Event}
         * @throws {TypeError}
         */
        'initEvent': {
          enumerable: true,
          configurable: false,
          value: function (typeArg, canBubbleArg, cancelableArg) {
            //parameter defaults
            typeArg = (typeArg === undefined) ? "undefined" : typeArg;
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            evt_type = typeArg;
            evt_bubbles = canBubbleArg;
            evt_cancelable = cancelableArg;
            
            return this;
          }
        },

        /**
         * @name preventDefault
         */
        'preventDefault': {
          enumerable: true,
          configurable: false,
          value: function () {
            evt_defaultPrevented = true;
          }
        },

        /**
         * @name stopPropagation
         * @throws {Error} If called on event that can not be canceled.
         */
        'stopPropagation': {
          enumerable: true,
          configurable: false,
          value: function () {
            if (!this.cancelable) {
              throw new Error(this+'.stopPropagation: Event can not be cancelled.');
            } else {
              __cancel = true;
            }
          }
        },

        /**
         * @name stopImmediatePropagation
         * @throws {Error} If called on event that can not be canceled.
         */
        'stopImmediatePropagation': {
          enumerable: true,
          configurable: false,
          value: function () {
            if (!this.cancelable) {
              throw new Error(this+'.stopImmediatePropagation: Event can not be cancelled.');
            } else {
              __cancel = true;
              __cancelNow = true;
            }
          }
        },

        /**
         * Copy the properties from another Event.
         * Allows for the reuse of this object for further dispatch.
         * @name __copyEventProperties
         * @param {doodle.events.Event} evt
         * @param {Node} resetTarget
         * @param {string} resetType
         * @throws {TypeError}
         * @private
         */
        '__copyEventProperties': {
          enumerable: false,
          configurable: false,
          value: function (evt, resetTarget, resetType) {
            resetTarget = (resetTarget === undefined) ? false : resetTarget;
            resetType = (resetType === undefined) ? false : resetType;
            copy_event_properties(evt, resetTarget, resetType);
            return this;
          }
        }
      };
    }()));//end defineProperties

    
    //using a function or another event object to init?
    if (arg_len === 1 && (typeof arguments[0] === 'function' || isEvent(arguments[0]))) {
      init_obj = arguments[0];
      type = undefined;
    }

    //initialize event
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(event);
      } else {
        //passed a doodle or dom event object
        copy_event_properties(init_obj, false, false);
      }
    } else {
      //standard instantiation
      event.initEvent(type, bubbles, cancelable);
    }

    return event;
  };
  
  
  event_static_properties = {
    /**
     * @name toString
     * @return {string}
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Event]";
      }
    }
  };//end event_static_properties

  event_prototype = Object.create({}, {
    /**
     * @name CAPTURING_PHASE
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'CAPTURING_PHASE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 1
    },

    /**
     * @name AT_TARGET
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'AT_TARGET': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 2
    },

    /**
     * @name BUBBLING_PHASE
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'BUBBLING_PHASE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 3
    },

    /**
     * @name MOUSEDOWN
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'MOUSEDOWN': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 1
    },

    /**
     * @name MOUSEUP
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'MOUSEUP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 2
    },

    /**
     * @name MOUSEOVER
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'MOUSEOVER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 4
    },

    /**
     * @name MOUSEOUT
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'MOUSEOUT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 8
    },

    /**
     * @name MOUSEMOVE
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'MOUSEMOVE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 16
    },

    /**
     * @name MOUSEDRAG
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'MOUSEDRAG': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 32
    },

    /**
     * @name CLICK
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'CLICK': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 64
    },

    /**
     * @name DBLCLICK
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'DBLCLICK': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 128
    },

    /**
     * @name KEYDOWN
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'KEYDOWN': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 256
    },

    /**
     * @name KEYUP
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'KEYUP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 512
    },

    /**
     * @name KEYPRESS
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'KEYPRESS': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 1024
    },

    /**
     * @name DRAGDROP
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'DRAGDROP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 2048
    },

    /**
     * @name FOCUS
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'FOCUS': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 4096
    },

    /**
     * @name BLUR
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'BLUR': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 8192
    },

    /**
     * @name SELECT
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'SELECT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 16384
    },

    /**
     * @name CHANGE
     * @return {number} [read-only]
     * @property
     * @constant
     */
    'CHANGE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 32768
    }
  });//end event_prototype

  /*
   * CLASS METHODS
   */

  /**
   * Test if an object is an event of any kind (Event/MouseEvent/etc).
   * Returns true on Doodle events as well as DOM events.
   * @name isEvent
   * @param {doodle.events.Event} event
   * @return {boolean}
   * @static
   */
  isEvent = doodle.events.Event.isEvent = function (event) {
    if (!event || typeof event !== 'object' || typeof event.toString !== 'function') {
      return false;
    } else {
      event = event.toString();
    }
    return (event === '[object Event]' ||
            event === '[object UIEvent]' ||
            event === '[object MouseEvent]' ||
            event === '[object TouchEvent]' ||
            event === '[object KeyboardEvent]' ||
            event === '[object TextEvent]' ||
            event === '[object WheelEvent]');
  };

  
}());//end class closure
/*globals doodle*/

/* DOM 2 Event: UIEvent:Event
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-Events-UIEvent
 */
(function () {
  var uievent_static_properties,
      isUIEvent,
      isEvent = doodle.events.Event.isEvent;
  
  /**
   * @name doodle.events.UIEvent
   * @class
   * @augments doodle.events.Event
   * @param {string=} type
   * @param {boolean=} bubbles
   * @param {boolean=} cancelable
   * @param {HTMLElement=} view
   * @param {number=} detail
   * @return {doodle.events.UIEvent}
   * @throws {TypeError}
   * @throws {SyntaxError}
   */
  doodle.events.UIEvent = function (type, bubbles, cancelable, view, detail) {
    var uievent,
        arg_len = arguments.length,
        init_obj, //function, event
        copy_uievent_properties; //fn declared per event for private vars


    //initialize uievent prototype with another event, function, or args
    if (isEvent(arguments[0])) {
      init_obj = arguments[0];
      type = undefined;
      uievent = Object.create(doodle.events.Event(init_obj));
    } else if (typeof arguments[0] === 'function') {
      init_obj = arguments[0];
      type = undefined;
      //use empty event type for now, will check after we call the init function.
      uievent = Object.create(doodle.events.Event(''));
    } else {
      //parameter defaults
      bubbles = (bubbles === undefined) ? false : bubbles;
      cancelable = (cancelable === undefined) ? false : cancelable;
      uievent = Object.create(doodle.events.Event(type, bubbles, cancelable));
    }
    
    Object.defineProperties(uievent, uievent_static_properties);
    //properties that require privacy
    Object.defineProperties(uievent, (function () {
      var evt_view = null,
          evt_detail = 0,
          evt_which = 0,
          evt_charCode = 0,
          evt_keyCode = 0,
          evt_layerX = 0,
          evt_layerY = 0,
          evt_pageX = 0,
          evt_pageY = 0;

      /**
       * @name copy_uievent_properties
       * @param {doodle.events.UIEvent} evt UIEvent to copy properties from.
       * @throws {TypeError}
       * @private
       */
      copy_uievent_properties = function (evt) {
        if (evt.view !== undefined) { evt_view = evt.view; }
        if (evt.detail !== undefined) { evt_detail = evt.detail; }
        if (evt.which !== undefined) { evt_which = evt.which; }
        if (evt.charCode !== undefined) { evt_charCode = evt.charCode; }
        if (evt.keyCode !== undefined) { evt_keyCode = evt.keyCode; }
        if (evt.layerX !== undefined) { evt_layerX = evt.layerX; }
        if (evt.layerY !== undefined) { evt_layerY = evt.layerY; }
        if (evt.pageX !== undefined) { evt_pageX = evt.pageX; }
        if (evt.pageY !== undefined) { evt_pageY = evt.pageY; }
      };
      
      return {
        /**
         * @name view
         * @return {HTMLElement} [read-only]
         * @property
         */
        'view': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_view; }
        },

        /**
         * @name detail
         * @return {number} [read-only]
         * @property
         */
        'detail': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_detail; }
        },

        /**
         * @name which
         * @return {number} [read-only]
         * @property
         */
        'which': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_which; }
        },

        /**
         * @name charCode
         * @return {number} [read-only]
         * @property
         */
        'charCode': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_charCode; }
        },

        /**
         * @name keyCode
         * @return {number} [read-only]
         * @property
         */
        'keyCode': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_keyCode; }
        },

        /**
         * @name layerX
         * @return {number} [read-only]
         * @property
         */
        'layerX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_layerX; }
        },

        /**
         * @name layerY
         * @return {number} [read-only]
         * @property
         */
        'layerY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_layerY; }
        },

        /**
         * @name pageX
         * @return {number} [read-only]
         * @property
         */
        'pageX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_pageX; }
        },

        /**
         * @name pageY
         * @return {number} [read-only]
         * @property
         */
        'pageY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_pageY; }
        },

        /**
         * @name initUIEvent
         * @param {string} typeArg
         * @param {boolean} canBubbleArg
         * @param {boolean} cancelableArg
         * @param {HTMLElement} viewArg
         * @param {number} detailArg
         * @return {doodle.events.UIEvent}
         * @throws {TypeError}
         */
        'initUIEvent': {
          value: function (typeArg, canBubbleArg, cancelableArg, viewArg, detailArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            viewArg = (viewArg === undefined) ? null : viewArg;
            detailArg = (detailArg === undefined) ? 0 : detailArg;
            evt_view = viewArg;
            evt_detail = detailArg;
            
            this.initEvent(typeArg, canBubbleArg, cancelableArg);
            return this;
          }
        },

        /**
         * Copy the properties from another UIEvent.
         * Allows for the reuse of this object for further dispatch.
         * @name __copyUIEventProperties
         * @param {doodle.events.UIEvent} evt
         * @param {Node=} resetTarget
         * @param {string=} resetType
         * @return {Event}
         * @throws {TypeError}
         * @private
         */
        '__copyUIEventProperties': {
          enumerable: false,
          configurable: false,
          value: function (evt, resetTarget, resetType) {
            resetTarget = (resetTarget === undefined) ? false : resetTarget;
            resetType = (resetType === undefined) ? false : resetType;
            copy_uievent_properties(evt);
            return this.__copyEventProperties(evt, resetTarget, resetType);
          }
        }
      };
    }()));//end defineProperties

    
    //initialize uievent
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(uievent);
      } else {
        //passed a doodle or dom event object
        copy_uievent_properties(init_obj);
      }
    } else {
      //standard instantiation
      uievent.initUIEvent(type, bubbles, cancelable, view, detail);
    }
    
    return uievent;
  };

  
  uievent_static_properties = {
    /**
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () { return "[object UIEvent]"; }
    }
  };

  /*
   * CLASS METHODS
   */

  /**
   * Test if an object is an UIEvent or inherits from it.
   * Returns true on Doodle events as well as DOM events.
   * @name isUIEvent
   * @param {doodle.events.Event} event
   * @return {boolean}
   * @static
   */
  isUIEvent = doodle.events.UIEvent.isUIEvent = function (event) {
    if (!event || typeof event !== 'object' || typeof event.toString !== 'function') {
      return false;
    } else {
      event = event.toString();
    }
    return (event === '[object UIEvent]' ||
            event === '[object MouseEvent]' ||
            event === '[object TouchEvent]' ||
            event === '[object KeyboardEvent]' ||
            event === '[object TextEvent]' ||
            event === '[object WheelEvent]');
  };


}());//end class closure
/*globals doodle*/

/* DOM 2 Event: MouseEvent:UIEvent
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevents
 */
(function () {
  var mouseevent_static_properties,
      isMouseEvent,
      isEvent = doodle.events.Event.isEvent;
  
  /**
   * @name doodle.events.MouseEvent
   * @class
   * @augments doodle.events.UIEvent
   * @param {string=} type
   * @param {boolean=} bubbles
   * @param {boolean=} cancelable
   * @param {HTMLElement=} view
   * @param {number=} detail
   * @param {number=} screenX
   * @param {number=} screenY
   * @param {number=} clientX
   * @param {number=} clientY
   * @param {boolean=} ctrlKey
   * @param {boolean=} altKey
   * @param {boolean=} shiftKey
   * @param {boolean=} metaKey
   * @param {number=} button Mouse button that caused the event (0|1|2)
   * @param {Node=} relatedTarget Secondary target for event (only for some events)
   * @return {doodle.events.MouseEvent}
   * @throws {TypeError}
   * @throws {SyntaxError}
   */
  doodle.events.MouseEvent = function (type, bubbles, cancelable, view, detail,
                                       screenX, screenY, clientX, clientY, 
                                       ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget) {
    var mouseevent,
        arg_len = arguments.length,
        init_obj, //function, event
        copy_mouseevent_properties; //fn declared per event for private vars
    

    //initialize uievent prototype with another event, function, or args
    if (isEvent(arguments[0])) {
      init_obj = arguments[0];
      type = undefined;
      mouseevent = Object.create(doodle.events.UIEvent(init_obj));
    } else if (typeof arguments[0] === 'function') {
      init_obj = arguments[0];
      type = undefined;
      //use empty event type for now, will check after we call the init function.
      mouseevent = Object.create(doodle.events.UIEvent(''));
    } else {
      //parameter defaults
      bubbles = (bubbles === undefined) ? false : bubbles;
      cancelable = (cancelable === undefined) ? false : cancelable;
      view = (view === undefined) ? null : view;
      detail = (detail === undefined) ? 0 : detail;
      mouseevent = Object.create(doodle.events.UIEvent(type, bubbles, cancelable, view, detail));
    }
    
    Object.defineProperties(mouseevent, mouseevent_static_properties);
    //properties that require privacy
    Object.defineProperties(mouseevent, (function () {
      var evt_x = 0,
          evt_y = 0,
          evt_offsetX = 0,
          evt_offsetY = 0,
          evt_screenX = 0,
          evt_screenY = 0,
          evt_clientX = 0,
          evt_clientY = 0,
          evt_ctrlKey = false,
          evt_altKey = false,
          evt_shiftKey = false,
          evt_metaKey = false,
          evt_button = 0,
          evt_relatedTarget = null;

      /**
       * @name copy_mouseevent_properties
       * @param {doodle.events.MouseEvent} evt MouseEvent to copy properties from.
       * @throws {TypeError}
       * @private
       */
      copy_mouseevent_properties = function (evt) {
        evt_x = (evt.x !== undefined) ? evt.x : 0;
        evt_y = (evt.y !== undefined) ? evt.y : 0;
        evt_offsetX = (evt.offsetX !== undefined) ? evt.offsetX : 0;
        evt_offsetY = (evt.offsetY !== undefined) ? evt.offsetY : 0;
        if (evt.screenX !== undefined) { evt_screenX = evt.screenX; }
        if (evt.screenY !== undefined) { evt_screenY = evt.screenY; }
        if (evt.clientX !== undefined) { evt_clientX = evt.clientX; }
        if (evt.clientY !== undefined) { evt_clientY = evt.clientY; }
        if (evt.ctrlKey !== undefined) { evt_ctrlKey = evt.ctrlKey; }
        if (evt.altKey !== undefined) { evt_altKey = evt.altKey; }
        if (evt.shiftKey !== undefined) { evt_shiftKey = evt.shiftKey; }
        if (evt.metaKey !== undefined) { evt_metaKey = evt.metaKey; }
        if (evt.button !== undefined) { evt_button = evt.button; }
        if (evt.relatedTarget !== undefined) { evt_relatedTarget = evt.relatedTarget; }
      };
      
      return {
        /**
         * @name x
         * @return {number} [read-only]
         * @property
         */
        'x': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_x; }
        },

        /**
         * @name y
         * @return {number} [read-only]
         * @property
         */
        'y': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_y; }
        },

        /**
         * @name screenX
         * @return {number} [read-only]
         * @property
         */
        'screenX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_screenX; }
        },

        /**
         * @name screenY
         * @return {number} [read-only]
         * @property
         */
        'screenY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_screenY; }
        },

        /**
         * @name clientX
         * @return {number} [read-only]
         * @property
         */
        'clientX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_clientX; }
        },

        /**
         * @name clientY
         * @return {number} [read-only]
         * @property
         */
        'clientY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_clientY; }
        },

        /**
         * @name offsetX
         * @return {number} [read-only]
         * @property
         */
        'offsetX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_offsetX; }
        },

        /**
         * @name offsetY
         * @return {number} [read-only]
         * @property
         */
        'offsetY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_offsetY; }
        },

        /**
         * @name ctrlKey
         * @return {boolean} [read-only]
         * @property
         */
        'ctrlKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_ctrlKey; }
        },

        /**
         * @name altKey
         * @return {boolean} [read-only]
         * @property
         */
        'altKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_altKey; }
        },

        /**
         * @name shiftKey
         * @return {boolean} [read-only]
         * @property
         */
        'shiftKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_shiftKey; }
        },

        /**
         * @name metaKey
         * @return {boolean} [read-only]
         * @property
         */
        'metaKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_metaKey; }
        },

        /**
         * @name button
         * @return {number} [read-only]
         * @property
         */
        'button': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_button; }
        },

        /**
         * @name relatedTarget
         * @return {Node} [read-only]
         * @property
         */
        'relatedTarget': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_relatedTarget; }
        },

        /**
         * @name initMouseEvent
         * @param {string} typeArg
         * @param {boolean} canBubbleArg
         * @param {boolean} cancelableArg
         * @param {HTMLElement} viewArg
         * @param {number} detailArg
         * @param {number} screenXArg
         * @param {number} screenYArg
         * @param {number} clientXArg
         * @param {number} clientYArg
         * @param {boolean} ctrlKeyArg
         * @param {boolean} altKeyArg
         * @param {boolean} shiftKeyArg
         * @param {boolean} metaKeyArg
         * @param {number} buttonArg
         * @param {Node} relatedTargetArg
         * @return {doodle.events.MouseEvent}
         * @throws {TypeError}
         */
        'initMouseEvent': {
          value: function (typeArg, canBubbleArg, cancelableArg, viewArg, detailArg,
                           screenXArg, screenYArg, clientXArg, clientYArg,
                           ctrlKeyArg, altKeyArg, shiftKeyArg, metaKeyArg,
                           buttonArg, relatedTargetArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            viewArg = (viewArg === undefined) ? null : viewArg;
            detailArg = (detailArg === undefined) ? 0 : detailArg;
            screenXArg = (screenXArg === undefined) ? 0 : screenXArg;
            screenYArg = (screenYArg === undefined) ? 0 : screenYArg;
            clientXArg = (clientXArg === undefined) ? 0 : clientXArg;
            clientYArg = (clientYArg === undefined) ? 0 : clientYArg;
            ctrlKeyArg = (ctrlKeyArg === undefined) ? false : ctrlKeyArg;
            altKeyArg = (altKeyArg === undefined) ? false : altKeyArg;
            shiftKeyArg = (shiftKeyArg === undefined) ? false : shiftKeyArg;
            metaKeyArg = (metaKeyArg === undefined) ? false : metaKeyArg;
            buttonArg = (buttonArg === undefined) ? 0 : buttonArg;
            relatedTarget = (relatedTargetArg === undefined) ? null : relatedTargetArg;
            evt_screenX = screenXArg;
            evt_screenY = screenYArg;
            evt_clientX = clientXArg;
            evt_clientY = clientYArg;
            evt_ctrlKey = ctrlKeyArg;
            evt_altKey = altKeyArg;
            evt_shiftKey = shiftKeyArg;
            evt_metaKey = metaKeyArg;
            evt_button = buttonArg;
            evt_relatedTarget = relatedTargetArg;

            return this.initUIEvent(typeArg, canBubbleArg, cancelableArg, viewArg, detailArg);
          }
        },

        /**
         * Queries the state of a modifier using a key identifier.
         * @name getModifierState
         * @param {string} key A modifier key identifier
         * @return {boolean} True if it is a modifier key and the modifier is activated, false otherwise.
         * @throws {TypeError}
         */
        'getModifierState': {
          value: function (key) {
            switch (key) {
            case 'Alt':
              return evt_altKey;
            case 'Control':
              return evt_ctrlKey;
            case 'Meta':
              return evt_metaKey;
            case 'Shift':
              return evt_shiftKey;
            default:
              return false;
            }
          }
        },

        /**
         * Copy the properties from another MouseEvent.
         * Allows for the reuse of this object for further dispatch.
         * @name __copyMouseEventProperties
         * @param {doodle.events.MouseEvent} evt
         * @param {Node} resetTarget
         * @param {string} resetType
         * @return {doodle.events.MouseEvent}
         * @throws {TypeError}
         * @private
         */
        '__copyMouseEventProperties': {
          enumerable: false,
          configurable: false,
          value: function (evt, resetTarget, resetType) {
            resetTarget = (resetTarget === undefined) ? false : resetTarget;
            resetType = (resetType === undefined) ? false : resetType;
            copy_mouseevent_properties(evt);
            return this.__copyUIEventProperties(evt, resetTarget, resetType);
          }
        }
      };
    }()));//end defineProperties


    //initialize mouseevent
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(mouseevent);
      } else {
        //passed a doodle or dom event object
        copy_mouseevent_properties(init_obj);
      }
    } else {
      //standard instantiation
      mouseevent.initMouseEvent(type, bubbles, cancelable, view, detail,
                                screenX, screenY, clientX, clientY, 
                                ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);
    }
    
    return mouseevent;
  };
    
  mouseevent_static_properties = {
    /**
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () { return "[object MouseEvent]"; }
    }
  };

  /*
   * CLASS METHODS
   */

  /**
   * Test if an object is a MouseEvent.
   * @name isMouseEvent
   * @param {doodle.events.MouseEvent} event
   * @return {boolean}
   * @static
   */
  isMouseEvent = doodle.events.MouseEvent.isMouseEvent = function (event) {
    if (!event || typeof event !== 'object' || typeof event.toString !== 'function') {
      return false;
    } else {
      event = event.toString();
    }
    return (event === '[object MouseEvent]');
  };


}());//end class closure
/*globals doodle*/

/* TouchEvent support is expermental.
 * http://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html
 */
(function () {
  var touchevent_static_properties,
      isTouchEvent,
      isEvent = doodle.events.Event.isEvent;
  
  /**
   * @name doodle.events.TouchEvent
   * @class
   * @augments doodle.events.UIEvent
   * @param {string=} type
   * @param {boolean=} bubbles
   * @param {boolean=} cancelable
   * @param {HTMLElement=} view
   * @param {number=} detail
   * @param {number=} screenX
   * @param {number=} screenY
   * @param {number=} clientX
   * @param {number=} clientY
   * @param {boolean=} ctrlKey
   * @param {boolean=} altKey
   * @param {boolean=} shiftKey
   * @param {boolean=} metaKey
   * @param {Array=} touches ?
   * @param {Array=} targetTouches ?
   * @param {Array=} changedTouches ?
   * @param {number=} scale
   * @param {number=} rotation
   * @return {doodle.events.TouchEvent}
   * @throws {TypeError}
   * @throws {SyntaxError}
   */
  doodle.events.TouchEvent = function (type, bubbles, cancelable, view, detail,
                                       screenX, screenY, clientX, clientY,
                                       ctrlKey, altKey, shiftKey, metaKey,
                                       touches, targetTouches, changedTouches,
                                       scale, rotation) {
    var touchevent,
        arg_len = arguments.length,
        init_obj, //function, event
        copy_touchevent_properties; //fn declared per event for private vars
    

    //initialize uievent prototype with another event, function, or args
    if (isEvent(arguments[0])) {
      init_obj = arguments[0];
      type = undefined;
      touchevent = Object.create(doodle.events.UIEvent(init_obj));
    } else if (typeof arguments[0] === 'function') {
      init_obj = arguments[0];
      type = undefined;
      //use empty event type for now, will check after we call the init function.
      touchevent = Object.create(doodle.events.UIEvent(''));
    } else {
      //parameter defaults
      bubbles = (bubbles === undefined) ? false : bubbles;
      cancelable = (cancelable === undefined) ? false : cancelable;
      view = (view === undefined) ? null : view;
      detail = (detail === undefined) ? 0 : detail;
      touchevent = Object.create(doodle.events.UIEvent(type, bubbles, cancelable, view, detail));
    }
    
    Object.defineProperties(touchevent, touchevent_static_properties);
    //properties that require privacy
    Object.defineProperties(touchevent, (function () {
      var evt_screenX = 0,
          evt_screenY = 0,
          evt_clientX = 0,
          evt_clientY = 0,
          evt_ctrlKey = false,
          evt_altKey = false,
          evt_shiftKey = false,
          evt_metaKey = false,
          evt_touches = null,
          evt_targetTouches = null,
          evt_changedTouches = null,
          evt_scale = 1,
          evt_rotation = 0;

      /**
       * @name copy_touchevent_properties
       * @param {doodle.events.TouchEvent} evt TouchEvent to copy properties from.
       * @private
       */
      copy_touchevent_properties = function (evt) {
        if (evt.screenX !== undefined) { evt_screenX = evt.screenX; }
        if (evt.screenY !== undefined) { evt_screenY = evt.screenY; }
        if (evt.clientX !== undefined) { evt_clientX = evt.clientX; }
        if (evt.clientY !== undefined) { evt_clientY = evt.clientY; }
        if (evt.ctrlKey !== undefined) { evt_ctrlKey = evt.ctrlKey; }
        if (evt.altKey !== undefined) { evt_altKey = evt.altKey; }
        if (evt.shiftKey !== undefined) { evt_shiftKey = evt.shiftKey; }
        if (evt.metaKey !== undefined) { evt_metaKey = evt.metaKey; }
        if (evt.touches !== undefined) { evt_touches = evt.touches; }
        if (evt.targetTouches !== undefined) { evt_targetTouches = evt.targetTouches; }
        if (evt.changedTouches !== undefined) { evt_changedTouches = evt.changedTouches; }
        if (evt.scale !== undefined) { evt_scale = evt.scale; }
        if (evt.rotation !== undefined) { evt_rotation = evt.rotation; }
      };
      
      return {
        /**
         * @name screenX
         * @return {number} [read-only]
         * @property
         */
        'screenX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_screenX; }
        },

        /**
         * @name screenY
         * @return {number} [read-only]
         * @property
         */
        'screenY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_screenY; }
        },

        /**
         * @name clientX
         * @return {number} [read-only]
         * @property
         */
        'clientX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_clientX; }
        },

        /**
         * @name clientY
         * @return {number} [read-only]
         * @property
         */
        'clientY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_clientY; }
        },

        /**
         * @name ctrlKey
         * @return {boolean} [read-only]
         * @property
         */
        'ctrlKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_ctrlKey; }
        },

        /**
         * @name altKey
         * @return {boolean} [read-only]
         * @property
         */
        'altKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_altKey; }
        },

        /**
         * @name shiftKey
         * @return {boolean} [read-only]
         * @property
         */
        'shiftKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_shiftKey; }
        },

        /**
         * @name metaKey
         * @return {boolean} [read-only]
         * @property
         */
        'metaKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_metaKey; }
        },

        /**
         * @name touches
         * @return {Array} [read-only]
         * @property
         */
        'touches': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_touches; }
        },

        /**
         * @name targetTouches
         * @return {Array} [read-only]
         * @property
         */
        'targetTouches': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_targetTouches; }
        },

        /**
         * @name changedTouches
         * @return {Array} [read-only]
         * @property
         */
        'changedTouches': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_changedTouches; }
        },

        /**
         * @name scale
         * @return {number} [read-only]
         * @property
         */
        'scale': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_scale; }
        },

        /**
         * @name rotation
         * @return {number} [read-only]
         * @property
         */
        'rotation': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_rotation; }
        },

        /**
         * @name initTouchEvent
         * @param {string} typeArg
         * @param {boolean} canBubbleArg
         * @param {boolean} cancelableArg
         * @param {HTMLElement} viewArg
         * @param {number} detailArg
         * @param {number} screenXArg
         * @param {number} screenYArg
         * @param {number} clientXArg
         * @param {number} clientYArg
         * @param {boolean} ctrlKeyArg
         * @param {boolean} altKeyArg
         * @param {boolean} shiftKeyArg
         * @param {boolean} metaKeyArg
         * @param {Array} touchesArg
         * @param {Array} targetTouchesArg
         * @param {Array} changedTouchesArg
         * @param {number} scaleArg
         * @param {number} rotationArg
         * @return {doodle.events.TouchEvent}
         * @throws {TypeError}
         */
        'initTouchEvent': {
          value: function (typeArg, canBubbleArg, cancelableArg, viewArg, detailArg,
                           screenXArg, screenYArg, clientXArg, clientYArg,
                           ctrlKeyArg, altKeyArg, shiftKeyArg, metaKeyArg,
                           touchesArg, targetTouchesArg, changedTouchesArg,
                           scaleArg, rotationArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            viewArg = (viewArg === undefined) ? null : viewArg;
            detailArg = (detailArg === undefined) ? 0 : detailArg;
            screenXArg = (screenXArg === undefined) ? 0 : screenXArg;
            screenYArg = (screenYArg === undefined) ? 0 : screenYArg;
            clientXArg = (clientXArg === undefined) ? 0 : clientXArg;
            clientYArg = (clientYArg === undefined) ? 0 : clientYArg;
            ctrlKeyArg = (ctrlKeyArg === undefined) ? false : ctrlKeyArg;
            altKeyArg = (altKeyArg === undefined) ? false : altKeyArg;
            shiftKeyArg = (shiftKeyArg === undefined) ? false : shiftKeyArg;
            metaKeyArg = (metaKeyArg === undefined) ? false : metaKeyArg;
            touchesArg = (touchesArg === undefined) ? null : touchesArg;
            targetTouchesArg = (targetTouchesArg === undefined) ? null : targetTouchesArg;
            changedTouchesArg = (changedTouchesArg === undefined) ? null : changedTouchesArg;
            scaleArg = (scaleArg === undefined) ? 1 : scaleArg;
            rotationArg = (rotationArg === undefined) ? 0 : rotationArg;
            evt_screenX = screenXArg;
            evt_screenY = screenYArg;
            evt_clientX = clientXArg;
            evt_clientY = clientYArg;
            evt_ctrlKey = ctrlKeyArg;
            evt_altKey = altKeyArg;
            evt_shiftKey = shiftKeyArg;
            evt_metaKey = metaKeyArg;
            evt_touches = touchesArg;
            evt_targetTouches = targetTouchesArg;
            evt_changedTouches = changedTouchesArg;
            evt_scale = scaleArg;
            evt_rotation = rotationArg;

            this.initUIEvent(typeArg, canBubbleArg, cancelableArg, viewArg, detailArg);
            return this;
          }
        },

        /**
         * Queries the state of a modifier using a key identifier.
         * @name getModifierState
         * @param {string} key A modifier key identifier
         * @return {boolean} True if it is a modifier key and the modifier is activated, false otherwise.
         * @throws {TypeError}
         */
        'getModifierState': {
          value: function (key) {
            switch (key) {
            case 'Alt':
              return evt_altKey;
            case 'Control':
              return evt_ctrlKey;
            case 'Meta':
              return evt_metaKey;
            case 'Shift':
              return evt_shiftKey;
            default:
              return false;
            }
          }
        },

        /**
         * Copy the properties from another TouchEvent.
         * Allows for the reuse of this object for further dispatch.
         * @name __copyTouchEventProperties
         * @param {doodle.events.TouchEvent} evt
         * @param {Node} resetTarget
         * @param {string} resetType
         * @return {doodle.events.TouchEvent}
         * @throws {TypeError}
         * @private
         */
        '__copyTouchEventProperties': {
          enumerable: false,
          configurable: false,
          value: function (evt, resetTarget, resetType) {
            resetTarget = (resetTarget === undefined) ? false : resetTarget;
            resetType = (resetType === undefined) ? false : resetType;
            copy_touchevent_properties(evt);
            return this.__copyUIEventProperties(evt, resetTarget, resetType);
          }
        }
      };
    }()));//end defineProperties


    //initialize touchevent
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(touchevent);
      } else {
        //passed a doodle or dom event object
        copy_touchevent_properties(init_obj);
      }
    } else {
      //standard instantiation
      touchevent.initTouchEvent(type, bubbles, cancelable, view, detail,
                                screenX, screenY, clientX, clientY,
                                ctrlKey, altKey, shiftKey, metaKey,
                                touches, targetTouches, changedTouches, scale, rotation);
    }
    
    return touchevent;
  };
    
  
  touchevent_static_properties = {
    /**
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () { return "[object TouchEvent]"; }
    }
  };

  /*
   * CLASS METHODS
   */

  /**
   * Test if an object is a TouchEvent.
   * @name isTouchEvent
   * @param {doodle.events.TouchEvent} event
   * @return {boolean}
   * @static
   */
  isTouchEvent = doodle.events.TouchEvent.isTouchEvent = function (event) {
    if (!event || typeof event !== 'object' || typeof event.toString !== 'function') {
      return false;
    } else {
      event = event.toString();
    }
    return (event === '[object TouchEvent]');
  };


}());//end class closure
/*globals doodle*/

/* DOM 3 Event: TextEvent:UIEvent
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-textevents
 */
(function () {
  var textevent_static_properties,
      isTextEvent,
      isEvent = doodle.events.Event.isEvent;
  
  /**
   * @name doodle.events.TextEvent
   * @class
   * @augments doodle.events.UIEvent
   * @param {string=} type
   * @param {boolean=} bubbles
   * @param {boolean=} cancelable
   * @param {HTMLElement=} view
   * @param {string=} data
   * @param {number=} inputMode
   * @return {doodle.events.TextEvent}
   * @throws {TypeError}
   * @throws {SyntaxError}
   */
  doodle.events.TextEvent = function (type, bubbles, cancelable, view, data, inputMode) {
    var textevent,
        arg_len = arguments.length,
        init_obj, //function, event
        copy_textevent_properties; //fn declared per event for private vars


    //initialize uievent prototype with another event, function, or args
    if (isEvent(arguments[0])) {
      init_obj = arguments[0];
      type = undefined;
      textevent = Object.create(doodle.events.UIEvent(init_obj));
    } else if (typeof arguments[0] === 'function') {
      init_obj = arguments[0];
      type = undefined;
      //use empty event type for now, will check after we call the init function.
      textevent = Object.create(doodle.events.UIEvent(''));
    } else {
      //parameter defaults
      bubbles = (bubbles === undefined) ? false : bubbles;
      cancelable = (cancelable === undefined) ? false : cancelable;
      view = (view === undefined) ? null : view;
      textevent = Object.create(doodle.events.UIEvent(type, bubbles, cancelable, view));
    }
    
    Object.defineProperties(textevent, textevent_static_properties);
    //properties that require privacy
    Object.defineProperties(textevent, (function () {
      var evt_data = '',
          evt_inputMode = doodle.events.TextEvent.INPUT_METHOD_UNKNOWN;

      /**
       * @name copy_textevent_properties
       * @param {doodle.events.TextEvent} evt TextEvent to copy properties from.
       * @private
       */
      copy_textevent_properties = function (evt) {
        if (evt.data !== undefined) { evt_data = evt.data; }
        if (evt.inputMode !== undefined) { evt_inputMode = evt.inputMode; }
      };
      
      return {
        /**
         * @name data
         * @return {string} [read-only]
         * @property
         */
        'data': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_data; }
        },

        /**
         * @name inputMode
         * @return {number} [read-only]
         * @property
         */
        'inputMode': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_inputMode; }
        },

        /**
         * @name initTextEvent
         * @param {string} typeArg
         * @param {boolean} canBubbleArg
         * @param {boolean} cancelableArg
         * @param {HTMLElement} view
         * @param {string} dataArg
         * @param {number} inputModeArg
         * @return {doodle.events.TextEvent}
         */
        'initTextEvent': {
          value: function (typeArg, canBubbleArg, cancelableArg, viewArg, dataArg, inputModeArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            viewArg = (viewArg === undefined) ? null : viewArg;
            dataArg = (dataArg === undefined) ? '' : dataArg;
            inputModeArg = (inputModeArg === undefined) ? doodle.events.TextEvent.INPUT_METHOD_UNKNOWN : inputModeArg;
            evt_data = dataArg;
            evt_inputMode = inputModeArg;
            
            this.initUIEvent(typeArg, canBubbleArg, cancelableArg, viewArg);
            return this;
          }
        },

        /**
         * Copy the properties from another TextEvent.
         * Allows for the reuse of this object for further dispatch.
         * @name __copyTextEventProperties
         * @param {doodle.events.TextEvent} evt
         * @param {Node} resetTarget
         * @param {string} resetType
         * @return {doodle.events.TextEvent}
         * @private
         */
        '__copyTextEventProperties': {
          enumerable: false,
          configurable: false,
          value: function (evt, resetTarget, resetType) {
            resetTarget = (resetTarget === undefined) ? false : resetTarget;
            resetType = (resetType === undefined) ? false : resetType;
            copy_textevent_properties(evt);
            return this.__copyUIEventProperties(evt, resetTarget, resetType);
          }
        }
      };
    }()));

    //initialize textevent
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(textevent);
      } else {
        //passed a doodle or dom event object
        copy_textevent_properties(init_obj);
      }
    } else {
      //standard instantiation
      textevent.initTextEvent(type, bubbles, cancelable, view, data, inputMode);
    }
    
    return textevent;
  };
  
  
  textevent_static_properties = {
    /**
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () { return "[object TextEvent]"; }
    }
  };

  /*
   * CLASS METHODS
   */

  /**
   * Test if an object is a TextEvent.
   * @name isTextEvent
   * @param {doodle.events.TextEvent} event
   * @return {boolean}
   * @static
   */
  isTextEvent = doodle.events.TextEvent.isTextEvent = function (event) {
    if (!event || typeof event !== 'object' || typeof event.toString !== 'function') {
      return false;
    } else {
      event = event.toString();
    }
    return (event === '[object TextEvent]');
  };

  
}());//end class closure
/*globals doodle*/

/* DOM 3 Event: KeyboardEvent:UIEvent
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
 */

(function () {
  var keyboardevent_static_properties,
      isKeyboardEvent,
      isEvent = doodle.events.Event.isEvent;
  
  /**
   * @name doodle.events.KeyboardEvent
   * @class
   * @augments doodle.events.UIEvent
   * @param {string=} type
   * @param {boolean=} bubbles
   * @param {boolean=} cancelable
   * @param {HTMLElement=} view
   * @param {string=} keyIdentifier
   * @param {number=} keyLocation
   * @param {string=} modifiersList White-space separated list of key modifiers.
   * @param {boolean=} repeat
   * @return {doodle.events.KeyboardEvent}
   * @throws {TypeError}
   * @throws {SyntaxError}
   */
  doodle.events.KeyboardEvent = function (type, bubbles, cancelable, view,
                                          keyIdentifier, keyLocation, modifiersList, repeat) {
    var keyboardevent,
        arg_len = arguments.length,
        init_obj, //function, event
        copy_keyboardevent_properties; //fn declared per event for private vars


    //initialize uievent prototype with another event, function, or args
    if (isEvent(arguments[0])) {
      init_obj = arguments[0];
      type = undefined;
      keyboardevent = Object.create(doodle.events.UIEvent(init_obj));
    } else if (typeof arguments[0] === 'function') {
      init_obj = arguments[0];
      type = undefined;
      //use empty event type for now, will check after we call the init function.
      keyboardevent = Object.create(doodle.events.UIEvent(''));
    } else {
      //parameter defaults
      bubbles = (bubbles === undefined) ? false : bubbles;
      cancelable = (cancelable === undefined) ? false : cancelable;
      view = (view === undefined) ? null : view;
      keyboardevent = Object.create(doodle.events.UIEvent(type, bubbles, cancelable, view));
    }
    
    Object.defineProperties(keyboardevent, keyboardevent_static_properties);
    //properties that require privacy
    Object.defineProperties(keyboardevent, (function () {
      var evt_keyIdentifier = "",
          evt_keyLocation = 0,
          evt_repeat = false,
          evt_ctrlKey = false,
          evt_altKey = false,
          evt_shiftKey = false,
          evt_metaKey = false,
          evt_altGraphKey = false;

      /**
       * @name copy_keyboardevent_properties
       * @param {doodle.events.KeyboardEvent} evt KeyboardEvent to copy properties from.
       * @throws {TypeError}
       * @private
       */
      copy_keyboardevent_properties = function (evt) {
        if (evt.keyIdentifier !== undefined) { evt_keyIdentifier = evt.keyIdentifier; }
        if (evt.keyLocation !== undefined) { evt_keyLocation = evt.keyLocation; }
        if (evt.repeat !== undefined) { evt_repeat = evt.repeat; }
        if (evt.ctrlKey !== undefined) { evt_ctrlKey = evt.ctrlKey; }
        if (evt.altKey !== undefined) { evt_altKey = evt.altKey; }
        if (evt.shiftKey !== undefined) { evt_shiftKey = evt.shiftKey; }
        if (evt.metaKey !== undefined) { evt_metaKey = evt.metaKey; }
        if (evt.altGraphKey !== undefined) { evt_altKey = evt.altGraphKey; }
      };
      
      return {
        /**
         * @name keyIdentifier
         * @return {string} [read-only]
         * @property
         */
        'keyIdentifier': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_keyIdentifier; }
        },

        /**
         * @name keyLocation
         * @return {number} [read-only]
         * @property
         */
        'keyLocation': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_keyLocation; }
        },

        /**
         * @name repeat
         * @return {boolean} [read-only]
         * @property
         */
        'repeat': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_repeat; }
        },

        /**
         * @name ctrlKey
         * @return {boolean} [read-only]
         * @property
         */
        'ctrlKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_ctrlKey; }
        },

        /**
         * @name altKey
         * @return {boolean} [read-only]
         * @property
         */
        'altKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_altKey; }
        },

        /**
         * @name shiftKey
         * @return {boolean} [read-only]
         * @property
         */
        'shiftKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_shiftKey; }
        },

        /**
         * @name metaKey
         * @return {boolean} [read-only]
         * @property
         */
        'metaKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_metaKey; }
        },

        /**
         * @name altGraphKey
         * @return {boolean} [read-only]
         * @property
         */
        'altGraphKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_altGraphKey; }
        },
        
        /**
         * @name initKeyboardEvent
         * @param {string} typeArg
         * @param {boolean} canBubbleArg
         * @param {boolean} cancelableArg
         * @param {HTMLElement} viewArg
         * @param {string} keyIdentifierArg
         * @param {number} keyLocationArg
         * @param {string} modifiersListArg
         * @param {boolean} repeatArg
         * @return {doodle.events.Event}
         * @throws {TypeError}
         */
        'initKeyboardEvent': {
          value: function (typeArg, canBubbleArg, cancelableArg, viewArg,
                           keyIdentifierArg, keyLocationArg, modifiersListArg, repeatArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            viewArg = (viewArg === undefined) ? null : viewArg;
            keyIdentifierArg = (keyIdentifierArg === undefined) ? "" : keyIdentifierArg;
            keyLocationArg = (keyLocationArg === undefined) ? 0 : keyLocationArg;
            modifiersListArg = (modifiersListArg === undefined) ? "" : modifiersListArg;
            repeatArg = (repeatArg === undefined) ? false : repeatArg;
            evt_keyIdentifier = keyIdentifierArg;
            evt_keyLocation = keyLocationArg;
            evt_repeat = repeatArg;
            
            //parse string of white-space separated list of modifier key identifiers
            modifiersListArg.split(" ").forEach(function (modifier) {
              switch (modifier) {
              case 'Alt':
                evt_altKey = true;
                break;
              case 'Control':
                evt_ctrlKey = true;
                break;
              case 'Meta':
                evt_metaKey = true;
                break;
              case 'Shift':
                evt_shiftKey = true;
                break;
              }
            });
            
            this.initUIEvent(typeArg, canBubbleArg, cancelableArg, viewArg);
            return this;
          }
        },

        /**
         * Queries the state of a modifier using a key identifier.
         * @name getModifierState
         * @param {string} key A modifier key identifier
         * @return {boolean} True if it is a modifier key and the modifier is activated, false otherwise.
         * @throws {TypeError}
         */
        'getModifierState': {
          value: function (key) {
            switch (key) {
            case 'Alt':
              return evt_altKey;
            case 'Control':
              return evt_ctrlKey;
            case 'Meta':
              return evt_metaKey;
            case 'Shift':
              return evt_shiftKey;
            default:
              return false;
            }
          }
        },

        /**
         * Copy the properties from another KeyboardEvent.
         * Allows for the reuse of this object for further dispatch.
         * @name __copyKeyboardEventProperties
         * @param {doodle.events.KeyboardEvent} evt
         * @param {Node} resetTarget
         * @param {string} resetType
         * @return {doodle.events.KeyboardEvent}
         * @throws {TypeError}
         * @private
         */
        '__copyKeyboardEventProperties': {
          enumerable: false,
          configurable: false,
          value: function (evt, resetTarget, resetType) {
            resetTarget = (resetTarget === undefined) ? false : resetTarget;
            resetType = (resetType === undefined) ? false : resetType;
            copy_keyboardevent_properties(evt);
            return this.__copyUIEventProperties(evt, resetTarget, resetType);
          }
        }
      };
    }()));

    //initialize keyboardevent
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(keyboardevent);
      } else {
        //passed a doodle or dom event object
        copy_keyboardevent_properties(init_obj);
      }
    } else {
      //standard instantiation
      keyboardevent.initKeyboardEvent(type, bubbles, cancelable, view,
                                      keyIdentifier, keyLocation, modifiersList, repeat);
    }
    
    return keyboardevent;
  };
    

  keyboardevent_static_properties = {
    /**
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () { return "[object KeyboardEvent]"; }
    }
  };

  /*
   * CLASS METHODS
   */

  /**
   * Test if an object is a keyboard event.
   * @name isKeyboardEvent
   * @param {doodle.events.Event} event
   * @return {boolean}
   * @static
   */
  isKeyboardEvent = doodle.events.KeyboardEvent.isKeyboardEvent = function (event) {
    if (!event || typeof event !== 'object' || typeof event.toString !== 'function') {
      return false;
    } else {
      event = event.toString();
    }
    return (event === '[object KeyboardEvent]');
  };


}());//end class closure

/*
 * EVENT
 */
Object.defineProperties(doodle.events.Event, {
  /**
   * @name CAPTURING_PHASE
   * @return {number} [read-only]
   * @memberOf Event
   * @property
   * @constant
   * @static
   */
  'CAPTURING_PHASE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 1
  },

  /**
   * @name AT_TARGET
   * @return {number} [read-only]
   * @memberOf Event
   * @property
   * @constant
   * @static
   */
  'AT_TARGET': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 2
  },

  /**
   * @name BUBBLING_PHASE
   * @return {number} [read-only]
   * @memberOf Event
   * @property
   * @constant
   * @static
   */
  'BUBBLING_PHASE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 3
  },

  /**
   * Dispatched when object is added to display path.
   * @name ADDED
   * @return {string} [read-only]
   * @memberOf Event
   * @property
   * @constant
   * @static
   */
  'ADDED': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "added"
  },

  /**
   * Dispatched when object is removed from display path.
   * @name REMOVED
   * @return {string} [read-only]
   * @memberOf Event
   * @property
   * @constant
   * @static
   */
  'REMOVED': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "removed"
  },

  /**
   * @name ENTER_FRAME
   * @return {string} [read-only]
   * @memberOf Event
   * @property
   * @constant
   * @static
   */
  'ENTER_FRAME': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "enterFrame"
  },

  /**
   * Dispatched when element is loaded.
   * @name LOAD
   * @return {string} [read-only]
   * @memberOf Event
   * @property
   * @constant
   * @static
   */
  'LOAD': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "load"
  },

  /**
   * @name CHANGE
   * @return {string} [read-only]
   * @memberOf Event
   * @property
   * @constant
   * @static
   */
  'CHANGE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "change"
  }
});


/*
 * UI EVENT
 */
Object.defineProperties(doodle.events.UIEvent, {
  /**
   * @name FOCUS_IN
   * @return {string} [read-only]
   * @memberOf UIEvent
   * @property
   * @constant
   * @static
   */
  'FOCUS_IN': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "focusIn"
  }
});


/*
 * MOUSE EVENT
 * Compatibility tables: http://www.quirksmode.org/dom/events/index.html
 */
Object.defineProperties(doodle.events.MouseEvent, {
  /**
   * To test for left/middle/right button check value for event.which (0,1,2).
   * @name CLICK
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'CLICK': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "click"
  },

  /**
   * @name DOUBLE_CLICK
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'DOUBLE_CLICK': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "dblclick"
  },

  /**
   * @name CONTEXT_MENU
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'CONTEXT_MENU': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "contextmenu"
  },

  /**
   * @name MOUSE_DOWN
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'MOUSE_DOWN': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mousedown"
  },

  /**
   * @name MOUSE_UP
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'MOUSE_UP': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mouseup"
  },

  /**
   * @name MOUSE_WHEEL
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'MOUSE_WHEEL': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mousewheel"
  },

  /**
   * @name MOUSE_MOVE
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'MOUSE_MOVE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mousemove"
  },

  /**
   * @name MOUSE_OUT
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'MOUSE_OUT': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mouseout"
  },

  /**
   * @name MOUSE_OVER
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'MOUSE_OVER': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mouseover"
  },

  /**
   * @name MOUSE_ENTER
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'MOUSE_ENTER': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mouseenter"
  },

  /**
   * @name MOUSE_LEAVE
   * @return {string} [read-only]
   * @memberOf MouseEvent
   * @property
   * @constant
   * @static
   */
  'MOUSE_LEAVE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mouseleave"
  }
  
});


/*
 * TOUCH EVENT
 * http://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html
 */
Object.defineProperties(doodle.events.TouchEvent, {
  /**
   * @name TOUCH_START
   * @return {string} [read-only]
   * @memberOf TouchEvent
   * @property
   * @constant
   * @static
   */
  'TOUCH_START': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "touchstart"
  },

  /**
   * @name TOUCH_MOVE
   * @return {string} [read-only]
   * @memberOf TouchEvent
   * @property
   * @constant
   * @static
   */
  'TOUCH_MOVE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "touchmove"
  },

  /**
   * @name TOUCH_END
   * @return {string} [read-only]
   * @memberOf TouchEvent
   * @property
   * @constant
   * @static
   */
  'TOUCH_END': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "touchend"
  },

  /**
   * @name TOUCH_CANCEL
   * @return {string} [read-only]
   * @memberOf TouchEvent
   * @property
   * @constant
   * @static
   */
  'TOUCH_CANCEL': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "touchcancel"
  }
  
});

/*
 * KEYBOARD EVENT
 */
Object.defineProperties(doodle.events.KeyboardEvent, {
  /**
   * @name KEY_PRESS
   * @return {string} [read-only]
   * @memberOf KeyboardEvent
   * @property
   * @constant
   * @static
   */
  'KEY_PRESS': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "keypress"
  },

  /**
   * @name KEY_UP
   * @return {string} [read-only]
   * @memberOf KeyboardEvent
   * @property
   * @constant
   * @static
   */
  'KEY_UP': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "keyup"
  },

  /**
   * @name KEY_DOWN
   * @return {string} [read-only]
   * @memberOf KeyboardEvent
   * @property
   * @constant
   * @static
   */
  'KEY_DOWN': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "keydown"
  },

  /**
   * @name KEY_LOCATION_STANDARD
   * @return {number} [read-only]
   * @memberOf KeyboardEvent
   * @property
   * @constant
   * @static
   */
  'KEY_LOCATION_STANDARD': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x00
  },

  /**
   * @name KEY_LOCATION_LEFT
   * @return {number} [read-only]
   * @memberOf KeyboardEvent
   * @property
   * @constant
   * @static
   */
  'KEY_LOCATION_LEFT': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x01
  },

  /**
   * @name KEY_LOCATION_RIGHT
   * @return {number} [read-only]
   * @memberOf KeyboardEvent
   * @property
   * @constant
   * @static
   */
  'KEY_LOCATION_RIGHT': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x02
  },

  /**
   * @name KEY_LOCATION_NUMPAD
   * @return {number} [read-only]
   * @memberOf KeyboardEvent
   * @property
   * @constant
   * @static
   */
  'KEY_LOCATION_NUMPAD': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x03
  },

  /**
   * @name KEY_LOCATION_MOBILE
   * @return {number} [read-only]
   * @memberOf KeyboardEvent
   * @property
   * @constant
   * @static
   */
  'KEY_LOCATION_MOBILE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x04
  },

  /**
   * @name KEY_LOCATION_JOYSTICK
   * @return {number} [read-only]
   * @memberOf KeyboardEvent
   * @property
   * @constant
   * @static
   */
  'KEY_LOCATION_JOYSTICK': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x05
  }  
});


/* TEXT EVENT
 */
Object.defineProperties(doodle.events.TextEvent, {
  /**
   * @name TEXT_INPUT
   * @return {string} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'TEXT_INPUT': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "textInput"
  },

  /**
   * @name INPUT_METHOD_UNKNOWN
   * @return {number} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'INPUT_METHOD_UNKNOWN': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x00
  },

  /**
   * @name INPUT_METHOD_KEYBOARD
   * @return {number} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'INPUT_METHOD_KEYBOARD': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x01
  },

  /**
   * @name INPUT_METHOD_PASTE
   * @return {number} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'INPUT_METHOD_PASTE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x02
  },

  /**
   * @name INPUT_METHOD_DROP
   * @return {number} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'INPUT_METHOD_DROP': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x03
  },

  /**
   * @name INPUT_METHOD_IME
   * @return {number} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'INPUT_METHOD_IME': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x04
  },

  /**
   * @name INPUT_METHOD_OPTION
   * @return {number} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'INPUT_METHOD_OPTION': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x05
  },

  /**
   * @name INPUT_METHOD_HANDWRITING
   * @return {number} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'INPUT_METHOD_HANDWRITING': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x06
  },

  /**
   * @name INPUT_METHOD_VOICE
   * @return {number} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'INPUT_METHOD_VOICE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x07
  },

  /**
   * @name INPUT_METHOD_MULTIMODAL
   * @return {number} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'INPUT_METHOD_MULTIMODAL': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x08
  },
  
  /**
   * @name INPUT_METHOD_SCRIPT
   * @return {number} [read-only]
   * @memberOf TextEvent
   * @property
   * @constant
   * @static
   */
  'INPUT_METHOD_SCRIPT': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x09
  }  
});
/*globals doodle*/

(function () {
  var point_static_properties,
      distance,
      isPoint,
      temp_array = new Array(2),
      temp_point = {x:0, y:0},
      //lookup help
      doodle_Point,
      cos = Math.cos,
      sin = Math.sin,
      sqrt = Math.sqrt;
  
  /**
   * @name doodle.geom.Point
   * @class
   * @augments Object
   * @param {number=} x
   * @param {number=} y
   * @return {doodle.geom.Point}
   * @throws {TypeError}
   * @throws {SyntaxError}
   */
  doodle_Point = doodle.geom.Point = function (x, y) {
    var point = {},
        arg_len = arguments.length,
        init_obj;

    Object.defineProperties(point, point_static_properties);
    //properties that require privacy
    Object.defineProperties(point, (function () {
      var x = 0,
          y = 0,
          $temp_array = temp_array;
      
      return {
        /**
         * The horizontal coordinate of the point.
         * @name x
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'x': {
          enumerable: true,
          configurable: false,
          get: function () { return x; },
          set: function (n) {
            x = n;
          }
        },

        /**
         * The vertical coordinate of the point.
         * @name y
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'y': {
          enumerable: true,
          configurable: false,
          get: function () { return y; },
          set: function (n) {
            y = n;
          }
        },

        /**
         * Same as toArray, but reuses array object.
         * @name __toArray
         * @return {Point}
         * @private
         */
        '__toArray': {
          enumerable: false,
          writable: false,
          configurable: false,
          value: function () {
            var pt = $temp_array;
            pt[0] = x;
            pt[1] = y;
            return pt;
          }
        }
      };
    }()));//end defineProperties

    //initialize point
    switch (arg_len) {
    case 0:
      //defaults to 0,0
      break;
    case 2:
      //standard instantiation
      point.compose(x, y);
      break;
    case 1:
      //passed an initialization obj: point, array, function
      init_obj = arguments[0];
      x = undefined;
      
      if (typeof init_obj === 'function') {
        init_obj.call(point);
      } else if (Array.isArray(init_obj)) {
        point.compose.apply(point, init_obj);
      } else {
        point.compose(init_obj.x, init_obj.y);
      }
      break;
    default:
    }

    return point;
  };

  
  point_static_properties = {
    /**
     * The length of the line segment from (0,0) to this point.
     * @name length
     * @return {number}
     * @property
     */
    'length': {
      enumerable: true,
      configurable: false,
      get: function () {
        return distance(temp_point, this);
      }
    },

    /**
     * Returns an array that contains the values of the x and y coordinates.
     * @name toArray
     * @return {Array}
     */
    'toArray': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return this.__toArray().concat();
      }
    },
    
    /**
     * Returns a string that contains the values of the x and y coordinates.
     * @name toString
     * @return {string}
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "(x=" + this.x + ", y=" + this.y + ")";
      }
    },

    /**
     * Set point coordinates.
     * @name compose
     * @param {number} x
     * @param {number} y
     * @return {Point}
     * @throws {TypeError}
     */
    'compose': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (x, y) {
        this.x = x;
        this.y = y;
        return this;
      }
    },

    /**
     * Creates a copy of this Point object.
     * @name clone
     * @return {Point}
     */
    'clone': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return doodle_Point(this.x, this.y);
      }
    },

    /**
     * Determines whether two points are equal.
     * @name equals
     * @param {Point} pt The point to be compared.
     * @return {boolean}
     * @throws {TypeError}
     */
    'equals': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (pt) {
        return ((this && pt &&
                 this.x === pt.x &&
                 this.y === pt.y) ||
                (!this && !pt));
      }
    },

    /**
     * Adds the coordinates of another point to the coordinates of
     * this point to create a new point.
     * @name add
     * @param {Point} pt The point to be added.
     * @return {Point} The new point.
     * @throws {TypeError}
     */
    'add': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (pt) {
        return doodle_Point(this.x + pt.x, this.y + pt.y);
      }
    },

    /**
     * Subtracts the coordinates of another point from the
     * coordinates of this point to create a new point.
     * @name subtract
     * @param {Point} pt The point to be subtracted.
     * @return {Point} The new point.
     * @throws {TypeError}
     */
    'subtract': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (pt) {
        return doodle_Point(this.x - pt.x, this.y - pt.y);
      }
    },

    /**
     * @name offset
     * @param {number} dx
     * @param {number} dy
     * @throws {TypeError}
     */
    'offset': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (dx, dy) {
        this.x += dx;
        this.y += dy;
        return this;
      }
    },

    /**
     * Scales the line segment between (0,0) and the
     * current point to a set length.
     * @name normalize
     * @param {number} thickness The scaling value.
     * @return {Point}
     * @throws {TypeError}
     */
    'normalize': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (thickness) {
        this.x = (this.x / this.length) * thickness;
        this.y = (this.y / this.length) * thickness;
        return this;
        /*correct version?
          var angle:number = Math.atan2(this.y, this.x);
          this.x = Math.cos(angle) * thickness;
          this.y = Math.sin(angle) * thickness;
        */
      }
    },

    /**
     * Determines a point between two specified points.
     * @name interpolate
     * @param {Point} pt1 The first point.
     * @param {Point} pt2 The second point.
     * @param {number} t The level of interpolation between the two points, between 0 and 1.
     * @return {Point}
     * @throws {TypeError}
     */
    'interpolate': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (pt1, pt2, t) {
        return doodle_Point(pt1.x + (pt2.x - pt1.x) * t,
                            pt1.y + (pt2.y - pt1.y) * t);

        /* correct version?
           var nx = pt2.x - pt1.x;
           var ny = pt2.y - pt1.y;
           var angle = Math.atan2(ny , nx);
           var dis = Math.sqrt(x * nx + ny * ny) * t;
           var sx = pt2.x - Math.cos(angle) * dis;
           var sy = pt2.y - Math.sin(angle) * dis;
           return Object.create(point).compose(sx, sy);
        */
      }
    },

    /**
     * Converts a pair of polar coordinates to a Cartesian point coordinate.
     * @name polar
     * @param {number} len The length coordinate of the polar pair.
     * @param {number} angle The angle, in radians, of the polar pair.
     * @return {Point}
     * @throws {TypeError}
     */
    'polar': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (len, angle) {
        return doodle_Point(len*cos(angle), len*sin(angle));
      }
    }
    
  };//end point_static_properties definition

  /*
   * CLASS FUNCTIONS
   */

  /**
   * Returns the distance between pt1 and pt2.
   * @name distance
   * @param {Point} pt1
   * @param {Point} pt2
   * @return {number}
   * @throws {TypeError}
   * @static
   */
  distance = doodle.geom.Point.distance = function (pt1, pt2) {
    var dx = pt2.x - pt1.x,
        dy = pt2.y - pt1.y;
    return sqrt(dx*dx + dy*dy);
  };

  /**
   * Check if a given object contains a numeric x and y property.
   * Does not check if a point is actually a doodle.geom.point.
   * @name isPoint
   * @param {Point} pt
   * @return {boolean}
   * @static
   */
  isPoint = doodle.geom.Point.isPoint = function (pt) {
    return (pt && typeof pt.x === 'number' && typeof pt.y === 'number');
  };

  
}());//end class closure
/*globals doodle*/

(function () {
  var matrix_static_properties,
      isMatrix,
      //recycle object for internal calculations
      temp_array = new Array(6),
      temp_point = {x: null, y: null},
      temp_matrix = {a:null, b:null, c:null, d:null, tx:null, ty:null},
      //lookup help
      doodle_Matrix,
      doodle_Point = doodle.geom.Point,
      sin = Math.sin,
      cos = Math.cos,
      atan2 = Math.atan2,
      tan = Math.tan;
  
  /**
   * @name doodle.geom.Matrix
   * @class
   * @augments Object
   * @param {number=} a
   * @param {number=} b
   * @param {number=} c
   * @param {number=} d
   * @param {number=} tx
   * @param {number=} ty
   * @return {doodle.geom.Matrix}
   * @throws {TypeError}
   * @throws {SyntaxError}
   */
  doodle_Matrix = doodle.geom.Matrix = function (a, b, c, d, tx, ty) {
    var matrix = {},
        arg_len = arguments.length,
        init_obj;
    
    Object.defineProperties(matrix, matrix_static_properties);
    //properties that require privacy
    Object.defineProperties(matrix, (function () {
      var a = 1,
          b = 0,
          c = 0,
          d = 1,
          tx = 0,
          ty = 0,
          $temp_array = temp_array;
      
      return {

        /**
         * The value that affects the positioning of pixels along the x axis
         * when scaling or rotating an image.
         * @name a
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'a': {
          enumerable: true,
          configurable: false,
          get: function () { return a; },
          set: function (n) {
            a = n;
          }
        },

        /**
         * The value that affects the positioning of pixels along the y axis
         * when rotating or skewing an image.
         * @name b
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'b': {
          enumerable: true,
          configurable: false,
          get: function () { return b; },
          set: function (n) {
            b = n;
          }
        },

        /**
         * The value that affects the positioning of pixels along the x axis
         * when rotating or skewing an image.
         * @name c
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'c': {
          enumerable: true,
          configurable: false,
          get: function () { return c; },
          set: function (n) {
            c = n;
          }
        },

        /**
         * The value that affects the positioning of pixels along the y axis
         * when scaling or rotating an image.
         * @name d
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'd': {
          enumerable: true,
          configurable: false,
          get: function () { return d; },
          set: function (n) {
            d = n;
          }
        },

        /**
         * The distance by which to translate each point along the x axis.
         * @name tx
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'tx': {
          enumerable: true,
          configurable: false,
          get: function () { return tx; },
          set: function (n) {
            tx = n;
          }
        },

        /**
         * The distance by which to translate each point along the y axis.
         * @name ty
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'ty': {
          enumerable: true,
          configurable: false,
          get: function () { return ty; },
          set: function (n) {
            ty = n;
          }
        },

        /**
         * Same as toArray, but reuses array object.
         * @return {Array}
         * @private
         */
        '__toArray': {
          enumerable: false,
          writable: false,
          configurable: false,
          value: function () {
            var matrix = $temp_array;
            matrix[0] = a;
            matrix[1] = b;
            matrix[2] = c;
            matrix[3] = d;
            matrix[4] = tx;
            matrix[5] = ty;
            return matrix;
          }
        }
        
      };
    }()));//end defineProperties
    

    //initialize matrix
    switch (arg_len) {
    case 0:
      //defaults to 1,0,0,1,0,0
      break;
    case 6:
      //standard instantiation
      matrix.compose(a, b, c, d, tx, ty);
      break;
    case 1:
      //passed an initialization obj: matrix, array, function
      init_obj = arguments[0];
      a = undefined;

      if (typeof init_obj === 'function') {
        init_obj.call(matrix);
      } else if (Array.isArray(init_obj)) {
        matrix.compose.apply(matrix, init_obj);
      } else {
        matrix.compose(init_obj.a, init_obj.b, init_obj.c, init_obj.d, init_obj.tx, init_obj.ty);
      }
      break;
    default:
    }
    
    return matrix;
  };

  
  matrix_static_properties = {
    /**
     * Set values of this matrix with the specified parameters.
     * @name compose
     * @param {number} a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
     * @param {number} b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
     * @param {number} c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
     * @param {number} d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
     * @param {number} tx The distance by which to translate each point along the x axis.
     * @param {number} ty The distance by which to translate each point along the y axis.
     * @return {Matrix}
     * @throws {TypeError}
     */
    'compose': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (a, b, c, d, tx, ty) {
        this.a  = a;
        this.b  = b;
        this.c  = c;
        this.d  = d;
        this.tx = tx;
        this.ty = ty;
        return this;
      }
    },
    
    /**
     * Returns an array value containing the properties of the Matrix object.
     * @name toArray
     * @return {Array}
     */
    'toArray': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return this.__toArray().concat();
      }
    },
    
    /**
     * Returns a text value listing the properties of the Matrix object.
     * @name toString
     * @return {string}
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return ("(a="+ this.a +", b="+ this.b +", c="+ this.c +
                ", d="+ this.d +", tx="+ this.tx +", ty="+ this.ty +")");
      }
    },

    /**
     * Test if matrix is equal to this one.
     * @name equals
     * @param {Matrix} m
     * @return {boolean}
     * @throws {TypeError}
     */
    'equals': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (m) {
        return ((this && m && 
                 this.a  === m.a &&
                 this.b  === m.b &&
                 this.c  === m.c &&
                 this.d  === m.d &&
                 this.tx === m.tx &&
                 this.ty === m.ty) || 
                (!this && !m));
      }
    },

    /**
     * Sets each matrix property to a value that causes a null transformation.
     * @name identity
     * @return {Matrix}
     */
    'identity': {
      enumerable: true,
      writable: false,
      configurable: false,
      value:  function () {
        this.a  = 1;
        this.b  = 0;
        this.c  = 0;
        this.d  = 1;
        this.tx = 0;
        this.ty = 0;
        return this;
      }
    },

    /**
     * Returns a new Matrix object that is a clone of this matrix,
     * with an exact copy of the contained object.
     * @name clone
     * @return {Matrix}
     */
    'clone': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return doodle_Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
      }
    },

    /**
     * Multiplies a matrix with the current matrix,
     * effectively combining the geometric effects of the two.
     * @name multiply
     * @param {Matrix} m The matrix to be concatenated to the source matrix.
     * @return {Matrix}
     * @throws {TypeError}
     */
    'multiply': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (m) {
        var a  = this.a * m.a  + this.c * m.b,
            b  = this.b * m.a  + this.d * m.b,
            c  = this.a * m.c  + this.c * m.d,
            d  = this.b * m.c  + this.d * m.d,
            tx = this.a * m.tx + this.c * m.ty + this.tx,
            ty = this.b * m.tx + this.d * m.ty + this.ty;
        
        return this.compose(a, b, c, d, tx, ty);
      }
    },

    /**
     * Applies a rotation transformation to the Matrix object.
     * @name rotate
     * @param {number} angle The rotation angle in radians.
     * @return {Matrix}
     * @throws {TypeError}
     */
    'rotate': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (radians) {
        var c = cos(radians),
            s = sin(radians),
            m = temp_matrix;
        m.a = c;
        m.b = s;
        m.c = -s;
        m.d = c;
        m.tx = 0;
        m.ty = 0;
        
        return this.multiply(m);
      }
    },

    /**
     * Applies a rotation transformation to the Matrix object, ignore translation.
     * @name deltaRotate
     * @param {number} angle The rotation angle in radians.
     * @return {Matrix}
     * @throws {TypeError}
     */
    'deltaRotate': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (radians) {
        var x = this.tx,
            y = this.ty;
        this.rotate(radians);
        this.tx = x;
        this.ty = y;
        return this;
      }
    },

    /**
     * Return the angle of rotation in radians.
     * @name rotation
     * @return {number} radians
     * @throws {TypeError}
     * @property
     */
    'rotation': {
      enumerable: true,
      configurable: false,
      get: function () {
        return atan2(this.b, this.a);
      },
      set: function (radians) {
        var c = cos(radians),
            s = sin(radians);
        this.compose(c, s, -s, c, this.tx, this.ty);
      }
    },

    /**
     * Applies a scaling transformation to the matrix.
     * @name scale
     * @param {number} sx A multiplier used to scale the object along the x axis.
     * @param {number} sy A multiplier used to scale the object along the y axis.
     * @return {Matrix}
     * @throws {TypeError}
     */
    'scale': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (sx, sy) {
        var m = temp_matrix;
        m.a = sx;
        m.b = 0;
        m.c = 0;
        m.d = sy;
        m.tx = 0;
        m.ty = 0;
        
        return this.multiply(m);
      }
    },

    /**
     * Applies a scaling transformation to the matrix, ignores translation.
     * @name deltaScale
     * @param {number} sx A multiplier used to scale the object along the x axis.
     * @param {number} sy A multiplier used to scale the object along the y axis.
     * @return {Matrix}
     * @throws {TypeError}
     */
    'deltaScale': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (sx, sy) {
        var x = this.tx,
            y = this.ty;
        this.scale(sx, sy);
        this.tx = x;
        this.ty = y;
        return this;
      }
    },

    /**
     * Translates the matrix along the x and y axes.
     * @name translate
     * @param {number} dx The amount of movement along the x axis to the right, in pixels.
     * @param {number} dy The amount of movement down along the y axis, in pixels.
     * @return {Matrix}
     * @throws {TypeError}
     */
    'translate': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (dx, dy) {
        this.tx += dx;
        this.ty += dy;
        return this;
      }
    },

    /**
     * @name skew
     * @param {number} skewX
     * @param {number} skewY
     * @return {Matrix}
     * @throws {TypeError}
     */
    'skew': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (skewX, skewY) {
        var sx = tan(skewX),
            sy = tan(skewY),
            m = temp_matrix;
        m.a = 1;
        m.b = sy;
        m.c = sx;
        m.d = 1;
        m.tx = 0;
        m.ty = 0;
        
        return this.multiply(m);
      }
    },

    /**
     * Skew matrix and ignore translation.
     * @name deltaSkew
     * @param {number} skewX
     * @param {number} skewY
     * @return {Matrix}
     * @throws {TypeError}
     */
    'deltaSkew': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (skewX, skewY) {
        var x = this.tx,
            y = this.ty;
        this.skew(skewX, skewY);
        this.tx = x;
        this.ty = y;
        return this;
      }
    },

    /**
     * Add a matrix with the current matrix.
     * @name add
     * @param {Matrix} m
     * @return {Matrix}
     * @throws {TypeError}
     */
    'add': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (m) {
        this.a  += m.a;
        this.b  += m.b;
        this.c  += m.c;
        this.d  += m.d;
        this.tx += m.tx;
        this.ty += m.ty;
        return this;
      }
    },

    /**
     * Performs the opposite transformation of the original matrix.
     * @name invert
     * @return {Matrix}
     */
    'invert': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        var det = this.a * this.d - this.b * this.c,
            a  =  this.d / det,
            b  = -this.b / det,
            c  = -this.c / det,
            d  =  this.a / det,
            tx =  (this.ty * this.c - this.d * this.tx) / det,
            ty = -(this.ty * this.a - this.b * this.tx) / det;
        return this.compose(a, b, c, d, tx, ty);
      }
    },

    /**
     * Returns the result of applying the geometric transformation
     * represented by the Matrix object to the specified point.
     * @name transformPoint
     * @param {Point} pt
     * @return {Point}
     * @throws {TypeError}
     */
    'transformPoint': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (pt) {
        return doodle_Point(this.a * pt.x + this.c * pt.y + this.tx,
                            this.b * pt.x + this.d * pt.y + this.ty);
      }
    },

    /**
     * Same as transformPoint, but modifies the point object argument.
     * @name __transformPoint
     * @throws {TypeError}
     * @private
     */
    '__transformPoint': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (point) {
        var x = point.x,
            y = point.y;
        point.x = this.a * x + this.c * y + this.tx;
        point.y = this.b * x + this.d * y + this.ty;
        return point;
      }
    },

    /**
     * Given a point in the pretransform coordinate space, returns
     * the coordinates of that point after the transformation occurs.
     * Unlike 'transformPoint', does not consider translation.
     * @name deltaTransformPoint
     * @param {Point} pt
     * @return {Point}
     * @throws {TypeError}
     */
    'deltaTransformPoint': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (pt) {
        return doodle_Point(this.a * pt.x + this.c * pt.y,
                            this.b * pt.x + this.d * pt.y);
      }
    },

    /**
     * Same as deltaTransformPoint, but modifies the point object argument.
     * @name __deltaTransformPoint
     * @throws {TypeError}
     * @private
     */
    '__deltaTransformPoint': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (point) {
        var x = point.x,
            y = point.y;
        point.x = this.a * x + this.c * y;
        point.y = this.b * x + this.d * y;
        return point;
      }
    },

    /**
     * @name rotateAroundExternalPoint
     * @throws {TypeError}
     */
    'rotateAroundExternalPoint': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (pt, radians) {
        var c = cos(radians),
            s = sin(radians),
            m = temp_matrix,
            reg_pt = temp_point; //new registration point
        //parent rotation matrix, global space
        m.a = c;
        m.b = s;
        m.c = -s;
        m.d = c;
        m.tx = 0;
        m.ty = 0;
        //move this matrix
        this.translate(-pt.x, -pt.y);
        //parent transform this position
        reg_pt.x = m.a * this.tx + m.c * this.ty + m.tx;
        reg_pt.y = m.b * this.tx + m.d * this.ty + m.ty;
        //assign new position
        this.tx = reg_pt.x;
        this.ty = reg_pt.y;
        //apply parents rotation, and put back
        return this.multiply(m).translate(pt.x, pt.y);
      }
    },

    /**
     * @name rotateAroundInternalPoint
     * @throws {TypeError}
     */
    'rotateAroundInternalPoint': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (point, radians) {
        var pt = temp_point;
        pt.x = this.a * point.x + this.c * point.y + this.tx;
        pt.y = this.b * point.x + this.d * point.y + this.ty;
        
        return this.rotateAroundExternalPoint(pt, radians);
      }
    },

    /**
     * @name matchInternalPointWithExternal
     * @throws {TypeError}
     */
    'matchInternalPointWithExternal': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (pt_int, pt_ext) {
        var pt = temp_point;
        //transform point
        pt.x = this.a * pt_int.x + this.c * pt_int.y + this.tx;
        pt.y = this.b * pt_int.x + this.d * pt_int.y + this.ty;
        
        return this.translate(pt_ext.x - pt.x, pt_ext.y - pt.y);
      }
    },

    /**
     * Update matrix 'in-between' this and another matrix
     * given a value of t bewteen 0 and 1.
     * @name interpolate
     * @return {Matrix}
     * @throws {TypeError}
     */
    'interpolate': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (m, t) {
        this.a  = this.a  + (m.a  - this.a)  * t;
        this.b  = this.b  + (m.b  - this.b)  * t;
        this.c  = this.c  + (m.c  - this.c)  * t;
        this.d  = this.d  + (m.d  - this.d)  * t;
        this.tx = this.tx + (m.tx - this.tx) * t;
        this.ty = this.ty + (m.ty - this.ty) * t;
        return this;
      }
    }
  };//end matrix_static_properties defintion

  
  /*
   * CLASS FUNCTIONS
   */
  
  /**
   * Check if a given object contains a numeric matrix properties.
   * Does not check if a matrix is actually a doodle.geom.matrix.
   * @name isMatrix
   * @param {Object} m
   * @return {boolean}
   * @static
   */
  isMatrix = doodle.geom.Matrix.isMatrix = function (m) {
    return (m !== undefined && m !== null &&
            typeof m.a  === 'number' && typeof m.b  === 'number' &&
            typeof m.c  === 'number' && typeof m.d  === 'number' &&
            typeof m.tx === 'number' && typeof m.ty === 'number');
  };

  
}());//end class closure
/*globals doodle*/

(function () {
  var rect_static_properties,
      isRect,
      temp_array = new Array(4),
      //lookup help
      doodle_Rectangle,
      max = Math.max,
      min = Math.min;
  
  /**
   * @name doodle.geom.Rectangle
   * @class
   * @augments Object
   * @param {number=} x
   * @param {number=} y
   * @param {number=} width
   * @param {number=} height
   * @return {doodle.geom.Rectangle}
   * @throws {TypeError}
   * @throws {SyntaxError}
   */
  doodle_Rectangle = doodle.geom.Rectangle = function (x, y, width, height) {
    var rect = {},
        arg_len = arguments.length,
        init_obj;

    Object.defineProperties(rect, rect_static_properties);
    //properties that require privacy
    Object.defineProperties(rect, (function () {
      var x = 0,
          y = 0,
          width = 0,
          height = 0,
          $temp_array = temp_array;
      
      return {
        /**
         * @name x
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'x': {
          enumerable: true,
          configurable: false,
          get: function () { return x; },
          set: function (n) {
            x = n;
          }
        },

        /**
         * @name y
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'y': {
          enumerable: true,
          configurable: false,
          get: function () { return y; },
          set: function (n) {
            y = n;
          }
        },

        /**
         * @name width
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'width': {
          enumerable: true,
          configurable: false,
          get: function () { return width; },
          set: function (n) {
            width = n;
          }
        },

        /**
         * @name height
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'height': {
          enumerable: true,
          configurable: false,
          get: function () { return height; },
          set: function (n) {
            height = n;
          }
        },

        /**
         * Same as toArray, but reuses array object.
         * @name __toArray
         * @return {Array}
         * @private
         */
        '__toArray': {
          enumerable: false,
          writable: false,
          configurable: false,
          value: function () {
            var rect = $temp_array;
            rect[0] = x;
            rect[1] = y;
            rect[2] = width;
            rect[3] = height;
            return rect;
          }
        }
        
      };
    }()));//end defineProperties

    //initialize rectangle
    switch (arg_len) {
    case 0:
      //defaults to {x:0, y:0, width:0, height:0}
      break;
    case 4:
      //standard instantiation
      rect.compose(x, y, width, height);
      break;
    case 1:
      //passed an initialization obj: point, array, function
      init_obj = arguments[0];
      x = undefined;
      
      if (typeof init_obj === 'function') {
        init_obj.call(rect);
      } else if (Array.isArray(init_obj)) {
        rect.compose.apply(rect, init_obj);
      } else {
        rect.compose(init_obj.x, init_obj.y, init_obj.width, init_obj.height);
      }
      break;
    default:
    }

    return rect;
  };


  rect_static_properties = {
    /**
     * @name top
     * @return {number}
     * @throws {TypeError}
     * @property
     */
    'top': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.y;
      },
      set: function (n) {
        this.y = n;
        this.height -= n;
      }
    },

    /**
     * @name right
     * @return {number}
     * @throws {TypeError}
     * @property
     */
    'right': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.x + this.width;
      },
      set: function (n) {
        this.width = n - this.x;
      }
    },

    /**
     * @name bottom
     * @return {number}
     * @throws {TypeError}
     * @property
     */
    'bottom': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.y + this.height;
      },
      set: function (n) {
        this.height = n - this.y;
      }
    },

    /**
     * @name left
     * @return {number}
     * @throws {TypeError}
     * @property
     */
    'left': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.x;
      },
      set: function (n) {
        this.x = n;
        this.width -= n;
      }
    },

    /**
     * @name toString
     * @return {string}
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "(x="+ this.x +", y="+ this.y +", w="+ this.width +", h="+ this.height +")";
      }
    },

    /**
     * @name toArray
     * @return {Array}
     */
    'toArray': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return this.__toArray().concat();
      }
    },
    
    /**
     * Sets this rectangle's parameters.
     * @name compose
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @return {Rectangle}
     * @throws {TypeError}
     */
    'compose': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
      }
    },

    /**
     * Same as compose, but takes a rectangle parameter.
     * @name __compose
     * @param {Rectangle} rect
     * @return {Rectangle}
     * @throws {TypeError}
     * @private
     */
    '__compose': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (rect) {
        this.compose.apply(this, rect.__toArray());
        return this;
      }
    },

    /**
     * @name clone
     * @return {Rectangle}
     */
    'clone': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return doodle_Rectangle(this.x, this.y, this.width, this.height);
      }
    },

    /**
     * Adjusts the location of the rectangle, as determined by
     * its top-left corner, by the specified amounts.
     * @name offset
     * @param {number} dx
     * @param {number} dy
     * @return {Rectangle}
     * @throws {TypeError}
     */
    'offset': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (dx, dy) {
        this.x += dx;
        this.y += dy;
        return this;
      }
    },

    /**
     * Increases the size of the rectangle by the specified amounts, in pixels.
     * The center point of the Rectangle object stays the same, and its size
     * increases to the left and right by the dx value, and to the top and the
     * bottom by the dy value.
     * @name inflate
     * @param {number} dx
     * @param {number} dy
     * @return {Rectangle}
     * @throws {TypeError}
     */
    'inflate': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (dx, dy) {
        this.x -= dx;
        this.width += 2 * dx;
        this.y -= dy;
        this.height += 2 * dy;
        return this;
      }
    },

    /**
     * Determines whether the rectangle argument is equal to this rectangle.
     * @name equals
     * @param {Rectangle} rect
     * @return {boolean}
     * @throws {TypeError}
     */
    'equals': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (rect) {
        return (this.x === rect.x && this.y === rect.y &&
                this.width === rect.width && this.height === rect.height);
      }
    },

    /**
     * Determines whether or not this Rectangle object is empty.
     * @name isEmpty
     * @return {boolean}
     */
    'isEmpty': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return (this.width >= 0 || this.height >= 0);
      }
    },

    /**
     * Determines whether the specified point is contained within the
     * rectangular region defined by this Rectangle object.
     * @name contains
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     * @throws {TypeError}
     */
    'contains': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (x, y) {
        return (x >= this.left && x <= this.right &&
                y >= this.top && y <= this.bottom);
      }
    },

    /**
     * Determines whether the specified point is contained within
     * this rectangle object.
     * @name containsPoint
     * @param {Point} pt
     * @return {boolean}
     * @throws {TypeError}
     */
    'containsPoint': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (pt) {
        return this.contains(pt.x, pt.y);
      }
    },

    /**
     * Determines whether the rectangle argument is contained within this rectangle.
     * @name containsRect
     * @param {Rectangle} rect
     * @return {boolean}
     * @throws {TypeError}
     */
    'containsRect': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (rect) {
        //check each corner
        return (this.contains(rect.x, rect.y) &&           //top-left
                this.contains(rect.right, rect.y) &&       //top-right
                this.contains(rect.right, rect.bottom) &&  //bot-right
                this.contains(rect.x, rect.bottom));       //bot-left
      }
    },

    /**
     * Determines whether the rectangle argument intersects with this rectangle.
     * @name intersects
     * @param {Rectangle} rect
     * @return {boolean}
     * @throws {TypeError}
     */
    'intersects': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (rect) {
        //check each corner
        return (this.contains(rect.x, rect.y) ||           //top-left
                this.contains(rect.right, rect.y) ||       //top-right
                this.contains(rect.right, rect.bottom) ||  //bot-right
                this.contains(rect.x, rect.bottom));       //bot-left
      }
    },

    /**
     * If the rectangle argument intersects with this rectangle, returns
     * the area of intersection as a Rectangle object.
     * If the rectangles do not intersect, this method returns an empty
     * Rectangle object with its properties set to 0.
     * @name intersection
     * @param {Rectangle} rect
     * @return {Rectangle}
     * @throws {TypeError}
     */
    'intersection': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (rect) {
        var r = doodle_Rectangle(0, 0, 0, 0);
        if (this.intersects(rect)) {
          r.left = max(this.left, rect.left);
          r.top = max(this.top, rect.top);
          r.right = min(this.right, rect.right);
          r.bottom = min(this.bottom, rect.bottom);
        }
        return r;
      }
    },

    /**
     * Same as intersection, but modifies this rectangle in place.
     * @name __intersection
     * @param {Rectangle} rect
     * @return {Rectangle}
     * @throws {TypeError}
     * @private
     */
    '__intersection': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (rect) {
        if (this.intersects(rect)) {
          this.left = max(this.left, rect.left);
          this.top = max(this.top, rect.top);
          this.right = min(this.right, rect.right);
          this.bottom = min(this.bottom, rect.bottom);
        }
        return this;
      }
    },

    /**
     * Adds two rectangles together to create a new Rectangle object,
     * by filling in the horizontal and vertical space between the two.
     * @name union
     * @param {Rectangle} rect
     * @return {Rectangle}
     * @throws {TypeError}
     */
    'union': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (rect) {
        var r = doodle_Rectangle(0, 0, 0, 0);
        r.left = min(this.left, rect.left);
        r.top = min(this.top, rect.top);
        r.right = max(this.right, rect.right);
        r.bottom = max(this.bottom, rect.bottom);
        return r;
      }
    },

    /**
     * Same as union, but modifies this rectangle in place.
     * @name __union
     * @param {Rectangle} rect
     * @return {Rectangle}
     * @throws {TypeError}
     * @private
     */
    '__union': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (rect) {
        //a bit tricky, if applied directly it doesn't work
        var l = min(this.left, rect.left),
            t = min(this.top, rect.top),
            r = max(this.right, rect.right),
            b = max(this.bottom, rect.bottom);
        this.left = l;
        this.top = t;
        this.right = r;
        this.bottom = b;
        
        return this;
      }
    }
    
  };//end rect_static_properties definition

  /*
   * CLASS FUNCTIONS
   */

  /**
   * Check if a given object contains a numeric rectangle properties including
   * x, y, width, height, top, bottom, right, left.
   * Does not check if a rectangle is actually a doodle.geom.rectangle.
   * @name isRect
   * @param {Rectangle} rect Object with numeric rectangle parameters.
   * @return {boolean}
   * @static
   */
  isRect = doodle.geom.Rectangle.isRect = function (rect) {
    return (typeof rect.x     === "number" && typeof rect.y      === "number" &&
            typeof rect.width === "number" && typeof rect.height === "number" &&
            typeof rect.top   === "number" && typeof rect.bottom === "number" &&
            typeof rect.left  === "number" && typeof rect.right  === "number");
  };

  
}());//end class closure
/*globals doodle*/

(function () {
  var evtDisp_static_properties,
      dispatcher_queue,
      isEventDispatcher,
      inheritsEventDispatcher,
      //lookup help
      CAPTURING_PHASE = doodle.events.Event.CAPTURING_PHASE,
      AT_TARGET = doodle.events.Event.AT_TARGET,
      BUBBLING_PHASE = doodle.events.Event.BUBBLING_PHASE,
      //lookup help
      Array_indexOf = Array.prototype.indexOf,
      Array_splice = Array.prototype.splice;
  
  /**
   * @name doodle.EventDispatcher
   * @class
   * @augments Object
   * @return {doodle.EventDispatcher}  
   */
  doodle.EventDispatcher = function () {
    /** @type {doodle.EventDispatcher} */
    var evt_disp = {};


    Object.defineProperties(evt_disp, evtDisp_static_properties);
    //properties that require privacy
    Object.defineProperties(evt_disp, {
      'eventListeners': (function () {
        var event_listeners = {};
        return {
          enumerable: true,
          configurable: false,
          get: function () { return event_listeners; }
        };
      }())
    });//end defineProperties

    //passed an initialization function
    if (typeof arguments[0] === 'function') {
      arguments[0].call(evt_disp);
    }
    
    return evt_disp;
  };

  
  evtDisp_static_properties = {
    /**
     * Returns the string representation of the specified object.
     * @name toString
     * @return {string}
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "[object EventDispatcher]";
      }
    },

    /**
     * Call function passing object as 'this'.
     * @name modify
     * @param {Function} fn
     * @return {Object}
     * @throws {TypeError}
     */
    'modify': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (fn) {
        fn.call(this);
        return this;
      }
    },

    /**
     * Registers an event listener object with an EventDispatcher object
     * so that the listener receives notification of an event.
     * @name addEventListener
     * @param {string} type
     * @param {Function} listener
     * @param {boolean} useCapture
     * @throws {TypeError}
     */
    'addEventListener': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (type, listener, useCapture) {
        useCapture = (useCapture === undefined) ? false : useCapture;
        var eventListeners = this.eventListeners;
        
        //if new event type, create it's array to store callbacks
        if (!eventListeners.hasOwnProperty(type)) {
          eventListeners[type] = {capture:[], bubble:[]};
        }
        eventListeners[type][useCapture ? 'capture' : 'bubble'].push(listener);
        
        //object ready for events, add to receivers if not already there
        if (dispatcher_queue.indexOf(this) === -1) {
          dispatcher_queue.push(this);
        }
      }
    },

    /**
     * Removes a listener from the EventDispatcher object.
     * @name removeEventListener
     * @param {string} type
     * @param {Function} listener
     * @param {boolean} useCapture
     * @throws {TypeError}
     */
    'removeEventListener': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (type, listener, useCapture) {
        useCapture = (useCapture === undefined) ? false : useCapture;
        var eventListeners = this.eventListeners,
            handler = eventListeners.hasOwnProperty(type) ? eventListeners[type] : false,
            listeners,
            //lookup help
            disp_queue,
            indexOf = Array_indexOf,
            splice = Array_splice;
        
        //make sure event type exists
        if (handler) {
          listeners = handler[useCapture ? 'capture' : 'bubble'];
          //remove handler function
          splice.call(listeners, indexOf.call(listeners, listener), 1);
          //if none left, remove handler type
          if (handler.capture.length === 0 && handler.bubble.length === 0) {
            delete eventListeners[type];
          }
          //if no more listeners, remove from object queue
          if (Object.keys(eventListeners).length === 0) {
            disp_queue = dispatcher_queue;
            splice.call(disp_queue, indexOf.call(disp_queue, this), 1);
          }
        }
      }
    },

    /**
     * Lookup and call listener if registered for specific event type.
     * @name handleEvent
     * @param {doodle.events.Event} event
     * @return {boolean} true if node has listeners of event type.
     * @throws {TypeError}
     */
    'handleEvent': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (event) {
        
        //check for listeners that match event type
        //if capture not set, using bubble listeners - like for AT_TARGET phase
        var phase = (event.eventPhase === CAPTURING_PHASE) ? 'capture' : 'bubble',
            listeners = this.eventListeners[event.type], //obj
            count = 0, //listener count
            rv,  //return value of handler
            i; //counter

        listeners = listeners && listeners[phase];
        if (listeners && listeners.length > 0) {
          //currentTarget is the object with addEventListener
          event.__setCurrentTarget(this);
          
          //if we have any, call each handler with event object
          count = listeners.length;
          for (i = 0; i < count; i += 1) {
            //pass event to handler
            rv = listeners[i].call(this, event);
            
            //when event.stopPropagation is called
            //cancel event for other nodes, but check other handlers on this one
            //returning false from handler does the same thing
            if (rv === false || event.returnValue === false) {
              //set event stopped if not already
              if (!event.__cancel) {
                event.stopPropagation();
              }
            }
            //when event.stopImmediatePropagation is called
            //ignore other handlers on this target
            if (event.__cancelNow) {
              break;
            }
          }
        }
        
        //any handlers found on this node?
        return (count > 0) ? true : false;
      }
    },
    
    /**
     * Dispatches an event into the event flow. The event target is the
     * EventDispatcher object upon which the dispatchEvent() method is called.
     * @name dispatchEvent
     * @param {doodle.events.Event} event
     * @return {boolean} true if the event was successfully dispatched.
     * @throws {TypeError}
     */
    'dispatchEvent': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (event) {
        //events are dispatched from the child,
        //capturing goes down to the child, bubbling then goes back up
        var target,
            evt_type = event.type,
            hasOwnProperty = Object.prototype.hasOwnProperty,
            //check this node for event handler
            evt_handler_p = hasOwnProperty.call(this.eventListeners, evt_type),
            node,
            node_path = [],
            len, //count of nodes up to root
            i; //counter


        //can't dispatch an event that's already stopped
        if (event.__cancel) {
          return false;
        }
        
        //set target to the object that dispatched it
        //if already set, then we're re-dispatching an event for another target
        if (!event.target) {
          event.__setTarget(this);
        }

        target = event.target;
        //path starts at node parent
        node = target.parent || null;
        
        //create path from node's parent to top of tree
        while (node) {
          //only want to dispatch if there's a reason to
          if (!evt_handler_p) {
            evt_handler_p = hasOwnProperty.call(node.eventListeners, evt_type);
          }
          node_path.push(node);
          node = node.parent;
        }

        //if no handlers for event type, no need to dispatch
        if (!evt_handler_p) {
          return true;
        }

        //enter capture phase: down the tree
        event.__setEventPhase(CAPTURING_PHASE);
        i = len = node_path.length;
        while (i--) {
          node_path[i].handleEvent(event);
          //was the event stopped inside the handler?
          if (event.__cancel) {
            return true;
          }
        }

        //enter target phase
        event.__setEventPhase(AT_TARGET);
        target.handleEvent(event);
        //was the event stopped inside the handler?
        if (event.__cancel) {
          return true;
        }

        //does event bubble, or bubbling cancelled in capture/target phase?
        if (!event.bubbles || event.cancelBubble) {
          return true;
        }

        //enter bubble phase: back up the tree
        event.__setEventPhase(BUBBLING_PHASE);
        for (i = 0; i < len; i = i+1) {
          node_path[i].handleEvent(event);
          //was the event stopped inside the handler?
          if (event.__cancel || event.cancelBubble) {
            return true;
          }
        }

        return true; //dispatched successfully
      }
    },

    /**
     * Dispatches an event to every object with an active listener.
     * Ignores propagation path, objects come from
     * @name broadcastEvent
     * @param {doodle.events.Event} event
     * @return {boolean} True if the event was successfully dispatched.
     * @throws {TypeError}
     * @throws {Error}
     */
    'broadcastEvent': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (event) {
        var evt_type = event.type,
            hasOwnProperty = Object.prototype.hasOwnProperty,
            disp_queue = dispatcher_queue,
            dq_count = disp_queue.length;
        

        if (event.__cancel) {
          throw new Error(this+'.broadcastEvent: Can not dispatch a cancelled event.');
        }
        
        //set target to the object that dispatched it
        //if already set, then we're re-dispatching an event for another target
        if (!event.target) {
          event.__setTarget(this);
        }

        while (dq_count--) {
          //hasEventListener
          if (hasOwnProperty.call(disp_queue[dq_count].eventListeners, evt_type)) {
            disp_queue[dq_count].handleEvent(event);
          }
          //event cancelled in listener?
          if (event.__cancel) {
            break;
          }
        }
        
        return true;
      }
    },

    /**
     * Checks whether the EventDispatcher object has any listeners
     * registered for a specific type of event.
     * @name hasEventListener
     * @param {string} type
     * @return {boolean}
     * @throws {TypeError}
     */
    'hasEventListener': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (type) {
        return this.eventListeners.hasOwnProperty(type);
      }
    },

    /**
     * Checks whether an event listener is registered with this EventDispatcher object
     * or any of its ancestors for the specified event type.
     * The difference between the hasEventListener() and the willTrigger() methods is
     * that hasEventListener() examines only the object to which it belongs,
     * whereas the willTrigger() method examines the entire event flow for the
     * event specified by the type parameter.
     * @name willTrigger
     * @param {string} type The type of event.
     * @return {boolean}
     * @throws {TypeError}
     */
    'willTrigger': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (type) {
        if (this.eventListeners.hasOwnProperty(type)) {
          //hasEventListener
          return true;
        }
        var children = this.children,
            child_count = children ? children.length : 0;

        while (child_count--) {
          if (children[child_count].willTrigger(type)) {
            return true;
          }
        }
        return false;
      }
    }
    
  };//end evtDisp_static_properties definition

  
  /*
   * CLASS PROPERTIES
   */
  
  //holds all objects with event listeners
  dispatcher_queue = doodle.EventDispatcher.dispatcher_queue = [];

  /**
   * Test if an object is an event dispatcher.
   * @name isEventDispatcher
   * @param {Object} obj
   * @return {boolean}
   * @static
   */
  isEventDispatcher = doodle.EventDispatcher.isEventDispatcher = function (obj) {
    if (!obj || typeof obj !== 'object' || typeof obj.toString !== 'function') {
      return false;
    }
    return (obj.toString() === '[object EventDispatcher]');
  };

  /**
   * Check if object inherits from event dispatcher.
   * @name inheritsEventDispatcher
   * @param {Object} obj
   * @return {boolean}
   * @static
   */
  inheritsEventDispatcher = doodle.EventDispatcher.inheritsEventDispatcher = function (obj) {
    while (obj) {
      if (isEventDispatcher(obj)) {
        return true;
      } else {
        if (typeof obj !== 'object') {
          return false;
        }
        obj = Object.getPrototypeOf(obj);
      }
    }
    return false;
  };

  
}());//end class closure
/*jslint nomen: false, plusplus: false*/
/*globals doodle, check_display_type*/

(function () {
  var node_count = 0,
      node_static_properties,
      isNode,
      inheritsNode,
      //recycled events
      evt_addedEvent = doodle.events.Event(doodle.events.Event.ADDED, true),
      evt_removedEvent = doodle.events.Event(doodle.events.Event.REMOVED, true),
      //lookup help
      doodle_Point = doodle.geom.Point,
      doodle_Matrix = doodle.geom.Matrix,
      doodle_Rectangle = doodle.geom.Rectangle,
      create_scene_path = doodle.utils.create_scene_path,
      PI = Math.PI;
  
  /**
   * @name doodle.Node
   * @class
   * @augments doodle.EventDispatcher
   * @param {string=} id|initializer
   * @return {doodle.Node}
   */
  doodle.Node = function (id) {
    var node = Object.create(doodle.EventDispatcher());
    

    Object.defineProperties(node, node_static_properties);
    //properties that require privacy
    Object.defineProperties(node, {
      

      /**
       * @name id
       * @return {string}
       * @property
       */
      'id': (function () {
        var node_id = (typeof id === 'string') ? id : "node"+ String('000'+node_count).slice(-3);
        node_count += 1;
        return {
          enumerable: true,
          configurable: true,
          get: function () { return node_id; },
          set: function (idArg) {
            node_id = idArg;
          }
        };
      }()),

      /**
       * @name root
       * @return {Display}
       * @property
       */
      'root': (function () {
        var root = null;
        return {
          enumerable: true,
          configurable: true,
          get: function () { return root; },
          set: function (node) {
            root = node;
          }
        };
      }()),

      /**
       * @name parent
       * @return {Node}
       * @property
       */
      'parent': (function () {
        var parent = null;
        return {
          enumerable: true,
          configurable: true,
          get: function () { return parent; },
          set: function (node) {
            parent = node;
          }
        };
      }()),

      /**
       * @name children
       * @return {Array}
       * @property
       */
      'children': (function () {
        var children = [];
        return {
          enumerable: true,
          configurable: false,
          get: function () {
            return children;
          }
        };
      }()),

      /**
       * @name transform
       * @return {Matrix}
       * @property
       */
      'transform': (function () {
        var transform = doodle_Matrix(1, 0, 0, 1, 0, 0);
        return {
          enumerable: true,
          configurable: false,
          get: function () { return transform; },
          set: function (matrix) {
            transform = matrix;
          }
        };
      }()),

      /**
       * @name visible
       * @return {boolean}
       * @property
       */
      'visible': (function () {
        var visible = true;
        return {
          enumerable: true,
          configurable: true,
          get: function () { return visible; },
          set: function (isVisible) {
            visible = isVisible;
          }
        };
      }()),

      /**
       * @name alpha
       * @return {number}
       * @property
       */
      'alpha': (function () {
        var alpha = 1; //alpha is between 0 and 1
        return {
          enumerable: true,
          configurable: true,
          get: function () { return alpha; },
          set: function (alphaArg) {
            alpha = (alphaArg > 1) ? 1 : ((alphaArg < 0) ? 0 : alphaArg);
          }
        };
      }()),

      /**
       * The bounding box of a Node is a union of all it's child Sprite's bounds.
       * @name getBounds
       * @param {Node} targetCoordSpace
       * @return {Rectangle|null}
       */
      'getBounds': {
        enumerable: true,
        writable: true,
        configurable: false,
        value: function (targetCoordSpace) {
          return this.__getBounds(targetCoordSpace).clone();
        }
      },

      /* Same as getBounds, but reuses an internal rectangle.
       * Since it's passed by reference, you don't want to modify it, but
       * it's more efficient for checking bounds.
       * @name __getBounds
       * @private
       */
      '__getBounds': {
        enumerable: false,
        writable: true,
        configurable: false,
        value: (function () {
          var rect = doodle_Rectangle(0, 0, 0, 0); //recycle
          
          return function (targetCoordSpace) {
            var bounding_box = null,
                child_bounds,
                children = this.children,
                len = children.length;
          
            while (len--) {
              child_bounds = children[len].__getBounds(targetCoordSpace);
              
              if (child_bounds === null) {
                continue;
              }
              if (bounding_box === null) {
                bounding_box = rect.__compose(child_bounds);
              } else {
                bounding_box.__union(child_bounds);
              }
            }
            return bounding_box;
          };
        }())
      }
    });//end defineProperties

    //passed an initialization function
    if (typeof arguments[0] === 'function') {
      arguments[0].call(node);
      id = undefined;
    }

    return node;
  };


  node_static_properties = {

    /**
     * @name x
     * @return {number}
     * @property
     */
    'x': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.transform.tx;
      },
      set: function (n) {
        this.transform.tx = n;
      }
    },

    /**
     * @name y
     * @return {number}
     * @property
     */
    'y': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.transform.ty;
      },
      set: function (n) {
        this.transform.ty = n;
      }
    },

    /*
    //registration point
    'axis': {
      value: {x: this.x, y: this.y}
    },

    'rotate': { //around external point?
      value: function (deg) {
      
        check_number_type(deg, this+'.rotate', '*degrees*');

        if (this.axis.x !== undefined && this.axis.y !== undefined) {
          this.transform.rotateAroundInternalPoint(this.axis, deg*to_radians);
        } else {
          this.transform.rotate(deg * to_radians);
        }
      }
    },
    */

    /**
     * @name rotate
     * @param {number} deg
     * @return {number}
     */
    'rotate': {
      enumerable: true,
      configurable: false,
      value: function (deg) {
        this.transform.rotate(deg * PI / 180);
      }
    },

    /**
     * @name rotation
     * @return {number}
     * @property
     */
    'rotation': {
      enumerable: true,
      configurable: true,
      get: function () {
        return this.transform.rotation * 180 / PI;
      },
      set: function (deg) {
        this.transform.rotation = deg * PI / 180;
      }
    },

    /**
     * @name scaleX
     * @param {number} sx
     * @return {number}
     */
    'scaleX': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.transform.a;
      },
      set: function (sx) {
        this.transform.a = sx;
      }
    },

    /**
     * @name scaleY
     * @param {number} sy
     * @return {number}
     */
    'scaleY': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.transform.d;
      },
      set: function (sy) {
        this.transform.d = sy;
      }
    },

    /**
     * drawing context to use
     * @name context
     * @return {CanvasRenderingContext2D}
     * @property
     */
    'context': {
      enumerable: true,
      configurable: true,
      get: function () {
        //will keep checking parent for context till found or null
        var node = this.parent;
        while (node) {
          if (node.context) {
            return node.context;
          }
          node = node.parent;
        }
        return null;
      }
    },

    /*
     * @name __allTransforms
     * @private
     */
    '__allTransforms': {
      enumerable: false,
      configurable: false,
      get: (function () {
        var transform = doodle_Matrix(1, 0, 0, 1, 0, 0);
        return function () {
          var $transform = transform,
              node = this.parent;
          $transform.compose.apply($transform, this.transform.__toArray());
          
          while (node) {
            $transform.multiply(node.transform);
            node = node.parent;
          }
          return $transform;
        };
      }())
    },

    /**
     * Returns the string representation of the specified object.
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () { return "[object Node]"; }
    },

    /**
     * @name addChildAt
     * @param {Node} node
     * @param {number} index
     * @return {Node}
     * @throws {TypeError}
     */
    'addChildAt': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (node, index) {
        var children = this.children,
            display = this.root,
            node_parent = node.parent,
            i;

        
        //if already a child then ignore
        if (children.indexOf(node) !== -1) {
          return false;
        }

        //if it had another parent, remove from their children
        if (node_parent !== null && node_parent !== this) {
          node.parent.removeChild(node);
        }
        node.parent = this;
        //add child
        children.splice(index, 0, node);

        //are we on the display path and node not previously on path
        if (display && node.root !== display) {
          //resort scene graph
          display.__sortAllChildren();
          children = create_scene_path(node, []);
          i = children.length;
          while (i--) {
            node = children[i];
            //set new root for all descendants
            node.root = display;
            //fire Event.ADDED if now on display list
            node.dispatchEvent(evt_addedEvent.__setTarget(null));
          }
        }
        return node;
      }
    },

    /**
     * @name addChild
     * @param {Node} node
     * @return {Node}
     * @throws {TypeError}
     */
    'addChild': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (node) {
        return this.addChildAt(node, 0);
      }
    },

    /**
     * @name removeChildAt
     * @param {number} index
     * @throws {TypeError}
     * @throws {RangeError}
     */
    'removeChildAt': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (index) {
        var children = this.children,
            child = children[index],
            display = this.root,
            child_descendants = create_scene_path(child, []), //includes child
            i = child_descendants.length,
            j = i;
        
        //event dispatching depends on an intact scene graph
        if (display) {
          while (i--) {
            child_descendants[i].dispatchEvent(evt_removedEvent.__setTarget(null));
          }
        }
        //un-adopt child
        children.splice(index, 1);
        
        //reset child and descendants
        child.parent = null;
        while (j--) {
          child_descendants[j].root = null;
        }
        //reorder this display's scene path
        if (display) {
          display.__sortAllChildren();
        }
      }
    },

    /**
     * @name removeChild
     * @param {Node} node
     * @throws {TypeError}
     * @throws {ReferenceError}
     */
    'removeChild': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (node) {
        this.removeChildAt(this.children.indexOf(node));
      }
    },

    /**
     * @name removeChildById
     * @param {string} id
     * @throws {TypeError}
     */
    'removeChildById': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (id) {
        this.removeChild(this.getChildById(id));
      }
    },

    /**
     * @name removeAllChildren
     * @throws {TypeError}
     */
    'removeAllChildren': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        var i = this.children.length;
        while (i--) {
          this.removeChildAt(i);
        }
      }
    },

    /**
     * @name getChildById
     * @param {string} id
     * @return {Node|null}
     * @throws {TypeError}
     */
    'getChildById': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (id) {
        var children = this.children,
            len = children.length,
            i = 0;
        for (; i < len; i++) {
          if (children[i].id === id) {
            return children[i];
          }
        }
        return null;
      }
    },

    /**
     * Changes the position of an existing child in the node's children array.
     * This affects the layering of child objects.
     * @name setChildIndex
     * @param {Node} child
     * @param {number} index
     * @throws {TypeError}
     */
    'setChildIndex': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (child, index) {
        var children = this.children,
            len = children.length,
            pos = children.indexOf(child);
        children.splice(pos, 1); //remove child
        children.splice(index, 0, child); //place child at new position
        //reorder this display's scene path
        if (this.root) {
          this.root.__sortAllChildren();
        }
      }
    },

    /**
     * Swaps the child nodes at the two specified index positions in the child list.
     * @name swapChildrenAt
     * @param {number} index1
     * @param {number} index2
     * @throws {TypeError}
     * @throws {RangeError}
     */
    'swapChildrenAt': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (index1, index2) {
        var children = this.children,
            node;
        //need to get a little fancy so we can refer to negative indexes
        node = children.splice(index1, 1, undefined)[0];
        children.splice(index1, 1, children.splice(index2, 1, undefined)[0]);
        children[children.indexOf(undefined)] = node;
        
        //reorder this display's scene path
        if (this.root) {
          this.root.__sortAllChildren();
        }
      }
    },

    /**
     * @name swapChildren
     * @param {Node} node1
     * @param {Node} node2
     * @throws {TypeError}
     */
    'swapChildren': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (node1, node2) {
        var children = this.children;
        this.swapChildrenAt(children.indexOf(node1), children.indexOf(node2));
      }
    },

    /**
     * Swap positions with another node in the parents child list.
     * @name swapDepths
     * @param {Node} node
     * @throws {TypeError}
     * @throws {ReferenceError}
     */
    'swapDepths': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function I(node) {
        var parent = this.parent,
            children;
        children = parent.children;
        parent.swapChildrenAt(children.indexOf(this), children.indexOf(node));
      }
    },

    /**
     * Swap positions with another node at a given index in the parents child list.
     * @name swapDepthAt
     * @param {number} index
     * @throws {TypeError}
     * @throws {RangeError}
     */
    'swapDepthAt': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (index) {
        var parent = this.parent;
        parent.swapChildrenAt(parent.children.indexOf(this), index);
      }
    },
    
    /**
     * Determine if node is among it's children, grandchildren, etc.
     * @name contains
     * @param {Node} node
     * @return {boolean}
     * @throws {TypeError}
     */
    'contains': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (node) {
        return (create_scene_path(this, []).indexOf(node) !== -1) ? true : false;
      }
    },

    /**
     * @name localToGlobal
     * @param {Point} point
     * @return {Point}
     * @throws {TypeError}
     */
    'localToGlobal': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (point) {
        var node = this.parent;
        //apply each transformation from this node up to root
        point = this.transform.transformPoint(point); //new point
        while (node) {
          node.transform.__transformPoint(point); //modify point
          node = node.parent;
        }
        return point;
      }
    },

    /**
     * Same as localToGlobal, but modifies a point in place.
     * @name __localToGlobal
     * @param {Point} point
     * @return {Point}
     * @throws {TypeError}
     * @private
     */
    '__localToGlobal': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (point) {
        var node = this;
        //apply each transformation from this node up to root
        while (node) {
          node.transform.__transformPoint(point); //modify point
          node = node.parent;
        }
        return point;
      }
    },

    /**
     * @name globalToLocal
     * @param {Point} point
     * @return {Point}
     * @throws {TypeError}
     */
    'globalToLocal': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (point) {
        var global_pt = {x:0, y:0};
        this.__localToGlobal(global_pt);
        return doodle_Point(point.x - global_pt.x, point.y - global_pt.y);
      }
    },

    /**
     * Same as globalToLocal, but modifies a point in place.
     * @name __globalToLocal
     * @param {Point} point
     * @return {Point}
     * @throws {TypeError}
     * @private
     */
    '__globalToLocal': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (point) {
        var global_pt = {x:0, y:0};
        this.__localToGlobal(global_pt);
        point.x = point.x - global_pt.x;
        point.y = point.y - global_pt.y;
        return point;
      }
    }
  };//end node_static_properties

  
  /*
   * CLASS METHODS
   */

  /**
   * Test if an object is an node.
   * @name isNode
   * @param {Object} obj
   * @return {boolean}
   * @static
   */
  isNode = doodle.Node.isNode = function (obj) {
    if (!obj || typeof obj !== 'object' || typeof obj.toString !== 'function') {
      return false;
    }
    return (obj.toString() === '[object Node]');
  };

  /**
   * Check if object inherits from node.
   * @name inheritsNode
   * @param {Object} obj
   * @return {boolean}
   * @static
   */
  inheritsNode = doodle.Node.inheritsNode = function (obj) {
    while (obj) {
      if (isNode(obj)) {
        return true;
      } else {
        if (typeof obj !== 'object') {
          return false;
        }
        obj = Object.getPrototypeOf(obj);
      }
    }
    return false;
  };

  
}());//end class closure
/*globals doodle*/

(function () {
  var sprite_static_properties,
      isSprite,
      inheritsSprite,
      //lookup help
      doodle_Rectangle = doodle.geom.Rectangle;

  /**
   * An node to display.
   * @name doodle.Sprite
   * @class
   * @augments doodle.Node
   * @param {string=} id Name or initialization function.
   * @return {doodle.Sprite} A sprite object.
   * @throws {SyntaxError} Invalid parameters.
   */
  doodle.Sprite = function (id) {
    //only pass id if string, an init function will be called later
    var sprite = Object.create(doodle.Node((typeof id === 'string') ? id : undefined));


    Object.defineProperties(sprite, sprite_static_properties);
    //properties that require privacy
    Object.defineProperties(sprite, (function () {
      var draw_commands = [];
      
      return {
        /**
         * The graphics object contains drawing operations to be stored in draw_commands.
         * Objects and Arrays are passed by reference, so these will be modified
         * @name graphics
         * @return {Graphics}
         * @property
         */
        'graphics': {
          enumerable: false,
          configurable: false,
          value:  Object.create(doodle.Graphics.call(sprite, draw_commands))
        },

        /**
         * Indicates the width of the sprite, in pixels.
         * @name width
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'width': (function () {
          var width = 0;
          return {
            enumerable: true,
            configurable: false,
            get: function () { return width; },
            set: function (n) {
              width = n;
            }
          };
        }()),

        /**
         * Indicates the height of the sprite, in pixels.
         * @name height
         * @return {number}
         * @throws {TypeError}
         * @property
         */
        'height': (function () {
          var height = 0;
          return {
            enumerable: true,
            configurable: false,
            get: function () { return height; },
            set: function (n) {
              height = n;
            }
          };
        }()),

        /**
         * @name getBounds
         * @param {Node} targetCoordSpace
         * @return {Rectangle}
         * @throws {TypeError}
         * @override
         */
        'getBounds': {
          enumerable: true,
          writable: true,
          configurable: false,
          value: function (targetCoordSpace) {
            return this.__getBounds(targetCoordSpace).clone();
          }
        },

        /* Same as getBounds, but reuses an internal rectangle.
         * Since it's passed by reference, you don't want to modify it, but
         * it's more efficient for checking bounds.
         * @name __getBounds
         * @private
         */
        '__getBounds': {
          enumerable: false,
          writable: true,
          configurable: false,
          value: (function () {
            var rect = doodle_Rectangle(0, 0, 0, 0); //recycle

            return function (targetCoordSpace) {
              var children = this.children,
                  len = children.length,
                  bounding_box = rect,
                  child_bounds,
                  w = this.width,
                  h = this.height,
                  //extrema points
                  graphics = this.graphics,
                  tl = {x: graphics.__minX, y: graphics.__minY},
                  tr = {x: graphics.__minX+w, y: graphics.__minY},
                  br = {x: graphics.__minX+w, y: graphics.__minY+h},
                  bl = {x: graphics.__minX, y: graphics.__minY+h},
                  min = Math.min,
                  max = Math.max;
              
              //transform corners to global
              this.__localToGlobal(tl); //top left
              this.__localToGlobal(tr); //top right
              this.__localToGlobal(br); //bot right
              this.__localToGlobal(bl); //bot left
              //transform global to target space
              targetCoordSpace.__globalToLocal(tl);
              targetCoordSpace.__globalToLocal(tr);
              targetCoordSpace.__globalToLocal(br);
              targetCoordSpace.__globalToLocal(bl);

              //set rect with extremas
              bounding_box.left = min(tl.x, tr.x, br.x, bl.x);
              bounding_box.right = max(tl.x, tr.x, br.x, bl.x);
              bounding_box.top = min(tl.y, tr.y, br.y, bl.y);
              bounding_box.bottom = max(tl.y, tr.y, br.y, bl.y);

              //add child bounds to this
              while (len--) {
                child_bounds = children[len].__getBounds(targetCoordSpace);
                
                if (child_bounds !== null) {
                  bounding_box.__union(child_bounds);
                }
              }
              return bounding_box;
            };
          }())
        },

        /** not ready
        'hitArea': (function () {
          var hit_area = null;
          return {
            enumerable: true,
            configurable: false,
            get: function () {
              if (hit_area === null) {
                return this.getBounds(this);
              } else {
                return hit_area;
              }
            },
            set: function (rect) {
              //accepts null/false or rectangle area for now
              rect = (rect === false) ? null : rect;
              if (rect !== null) {
                check_rect_type(rect, this+'.hitArea');
              }
              hit_area = rect;
            }
          };
        }()),
        **/

        /**
         * @name hitTestObject
         * @param {Node} node
         * @return {boolean}
         * @throws {TypeError}
         */
        'hitTestObject': {
          enumerable: true,
          writable: true,
          configurable: false,
          value: function (node) {
            return this.getBounds(this).intersects(node.getBounds(this));
          }
        },

        /**
         * @name hitTestPoint
         * @param {Point} pt
         * @return {boolean}
         * @throws {TypeError}
         */
        'hitTestPoint': {
          enumerable: true,
          writable: true,
          configurable: false,
          value: function (pt) {
            return this.getBounds(this).containsPoint(this.globalToLocal(pt));
          }
        },

        /* When called execute all the draw commands in the stack.
         * This draws from screen 0,0 - transforms are applied when the
         * entire scene graph is drawn.
         * @name __draw
         * @param {Context} ctx 2d canvas context to draw on.
         * @private
         */
        '__draw': {
          enumerable: false,
          writable: false,
          configurable: false,
          value: function (ctx) {
            for (var i=0, len=draw_commands.length; i < len; i++) {
              draw_commands[i].call(sprite, ctx);
            }
          }
        }
      };
    }()));//end defineProperties

    //passed an initialization function
    if (typeof arguments[0] === 'function') {
      arguments[0].call(sprite);
    }
    
    return sprite;
  };

  
  sprite_static_properties = {
    /**
     * @name rotation
     * @return {number}
     * @throws {TypeError}
     * @property
     */
    'rotation': (function () {
      var to_degrees = 180 / Math.PI,
          to_radians = Math.PI / 180;
      return {
        enumerable: true,
        configurable: false,
        get: function () {
          return this.transform.rotation * to_degrees;
        },
        set: function (deg) {
          this.transform.rotation = deg * to_radians;
        }
      };
    }()),

    /**
     * Returns the string representation of the specified object.
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Sprite]";
      }
    },

    /**
     * Updates the position and size of this sprite.
     * @name compose
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @return {Sprite}
     * @throws {TypeError}
     */
    'compose': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
      }
    }
  };//end sprite_static_properties
  
  
  /*
   * CLASS METHODS
   */

  /**
   * @name isSprite
   * @param {Object} obj
   * @return {boolean}
   * @static
   */
  isSprite = doodle.Sprite.isSprite = function (obj) {
    if (!obj || typeof obj !== 'object' || typeof obj.toString !== 'function') {
      return false;
    }
    return (obj.toString() === '[object Sprite]');
  };

  /**
   * Check if object inherits from Sprite.
   * If it doesn't return false.
   * @name inheritsSprite
   * @param {Object} obj
   * @return {boolean}
   * @static
   */
  inheritsSprite = doodle.Sprite.inheritsSprite = function (obj) {
    while (obj) {
      if (isSprite(obj)) {
        return true;
      } else {
        if (typeof obj !== 'object') {
          return false;
        }
        obj = Object.getPrototypeOf(obj);
      }
    }
    return false;
  };

  
}());//end class closure
/*globals doodle, Image*/
(function () {
  var graphics_static_properties,
      hex_to_rgb_str = doodle.utils.hex_to_rgb_str,
      get_element = doodle.utils.get_element,
      doodle_Event = doodle.events.Event,
      LINEAR = doodle.GradientType.LINEAR,
      RADIAL = doodle.GradientType.RADIAL;
  
  /**
   * @name doodle.Graphics
   * @class
   * @augments Object
   * @param {Array} draw_commands Reference to draw commands array.
   * @return {Object}
   * @this {doodle.Sprite}
   */
  doodle.Graphics = function (draw_commands) {
    var graphics = {},
        gfx_node = this,
        cursor_x = 0,
        cursor_y = 0,
        //line defaults
        line_width = 1,
        line_cap = doodle.LineCap.BUTT,
        line_join = doodle.LineJoin.MITER,
        line_miter = 10;
    
    Object.defineProperties(graphics, graphics_static_properties);
    //properties that require privacy
    Object.defineProperties(graphics, {
      /**
       * @property
       * @private
       */
      '__minX': {
        enumerable: false,
        configurable: false,
        value: 0
      },

      /**
       * @property
       * @private
       */
      '__minY': {
        enumerable: false,
        configurable: false,
        value: 0
      },

      /**
       * @property
       * @private
       */
      '__maxX': {
        enumerable: false,
        configurable: false,
        value: 0
      },

      /**
       * @property
       * @private
       */
      '__maxY': {
        enumerable: false,
        configurable: false,
        value: 0
      },
      
      /**
       * @name lineWidth
       * @return {number} [read-only]
       * @property
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-linewidth">context.lineWidth</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/En/Canvas_tutorial/Applying_styles_and_colors#A_lineWidth_example">A lineWidth Example</a> [Canvas Tutorial]
       */
      'lineWidth': {
        enumerable: true,
        configurable: false,
        get: function () { return line_width; }
      },

      /**
       * @name lineCap
       * @return {string} [read-only]
       * @property
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-linecap">context.lineCap</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/En/Canvas_tutorial/Applying_styles_and_colors#A_lineCap_example">A lineCap Example</a> [Canvas Tutorial]
       */
      'lineCap': {
        enumerable: true,
        configurable: false,
        get: function () { return line_cap; }
      },

      /**
       * @name lineJoin
       * @return {string} [read-only]
       * @property
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-linejoin">context.lineJoin</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/En/Canvas_tutorial/Applying_styles_and_colors#A_lineJoin_example">A lineJoin Example</a> [Canvas Tutorial]
       */
      'lineJoin': {
        enumerable: true,
        configurable: false,
        get: function () { return line_join; }
      },

      /**
       * The miter value means that a second filled triangle must (if possible, given
       * the miter length) be rendered at the join, with one line being the line between
       * the two aforementioned corners, abutting the first triangle, and the other two
       * being continuations of the outside edges of the two joining lines, as long as
       * required to intersect without going over the miter length.
       * @name lineMiter
       * @return {number} [read-only]
       * @property
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-miterlimit">context.miterLimit</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/En/Canvas_tutorial/Applying_styles_and_colors#A_demo_of_the_miterLimit_property">A miterLimit Demo</a> [Canvas Tutorial]
       */
      'lineMiter': {
        enumerable: true,
        configurable: false,
        get: function () { return line_miter; }
      },

      /**
       * Provide direct access to the canvas drawing api.
       * Canvas context is called as the first argument to function.
       * Unable to set bounds from a user supplied function unless explictly set.
       * @name draw
       * @param {Function} fn
       * @example
       *   x = Object.create(doodle.sprite);<br/>
       *   x.graphics.draw(function (ctx) {<br/>
       *   &nbsp; ctx.fillStyle = "#ff0000";<br/>
       *   &nbsp; ctx.fillRect(this.x, this.y, 100, 100);<br/>
       *   });<br/>
       *   x.draw();
       */
      'draw': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (fn) {
          draw_commands.push(fn);
        }
      },

      /**
       * Remove all drawing commands for sprite.
       * @name clear
       */
      'clear': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function () {
          draw_commands.length = 0;
          //reset dimensions
          gfx_node.width = 0;
          gfx_node.height = 0;

          this.__minX = this.__minY = this.__maxX = this.__maxY = 0;
          cursor_x = cursor_y = 0;
        }
      },

      /**
       * @name rect
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-rect">context.rect</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Rectangles">Rectangles</a> [Canvas Tutorial]
       */
      'rect': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y, width, height) {

          //update extremas
          this.__minX = Math.min(0, x, this.__minX);
          this.__minY = Math.min(0, y, this.__minY);
          this.__maxX = Math.max(0, x, x+width, this.__maxX);
          this.__maxY = Math.max(0, y, y+height, this.__maxY);
          
          //update size for bounding box
          gfx_node.width = -this.__minX + this.__maxX;
          gfx_node.height = -this.__minY + this.__maxY;
          
          draw_commands.push(function (ctx) {
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.closePath();
            ctx.stroke();
          });
        }
      },

      /**
       * @name circle
       * @param {number} x The x location of the center of the circle relative to the registration point of the parent display object (in pixels).
       * @param {number} y The y location of the center of the circle relative to the registration point of the parent display object (in pixels).
       * @param {number} radius
       * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Arcs">Arcs</a> [Canvas Tutorial]
       */
      'circle': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y, radius) {

          //update extremas
          this.__minX = Math.min(0, -radius+x, this.__minX);
          this.__minY = Math.min(0, -radius+y, this.__minY);
          this.__maxX = Math.max(0, x, x+radius, this.__maxX);
          this.__maxY = Math.max(0, y, y+radius, this.__maxY);
          
          //update size for bounding box
          gfx_node.width = -this.__minX + this.__maxX;
          gfx_node.height = -this.__minY + this.__maxY;

          draw_commands.push(function (ctx) {
            ctx.beginPath();
            //x, y, radius, start_angle, end_angle (Math.PI*2), anti-clockwise
            ctx.arc(x, y, radius, 0, 6.283185307179586, true);
            ctx.closePath();
            ctx.stroke();
          });
        }
      },

      /**
       * @name ellipse
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       */
      'ellipse': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y, width, height) {
          height = (height === undefined) ? width : height; //default to circle
          var rx = width / 2,
              ry = height / 2,
              krx = 0.5522847498 * rx, //kappa * radius_x
              kry = 0.5522847498 * ry;

          //update extremas
          this.__minX = Math.min(0, -rx+x, this.__minX);
          this.__minY = Math.min(0, -ry+y, this.__minY);
          this.__maxX = Math.max(0, x, x+rx, this.__maxX);
          this.__maxY = Math.max(0, y, y+ry, this.__maxY);
          
          //update size for bounding box
          gfx_node.width = -this.__minX + this.__maxX;
          gfx_node.height = -this.__minY + this.__maxY;

          draw_commands.push(function (ctx) {
            ctx.beginPath();
            ctx.moveTo(x+rx, y);
            //(cp1), (cp2), (pt)
            ctx.bezierCurveTo(x+rx, y-kry, x+krx, y-ry, x, y-ry);
            ctx.bezierCurveTo(x-krx, y-ry, x-rx, y-kry, x-rx, y);
            ctx.bezierCurveTo(x-rx, y+kry, x-krx, y+ry, x, y+ry);
            ctx.bezierCurveTo(x+krx, y+ry, x+rx, y+kry, x+rx, y);
            ctx.closePath();
            ctx.stroke();
          });
        }
      },

      /**
       * @name roundRect
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       * @param {number} rx
       * @param {number} ry
       */
      'roundRect': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y, width, height, rx, ry) {
          rx = (rx === undefined) ? 0 : rx; //default to rectangle
          ry = (ry === undefined) ? 0 : ry;
          var x3 = x + width,
              x2 = x3 - rx,
              x1 = x + rx,
              y3 = y + height,
              y2 = y3 - ry,
              y1 = y + ry;

          //update extremas
          this.__minX = Math.min(0, x, this.__minX);
          this.__minY = Math.min(0, y, this.__minY);
          this.__maxX = Math.max(0, x, x+width, this.__maxX);
          this.__maxY = Math.max(0, y, y+height, this.__maxY);
          
          //update size for bounding box
          gfx_node.width = -this.__minX + this.__maxX;
          gfx_node.height = -this.__minY + this.__maxY;

          draw_commands.push(function (ctx) {
            ctx.beginPath();
            //clockwise
            ctx.moveTo(x1, y);
            ctx.beginPath();
            ctx.lineTo(x2, y);
            ctx.quadraticCurveTo(x3, y, x3, y1);
            ctx.lineTo(x3, y2);
            ctx.quadraticCurveTo(x3, y3, x2, y3);
            ctx.lineTo(x1, y3);
            ctx.quadraticCurveTo(x, y3, x, y2);
            ctx.lineTo(x, y1);
            ctx.quadraticCurveTo(x, y, x1, y);
            ctx.closePath();
            ctx.stroke();
          });
        }
      },

      /**
       * @name moveTo
       * @param {number} x
       * @param {number} y
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-moveto">context.moveTo</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#moveTo">moveTo</a> [Canvas Tutorial]
       */
      'moveTo': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y) {
          draw_commands.push(function (ctx) {
            ctx.moveTo(x, y);
          });
          //update cursor
          cursor_x = x;
          cursor_y = y;
        }
      },

      /**
       * @name lineTo
       * @param {number} x
       * @param {number} y
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-lineto">context.lineTo</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Lines">Lines</a> [Canvas Tutorial]
       */
      'lineTo': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y) {

          //update extremas
          this.__minX = Math.min(0, x, cursor_x, this.__minX);
          this.__minY = Math.min(0, y, cursor_y, this.__minY);
          this.__maxX = Math.max(0, x, cursor_x, this.__maxX);
          this.__maxY = Math.max(0, y, cursor_y, this.__maxY);
          
          //update size for bounding box
          gfx_node.width = this.__maxX - this.__minX;
          gfx_node.height = this.__maxY - this.__minY;
          
          draw_commands.push(function (ctx) {
            ctx.lineTo(x, y);
          });

          //update cursor
          cursor_x = x;
          cursor_y = y;
        }
      },

      /**
       * Quadratic curve to point.
       * @name curveTo
       * @param {Point} pt1 Control point
       * @param {Point} pt2 End point
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-quadraticCurveTo">context.quadraticCurveTo</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves">Bezier and Quadratic Curves</a> [Canvas Tutorial]
       */
      'curveTo': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (pt1, pt2) {
          var x0 = cursor_x,
              y0 = cursor_y,
              x1 = pt1.x,
              y1 = pt1.y,
              x2 = pt2.x,
              y2 = pt2.y,
              t,
              cx = 0,
              cy = 0;
          
          //curve ratio of extrema
          t = (x0 - x1) / (x0 - 2 * x1 + x2);
          //if true, store extrema position
          if (0 <= t && t <= 1) {
            cx = (1-t) * (1-t) * x0 + 2 * (1-t) * t * x1 + t * t * x2;
          }

          t = (y0 - y1) / (y0 - 2 * y1 + y2);
          if (0 <= t && t <= 1) {
            cy = (1-t) * (1-t) * y0 + 2 * (1-t) * t * y1 + t * t * y2;
          }
          
          //update extremas
          this.__minX = Math.min(0, x0, cx, x2, this.__minX);
          this.__minY = Math.min(0, y0, cy, y2, this.__minY);
          this.__maxX = Math.max(0, x0, cx, x2, this.__maxX);
          this.__maxY = Math.max(0, y0, cy, y2, this.__maxY);
          
          //update size for bounding box
          gfx_node.width = -this.__minX + this.__maxX;
          gfx_node.height = -this.__minY + this.__maxY;

          draw_commands.push(function (ctx) {
            ctx.quadraticCurveTo(x1, y1, x2, y2);
          });

          //update cursor
          cursor_x = x2;
          cursor_y = y2;
        }
      },

      /**
       * Bezier curve to point.
       * @name bezierCurveTo
       * @param {Point} pt1 Control point 1
       * @param {Point} pt2 Control point 2
       * @param {Point} pt3 End point
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-bezierCurveTo">context.bezierCurveTo</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves">Bezier and Quadratic Curves</a> [Canvas Tutorial]
       */
      'bezierCurveTo': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (pt1, pt2, pt3) {
          var pow = Math.pow,
              max = Math.max,
              min = Math.min,
              x0 = cursor_x,
              y0 = cursor_y,
              x1 = pt1.x,
              y1 = pt1.y,
              x2 = pt2.x,
              y2 = pt2.y,
              x3 = pt3.x,
              y3 = pt3.y,
              t,
              xt,
              yt,
              cx_max = 0,
              cx_min = 0,
              cy_max = 0,
              cy_min = 0;

          /* Solve for t on curve at various intervals and keep extremas.
           * Kinda hacky until I can find a real equation.
           * 0 <= t && t <= 1
           */
          for (t = 0.1; t < 1; t += 0.1) {
            xt = pow(1-t,3) * x0 + 3 * pow(1-t,2) * t * x1 +
              3 * pow(1-t,1) * pow(t,2) * x2 + pow(t,3) * x3;
            //extremas
            if (xt > cx_max) { cx_max = xt; }
            if (xt < cx_min) { cx_min = xt; }
            
            yt = pow(1-t,3) * y0 + 3 * pow(1-t,2) * t * y1 +
              3 * pow(1-t,1) * pow(t,2) * y2 + pow(t,3) * y3;
            //extremas
            if (yt > cy_max) { cy_max = yt; }
            if (yt < cy_min) { cy_min = yt; }
          }

          //update extremas
          this.__minX = min(0, x0, cx_min, x3, this.__minX);
          this.__minY = min(0, y0, cy_min, y3, this.__minY);
          this.__maxX = max(0, x0, cx_max, x3, this.__maxX);
          this.__maxY = max(0, y0, cy_max, y3, this.__maxY);
          
          //update size for bounding box
          gfx_node.width = -this.__minX + this.__maxX;
          gfx_node.height = -this.__minY + this.__maxY;

          draw_commands.push(function (ctx) {
            ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
          });

          //update cursor
          cursor_x = x3;
          cursor_y = y3;
        }
      },

      /**
       * Specifies a simple one-color fill that subsequent calls to other
       * graphics methods use when drawing.
       * @name beginFill
       * @param {Color} color In hex format.
       * @param {number} alpha
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-fillstyle">context.fillStyle</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/En/Canvas_tutorial/Applying_styles_and_colors#Colors">Colors</a> [Canvas Tutorial]
       */
      'beginFill': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (color, alpha) {
          alpha = (alpha === undefined) ? 1 : alpha;
          draw_commands.push(function (ctx) {
            ctx.fillStyle = hex_to_rgb_str(color, alpha);
          });
        }
      },

      /**
       * @name beginGradientFill
       * @param {GradientType} type
       * @param {Point} pt1
       * @param {Point} pt2
       * @param {number} ratios
       * @param {Array} colors
       * @param {Array} alphas
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-createlineargradient">context.createLinearGradient</a> [Canvas API]
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-createradialgradient">context.createRadialGradient</a> [Canvas API]
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-canvasgradient-addcolorstop">context.addColorStop</a> [Canvas API]
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-fillstyle">context.fillStyle</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/En/Canvas_tutorial/Applying_styles_and_colors#Gradients">Gradients</a> [Canvas Tutorial]
       */
      'beginGradientFill': {
        enumerable: true,
        writable: false,
        configurable: false,
        value: function (type, pt1, pt2, ratios, colors, alphas) {
          
          draw_commands.push(function (ctx) {
            var hex_to_rgb_str = doodle.utils.hex_to_rgb_str,
                gradient,
                len = ratios.length,
                i = 0;
            
            if (type === LINEAR) {
              //not really too keen on creating gfx_node here, but I need access to the context
              gradient = ctx.createLinearGradient(pt1.x, pt1.y, pt2.x, pt2.y);
              
            } else if (type === RADIAL) {
              gradient = ctx.createRadialGradient(pt1.x, pt1.y, pt1.radius,
                                                  pt2.x, pt2.y, pt2.radius);
            } else {
              throw new TypeError(gfx_node+'.graphics.beginGradientFill(*type*, point1, point2, ratios, colors, alphas): Unknown gradient type.');
            }
            //add color ratios to our gradient
            for (; i < len; i+=1) {
              gradient.addColorStop(ratios[i], hex_to_rgb_str(colors[i], alphas[i]));
            }
            ctx.fillStyle = gradient;
          });
        }
      },

      /**
       * @name beginPatternFill
       * @param {HTMLImageElement} image
       * @param {Pattern} repeat
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-createpattern">context.createPattern</a> [Canvas API]
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-fillstyle">context.fillStyle</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/En/Canvas_tutorial/Applying_styles_and_colors#Patterns">Patterns</a> [Canvas Tutorial]
       */
      'beginPatternFill': {
        enumerable: true,
        writable: false,
        configurable: false,
        value: function (image, repeat) {
          var img_loaded = null, //image after loaded
              on_image_error,
              Pattern = doodle.Pattern;
          
          repeat = (repeat === undefined) ? Pattern.REPEAT : repeat;
          
          if (typeof image === 'string') {
            //element id
            if (image[0] === '#') {
              image = get_element(image);
            } else {
              //url
              (function () {
                var img_url = encodeURI(image);
                image = new Image();
                image.src = img_url;
              }());
            }
          }
          

          //check if image has already been loaded
          if (image.complete) {
            img_loaded = image;
          } else {
            //if not, assign load handlers
            image.onload = function () {
              img_loaded = image;
              gfx_node.dispatchEvent(doodle_Event(doodle_Event.LOAD));
            };
            on_image_error = function () {
              throw new URIError(gfx_node+'.graphics.beginPatternFill(*image*,repeat): Unable to load ' + image.src);
            };
            image.onerror = on_image_error;
            image.onabort = on_image_error;
          }
          
          draw_commands.push(function (ctx) {
            if (img_loaded) {
              ctx.fillStyle = ctx.createPattern(img_loaded, repeat);
            } else {
              //use transparent fill until image is loaded
              ctx.fillStyle = 'rgba(0,0,0,0)';
            }
          });
        }
      },

      /**
       * @name lineStyle
       * @param {number} thickness
       * @param {Color} color
       * @param {number} alpha
       * @param {LineCap} caps
       * @param {LineJoin} joints
       * @param {number} miterLimit
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-miterlimit">context.lineWidth</a> [Canvas API]
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-strokestyle">context.strokeStyle</a> [Canvas API]
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-linecap">context.lineCap</a> [Canvas API]
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-linejoin">context.lineJoin</a> [Canvas API]
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-miterlimit">context.miterLimit</a> [Canvas API]
       */
      'lineStyle': {
        enumerable: true,
        writable: false,
        configurable: false,
        value: function (thickness, color, alpha, caps, joints, miterLimit) {
          //defaults
          thickness = (thickness === undefined) ? 1 : thickness;
          color = (color === undefined) ? "#000000" : color;
          alpha = (alpha === undefined) ? 1 : alpha;
          caps = (caps === undefined) ? doodle.LineCap.BUTT : caps;
          joints = (joints === undefined) ? doodle.LineJoin.MITER : joints;
          miterLimit = (miterLimit === undefined) ? 10 : miterLimit;
          line_width = thickness;
          line_join = joints;
          line_cap = caps;
          line_miter = miterLimit;
          
          //convert color to canvas rgb() format
          if (typeof color === 'string' || typeof color === 'number') {
            color = hex_to_rgb_str(color, alpha);
          } else {
            throw new TypeError(gfx_node+'.graphics.lineStyle(thickness,*color*,alpha,caps,joints,miterLimit): Color must be a hex value.');
          }

          draw_commands.push(function (ctx) {
            ctx.lineWidth = line_width;
            ctx.strokeStyle = color;
            ctx.lineCap = line_cap;
            ctx.lineJoin = line_join;
            ctx.miterLimit = line_miter;
          });
          
        }
      },

      /**
       * @name beginPath
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-beginpath">context.beginPath</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Drawing_paths">Drawing Paths</a> [Canvas Tutorial]
       */
      'beginPath': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function () {
          draw_commands.push(function (ctx) {
            ctx.beginPath();
            ctx.moveTo(cursor_x, cursor_y);
          });
        }
      },

      /**
       * @name closePath
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-closepath">context.closePath</a> [Canvas API]
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-stroke">context.stroke</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Drawing_paths">Drawing Paths</a> [Canvas Tutorial]
       */
      'closePath': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function () {
          draw_commands.push(function (ctx) {
            ctx.closePath();
            ctx.stroke();
          });
          cursor_x = 0;
          cursor_y = 0;
        }
      },

      /**
       * @name endFill
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-fill">context.fill</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Drawing_paths">Drawing Paths</a> [Canvas Tutorial]
       */
      'endFill': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function () {
          draw_commands.push(function (ctx) {
            ctx.fill();
          });
        }
      },
      
      /**
       * @name stroke
       * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-stroke">context.stroke</a> [Canvas API]
       * @see <a href="https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes#Drawing_paths">Drawing Paths</a> [Canvas Tutorial]
       */
      'stroke': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function () {
          draw_commands.push(function (ctx) {
            ctx.stroke();
          });
          cursor_x = 0;
          cursor_y = 0;
        }
      }

    });//end defineProperties

    return graphics;
  };
  

  graphics_static_properties = {
    /**
     * Returns the string representation of the specified object.
     * @name toString
     * @return {string}
     * @override
     * @see <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/toString">Object.toString</a> [JS Ref]
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () { return "[object Graphics]"; }
    }
  };

}());//end class closure
/*globals doodle*/

(function () {
  var node_static_properties,
      url_regexp = new RegExp("^url\\((.*)\\)"),
      isElementNode,
      inheritsElementNode,
      //lookup help
      doodle_Rectangle = doodle.geom.Rectangle,
      rgb_str_to_hex = doodle.utils.rgb_str_to_hex,
      hex_to_rgb_str = doodle.utils.hex_to_rgb_str,
      get_element = doodle.utils.get_element,
      get_element_property = doodle.utils.get_element_property,
      set_element_property = doodle.utils.set_element_property;
  
  /**
   * @name doodle.ElementNode
   * @class
   * @augments doodle.Node
   * @param {HTMLElement=} element
   * @param {string=} id
   * @return {doodle.ElementNode}
   * @throws {SyntaxError}
   */
  doodle.ElementNode = function (element, id) {
    var element_node = Object.create(doodle.Node((typeof id === 'string') ? id : undefined));

    Object.defineProperties(element_node, node_static_properties);
    //properties that require privacy
    Object.defineProperties(element_node, (function () {
      //defaults
      var dom_element = null,
          node_id = element_node.id, //inherit from node
          alpha = element_node.alpha,
          visible = element_node.visible,
          width = 0,
          height = 0,
          bg_color = null,
          bg_image = null,
          bg_repeat = 'repeat';
      
      return {
        /**
         * @name element
         * @return {HTMLElement}
         * @property
         */
        'element': {
          enumerable: true,
          configurable: true,
          get: function () { return dom_element; },
          set: function (elementArg) {
            var color,
                image,
                id,
                w, h;
            
            if (elementArg === null) {
              //check if removing an element
              if (dom_element !== null) {
                //class specific tasks when removing an element
                if (typeof this.__removeDomElement === 'function') {
                  this.__removeDomElement(dom_element);
                }
                //reset some values on the doodle object
                bg_color = null;
                bg_image = null;
                bg_repeat = 'repeat';
                //keep values of parent
                if (!this.parent) {
                  width = 0;
                  height = 0;
                }
              }
              //element be'gone!
              dom_element = null;
              
            } else {
              //assign a dom element
              elementArg = get_element(elementArg);
              dom_element = elementArg;
              
              /* Some classes require special handling of their element.
               */
              this.__addDomElement(dom_element); //may be overridden

              /* These go for every dom element passed.
               */
              id = get_element_property(dom_element, 'id');
              //if element has an id, rename node. Else, set element to this id.
              if (id) {
                node_id = id;
              } else {
                this.id = node_id;
              }
              //background color and image
              bg_repeat = get_element_property(dom_element, 'backgroundRepeat') || bg_repeat;
              color = get_element_property(dom_element, 'backgroundColor', false, false);
              bg_color = color ? rgb_str_to_hex(color) : bg_color;
              //parse image path from url format
              image = get_element_property(dom_element, 'backgroundImage');
              image = (!image || image === "none") ? null : bg_image.match(url_regexp);
              bg_image = image ? image[1] : bg_image;
            }
          }
        },
        
        /* Evidently it's not very efficent to query the dom for property values,
         * as it might initiate a re-flow. Cache values instead.
         */

        /**
         * @name id
         * @return {string}
         * @throws {TypeError}
         * @override
         * @property
         */
        'id': {
          enumerable: true,
          configurable: true,
          get: function () { return node_id; },
          set: function (name) {
            node_id = set_element_property(this.element, 'id', name, 'html');
          }
        },

        /**
         * @name width
         * @return {number}
         * @throws {TypeError}
         * @override
         * @property
         */
        'width': {
          enumerable: true,
          configurable: true,
          get: function () { return width; },
          set: function (n) {
            set_element_property(this.element, 'width', n+"px");
            width = n;
          }
        },

        /**
         * @name height
         * @return {number}
         * @throws {TypeError}
         * @override
         * @property
         */
        'height': {
          enumerable: true,
          configurable: true,
          get: function () { return height; },
          set: function (n) {
            set_element_property(this.element, 'height', n+"px");
            height = n;
          }
        },

        /**
         * @name backgroundColor
         * @return {Color}
         * @property
         */
        'backgroundColor': {
          enumerable: true,
          configurable: true,
          get: function () { return bg_color; },
          set: function (color) {
            if (typeof color === 'number') {
              color = hex_to_rgb_str(color);
            }
            set_element_property(this.element, 'backgroundColor', color);
            //the dom will convert the color to 'rgb(n,n,n)' format
            bg_color = rgb_str_to_hex(get_element_property(this.element, 'backgroundColor'));
          }
        },

        /**
         * @name backgroundImage
         * @return {HTMLImageElement}
         * @throws {TypeError}
         * @property
         */
        'backgroundImage': {
          enumerable: true,
          configurable: true,
          get: function () { return bg_image; },
          set: function (image) {
            if (!image) {
              bg_image = set_element_property(this.element, 'backgroundImage', null);
              return;
            }
            //a string can be a page element or url
            if (typeof image === 'string') {
              if (image[0] === '#') {
                image = get_element(image).src;
              }
            } else if (image && image.tagName === 'IMG') {
              //passed an image element
              image = image.src;
            }
            //url path at this point, make sure it's in the proper format
            if (!url_regexp.test(image)) {
              image = "url("+ encodeURI(image) +")";
            }
            bg_image = set_element_property(this.element, 'backgroundImage', image);
          }
        },

        /**
         * @name backgroundRepeat
         * @return {string}
         * @throws {TypeError}
         * @throws {SyntaxError}
         * @property
         */
        'backgroundRepeat': {
          enumerable: true,
          configurable: true,
          get: function () { return bg_repeat; },
          set: function (repeat) {
            bg_repeat = set_element_property(this.element, 'backgroundRepeat', repeat);
          }
        },

        /**
         * @name alpha
         * @return {number}
         * @throws {TypeError}
         * @override
         * @property
         */
        'alpha': {
          enumerable: true,
          configurable: true,
          get: function () { return alpha; },
          set: function (alpha) {
            alpha = set_element_property(this.element, 'opacity', alpha);
          }
        },

        /**
         * @name visible
         * @return {boolean}
         * @throws {TypeError}
         * @override
         * @property
         */
        'visible': {
          enumerable: true,
          configurable: true,
          get: function () { return visible; },
          set: function (isVisible) {
            if (isVisible) {
              set_element_property(this.element, 'visibility', 'visible');
            } else {
              set_element_property(this.element, 'visibility', 'hidden');
            }
            visible =  isVisible;
          }
        },

        /**
         * Called when a dom element is added. This function will be overridden
         * for sub-class specific behavior.
         * @name __addDomElement
         * @param {HTMLElement} elementArg
         * @private
         */
        '__addDomElement': {
          enumerable: false,
          configurable: true,
          value: function (elementArg) {
            //default method obtaining element dimensions  
            var w = get_element_property(elementArg, 'width', 'int') || elementArg.width,
                h = get_element_property(elementArg, 'height', 'int') || elementArg.height;
            if (typeof w === 'number') { width = w; }
            if (typeof h === 'number') { height = h; }
          }
        },

        /**
         * @name __addDomElement
         * @param {HTMLElement} elementArg
         * @return {Rectangle} Rectangle object is reused for each call.
         * @throws {TypeError} targetCoordSpace must inherit from Node.
         * @override
         * @private
         */
        '__getBounds': {
          enumerable: true,
          configurable: true,
          value: (function () {
            var rect = doodle_Rectangle(0, 0, 0, 0); //recycle
            return function (targetCoordSpace) {
              var children = this.children,
                  len = children.length,
                  bounding_box = rect,
                  child_bounds,
                  w = this.width,
                  h = this.height,
                  tl = {x: 0, y: 0},
                  tr = {x: w, y: 0},
                  br = {x: w, y: h},
                  bl = {x: 0, y: h},
                  min = Math.min,
                  max = Math.max;
              
              //transform corners to global
              this.__localToGlobal(tl); //top left
              this.__localToGlobal(tr); //top right
              this.__localToGlobal(br); //bot right
              this.__localToGlobal(bl); //bot left
              //transform global to target space
              targetCoordSpace.__globalToLocal(tl);
              targetCoordSpace.__globalToLocal(tr);
              targetCoordSpace.__globalToLocal(br);
              targetCoordSpace.__globalToLocal(bl);

              //set rect with extremas
              bounding_box.left = min(tl.x, tr.x, br.x, bl.x);
              bounding_box.right = max(tl.x, tr.x, br.x, bl.x);
              bounding_box.top = min(tl.y, tr.y, br.y, bl.y);
              bounding_box.bottom = max(tl.y, tr.y, br.y, bl.y);

              //add child bounds to this
              while (len--) {
                child_bounds = children[len].__getBounds(targetCoordSpace);
                if (child_bounds !== null) {
                  bounding_box.__union(child_bounds);
                }
              }
              return bounding_box;
            };
          }())
        }
        
      };
    }()));//end defineProperties

    //check args
    switch (arguments.length) {
    case 0:
      break;
    case 1:
      //passed function
      if (typeof arguments[0] === 'function') {
        arguments[0].call(element_node);
        element = undefined;
      } else {
        //passed element
        element_node.element = element;
      }
      break;
    case 2:
      //standard instantiation (element, id)
      if (element) {
        //can be undefined
        element_node.element = element;
      }
      break;
    default:
      throw new SyntaxError("[object ElementNode](element, id): Invalid number of parameters.");
    }

    return element_node;
  };

  
  node_static_properties = {
    /**
     * Returns the string representation of the specified object.
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "[object ElementNode]";
      }
    }
  };//end node_static_properties

  /*
   * CLASS METHODS
   */

  /**
   * Test if an object is an ElementNode.
   * @name isElementNode
   * @param {Object} obj
   * @return {boolean}
   * @static
   */
  isElementNode = doodle.ElementNode.isElementNode = function (obj) {
    if (!obj || typeof obj !== 'object' || typeof obj.toString !== 'function') {
      return false;
    }
    return (obj.toString() === '[object ElementNode]');
  };

  /**
   * Check if object inherits from ElementNode.
   * @name inheritsNode
   * @param {Object} obj
   * @return {boolean}
   * @static
   */
  inheritsElementNode = doodle.ElementNode.inheritsElementNode = function (obj) {
    while (obj) {
      if (isElementNode(obj)) {
        return true;
      } else {
        if (typeof obj !== 'object') {
          return false;
        }
        obj = Object.getPrototypeOf(obj);
      }
    }
    return false;
  };

  
}());//end class closure
/*globals doodle, document*/

(function () {
  var layer_static_properties,
      layer_count = 0,
      isLayer,
      inheritsLayer,
      set_element_property = doodle.utils.set_element_property;
  
  /**
   * @name doodle.Layer
   * @class
   * @augments doodle.ElementNode
   * @param {string=} id
   * @param {HTMLCanvasElement=} element
   * @return {doodle.Layer}
   * @throws {SyntaxError}
   */
  doodle.Layer = function (id, element) {
    var layer_name = (typeof id === 'string') ? id : "layer"+ String('00'+layer_count).slice(-2),
        layer = Object.create(doodle.ElementNode(undefined, layer_name));

    Object.defineProperties(layer, layer_static_properties);
    //properties that require privacy
    Object.defineProperties(layer, (function () {
      //defaults
      var width = 0,
          height = 0,
          context = null;
      
      return {
        /**
         * Canvas dimensions need to apply to HTML attributes.
         * @name width
         * @return {number}
         * @throws {TypeError}
         * @property
         * @override
         */
        'width': {
          enumerable: true,
          configurable: true,
          get: function () { return width; },
          set: function (n) {
            width = set_element_property(this.element, 'width', n, 'html');
          }
        },

        /**
         * 
         * @name height
         * @return {number}
         * @throws {TypeError}
         * @property
         * @override
         */
        'height': {
          enumerable: true,
          configurable: true,
          get: function () { return height; },
          set: function (n) {
            height = set_element_property(this.element, 'height', n, 'html');
          }
        },

        /**
         * 
         * @name context
         * @return {CanvasRenderingContext2D}
         * @property
         * @override
         */
        'context': {
          enumerable: true,
          configurable: true,
          get: function () { return context; }
        },

        /**
         * Layer specific things to setup when adding a dom element.
         * Called in ElementNode.element
         * @name __addDomElement
         * @param {HTMLElement} elementArg
         * @throws {TypeError}
         * @override
         * @private
         */
        '__addDomElement': {
          enumerable: false,
          writable: false,
          value: function (elementArg) {
            //need to stack canvas elements inside div
            set_element_property(elementArg, 'position', 'absolute');
            //set to display dimensions if there
            if (this.parent) {
              this.width = this.parent.width;
              this.height = this.parent.height;
            }
            //set rendering context
            context = elementArg.getContext('2d');
          }
        },

        /**
         * Layer specific things to setup when removing a dom element.
         * Called in ElementNode.element
         * @name __removeDomElement
         * @param {HTMLElement} elementArg
         * @override
         * @private
         */
        '__removeDomElement': {
          enumerable: false,
          writable: false,
          value: function (elementArg) {
            context = null;
          }
        }
        
      };
    }()));//end defineProperties

    switch (arguments.length) {
    case 0:
      break;
    case 1:
      //passed function or id string
      if (typeof arguments[0] === 'function') {
        arguments[0].call(layer);
        id = undefined;
      }
      break;
    case 2:
      layer.element = element;
      break;
    default:
      throw new SyntaxError("[object Layer](id, element): Invalid number of parameters.");
    }

    if (layer.element === null) {
      layer.element = document.createElement('canvas');
    }
    
    layer_count += 1;

    return layer;
  };

  
  layer_static_properties = {
    /**
     * Returns the string representation of the specified object.
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Layer]";
      }
    },

    /**
     * This is always the same size, so we'll save some computation.
     * @name __getBounds
     * @return {Rectangle}
     * @override
     * @private
     */
    '__getBounds': {
      enumerable: true,
      configurable: true,
      value: (function () {
        var rect = doodle.geom.Rectangle(0, 0, 0, 0); //recycle
        return function () {
          return rect.compose(0, 0, this.width, this.height);
        };
      }())
    }
  };//end layer_static_properties

  /*
   * CLASS METHODS
   */

  /**
   * Test if an object is a Layer.
   * @name isLayer
   * @param {Object} obj
   * @return {boolean}
   * @static
   */
  isLayer = doodle.Layer.isLayer = function (obj) {
    if (!obj || typeof obj !== 'object' || typeof obj.toString !== 'function') {
      return false;
    }
    return (obj.toString() === '[object Layer]');
  };

  /**
   * Check if object inherits from layer.
   * @name inheritsLayer
   * @param {Object} obj
   * @return {boolean}
   * @static
   */
  inheritsLayer = doodle.Layer.inheritsLayer = function (obj) {
    while (obj) {
      if (isLayer(obj)) {
        return true;
      } else {
        if (typeof obj !== 'object') {
          return false;
        }
        obj = Object.getPrototypeOf(obj);
      }
    }
    return false;
  };

  
}());//end class closure
/*jslint nomen: false, plusplus: false*/
/*globals doodle, document, setInterval, clearInterval, Stats*/

(function () {
  var display_static_properties,
      display_count = 0,
      isDisplay,
      create_frame,
      clear_scene_graph,
      draw_scene_graph,
      draw_bounding_box,
      dispatch_mouse_event,
      dispatch_mousemove_event,
      dispatch_mouseleave_event,
      dispatch_keyboard_event,
      create_scene_path = doodle.utils.create_scene_path,
      isLayer = doodle.Layer.isLayer,
      get_element = doodle.utils.get_element,
      get_element_property = doodle.utils.get_element_property,
      set_element_property = doodle.utils.set_element_property,
      doodle_Layer = doodle.Layer,
      //doodle_TouchEvent = doodle.events.TouchEvent,
      //recycle these event objects
      evt_enterFrame = doodle.events.Event(doodle.events.Event.ENTER_FRAME),
      evt_mouseEvent = doodle.events.MouseEvent(''),
      //evt_touchEvent = doodle.events.TouchEvent(''),
      evt_keyboardEvent = doodle.events.KeyboardEvent('');
  
  /**
   * Doodle Display object.
   * @name doodle.Display
   * @class
   * @augments doodle.ElementNode
   * @param {HTMLElement=} element
   * @return {doodle.Display}
   * @throws {TypeError} Must be a block style element.
   * @throws {SyntaxError}
   * @example
   *   var display = doodle.Display;<br/>
   *   display.width = 400;
   * @example
   *   var display = doodle.Display(function () {<br/>
   *   &nbsp; this.width = 400;<br/>
   *   });
   */
  doodle.Display = function (element) {
    var display,
        id;

    //extract id from element
    if (element && typeof element !== 'function') {
      element = get_element(element);
      id = get_element_property(element, 'id');
    }

    id = (typeof id === 'string') ? id : "display"+ String('00'+display_count++).slice(-2);
    //won't assign element until after display properties are set up
    display = Object.create(doodle.ElementNode(undefined, id));

    
    Object.defineProperties(display, display_static_properties);
    //properties that require privacy
    Object.defineProperties(display, (function () {
      var width = 0,
          height = 0,
          dom_element = null, //just a reference
          layers = display.children,
          dispatcher_queue = doodle.EventDispatcher.dispatcher_queue,
          display_scene_path = [], //all descendants
          mouseX = 0,
          mouseY = 0,
          //chrome mouseevent has offset info, otherwise need to calculate
          evt_offset_p = document.createEvent('MouseEvent').offsetX !== undefined,
          //move to closer scope since they're called frequently
          $display = display,
          $dispatch_mouse_event = dispatch_mouse_event,
          $dispatch_mousemove_event = dispatch_mousemove_event,
          $dispatch_mouseleave_event = dispatch_mouseleave_event,
          $dispatch_keyboard_event = dispatch_keyboard_event,
          $create_frame = create_frame,
          //recycled event objects
          $evt_enterFrame = evt_enterFrame,
          $evt_mouseEvent = evt_mouseEvent,
          $evt_keyboardEvent = evt_keyboardEvent;

      /* @param {doodle.events.MouseEvent} evt
       */
      function on_mouse_event (evt) {
        $dispatch_mouse_event(evt, $evt_mouseEvent,
                              display_scene_path, display_scene_path.length,
                              mouseX, mouseY, $display);
      }

      /* @param {doodle.events.MouseEvent} evt
       */
      function on_mouse_move (evt) {
        var x, y;
        mouseX = x = evt_offset_p ? evt.offsetX : evt.clientX - dom_element.offsetLeft;
        mouseY = y = evt_offset_p ? evt.offsetY : evt.clientY - dom_element.offsetTop;
        
        $dispatch_mousemove_event(evt, $evt_mouseEvent,
                                  display_scene_path, display_scene_path.length,
                                  x, y, $display);
      }

      /* @param {doodle.events.MouseEvent} evt
       */
      function on_mouse_leave (evt) {
        $dispatch_mouseleave_event(evt, $evt_mouseEvent, display_scene_path, layers, layers.length, $display);
      }

      /* @param {doodle.events.KeyboardEvent} evt
       */
      function on_keyboard_event (evt) {
        $dispatch_keyboard_event(evt, $evt_keyboardEvent, $display);
      }

      /*
       */
      function on_create_frame () {
        $create_frame(layers, layers.length,
                      dispatcher_queue, dispatcher_queue.length, $evt_enterFrame,
                      display_scene_path, display_scene_path.length,
                      $display);
      }
      
      //Add display handlers
      //Redraw scene graph when children are added and removed.
      $display.addEventListener(doodle.events.Event.ADDED, on_create_frame);
      $display.addEventListener(doodle.events.Event.REMOVED, on_create_frame);
      //Add keyboard listeners to document.
      document.addEventListener(doodle.events.KeyboardEvent.KEY_PRESS, on_keyboard_event, false);
      document.addEventListener(doodle.events.KeyboardEvent.KEY_DOWN, on_keyboard_event, false);
      document.addEventListener(doodle.events.KeyboardEvent.KEY_UP, on_keyboard_event, false);
      
      return {
        /**
         * Display always returns itself as root.
         * @name root
         * @return {Display}
         * @property
         * @override
         */
        'root': {
          enumerable: true,
          writable: false,
          configurable: false,
          value: $display
        },
        
        /**
         * Mouse x position on display.
         * @name mouseX
         * @return {number} [read-only]
         * @property
         */
        'mouseX': {
          enumerable: true,
          configurable: false,
          get: function () { return mouseX; }
        },

        /**
         * Mouse y position on display.
         * @name mouseY
         * @return {number} [read-only]
         * @property
         */
        'mouseY': {
          enumerable: true,
          configurable: false,
          get: function () { return mouseY; }
        },
        
        /**
         * Display width. Setting this affects all it's children layers.
         * @name width
         * @return {number}
         * @throws {TypeError}
         * @property
         * @override
         */
        'width': {
          get: function () { return width; },
          set: function (n) {
            var i = layers.length;
            set_element_property(this.element, 'width', n+"px");
            width = n;
            //cascade down to our canvas layers
            while(i--) {
              layers[i].width = n;
            }
            return n;
          }
        },

        /**
         * Display height. Setting this affects all it's children layers.
         * @name height
         * @return {number}
         * @throws {TypeError}
         * @property
         * @override
         */
        'height': {
          get: function () { return height; },
          set: function (n) {
            var i = layers.length;
            set_element_property(this.element, 'height', n+"px");
            height = n;
            //cascade down to our canvas layers
            while(i--) {
              layers[i].height = n;
            }
            return n;
          }
        },
        
        /**
         * Gets size of display element and adds event handlers.
         * Called in ElementNode.element
         * @name __addDomElement
         * @param {HTMLElement} elementArg
         * @throws {TypeError}
         * @override
         * @private
         */
        '__addDomElement': {
          enumerable: false,
          writable: false,
          value: function (elementArg) {
            //need to stack the canvas elements on top of each other
            set_element_property(elementArg, 'position', 'relative');
            
            //computed style will return the entire window size
            var w = get_element_property(elementArg, 'width', 'int', false) || elementArg.width,
                h = get_element_property(elementArg, 'height', 'int', false) || elementArg.height;
            //setting this also sets child layers
            if (typeof w === 'number') { this.width = w; }
            if (typeof h === 'number') { this.height = h; }

            //add event handlers
            //MouseEvents
            elementArg.addEventListener(doodle.events.MouseEvent.MOUSE_MOVE, on_mouse_move, false);
            //this dispatches mouseleave and mouseout for display and layers
            elementArg.addEventListener(doodle.events.MouseEvent.MOUSE_OUT, on_mouse_leave, false);
            //
            elementArg.addEventListener(doodle.events.MouseEvent.CLICK, on_mouse_event, false);
            elementArg.addEventListener(doodle.events.MouseEvent.DOUBLE_CLICK, on_mouse_event, false);
            elementArg.addEventListener(doodle.events.MouseEvent.MOUSE_DOWN, on_mouse_event, false);
            elementArg.addEventListener(doodle.events.MouseEvent.MOUSE_UP, on_mouse_event, false);
            elementArg.addEventListener(doodle.events.MouseEvent.CONTEXT_MENU, on_mouse_event, false);
            elementArg.addEventListener(doodle.events.MouseEvent.MOUSE_WHEEL, on_mouse_event, false);
            /*//TouchEvents
            elementArg.addEventListener(doodle_TouchEvent.TOUCH_START, on_touch_event, false);
            elementArg.addEventListener(doodle_TouchEvent.TOUCH_MOVE, on_touch_event, false);
            elementArg.addEventListener(doodle_TouchEvent.TOUCH_END, on_touch_event, false);
            elementArg.addEventListener(doodle_TouchEvent.TOUCH_CANCEL, on_touch_event, false);
            */
            dom_element = elementArg;
          }
        },

        /**
         * Removes event handlers from display element.
         * @name __removeDomElement
         * @param {HTMLElement} elementArg
         * @override
         * @private
         */
        '__removeDomElement': {
          enumerable: false,
          writable: false,
          value: function (elementArg) {
            //remove event handlers
            //MouseEvents
            elementArg.removeEventListener(doodle.events.MouseEvent.MOUSE_MOVE, on_mouse_move, false);
            //
            elementArg.removeEventListener(doodle.events.MouseEvent.MOUSE_OUT, on_mouse_leave, false);
            //
            elementArg.removeEventListener(doodle.events.MouseEvent.CLICK, on_mouse_event, false);
            elementArg.removeEventListener(doodle.events.MouseEvent.DOUBLE_CLICK, on_mouse_event, false);
            elementArg.removeEventListener(doodle.events.MouseEvent.MOUSE_DOWN, on_mouse_event, false);
            elementArg.removeEventListener(doodle.events.MouseEvent.MOUSE_UP, on_mouse_event, false);
            elementArg.removeEventListener(doodle.events.MouseEvent.CONTEXT_MENU, on_mouse_event, false);
            elementArg.removeEventListener(doodle.events.MouseEvent.MOUSE_WHEEL, on_mouse_event, false);
            /*//TouchEvents
            elementArg.removeEventListener(doodle_TouchEvent.TOUCH_START, on_touch_event, false);
            elementArg.removeEventListener(doodle_TouchEvent.TOUCH_MOVE, on_touch_event, false);
            elementArg.removeEventListener(doodle_TouchEvent.TOUCH_END, on_touch_event, false);
            elementArg.removeEventListener(doodle_TouchEvent.TOUCH_CANCEL, on_touch_event, false);
            */
            dom_element = null;
          }
        },

        /**
         * All descendants of the display, in scene graph order.
         * @name allChildren
         * @return {Array} [read-only]
         * @property
         */
        'allChildren': {
          enumerable: true,
          configurable: false,
          get: function () { return display_scene_path; }
        },

        /**
         * Re-creates the display's scene path. Called when adding child nodes.
         * @name __sortAllChildren
         * @throws {RangeError}
         * @throws {ReferenceError}
         * @private
         */
        '__sortAllChildren': {
          enumerable: false,
          configurable: false,
          value: function () {
            create_scene_path(this, display_scene_path, true).reverse();
            /*** not-implemented-yet
            //move layers toward the bottom of the stack
            display_scene_path.sort(function (a, b) {
              if ((isDisplay(a) || isDisplay(b)) ||
                  (isLayer(a) && isLayer(b)) ||
                  (!isLayer(a) && !isLayer(b))) {
                return 0;
              } else if (isLayer(a) && !isLayer(b)) {
                return -1;
              } else if (!isLayer(a) && isLayer(b)) {
                return 1;
              }
            });
            ***/
          }
        },

        /**
         * Returns a list of nodes under a given display position.
         * @name getNodesUnderPoint
         * @param {Point} point
         * @throws {TypeError}
         * @return {Array}
         */
        'getNodesUnderPoint': {
          enumerable: true,
          configurable: false,
          value: function (point) {
            var nodes = [],
                scene_path = display_scene_path,
                i = scene_path.length,
                x = point.x,
                y = point.y,
                node;
            while (i--) {
              node = scene_path[i];
              if(node.__getBounds(this).contains(x, y)) {
                nodes.push(node);
              }
            }
            return nodes;
          }
        },

        /**
         * Add a layer to the display's children at the given array position.
         * Layer inherits the dimensions of the display.
         * @name addChildAt
         * @param {Layer} layer
         * @param {number} index
         * @return {Layer}
         * @throws {TypeError}
         * @override
         */
        'addChildAt': {
          enumerable: true,
          configurable: false,
          value: (function () {
            var super_addChildAt = $display.addChildAt;
            return function (layer, index) {
              //inherit display dimensions
              layer.width = this.width;
              layer.height = this.height;
              //add dom element
              this.element.appendChild(layer.element);
              return super_addChildAt.call(this, layer, index);
            };
          }())
        },

        /**
         * Remove a layer from the display's children at the given array position.
         * @name removeChildAt
         * @param {number} index
         * @throws {TypeError}
         * @override
         */
        'removeChildAt': {
          enumerable: true,
          writable: false,
          configurable: false,
          value: (function () {
            var super_removeChildAt = $display.removeChildAt;
            return function (index) {
              //remove from dom
              this.element.removeChild(layers[index].element);
              return super_removeChildAt.call(this, index);
            };
          }())
        },

        /**
         * Change the display order of two child layers at the given index.
         * @name swapChildrenAt
         * @param {number} idx1
         * @param {number} idx2
         * @throws {TypeError}
         * @override
         */
        'swapChildrenAt': {
          enumerable: true,
          writable: false,
          configurable: false,
          value: (function () {
            var super_swapChildrenAt = $display.swapChildrenAt;
            return function (idx1, idx2) {
              //swap dom elements
              if (idx1 > idx2) {
                this.element.insertBefore(layers[idx2].element, layers[idx1].element);
              } else {
                this.element.insertBefore(layers[idx1].element, layers[idx2].element);
              }
              return super_swapChildrenAt.call(this, idx1, idx2);
            };
          }())
        },


        /**
         * Determines the interval to dispatch the event type Event.ENTER_FRAME.
         * This event is dispatched simultaneously to all display objects listenting
         * for this event. It does not go through a "capture phase" and is dispatched
         * directly to the target, whether the target is on the display list or not.
         * @name frameRate
         * @return {number|false}
         * @throws {TypeError}
         * @throws {RangeError}
         * @property
         */
        'frameRate': (function () {
          var frame_rate = false, //fps
              framerate_interval_id;
          return {
            get: function () { return frame_rate; },
            set: function (fps) {
              if (fps === 0 || fps === false) {
                //turn off interval
                frame_rate = false;
                if (framerate_interval_id !== undefined) {
                  clearInterval(framerate_interval_id);
                }
              } else {
                //non-zero number, ignore if given same value
                if (fps !== frame_rate) {
                  if (framerate_interval_id !== undefined) {
                    clearInterval(framerate_interval_id);
                  }
                  framerate_interval_id = setInterval(on_create_frame, 1000/fps);
                  frame_rate = fps;
                }
              }
            }
          };
        }())
        
      };//end return object
    }()));//end defineProperties

    //check args
    switch (arguments.length) {
    case 0:
      break;
    case 1:
      //passed function
      if (typeof arguments[0] === 'function') {
        arguments[0].call(element);
        element = undefined;
      } else {
        //passed element
        display.element = element;
      }
      break;
    default:
      throw new SyntaxError("[object Display](element): Invalid number of parameters.");
    }

    
    //draw at least 1 frame
    create_frame(display.children, display.children.length,
                 doodle.EventDispatcher.dispatcher_queue,
                 doodle.EventDispatcher.dispatcher_queue.length,
                 evt_enterFrame,
                 display.allChildren, display.allChildren.length,
                 display);
    
    return display;
  };//end doodle.Display

  
  display_static_properties = {
    /**
     * A Display has no parent.
     * @name parent
     * @return {null}
     * @override
     * @property
     */
    'parent': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: null
    },
    
    /**
     * Returns the string representation of the specified object.
     * @name toString
     * @return {string}
     * @override
     * @property
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () { return "[object Display]"; }
    },

    /**
     * Add a new layer to the display's children.
     * @name addLayer
     * @param {string} id
     * @return {Layer}
     * @throws {TypeError}
     */
    'addLayer': {
      value: function (id) {
        return this.addChild(doodle_Layer(id));
      }
    },

    /**
     * Remove a layer with a given name from the display's children.
     * @name removeLayer
     * @param {string} id
     * @throws {TypeError}
     */
    'removeLayer': {
      value: function (id) {
        return this.removeChildById(id);
      }
    },

    /**
     * The bounds of a display is always it's dimensions.
     * @name __getBounds
     * @return {Rectangle} This object is reused with each call.
     * @override
     * @private
     */
    '__getBounds': {
      enumerable: false,
      configurable: true,
      value: (function () {
        var rect = doodle.geom.Rectangle(0, 0, 0, 0); //recycle
        return function () {
          return rect.compose(0, 0, this.width, this.height);
        };
      }())
    }
  };//end display_static_properties

  
  /* Clear, move, draw.
   * Dispatches Event.ENTER_FRAME to all objects listening to it,
   * reguardless if it's on the scene graph or not.
   * @this {Display}
   */
  create_frame = (function () {
    var frame_count = 0;
    return function make_frame (layers, layer_count,
                                receivers, recv_count, enterFrame,
                                scene_path, path_count,
                                display, clearRect) {
      /*** new way
      var node,
          i,
          bounds,
          ctx;
      //clear scene - only need top level nodes
      while (layer_count--) {
        ctx = layers[layer_count].context;

        node = layers[layer_count].children; //array - top level nodes
        i = node.length;

        while (i--) {
          ctx.clearRect.apply(ctx, node[i].__getBounds(display).inflate(2, 2).__toArray());
        }
      }

      //update position
      while (recv_count--) {
        if (receivers[recv_count].eventListeners.hasOwnProperty('enterFrame')) {
          receivers[recv_count].handleEvent(enterFrame.__setTarget(receivers[recv_count]));
        }
      }

      //draw
      while (path_count--) {
        node = scene_path[path_count];
        ctx = node.context;
        
        if (ctx && node.visible) {
          ctx.save();
          ctx.transform.apply(ctx, node.__allTransforms.__toArray());
        
          //apply alpha to node and it's children
          if (!isLayer(node)) {
            if (node.alpha !== 1) {
              ctx.globalAlpha = node.alpha;
            }
          }
          if (typeof node.__draw === 'function') {
            node.__draw(ctx);
          }

          //DEBUG//
          if (node.debug.boundingBox) {
            bounds = node.__getBounds(display);
            if (bounds) {
              ctx.save();
              ctx.setTransform(1, 0, 0, 1, 0, 0); //reset
              //bounding box
              ctx.lineWidth = 0.5;
              ctx.strokeStyle = display.debug.boundingBox;
              ctx.strokeRect.apply(ctx, bounds.__toArray());
              ctx.restore();
            }
            
          }
          //END_DEBUG//
          ctx.restore();
        }
      }
      ****/

      /*** old way ***/
      clear_scene_graph(layers, layer_count);
      
      while (recv_count--) {
        if (receivers[recv_count].eventListeners.hasOwnProperty('enterFrame')) {
          receivers[recv_count].handleEvent(enterFrame.__setTarget(receivers[recv_count]));
        }
      }

      draw_scene_graph(scene_path, path_count);
      
      frame_count++;
      /**end old way**/
      
    };
  }());

  
  /*
   * @param {Node} node
   */
  clear_scene_graph = function (layers, count) {
    /* Brute way, clear entire layer in big rect.
     */
    var ctx;
    while (count--) {
      ctx = layers[count].context;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0); //reset
      ctx.clearRect(0, 0, layers[count].width, layers[count].height);
      ctx.restore();
    }
  };

  /*
   *
   */
  draw_scene_graph = function (scene_path, count) {
    var node,
        display,
        ctx,
        bounds;
    
    while (count--) {
      node = scene_path[count];
      
      if (node) {
        display = node.root;
        ctx = node.context;
      }
      
      if (ctx && node.visible) {
        ctx.save();
        ctx.transform.apply(ctx, node.__allTransforms.__toArray());
        
        //apply alpha to node and it's children
        if (!isLayer(node)) {
          if (node.alpha !== 1) {
            ctx.globalAlpha = node.alpha;
          }
        }
        if (typeof node.__draw === 'function') {
          node.__draw(ctx);
        }
        
        ctx.restore();
        
      }
    }
  };
  

  /*
   * EVENT DISPATCHING
   */

  /* Dispatches the following dom mouse events to doodle nodes on the display path:
   * 'click', 'doubleclick', 'mousedown', 'mouseup', 'contextmenu', 'mousewheel'.
   * An event is dispatched to the first node on the display path which
   * mouse position is within their bounds. The event then follows the event path.
   * The doodle mouse event is recycled by copying properties from the dom event.
   *
   * @param {doodle.events.MouseEvent} evt DOM mouse event to copy properties from.
   * @param {doodle.events.MouseEvent} mouseEvent Doodle mouse event to re-dispatch to nodes.
   * @param {Array} path Reference to the display's scene path.
   * @param {number} count number of nodes in the scene path array.
   * @param {number} x Position of the mouse x coordiante.
   * @param {number} y Position of the mouse y coorindate.
   * @param {Display} display Reference to the display object.
   * @return {boolean} True if event gets dispatched.
   * @private
   */
  dispatch_mouse_event = function (evt, mouseEvent, path, count, x, y, display) {
    while (count--) {
      if(path[count].__getBounds(display).contains(x, y)) {
        path[count].dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null));
        return true;
      }
    }
    return false;
  };

  
  (function () {
  /* ignores layers until later - not implemented - not sure I want to
   */
  var dispatch_mouse_event_IGNORELAYER = function (evt, mouseEvent, evt_type, path, count, x, y,
                                                   display, layers, layer_count) {
    //check nodes, dispatch if in boundry
    while (count--) {
      if (count <= layer_count) {
        break;
      }
      if (path[count].__getBounds(display).contains(x, y)) {
        path[count].dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null));
        return true;
      }
    }
    //if no layers, dispatch from display
    if (layer_count === 0) {
      display.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null));
      return true;
    }
    //check layers, must have handler to dispatch
    while (layer_count--) {
      if (layers[layer_count].eventListeners.hasOwnProperty(evt_type)) {
        layers[layer_count].dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null));
        return true;
      }
    }
    //if nothing else, top layer dispatch to display
    layers[--count].dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null));
    return true;
  };
  }());

  /* Called on every mousemove event from the dom.
   * Dispatches the following events to doodle nodes on the display path:
   * 'mousemove', 'mouseover', 'mouseenter', 'mouseout', 'mouseleave'
   * Maintains mouse over/out information by assigning a boolean value to
   * the node.__pointInBounds property. This is only accessed in this function,
   * and is reset in 'dispatch_mouseleave_event'.
   *
   * @param {doodle.events.MouseEvent} evt DOM mouse event to copy properties from.
   * @param {doodle.events.MouseEvent} mouseEvent Doodle mouse event to re-dispatch to nodes.
   * @param {Array} path Reference to the display's scene path.
   * @param {number} count number of nodes in the scene path array.
   * @param {number} x Position of the mouse x coordiante.
   * @param {number} y Position of the mouse y coorindate.
   * @param {Display} display Reference to the display object.
   * @return {boolean} True on dispatch. (Always true because display will trigger it.)
   * @private
   */
  dispatch_mousemove_event = function (evt, mouseEvent, path, count, x, y, display) {
    var node;
    while (count--) {
      node = path[count];
      if(node.__getBounds(display).contains(x, y)) {
        //point in bounds
        if (!node.__pointInBounds) {
          /* @type {boolean} */
          node.__pointInBounds = true;
          //dispatch events to node and up parent chain
          node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseover'));
          node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseenter'));
          return true;
        }
        //while in-bounds, dispatch mousemove
        node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null));
        return true;
      } else {
        //point not on sprite
        if (node.__pointInBounds) {
          /* @type {boolean} */
          node.__pointInBounds = false;
          //dispatch events to node and up parent chain
          node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseout'));
          node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseleave'));
          return true;
        }
      }
    }
  };

  (function () {
  /* not implemented
   */
  var dispatch_mousemove_event_IGNORELAYER = function (evt, mouseEvent, path, count, x, y,
                                                       display, layers, layer_count) {
    var node,
        evt_disp_p = false;
    
    while (count--) {
      if (count <= layer_count) {
        break;
      }
      node = path[count];

      if (node.__getBounds(display).contains(x, y)) {
        //point in bounds
        if (!node.__pointInBounds) {
          /* @type {boolean} */
          node.__pointInBounds = true;
          node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseover'));
          node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseenter'));
          return true;
        }
        //while in-bounds, dispatch mousemove
        node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null));
        return true;
      } else {
        //point not on sprite
        if (node.__pointInBounds) {
          /* @type {boolean} */
          node.__pointInBounds = false;
          node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseout'));
          node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseleave'));
          return true;
        }
      }
    }
    
    //no layers
    if (layer_count === 0) {
      if (!display.__pointInBounds) {
        display.__pointInBounds = true;
        display.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseout'));
        display.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseleave'));
        return true;
      }
      //while in-bounds, dispatch mousemove
      display.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null));
      return true;
    }
    
    //check layers, always in bounds
    while (layer_count--) {
      node = layers[layer_count];
      
      if (!node.__pointInBounds) {
        /* @type {boolean} */
        node.__pointInBounds = true;
        if (node.eventListeners.hasOwnProperty('mouseover')) {
          node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseover'));
          evt_disp_p = true;
        }
        if (node.eventListeners.hasOwnProperty('mouseenter')) {
          node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseenter'));
          evt_disp_p = true;
        }
        if (evt_disp_p) {
          return true;
        }
      }
      if (node.eventListeners.hasOwnProperty('mousemove')) {
        node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null));
        return true;
      }
    }

    //nuthin doin, dispatch from top layer to display
    node = layers[--count];
    if (!display.__pointInBounds) {
      display.__pointInBounds = true;
      if (display.eventListeners.hasOwnProperty('mouseover')) {
        node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseover'));
        evt_disp_p = true;
      }
      if (display.eventListeners.hasOwnProperty('mouseenter')) {
        node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseenter'));
        evt_disp_p = true;
      }
      if (evt_disp_p) {
        return true;
      }
    }
    //finally check mousemove
    if (display.eventListeners.hasOwnProperty('mousemove')) {
      node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null));
      return true;
    }

    return false;
  };
  }());

  /* Called when the mouse leaves the display element.
   * Dispatches 'mouseout' and 'mouseleave' to the display and resets
   * the __pointInBounds property for all nodes.
   *
   * @param {doodle.events.MouseEvent} evt DOM mouse event to copy properties from.
   * @param {doodle.events.MouseEvent} mouseEvent Doodle mouse event to re-dispatch to nodes.
   * @param {Array} path Reference to the display's scene path.
   * @param {Array} layers Reference to display's children array.
   * @param {number} layer_count number of nodes in the layers array. Later reused to be node scene path count.
   * @param {Node} top_node Reference to the display object. Later reused to be the top layer.
   * @return {boolean} True on dispatch. (Always true because display will trigger it.)
   * @private
   */
  dispatch_mouseleave_event = function (evt, mouseEvent, path, layers, layer_count, top_node) {
    if (layer_count === 0) {
      //no layers so no scene path, display will dispatch
      /* @type {boolean} */
      top_node.__pointInBounds = false;
      top_node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseout'));
      top_node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseleave'));
      return true;
    } else {
      //reusing var - this is the top layer
      top_node = layers[layer_count-1];
      //reusing var - scene path count
      layer_count = path.length;
      while (layer_count--) {
        //all nodes out-of-bounds
        /* @type {boolean} */
        path[layer_count].__pointInBounds = false;
      }
      //top layer dispatch
      top_node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseout'));
      top_node.dispatchEvent(mouseEvent.__copyMouseEventProperties(evt, null, 'mouseleave'));
      return true;
    }
  };

  /* Called when the dom detects a keypress.
   * Doodle KeyboardEvent is reused by copying the dom event properties.
   * @param {doodle.events.Event} evt DOM keyboard event to copy properties from.
   * @return {boolean}
   * @private
   */
  dispatch_keyboard_event = function (evt, keyboardEvent, display) {
    display.broadcastEvent(keyboardEvent.__copyKeyboardEventProperties(evt, null));
    return true;
  };

  /*
   * CLASS METHODS
   */

  /**
   * Test if an object is a Display.
   * @name isDisplay
   * @param {Object} obj
   * @return {boolean} True if object is a Doodle Display.
   * @static
   */
  isDisplay = doodle.Display.isDisplay = function (obj) {
    if (!obj || typeof obj !== 'object' || typeof obj.toString !== 'function') {
      return false;
    }
    return (obj.toString() === '[object Display]');
  };

  
}());//end class closure
/**
 * @name doodle.FontStyle
 * @class
 * @static
 */
Object.defineProperty(doodle, 'FontStyle', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    /**
     * @name NORMAL
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'NORMAL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'normal'
    },

    /**
     * @name ITALIC
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'ITALIC': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'italic'
    },

    /**
     * @name OBLIQUE
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'OBLIQUE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'oblique'
    }
  })
});
/**
 * @name doodle.FontVariant
 * @class
 * @static
 */
Object.defineProperty(doodle, 'FontVariant', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    /**
     * @name NORMAL
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'NORMAL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'normal'
    },

    /**
     * @name SMALL_CAPS
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'SMALL_CAPS': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'small-caps'
    }
  })
});
/**
 * @name doodle.FontWeight
 * @class
 * @static
 */
Object.defineProperty(doodle, 'FontWeight', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    /**
     * @name NORMAL
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'NORMAL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'normal'
    },

    /**
     * @name BOLD
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'BOLD': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'bold'
    },

    /**
     * @name BOLDER
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'BOLDER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'bolder'
    },

    /**
     * @name LIGHTER
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'LIGHTER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'lighter'
    }
  })
});
/**
 * @name doodle.TextAlign
 * @class
 * @static
 */
Object.defineProperty(doodle, 'TextAlign', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    /**
     * @name START
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'START': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'start'
    },

    /**
     * @name END
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'END': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'end'
    },

    /**
     * @name LEFT
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'LEFT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'left'
    },

    /**
     * @name RIGHT
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'RIGHT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'right'
    },

    /**
     * @name CENTER
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'CENTER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'center'
    }
  })
});
/**
 * @name doodle.TextBaseline
 * @class
 * @static
 * @see <a href="http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#dom-context-2d-textbaseline">context.textBaseline</a> [Canvas API]
 */
Object.defineProperty(doodle, 'TextBaseline', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    /**
     * Let the anchor point's vertical position be the top of the em box of the first available font of the inline box.
     * @name TOP
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'TOP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'top'
    },

    /**
     * Let the anchor point's vertical position be half way between the bottom and the top of the em box of the first available font of the inline box.
     * @name MIDDLE
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'MIDDLE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'middle'
    },

    /**
     * Let the anchor point's vertical position be the bottom of the em box of the first available font of the inline box.
     * @name BOTTOM
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'BOTTOM': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'bottom'
    },

    /**
     * Let the anchor point's vertical position be the hanging baseline of the first available font of the inline box.
     * @name HANGING
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'HANGING': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'hanging'
    },

    /**
     * Let the anchor point's vertical position be the alphabetic baseline of the first available font of the inline box.
     * @name ALPHABETIC
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'ALPHABETIC': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'alphabetic'
    },

    /**
     * Let the anchor point's vertical position be the ideographic baseline of the first available font of the inline box.
     * @name IDEOGRAPHIC
     * @return {string} [read-only]
     * @property
     * @constant
     * @static
     */
    'IDEOGRAPHIC': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'ideographic'
    }
  })
});
/*globals doodle*/

(function () {
  var text_sprite_static_properties,
      rgb_str_to_hex = doodle.utils.rgb_str_to_hex,
      hex_to_rgb_str = doodle.utils.hex_to_rgb_str,
      FontStyle = doodle.FontStyle,
      FontVariant = doodle.FontVariant,
      FontWeight = doodle.FontWeight,
      TextAlign = doodle.TextAlign,
      TextBaseline = doodle.TextBaseline;

  /**
   * A text sprite to display.
   * @name doodle.Text
   * @class
   * @augments doodle.Sprite
   * @param {string=} text Text to display.
   * @return {doodle.Text} A text object.
   * @throws {SyntaxError} Invalid parameters.
   * @throws {TypeError} Text argument not a string.
   */
  doodle.Text = function (text) {
    var text_sprite = Object.create(doodle.Sprite());

    Object.defineProperties(text_sprite, text_sprite_static_properties);
    //properties that require privacy
    Object.defineProperties(text_sprite, (function () {
      var $text = '',
          font_family = "sans-serif",
          font_size = 10,//px
          font_height = font_size,
          font_style = FontStyle.NORMAL,
          font_variant = FontVariant.NORMAL,
          font_weight = FontWeight.NORMAL,
          text_align = TextAlign.START,
          text_baseline = TextBaseline.ALPHABETIC,
          text_color = "#000000",
          text_strokecolor = "#000000",
          text_strokewidth = 1,
          text_bgcolor;

      /**
       * @name redraw
       * @private
       */
      function redraw () {
        //if not part of the scene graph we'll have to whip up a context
        var $ctx = text_sprite.context || document.createElement('canvas').getContext('2d'),
            sprite_width,
            sprite_height,
            graphics = text_sprite.graphics,
            extrema_minX = 0,
            extrema_maxX = 0,
            extrema_minY = 0,
            extrema_maxY = 0;
        
        //need to apply font style to measure width, but don't save it
        $ctx.save();
        $ctx.font = (font_style +' '+ font_variant +' '+ font_weight +' '+
                     font_size+"px" +' '+ font_family);
        sprite_width = $ctx.measureText($text).width;
        sprite_height = font_size;
        //estimate font height since there's no built-in functionality
        font_height = $ctx.measureText("m").width;
        $ctx.restore();

        //clears sprite dimensions and drawing commands
        text_sprite.graphics.clear();
        text_sprite.graphics.draw(function (ctx) {
          if (text_bgcolor) {
            ctx.fillStyle = text_bgcolor;
            ctx.fillRect(0, 0, sprite_width, sprite_height);
          }
          ctx.lineWidth = text_strokewidth; //why do i need to set this?
          ctx.textAlign = text_align;
          ctx.textBaseline = text_baseline;
          ctx.font = (font_style +' '+ font_variant +' '+ font_weight +' '+
                      font_size+"px" +' '+ font_family);
          if (text_color) {
            ctx.fillStyle = text_color;
            ctx.fillText($text, 0, 0);
          }
          if (text_strokecolor) {
            ctx.strokeStyle = text_strokecolor;
            ctx.strokeText($text, 0, 0);
          }
        });
        
        //assign sprite dimensions after graphics.clear()
        text_sprite.width = sprite_width;
        text_sprite.height = sprite_height;

        //calculate bounding box extrema
        switch (text_baseline) {
        case TextBaseline.TOP:
          extrema_minY = font_size - font_height;
          extrema_maxY = font_size;
          break;
        case TextBaseline.MIDDLE:
          extrema_minY = -font_height/2;
          extrema_maxY = font_height/2;
          break;
        case TextBaseline.BOTTOM:
          extrema_minY = -font_size;
          break;
        case TextBaseline.HANGING:
          extrema_minY = font_size - font_height;
          extrema_maxY = font_size;
          break;
        case TextBaseline.ALPHABETIC:
          extrema_minY = -font_height;
          break;
        case TextBaseline.IDEOGRAPHIC:
          extrema_minY = -font_size;
          break;
        }

        switch (text_align) {
        case TextAlign.START:
          break;
        case TextAlign.END:
          extrema_minX = -sprite_width;
          break;
        case TextAlign.LEFT:
          break;
        case TextAlign.RIGHT:
          extrema_minX = -sprite_width;
          break;
        case TextAlign.CENTER:
          extrema_minX = -sprite_width/2;
          break;
        }
        
        //set extrema for bounds
        graphics.__minX = extrema_minX;
        graphics.__maxX = extrema_maxX;
        graphics.__minY = extrema_minY;
        graphics.__maxY = extrema_maxY;
      }
      
      return {
        /**
         * @name text
         * @return {String}
         * @throws {TypeError}
         * @property
         */
        'text': {
          enumerable: true,
          configurable: false,
          get: function () { return $text; },
          set: function (textVar) {
            $text = textVar;
            redraw();
          }
        },

        /**
         * @name font
         * @return {String}
         * @throws {TypeError}
         * @throws {SyntaxError}
         * @throws {ReferenceError}
         * @property
         */
        'font': {
          enumerable: true,
          configurable: false,
          get: function () {
            return (font_style +' '+ font_variant +' '+ font_weight +' '+
                    font_size+"px" +' '+ font_family);
          },
          set: function (fontVars) {
            var len;
            //parse elements from string
            fontVars = fontVars.split(' ');
            len = fontVars.length;
            //fill in unspecified values with defaults
            if (len === 2) {
              fontVars.unshift(FontStyle.NORMAL, FontVariant.NORMAL, FontWeight.NORMAL);
            } else if (len === 3) {
              fontVars.splice(1, 0, FontVariant.NORMAL, FontWeight.NORMAL);
            } else if (len === 4) {
              fontVars.splice(1, 0, FontVariant.NORMAL);
            }
            text_sprite.fontStyle = fontVars[0];
            text_sprite.fontVariant = fontVars[1];
            text_sprite.fontWeight = fontVars[2];
            text_sprite.fontSize = fontVars[3];
            text_sprite.fontFamily = fontVars[4];
          }
        },

        /**
         * @name fontFamily
         * @return {String}
         * @throws {TypeError}
         * @property
         */
        'fontFamily': {
          enumerable: true,
          configurable: false,
          get: function () { return font_family; },
          set: function (fontFamilyVar) {
            font_family = fontFamilyVar;
            redraw();
          }
        },

        /**
         * @name fontSize
         * @return {Number} In pixels.
         * @throws {TypeError}
         * @property
         */
        'fontSize': {
          enumerable: true,
          configurable: false,
          get: function () { return font_size; },
          set: function (fontSizeVar) {
            if (typeof fontSizeVar === 'string') {
              fontSizeVar = parseInt(fontSizeVar, 10);
            }
            font_size = fontSizeVar;
            redraw();
          }
        },

        /**
         * @name fontStyle
         * @return {FontStyle}
         * @throws {TypeError}
         * @throws {SyntaxError}
         * @property
         */
        'fontStyle': {
          enumerable: true,
          configurable: false,
          get: function () { return font_style; },
          set: function (fontStyleVar) {
            font_style = fontStyleVar;
            redraw();
          }
        },

        /**
         * @name fontVariant
         * @return {FontVariant}
         * @throws {TypeError}
         * @throws {SyntaxError}
         * @property
         */
        'fontVariant': {
          enumerable: true,
          configurable: false,
          get: function () { return font_variant; },
          set: function (fontVariantVar) {
            font_variant = fontVariantVar;
            redraw();
          }
        },

        /**
         * @name fontWeight
         * @return {FontWeight}
         * @throws {TypeError}
         * @throws {SyntaxError}
         * @property
         */
        'fontWeight': {
          enumerable: true,
          configurable: false,
          get: function () { return font_weight; },
          set: function (fontWeightVar) {
            font_weight = fontWeightVar;
            redraw();
          }
        },

        /**
         * @name align
         * @return {TextAlign}
         * @throws {TypeError}
         * @throws {SyntaxError}
         * @property
         */
        'align': {
          enumerable: true,
          configurable: false,
          get: function () { return text_align; },
          set: function (alignVar) {
            text_align = alignVar;
            redraw();
          }
        },

        /**
         * @name baseline
         * @return {TextBaseline}
         * @throws {TypeError}
         * @throws {SyntaxError}
         * @property
         */
        'baseline': {
          enumerable: true,
          configurable: false,
          get: function () { return text_baseline; },
          set: function (baselineVar) {
            text_baseline = baselineVar;
            redraw();
          }
        },

        /**
         * @name strokeWidth
         * @return {Number}
         * @throws {TypeError}
         * @throws {RangeError}
         * @property
         */
        'strokeWidth': {
          enumerable: true,
          configurable: false,
          get: function () { return text_strokewidth; },
          set: function (widthVar) {
            text_strokewidth = widthVar;
          }
        },

        /**
         * @name color
         * @return {Color}
         * @throws {TypeError}
         * @property
         */
        'color': {
          enumerable: true,
          configurable: false,
          get: function () { return text_color; },
          set: function (color) {
            if (typeof color === 'number') {
              color = hex_to_rgb_str(color);
            }
            text_color = color;
          }
        },

        /**
         * @name strokeColor
         * @return {Color}
         * @throws {TypeError}
         * @property
         */
        'strokeColor': {
          enumerable: true,
          configurable: false,
          get: function () { return text_strokecolor; },
          set: function (color) {
            if (typeof color === 'number') {
              color = hex_to_rgb_str(color);
            }
            text_strokecolor = color;
          }
        },

        /**
         * @name backgroundColor
         * @return {Color}
         * @throws {TypeError}
         * @property
         */
        'backgroundColor': {
          enumerable: true,
          configurable: false,
          get: function () { return text_bgcolor; },
          set: function (color) {
            if (typeof color === 'number') {
              color = hex_to_rgb_str(color);
            }
            text_bgcolor = color;
          }
        }
        
      };
    }()));
    
    switch (arguments.length) {
    case 0:
      break;
    case 1:
      //passed function or text string
      if (typeof arguments[0] === 'function') {
        arguments[0].call(text_sprite);
        text = undefined;
      } else {
        text_sprite.text = text;
      }
      break;
    default:
    }
    
    return text_sprite;
  };

  
  text_sprite_static_properties = {
    /**
     * Returns the string representation of the specified object.
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Text]";
      }
    }
  };

}());//end class closure
/*globals doodle, Image*/

(function () {
  var image_sprite_static_properties,
      get_element = doodle.utils.get_element,
      doodle_Event = doodle.events.Event,
      Event_LOAD = doodle.events.Event.LOAD,
      Event_CHANGE = doodle.events.Event.CHANGE;

  /**
   * A image sprite to display.
   * @name doodle.Image
   * @class
   * @augments doodle.Sprite
   * @param {string=} imageSrc Image element or url.
   * @return {doodle.Image} A text object.
   * @throws {SyntaxError} Invalid parameters.
   * @throws {TypeError} Text argument not a string.
   */
  doodle.Image = function (imageSrc) {
    var image_sprite = Object.create(doodle.Sprite());

    Object.defineProperties(image_sprite, image_sprite_static_properties);
    //properties that require privacy
    Object.defineProperties(image_sprite, (function () {
      var img_element = null;

      function add_image_element (img) {
        img_element = img;
        if (img_element.id !== '') {
          image_sprite.id = img_element.id;
        }
        image_sprite.width = img_element.width;
        image_sprite.height = img_element.height;
        image_sprite.graphics.draw(function (ctx) {
          ctx.drawImage(img_element, 0, 0);
        });
        image_sprite.dispatchEvent(doodle_Event(Event_LOAD));
      }

      function remove_image_element () {
        if (img_element !== null) {
          img_element = null;
          image_sprite.graphics.clear();
          image_sprite.dispatchEvent(doodle_Event(Event_CHANGE));
        }
      }
      
      function load_image (img_elem) {
        var image = get_element(img_elem);
        //element id
        if (typeof img_elem === 'string') {
          image_sprite.id = img_elem;
        }

        //check if image has already been loaded
        if (image.complete) {
          add_image_element(image);
        } else {
          //if not, assign load handlers
          image.onload = function () {
            add_image_element(image);
          };
          image.onerror = function () {
            throw new URIError('[object Image](imageSrc): Unable to load ' + image.src);
          };
          image.onabort = function () {
            throw new URIError('[object Image](imageSrc): Unable to load ' + image.src);
          };
        }
      }
      
      return {
        /**
         * @name element
         * @return {HTMLImageElement}
         * @throws {TypeError}
         * @throws {URIError}
         * @property
         */
        'element': {
          enumerable: true,
          configurable: false,
          get: function () { return img_element; },
          set: function (imageVar) {
            if (imageVar === null || imageVar === false) {
              remove_image_element();
            } else {
              load_image(imageVar);
            }
          }
        },
        
        /**
         * @name src
         * @return {string}
         * @throws {TypeError}
         * @throws {URIError}
         * @property
         */
        'src': {
          enumerable: true,
          configurable: false,
          get: function () { return (img_element === null) ? null : img_element.src; },
          set: function (srcVar) {
            if (srcVar === null || srcVar === false) {
              remove_image_element();
            } else {
              var image = new Image();
              image.src = encodeURI(srcVar);
              load_image(image);
            }
          }
        }
        
      };
    }()));//end defineProperties

    
    switch (arguments.length) {
    case 0:
      break;
    case 1:
      //passed function or text string
      if (typeof arguments[0] === 'function') {
        arguments[0].call(image_sprite);
        imageSrc = undefined;
      } else {
        //constructor param can be an image element or url
        if (typeof imageSrc !== 'string') {
          image_sprite.element = imageSrc;
        } else if (typeof imageSrc === 'string' && imageSrc[0] === '#') {
          image_sprite.element = imageSrc;
        } else {
          image_sprite.src = imageSrc;
        }
      }
      break;
    default:
    }
    
    return image_sprite;
  };

  
  image_sprite_static_properties = {
    /**
     * Returns the string representation of the specified object.
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Image]";
      }
    }
  };

}());//end class closure
