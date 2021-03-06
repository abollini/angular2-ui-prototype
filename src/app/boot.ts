﻿import 'angular2-universal-preview/polyfills';
import {prebootComplete} from 'angular2-universal-preview';

import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {enableProdMode, provide} from 'angular2/core';

import {
    TranslateLoader,
    TranslateStaticLoader, TranslateService
} from "ng2-translate/ng2-translate";

import {AppComponent} from './app.component';
import {DSpaceService} from './dspace/dspace.service';
import {BreadcrumbService} from './navigation/breadcrumb.service';
import {HttpService} from './utilities/http.service';

import {DSpaceDirectory} from './dspace/dspace.directory';
import {DSpaceStore} from './dspace/dspace.store';
import {DSpaceKeys} from './dspace/dspace.keys';

enableProdMode();

bootstrap(AppComponent, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    provide(TranslateLoader, {
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'dist/i18n', '.json'),
        deps: [Http]
    }),
    TranslateService,
    BreadcrumbService,
    DSpaceDirectory,
    DSpaceKeys,
    DSpaceService,
    DSpaceStore,
    HttpService
])
.then(prebootComplete);