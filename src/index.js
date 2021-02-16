import './index.scss'; //require index.scss file
import 'leet-mvc/scss/forms.scss'; //require index.scss file

//import "core-js/stable";
import "regenerator-runtime/runtime";

import 'leet-mvc';

//import "babel-polyfill";//required	

//import fontawesome
import '@fortawesome/fontawesome-free/scss/regular.scss';
//import './../node_modules/@fortawesome/fontawesome-free/scss/fa-brands.scss'; //not using
import '@fortawesome/fontawesome-free/scss/solid.scss';
import '@fortawesome/fontawesome-free/scss/fontawesome.scss';


import { Application } from './Application';
import { Translate } from 'leet-mvc/core/Translate';

window.Translate = Translate;

//initalize application
var APP = new Application;

//Start application
APP.init();


