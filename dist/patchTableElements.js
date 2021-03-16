'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

exports.default = patchTableElements;

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

var _DocNodeSpec = require('./DocNodeSpec');

var _convertToCSSPTValue = require('./convertToCSSPTValue');

var _convertToCSSPTValue2 = _interopRequireDefault(_convertToCSSPTValue);

var _toCSSColor = require('./ui/toCSSColor');

var _toCSSColor2 = _interopRequireDefault(_toCSSColor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This value is originally defined at prosemirror-table.
var ATTRIBUTE_CELL_WIDTH = 'data-colwidth';

function patchTableElements(doc) {
  var layout = doc.body ? (0, _DocNodeSpec.getAttrs)(doc.body).layout : null;
  (0, _from2.default)(doc.querySelectorAll('td')).forEach(function (tdEl) {
    patchTableCell(tdEl, layout);
  });
  (0, _from2.default)(doc.querySelectorAll('tr[style^=height]')).forEach(patchTableRow);
}

// The height of each line: ~= 21px
var LINE_HEIGHT_PX_VALUE = 21;
var LINE_HEIGHT_PT_VALUE = 15.81149997;

// Workaround to patch HTML from Google Doc that Table Cells will apply
// its background colr to all its inner <span />.
function patchTableCell(tdElement, layout) {
  var style = tdElement.style;

  if (!style) {
    return;
  }
  var backgroundColor = style.backgroundColor,
      width = style.width;

  if (backgroundColor) {
    var tdBgColor = (0, _toCSSColor2.default)(backgroundColor);
    var selector = 'span[style*=background-color]';
    var spans = (0, _from2.default)(tdElement.querySelectorAll(selector));
    spans.some(function (spanElement) {
      var spanStyle = spanElement.style;
      if (!spanStyle || !spanStyle.backgroundColor) {
        return;
      }
      var spanBgColor = (0, _toCSSColor2.default)(spanStyle.backgroundColor);
      if (spanBgColor === tdBgColor) {
        // The span has the same bg color as the cell does, erase its bg color.
        spanStyle.backgroundColor = '';
      }
    });
  }

  if (width) {
    var ptValue = (0, _convertToCSSPTValue2.default)(width);
    if (!ptValue) {
      return;
    }

    // This value is arbitrary. It assumes the page use the default size
    // with default padding.
    var defaultTableWidth = 0;

    if (layout === _DocNodeSpec.LAYOUT.US_LETTER_LANDSCAPE) {
      defaultTableWidth = 960;
    } else if (layout === _DocNodeSpec.LAYOUT.US_LETTER_PORTRAIT) {
      defaultTableWidth = 700;
    } else {
      defaultTableWidth = 700;
    }

    var pxValue = ptValue * _convertToCSSPTValue.PT_TO_PX_RATIO;
    // Attribute "data-colwidth" is defined at 'prosemirror-tables';
    var rowEl = (0, _nullthrows2.default)(tdElement.parentElement);
    tdElement.setAttribute(ATTRIBUTE_CELL_WIDTH, String(Math.floor(pxValue)));

    if (rowEl.lastElementChild === tdElement) {
      var cells = (0, _from2.default)(rowEl.children);
      var tableWidth = cells.reduce(function (sum, td) {
        var ww = parseInt(td.getAttribute(ATTRIBUTE_CELL_WIDTH), 10);
        sum += ww;
        return sum;
      }, 0);
      if (isNaN(tableWidth) || tableWidth <= defaultTableWidth) {
        return;
      }

      var scale = defaultTableWidth / tableWidth;
      cells.forEach(function (cell) {
        var ww = parseInt(cell.getAttribute(ATTRIBUTE_CELL_WIDTH), 10);
        cell.setAttribute(ATTRIBUTE_CELL_WIDTH, String(Math.floor(ww * scale)));
      });
    }
  }
}

// Workaround to support "height" in table row by inject empty <p /> to
// create space for the height.
function patchTableRow(trElement) {
  var doc = trElement.ownerDocument;
  if (!doc) {
    return;
  }
  var height = trElement.style.height;
  if (!height) {
    return;
  }
  var firstCell = trElement.querySelector('td, th');
  if (!firstCell) {
    return;
  }
  var ptValue = (0, _convertToCSSPTValue2.default)(height);
  if (!ptValue) {
    return;
  }

  var cellPxHeight = (0, _from2.default)(firstCell.children).reduce(function (sum, childNode) {
    return sum + getEstimatedPxHeight(childNode);
  }, 0);

  var cellPtHeight = (0, _convertToCSSPTValue2.default)(String(cellPxHeight) + 'px');
  if (cellPtHeight >= ptValue) {
    return;
  }

  var pElsNeeded = Math.round((ptValue - cellPtHeight) / LINE_HEIGHT_PT_VALUE);
  if (pElsNeeded <= 0) {
    return;
  }
  var frag = doc.createDocumentFragment();
  var line = doc.createElement('p');
  while (pElsNeeded > 0) {
    pElsNeeded--;
    frag.appendChild(line.cloneNode(false));
  }
  firstCell.appendChild(frag);
}

function getEstimatedPxHeight(el) {
  var imgs = el.querySelectorAll('img');
  if (imgs.length) {
    return (0, _from2.default)(imgs).reduce(function (sum, nn) {
      return sum + getEstimatedPxHeight(nn);
    }, 0);
  }
  if (el.height) {
    return parseFloat(el.height) || LINE_HEIGHT_PX_VALUE;
  }
  if (el.style && el.style.height) {
    return (0, _convertToCSSPTValue2.default)(el.style.height) || LINE_HEIGHT_PX_VALUE;
  }
  return LINE_HEIGHT_PX_VALUE;
}