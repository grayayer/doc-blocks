"use strict";

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var registerBlockType = wp.blocks.registerBlockType;
var _wp$blockEditor = wp.blockEditor,
  useBlockProps = _wp$blockEditor.useBlockProps,
  InspectorControls = _wp$blockEditor.InspectorControls;
var _wp$components = wp.components,
  PanelBody = _wp$components.PanelBody,
  SelectControl = _wp$components.SelectControl,
  ToggleControl = _wp$components.ToggleControl;
var useSelect = wp.data.useSelect;
var __ = wp.i18n.__;

// "Parent & Child Pages" block code
registerBlockType('page-hierarchy-block/main', {
  title: 'Parent & Child Pages',
  icon: 'list-view',
  category: 'widgets',
  attributes: {
    selectedPageId: {
      type: 'number',
      default: 0
    },
    listType: {
      type: 'string',
      default: 'ul' // Default to unordered list
    },
    hideParentPage: {
      type: 'boolean',
      default: false
    }
  },
  edit: function edit(props) {
    var attributes = props.attributes,
      setAttributes = props.setAttributes;
    var blockProps = useBlockProps();
    var pages = useSelect(function (select) {
      try {
        var fetchedPages = select('core').getEntityRecords('postType', 'page', {
          per_page: -1
        });
        return fetchedPages;
      } catch (error) {
        console.error('Error fetching pages:', error);
        return [];
      }
    }, []);
    var onChangePageId = function onChangePageId(newPageId) {
      setAttributes({
        selectedPageId: parseInt(newPageId)
      });
    };
    var selectedPage = pages === null || pages === void 0 ? void 0 : pages.find(function (page) {
      return page.id === attributes.selectedPageId;
    });
    var childPages = pages === null || pages === void 0 ? void 0 : pages.filter(function (page) {
      return page.parent === attributes.selectedPageId;
    });
    var pageOptions = [{
      label: __('Select a page'),
      value: 0
    }];
    if (Array.isArray(pages)) {
      pageOptions = [].concat(_toConsumableArray(pageOptions), _toConsumableArray(pages.map(function (page) {
        return {
          label: page.title.rendered,
          value: page.id
        };
      })));
    }
    return /*#__PURE__*/React.createElement("div", blockProps, /*#__PURE__*/React.createElement(InspectorControls, null, /*#__PURE__*/React.createElement(PanelBody, {
      title: __('Page Selection')
    }, /*#__PURE__*/React.createElement(SelectControl, {
      label: __('Select Parent Page'),
      value: attributes.selectedPageId,
      options: pageOptions,
      onChange: onChangePageId
    }), /*#__PURE__*/React.createElement(ToggleControl, {
      label: __('Hide Parent Page'),
      checked: attributes.hideParentPage,
      onChange: function onChange(newValue) {
        return setAttributes({
          hideParentPage: newValue
        });
      }
    }), /*#__PURE__*/React.createElement(SelectControl, {
      label: __('List Type'),
      value: attributes.listType,
      options: [{
        label: __('Unordered List (UL)'),
        value: 'ul'
      }, {
        label: __('Ordered List (OL)'),
        value: 'ol'
      }],
      onChange: function onChange(newListType) {
        return setAttributes({
          listType: newListType
        });
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "page-hierarchy-block"
    }, null === pages ? /*#__PURE__*/React.createElement("p", null, __('Loading pages...')) : 0 === pages.length ? /*#__PURE__*/React.createElement("p", null, __('No pages found.')) : selectedPage ? /*#__PURE__*/React.createElement(React.Fragment, null, !attributes.hideParentPage && /*#__PURE__*/React.createElement("h2", null, selectedPage.title.rendered), childPages && childPages.length > 0 ? attributes.listType === 'ul' ? /*#__PURE__*/React.createElement("ul", null, childPages.map(function (childPage) {
      return /*#__PURE__*/React.createElement("li", {
        key: childPage.id
      }, childPage.title.rendered);
    })) : /*#__PURE__*/React.createElement("ol", null, childPages.map(function (childPage) {
      return /*#__PURE__*/React.createElement("li", {
        key: childPage.id
      }, childPage.title.rendered);
    })) : /*#__PURE__*/React.createElement("p", null, __('No child pages found.'))) : /*#__PURE__*/React.createElement("p", null, __('Please select a parent page.'))));
  },
  save: function save() {
    return null; // We'll use PHP to render the block
  }
});

// Updated "Page Sibling Navigation" block
registerBlockType('page-hierarchy-block/sibling-navigation', {
  title: 'Page Sibling Navigation',
  icon: 'admin-links',
  category: 'widgets',
  attributes: {
    usePageOrder: {
      type: 'boolean',
      default: false
    },
    navigationType: {
      type: 'string',
      default: 'both'
    },
    useParentAsPrevious: {
      type: 'boolean',
      default: false
    },
    useNextTopicAsNext: {
      type: 'boolean',
      default: false
    }
  },
  edit: function edit(props) {
    var _colors$find;
    var attributes = props.attributes,
      setAttributes = props.setAttributes;
    var blockProps = useBlockProps();
    var currentPageId = useSelect(function (select) {
      return select('core/editor').getCurrentPostId();
    }, []);
    var _useSelect = useSelect(function (select) {
        var page = select('core/editor').getCurrentPost();
        var parentId = page ? page.parent : 0;
        var allPages = select('core').getEntityRecords('postType', 'page', {
          per_page: -1
        });

        // Check if pages are still loading
        var isLoading = select('core').isResolving('getEntityRecords', ['postType', 'page', {
          per_page: -1
        }]);
        if (isLoading || !allPages) {
          return {
            parentId: parentId,
            siblings: null,
            currentPageIndex: -1,
            isLoading: isLoading
          };
        }
        var siblings = allPages.filter(function (p) {
          return p.parent === parentId;
        });
        var currentPageIndex = siblings.findIndex(function (p) {
          return p.id === currentPageId;
        });
        return {
          parentId: parentId,
          siblings: siblings,
          currentPageIndex: currentPageIndex,
          isLoading: isLoading
        };
      }, []),
      parentId = _useSelect.parentId,
      siblings = _useSelect.siblings,
      currentPageIndex = _useSelect.currentPageIndex,
      isLoading = _useSelect.isLoading;

    // Get the theme's color palette
    var _useSelect2 = useSelect(function (select) {
        return select('core/block-editor').getSettings();
      }, []),
      colors = _useSelect2.colors;

    // Find a suitable highlight color from the theme's palette
    var highlightColor = ((_colors$find = colors.find(function (color) {
      return color.slug === 'highlight' || color.slug === 'accent';
    })) === null || _colors$find === void 0 ? void 0 : _colors$find.color) || '#E0A315'; // Fallback to previous color if not found

    var renderNavigation = function renderNavigation() {
      if (isLoading) {
        return /*#__PURE__*/React.createElement("p", null, __('Loading sibling navigation...'));
      }
      if (!siblings || siblings.length === 0 || currentPageIndex === -1) {
        return /*#__PURE__*/React.createElement("p", null, __('No sibling pages found.'));
      }
      var prevSibling = siblings[currentPageIndex - 1];
      var nextSibling = siblings[currentPageIndex + 1];
      var hasPrevious = attributes.navigationType !== 'next' && (prevSibling || attributes.useParentAsPrevious && parentId);
      var hasNext = attributes.navigationType !== 'previous' && (nextSibling || attributes.useNextTopicAsNext);
      return /*#__PURE__*/React.createElement("nav", {
        className: "sibling-navigation-preview ".concat(hasPrevious && hasNext ? 'has-both' : hasNext ? 'has-only-next' : '')
      }, hasPrevious && /*#__PURE__*/React.createElement("a", {
        className: "nav-previous wayfinding"
      }, /*#__PURE__*/React.createElement("i", null, "\u2190"), /*#__PURE__*/React.createElement("div", {
        className: "words"
      }, /*#__PURE__*/React.createElement("span", {
        className: "meta-nav"
      }, "Previous"), /*#__PURE__*/React.createElement("span", {
        className: "adjacent-sibling-page-title"
      }, prevSibling ? prevSibling.title.rendered : 'Parent Page'))), hasNext && /*#__PURE__*/React.createElement("a", {
        className: "nav-next wayfinding"
      }, /*#__PURE__*/React.createElement("div", {
        className: "words"
      }, /*#__PURE__*/React.createElement("span", {
        className: "meta-nav"
      }, "Next"), /*#__PURE__*/React.createElement("span", {
        className: "adjacent-sibling-page-title"
      }, nextSibling ? nextSibling.title.rendered : 'Next Topic')), /*#__PURE__*/React.createElement("i", null, "\u2192")));
    };
    return /*#__PURE__*/React.createElement("div", blockProps, /*#__PURE__*/React.createElement("style", null, "\n                        .sibling-navigation-preview {\n                            display: flex;\n                            justify-content: space-between;\n                            border-top: 1px solid rgba(38, 74, 69, 0.5);\n                            padding-top: 1rem;\n                        }\n                        .sibling-navigation-preview.has-only-next {\n                            justify-content: flex-end;\n                        }\n                        .sibling-navigation-preview a {\n                            display: flex;\n                            flex-direction: row;\n                            align-items: center;\n                            column-gap: 1rem;\n                            text-decoration: none;\n                            max-width: 45%;\n                        }\n                        .sibling-navigation-preview a i {\n                            font-size: 1.5rem;\n                            transition: 100ms all ease-in-out;\n                        }\n                        .sibling-navigation-preview a .words {\n                            display: flex;\n                            flex-direction: column;\n                        }\n                        .sibling-navigation-preview a:hover span.meta-nav {\n                                color: var(--global-palette-highlight-alt, #E0A315);\n                        }\n                        .sibling-navigation-preview a .adjacent-sibling-page-title {\n                            transition: 100ms all ease-in-out;\n                        }\n                        .sibling-navigation-preview span.meta-nav {\n                            text-transform: uppercase;\n                            font-size: 0.9rem;\n                            color: #333;\n                            transition: 300ms all ease-in-out;\n                        }\n                        .sibling-navigation-preview .nav-next {\n                            text-align: right;\n                        }\n                        .no-parent-message {\n                            color: #999999;\n                            display: flex;\n                            align-items: center;\n                        }\n                    "), /*#__PURE__*/React.createElement(InspectorControls, null, /*#__PURE__*/React.createElement(PanelBody, {
      title: __('Navigation Settings')
    }, /*#__PURE__*/React.createElement(ToggleControl, {
      label: __('Use Page Order'),
      checked: attributes.usePageOrder,
      onChange: function onChange(value) {
        return setAttributes({
          usePageOrder: value
        });
      }
    }), /*#__PURE__*/React.createElement(SelectControl, {
      label: __('Navigation Type'),
      value: attributes.navigationType,
      options: [{
        label: __('Previous and Next'),
        value: 'both'
      }, {
        label: __('Previous Only'),
        value: 'previous'
      }, {
        label: __('Next Only'),
        value: 'next'
      }],
      onChange: function onChange(value) {
        return setAttributes({
          navigationType: value
        });
      }
    }), /*#__PURE__*/React.createElement(ToggleControl, {
      label: __('Use Parent as Previous'),
      help: __('If there is no previous sibling, use the parent page as the previous link'),
      checked: attributes.useParentAsPrevious,
      onChange: function onChange(value) {
        return setAttributes({
          useParentAsPrevious: value
        });
      }
    }), /*#__PURE__*/React.createElement(ToggleControl, {
      label: __('Use Next Topic as Next'),
      help: __('If there is no next sibling, use the next topic (parent\'s next sibling) as the next link'),
      checked: attributes.useNextTopicAsNext,
      onChange: function onChange(value) {
        return setAttributes({
          useNextTopicAsNext: value
        });
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "wp-block-page-sibling-navigation"
    }, parentId ? renderNavigation() : /*#__PURE__*/React.createElement("p", {
      class: "no-parent-message"
    }, /*#__PURE__*/React.createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 512 512",
      style: {
        width: '1em',
        height: '1em',
        marginRight: '0.5em',
        verticalAlign: 'middle',
        fill: '#999999'
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0-24 0 0-48 24 0 48 0 24 0 0 24 0 88 8 0 24 0 0 48-24 0-80 0-24 0 0-48 24 0zm72-144l-64 0 0-64 64 0 0 64z"
    })), /*#__PURE__*/React.createElement("em", null, __('This page has no parent so the Sibling Navigation block is not applicable.')))));
  },
  save: function save() {
    return null; // We'll use PHP to render the block
  }
});
//# sourceMappingURL=index.js.map