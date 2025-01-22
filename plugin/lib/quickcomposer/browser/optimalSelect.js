// https://cdn.jsdelivr.net/npm/optimal-select@4.0.1/dist/optimal-select.js
(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory();
  else if (typeof define === "function" && define.amd) define([], factory);
  else if (typeof exports === "object") exports["OptimalSelect"] = factory();
  else root["OptimalSelect"] = factory();
})(this, function () {
  return /******/ (function (modules) {
    // webpackBootstrap
    /******/ // The module cache
    /******/ var installedModules = {};
    /******/
    /******/ // The require function
    /******/ function __webpack_require__(moduleId) {
      /******/
      /******/ // Check if module is in cache
      /******/ if (installedModules[moduleId])
        /******/ return installedModules[moduleId].exports;
      /******/
      /******/ // Create a new module (and put it into the cache)
      /******/ var module = (installedModules[moduleId] = {
        /******/ i: moduleId,
        /******/ l: false,
        /******/ exports: {},
        /******/
      });
      /******/
      /******/ // Execute the module function
      /******/ modules[moduleId].call(
        module.exports,
        module,
        module.exports,
        __webpack_require__
      );
      /******/
      /******/ // Flag the module as loaded
      /******/ module.l = true;
      /******/
      /******/ // Return the exports of the module
      /******/ return module.exports;
      /******/
    }
    /******/
    /******/
    /******/ // expose the modules object (__webpack_modules__)
    /******/ __webpack_require__.m = modules;
    /******/
    /******/ // expose the module cache
    /******/ __webpack_require__.c = installedModules;
    /******/
    /******/ // identity function for calling harmony imports with the correct context
    /******/ __webpack_require__.i = function (value) {
      return value;
    };
    /******/
    /******/ // define getter function for harmony exports
    /******/ __webpack_require__.d = function (exports, name, getter) {
      /******/ if (!__webpack_require__.o(exports, name)) {
        /******/ Object.defineProperty(exports, name, {
          /******/ configurable: false,
          /******/ enumerable: true,
          /******/ get: getter,
          /******/
        });
        /******/
      }
      /******/
    };
    /******/
    /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/ __webpack_require__.n = function (module) {
      /******/ var getter =
        module && module.__esModule
          ? /******/ function getDefault() {
              return module["default"];
            }
          : /******/ function getModuleExports() {
              return module;
            };
      /******/ __webpack_require__.d(getter, "a", getter);
      /******/ return getter;
      /******/
    };
    /******/
    /******/ // Object.prototype.hasOwnProperty.call
    /******/ __webpack_require__.o = function (object, property) {
      return Object.prototype.hasOwnProperty.call(object, property);
    };
    /******/
    /******/ // __webpack_public_path__
    /******/ __webpack_require__.p = "";
    /******/
    /******/ // Load entry module and return exports
    /******/ return __webpack_require__((__webpack_require__.s = 6));
    /******/
  })(
    /************************************************************************/
    /******/ [
      /* 0 */
      /***/ function (module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true,
        });
        exports.convertNodeList = convertNodeList;
        exports.escapeValue = escapeValue;
        /**
         * # Utilities
         *
         * Convenience helpers.
         */

        /**
         * Create an array with the DOM nodes of the list
         *
         * @param  {NodeList}             nodes - [description]
         * @return {Array.<HTMLElement>}        - [description]
         */
        function convertNodeList(nodes) {
          var length = nodes.length;

          var arr = new Array(length);
          for (var i = 0; i < length; i++) {
            arr[i] = nodes[i];
          }
          return arr;
        }

        /**
         * Escape special characters and line breaks as a simplified version of 'CSS.escape()'
         *
         * Description of valid characters: https://mathiasbynens.be/notes/css-escapes
         *
         * @param  {String?} value - [description]
         * @return {String}        - [description]
         */
        function escapeValue(value) {
          return (
            value &&
            value
              .replace(/['"`\\/:\?&!#$%^()[\]{|}*+;,.<=>@~]/g, "\\$&")
              .replace(/\n/g, "A")
          );
        }

        /***/
      },
      /* 1 */
      /***/ function (module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true,
        });
        exports.getCommonAncestor = getCommonAncestor;
        exports.getCommonProperties = getCommonProperties;
        /**
         * # Common
         *
         * Process collections for similarities.
         */

        /**
         * Find the last common ancestor of elements
         *
         * @param  {Array.<HTMLElements>} elements - [description]
         * @return {HTMLElement}                   - [description]
         */
        function getCommonAncestor(elements) {
          var options =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};
          var _options$root = options.root,
            root = _options$root === undefined ? document : _options$root;

          var ancestors = [];

          elements.forEach(function (element, index) {
            var parents = [];
            while (element !== root) {
              element = element.parentNode;
              parents.unshift(element);
            }
            ancestors[index] = parents;
          });

          ancestors.sort(function (curr, next) {
            return curr.length - next.length;
          });

          var shallowAncestor = ancestors.shift();

          var ancestor = null;

          var _loop = function _loop() {
            var parent = shallowAncestor[i];
            var missing = ancestors.some(function (otherParents) {
              return !otherParents.some(function (otherParent) {
                return otherParent === parent;
              });
            });

            if (missing) {
              // TODO: find similar sub-parents, not the top root, e.g. sharing a class selector
              return "break";
            }

            ancestor = parent;
          };

          for (var i = 0, l = shallowAncestor.length; i < l; i++) {
            var _ret = _loop();

            if (_ret === "break") break;
          }

          return ancestor;
        }

        /**
         * Get a set of common properties of elements
         *
         * @param  {Array.<HTMLElement>} elements - [description]
         * @return {Object}                       - [description]
         */
        function getCommonProperties(elements) {
          var commonProperties = {
            classes: [],
            attributes: {},
            tag: null,
          };

          elements.forEach(function (element) {
            var commonClasses = commonProperties.classes,
              commonAttributes = commonProperties.attributes,
              commonTag = commonProperties.tag;

            // ~ classes

            if (commonClasses !== undefined) {
              var classes = element.getAttribute("class");
              if (classes) {
                classes = classes.trim().split(" ");
                if (!commonClasses.length) {
                  commonProperties.classes = classes;
                } else {
                  commonClasses = commonClasses.filter(function (entry) {
                    return classes.some(function (name) {
                      return name === entry;
                    });
                  });
                  if (commonClasses.length) {
                    commonProperties.classes = commonClasses;
                  } else {
                    delete commonProperties.classes;
                  }
                }
              } else {
                // TODO: restructure removal as 2x set / 2x delete, instead of modify always replacing with new collection
                delete commonProperties.classes;
              }
            }

            // ~ attributes
            if (commonAttributes !== undefined) {
              (function () {
                var elementAttributes = element.attributes;
                var attributes = Object.keys(elementAttributes).reduce(
                  function (attributes, key) {
                    var attribute = elementAttributes[key];
                    var attributeName = attribute.name;
                    // NOTE: workaround detection for non-standard phantomjs NamedNodeMap behaviour
                    // (issue: https://github.com/ariya/phantomjs/issues/14634)
                    if (attribute && attributeName !== "class") {
                      attributes[attributeName] = attribute.value;
                    }
                    return attributes;
                  },
                  {}
                );

                var attributesNames = Object.keys(attributes);
                var commonAttributesNames = Object.keys(commonAttributes);

                if (attributesNames.length) {
                  if (!commonAttributesNames.length) {
                    commonProperties.attributes = attributes;
                  } else {
                    commonAttributes = commonAttributesNames.reduce(function (
                      nextCommonAttributes,
                      name
                    ) {
                      var value = commonAttributes[name];
                      if (value === attributes[name]) {
                        nextCommonAttributes[name] = value;
                      }
                      return nextCommonAttributes;
                    },
                    {});
                    if (Object.keys(commonAttributes).length) {
                      commonProperties.attributes = commonAttributes;
                    } else {
                      delete commonProperties.attributes;
                    }
                  }
                } else {
                  delete commonProperties.attributes;
                }
              })();
            }

            // ~ tag
            if (commonTag !== undefined) {
              var tag = element.tagName.toLowerCase();
              if (!commonTag) {
                commonProperties.tag = tag;
              } else if (tag !== commonTag) {
                delete commonProperties.tag;
              }
            }
          });

          return commonProperties;
        }

        /***/
      },
      /* 2 */
      /***/ function (module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true,
        });
        exports.default = optimize;

        var _adapt = __webpack_require__(3);

        var _adapt2 = _interopRequireDefault(_adapt);

        var _utilities = __webpack_require__(0);

        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }

        /**
         * Apply different optimization techniques
         *
         * @param  {string}                          selector - [description]
         * @param  {HTMLElement|Array.<HTMLElement>} element  - [description]
         * @param  {Object}                          options  - [description]
         * @return {string}                                   - [description]
         */
        /**
         * # Optimize
         *
         * 1.) Improve efficiency through shorter selectors by removing redundancy
         * 2.) Improve robustness through selector transformation
         */

        function optimize(selector, elements) {
          var options =
            arguments.length > 2 && arguments[2] !== undefined
              ? arguments[2]
              : {};

          // convert single entry and NodeList
          if (!Array.isArray(elements)) {
            elements = !elements.length
              ? [elements]
              : (0, _utilities.convertNodeList)(elements);
          }

          if (
            !elements.length ||
            elements.some(function (element) {
              return element.nodeType !== 1;
            })
          ) {
            throw new Error(
              'Invalid input - to compare HTMLElements its necessary to provide a reference of the selected node(s)! (missing "elements")'
            );
          }

          var globalModified = (0, _adapt2.default)(elements[0], options);

          // chunk parts outside of quotes (http://stackoverflow.com/a/25663729)
          var path = selector
            .replace(/> /g, ">")
            .split(/\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/);

          if (path.length < 2) {
            return optimizePart("", selector, "", elements);
          }

          var shortened = [path.pop()];
          while (path.length > 1) {
            var current = path.pop();
            var prePart = path.join(" ");
            var postPart = shortened.join(" ");

            var pattern = prePart + " " + postPart;
            var matches = document.querySelectorAll(pattern);
            if (matches.length !== elements.length) {
              shortened.unshift(
                optimizePart(prePart, current, postPart, elements)
              );
            }
          }
          shortened.unshift(path[0]);
          path = shortened;

          // optimize start + end
          path[0] = optimizePart(
            "",
            path[0],
            path.slice(1).join(" "),
            elements
          );
          path[path.length - 1] = optimizePart(
            path.slice(0, -1).join(" "),
            path[path.length - 1],
            "",
            elements
          );

          if (globalModified) {
            delete true;
          }

          return path.join(" ").replace(/>/g, "> ").trim();
        }

        /**
         * Improve a chunk of the selector
         *
         * @param  {string}              prePart  - [description]
         * @param  {string}              current  - [description]
         * @param  {string}              postPart - [description]
         * @param  {Array.<HTMLElement>} elements - [description]
         * @return {string}                       - [description]
         */
        function optimizePart(prePart, current, postPart, elements) {
          if (prePart.length) prePart = prePart + " ";
          if (postPart.length) postPart = " " + postPart;

          // robustness: attribute without value (generalization)
          if (/\[*\]/.test(current)) {
            var key = current.replace(/=.*$/, "]");
            var pattern = "" + prePart + key + postPart;
            var matches = document.querySelectorAll(pattern);
            if (compareResults(matches, elements)) {
              current = key;
            } else {
              // robustness: replace specific key-value with base tag (heuristic)
              var references = document.querySelectorAll("" + prePart + key);

              var _loop = function _loop() {
                var reference = references[i];
                if (
                  elements.some(function (element) {
                    return reference.contains(element);
                  })
                ) {
                  var description = reference.tagName.toLowerCase();
                  pattern = "" + prePart + description + postPart;
                  matches = document.querySelectorAll(pattern);

                  if (compareResults(matches, elements)) {
                    current = description;
                  }
                  return "break";
                }
              };

              for (var i = 0, l = references.length; i < l; i++) {
                var pattern;
                var matches;

                var _ret = _loop();

                if (_ret === "break") break;
              }
            }
          }

          // robustness: descendant instead child (heuristic)
          if (/>/.test(current)) {
            var descendant = current.replace(/>/, "");
            var pattern = "" + prePart + descendant + postPart;
            var matches = document.querySelectorAll(pattern);
            if (compareResults(matches, elements)) {
              current = descendant;
            }
          }

          // robustness: 'nth-of-type' instead 'nth-child' (heuristic)
          if (/:nth-child/.test(current)) {
            // TODO: consider complete coverage of 'nth-of-type' replacement
            var type = current.replace(/nth-child/g, "nth-of-type");
            var pattern = "" + prePart + type + postPart;
            var matches = document.querySelectorAll(pattern);
            if (compareResults(matches, elements)) {
              current = type;
            }
          }

          // efficiency: combinations of classname (partial permutations)
          if (/\.\S+\.\S+/.test(current)) {
            var names = current
              .trim()
              .split(".")
              .slice(1)
              .map(function (name) {
                return "." + name;
              })
              .sort(function (curr, next) {
                return curr.length - next.length;
              });
            while (names.length) {
              var partial = current.replace(names.shift(), "").trim();
              var pattern = ("" + prePart + partial + postPart).trim();
              if (
                !pattern.length ||
                pattern.charAt(0) === ">" ||
                pattern.charAt(pattern.length - 1) === ">"
              ) {
                break;
              }
              var matches = document.querySelectorAll(pattern);
              if (compareResults(matches, elements)) {
                current = partial;
              }
            }

            // robustness: degrade complex classname (heuristic)
            names = current && current.match(/\./g);
            if (names && names.length > 2) {
              var _references = document.querySelectorAll(
                "" + prePart + current
              );

              var _loop2 = function _loop2() {
                var reference = _references[i];
                if (
                  elements.some(function (element) {
                    return reference.contains(element);
                  })
                ) {
                  // TODO:
                  // - check using attributes + regard excludes
                  var description = reference.tagName.toLowerCase();
                  pattern = "" + prePart + description + postPart;
                  matches = document.querySelectorAll(pattern);

                  if (compareResults(matches, elements)) {
                    current = description;
                  }
                  return "break";
                }
              };

              for (var i = 0, l = _references.length; i < l; i++) {
                var pattern;
                var matches;

                var _ret2 = _loop2();

                if (_ret2 === "break") break;
              }
            }
          }

          return current;
        }

        /**
         * Evaluate matches with expected elements
         *
         * @param  {Array.<HTMLElement>} matches  - [description]
         * @param  {Array.<HTMLElement>} elements - [description]
         * @return {Boolean}                      - [description]
         */
        function compareResults(matches, elements) {
          var length = matches.length;

          return (
            length === elements.length &&
            elements.every(function (element) {
              for (var i = 0; i < length; i++) {
                if (matches[i] === element) {
                  return true;
                }
              }
              return false;
            })
          );
        }
        module.exports = exports["default"];

        /***/
      },
      /* 3 */
      /***/ function (module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true,
        });

        var _typeof =
          typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
            ? function (obj) {
                return typeof obj;
              }
            : function (obj) {
                return obj &&
                  typeof Symbol === "function" &&
                  obj.constructor === Symbol &&
                  obj !== Symbol.prototype
                  ? "symbol"
                  : typeof obj;
              };

        var _slicedToArray = (function () {
          function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;
            try {
              for (
                var _i = arr[Symbol.iterator](), _s;
                !(_n = (_s = _i.next()).done);
                _n = true
              ) {
                _arr.push(_s.value);
                if (i && _arr.length === i) break;
              }
            } catch (err) {
              _d = true;
              _e = err;
            } finally {
              try {
                if (!_n && _i["return"]) _i["return"]();
              } finally {
                if (_d) throw _e;
              }
            }
            return _arr;
          }
          return function (arr, i) {
            if (Array.isArray(arr)) {
              return arr;
            } else if (Symbol.iterator in Object(arr)) {
              return sliceIterator(arr, i);
            } else {
              throw new TypeError(
                "Invalid attempt to destructure non-iterable instance"
              );
            }
          };
        })();

        exports.default = adapt;
        /**
         * # Adapt
         *
         * Check and extend the environment for universal usage.
         */

        /**
         * Modify the context based on the environment
         *
         * @param  {HTMLELement} element - [description]
         * @param  {Object}      options - [description]
         * @return {boolean}             - [description]
         */
        function adapt(element, options) {
          // detect environment setup
          if (true) {
            return false;
          } else {
            global.document =
              options.context ||
              (function () {
                var root = element;
                while (root.parent) {
                  root = root.parent;
                }
                return root;
              })();
          }

          // https://github.com/fb55/domhandler/blob/master/index.js#L75
          var ElementPrototype = Object.getPrototypeOf(true);

          // alternative descriptor to access elements with filtering invalid elements (e.g. textnodes)
          if (!Object.getOwnPropertyDescriptor(ElementPrototype, "childTags")) {
            Object.defineProperty(ElementPrototype, "childTags", {
              enumerable: true,
              get: function get() {
                return this.children.filter(function (node) {
                  // https://github.com/fb55/domelementtype/blob/master/index.js#L12
                  return (
                    node.type === "tag" ||
                    node.type === "script" ||
                    node.type === "style"
                  );
                });
              },
            });
          }

          if (
            !Object.getOwnPropertyDescriptor(ElementPrototype, "attributes")
          ) {
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
            // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap
            Object.defineProperty(ElementPrototype, "attributes", {
              enumerable: true,
              get: function get() {
                var attribs = this.attribs;

                var attributesNames = Object.keys(attribs);
                var NamedNodeMap = attributesNames.reduce(function (
                  attributes,
                  attributeName,
                  index
                ) {
                  attributes[index] = {
                    name: attributeName,
                    value: attribs[attributeName],
                  };
                  return attributes;
                },
                {});
                Object.defineProperty(NamedNodeMap, "length", {
                  enumerable: false,
                  configurable: false,
                  value: attributesNames.length,
                });
                return NamedNodeMap;
              },
            });
          }

          if (!ElementPrototype.getAttribute) {
            // https://docs.webplatform.org/wiki/dom/Element/getAttribute
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
            ElementPrototype.getAttribute = function (name) {
              return this.attribs[name] || null;
            };
          }

          if (!ElementPrototype.getElementsByTagName) {
            // https://docs.webplatform.org/wiki/dom/Document/getElementsByTagName
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
            ElementPrototype.getElementsByTagName = function (tagName) {
              var HTMLCollection = [];
              traverseDescendants(this.childTags, function (descendant) {
                if (descendant.name === tagName || tagName === "*") {
                  HTMLCollection.push(descendant);
                }
              });
              return HTMLCollection;
            };
          }

          if (!ElementPrototype.getElementsByClassName) {
            // https://docs.webplatform.org/wiki/dom/Document/getElementsByClassName
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
            ElementPrototype.getElementsByClassName = function (className) {
              var names = className.trim().replace(/\s+/g, " ").split(" ");
              var HTMLCollection = [];
              traverseDescendants([this], function (descendant) {
                var descendantClassName = descendant.attribs.class;
                if (
                  descendantClassName &&
                  names.every(function (name) {
                    return descendantClassName.indexOf(name) > -1;
                  })
                ) {
                  HTMLCollection.push(descendant);
                }
              });
              return HTMLCollection;
            };
          }

          if (!ElementPrototype.querySelectorAll) {
            // https://docs.webplatform.org/wiki/css/selectors_api/querySelectorAll
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
            ElementPrototype.querySelectorAll = function (selectors) {
              var _this = this;

              selectors = selectors.replace(/(>)(\S)/g, "$1 $2").trim(); // add space for '>' selector

              // using right to left execution => https://github.com/fb55/css-select#how-does-it-work
              var instructions = getInstructions(selectors);
              var discover = instructions.shift();

              var total = instructions.length;
              return discover(this).filter(function (node) {
                var step = 0;
                while (step < total) {
                  node = instructions[step](node, _this);
                  if (!node) {
                    // hierarchy doesn't match
                    return false;
                  }
                  step += 1;
                }
                return true;
              });
            };
          }

          if (!ElementPrototype.contains) {
            // https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
            ElementPrototype.contains = function (element) {
              var inclusive = false;
              traverseDescendants([this], function (descendant, done) {
                if (descendant === element) {
                  inclusive = true;
                  done();
                }
              });
              return inclusive;
            };
          }

          return true;
        }

        /**
         * Retrieve transformation steps
         *
         * @param  {Array.<string>}   selectors - [description]
         * @return {Array.<Function>}           - [description]
         */
        function getInstructions(selectors) {
          return selectors
            .split(" ")
            .reverse()
            .map(function (selector, step) {
              var discover = step === 0;

              var _selector$split = selector.split(":"),
                _selector$split2 = _slicedToArray(_selector$split, 2),
                type = _selector$split2[0],
                pseudo = _selector$split2[1];

              var validate = null;
              var instruction = null;

              (function () {
                switch (true) {
                  // child: '>'
                  case />/.test(type):
                    instruction = function checkParent(node) {
                      return function (validate) {
                        return validate(node.parent) && node.parent;
                      };
                    };
                    break;

                  // class: '.'
                  case /^\./.test(type):
                    var names = type.substr(1).split(".");
                    validate = function validate(node) {
                      var nodeClassName = node.attribs.class;
                      return (
                        nodeClassName &&
                        names.every(function (name) {
                          return nodeClassName.indexOf(name) > -1;
                        })
                      );
                    };
                    instruction = function checkClass(node, root) {
                      if (discover) {
                        return node.getElementsByClassName(names.join(" "));
                      }
                      return typeof node === "function"
                        ? node(validate)
                        : getAncestor(node, root, validate);
                    };
                    break;

                  // attribute: '[key="value"]'
                  case /^\[/.test(type):
                    var _type$replace$split = type
                        .replace(/\[|\]|"/g, "")
                        .split("="),
                      _type$replace$split2 = _slicedToArray(
                        _type$replace$split,
                        2
                      ),
                      attributeKey = _type$replace$split2[0],
                      attributeValue = _type$replace$split2[1];

                    validate = function validate(node) {
                      var hasAttribute =
                        Object.keys(node.attribs).indexOf(attributeKey) > -1;
                      if (hasAttribute) {
                        // regard optional attributeValue
                        if (
                          !attributeValue ||
                          node.attribs[attributeKey] === attributeValue
                        ) {
                          return true;
                        }
                      }
                      return false;
                    };
                    instruction = function checkAttribute(node, root) {
                      if (discover) {
                        var _ret2 = (function () {
                          var NodeList = [];
                          traverseDescendants([node], function (descendant) {
                            if (validate(descendant)) {
                              NodeList.push(descendant);
                            }
                          });
                          return {
                            v: NodeList,
                          };
                        })();

                        if (
                          (typeof _ret2 === "undefined"
                            ? "undefined"
                            : _typeof(_ret2)) === "object"
                        )
                          return _ret2.v;
                      }
                      return typeof node === "function"
                        ? node(validate)
                        : getAncestor(node, root, validate);
                    };
                    break;

                  // id: '#'
                  case /^#/.test(type):
                    var id = type.substr(1);
                    validate = function validate(node) {
                      return node.attribs.id === id;
                    };
                    instruction = function checkId(node, root) {
                      if (discover) {
                        var _ret3 = (function () {
                          var NodeList = [];
                          traverseDescendants(
                            [node],
                            function (descendant, done) {
                              if (validate(descendant)) {
                                NodeList.push(descendant);
                                done();
                              }
                            }
                          );
                          return {
                            v: NodeList,
                          };
                        })();

                        if (
                          (typeof _ret3 === "undefined"
                            ? "undefined"
                            : _typeof(_ret3)) === "object"
                        )
                          return _ret3.v;
                      }
                      return typeof node === "function"
                        ? node(validate)
                        : getAncestor(node, root, validate);
                    };
                    break;

                  // universal: '*'
                  case /\*/.test(type):
                    validate = function validate(node) {
                      return true;
                    };
                    instruction = function checkUniversal(node, root) {
                      if (discover) {
                        var _ret4 = (function () {
                          var NodeList = [];
                          traverseDescendants([node], function (descendant) {
                            return NodeList.push(descendant);
                          });
                          return {
                            v: NodeList,
                          };
                        })();

                        if (
                          (typeof _ret4 === "undefined"
                            ? "undefined"
                            : _typeof(_ret4)) === "object"
                        )
                          return _ret4.v;
                      }
                      return typeof node === "function"
                        ? node(validate)
                        : getAncestor(node, root, validate);
                    };
                    break;

                  // tag: '...'
                  default:
                    validate = function validate(node) {
                      return node.name === type;
                    };
                    instruction = function checkTag(node, root) {
                      if (discover) {
                        var _ret5 = (function () {
                          var NodeList = [];
                          traverseDescendants([node], function (descendant) {
                            if (validate(descendant)) {
                              NodeList.push(descendant);
                            }
                          });
                          return {
                            v: NodeList,
                          };
                        })();

                        if (
                          (typeof _ret5 === "undefined"
                            ? "undefined"
                            : _typeof(_ret5)) === "object"
                        )
                          return _ret5.v;
                      }
                      return typeof node === "function"
                        ? node(validate)
                        : getAncestor(node, root, validate);
                    };
                }
              })();

              if (!pseudo) {
                return instruction;
              }

              var rule = pseudo.match(/-(child|type)\((\d+)\)$/);
              var kind = rule[1];
              var index = parseInt(rule[2], 10) - 1;

              var validatePseudo = function validatePseudo(node) {
                if (node) {
                  var compareSet = node.parent.childTags;
                  if (kind === "type") {
                    compareSet = compareSet.filter(validate);
                  }
                  var nodeIndex = compareSet.findIndex(function (child) {
                    return child === node;
                  });
                  if (nodeIndex === index) {
                    return true;
                  }
                }
                return false;
              };

              return function enhanceInstruction(node) {
                var match = instruction(node);
                if (discover) {
                  return match.reduce(function (NodeList, matchedNode) {
                    if (validatePseudo(matchedNode)) {
                      NodeList.push(matchedNode);
                    }
                    return NodeList;
                  }, []);
                }
                return validatePseudo(match) && match;
              };
            });
        }

        /**
         * Walking recursive to invoke callbacks
         *
         * @param {Array.<HTMLElement>} nodes   - [description]
         * @param {Function}            handler - [description]
         */
        function traverseDescendants(nodes, handler) {
          nodes.forEach(function (node) {
            var progress = true;
            handler(node, function () {
              return (progress = false);
            });
            if (node.childTags && progress) {
              traverseDescendants(node.childTags, handler);
            }
          });
        }

        /**
         * Bubble up from bottom to top
         *
         * @param  {HTMLELement} node     - [description]
         * @param  {HTMLELement} root     - [description]
         * @param  {Function}    validate - [description]
         * @return {HTMLELement}          - [description]
         */
        function getAncestor(node, root, validate) {
          while (node.parent) {
            node = node.parent;
            if (validate(node)) {
              return node;
            }
            if (node === root) {
              break;
            }
          }
          return null;
        }
        module.exports = exports["default"];

        /***/
      },
      /* 4 */
      /***/ function (module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true,
        });

        var _typeof =
          typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
            ? function (obj) {
                return typeof obj;
              }
            : function (obj) {
                return obj &&
                  typeof Symbol === "function" &&
                  obj.constructor === Symbol &&
                  obj !== Symbol.prototype
                  ? "symbol"
                  : typeof obj;
              };
        /**
         * # Select
         *
         * Construct a unique CSS query selector to access the selected DOM element(s).
         * For longevity it applies different matching and optimization strategies.
         */

        exports.getSingleSelector = getSingleSelector;
        exports.getMultiSelector = getMultiSelector;
        exports.default = getQuerySelector;

        var _adapt = __webpack_require__(3);

        var _adapt2 = _interopRequireDefault(_adapt);

        var _match = __webpack_require__(5);

        var _match2 = _interopRequireDefault(_match);

        var _optimize = __webpack_require__(2);

        var _optimize2 = _interopRequireDefault(_optimize);

        var _utilities = __webpack_require__(0);

        var _common = __webpack_require__(1);

        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }

        /**
         * Get a selector for the provided element
         *
         * @param  {HTMLElement} element - [description]
         * @param  {Object}      options - [description]
         * @return {string}              - [description]
         */
        function getSingleSelector(element) {
          var options =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          if (element.nodeType === 3) {
            element = element.parentNode;
          }

          if (element.nodeType !== 1) {
            throw new Error(
              'Invalid input - only HTMLElements or representations of them are supported! (not "' +
                (typeof element === "undefined"
                  ? "undefined"
                  : _typeof(element)) +
                '")'
            );
          }

          var globalModified = (0, _adapt2.default)(element, options);

          var selector = (0, _match2.default)(element, options);
          var optimized = (0, _optimize2.default)(selector, element, options);

          // debug
          // console.log(`
          //   selector:  ${selector}
          //   optimized: ${optimized}
          // `)

          if (globalModified) {
            delete true;
          }

          return optimized;
        }

        /**
         * Get a selector to match multiple descendants from an ancestor
         *
         * @param  {Array.<HTMLElement>|NodeList} elements - [description]
         * @param  {Object}                       options  - [description]
         * @return {string}                                - [description]
         */
        function getMultiSelector(elements) {
          var options =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          if (!Array.isArray(elements)) {
            elements = (0, _utilities.convertNodeList)(elements);
          }

          if (
            elements.some(function (element) {
              return element.nodeType !== 1;
            })
          ) {
            throw new Error(
              "Invalid input - only an Array of HTMLElements or representations of them is supported!"
            );
          }

          var globalModified = (0, _adapt2.default)(elements[0], options);

          var ancestor = (0, _common.getCommonAncestor)(elements, options);
          var ancestorSelector = getSingleSelector(ancestor, options);

          // TODO: consider usage of multiple selectors + parent-child relation + check for part redundancy
          var commonSelectors = getCommonSelectors(elements);
          var descendantSelector = commonSelectors[0];

          var selector = (0, _optimize2.default)(
            ancestorSelector + " " + descendantSelector,
            elements,
            options
          );
          var selectorMatches = (0, _utilities.convertNodeList)(
            document.querySelectorAll(selector)
          );

          if (
            !elements.every(function (element) {
              return selectorMatches.some(function (entry) {
                return entry === element;
              });
            })
          ) {
            // TODO: cluster matches to split into similar groups for sub selections
            return console.warn(
              "\n      The selected elements can't be efficiently mapped.\n      Its probably best to use multiple single selectors instead!\n    ",
              elements
            );
          }

          if (globalModified) {
            delete true;
          }

          return selector;
        }

        /**
         * Get selectors to describe a set of elements
         *
         * @param  {Array.<HTMLElements>} elements - [description]
         * @return {string}                        - [description]
         */
        function getCommonSelectors(elements) {
          var _getCommonProperties = (0, _common.getCommonProperties)(elements),
            classes = _getCommonProperties.classes,
            attributes = _getCommonProperties.attributes,
            tag = _getCommonProperties.tag;

          var selectorPath = [];

          if (tag) {
            selectorPath.push(tag);
          }

          if (classes) {
            var classSelector = classes
              .map(function (name) {
                return "." + name;
              })
              .join("");
            selectorPath.push(classSelector);
          }

          if (attributes) {
            var attributeSelector = Object.keys(attributes)
              .reduce(function (parts, name) {
                parts.push("[" + name + '="' + attributes[name] + '"]');
                return parts;
              }, [])
              .join("");
            selectorPath.push(attributeSelector);
          }

          if (selectorPath.length) {
            // TODO: check for parent-child relation
          }

          return [selectorPath.join("")];
        }

        /**
         * Choose action depending on the input (multiple/single)
         *
         * NOTE: extended detection is used for special cases like the <select> element with <options>
         *
         * @param  {HTMLElement|NodeList|Array.<HTMLElement>} input   - [description]
         * @param  {Object}                                   options - [description]
         * @return {string}                                           - [description]
         */
        function getQuerySelector(input) {
          var options =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : {};

          if (input.length && !input.name) {
            return getMultiSelector(input, options);
          }
          return getSingleSelector(input, options);
        }

        /***/
      },
      /* 5 */
      /***/ function (module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true,
        });
        exports.default = match;

        var _utilities = __webpack_require__(0);

        var defaultIgnore = {
          attribute: function attribute(attributeName) {
            return (
              ["style", "data-reactid", "data-react-checksum"].indexOf(
                attributeName
              ) > -1
            );
          },
        };

        /**
         * Get the path of the element
         *
         * @param  {HTMLElement} node    - [description]
         * @param  {Object}      options - [description]
         * @return {string}              - [description]
         */
        /**
         * # Match
         *
         * Retrieve selector for a node.
         */

        function match(node, options) {
          var _options$root = options.root,
            root = _options$root === undefined ? document : _options$root,
            _options$skip = options.skip,
            skip = _options$skip === undefined ? null : _options$skip,
            _options$priority = options.priority,
            priority =
              _options$priority === undefined
                ? ["id", "class", "href", "src"]
                : _options$priority,
            _options$ignore = options.ignore,
            ignore = _options$ignore === undefined ? {} : _options$ignore;

          var path = [];
          var element = node;
          var length = path.length;
          var ignoreClass = false;

          var skipCompare =
            skip &&
            (Array.isArray(skip) ? skip : [skip]).map(function (entry) {
              if (typeof entry !== "function") {
                return function (element) {
                  return element === entry;
                };
              }
              return entry;
            });

          var skipChecks = function skipChecks(element) {
            return (
              skip &&
              skipCompare.some(function (compare) {
                return compare(element);
              })
            );
          };

          Object.keys(ignore).forEach(function (type) {
            if (type === "class") {
              ignoreClass = true;
            }
            var predicate = ignore[type];
            if (typeof predicate === "function") return;
            if (typeof predicate === "number") {
              predicate = predicate.toString();
            }
            if (typeof predicate === "string") {
              predicate = new RegExp(
                (0, _utilities.escapeValue)(predicate).replace(/\\/g, "\\\\")
              );
            }
            if (typeof predicate === "boolean") {
              predicate = predicate ? /(?:)/ : /.^/;
            }
            // check class-/attributename for regex
            ignore[type] = function (name, value) {
              return predicate.test(value);
            };
          });

          if (ignoreClass) {
            (function () {
              var ignoreAttribute = ignore.attribute;
              ignore.attribute = function (name, value, defaultPredicate) {
                return (
                  ignore.class(value) ||
                  (ignoreAttribute &&
                    ignoreAttribute(name, value, defaultPredicate))
                );
              };
            })();
          }

          while (element !== root) {
            if (skipChecks(element) !== true) {
              // ~ global
              if (checkAttributes(priority, element, ignore, path, root)) break;
              if (checkTag(element, ignore, path, root)) break;

              // ~ local
              checkAttributes(priority, element, ignore, path);
              if (path.length === length) {
                checkTag(element, ignore, path);
              }

              // define only one part each iteration
              if (path.length === length) {
                checkChilds(priority, element, ignore, path);
              }
            }

            element = element.parentNode;
            length = path.length;
          }

          if (element === root) {
            var pattern = findPattern(priority, element, ignore);
            path.unshift(pattern);
          }

          return path.join(" ");
        }

        /**
         * Extend path with attribute identifier
         *
         * @param  {Array.<string>} priority - [description]
         * @param  {HTMLElement}    element  - [description]
         * @param  {Object}         ignore   - [description]
         * @param  {Array.<string>} path     - [description]
         * @param  {HTMLElement}    parent   - [description]
         * @return {boolean}                 - [description]
         */
        function checkAttributes(priority, element, ignore, path) {
          var parent =
            arguments.length > 4 && arguments[4] !== undefined
              ? arguments[4]
              : element.parentNode;

          var pattern = findAttributesPattern(priority, element, ignore);
          if (pattern) {
            var matches = parent.querySelectorAll(pattern);
            if (matches.length === 1) {
              path.unshift(pattern);
              return true;
            }
          }
          return false;
        }

        /**
         * Lookup attribute identifier
         *
         * @param  {Array.<string>} priority - [description]
         * @param  {HTMLElement}    element  - [description]
         * @param  {Object}         ignore   - [description]
         * @return {string?}                 - [description]
         */
        function findAttributesPattern(priority, element, ignore) {
          var attributes = element.attributes;
          var sortedKeys = Object.keys(attributes).sort(function (curr, next) {
            var currPos = priority.indexOf(attributes[curr].name);
            var nextPos = priority.indexOf(attributes[next].name);
            if (nextPos === -1) {
              if (currPos === -1) {
                return 0;
              }
              return -1;
            }
            return currPos - nextPos;
          });

          for (var i = 0, l = sortedKeys.length; i < l; i++) {
            var key = sortedKeys[i];
            var attribute = attributes[key];
            var attributeName = attribute.name;
            var attributeValue = (0, _utilities.escapeValue)(attribute.value);

            var currentIgnore = ignore[attributeName] || ignore.attribute;
            var currentDefaultIgnore =
              defaultIgnore[attributeName] || defaultIgnore.attribute;
            if (
              checkIgnore(
                currentIgnore,
                attributeName,
                attributeValue,
                currentDefaultIgnore
              )
            ) {
              continue;
            }

            var pattern = "[" + attributeName + '="' + attributeValue + '"]';

            if (/\b\d/.test(attributeValue) === false) {
              if (attributeName === "id") {
                pattern = "#" + attributeValue;
              }

              if (attributeName === "class") {
                var className = attributeValue.trim().replace(/\s+/g, ".");
                pattern = "." + className;
              }
            }

            return pattern;
          }
          return null;
        }

        /**
         * Extend path with tag identifier
         *
         * @param  {HTMLElement}    element - [description]
         * @param  {Object}         ignore  - [description]
         * @param  {Array.<string>} path    - [description]
         * @param  {HTMLElement}    parent  - [description]
         * @return {boolean}                - [description]
         */
        function checkTag(element, ignore, path) {
          var parent =
            arguments.length > 3 && arguments[3] !== undefined
              ? arguments[3]
              : element.parentNode;

          var pattern = findTagPattern(element, ignore);
          if (pattern) {
            var matches = parent.getElementsByTagName(pattern);
            if (matches.length === 1) {
              path.unshift(pattern);
              return true;
            }
          }
          return false;
        }

        /**
         * Lookup tag identifier
         *
         * @param  {HTMLElement} element - [description]
         * @param  {Object}      ignore  - [description]
         * @return {boolean}             - [description]
         */
        function findTagPattern(element, ignore) {
          var tagName = element.tagName.toLowerCase();
          if (checkIgnore(ignore.tag, null, tagName)) {
            return null;
          }
          return tagName;
        }

        /**
         * Extend path with specific child identifier
         *
         * NOTE: 'childTags' is a custom property to use as a view filter for tags using 'adapter.js'
         *
         * @param  {Array.<string>} priority - [description]
         * @param  {HTMLElement}    element  - [description]
         * @param  {Object}         ignore   - [description]
         * @param  {Array.<string>} path     - [description]
         * @return {boolean}                 - [description]
         */
        function checkChilds(priority, element, ignore, path) {
          var parent = element.parentNode;
          var children = parent.childTags || parent.children;
          for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            if (child === element) {
              var childPattern = findPattern(priority, child, ignore);
              if (!childPattern) {
                return console.warn(
                  "\n          Element couldn't be matched through strict ignore pattern!\n        ",
                  child,
                  ignore,
                  childPattern
                );
              }
              var pattern = "> " + childPattern + ":nth-child(" + (i + 1) + ")";
              path.unshift(pattern);
              return true;
            }
          }
          return false;
        }

        /**
         * Lookup identifier
         *
         * @param  {Array.<string>} priority - [description]
         * @param  {HTMLElement}    element  - [description]
         * @param  {Object}         ignore   - [description]
         * @return {string}                  - [description]
         */
        function findPattern(priority, element, ignore) {
          var pattern = findAttributesPattern(priority, element, ignore);
          if (!pattern) {
            pattern = findTagPattern(element, ignore);
          }
          return pattern;
        }

        /**
         * Validate with custom and default functions
         *
         * @param  {Function} predicate        - [description]
         * @param  {string?}  name             - [description]
         * @param  {string}   value            - [description]
         * @param  {Function} defaultPredicate - [description]
         * @return {boolean}                   - [description]
         */
        function checkIgnore(predicate, name, value, defaultPredicate) {
          if (!value) {
            return true;
          }
          var check = predicate || defaultPredicate;
          if (!check) {
            return false;
          }
          return check(name, value, defaultPredicate);
        }
        module.exports = exports["default"];

        /***/
      },
      /* 6 */
      /***/ function (module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true,
        });
        exports.default =
          exports.common =
          exports.optimize =
          exports.getMultiSelector =
          exports.getSingleSelector =
          exports.select =
            undefined;

        var _select2 = __webpack_require__(4);

        Object.defineProperty(exports, "getSingleSelector", {
          enumerable: true,
          get: function get() {
            return _select2.getSingleSelector;
          },
        });
        Object.defineProperty(exports, "getMultiSelector", {
          enumerable: true,
          get: function get() {
            return _select2.getMultiSelector;
          },
        });

        var _select3 = _interopRequireDefault(_select2);

        var _optimize2 = __webpack_require__(2);

        var _optimize3 = _interopRequireDefault(_optimize2);

        var _common2 = __webpack_require__(1);

        var _common = _interopRequireWildcard(_common2);

        function _interopRequireWildcard(obj) {
          if (obj && obj.__esModule) {
            return obj;
          } else {
            var newObj = {};
            if (obj != null) {
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                  newObj[key] = obj[key];
              }
            }
            newObj.default = obj;
            return newObj;
          }
        }

        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : { default: obj };
        }

        exports.select = _select3.default;
        exports.optimize = _optimize3.default;
        exports.common = _common;
        exports.default = _select3.default;

        /***/
      },
      /******/
    ]
  );
});
