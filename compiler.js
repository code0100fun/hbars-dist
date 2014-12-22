"use strict";
var preprocessor$$ = require("./preprocessor.js"), parser$$ = require("./parser.js"), generator$$ = require("./generator.js");

var compile = function(haml){
  var ast = parser$$.parse(preprocessor$$.parse(haml));
  return generator$$.generate(ast);
};

var Compiler = { compile: compile };

exports["default"] = Compiler;

//# sourceMappingURL=compiler.js.map