import { Injector } from "leet-mvc/core/Injector";
import { NavController } from "leet-mvc/core/NavController";
import { InjectTemplate } from "./InjectTemplate";
import { EditorPage } from "./Pages/EditorPage";

var Inject  = Injector.implement(InjectTemplate);
Inject.Nav = new NavController();

export class Application {
  init(){
    var page = Inject.Nav.push(new EditorPage());
  }
}
