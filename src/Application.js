import { Injector } from "leet-mvc/core/Injector";
import { NavController } from "leet-mvc/core/NavController";
import { InjectTemplate } from "./InjectTemplate";
import { LayoutPage } from "./Pages/LayoutPage";
import { ColorPicker } from "./Components/ColorPicker"
import { PictureSelector } from "./Components/PictureSelector"
import { FunctionSelector } from "./Components/FunctionSelector";

var Inject  = Injector.implement(InjectTemplate);
Inject.Nav = new NavController();

export class Application {
  init(){

    ColorPicker.Use()
    PictureSelector.Use()
    
    FunctionSelector.Use();

    var page = Inject.Nav.push(new LayoutPage());
    //var page = Inject.Nav.push(new EditorPage());
  }
}
