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