const test = (() => {
  const levelInside = (() => {
    const fromUpperLevel = (() => {
      return () => console.log("path good");
    })();

    function testUpperLevel() {
      fromUpperLevel();
    }

    return testUpperLevel;
  })();

  const test = "test";
  return () => {
    levelInside();
    console.log(test);
  };
})();

function main() {
  test();
}

module.exports = main;
