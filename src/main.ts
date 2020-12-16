import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
// import { environment } from './environments/environment.ts';
import * as environment from './environments/wt.environment';
declare var require: any;
var releaseVersion = require("../package.json").releaseVersion;

var loadFavicon = function () {
  var link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';
  link.href = 'assets/images/favicon.ico?v=' + releaseVersion;
  document.head.appendChild(link);
}

var loadManifest = function () {
  const link1 = document.createElement('link');
  link1['rel'] = 'manifest';
  if (environment.WT_CONFIG.BRAND_NAME=='Rosystyle') {
    link1['href'] = 'manifest_rosystyle.json';
  }
  else {
    link1['href'] = 'manifest.json';
  }
  document.head.appendChild(link1);
}

loadFavicon();
loadManifest();

// if(environment.WT_CONFIG.BRAND_NAME == 'FXOAK' ){
// alert(1);

// }

// if (environment.production) {
  // Google Analytics Code Snippet
  // if (environment.WT_CONFIG.GA_TRACKING_CODE && environment.WT_CONFIG.GA_TRACKING_CODE !== '') {

  //   const script1 = document.createElement('script');

  //   script1.src = `https://www.googletagmanager.com/gtag/js?id=${environment.WT_CONFIG.GA_TRACKING_CODE}`;
  //   document.head.appendChild(script1);

  //   const script2 = document.createElement('script');
  //   script2.innerHTML = ` window.dataLayer = window.dataLayer || [];

  //   function gtag() {
  //       dataLayer.push(arguments);
  //   }
  //   gtag('js', new Date());

  //   gtag('config','${environment.WT_CONFIG.GA_TRACKING_CODE}');`;

  //   document.head.appendChild(script2);
  // }
  // if (environment.brandName === 'RaisingFX') {
  //   document.write('<script type="text/javascript" src="http://lead.soperson.com/20004160/10109007.js"></script>');
  // }

  if (environment.WT_CONFIG.LOGGING_BASE_URL && environment.WT_CONFIG.LOGGING_BASE_URL !== '') {
    // const script3 = document.createElement('script');
    // script3.innerHTML = `
    // window.onerror = function (errorMsg, url, lineNumber) {
    //   var req = new XMLHttpRequest();
    //   var params = 'error= ' + errorMsg.message ;
    //   req.open('POST', '${environment.WT_CONFIG.LOGGING_BASE_URL}/logError');
    //   req.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
    //   req.setRequestHeader('secretkey', '${environment.WT_CONFIG.SECRET_KEY}');
    //   req.send(JSON.stringify({ error: errorMsg.message }));
    // }`;

    //document.head.appendChild(script3);

    // if (environment.WT_CONFIG.CrazyeggId) {
    //   const script4 = document.createElement('script');
    //   script4.src = `https://script.crazyegg.com/pages/scripts/${environment.WT_CONFIG.CrazyeggId}`;
    //   document.head.appendChild(script4);
    // }
  }

  enableProdMode();
// } commented becuase this check was not causing hinderence with custom GA events.


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
