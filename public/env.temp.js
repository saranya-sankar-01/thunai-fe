
(function (window) {
  window['env'] = window['env'] || {};

   window['env']['API_ENDPOINT'] = "${VITE_API_ENDPOINT}";
   window['env']['ENCRYPTION_KEY'] = "${VITE_HTTP_ENCRYPT_KEY}";
   window['env']['IS_ENCRYPTION_FLOW'] = "${VITE_IS_ENCRYPTION_FLOW}".trim().toLowerCase() === "true";
   window['env']['DOMAIN'] = "${VITE_DOMAIN}";
   window['env']['CREDITS'] = "${VITE_CREDITS}".trim().toLowerCase() === "true";
   window['env']['SOCKET_ENDPOINT'] = "${VITE_SOCKET_ENDPOINT}"; 
   window['env']['METRICS_ENDPOINT'] = "${VITE_METRICS_ENDPOINT}";
   window['env']['UPCOMING_EVENTS'] = "${VITE_UPCOMING_EVENTS}".trim().toLowerCase() === "true";
   window['env']['IS_SHOW_AI_CREDITS'] = "${VITE_IS_SHOW_AI_CREDITS}".trim().toLowerCase() === "true";

})(this);
