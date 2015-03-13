(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("hbars/compiler", ["exports", "module", "./preprocessor", "./parser", "./generator"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("./preprocessor"), require("./parser"), require("./generator"));
  }
})(function (exports, module, _preprocessor, _parser, _generator) {
  "use strict";

  var preprocess = _preprocessor.parse;
  var parse = _parser.parse;
  var generate = _generator.generate;

  var compile = function compile(haml) {
    var ast = parse(preprocess(haml));
    return generate(ast);
  };

  var Compiler = { compile: compile };

  module.exports = Compiler;
});