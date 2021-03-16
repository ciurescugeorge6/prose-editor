'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATTRIBUTE_CSS_BEFORE_CONTENT = undefined;

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

exports.default = patchStyleElements;

var _stable = require('stable');

var _stable2 = _interopRequireDefault(_stable);

var _toCSSColor = require('./ui/toCSSColor');

var _toCSSColor2 = _interopRequireDefault(_toCSSColor);

var _toCSSLineSpacing = require('./ui/toCSSLineSpacing');

var _toCSSLineSpacing2 = _interopRequireDefault(_toCSSLineSpacing);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LIST_ITEM_PSEUDO_ELEMENT_BEFORE = /li:+before/;

var NODE_NAME_SELECTOR = /^[a-zA-Z]+\d*$/;
var PSEUDO_ELEMENT_ANY = /:+[a-z]+/;

//  Assume these className from Google doc has less specificity.
var WEAK_CLASS_SELECTOR = /\.title/;

var ATTRIBUTE_CSS_BEFORE_CONTENT = exports.ATTRIBUTE_CSS_BEFORE_CONTENT = 'data-attribute-css-before-content';

// Node name only selector has less priority, we'll handle it
// separately

function patchStyleElements(doc) {
  var els = (0, _from2.default)(doc.querySelectorAll('style'));
  if (!els.length) {
    return;
  }

  var selectorTextToCSSTexts = [];

  els.forEach(function (styleEl) {
    var sheet = styleEl.sheet;
    if (!sheet) {
      // TODO: Find out why the browser does not support this.
      console.error('styleEl.sheet undefined', styleEl);
      return;
    }
    var cssRules = sheet.cssRules;
    if (!cssRules) {
      // TODO: Find out why the browser does not support this.
      console.error('sheet.cssRules undefined', sheet);
      return;
    }

    (0, _from2.default)(cssRules).forEach(function (rule, cssRuleIndex) {
      var selectorText = String(rule.selectorText || '');
      if (!selectorText) {
        // This could be `CSSImportRule.` created by @import().
        // ignore it.
        return;
      }

      if (!rule.styleMap) {
        // TODO: Find out why the browser does not support this.
        console.error('rule.styleMap undefined', rule);
        return;
      }
      var cssText = '';
      rule.styleMap.forEach(function (cssStyleValue, key) {
        var cssStyleValueStr = String(cssStyleValue);
        // e.g. rules['color'] = 'red'.
        if (key === 'color') {
          var color = (0, _toCSSColor2.default)(cssStyleValueStr);
          if (!color) {
            return;
          }
        } else if (key === 'background-color') {
          var _color = (0, _toCSSColor2.default)(cssStyleValueStr);
          if (!_color) {
            return;
          }
        } else if (key === 'line-height') {
          cssStyleValueStr = (0, _toCSSLineSpacing2.default)(cssStyleValueStr);
        }
        if (cssStyleValueStr) {
          cssText += key + ': ' + cssStyleValueStr + ';';
        }
      });
      if (selectorText.indexOf(',') > -1) {
        selectorText.split(/\s*,\s*/).forEach(function (st) {
          buildSelectorTextToCSSText(selectorTextToCSSTexts, st, cssText);
        });
      } else {
        buildSelectorTextToCSSText(selectorTextToCSSTexts, selectorText, cssText);
      }
    });
  });

  // Sort selector by
  (0, _stable2.default)(selectorTextToCSSTexts, sortBySpecificity).reduce(buildElementToCSSTexts.bind(null, doc), new _map2.default()).forEach(applyInlineStyleSheetCSSTexts);
}

function buildElementToCSSTexts(doc, elementToCSSTexts, bag) {
  var selectorText = bag.selectorText,
      cssText = bag.cssText,
      beforeContent = bag.beforeContent;

  var els = (0, _from2.default)(doc.querySelectorAll(selectorText));

  els.forEach(function (el) {
    var style = el.style;
    if (!style || !(el instanceof HTMLElement)) {
      return;
    }
    if (cssText) {
      var cssTexts = elementToCSSTexts.get(el) || [];
      cssTexts.push(cssText);
      elementToCSSTexts.set(el, cssTexts);
    }
    if (beforeContent) {
      // This simply adds the custom attribute 'data-before-content' to element,
      // developer must handle his attribute via NodeSpec separately if needed.
      el.setAttribute(ATTRIBUTE_CSS_BEFORE_CONTENT, beforeContent);
    }
  });
  return elementToCSSTexts;
}

function sortBySpecificity(one, two) {
  // This is just the naive implementation of sorting selectors by css
  // specificity.
  // 1. NodeName selectors has less priority.
  var aa = NODE_NAME_SELECTOR.test(one.selectorText);
  var bb = NODE_NAME_SELECTOR.test(two.selectorText);
  if (aa && !bb) {
    return -1;
  }

  if (!aa && bb) {
    return 1;
  }

  // Assume both are className selector.
  // Assume these className from Google doc has less specificity.
  aa = WEAK_CLASS_SELECTOR.test(one.selectorText);
  bb = WEAK_CLASS_SELECTOR.test(two.selectorText);
  if (aa && !bb) {
    return -1;
  }
  if (!aa && bb) {
    return 1;
  }
  return 0;
}

function buildSelectorTextToCSSText(result, selectorText, cssText) {
  var afterContent = void 0;
  var beforeContent = void 0;

  if (LIST_ITEM_PSEUDO_ELEMENT_BEFORE.test(selectorText)) {
    // Workaround to extract the list style content from HTML generated by
    // Google.
    // This converts `content:"\0025a0  "` to `\0025a0`
    beforeContent = cssText.replace(/^content:\s*"\s*/, '').replace(/";*$/, '');
    selectorText = selectorText.replace(/:+before/, '');
    cssText = '';
  } else if (PSEUDO_ELEMENT_ANY.test(selectorText)) {
    // TODO: Handle this later.
    return;
  }

  result.push({
    selectorText: selectorText,
    cssText: cssText,
    afterContent: afterContent,
    beforeContent: beforeContent
  });
}

function applyInlineStyleSheetCSSTexts(cssTexts, el) {
  if (cssTexts.length) {
    el.style.cssText = cssTexts.join(';') + ';' + el.style.cssText;
  }
}