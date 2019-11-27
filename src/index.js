const pathOS = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const fs = require('fs');
const prettier = require('prettier');

const ENTRY_POINT = pathOS.resolve('./input-js-code/entry-point.js');
const OUTPUT = pathOS.resolve('./dist/bundle.js');

function getRequirePath(path) {
  const { node } = path;
  if (!t.isCallExpression(node)) return;
  if (!t.isIdentifier(node.callee)) return;
  if (node.callee.name !== 'require') return;

  return node.arguments[0].value;
}

function createFunction(requireAST) {
  const body = t.blockStatement(requireAST);
  return t.arrowFunctionExpression([], body);
}

function isModuleExports(path) {
  const { node } = path;
  if (!t.isExpressionStatement(node)) return false;
  if (!t.isAssignmentExpression(node.expression)) return false;
  const { left } = node.expression;

  if (!t.isMemberExpression(left)) return false;
  if (left.object.name !== 'module') return false;
  if (left.property.name !== 'exports') return false;

  return true;
}

function enter(path, filePath, isHighLevel) {
  const requirePath = getRequirePath(path);
  if (requirePath) {
    const dirname = pathOS.dirname(filePath);
    const fullPath = `${pathOS.join(dirname, requirePath)}.js`;
    const moduleFilePath = pathOS.resolve(fullPath);
    const requireAST = loadASTFromFile(moduleFilePath).program.body;
    const astFunction = t.expressionStatement(
      t.callExpression(createFunction(requireAST), [])
    );

    path.replaceWith(astFunction);
  }

  if (!isHighLevel && isModuleExports(path)) {
    const rightReturnAST = path.node.expression.right;
    const returnAST = t.returnStatement(rightReturnAST);
    path.replaceWith(returnAST);
  }
}

function loadASTFromFile(filePath, isHighLevel = false) {
  const code = fs.readFileSync(filePath).toString();
  const ast = parse(code);

  traverse(ast, { enter: path => enter(path, filePath, isHighLevel) });

  return ast;
}

function main() {
  const ast = loadASTFromFile(ENTRY_POINT, true);
  const { code } = generate(ast);
  const formattedCode = prettier.format(code, {
    printWidth: 120,
    parser: 'babel'
  });
  fs.writeFileSync(OUTPUT, formattedCode);
}

main();
