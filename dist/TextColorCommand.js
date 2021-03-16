'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _ColorEditor = require('./ui/ColorEditor');

var _ColorEditor2 = _interopRequireDefault(_ColorEditor);

var _UICommand2 = require('./ui/UICommand');

var _UICommand3 = _interopRequireDefault(_UICommand2);

var _applyMark = require('./applyMark');

var _applyMark2 = _interopRequireDefault(_applyMark);

var _createPopUp = require('./ui/createPopUp');

var _createPopUp2 = _interopRequireDefault(_createPopUp);

var _findNodesWithSameMark = require('./findNodesWithSameMark');

var _findNodesWithSameMark2 = _interopRequireDefault(_findNodesWithSameMark);

var _isTextStyleMarkCommandEnabled = require('./isTextStyleMarkCommandEnabled');

var _isTextStyleMarkCommandEnabled2 = _interopRequireDefault(_isTextStyleMarkCommandEnabled);

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

var _prosemirrorState = require('prosemirror-state');

var _prosemirrorView = require('prosemirror-view');

var _MarkNames = require('./MarkNames');

var _prosemirrorTransform = require('prosemirror-transform');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TextColorCommand = function (_UICommand) {
  (0, _inherits3.default)(TextColorCommand, _UICommand);

  function TextColorCommand() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, TextColorCommand);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = TextColorCommand.__proto__ || (0, _getPrototypeOf2.default)(TextColorCommand)).call.apply(_ref, [this].concat(args))), _this), _this._popUp = null, _this.isEnabled = function (state) {
      return (0, _isTextStyleMarkCommandEnabled2.default)(state, _MarkNames.MARK_TEXT_COLOR);
    }, _this.waitForUserInput = function (state, dispatch, view, event) {
      if (_this._popUp) {
        return _promise2.default.resolve(undefined);
      }
      var target = (0, _nullthrows2.default)(event).currentTarget;
      if (!(target instanceof HTMLElement)) {
        return _promise2.default.resolve(undefined);
      }

      var doc = state.doc,
          selection = state.selection,
          schema = state.schema;

      var markType = schema.marks[_MarkNames.MARK_TEXT_COLOR];
      var anchor = event ? event.currentTarget : null;
      var from = selection.from,
          to = selection.to;

      var result = (0, _findNodesWithSameMark2.default)(doc, from, to, markType);
      var hex = result ? result.mark.attrs.color : null;
      return new _promise2.default(function (resolve) {
        _this._popUp = (0, _createPopUp2.default)(_ColorEditor2.default, { hex: hex }, {
          anchor: anchor,
          onClose: function onClose(val) {
            if (_this._popUp) {
              _this._popUp = null;
              resolve(val);
            }
          }
        });
      });
    }, _this.executeWithUserInput = function (state, dispatch, view, color) {
      if (dispatch && color !== undefined) {
        var schema = state.schema;
        var _tr = state.tr;

        var markType = schema.marks[_MarkNames.MARK_TEXT_COLOR];
        var attrs = color ? { color: color } : null;
        _tr = (0, _applyMark2.default)(state.tr.setSelection(state.selection), schema, markType, attrs);
        if (_tr.docChanged || _tr.storedMarksSet) {
          // If selection is empty, the color is added to `storedMarks`, which
          // works like `toggleMark`
          // (see https://prosemirror.net/docs/ref/#commands.toggleMark).
          dispatch && dispatch(_tr);
          return true;
        }
      }
      return false;
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  return TextColorCommand;
}(_UICommand3.default);

exports.default = TextColorCommand;