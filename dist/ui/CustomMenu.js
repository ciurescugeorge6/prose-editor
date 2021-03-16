'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./czi-custom-menu.css');

require('./czi-custom-scrollbar.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CustomMenu = function (_React$Component) {
  (0, _inherits3.default)(CustomMenu, _React$Component);

  function CustomMenu() {
    (0, _classCallCheck3.default)(this, CustomMenu);
    return (0, _possibleConstructorReturn3.default)(this, (CustomMenu.__proto__ || (0, _getPrototypeOf2.default)(CustomMenu)).apply(this, arguments));
  }

  (0, _createClass3.default)(CustomMenu, [{
    key: 'render',
    value: function render() {
      var children = this.props.children;

      return _react2.default.createElement(
        'div',
        { className: 'czi-custom-menu czi-custom-scrollbar' },
        children
      );
    }
  }]);
  return CustomMenu;
}(_react2.default.Component);

exports.default = CustomMenu;