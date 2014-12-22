define(
  "compiler",
  ["preprocessor", "parser", "generator", "exports"],
  function(preprocessor$$, parser$$, generator$$, __exports__) {
    "use strict";

    function __es6_export__(name, value) {
      __exports__[name] = value;
    }

    var preprocess;
    preprocess = preprocessor$$["parse"];
    var parse;
    parse = parser$$["parse"];
    var generate;
    generate = generator$$["generate"];

    var compile = function(haml){
      var ast = parse(preprocess(haml));
      return generate(ast);
    };

    var Compiler = { compile: compile };

    __es6_export__("default", Compiler);
  }
);

//# sourceMappingURL=compiler.js.map
define("generator", ["exports"], function(__exports__) {
  "use strict";

  function __es6_export__(name, value) {
    __exports__[name] = value;
  }

  var isArray = function(thing) {
    if( Object.prototype.toString.call(thing) === '[object Array]' ) {
      return true;
    }
    return false;
  };

  var buildInlineContent = function(contents) {
    var content = [];
    if(typeof(contents) === 'string'){
      return contents;
    }
    contents.forEach(function(c){
      if(typeof(c) === 'string'){
        content.push(c);
      }else{
        content.push(build(c, 0));
      }
    });
    return content.join('');
  };

  var buildContent = function(node, indent) {
    var content = [];
    if(node.nodes){
      content.push('\n');
      node.nodes.forEach(function(n){
        content.push(build(n, indent + 1));
      });
      content.push('\n');
    }
    return content.join('');
  };

  var buildExpression = function(node, indent) {
    var lines = [];
    var indentStr = repeat('  ', indent);
    var expression = [indentStr, '{{', node.content, '}}'].join('');
    lines.push(expression);
    return lines;
  };

  var buildText = function(node, indent) {
    var lines = [];
    var indentStr = repeat('  ', indent);
    var text = indentStr + node.content;
    lines.push(text);
    return lines;
  };

  var buildBlockExpression = function(node, indent) {
    var lines = [];
    var content = buildContent(node, indent);
    var indentStr = repeat('  ', indent);
    var expression = [indentStr, '{{#', node.name, ' ', node.content, '}}', content,
                indentStr, '{{/',node.name,'}}'].join('');
    lines.push(expression);
    return lines;
  };

  var buildMidBlockExpression = function(node, indent) {
    var lines = [];
    var indentStr = repeat('  ', indent - 1);
    var expression = ['\n', indentStr, '{{', node.name, '}}', '\n'].join('');
    lines.push(expression);
    return lines;
  };

  var buildElement = function(node, indent) {
    var lines = [];
    var attributes = buildAttributes(node);
    var bindAttrs = buildAttributeBindings(node);
    var content;
    if(node.content){
      content = buildInlineContent(node.content);
    }else{
      content = buildContent(node, indent);
    }
    var indentStr = repeat('  ', indent);
    var tag = [indentStr, '<', node.tag, attributes, bindAttrs, '>', content,
                '</',node.tag,'>'].join('');
    lines.push(tag);
    return lines;
  };

  var buildAttribute = function(key, value, quoted){
    var quotes = '"';
    if(typeof(quoted) === 'undefined'){
      quoted = true;
    }
    if(!quoted){
      quotes = '';
    }
    if(isArray(value)){
      value = value.join(' ');
    }
    return [' ', key, '=', quotes, value, quotes].join('');
  };

  var buildAttributeBindings = function(node) {
    var attrs = [];
    if(node.attributeBindings){
      Object.keys(node.attributeBindings).forEach(function(key){
        var value = node.attributeBindings[key];
        attrs.push(buildAttribute(key, value, false));
      });
    }
    if(attrs.length > 0){
      return [' ', '{{', 'bind-attr'].concat(attrs).concat(['}}']).join('');
    }
    return '';
  };

  var  buildAttributes = function(node) {
    var attrs = [];
    if(node.id){
      attrs.push(buildAttribute('id', node.id));
    }
    if(node.attributes){
      Object.keys(node.attributes).forEach(function(key){
        var value = node.attributes[key];
        attrs.push(buildAttribute(key, value));
      });
    }
    return attrs.join('');
  };

  var repeat = function(str, n) {
    return new Array( n + 1 ).join(str);
  };

  var build = function(node, indent){
    var lines;
    indent = indent || 0;
    switch(node.type){
      case 'element':
        lines = buildElement(node, indent);
        break;
      case 'block_expression':
        lines = buildBlockExpression(node, indent);
        break;
      case 'mid_block_expression':
        lines = buildMidBlockExpression(node, indent);
        break;
      case 'expression':
        lines = buildExpression(node, indent);
        break;
      case 'text':
        lines = buildText(node, indent);
        break;
    }
    return lines;
  };

  var generate = function(ast){
    var lines = [];
    ast.forEach(function(node){
      lines = lines.concat(build(node));
    });
    return lines.join('\n');
  };

  __es6_export__("generate", generate);
});

