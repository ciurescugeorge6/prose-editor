'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

exports.default = patchListElements;

var _HTMLMutator = require('./HTMLMutator');

var _HTMLMutator2 = _interopRequireDefault(_HTMLMutator);

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

var _uuid = require('./ui/uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _ListItemNodeSpec = require('./ListItemNodeSpec');

var _ParagraphNodeSpec = require('./ParagraphNodeSpec');

var _OrderedListNodeSpec = require('./OrderedListNodeSpec');

var _patchStyleElements = require('./patchStyleElements');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function patchListElements(doc) {
  // In Google Doc, lists are exported as indented
  // (e.g. style="margin-left: 48pt") list elements which is the default DOM
  // structure that `czi-prosemirror` supports. However, other doc providers
  // (e.g Office 365) may export lists as nested list elements that can't
  // be rendered properly.
  // Before proceeding further, it needs to convert the nested list elements
  // into indented list elements.
  liftNestedListElements(doc);
  (0, _from2.default)(doc.querySelectorAll('ol, ul')).forEach(patchListElementsElement);
}

// This assumes that every 36pt maps to one indent level.


var CHAR_BULLET = '\u25CF';
var CHAR_CIRCLE = '\u25CB';
var CHAR_SQUARE = '\u25A0';
var CHAR_BOX = '\u274F';
var CHAR_ZERO_SPACE = '\u200B';
var INLINE_NODE_NAME_PATTERN = /^(#text)|(A|SPAN|B|STRONG)$/;

function patchListElementsElement(listElement) {
  // If the children of `listElement` all have teh same marginLeft, assume
  // it to be indented.
  var marginLeft = undefined;
  var beforeContent = undefined;
  var parentElement = listElement.parentElement,
      children = listElement.children;

  // A workaround to patch the issue when <ul /> or <ol /> is pasted as the
  // first child of <body />, its first <li /> somehow can't be wrapped
  // with the list. The hack is to prepend zero-width-space character
  // before the list.

  if (parentElement && parentElement.nodeName === 'BODY' && parentElement.firstChild === listElement) {
    var tt = parentElement.ownerDocument.createTextNode(CHAR_ZERO_SPACE);
    parentElement.insertBefore(tt, listElement);
  }

  (0, _from2.default)(children).forEach(function (listItemElement) {
    var style = listItemElement.style;

    patchPaddingStyle(listItemElement);

    var bc = listItemElement.getAttribute(_patchStyleElements.ATTRIBUTE_CSS_BEFORE_CONTENT) || '';
    if (beforeContent === undefined) {
      beforeContent = bc;
    }
    if (beforeContent !== bc) {
      beforeContent = null;
    }

    var ml = style && style.marginLeft || '';
    if (marginLeft === undefined) {
      marginLeft = ml;
    }

    if (ml !== marginLeft) {
      marginLeft = null;
    }
  });

  if (marginLeft) {
    var indent = (0, _ParagraphNodeSpec.convertMarginLeftToIndentValue)(marginLeft);
    if (indent) {
      listElement.setAttribute(_ParagraphNodeSpec.ATTRIBUTE_INDENT, String(indent));
    }
  }

  if (beforeContent) {
    beforeContent = String(beforeContent);
    var listStyleType = void 0;
    switch (true) {
      case beforeContent.indexOf(CHAR_BULLET) > -1:
        listStyleType = 'disc';
        break;

      case beforeContent.indexOf(CHAR_CIRCLE) > -1:
        listStyleType = 'circle';
        break;

      case beforeContent.indexOf(CHAR_SQUARE) > -1:
        listStyleType = 'square';
        break;

      case beforeContent.indexOf(CHAR_BOX) > -1:
        listStyleType = 'box';
        break;

      case beforeContent.indexOf('lower-latin') > -1:
        listStyleType = 'lower-latin';
        break;

      case beforeContent.indexOf('upper-latin') > -1:
        listStyleType = 'upper-latin';
        break;

      case beforeContent.indexOf('lower-roman') > -1:
        listStyleType = 'lower-roman';
        break;

      case beforeContent.indexOf('upper-roman') > -1:
        listStyleType = 'upper-roman';
        break;

      case beforeContent.indexOf('-') > -1:
        listStyleType = 'dash';
        break;

      default:
        console.log('unknown list style type', beforeContent);
        break;
    }
    if (listStyleType) {
      listElement.setAttribute(_ListItemNodeSpec.ATTRIBUTE_LIST_STYLE_TYPE, listStyleType);
    }
  }
}

// This moves the styles of <li /> into its content <p />.
function patchPaddingStyle(listItemElement) {
  var style = listItemElement.style,
      childNodes = listItemElement.childNodes;
  var paddingTop = style.paddingTop,
      paddingBottom = style.paddingBottom,
      lineHeight = style.lineHeight;

  if (!_ParagraphNodeSpec.EMPTY_CSS_VALUE.has(paddingBottom) && !_ParagraphNodeSpec.EMPTY_CSS_VALUE.has(paddingTop) && !_ParagraphNodeSpec.EMPTY_CSS_VALUE.has(lineHeight)) {
    return;
  }

  var doc = listItemElement.ownerDocument;
  var frag = doc.createDocumentFragment();
  var contentIsInline = true;

  (0, _from2.default)(childNodes).forEach(function (cn) {
    contentIsInline = contentIsInline && INLINE_NODE_NAME_PATTERN.test(cn.nodeName);
    frag.appendChild(cn);
  });

  if (contentIsInline) {
    // Wrap all inline content with <p /> with the padding style applied.
    var pEl = doc.createElement('p');
    (0, _assign2.default)(pEl.style, {
      lineHeight: lineHeight,
      paddingBottom: paddingBottom,
      paddingTop: paddingTop
    });
    pEl.appendChild(frag);
    listItemElement.appendChild(pEl);
  } else {
    // Unable to patch the style.
    listItemElement.appendChild(frag);
  }
}

// This converts all nested list elements into indented list elements.
// For instance,
// == UI ==
// 1. AA
//   1. BB
//   2. BB
// 2. AA
// == DOM Structure (Before) ==
// <ol> <!-- Parent List -->
//   <li>
//     AA
//     <ol> <!-- Child (nested) List -->
//       <li>BB</li>
//       <li>BB</li>
//     </ol>
//   </li>
//   <li> AA</li>
// </ol>
// == DOM Structure (After) ==
// <ol name="x">
//   <li>AA</li>
// </ol>
// <ol data-indent="1">
//   <li>BB</li>
//   <li>BB</li>
// </ol>
// <ol data-following="x" data-counter-reset-"none">
//   <li>AA</li>
// </ol>
function liftNestedListElements(doc) {
  var selector = 'li > ol, li > ul';
  var els = (0, _from2.default)(doc.querySelectorAll(selector));
  var htmlMutator = new _HTMLMutator2.default(doc);

  els.forEach(function (list) {
    var indent = findIndentLevel(list);
    list.setAttribute('data-indent', String(indent));

    var parentListItem = (0, _nullthrows2.default)(list.parentElement);
    var parentList = (0, _nullthrows2.default)(parentListItem.parentElement);
    var parentListNodeName = parentList.nodeName.toLowerCase();
    var isLast = parentList.lastElementChild === parentListItem;
    var style = parentList.getAttribute('style') || '';

    // The parent list will be split into two lists and the second list should
    // follow the first list.
    var followingName = parentList.getAttribute('name') || (0, _uuid2.default)();
    parentList.setAttribute('name', followingName);

    // Stub HTML snippets that will lift the list.

    // Before:
    // <ol>
    //   <li>
    //     AAA
    //     <ol><li>BBB</li></ol>
    //   </li>
    //   <li>CCC</li>
    // </ol>
    // After:
    // <ol><li>AAA</li></ol>
    // <ol><li>BBB</li></ol>
    // <ol><li>CCC</li></ol>

    // Close the parent list before the list.
    htmlMutator.insertHTMLBefore('</' + parentListNodeName + '>', list);
    // Open a new list after list.
    htmlMutator.insertHTMLAfter('<' + parentListNodeName + '\n          style="' + style + '"\n          class="' + parentList.className + '"\n          ' + _OrderedListNodeSpec.ATTRIBUTE_COUNTER_RESET + '="none"\n          ' + _OrderedListNodeSpec.ATTRIBUTE_FOLLOWING + '="' + followingName + '">', list);

    if (isLast) {
      // The new list after list is an empty list, comment it out.
      htmlMutator.insertHTMLAfter('<!--', list).insertHTMLAfter('-->', parentList);
    }
  });

  htmlMutator.execute();
}

function findIndentLevel(el) {
  var indent = 0;
  var currentEl = el.parentElement;
  while (currentEl) {
    var _currentEl = currentEl,
        nodeName = _currentEl.nodeName;

    if (nodeName === 'OL' || nodeName === 'UL') {
      indent++;
    } else if (nodeName !== 'LI') {
      break;
    }
    currentEl = currentEl.parentElement;
  }
  return indent;
}