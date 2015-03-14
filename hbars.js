(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("hbars/compiler", ["exports", "module", "hbars/preprocessor", "hbars/parser", "hbars/generator"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("hbars/preprocessor"), require("hbars/parser"), require("hbars/generator"));
  }
})(function (exports, module, _hbarsPreprocessor, _hbarsParser, _hbarsGenerator) {
  "use strict";

  var preprocess = _hbarsPreprocessor.parse;
  var parse = _hbarsParser.parse;
  var generate = _hbarsGenerator.generate;

  var compile = function compile(haml) {
    var ast = parse(preprocess(haml));
    return generate(ast);
  };

  var Compiler = { compile: compile };

  module.exports = Compiler;
});
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("hbars/generator", ["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  }
})(function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var isArray = function isArray(thing) {
    if (Object.prototype.toString.call(thing) === "[object Array]") {
      return true;
    }
    return false;
  };

  var buildInlineContent = function buildInlineContent(contents) {
    var content = [];
    if (typeof contents === "string") {
      return contents;
    }
    contents.forEach(function (c) {
      if (typeof c === "string") {
        content.push(c);
      } else {
        content.push(build(c, 0));
      }
    });
    return content.join("");
  };

  var buildContent = function buildContent(node, indent) {
    var content = [];
    if (node.nodes) {
      node.nodes.forEach(function (n) {
        content.push(build(n, indent + 1));
      });
      content = [content.join("\n")];
    }
    return content.join("");
  };

  var buildExpression = function buildExpression(node, indent) {
    var lines = [];
    var indentStr = repeat("  ", indent);
    var expression = [indentStr, "{{", node.content, "}}"].join("");
    lines.push(expression);
    return lines;
  };

  var buildText = function buildText(node, indent) {
    var lines = [];
    var indentStr = repeat("  ", indent);
    var content = buildInlineContent(node.content);
    var text = indentStr + content;
    lines.push(text);
    return lines;
  };

  var buildString = function buildString(node) {
    return "\"" + buildText(node, 0) + "\"";
  };

  var buildBlockExpression = function buildBlockExpression(node, indent) {
    var lines = [];
    var content = buildContent(node, indent);
    var indentStr = repeat("  ", indent);
    var expression = [indentStr, "{{#", node.name, " ", node.content, "}}", "\n", content, "\n", indentStr, "{{/", node.name, "}}"].join("");
    lines.push(expression);
    return lines;
  };

  var buildMidBlockExpression = function buildMidBlockExpression(node, indent) {
    var lines = [];
    var indentStr = repeat("  ", indent - 1);
    var content = node.content ? " " + node.content : "";
    var expression = [indentStr, "{{", node.name, content, "}}"].join("");
    lines.push(expression);
    return lines;
  };

  var SELF_CLOSING_TAGS = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];

  var selfClosing = function selfClosing(tag) {
    return SELF_CLOSING_TAGS.indexOf(tag) !== -1;
  };

  var buildElement = function buildElement(node, indent) {
    var lines = [];
    var attributes = buildAttributes(node);
    var bindAttrs = buildAttributeBindings(node);
    var attributeHelpers = buildAttributeHelpers(node);
    var content;
    var indentStr = repeat("  ", indent);
    if (node.content) {
      content = buildInlineContent(node.content);
    } else {
      content = buildContent(node, indent);
      if (content && content.length > 0) {
        content = ["\n", buildContent(node, indent), "\n", indentStr].join("");
      }
    }
    var tag = [indentStr, "<", node.tag, attributes, bindAttrs, attributeHelpers];
    if (selfClosing(node.tag)) {
      tag = tag.concat([">"]);
    } else {
      tag = tag.concat([">", content, "</", node.tag, ">"]);
    }
    lines.push(tag.join(""));
    return lines;
  };

  var enclosedIn = function enclosedIn(str, char) {
    return str.substr(str.length - 1) === char;
  };

  var unquote = function unquote(str) {
    if (enclosedIn(str, "\"")) {
      str = str.substring(1, str.length - 1);
    }
    if (enclosedIn(str, "'")) {
      str = str.substring(1, str.length - 1);
    }
    return str;
  };

  var enquote = function enquote(str, char) {
    var quotes = char || "\"";
    if (char) {
      quotes = char;
    }
    return [quotes, unquote(str), quotes].join("");
  };

  var buildAttribute = function buildAttribute(key, value, quoted) {
    if (isArray(value)) {
      value = value.join(" ");
    }
    quoted = quoted || typeof quoted === "undefined";
    if (typeof value === "object") {
      value = build(value);
    }
    if (quoted) {
      value = enquote(value);
    }
    var attr = [" ", key, "=", value].join("");
    return attr;
  };

  var buildAttributeBindings = function buildAttributeBindings(node) {
    var attrs = [];
    if (node.attributeBindings) {
      Object.keys(node.attributeBindings).forEach(function (key) {
        var value = node.attributeBindings[key];
        attrs.push(buildAttribute(key, value, false));
      });
    }
    return attrs.join("");
  };

  var buildAttributeHelpers = function buildAttributeHelpers(node) {
    var helpers = [];
    if (node.helpers) {
      node.helpers.forEach(function (helper) {
        helpers.push(build(helper));
      });
    }
    if (helpers.length > 0) {
      return [" ", helpers.join("")].join("");
    }
    return "";
  };

  var buildAttributes = function buildAttributes(node) {
    var attrs = [];
    if (node.id) {
      attrs.push(buildAttribute("id", node.id));
    }
    if (node.attributes) {
      Object.keys(node.attributes).forEach(function (key) {
        var value = node.attributes[key];
        attrs.push(buildAttribute(key, value));
      });
    }
    return attrs.join("");
  };

  var repeat = function repeat(str, n) {
    return new Array(n + 1).join(str);
  };

  var build = function build(node, indent) {
    var lines;
    indent = indent || 0;
    switch (node.type) {
      case "element":
        lines = buildElement(node, indent);
        break;
      case "block_expression":
        lines = buildBlockExpression(node, indent);
        break;
      case "mid_block_expression":
        lines = buildMidBlockExpression(node, indent);
        break;
      case "expression":
        lines = buildExpression(node, indent);
        break;
      case "text":
        lines = buildText(node, indent);
        break;
      case "string":
        lines = buildString(node, indent);
        break;
    }
    return lines;
  };

  var generate = function generate(ast) {
    var lines = [];
    ast.forEach(function (node) {
      lines = lines.concat(build(node));
    });
    return lines.join("\n");
  };

  exports.generate = generate;
});
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("hbars/helpers", ["exports", "module"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module);
  }
})(function (exports, module) {
  "use strict";

  var helpers = {
    /* Wrap input in array if it not already wrapped in array */
    array: function array(input) {
      if (!helpers.isArray(input)) {
        input = [input];
      }
      return input;
    },
    /* Check if object is wrapped in array */
    isArray: function isArray(thing) {
      if (Object.prototype.toString.call(thing) === "[object Array]") {
        return true;
      }
      return false;
    },
    argsToArray: function argsToArray(args) {
      return [].slice.call(args);
    },
    /* merges a set of objects. If multiple have the same key
     * an array is created to contain all results */
    condense: function condense(objects) {
      var target = {},
          sources;
      if (helpers.isArray(objects)) {
        sources = objects;
      } else {
        sources = helpers.argsToArray(arguments);
      }
      sources.forEach(function (source) {
        for (var prop in source) {
          if (target[prop]) {
            target[prop] = helpers.array(target[prop]);
            target[prop].push(source[prop]);
          } else {
            target[prop] = source[prop];
          }
        }
      });
      return target;
    },
    /* remove undefined values in array */
    compact: function compact(arr) {
      if (!helpers.isArray(arr)) {
        return arr;
      } else {
        return arr.filter(function (elem) {
          return typeof elem !== "undefined";
        }).map(helpers.compact);
      }
    },
    objectHasProperties: function objectHasProperties(value) {
      return Object.keys(value).length > 0;
    },
    present: function present(value) {
      return typeof value !== "undefined" && value !== null;
    },
    /* add property to target if it is an array or a non-empty object */
    addProperty: function addProperty(target, key, value) {
      if (helpers.present(value) && (helpers.isArray(value) || helpers.objectHasProperties(value))) {
        target[key] = value;
      }
    },
    lastChar: function lastChar(str) {
      return str.slice(-1);
    }
  };

  module.exports = helpers;
});
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("hbars/parser", ["exports", "module", "hbars/helpers"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("hbars/helpers"));
  }
})(function (exports, module, _hbarsHelpers) {
  "use strict";

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  /*jshint ignore: start*/

  var util = _interopRequire(_hbarsHelpers);

  module.exports = (function () {
    /*
     * Generated by PEG.js 0.8.0.
     *
     * http://pegjs.majda.cz/
     */

    function peg$subclass(child, parent) {
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
    }

    function SyntaxError(message, expected, found, offset, line, column) {
      this.message = message;
      this.expected = expected;
      this.found = found;
      this.offset = offset;
      this.line = line;
      this.column = column;

      this.name = "SyntaxError";
    }

    peg$subclass(SyntaxError, Error);

    function parse(input) {
      var options = arguments.length > 1 ? arguments[1] : {},
          peg$FAILED = {},
          peg$startRuleFunctions = { elements: peg$parseelements },
          peg$startRuleFunction = peg$parseelements,
          peg$c0 = [],
          peg$c1 = { type: "other", description: "Mustache Content" },
          peg$c2 = peg$FAILED,
          peg$c3 = { type: "any", description: "any character" },
          peg$c4 = function peg$c4(c) {
        return c.join("");
      },
          peg$c5 = function peg$c5(b, c) {
        for (var i = 0; i < c.length; i++) {
          b.nodes = b.nodes.concat(c[i]);
        }
        return b;
      },
          peg$c6 = "else",
          peg$c7 = { type: "literal", value: "else", description: "\"else\"" },
          peg$c8 = null,
          peg$c9 = function peg$c9(name, m, b) {
        var e = { type: "mid_block_expression", name: name };
        if (m) {
          e.content = m;
        }
        var nodes = [e];
        if (b && b.length > 0) {
          nodes = nodes.concat(b[1]);
        }
        return nodes;
      },
          peg$c10 = function peg$c10(name, m, b) {
        var e = { type: "block_expression", name: name };
        if (m) {
          e.content = m;
        }
        if (b && b.length > 0) {
          e.nodes = b[1];
        }
        return e;
      },
          peg$c11 = function peg$c11(m) {
        return m;
      },
          peg$c12 = function peg$c12(m) {
        return { type: "expression", content: m };
      },
          peg$c13 = "-",
          peg$c14 = { type: "literal", value: "-", description: "\"-\"" },
          peg$c15 = "=",
          peg$c16 = { type: "literal", value: "=", description: "\"=\"" },
          peg$c17 = function peg$c17(a) {
        return { attributes: a };
      },
          peg$c18 = function peg$c18(b) {
        return { attributeBindings: b };
      },
          peg$c19 = function peg$c19(h) {
        return { helpers: h };
      },
          peg$c20 = function peg$c20(t, idClass, attrs, i) {
        return !!t || !!idClass.length;
      },
          peg$c21 = void 0,
          peg$c22 = function peg$c22(t, idClass, attrs, i) {
        var element = {
          type: "element",
          tag: t || "div"
        };
        var attributes = idClass;
        var addAtributes = util.condense(attrs);
        util.addProperty(element, "attributes", util.condense(attributes.concat(addAtributes.attributes)));
        util.addProperty(element, "attributeBindings", util.condense(addAtributes.attributeBindings));
        if (typeof addAtributes.helpers !== "undefined") {
          util.addProperty(element, "helpers", util.array(addAtributes.helpers));
        }
        if (i) {
          util.addProperty(element, "content", util.array(i));
        }
        return element;
      },
          peg$c23 = "(",
          peg$c24 = { type: "literal", value: "(", description: "\"(\"" },
          peg$c25 = ")",
          peg$c26 = { type: "literal", value: ")", description: "\")\"" },
          peg$c27 = function peg$c27(a) {
        return a;
      },
          peg$c28 = "{",
          peg$c29 = { type: "literal", value: "{", description: "\"{\"" },
          peg$c30 = /^[^}]/,
          peg$c31 = { type: "class", value: "[^}]", description: "[^}]" },
          peg$c32 = "}",
          peg$c33 = { type: "literal", value: "}", description: "\"}\"" },
          peg$c34 = function peg$c34(m) {
        return { type: "expression", content: m.join("") };
      },
          peg$c35 = { type: "other", description: "Bound Attribute List" },
          peg$c36 = function peg$c36(a) {
        return util.condense(a);
      },
          peg$c37 = { type: "other", description: "Attribute List" },
          peg$c38 = function peg$c38(k, v) {
        var attr = {};
        attr[k] = v;
        return attr;
      },
          peg$c39 = function peg$c39(c) {
        return { type: "expression", content: c };
      },
          peg$c40 = function peg$c40(e, b) {
        if (b && b.length > 0) {
          e.nodes = b[1];
        }
        return e;
      },
          peg$c41 = "#",
          peg$c42 = { type: "literal", value: "#", description: "\"#\"" },
          peg$c43 = function peg$c43(i) {
        return { id: i };
      },
          peg$c44 = "%",
          peg$c45 = { type: "literal", value: "%", description: "\"%\"" },
          peg$c46 = function peg$c46(t) {
        return t;
      },
          peg$c47 = ".",
          peg$c48 = { type: "literal", value: ".", description: "\".\"" },
          peg$c49 = function peg$c49(c) {
        return { "class": c };
      },
          peg$c50 = "'",
          peg$c51 = { type: "literal", value: "'", description: "\"'\"" },
          peg$c52 = function peg$c52(c) {
        return c;
      },
          peg$c53 = "\"",
          peg$c54 = { type: "literal", value: "\"", description: "\"\\\"\"" },
          peg$c55 = function peg$c55(chars) {
        return { type: "string", content: chars };
      },
          peg$c56 = function peg$c56(t) {
        if (t.length === 1 && typeof t[0] === "string") {
          return { type: "text", content: t[0] };
        }
        return { type: "text", content: t };
      },
          peg$c57 = function peg$c57(t) {
        var content = [];
        t.forEach(function (node) {
          content.push(node);
        });
        if (t.length === 1 && typeof t[0] === "string") {
          return t[0];
        }
        return content;
      },
          peg$c58 = function peg$c58(t) {
        var content = [];
        t.forEach(function (node) {
          content.push(node);
        });
        if (t.length === 1 && typeof t[0] === "string") {
          return t[0];
        }
        return { type: "string", content: content };
      },
          peg$c59 = "#{",
          peg$c60 = { type: "literal", value: "#{", description: "\"#{\"" },
          peg$c61 = function peg$c61(t) {
        return { type: "expression", content: t.join("") };
      },
          peg$c62 = function peg$c62(c) {
        return c;
      },
          peg$c63 = function peg$c63(t) {
        return t.join("");
      },
          peg$c64 = function peg$c64(i) {
        return i !== TERM_CHAR;
      },
          peg$c65 = function peg$c65(i) {
        return i;
      },
          peg$c66 = /^[^']/,
          peg$c67 = { type: "class", value: "[^']", description: "[^']" },
          peg$c68 = /^[^"]/,
          peg$c69 = { type: "class", value: "[^\"]", description: "[^\"]" },
          peg$c70 = function peg$c70(i) {
        return i.join("");
      },
          peg$c71 = function peg$c71(chars) {
        return chars.join("");
      },
          peg$c72 = /^[_a-z0-9\-]/i,
          peg$c73 = { type: "class", value: "[_a-z0-9\\-]i", description: "[_a-z0-9\\-]i" },
          peg$c74 = /^[%.=\-]/,
          peg$c75 = { type: "class", value: "[%.=\\-]", description: "[%.=\\-]" },
          peg$c76 = { type: "other", description: "INDENT" },
          peg$c77 = function peg$c77(i) {
        return i === INDENT_CHAR;
      },
          peg$c78 = function peg$c78(i) {
        return "";
      },
          peg$c79 = { type: "other", description: "DEDENT" },
          peg$c80 = function peg$c80(i) {
        return i === DEDENT_CHAR;
      },
          peg$c81 = { type: "other", description: "TERM" },
          peg$c82 = function peg$c82(i) {
        return i === TERM_CHAR;
      },
          peg$c83 = { type: "other", description: "required whitespace" },
          peg$c84 = { type: "other", description: "whitespace" },
          peg$c85 = /^[ \t\n\r]/,
          peg$c86 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
          peg$currPos = 0,
          peg$reportedPos = 0,
          peg$cachedPos = 0,
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
          peg$maxFailPos = 0,
          peg$maxFailExpected = [],
          peg$silentFails = 0,
          peg$result;

      if ("startRule" in options) {
        if (!(options.startRule in peg$startRuleFunctions)) {
          throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
        }

        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
      }

      function text() {
        return input.substring(peg$reportedPos, peg$currPos);
      }

      function offset() {
        return peg$reportedPos;
      }

      function line() {
        return peg$computePosDetails(peg$reportedPos).line;
      }

      function column() {
        return peg$computePosDetails(peg$reportedPos).column;
      }

      function expected(description) {
        throw peg$buildException(null, [{ type: "other", description: description }], peg$reportedPos);
      }

      function error(message) {
        throw peg$buildException(message, null, peg$reportedPos);
      }

      function peg$computePosDetails(pos) {
        function advance(details, startPos, endPos) {
          var p, ch;

          for (p = startPos; p < endPos; p++) {
            ch = input.charAt(p);
            if (ch === "\n") {
              if (!details.seenCR) {
                details.line++;
              }
              details.column = 1;
              details.seenCR = false;
            } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
              details.line++;
              details.column = 1;
              details.seenCR = true;
            } else {
              details.column++;
              details.seenCR = false;
            }
          }
        }

        if (peg$cachedPos !== pos) {
          if (peg$cachedPos > pos) {
            peg$cachedPos = 0;
            peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
          }
          advance(peg$cachedPosDetails, peg$cachedPos, pos);
          peg$cachedPos = pos;
        }

        return peg$cachedPosDetails;
      }

      function peg$fail(expected) {
        if (peg$currPos < peg$maxFailPos) {
          return;
        }

        if (peg$currPos > peg$maxFailPos) {
          peg$maxFailPos = peg$currPos;
          peg$maxFailExpected = [];
        }

        peg$maxFailExpected.push(expected);
      }

      function peg$buildException(message, expected, pos) {
        function cleanupExpected(expected) {
          var i = 1;

          expected.sort(function (a, b) {
            if (a.description < b.description) {
              return -1;
            } else if (a.description > b.description) {
              return 1;
            } else {
              return 0;
            }
          });

          while (i < expected.length) {
            if (expected[i - 1] === expected[i]) {
              expected.splice(i, 1);
            } else {
              i++;
            }
          }
        }

        function buildMessage(expected, found) {
          function stringEscape(s) {
            function hex(ch) {
              return ch.charCodeAt(0).toString(16).toUpperCase();
            }

            return s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) {
              return "\\x0" + hex(ch);
            }).replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) {
              return "\\x" + hex(ch);
            }).replace(/[\u0180-\u0FFF]/g, function (ch) {
              return "\\u0" + hex(ch);
            }).replace(/[\u1080-\uFFFF]/g, function (ch) {
              return "\\u" + hex(ch);
            });
          }

          var expectedDescs = new Array(expected.length),
              expectedDesc,
              foundDesc,
              i;

          for (i = 0; i < expected.length; i++) {
            expectedDescs[i] = expected[i].description;
          }

          expectedDesc = expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[expected.length - 1] : expectedDescs[0];

          foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

          return "Expected " + expectedDesc + " but " + foundDesc + " found.";
        }

        var posDetails = peg$computePosDetails(pos),
            found = pos < input.length ? input.charAt(pos) : null;

        if (expected !== null) {
          cleanupExpected(expected);
        }

        return new SyntaxError(message !== null ? message : buildMessage(expected, found), expected, found, pos, posDetails.line, posDetails.column);
      }

      function peg$parseelements() {
        var s0, s1;

        s0 = [];
        s1 = peg$parseblockElement();
        if (s1 === peg$FAILED) {
          s1 = peg$parsemustache();
          if (s1 === peg$FAILED) {
            s1 = peg$parsetextLine();
          }
        }
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parseblockElement();
          if (s1 === peg$FAILED) {
            s1 = peg$parsemustache();
            if (s1 === peg$FAILED) {
              s1 = peg$parsetextLine();
            }
          }
        }

        return s0;
      }

      function peg$parsemustacheContent() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        if (input.length > peg$currPos) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c3);
          }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (input.length > peg$currPos) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c3);
              }
            }
          }
        } else {
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c4(s1);
        }
        s0 = s1;
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c1);
          }
        }

        return s0;
      }

      function peg$parsemustache() {
        var s0;

        s0 = peg$parseblockWithElseChain();
        if (s0 === peg$FAILED) {
          s0 = peg$parseblockExpression();
          if (s0 === peg$FAILED) {
            s0 = peg$parsefullLineMustacheExpression();
          }
        }

        return s0;
      }

      function peg$parseblockWithElseChain() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        s1 = peg$parseblockExpression();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseelseExpression();
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parseelseExpression();
            }
          } else {
            s2 = peg$c2;
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c5(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseelseExpression() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsedash();
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              if (input.substr(peg$currPos, 4) === peg$c6) {
                s4 = peg$c6;
                peg$currPos += 4;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c7);
                }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsetext();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c8;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parse_();
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parseTERM();
                      if (s8 !== peg$FAILED) {
                        s9 = peg$currPos;
                        s10 = peg$parseINDENT();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parseelements();
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parseDEDENT();
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parseTERM();
                              if (s13 === peg$FAILED) {
                                s13 = peg$c8;
                              }
                              if (s13 !== peg$FAILED) {
                                s10 = [s10, s11, s12, s13];
                                s9 = s10;
                              } else {
                                peg$currPos = s9;
                                s9 = peg$c2;
                              }
                            } else {
                              peg$currPos = s9;
                              s9 = peg$c2;
                            }
                          } else {
                            peg$currPos = s9;
                            s9 = peg$c2;
                          }
                        } else {
                          peg$currPos = s9;
                          s9 = peg$c2;
                        }
                        if (s9 === peg$FAILED) {
                          s9 = peg$c8;
                        }
                        if (s9 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c9(s4, s6, s9);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c2;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseblockExpression() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsedash();
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              s4 = peg$parsename();
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsetext();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c8;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parse_();
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parseTERM();
                      if (s8 !== peg$FAILED) {
                        s9 = peg$currPos;
                        s10 = peg$parseINDENT();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parseelements();
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parseDEDENT();
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parseTERM();
                              if (s13 === peg$FAILED) {
                                s13 = peg$c8;
                              }
                              if (s13 !== peg$FAILED) {
                                s10 = [s10, s11, s12, s13];
                                s9 = s10;
                              } else {
                                peg$currPos = s9;
                                s9 = peg$c2;
                              }
                            } else {
                              peg$currPos = s9;
                              s9 = peg$c2;
                            }
                          } else {
                            peg$currPos = s9;
                            s9 = peg$c2;
                          }
                        } else {
                          peg$currPos = s9;
                          s9 = peg$c2;
                        }
                        if (s9 === peg$FAILED) {
                          s9 = peg$c8;
                        }
                        if (s9 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c10(s4, s6, s9);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c2;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parsefullLineMustacheExpression() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        s1 = peg$parsemustacheExpression();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseTERM();
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c11(s1);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parsemustacheExpression() {
        var s0, s1, s2, s3, s4;

        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseequal();
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              s4 = peg$parsetext();
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c12(s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parsedash() {
        var s0;

        if (input.charCodeAt(peg$currPos) === 45) {
          s0 = peg$c13;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c14);
          }
        }

        return s0;
      }

      function peg$parseequal() {
        var s0;

        if (input.charCodeAt(peg$currPos) === 61) {
          s0 = peg$c15;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c16);
          }
        }

        return s0;
      }

      function peg$parseelement() {
        var s0, s1, s2, s3, s4, s5, s6, s7;

        s0 = peg$currPos;
        s1 = peg$parsetag();
        if (s1 === peg$FAILED) {
          s1 = peg$c8;
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseid();
          if (s3 === peg$FAILED) {
            s3 = peg$parseclass();
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseid();
            if (s3 === peg$FAILED) {
              s3 = peg$parseclass();
            }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$currPos;
              s6 = peg$parseattributes();
              if (s6 !== peg$FAILED) {
                peg$reportedPos = s5;
                s6 = peg$c17(s6);
              }
              s5 = s6;
              if (s5 === peg$FAILED) {
                s5 = peg$currPos;
                s6 = peg$parseattributeBindings();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s5;
                  s6 = peg$c18(s6);
                }
                s5 = s6;
                if (s5 === peg$FAILED) {
                  s5 = peg$currPos;
                  s6 = peg$parseattributeHelper();
                  if (s6 !== peg$FAILED) {
                    peg$reportedPos = s5;
                    s6 = peg$c19(s6);
                  }
                  s5 = s6;
                }
              }
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                s6 = peg$parseattributes();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s5;
                  s6 = peg$c17(s6);
                }
                s5 = s6;
                if (s5 === peg$FAILED) {
                  s5 = peg$currPos;
                  s6 = peg$parseattributeBindings();
                  if (s6 !== peg$FAILED) {
                    peg$reportedPos = s5;
                    s6 = peg$c18(s6);
                  }
                  s5 = s6;
                  if (s5 === peg$FAILED) {
                    s5 = peg$currPos;
                    s6 = peg$parseattributeHelper();
                    if (s6 !== peg$FAILED) {
                      peg$reportedPos = s5;
                      s6 = peg$c19(s6);
                    }
                    s5 = s6;
                  }
                }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsemustacheExpression();
                  if (s6 === peg$FAILED) {
                    s6 = peg$parseinlineText();
                  }
                  if (s6 === peg$FAILED) {
                    s6 = peg$c8;
                  }
                  if (s6 !== peg$FAILED) {
                    peg$reportedPos = peg$currPos;
                    s7 = peg$c20(s1, s2, s4, s6);
                    if (s7) {
                      s7 = peg$c21;
                    } else {
                      s7 = peg$c2;
                    }
                    if (s7 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c22(s1, s2, s4, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseattributes() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 40) {
          s1 = peg$c23;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c24);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseattributeList();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 41) {
              s3 = peg$c25;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c26);
              }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c27(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseattributeHelper() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c28;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c29);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = [];
            if (peg$c30.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c31);
              }
            }
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c30.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c31);
                }
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 125) {
                  s5 = peg$c32;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c33);
                  }
                }
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c34(s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseattributeBindings() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c28;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c29);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseboundAttributeList();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 125) {
              s3 = peg$c32;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c33);
              }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c27(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseboundAttributeList() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseboundAttribute();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseboundAttribute();
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c36(s1);
        }
        s0 = s1;
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c35);
          }
        }

        return s0;
      }

      function peg$parseattributeList() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseattribute();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseattribute();
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c36(s1);
        }
        s0 = s1;
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c37);
          }
        }

        return s0;
      }

      function peg$parseboundAttribute() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsename();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s3 = peg$c15;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c16);
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parseidentChainExpression();
              if (s4 === peg$FAILED) {
                s4 = peg$parsedoubleQuotedInterpolation();
                if (s4 === peg$FAILED) {
                  s4 = peg$parsequoted();
                }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c38(s2, s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseidentChainExpression() {
        var s0, s1;

        s0 = peg$currPos;
        s1 = peg$parseidentChain();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c39(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parseattribute() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsename();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s3 = peg$c15;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c16);
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parseidentChain();
              if (s4 === peg$FAILED) {
                s4 = peg$parsequoted();
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c38(s2, s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseblockElement() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8;

        s0 = peg$currPos;
        s1 = peg$parseelement();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseTERM();
            if (s3 !== peg$FAILED) {
              s4 = peg$currPos;
              s5 = peg$parseINDENT();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseelements();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseDEDENT();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseTERM();
                    if (s8 === peg$FAILED) {
                      s8 = peg$c8;
                    }
                    if (s8 !== peg$FAILED) {
                      s5 = [s5, s6, s7, s8];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c2;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c2;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c2;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c2;
              }
              if (s4 === peg$FAILED) {
                s4 = peg$c8;
              }
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c40(s1, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseid() {
        var s0, s1, s2;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 35) {
          s1 = peg$c41;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c42);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsename();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c43(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parsetag() {
        var s0, s1, s2;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 37) {
          s1 = peg$c44;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c45);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsename();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c46(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseclass() {
        var s0, s1, s2;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
          s1 = peg$c47;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c48);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsename();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c49(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parsequoted() {
        var s0, s1, s2, s3, s4;

        s0 = peg$currPos;
        s1 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s2 = peg$c50;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c51);
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsesingleQuoteContent();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s4 = peg$c50;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c51);
              }
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s1;
              s2 = peg$c52(s3);
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
        if (s1 === peg$FAILED) {
          s1 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 34) {
            s2 = peg$c53;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c54);
            }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsedoubleQuoteContent();
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 34) {
                s4 = peg$c53;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c54);
                }
              }
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s1;
                s2 = peg$c52(s3);
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c55(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parsetextLine() {
        var s0, s1, s2, s3, s4, s5, s6;

        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          peg$silentFails++;
          s3 = peg$parsenonTextStart();
          peg$silentFails--;
          if (s3 === peg$FAILED) {
            s2 = peg$c21;
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$parseinterpolation();
              if (s5 === peg$FAILED) {
                s5 = peg$parseinterpolationText();
              }
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parseinterpolation();
                if (s5 === peg$FAILED) {
                  s5 = peg$parseinterpolationText();
                }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parseTERM();
                  if (s6 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c56(s4);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseinlineText() {
        var s0, s1, s2, s3, s4;

        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$parsenonInlineTextStart();
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = peg$c21;
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseinterpolation();
            if (s4 === peg$FAILED) {
              s4 = peg$parseinterpolationText();
            }
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseinterpolation();
              if (s4 === peg$FAILED) {
                s4 = peg$parseinterpolationText();
              }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c57(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parsedoubleQuotedInterpolation() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 34) {
          s1 = peg$c53;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c54);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseinterpolation();
          if (s3 === peg$FAILED) {
            s3 = peg$parsequotedInterpolationText();
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseinterpolation();
            if (s3 === peg$FAILED) {
              s3 = peg$parsequotedInterpolationText();
            }
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 34) {
              s3 = peg$c53;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c54);
              }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c58(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parsequotedInterpolationText() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 34) {
          s3 = peg$c53;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c54);
          }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c21;
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseinterpolationText();
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c4(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parseinterpolation() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c59) {
          s1 = peg$c59;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c60);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          if (peg$c30.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c31);
            }
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c30.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c31);
              }
            }
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 125) {
              s3 = peg$c32;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c33);
              }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c61(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parseinterpolationText() {
        var s0, s1, s2, s3, s4;

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$currPos;
        s3 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c59) {
          s4 = peg$c59;
          peg$currPos += 2;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c60);
          }
        }
        peg$silentFails--;
        if (s4 === peg$FAILED) {
          s3 = peg$c21;
        } else {
          peg$currPos = s3;
          s3 = peg$c2;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parsetextChar();
          if (s4 !== peg$FAILED) {
            peg$reportedPos = s2;
            s3 = peg$c62(s4);
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$currPos;
            s3 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c59) {
              s4 = peg$c59;
              peg$currPos += 2;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c60);
              }
            }
            peg$silentFails--;
            if (s4 === peg$FAILED) {
              s3 = peg$c21;
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parsetextChar();
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s2;
                s3 = peg$c62(s4);
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          }
        } else {
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c63(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parsetext() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsetextChar();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsetextChar();
          }
        } else {
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c63(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parsetextChar() {
        var s0, s1, s2;

        s0 = peg$currPos;
        if (input.length > peg$currPos) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c3);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = peg$currPos;
          s2 = peg$c64(s1);
          if (s2) {
            s2 = peg$c21;
          } else {
            s2 = peg$c2;
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c65(s1);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      function peg$parsesingleQuoteContent() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsesingleQuoteChar();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsesingleQuoteChar();
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c4(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parsedoubleQuoteContent() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsedoubleQuoteChar();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsedoubleQuoteChar();
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c4(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parsesingleQuoteChar() {
        var s0;

        if (peg$c66.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c67);
          }
        }

        return s0;
      }

      function peg$parsedoubleQuoteChar() {
        var s0;

        if (peg$c68.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c69);
          }
        }

        return s0;
      }

      function peg$parseidentChain() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsename();
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 46) {
            s2 = peg$c47;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c48);
            }
          }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsename();
            if (s2 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 46) {
                s2 = peg$c47;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c48);
                }
              }
            }
          }
        } else {
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c70(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parsename() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsenameChar();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsenameChar();
          }
        } else {
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c71(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parsenameChar() {
        var s0;

        if (peg$c72.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c73);
          }
        }

        return s0;
      }

      function peg$parsenonTextChar() {
        var s0;

        s0 = peg$parseTERM();
        if (s0 === peg$FAILED) {
          s0 = peg$parseDEDENT();
          if (s0 === peg$FAILED) {
            s0 = peg$parseINDENT();
            if (s0 === peg$FAILED) {
              s0 = peg$parseEOF();
            }
          }
        }

        return s0;
      }

      function peg$parsenonInlineTextStart() {
        var s0;

        if (peg$c74.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c75);
          }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseTERM();
          if (s0 === peg$FAILED) {
            s0 = peg$parseDEDENT();
          }
        }

        return s0;
      }

      function peg$parsenonTextStart() {
        var s0;

        if (peg$c74.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c75);
          }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseTERM();
          if (s0 === peg$FAILED) {
            s0 = peg$parseDEDENT();
          }
        }

        return s0;
      }

      function peg$parseINDENT() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        if (input.length > peg$currPos) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c3);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = peg$currPos;
          s2 = peg$c77(s1);
          if (s2) {
            s2 = peg$c21;
          } else {
            s2 = peg$c2;
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c78(s1);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c76);
          }
        }

        return s0;
      }

      function peg$parseDEDENT() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        if (input.length > peg$currPos) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c3);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = peg$currPos;
          s2 = peg$c80(s1);
          if (s2) {
            s2 = peg$c21;
          } else {
            s2 = peg$c2;
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c78(s1);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c79);
          }
        }

        return s0;
      }

      function peg$parseTERM() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        if (input.length > peg$currPos) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c3);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = peg$currPos;
          s2 = peg$c82(s1);
          if (s2) {
            s2 = peg$c21;
          } else {
            s2 = peg$c2;
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c78(s1);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c81);
          }
        }

        return s0;
      }

      function peg$parse__() {
        var s0, s1;

        peg$silentFails++;
        s0 = [];
        s1 = peg$parsewhitespace();
        if (s1 !== peg$FAILED) {
          while (s1 !== peg$FAILED) {
            s0.push(s1);
            s1 = peg$parsewhitespace();
          }
        } else {
          s0 = peg$c2;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c83);
          }
        }

        return s0;
      }

      function peg$parse_() {
        var s0, s1;

        peg$silentFails++;
        s0 = [];
        s1 = peg$parsewhitespace();
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parsewhitespace();
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c84);
          }
        }

        return s0;
      }

      function peg$parsewhitespace() {
        var s0;

        if (peg$c85.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c86);
          }
        }

        return s0;
      }

      function peg$parseEOF() {
        var s0, s1;

        s0 = peg$currPos;
        peg$silentFails++;
        if (input.length > peg$currPos) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c3);
          }
        }
        peg$silentFails--;
        if (s1 === peg$FAILED) {
          s0 = peg$c21;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        return s0;
      }

      var INDENT_CHAR = options.INDENT_CHAR || "",
          DEDENT_CHAR = options.DEDENT_CHAR || "",
          TERM_CHAR = options.TERM_CHAR || "";

      peg$result = peg$startRuleFunction();

      if (peg$result !== peg$FAILED && peg$currPos === input.length) {
        return peg$result;
      } else {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
          peg$fail({ type: "end", description: "end of input" });
        }

        throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
      }
    }

    return {
      SyntaxError: SyntaxError,
      parse: parse
    };
  })()
  /*jshint ignore: end*/
  ;
});
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("hbars/preprocessor", ["exports", "module", "hbars/helpers"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("hbars/helpers"));
  }
})(function (exports, module, _hbarsHelpers) {
  "use strict";

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  /*jshint ignore: start*/

  var util = _interopRequire(_hbarsHelpers);

  module.exports = (function () {
    /*
     * Generated by PEG.js 0.8.0.
     *
     * http://pegjs.majda.cz/
     */

    function peg$subclass(child, parent) {
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
    }

    function SyntaxError(message, expected, found, offset, line, column) {
      this.message = message;
      this.expected = expected;
      this.found = found;
      this.offset = offset;
      this.line = line;
      this.column = column;

      this.name = "SyntaxError";
    }

    peg$subclass(SyntaxError, Error);

    function parse(input) {
      var options = arguments.length > 1 ? arguments[1] : {},
          peg$FAILED = {},
          peg$startRuleFunctions = { start: peg$parsestart },
          peg$startRuleFunction = peg$parsestart,
          peg$c0 = peg$FAILED,
          peg$c1 = null,
          peg$c2 = [],
          peg$c3 = function peg$c3(l) {
        var lines = util.compact(l).map(function (line) {
          if (util.lastChar(line) !== DEDENT_CHAR) {
            line = line + TERM_CHAR;
          }
          return line;
        });
        return lines.join("");
      },
          peg$c4 = function peg$c4() {
        return;
      },
          peg$c5 = void 0,
          peg$c6 = { type: "any", description: "any character" },
          peg$c7 = function peg$c7(c) {
        return c;
      },
          peg$c8 = function peg$c8(i, c, d) {
        var out = "";
        if (i) {
          out = out + TERM_CHAR + i;
        }
        out = out + c.join(TERM_CHAR);
        if (d) {
          if (util.lastChar(out) !== DEDENT_CHAR) {
            out = out + TERM_CHAR;
          }
          out = out + d;
        }
        return out;
      },
          peg$c9 = function peg$c9(line, children) {
        var out = line.join("");
        if (children) {
          out = out + children;
        }
        return out;
      },
          peg$c10 = "\r\n",
          peg$c11 = { type: "literal", value: "\r\n", description: "\"\\r\\n\"" },
          peg$c12 = "\n",
          peg$c13 = { type: "literal", value: "\n", description: "\"\\n\"" },
          peg$c14 = "\r",
          peg$c15 = { type: "literal", value: "\r", description: "\"\\r\"" },
          peg$c16 = /^[ \t]/,
          peg$c17 = { type: "class", value: "[ \\t]", description: "[ \\t]" },
          peg$c18 = function peg$c18(i) {
        return i.join("") === indent;
      },
          peg$c19 = { type: "other", description: "INDENT" },
          peg$c20 = function peg$c20(i) {
        return i.length > indent.length;
      },
          peg$c21 = function peg$c21(i) {
        indentStack.push(indent);
        indent = i.join("");
        peg$currPos = offset();
      },
          peg$c22 = function peg$c22() {
        return INDENT_CHAR;
      },
          peg$c23 = { type: "other", description: "DEDENT" },
          peg$c24 = function peg$c24() {
        indent = indentStack.pop();
        return DEDENT_CHAR;
      },
          peg$currPos = 0,
          peg$reportedPos = 0,
          peg$cachedPos = 0,
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
          peg$maxFailPos = 0,
          peg$maxFailExpected = [],
          peg$silentFails = 0,
          peg$result;

      if ("startRule" in options) {
        if (!(options.startRule in peg$startRuleFunctions)) {
          throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
        }

        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
      }

      function text() {
        return input.substring(peg$reportedPos, peg$currPos);
      }

      function offset() {
        return peg$reportedPos;
      }

      function line() {
        return peg$computePosDetails(peg$reportedPos).line;
      }

      function column() {
        return peg$computePosDetails(peg$reportedPos).column;
      }

      function expected(description) {
        throw peg$buildException(null, [{ type: "other", description: description }], peg$reportedPos);
      }

      function error(message) {
        throw peg$buildException(message, null, peg$reportedPos);
      }

      function peg$computePosDetails(pos) {
        function advance(details, startPos, endPos) {
          var p, ch;

          for (p = startPos; p < endPos; p++) {
            ch = input.charAt(p);
            if (ch === "\n") {
              if (!details.seenCR) {
                details.line++;
              }
              details.column = 1;
              details.seenCR = false;
            } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
              details.line++;
              details.column = 1;
              details.seenCR = true;
            } else {
              details.column++;
              details.seenCR = false;
            }
          }
        }

        if (peg$cachedPos !== pos) {
          if (peg$cachedPos > pos) {
            peg$cachedPos = 0;
            peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
          }
          advance(peg$cachedPosDetails, peg$cachedPos, pos);
          peg$cachedPos = pos;
        }

        return peg$cachedPosDetails;
      }

      function peg$fail(expected) {
        if (peg$currPos < peg$maxFailPos) {
          return;
        }

        if (peg$currPos > peg$maxFailPos) {
          peg$maxFailPos = peg$currPos;
          peg$maxFailExpected = [];
        }

        peg$maxFailExpected.push(expected);
      }

      function peg$buildException(message, expected, pos) {
        function cleanupExpected(expected) {
          var i = 1;

          expected.sort(function (a, b) {
            if (a.description < b.description) {
              return -1;
            } else if (a.description > b.description) {
              return 1;
            } else {
              return 0;
            }
          });

          while (i < expected.length) {
            if (expected[i - 1] === expected[i]) {
              expected.splice(i, 1);
            } else {
              i++;
            }
          }
        }

        function buildMessage(expected, found) {
          function stringEscape(s) {
            function hex(ch) {
              return ch.charCodeAt(0).toString(16).toUpperCase();
            }

            return s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) {
              return "\\x0" + hex(ch);
            }).replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) {
              return "\\x" + hex(ch);
            }).replace(/[\u0180-\u0FFF]/g, function (ch) {
              return "\\u0" + hex(ch);
            }).replace(/[\u1080-\uFFFF]/g, function (ch) {
              return "\\u" + hex(ch);
            });
          }

          var expectedDescs = new Array(expected.length),
              expectedDesc,
              foundDesc,
              i;

          for (i = 0; i < expected.length; i++) {
            expectedDescs[i] = expected[i].description;
          }

          expectedDesc = expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[expected.length - 1] : expectedDescs[0];

          foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

          return "Expected " + expectedDesc + " but " + foundDesc + " found.";
        }

        var posDetails = peg$computePosDetails(pos),
            found = pos < input.length ? input.charAt(pos) : null;

        if (expected !== null) {
          cleanupExpected(expected);
        }

        return new SyntaxError(message !== null ? message : buildMessage(expected, found), expected, found, pos, posDetails.line, posDetails.column);
      }

      function peg$parsestart() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        s1 = peg$parseINDENT();
        if (s1 === peg$FAILED) {
          s1 = peg$c1;
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseline();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseline();
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c3(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }

        return s0;
      }

      function peg$parseline() {
        var s0, s1, s2, s3, s4, s5, s6, s7;

        s0 = peg$currPos;
        s1 = peg$parseEOL();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c4();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseSAMEDENT();
          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$parseEOL();
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = peg$c5;
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c6);
                }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c7(s5);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
            if (s3 !== peg$FAILED) {
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                s5 = peg$parseEOL();
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                  s4 = peg$c5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
                if (s4 !== peg$FAILED) {
                  if (input.length > peg$currPos) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c6);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    peg$reportedPos = s3;
                    s4 = peg$c7(s5);
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
            } else {
              s2 = peg$c0;
            }
            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$parseEOL();
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parseEOL();
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$currPos;
                s5 = peg$parseINDENT();
                if (s5 !== peg$FAILED) {
                  s6 = [];
                  s7 = peg$parseline();
                  while (s7 !== peg$FAILED) {
                    s6.push(s7);
                    s7 = peg$parseline();
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseDEDENT();
                    if (s7 !== peg$FAILED) {
                      peg$reportedPos = s4;
                      s5 = peg$c8(s5, s6, s7);
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
                if (s4 === peg$FAILED) {
                  s4 = peg$c1;
                }
                if (s4 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c9(s2, s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        }

        return s0;
      }

      function peg$parseEOL() {
        var s0;

        if (input.substr(peg$currPos, 2) === peg$c10) {
          s0 = peg$c10;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c11);
          }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 10) {
            s0 = peg$c12;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c13);
            }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 13) {
              s0 = peg$c14;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c15);
              }
            }
          }
        }

        return s0;
      }

      function peg$parseSAMEDENT() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = [];
        if (peg$c16.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c17);
          }
        }
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c16.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c17);
            }
          }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = peg$currPos;
          s2 = peg$c18(s1);
          if (s2) {
            s2 = peg$c5;
          } else {
            s2 = peg$c0;
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }

        return s0;
      }

      function peg$parseINDENT() {
        var s0, s1, s2, s3, s4;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$currPos;
        s3 = [];
        if (peg$c16.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c17);
          }
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c16.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c17);
              }
            }
          }
        } else {
          s3 = peg$c0;
        }
        if (s3 !== peg$FAILED) {
          peg$reportedPos = peg$currPos;
          s4 = peg$c20(s3);
          if (s4) {
            s4 = peg$c5;
          } else {
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            peg$reportedPos = s2;
            s3 = peg$c21(s3);
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        peg$silentFails--;
        if (s2 !== peg$FAILED) {
          peg$currPos = s1;
          s1 = peg$c5;
        } else {
          s1 = peg$c0;
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c22();
        }
        s0 = s1;
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c19);
          }
        }

        return s0;
      }

      function peg$parseDEDENT() {
        var s0, s1;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c24();
        }
        s0 = s1;
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c23);
          }
        }

        return s0;
      }

      var indentStack = [],
          indent = "",
          INDENT_CHAR = options.INDENT_CHAR || "",
          DEDENT_CHAR = options.DEDENT_CHAR || "",
          TERM_CHAR = options.TERM_CHAR || "";

      peg$result = peg$startRuleFunction();

      if (peg$result !== peg$FAILED && peg$currPos === input.length) {
        return peg$result;
      } else {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
          peg$fail({ type: "end", description: "end of input" });
        }

        throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
      }
    }

    return {
      SyntaxError: SyntaxError,
      parse: parse
    };
  })()
  /*jshint ignore: end*/
  ;
});