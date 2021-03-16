'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var babelPluginFlowReactPropTypes_proptype_MarkSpec = require('./Types').babelPluginFlowReactPropTypes_proptype_MarkSpec || require('prop-types').any;

var LinkMarkSpec = {
  attrs: {
    href: { default: null },
    rel: { default: 'noopener noreferrer nofollow' },
    target: { default: 'blank' },
    title: { default: null }
  },
  inclusive: false,
  parseDOM: [{
    tag: 'a[href]',
    getAttrs: function getAttrs(dom) {
      var href = dom.getAttribute('href');
      var target = href && href.indexOf('#') === 0 ? '' : 'blank';
      return {
        href: dom.getAttribute('href'),
        title: dom.getAttribute('title'),
        target: target
      };
    }
  }],
  toDOM: function toDOM(node) {
    return ['a', node.attrs, 0];
  }
};

exports.default = LinkMarkSpec;