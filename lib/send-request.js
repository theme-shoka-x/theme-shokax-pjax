import updateQueryString from "./util/update-query-string";

export default function(location, options = {}, callback) {
  const requestOptions = options.requestOptions || {};
  const requestMethod = (requestOptions.requestMethod || "GET").toUpperCase();
  const requestParams = requestOptions.requestParams || null;
  let requestPayload = null;
  const request = new XMLHttpRequest();
  const timeout = options.timeout;

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        callback(request.responseText, request, location, options);
      } else if (request.status !== 0) {
        callback(null, request, location, options);
      }
    }
  };

  request.onerror = function(e) {
    console.error(e);
    callback(null, request, location, options);
  };

  request.ontimeout = function() {
    callback(null, request, location, options);
  };

  // Prepare the request payload for forms, if available
  if (requestParams && requestParams.length) {
    // Build query string
    let queryString = requestParams
      .map(function(param) {
        return param.name + "=" + param.value;
      })
      .join("&");

    switch (requestMethod) {
      case "GET":
        // Reset query string to avoid an issue with repeat submissions where checkboxes that were
        // previously checked are incorrectly preserved
        location = location.split("?")[0];

        // Append new query string
        location += "?" + queryString;
        break;

      case "POST":
        // Send query string as request payload
        requestPayload = queryString;
        break;
    }
  }

  // Add a timestamp as part of the query string if cache busting is enabled
  if (options.cacheBust) {
    location = updateQueryString(location, "t", Date.now());
  }

  request.open(requestMethod, location, true);
  request.timeout = timeout;
  request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  request.setRequestHeader("X-PJAX", "true");
  request.setRequestHeader(
    "X-PJAX-Selectors",
    JSON.stringify(options.selectors)
  );

  request.send(requestPayload);

  return request;
};
