import './index.scss'; //require index.scss file
import 'leet-mvc/scss/styles.scss'; //require styles.scss file
import 'leet-mvc/scss/forms.scss'; //require forms.scss file
import 'leet-mvc/scss/buttons.scss';
import 'leet-mvc/scss/grid.scss';
//import "core-js/stable";

import 'leet-mvc';

//import "babel-polyfill";//required	

//import fontawesome
import '@fortawesome/fontawesome-free/scss/regular.scss';
//import './../node_modules/@fortawesome/fontawesome-free/scss/fa-brands.scss'; //not using
import '@fortawesome/fontawesome-free/scss/solid.scss';
import '@fortawesome/fontawesome-free/scss/fontawesome.scss';


import { Application } from './Application';
import { Translate } from 'leet-mvc/core/Translate';

(window as any).Translate = Translate;

//initalize application
var APP = new Application;

//Start application
APP.init();
