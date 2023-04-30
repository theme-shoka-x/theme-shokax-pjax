export default function (request) {
  if (request && request.readyState < 4) {
    request.onreadystatechange = function () { };
    request.abort();
  }
};