//# sourceMappingURL=generator.js.map
define('parser', function(require, exports, module){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { elements: peg$parseelements },
        peg$startRuleFunction  = peg$parseelements,

        peg$c0 = [],
        peg$c1 = peg$FAILED,
        peg$c2 = /^[a-zA-Z ]/,
        peg$c3 = { type: "class", value: "[a-zA-Z ]", description: "[a-zA-Z ]" },
        peg$c4 = function(c) { return c.join(''); },
        peg$c5 = function(b) {
            var top = b[0];
            var mid = b[1];
            if(b.length == 2){
              return top.name === "if" && mid.name === "else";
            }
            return false;
          },
        peg$c6 = void 0,
        peg$c7 = function(b) {
            var top = b[0];
            var mid = b[1];
            var newMid = { type: "mid_block_expression", name: mid.name };
            if(mid.content){
              newMid.content = mid.content;
            }
            top.nodes.push(newMid);
            top.nodes.push.apply(top.nodes, mid.nodes);
            return top;
          },
        peg$c8 = null,
        peg$c9 = function(name, m, b) {
            var e = { type: 'block_expression', name:name };
            if(m) {
              e.content = m;
            }
            if(b && b.length > 0){
              e.nodes = b[1];
            }
            return e;
          },
        peg$c10 = function(m) {
            return { type: 'expression', content:m };
          },
        peg$c11 = "-",
        peg$c12 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c13 = "=",
        peg$c14 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c15 = function(a) { return { attributes: a }; },
        peg$c16 = function(b) { return { attributeBindings: b }; },
        peg$c17 = function(t, idClass, attrs, i) {
            return !!t || !!idClass.length;
          },
        peg$c18 = function(t, idClass, attrs, i) {
            var element = {
              type: 'element',
              tag: t || 'div'
            };
            var attributes = idClass;
            var addAtributes = condense(attrs);
            addProperties(element, 'attributes', condense(attributes.concat(addAtributes.attributes)));
            addProperties(element, 'attributeBindings', condense(addAtributes.attributeBindings));
            addProperty(element, 'content', i);
            return element;
          },
        peg$c19 = "(",
        peg$c20 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c21 = ")",
        peg$c22 = { type: "literal", value: ")", description: "\")\"" },
        peg$c23 = function(a) {
            return a;
          },
        peg$c24 = "{",
        peg$c25 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c26 = "}",
        peg$c27 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c28 = { type: "other", description: "Attribute List" },
        peg$c29 = function(a) {
            return condense(a);
          },
        peg$c30 = function(k, v) {
            var attr = {};
            attr[k] = v;
            return attr;
          },
        peg$c31 = function(e, b) {
            if(b && b.length > 0){
              e.nodes = b[1];
            }
            return e;
          },
        peg$c32 = "#",
        peg$c33 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c34 = function(i) { return { id: i } },
        peg$c35 = "%",
        peg$c36 = { type: "literal", value: "%", description: "\"%\"" },
        peg$c37 = function(t) { return t; },
        peg$c38 = ".",
        peg$c39 = { type: "literal", value: ".", description: "\".\"" },
        peg$c40 = function(c) { return { class: c } },
        peg$c41 = "'",
        peg$c42 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c43 = "\"",
        peg$c44 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c45 = function(chars) { return chars.join('') },
        peg$c46 = /^[_a-z0-9\-]/i,
        peg$c47 = { type: "class", value: "[_a-z0-9\\-]i", description: "[_a-z0-9\\-]i" },
        peg$c48 = function(t) { return { type: 'text', content: t }; },
        peg$c49 = function(t) {
            var content = [];
            t.forEach(function(node){
              content.push(node);
            });
            if(t.length === 1 && typeof(t[0]) === 'string'){
              return t[0];
            }
            return content;
          },
        peg$c50 = "#{",
        peg$c51 = { type: "literal", value: "#{", description: "\"#{\"" },
        peg$c52 = function(t) { return { type: 'expression', content: t }; },
        peg$c53 = function(c) { return c; },
        peg$c54 = function(t) { return t.join(''); },
        peg$c55 = { type: "any", description: "any character" },
        peg$c56 = function(i) { return i !== TERM_CHAR },
        peg$c57 = function(i) { return i; },
        peg$c58 = /^[%.=\-]/,
        peg$c59 = { type: "class", value: "[%.=\\-]", description: "[%.=\\-]" },
        peg$c60 = /^[%.#=\-]/,
        peg$c61 = { type: "class", value: "[%.#=\\-]", description: "[%.#=\\-]" },
        peg$c62 = { type: "other", description: "INDENT" },
        peg$c63 = function(i) { return i === INDENT_CHAR },
        peg$c64 = function(i) { return ''; },
        peg$c65 = { type: "other", description: "DEDENT" },
        peg$c66 = function(i) { return i === DEDENT_CHAR },
        peg$c67 = { type: "other", description: "TERM" },
        peg$c68 = function(i) { return i === TERM_CHAR },
        peg$c69 = { type: "other", description: "required whitespace" },
        peg$c70 = { type: "other", description: "whitespace" },
        peg$c71 = /^[ \t\n\r]/,
        peg$c72 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

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
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
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
            if (!details.seenCR) { details.line++; }
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
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
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
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
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

      s0 = peg$currPos;
      s1 = [];
      if (peg$c2.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c3); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c2.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c3); }
          }
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c4(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsemustache() {
      var s0;

      s0 = peg$parseblockChainExpression();
      if (s0 === peg$FAILED) {
        s0 = peg$parseblockExpression();
        if (s0 === peg$FAILED) {
          s0 = peg$parsemustacheExpression();
        }
      }

      return s0;
    }

    function peg$parseblockChainExpression() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseblockExpression();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseblockExpression();
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = peg$currPos;
        s2 = peg$c5(s1);
        if (s2) {
          s2 = peg$c6;
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c7(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseblockExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;

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
                s6 = peg$parsemustacheContent();
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
                            s10 = [s10, s11, s12];
                            s9 = s10;
                          } else {
                            peg$currPos = s9;
                            s9 = peg$c1;
                          }
                        } else {
                          peg$currPos = s9;
                          s9 = peg$c1;
                        }
                      } else {
                        peg$currPos = s9;
                        s9 = peg$c1;
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
                        s0 = peg$c1;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c1;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parsemustacheExpression() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseequal();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemustacheContent();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseTERM();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c10(s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parsedash() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 45) {
        s0 = peg$c11;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c12); }
      }

      return s0;
    }

    function peg$parseequal() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 61) {
        s0 = peg$c13;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c14); }
      }

      return s0;
    }

    function peg$parseelement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

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
              s6 = peg$c15(s6);
            }
            s5 = s6;
            if (s5 === peg$FAILED) {
              s5 = peg$currPos;
              s6 = peg$parseattributeBindings();
              if (s6 !== peg$FAILED) {
                peg$reportedPos = s5;
                s6 = peg$c16(s6);
              }
              s5 = s6;
            }
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$currPos;
              s6 = peg$parseattributes();
              if (s6 !== peg$FAILED) {
                peg$reportedPos = s5;
                s6 = peg$c15(s6);
              }
              s5 = s6;
              if (s5 === peg$FAILED) {
                s5 = peg$currPos;
                s6 = peg$parseattributeBindings();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s5;
                  s6 = peg$c16(s6);
                }
                s5 = s6;
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseinlineText();
                if (s6 === peg$FAILED) {
                  s6 = peg$c8;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseTERM();
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = peg$currPos;
                      s9 = peg$c17(s1, s2, s4, s6);
                      if (s9) {
                        s9 = peg$c6;
                      } else {
                        s9 = peg$c1;
                      }
                      if (s9 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c18(s1, s2, s4, s6);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c1;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c1;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseattributes() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c19;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseattributeList();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c21;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c22); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c23(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseattributeBindings() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c24;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c25); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseattributeList();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 125) {
            s3 = peg$c26;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c27); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c23(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
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
        s1 = peg$c29(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c28); }
      }

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
            s3 = peg$c13;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c14); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsename();
            if (s4 === peg$FAILED) {
              s4 = peg$parsequoted();
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c30(s2, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseblockElement() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseelement();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parseINDENT();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseelements();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseDEDENT();
            if (s5 !== peg$FAILED) {
              s3 = [s3, s4, s5];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c1;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c1;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c1;
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c8;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c31(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseid() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c32;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c33); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsename();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c34(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parsetag() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 37) {
        s1 = peg$c35;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c36); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsename();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c37(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseclass() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c38;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c39); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsename();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c40(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parsequoted() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s2 = peg$c41;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c42); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsename();
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 39) {
            s4 = peg$c41;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c42); }
          }
          if (s4 !== peg$FAILED) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c1;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c1;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c1;
      }
      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 34) {
          s2 = peg$c43;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c44); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsename();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 34) {
              s4 = peg$c43;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c44); }
            }
            if (s4 !== peg$FAILED) {
              s2 = [s2, s3, s4];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$c1;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c1;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c1;
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c45(s1);
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
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c45(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenameChar() {
      var s0;

      if (peg$c46.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }

      return s0;
    }

    function peg$parsetextLine() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parsenonTextStart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c6;
        } else {
          peg$currPos = s2;
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsetext();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseTERM();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c48(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
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
        s1 = peg$c6;
      } else {
        peg$currPos = s1;
        s1 = peg$c1;
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
            s1 = peg$c49(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseinterpolation() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c50) {
        s1 = peg$c50;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c51); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsemustacheContent();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 125) {
            s3 = peg$c26;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c27); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c52(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
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
      if (input.substr(peg$currPos, 2) === peg$c50) {
        s4 = peg$c50;
        peg$currPos += 2;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c51); }
      }
      peg$silentFails--;
      if (s4 === peg$FAILED) {
        s3 = peg$c6;
      } else {
        peg$currPos = s3;
        s3 = peg$c1;
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsetextChar();
        if (s4 !== peg$FAILED) {
          peg$reportedPos = s2;
          s3 = peg$c53(s4);
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$c1;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$c1;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 2) === peg$c50) {
            s4 = peg$c50;
            peg$currPos += 2;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c51); }
          }
          peg$silentFails--;
          if (s4 === peg$FAILED) {
            s3 = peg$c6;
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsetextChar();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s2;
              s3 = peg$c53(s4);
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c1;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c1;
          }
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c54(s1);
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
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c54(s1);
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
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = peg$currPos;
        s2 = peg$c56(s1);
        if (s2) {
          s2 = peg$c6;
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c57(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
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

      if (peg$c58.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c59); }
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

      if (peg$c60.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c61); }
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
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = peg$currPos;
        s2 = peg$c63(s1);
        if (s2) {
          s2 = peg$c6;
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c64(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c62); }
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
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = peg$currPos;
        s2 = peg$c66(s1);
        if (s2) {
          s2 = peg$c6;
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c64(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c65); }
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
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = peg$currPos;
        s2 = peg$c68(s1);
        if (s2) {
          s2 = peg$c6;
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c64(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c67); }
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
        s0 = peg$c1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c69); }
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
        if (peg$silentFails === 0) { peg$fail(peg$c70); }
      }

      return s0;
    }

    function peg$parsewhitespace() {
      var s0;

      if (peg$c71.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c72); }
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
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }
      peg$silentFails--;
      if (s1 === peg$FAILED) {
        s0 = peg$c6;
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }


      var INDENT_CHAR = options.INDENT_CHAR || '\uEFEF',
          DEDENT_CHAR = options.DEDENT_CHAR || '\uEFFE',
          TERM_CHAR = options.TERM_CHAR || '\uEFFF';

      function array(input){
        if(typeof(input) !== 'array'){
          input = [input];
        }
        return input;
      }

      function compact(input){
        if(typeof(input) === 'array'){
          if(input.length === 0){
            return;
          }
        }else if(typeof(input) === 'object'){
          if(Object.keys(input).length === 0){
            return;
          }
        }
        return input;
      }

      function isArray(thing) {
        if( Object.prototype.toString.call(thing) === '[object Array]' ) {
          return true;
        }
        return false;
      }

      function condense(objects) {
        var target = {}, sources;
        if(isArray(objects)){
          sources = objects;
        }else{
          sources = [].slice.call(arguments, 0);
        }
        sources.forEach(function (source) {
          for (var prop in source) {
            if(target[prop]){
              target[prop] = array(target[prop]);
              target[prop].push(source[prop]);
            }else{
              target[prop] = source[prop];
            }
          }
        });
        return target;
      }

      function addProperties(target, key, value) {
        if(Object.keys(value).length > 0){
          target[key] = value;
        }
      }

      function addProperty(target, key, value) {
        if(typeof(value) !== 'undefined' && value !== null){
          target[key] = value;
        }
      }


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
    parse:       parse
  };
})();});
define('preprocessor', function(require, exports, module){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = peg$FAILED,
        peg$c1 = null,
        peg$c2 = [],
        peg$c3 = function(l) {
              var lines = compact(l).map(function(line){
                if(lastChar(line) !== DEDENT_CHAR){
                  line = line + TERM_CHAR
                }
                return line;
              });
              return lines.join('');
            },
        peg$c4 = function() { return },
        peg$c5 = void 0,
        peg$c6 = { type: "any", description: "any character" },
        peg$c7 = function(c) {
                  return c;
                },
        peg$c8 = function(i, c, d) {
              var out = '';
              if(i){
                out = out + TERM_CHAR + i;
              }
              out = out + c.join(TERM_CHAR);
              if(d){
                if(lastChar(out) !== DEDENT_CHAR){
                  out = out + TERM_CHAR;
                }
                out = out + d;
              }
              return out;
            },
        peg$c9 = function(line, e, children) {
              var out = line.join('');
              if(children){
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
        peg$c18 = function(i) { return i.join("") === indent; },
        peg$c19 = { type: "other", description: "INDENT" },
        peg$c20 = function(i) { return i.length > indent.length; },
        peg$c21 = function(i) {
              indentStack.push(indent);
              indent = i.join('');
              pos = offset;
            },
        peg$c22 = function() {
              return INDENT_CHAR;
            },
        peg$c23 = { type: "other", description: "DEDENT" },
        peg$c24 = function() {
              indent = indentStack.pop();
              return DEDENT_CHAR;
            },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

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
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
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
            if (!details.seenCR) { details.line++; }
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
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
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
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
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
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
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
                  if (peg$silentFails === 0) { peg$fail(peg$c6); }
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
            s3 = peg$parseEOL();
            if (s3 === peg$FAILED) {
              s3 = peg$c1;
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
                s1 = peg$c9(s2, s3, s4);
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
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s0 = peg$c12;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c13); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 13) {
            s0 = peg$c14;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c15); }
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
        if (peg$silentFails === 0) { peg$fail(peg$c17); }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c16.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
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
        if (peg$silentFails === 0) { peg$fail(peg$c17); }
      }
      if (s4 !== peg$FAILED) {
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c16.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c17); }
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
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
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
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }

      return s0;
    }


      var indentStack = [],
          indent = "",
          INDENT_CHAR = options.INDENT_CHAR || '\uEFEF',
          DEDENT_CHAR = options.DEDENT_CHAR || '\uEFFE',
          TERM_CHAR = options.TERM_CHAR || '\uEFFF';

      function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
      }

      function compact(arr) {
       if (!isArray(arr)) {
          return arr;
       } else {
           return arr.filter( function(elem) {
              return typeof(elem) !== 'undefined'
           } ).map(compact)
       }
      }

      function lastChar(str){
        return str.slice(-1);
      }



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
    parse:       parse
  };
})();});