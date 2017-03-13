import 'core-js/es7/reflect';
import 'zone.js/dist/zone';

// Typescript emit helpers polyfill
import 'ts-helpers';

Error.stackTraceLimit = Infinity;

require('zone.js/dist/long-stack-trace-zone');

require('semantic-ui-less/definitions/globals/reset.less');
require('semantic-ui-less/definitions/globals/site.less');

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
    .then((result) => {
        console.log(result);
    });
