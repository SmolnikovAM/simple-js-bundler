### Information

This is an experimental version with many limitations.
Proof of concept.

Script return first level module which contain the entire require file tree.
Function `require` replaced with immediately invoked function expression.
`module.exports` replaced with return statement.

**Limitations:**

1. Only pure functions
2. No circular protection
3. No module cache
4. Only files, no modules
5. Only relative paths
6. Paths do not contain file extensions

Create bundle:

```
npm run build
```

Folders:

```
input-js-code - example
src/index.js - source code
dist/bundle.js - result of build
```
