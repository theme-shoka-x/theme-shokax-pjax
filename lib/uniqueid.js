export default (function () {
  let counter = 0;
  return function () {
    const id = `pjax${new Date().getTime()}_${counter}`;
    counter++;
    return id;
  };
})();
