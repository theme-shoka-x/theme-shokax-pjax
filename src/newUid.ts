export default (() => {
  let counter = 0;
  return () => `pjax${new Date().getTime()}_${counter++}`;
})();
