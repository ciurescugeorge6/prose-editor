'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATTRIBUTE_FOLLOWING = exports.ATTRIBUTE_COUNTER_RESET = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _prosemirrorModel = require('prosemirror-model');

var _ListItemNodeSpec = require('./ListItemNodeSpec');

var _NodeNames = require('./NodeNames');

var _ParagraphNodeSpec = require('./ParagraphNodeSpec');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var babelPluginFlowReactPropTypes_proptype_NodeSpec = require('./Types').babelPluginFlowReactPropTypes_proptype_NodeSpec || require('prop-types').any;

var ATTRIBUTE_COUNTER_RESET = exports.ATTRIBUTE_COUNTER_RESET = 'data-counter-reset';
var ATTRIBUTE_FOLLOWING = exports.ATTRIBUTE_FOLLOWING = 'data-following';
var AUTO_LIST_STYLE_TYPES = ['decimal', 'lower-alpha', 'lower-roman'];

var OrderedListNodeSpec = {
  attrs: {
    id: { default: null },
    counterReset: { default: null },
    indent: { default: _ParagraphNodeSpec.MIN_INDENT_LEVEL },
    following: { default: null },
    listStyleType: { default: null },
    name: { default: null },
    start: { default: 1 }
  },
  group: 'block',
  content: _NodeNames.LIST_ITEM + '+',
  parseDOM: [{
    tag: 'ol',
    getAttrs: function getAttrs(dom) {
      var listStyleType = dom.getAttribute(_ListItemNodeSpec.ATTRIBUTE_LIST_STYLE_TYPE);
      var counterReset = dom.getAttribute(ATTRIBUTE_COUNTER_RESET) || undefined;

      var start = dom.hasAttribute('start') ? parseInt(dom.getAttribute('start'), 10) : 1;

      var indent = dom.hasAttribute(_ParagraphNodeSpec.ATTRIBUTE_INDENT) ? parseInt(dom.getAttribute(_ParagraphNodeSpec.ATTRIBUTE_INDENT), 10) : _ParagraphNodeSpec.MIN_INDENT_LEVEL;

      var name = dom.getAttribute('name') || undefined;

      var following = dom.getAttribute(ATTRIBUTE_FOLLOWING) || undefined;

      return {
        counterReset: counterReset,
        following: following,
        indent: indent,
        listStyleType: listStyleType,
        name: name,
        start: start
      };
    }
  }],
  toDOM: function toDOM(node) {
    var _node$attrs = node.attrs,
        start = _node$attrs.start,
        indent = _node$attrs.indent,
        listStyleType = _node$attrs.listStyleType,
        counterReset = _node$attrs.counterReset,
        following = _node$attrs.following,
        name = _node$attrs.name;

    var attrs = (0, _defineProperty3.default)({}, _ParagraphNodeSpec.ATTRIBUTE_INDENT, indent);

    if (counterReset === 'none') {
      attrs[ATTRIBUTE_COUNTER_RESET] = counterReset;
    }

    if (following) {
      attrs[ATTRIBUTE_FOLLOWING] = following;
    }

    if (listStyleType) {
      attrs[_ListItemNodeSpec.ATTRIBUTE_LIST_STYLE_TYPE] = listStyleType;
    }

    if (start !== 1) {
      attrs.start = start;
    }

    if (name) {
      attrs.name = name;
    }

    var htmlListStyleType = listStyleType;

    if (!htmlListStyleType || htmlListStyleType === 'decimal') {
      htmlListStyleType = AUTO_LIST_STYLE_TYPES[indent % AUTO_LIST_STYLE_TYPES.length];
    }

    var cssCounterName = 'czi-counter-' + indent;

    attrs.style = '--czi-counter-name: ' + cssCounterName + ';' + ('--czi-counter-reset: ' + (following ? 'none' : start - 1) + ';') + ('--czi-list-style-type: ' + htmlListStyleType);

    attrs.type = htmlListStyleType;

    return ['ol', attrs, 0];
  }
};

exports.default = OrderedListNodeSpec;