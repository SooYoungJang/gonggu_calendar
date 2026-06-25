var React = require('react');
function passthrough(type) {
  return function(props) {
    var children = props && props.children;
    return React.createElement(type, props, children);
  };
}

// Minimal Animated mock for testing
var Animated = {
  Value: function(val) {
    this._value = val;
    this._interpolation = null;
    this.interpolate = function(config) {
      var self = this;
      self._interpolation = config;
      return {
        __getValue: function() {
          return self._value;
        },
      };
    };
  },
  timing: function() { return { start: function(cb) { cb && cb(); } }; },
  loop: function() { return { start: function() {}, stop: function() {} }; },
  sequence: function() { return { start: function() {}, stop: function() {} }; },
  stagger: function() { return { start: function() {}, stop: function() {} }; },
  parallel: function() { return { start: function() {}, stop: function() {} }; },
  delay: function() { return { start: function() {}, stop: function() {} }; },
  View: passthrough('View'),
  Text: passthrough('Text'),
  Image: passthrough('Image'),
};

var Easing = {
  inOut: function(fn) { return fn; },
  sin: function(t) { return t; },
  ease: null,
  quad: null,
  cubic: null,
};

var AccessibilityInfo = {
  isReduceMotionEnabled: function() { return Promise.resolve(false); },
};

module.exports = {
  ActivityIndicator: passthrough('ActivityIndicator'),
  Alert: { alert: function() {} },
  Animated: Animated,
  Easing: Easing,
  AccessibilityInfo: AccessibilityInfo,
  Dimensions: { get: function() { return { width: 390, height: 844 }; } },
  Image: passthrough('Image'),
  KeyboardAvoidingView: passthrough('KeyboardAvoidingView'),
  PanResponder: { create: function() { return { panHandlers: {} }; } },
  Platform: { select: function(obj) { return obj.default; } },
  Pressable: passthrough('Pressable'),
  ScrollView: passthrough('ScrollView'),
  StyleSheet: { create: function(styles) { return styles; } },
  Text: passthrough('Text'),
  TextInput: passthrough('TextInput'),
  TouchableOpacity: passthrough('TouchableOpacity'),
  View: passthrough('View'),
  useWindowDimensions: function() { return { width: 390, height: 844 }; },
};

// Dark mode test helpers — stored on the module itself to avoid var hoisting issues
module.exports.__colorScheme = 'light';
module.exports.useColorScheme = function() { return module.exports.__colorScheme; };
module.exports.__setColorScheme = function(s) { module.exports.__colorScheme = s; };
