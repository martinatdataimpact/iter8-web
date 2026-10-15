/* De riktiga sidorna (Om Lasse, Om oss, exemplen). Cloudflare Web Analytics räknar besöken bara på den
   skarpa sajten, med samma token som startsidan (CF_TOKEN i assets/site.js); varje sida räknas under sin
   egen adress. Lokalt laddas ingenting. */
(function () {
  'use strict';
  var CF_TOKEN = '2cfc02183b7247e9aea6776e527540c5';
  if (!CF_TOKEN || !/^(www\.)?iter8\.se$/.test(window.location.hostname)) return;
  var cf = document.createElement('script');
  cf.type = 'module'; cf.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  cf.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_TOKEN }));
  document.head.appendChild(cf);
})();
