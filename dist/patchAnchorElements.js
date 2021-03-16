'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

exports.default = patchAnchorElements;

var _BookmarkNodeSpec = require('./BookmarkNodeSpec');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BLOCK_NODE_NAME_PATTERN = /(P|H1|H2|H3|H4|H5|H6)/;

function patchAnchorElements(doc) {
  (0, _from2.default)(doc.querySelectorAll('a[id]')).forEach(patchAnchorElement);
}

function patchAnchorElement(node) {
  var id = node.id;

  if (id && node.childElementCount === 0) {
    // This looks like a bookmark generated from Google Doc, will render
    // this as BookmarkNode.
    node.setAttribute(_BookmarkNodeSpec.ATTRIBUTE_BOOKMARK_ID, id);

    // Google Doc always inject anchor links before <table />.
    //   <a id="t.3060ecccc199a88a1e4cc1252769f957b88f2207"></a>
    //   <a id="t.0"></a>
    //   <table class="c23">
    // and these anchor link should not be visible.
    var visible = node.id.indexOf('t.') !== 0;

    visible && node.setAttribute(_BookmarkNodeSpec.ATTRIBUTE_BOOKMARK_VISIBLE, 'true');
  }
  var nextNode = node.nextElementSibling;
  if (!nextNode) {
    return;
  }
  // If this is next to a block element, make that block element the bookmark.
  if (BLOCK_NODE_NAME_PATTERN.test(nextNode.nodeName)) {
    nextNode.insertBefore(node, nextNode.firstChild);
  }
}