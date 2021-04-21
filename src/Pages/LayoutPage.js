import { HeaderPage } from "leet-mvc/pages/HeaderPage/HeaderPage.js"
import { DOM } from "leet-mvc/core/DOM"
import { Objects } from "leet-mvc/core/Objects";
import { Forms } from "leet-mvc/components/Forms";
import "./LayoutPage.scss";

import * as donatecode from "./donatecode.html";
import { Text } from "leet-mvc/core/text";
import { round } from "leet-mvc/core/helpers";
import { Alert, Confirm, ConfirmButtons, Prompt } from "leet-mvc/core/simple_confirm";
import { Dialog } from "leet-mvc/pages/DialogPage/DialogPage";
import { Injector } from "leet-mvc/core/Injector";
import { EditorPage } from "./EditorPage";
import { BackgroundNode, ButtonNode, CheckboxNode, FieldNode, LabelNode, LedNode, SetJogPanelTabSizeNode, TabNode,argbToRGB,CodeviewNode,ListNode,ControlNode, PictureNode, SliderNode, UCCAMNode, ToolpathNode, Parser, normalColor, ColorNode, SetScreenSizeNode, SetJogPanelSizeNode, SetfieldNode, FilterfieldtextNode, RGBToargb, getSimilarProperty, SetBitmapFolderNode, FillNode, CNode } from "../Parser";
import { FileHelpers } from "../FileHelpers";
import { PictureListEditor } from "./PictureListEditor";
import { FontsList } from "../Fonts";
import { get, set } from "idb-keyval";
import { ButtonNumbers } from "../ButtonNumbers";
import { LedNumbers } from "../LedNumbers";
import { FieldNumbers } from "../FieldNumbers";
import { CheckBoxNumbers } from "../CheckBoxNumbers";
import { FieldTypes } from "../FieldTypes";


export class LayoutPage extends HeaderPage {
  constructor(){
    super();
    
    this.selector = "page-LayoutPage"
    this.title = "UCCNC Layout Editor"
    /** @type {FileSystemFileHandle} */
    this.fileHandle= undefined;
    /** @type {FileSystemDirectoryHandle} */
    this.dirHandle = undefined;

    /** @type {HTMLDivElement} */
    this.selectBox = null;

    /** @type {string[]} */
    this.history = [];

    this.pendingSave = undefined;

    this.renderErrors = [];
    this.parseErrors = [];

    /** @type {PictureNode[]} */
    this.pictures = [];

    this.ctrlPressed = false;
    this.shiftPressed = false;
    this.altPressed = false;
    this.visibleLayers = [1, 2];
    this.dataClean = {
      controller: null,
      controllType: null,
      controllTypeName: null,
      controllN: null,
      buttonN: null,
      ledN: null,
      fieldN: null,
      checkBoxN: null,
      layerN: null,
      parentN: null,
      x: null,
      y: null,
      w: null,
      h: null,
      toggle: false,
      blink: false,
      picN: null,
      pictureSRC_up: null,
      pictureSRC_down: null,
      font: null,
      fontSize: null,
      color:null,
      colorName:null, //
      color2:null,
      colorName2:null, //
      align: null,
      vertical:null,
      min: null,
      max: null,
      clickable: null,
      transparency: null,
      value: null,
      fieldType: null,
    }
    this.data = Objects.copy(this.dataClean);

    this.controlPropertiesForm = { type:"form", class:"box", displayRule:"true_if_not:controllType,null", items:[
      { type:"label", value:"Control Properties"},
      { type:"text", title:"Control Type", name:"controllTypeName", attributes:{disabled:true}},
      { type:"select", name:"fieldType", title:"Fild Type", placeholder:"", displayRule:`true_if:controllType,${FieldNode.name}`, validateRule:"required", class:"", items: Objects.copy(FieldTypes)},

      { type:"text", title:"Control Number", name:"controllN", displayRule:`true_if:controllType,${ListNode.name},${ColorNode.name},${BackgroundNode.name}` },
      { type:"function-select", title:"Button Number", name:"buttonN", validateRule:"required|numeric|min:0", displayRule:`true_if:controllType,${ButtonNode.name}`, items: getButtonsDropDown(ButtonNumbers), attributes:{showItemsOnFocus:true} },
      { type:"function-select", title:"Led Number", name:"ledN", validateRule:"required|numeric|min:0", displayRule:`true_if:controllType,${LedNode.name}`, items: getButtonsDropDown(LedNumbers), attributes:{showItemsOnFocus:true} },
      { type:"function-select", title:"Field Number", name:"fieldN", validateRule:"required|numeric|min:0", displayRule:`true_if:controllType,${FieldNode.name},${SliderNode.name}`, items: getButtonsDropDown(FieldNumbers), attributes:{showItemsOnFocus:true} },
      { type:"function-select", title:"Checkbox Number", name:"checkBoxN", validateRule:"required|numeric|min:0", displayRule:`true_if:controllType,${CheckboxNode.name}`, items: getButtonsDropDown(CheckBoxNumbers), attributes:{showItemsOnFocus:true} },
      { type:"number", title:"Parent Tab Layer Number", name:"parentN", displayRule:`true_if:controllType,${TabNode.name}`, validateRule:"required|numeric|min:0" },
      { type:"number", title:"Layer Number", name:"layerN", validateRule:"numeric|min:0"},
      { type:"form", class:"row", items:[
        { type:"number", name:"x", title:"X", placeholder:"", validateRule:"numeric", class:"col-6", unit:"px"},
        { type:"number", name:"y", title:"Y", placeholder:"", validateRule:"numeric", class:"col-6", unit:"px"},
        { type:"number", name:"w", title:"Width", placeholder:"", displayRule:`true_if_not:controllType,${LabelNode.name},${CheckboxNode.name}`, validateRule:"required|numeric|min:0", class:"col-6", unit:"px"},
        { type:"number", name:"h", title:"Height", placeholder:"", displayRule:`true_if:controllType,${ButtonNode.name},${BackgroundNode.name},${UCCAMNode.name},${ListNode.name},${LedNode.name},${ToolpathNode.name},${TabNode.name},${FillNode.name}`, validateRule:"required|numeric|min:0", class:"col-6", unit:"px"},
      ]},
      { type:"form", class:"row", items:[
        { type:"checkbox", name:"toggle", title:"Toggle", displayRule:"true_if:controllType,"+ButtonNode.name+"", value: false, class:"col-6"},
        { type:"checkbox", name:"blink", title:"Blink", displayRule:"true_if:controllType,"+ButtonNode.name+","+LedNode.name+"", value: false, class:"col-6"},
      ]},
      { type:"form", class:"row", displayRule:`true_if:controllType,${FieldNode.name},${SliderNode.name}`, items:[
        { type:"number", name:"min", title:"Min", placeholder:"", validateRule:"numeric", class:"col-6"},
        { type:"number", name:"max", title:"Max", placeholder:"", validateRule:"numeric", class:"col-6"},
      ]},
      
      { type:"form", class:"", displayRule:`true_if:controllType,${ButtonNode.name},${BackgroundNode.name},${LedNode.name},${TabNode.name}`, items:[
        { type:"picture-select", name:"picN", title:"Picture Number", placeholder:"", validateRule:"numeric|min:0"},
        { type:"text", title:"Picture Up", name:"pictureSRC_up", attributes:{disabled:true}},
        { type:"text", title:"Picture Down", name:"pictureSRC_down", attributes:{disabled:true}},
      ]},

      { type:"form", class:"row", displayRule:"true_if:controllType,"+SliderNode.name+"", items:[
        { type:"checkbox", name:"vertical", title:"Vertical", value: false, class:"col-6"},
        { type:"checkbox", name:"clickable", title:"Clickable", value: false, class:"col-6"},
      ]},

      { type:"form", class:"row", displayRule:`true_if:controllType,${FieldNode.name},${ListNode.name},${TabNode.name},${CodeviewNode.name},${LabelNode.name}`, items:[
        { type:"select", name:"font", title:"Font Name", placeholder:"", validateRule:"required", class:"col-6", items: Objects.copy(FontsList)},
        { type:"number", name:"fontSize", title:"Font Size", placeholder:"", validateRule:"required|numeric|min:1", class:"col-6", unit:"px"},
      ]}, 
     
      { type:"form", class:"row", displayRule:`true_if:controllType,${LabelNode.name}`, items:[
        { type:"text", name:"value", title:"Label Text", placeholder:"Text", validateRule:"", class:"col-12"},
      ]}, 

      { type:"color-picker", name:"color", title:"Color", placeholder:"", displayRule:`true_if:controllType,${FieldNode.name},${ListNode.name},${SliderNode.name},${FillNode.name},${LabelNode.name}`, validateRule:"required" },
      { type:"color-picker", name:"color2", title:"Color 2", placeholder:"", displayRule:"true_if:controllType,"+SliderNode.name, validateRule:"required"},

      { type:"number", name:"transparency", title:"Opacity", placeholder:"", displayRule:`true_if:controllType,${ListNode.name},${FillNode.name}`, validateRule:"required|numeric|min:0|max:1", unit:""},
      
      { type:"select", name:"align", title:"Text Align", placeholder:"", displayRule:"true_if:controllType,"+FieldNode.name+","+ListNode.name+","+TabNode.name+"", validateRule:"required", items:[
        { value:"left", title: "Left"},
        { value:"center", title: "Center"},
        { value:"right", title: "Right"},
      ]},
    ]},

    this.form = new Forms([
      { type:"select", name:"controller", title:"Controller", placeholder:"Select Controller", dynamicItems: true },
      { type:"hidden", name:"controllType"},
      Objects.copy(this.controlPropertiesForm)
    ], this.data);

    /** @type {ControlNode[]} */
    this.selectedNodes = [];

    this.form.onChange = (ev)=>{

      if (ev) {
        if (ev.target.name=="controller") {
          this.unselectElements();
          this.editSelectedNodes();
          this.reRender();
          this.validateCurrentController()
          return;
        }
      }

      if (this.selectedNodes.length > 0) {
        this.updateSelectedNodes();
        this.saveHistorySnapshot();
      }
      this.reRender();
    }

    this.parser = new Parser()

    this.jogVisible = false;
    this.LastSession = null;
    get("HistorySnapshot").then(snap=>{
      this.LastSession = snap;
    })
    get("pendingSave").then(val=>{
      this.pendingSave = val;
    })
  }

  pendingSaveChange(val){
    if ( val!== undefined)
    set("pendingSave", val);
  }

  fileHandleChange(val){
    if ( val!== undefined)
    set("fileHandle",val);
  }
  dirHandleChange(val){
    if ( val!== undefined)
    set("dirHandle",val);
  }
  isSampleLoadedChange(val){
    if ( val!== undefined)
    set("isSampleLoaded",val);
  }

  async reRender(){
    this.pictures = Objects.filter(this.parser.getNodes(), n=> (n instanceof PictureNode && n.region == this.data.controller ))
    
    this.pictures.sort(function(a,b){
      return a.controllN - b.controllN
    })
   
    await this.renderMainArea();
    await this.renderJogArea();
    this.hideOrShowJog();
  }

  clearAll(){
    Objects.overwrite(this.data, this.dataClean);
    this.form.fields['controller'].items = [];

    if (this.mainArea.children[0])
      this.mainArea.children[0].remove();
    if (this.jogArea.children[0])
      this.jogArea.children[0].remove();
  }

  async renderMainArea(){
    var oldChild = this.mainArea.children[0];
    if (oldChild){
      oldChild.style.zIndex = 2;
    }
    var el = await this.renderControls(this.data.controller, this.parser.getNodes(),"AS3");
    if (el) this.mainArea.appendChild(el);

    if (oldChild)
      setTimeout(() => {
        oldChild.remove();
      }, 200);
        
  }
  async renderJogArea(){
    var oldChild = this.jogArea.children[0];
    if (oldChild){
      oldChild.style.zIndex = 2;
    }
    var el = await this.renderControls(this.data.controller, this.parser.getNodes(),"AS3jog")
    if (el) this.jogArea.appendChild(el);

    if (oldChild)
      setTimeout(() => {
        oldChild.remove();
      }, 200);
  }

  onInit(){
    this.workArea = DOM(this.page).find('#workarea').first();
    this.mainArea = DOM(this.page).find('#mainarea').first();
    this.jogArea = DOM(this.page).find('#jogarea').first();
    var isDragging = false;
    var isSelectingMultiple = false;
    //this.parse(testFile);
    DOM(this.workArea).on("click", (ev)=>{
      if (!isDragging && !isSelectingMultiple) {
        //setTimeout(() => {
          this.onWorkAreaClicked(ev);
        //}, 16);
      }
      
    });
    DOM(document).on("keydown",(event)=>{
      if(event.which=="17")
        this.ctrlPressed = true;
      if(event.which=="16")
        this.shiftPressed = true;
      if(event.which=="18")
        this.altPressed = true;  
    })
    DOM(document).on("keyup",(event)=>{
      this.ctrlPressed = false;
      this.shiftPressed = false;
      this.altPressed = false;
    })

    
    DOM(this.workArea).on("mousedown",(event)=>{
      if (!this.shiftPressed && event.target.classList.contains("UC-control") && !event.target.classList.contains("selected")){
        //start selecting
        event.preventDefault();
        
        var WA = DOM(this.workArea);

        var x1=event.clientX + this.workArea.scrollLeft - WA.offsetLeft()
        var y1=event.clientY + this.workArea.scrollTop - WA.offsetTop()
        var x2=0, y2=0;
        var parentElement = DOM(event.target).closest("#mainarea").first() || DOM(event.target).closest("#jogarea").first()
        
        DOM(this.workArea).on("mousemove",(event)=>{
          x2=event.clientX + this.workArea.scrollLeft - WA.offsetLeft()
          y2=event.clientY + this.workArea.scrollTop - WA.offsetTop()
          if (Math.abs(x2-x1) > 3 || Math.abs(y2-y1) > 3) {
            isSelectingMultiple = true
            this.drawSelectBox(parentElement, x1,y1,x2,y2);
          }
        })

        DOM(this.workArea).on("mouseup",(event)=>{
          if (isSelectingMultiple) {
            setTimeout(() => {
              //delay a bit to make sure we dont d-select the item we dragged
              isSelectingMultiple = false  
            }, 15);

            this.selectElementsWithin(parentElement, x1,y1, x2,y2);
            this.editSelectedNodes();
            this.selectBox.remove();
          }
          
          DOM(this.workArea).off("mousemove");
          DOM(this.workArea).off("mouseup");
        })
      }
      if (event.target.classList.contains("UC-control") && event.target.classList.contains("selected")){
        if (this.shiftPressed) {
          event.preventDefault();
          isDragging = true;
          var x1=event.clientX, y1=event.clientY, x2=0, y2=0;
          
          DOM(this.workArea).on("mousemove",(event)=>{
            x2=event.clientX, y2=event.clientY;
            this.moveSelectedElements(x2-x1, y2-y1);
            
            x1=x2, y1=y2
          })

          DOM(this.workArea).on("mouseup",(event)=>{
            setTimeout(() => {
              //delay a bit to make sure we dont d-select the item we dragged
              isDragging = false
              this.saveHistorySnapshot();  
            }, 15);

            this.editSelectedNodes()
            
            DOM(this.workArea).off("mousemove");
            DOM(this.workArea).off("mouseup");
          })
        }
      }
    });

    DOM(window).on("beforeunload",  (e)=>{
      if (this.pendingSave) {
        var confirmationMessage = 'You have unsaved changes!'
                                + '\nIf you leave before saving, your changes will be lost.';
    
        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
      }
    });

  }

  moveSelectedElements(dX, dY){
    Objects.forEach(this.selectedNodes, node=>{
      node.x += dX;
      node.y += dY;
      node.el.style.top =  node.y + "px";
      node.el.style.left =  node.x + "px";
    })
  }

  onFitYClicked(){
    this.selectedNodes.sort(function(a,b){
      return b.y - a.y;
    });

    var node1 = this.selectedNodes[0]
    var node2 = this.selectedNodes[this.selectedNodes.length-1]


    var dY = (node2.y-node1.y) / (this.selectedNodes.length-1) 

    Objects.forEach(this.selectedNodes, (node, i)=>{
      node.y = node1.y + round(dY * i, 0);
      node.el.style.top =  node.y + "px";
    })
    this.saveHistorySnapshot();
  }

  onFitXClicked(){
    this.selectedNodes.sort(function(a,b){
      return a.x - b.x;
    });

    var node1 = this.selectedNodes[0]
    var node2 = this.selectedNodes[this.selectedNodes.length-1]

    var totW =  node2.x + node2.w - node1.x;

    var wE = 0;
    Objects.forEach(this.selectedNodes, (node, i)=>{
       wE += node.w; 
    })

    var dx = (totW - wE) / (this.selectedNodes.length-1) 

    var x = 0
    var prevNode = null;
    Objects.forEach(this.selectedNodes, (node, i)=>{
      if (prevNode != null) {
        node.x =  round( prevNode.x + prevNode.w + dx);
        node.el.style.left =  node.x + "px";
      }
      prevNode = node;
    })
    this.saveHistorySnapshot();
  }

  onAlignLeftClicked(){
    var minX = 99999999999
    Objects.forEach(this.selectedNodes, (node, i)=>{
      if (minX >= node.x ) minX = node.x;
    })

    Objects.forEach(this.selectedNodes, (node, i)=>{
      node.x = minX
      node.el.style.left =  node.x + "px";
    })
    this.saveHistorySnapshot();
  }

  onAlignRightClicked(){
    var maxX = -99999999999
    Objects.forEach(this.selectedNodes, (node, i)=>{
      if (maxX <= node.x + node.w ) maxX = node.x + node.w;
    })

    Objects.forEach(this.selectedNodes, (node, i)=>{
      node.x = maxX - node.w;
      node.el.style.left =  node.x + "px";
    })
    this.saveHistorySnapshot();
  }
  onAlignJustifyClicked(){
    var minX = 99999999999
    var maxX = -99999999999
    Objects.forEach(this.selectedNodes, (node, i)=>{
      if (minX >= node.x ) minX = node.x;
      if (maxX <= node.x + node.w ) maxX = node.x + node.w;
    })

    Objects.forEach(this.selectedNodes, (node, i)=>{
      node.x = minX;
      node.w = maxX - minX;
      node.el.style.left =  node.x + "px";
      node.el.style.width =  node.w + "px";
    })
    this.saveHistorySnapshot();
  }

  onDeleteControlsClicked(){
    Confirm(`Are you sure you want to remove the ${this.selectedNodes.length} selected controls?`,()=>{
      Objects.forEach(this.selectedNodes, node=> {
        /*if (node.picture){
          this.parser.removeNode(node.picture);
        }*/
        /*if (node.filterField){
          this.parser.removeNode(node.filterField);
        }*/
        /*if (node.setField){
          this.parser.removeNode(node.setField);
        }*/
        this.parser.removeNode(node);
      })
      this.selectedNodes = [];
      this.reRender();
      this.saveHistorySnapshot();
    },"Delete Selected");
  }

  onDuplicateControlClicked(){
    Objects.forEach(this.selectedNodes, node=> {
      var newNode = copyInstance(node);
      newNode.x += 10;
      newNode.y += 10;

      this.parser.insertNewNode(newNode)
      //Insert node filter
      if (newNode.filterField){
        //this.parser.nodes.splice(index+1,0, newNode.filterField);
      }
      //Insert node value setter
      if (newNode.setField){
        //this.parser.nodes.splice(index+1,0, newNode.setField);
      }

    })
    //this.selectedNodes = [];
    this.reRender();
    this.saveHistorySnapshot();
  }
  onCreateControlClicked(){
    if (this.selectedNodes.length !== 1) {
      Alert("Please select exactly one existing element to place the new control next to!", null, "Reference Element Required");
      return;
    }

    var p = Dialog("Create Control");
    p.addSelect("controllType", "Control Type", null, true, [
      { value: null, title: "Please select..." },
      { value: TabNode.name, title: "Tab" },
      { value: ButtonNode.name, title: "Button" },
      { value: FieldNode.name, title: "Field" },
      { value: BackgroundNode.name, title: "Background" },
      { value: LabelNode.name, title: "Label" },
      { value: CheckboxNode.name, title: "Checkbox" },
      { value: LedNode.name, title: "Led" },
      { value: ColorNode.name, title: "Color" },
      { value: CodeviewNode.name, title: "Codeview" },
      { value: ListNode.name, title: "List" },
      { value: UCCAMNode.name, title: "UCCAM" },
      { value: ToolpathNode.name, title: "Toolpath" },
      { value: SliderNode.name, title: "Slider" }
    ])
    
    //remove the Control Type and control Properties labels
    var tpl = Objects.copy(this.controlPropertiesForm);
    tpl.items.splice(0,2);

    p.controls.push(tpl);
    p.render();

    p.addActionButton("Cancel", null)
    p.addActionButton("Add", ()=>{
      if (!p.validate()) {
        return false;
      }
      var node;
      switch(p.data.controllType){
        case TabNode.name: node = new TabNode; break;
        case ButtonNode.name: node = new ButtonNode; break;
        case FieldNode.name: node = new FieldNode; break;
        case BackgroundNode.name: node = new BackgroundNode; break;
        case LabelNode.name: node = new LabelNode; break;
        case CheckboxNode.name: node = new CheckboxNode; break;
        case LedNode.name: node = new LedNode; break;
        case ColorNode.name: node = new ColorNode; break;
        case CodeviewNode.name: node = new CodeviewNode; break;
        case ListNode.name: node = new ListNode; break;
        case UCCAMNode.name: node = new UCCAMNode; break;
        case ToolpathNode.name: node = new ToolpathNode; break;
        case SliderNode.name: node = new SliderNode; break;
      }
      /*Objects.forEach(this.data, (value, key)=>{
        node[key] = value;
      })*/
      Object.assign(node, p.data);
      node.region = this.data.controller;
      node.container = this.selectedNodes[0].container;
      this.parser.insertNewNode(node);
      this.selectedNodes = [node];
      this.reRender();
      this.saveHistorySnapshot();
    })

    p.content.fields['picN'].items = Objects.copy(this.form.fields['picN'].items);

    delete p.content.fields['pictureSRC_up']
    delete p.content.fields['pictureSRC_down']

    p.data.layerN = this.selectedNodes[0].layerN
    p.data.x = this.selectedNodes[0].x + 10;
    p.data.y = this.selectedNodes[0].y + 10;
    
  }

  async onEditPictureListClicked(){
    var p = Injector.Nav.push(new PictureListEditor(this.dirHandle));
    p.gallery.items = await this.getCurrentPictureList();
    p.pictures = this.pictures;
    p.container = this.selectedNodes[0]?.container || 'AS3';
    p.region = this.data.controller;
    
    p.onAddPicture = (pic)=>{
      this.parser.insertNewNode(pic);
    }
    p.onRemovePicture = async (pic)=>{
      /*let pics = await this.getCurrentPictureList();
      var found = Objects.find(pics, f=>f.controllN == pic.controllN);
      if (found)*/
        this.parser.removeNode(pic);
    }
    p.onDestroy = ()=>{
      this.reRender();
      this.saveHistorySnapshot();
    }
    return p;
  }

  onEditScreenProperttiesClicked(){
    /** @type {SetScreenSizeNode} */
    var main = this.parser.getNodes().find(el=>el instanceof SetScreenSizeNode && el.region == this.data.controller);
    /** @type {SetJogPanelSizeNode} */
    var jog = this.parser.getNodes().find(el=>el instanceof SetJogPanelSizeNode && el.region == this.data.controller);
   /** @type {SetJogPanelTabSizeNode} */
   var jogCollapsed = this.parser.getNodes().find(el=>el instanceof SetJogPanelTabSizeNode && el.region == this.data.controller);
    
    var p = Dialog("Screen Properties");
        
    //remove the Control Type and control Properties labels
      
    p.controls = [
      { type:"label", value:"Main Screen Size" },
      { type:"form", name:"main", class:"row", items:[
        { type:"number", name:"w", title:"Width", placeholder:"", validateRule:"required|numeric", class:"col-6", unit:"px"},
        { type:"number", name:"h", title:"Height", placeholder:"", validateRule:"required|numeric", class:"col-6", unit:"px"},
      ]},
      { type:"label", value:"Jog Panel Size" },
      { type:"form", name:"jog", class:"row", items:[
        { type:"number", name:"w", title:"Width", placeholder:"", validateRule:"required|numeric", class:"col-6", unit:"px"},
        { type:"number", name:"h", title:"Height", placeholder:"", validateRule:"required|numeric", class:"col-6", unit:"px"},
        { type:"number", name:"collapsed_w", title:"Collapsed Width", placeholder:"", validateRule:"required|numeric", class:"col-6", unit:"px"},
      ]},
    ];
    p.render();

    p.addActionButton("Cancel", null)
    p.addActionButton("Ok", ()=>{
      if (!p.validate()) {
        return false;
      }
      
      main.w = p.data.main.w;
      main.h = p.data.main.h;

      jog.w = p.data.jog.w;
      jog.h = p.data.jog.h;

      jogCollapsed.value = p.data.jog.collapsed_w;
      
      this.reRender();
      this.saveHistorySnapshot();
    })

    p.data = Objects.overwrite(p.data, {
      main:{
        w: main.w,
        h: main.h
      },
      jog:{
        w: jog.w,
        h: jog.h,
        collapsed_w: jogCollapsed.value,
      }
    })

  }

  onGenerateButtonClicked(){
    var p = Injector.Nav.push(new EditorPage(this.selectedNodes[0]) )
    p.onDestroy = ()=>{
      this.reRender();
    }
  }

  get isSelectedElementPictureGenSupported(){
    return this.selectedNodes && this.selectedNodes.length == 1 &&  (this.selectedNodes[0] instanceof ButtonNode || this.selectedNodes[0] instanceof TabNode || this.selectedNodes[0] instanceof BackgroundNode || this.selectedNodes[0] instanceof LedNode )
  }

  saveHistorySnapshot(newHistory = false){
    if (this.historyReverting) return;

    if (newHistory){
      this.history = [];
    }

    var cCode = this.parser.getCCode();

    if (this.history.length > 0 && this.history[this.history.length-1] == cCode){
      return;
    }

    //save up to 10 snapshots
    if (this.history.length > 10) {
      this.history.shift();
    }
    if (this.history[this.history.length-1] !== cCode)
    this.history.push(cCode);
    this.pendingSave = true;

    set("HistorySnapshot", cCode);
    this.validateCurrentController();
  }

  onUndoClicked(){
    if (this.history.length > 1) {
      this.historyReverting = true;
      this.selectedNodes = [];
      //remove current state
      this.history.pop();
      //get previous state
      var snap = this.history[this.history.length-1]
      var controller = this.data.controller;
      this.parse(snap, true);
      this.data.controller = controller;
      this.historyReverting = false;
    }
  }

  async onLoadScreensetClicked(){
    ConfirmButtons(`When prompted, please do the following:\n
Select the Screenset file: C:/UCCNC/Screens/ScreenSetName.ssf\n
Select the Flashscreen directory with all screenset image files such as: C:/UCCNC/Flashscreen/\n
Please make sure to accept all file and directory acess permissions shown by the browser!`, "Please Read!", { Cancel: null, OK: async ()=>{
      try {
        var [fileHandle] = await window.showOpenFilePicker();
        //if (await this.verifyPermission(this.fileHandle, true)) {
          var dirHandle = await window.showDirectoryPicker();
          if (dirHandle) {
            this.fileHandle = fileHandle;
            this.dirHandle = dirHandle;
            var file = await this.fileHandle.getFile();
            var text = await file.text();
            
            this.history = [];
            this.parse(text, false);


          }
        //}
      } catch (ex) {
        Alert(ex.message,null,"Error loading screenset!");
      }
    }})
    
  }



  onLoadSampleScreensetClicked(ss){
    this.isSampleLoaded = true;
    var file = "";
    if (ss==1)
      file="Defaultscreenset.ssf";

    if (ss==2)
      file="Default2019.ssf";

      FetchFile(file).then(text=>{
        this.history = [];
        this.parse(text, false);
      })
  }

  async onRestoreSessionClicked(){
    var dirHandle = null
    await get("dirHandle").then(val=>{
      dirHandle = val;
    })
    if (dirHandle && !await FileHelpers.verifyPermission(dirHandle, true)) {
      Alert("Permission was not given to access the Flashcreen directory!")
      return;
    }
    this.dirHandle = dirHandle

    this.history = [];
    
    await get("isSampleLoaded").then(val=>{
      this.isSampleLoaded = val;
    })
    await get("fileHandle").then(val=>{
      this.fileHandle = val;
    })

    
    this.parse(this.LastSession, this.pendingSave);
  }

  async onSaveAsScreensetClicked(){
    var fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: 'Screenset files',
          accept: {
            'text/plain': ['.ssf'],
          },
        },
        {
          description: 'Text Files',
          accept: {
            'text/plain': ['.txt'],
          },
        },
      ],
    });
    if (fileHandle){
      await FileHelpers.writeTextToFileHandle(this.parser.getCCode(), this.fileHandle);
      this.fileHandle = fileHandle;
      this.pendingSave = false;
    }
    /*if (fileHandle && await this.verifyPermission(fileHandle, true)){
      this.fileHandle = fileHandle;
      var writable = await fileHandle.createWritable();
      var text = this.parser.getCCode();
      await writable.write(text);
      writable.close();
      this.pendingSave = false;
    }*/
  }
  async onSaveScreensetClicked(){
    if (this.fileHandle){
      await FileHelpers.writeTextToFileHandle(this.parser.getCCode(), this.fileHandle);
      this.pendingSave = false;
    }
    /*
    if (this.fileHandle && await this.verifyPermission(this.fileHandle, true)){
      var writable = await this.fileHandle.createWritable();
      var text = this.parser.getCCode();
      await writable.write(text);
      writable.close();
      this.pendingSave = false;
    }*/
  }
  verifyPermission(fileHandle, readWrite) {
    const options = {};
    if (readWrite) {
      options.mode = 'readwrite';
    }
    // Check if permission was already granted. If so, return true.
    return fileHandle.queryPermission(options).then(res=> {
      if (res == 'granted')
        return fileHandle
      else
        return fileHandle.requestPermission(options).then(res=> {
          if (res == 'granted')
            return fileHandle
          else
            return false
        })  
    }).catch(err =>{
      return false;
    })
  }
  
  selectedNodesChange(val){
    //console.log(val)
  }
  /**
   * 
   * @param {Event} ev 
   */
  onWorkAreaClicked(ev){
    //console.log(ev);
    /** @type {HTMLElement} */
    var target = ev.target;
    if (!this.ctrlPressed) {
      if (target.classList.contains("AS3jog") && target.classList.contains("BackgroundNode")) {
        //DOM(this.page).find(".AS3jog").hide();
        this.jogVisible = !this.jogVisible;
        this.hideOrShowJog();
      }

      if (target.classList.contains("TabNode")) {
        var layerN = Number(target.getAttribute("layerN"));
        var parentN = Number(target.getAttribute("parentN"));
        //get tabs that belong to the same controller
        /** @type {TabNode[]} */
        var tabs = Objects.filter(this.parser.getNodes(), node=> node.region == this.data.controller && node instanceof TabNode )
        //get tabs that belong to the same parent
        var visibleLayers = [layerN];
        function addParentToVisible(parentN){
          var parent = Objects.find(tabs, node=> node.layerN == parentN );
          //add tab parent
          if (parent) {
            visibleLayers.unshift(parent.layerN);
            if (parent.parentN > 0)
            addParentToVisible(parent.parentN)
          }
        }
        addParentToVisible(parentN);
        //add all 1st level tabs
        /*Objects.forEach(tabs, tab=>{
          if (tab.parentN == 1) {
            visibleLayers.unshift(tab.layerN);
          }
        })*/

        visibleLayers.unshift(1);

        this.visibleLayers = visibleLayers;
        console.log(this.visibleLayers)

        /*if (this.mainArea.children[0])
          this.mainArea.children[0].remove();
        this.mainArea.appendChild(this.renderControls(this.data.controller, this.parser.getNodes(),"AS3"));*/
        //remember the node
        /** @type {TabNode} */
        var node = target.UCNode;
        this.renderMainArea();
        //re-aquire the target after re-rendering!
        target = node.el;

      }
    }

    if (this.altPressed) {
      let WA = DOM(this.workArea);
      let x = ev.clientX + this.workArea.scrollLeft - WA.offsetLeft()
      let y = ev.clientY + this.workArea.scrollTop - WA.offsetTop()

      let controlsUnder = this.getElementsUnder(this.workArea, x, y);
      let fill = Objects.find(controlsUnder, f=>f.classList.contains('FillNode'));
      if (fill) {
        target = fill;
      }
      //alt is pressed. find if a FillNode is located under the pointer
    }

    var controllType = target.getAttribute("controllType");

    if (controllType) {
      if (this.selectElement(target, this.ctrlPressed)){
        this.editSelectedNodes();
      }
    }
  }

  areSelectedElementsSimilar(){
    return this.selectedNodes.every(a => a.constructor.name==this.selectedNodes[0].constructor.name)
  }

  /**
   * 
   * @param {CNode} node 
   */
  selectNode(node){

    if (node instanceof PictureNode) {
      this.onEditPictureListClicked().then(p=>{
        Objects.forEach(p.gallery.items, (item, i)=>{
          if (item.picture==node) {
            p.gallery.setSelectedIndex(i);
            return false;
          }
        });

      });
    } else {
      this.selectElement(node.el, false);
      this.editSelectedNodes();
    } 
  }

  /**
   * 
   * @param {HTMLElement} elem 
   * @param {boolean} selectMultiple
   */
  selectElement(elem, selectMultiple){
    if (!elem['UCNode']) return false;

    var node = elem['UCNode'];

    if (this.selectedNodes.length >0 && this.selectedNodes[0].container !== node.container) {
      //all selected items must be from the same container
      this.unselectElements();
    }

    if (elem.classList.contains("selected")){
      elem.classList.remove("selected");
      this.selectedNodes = Objects.filter(this.selectedNodes, el=>el !== node)  
      return true;
    }

    if (!selectMultiple){
      this.unselectElements();
    }
    //console.log(this.selectedNodes);
    this.selectedNodes.push(node);
    
    //console.log(this.selectedNodes);

    elem.classList.add("selected");
    
    return true;
  }
  
  unselectElements(){
    Objects.forEach(this.selectedNodes,node=>{
      if (node.el) {
        node.el.classList.remove("selected")
      }
    })
    this.selectedNodes = [];
  }

  /**
   * 
   * @param {HTMLDivElement} parentElement 
   * @param {number} x1 
   * @param {number} y1 
   * @param {number} x2 
   * @param {number} y2 
   */
  drawSelectBox (parentElement, x1, y1, x2, y2) {
    if (this.selectBox) {
      this.selectBox.remove();
    }

    this.selectBox = document.createElement('div');
    this.selectBox.className = "selectbox"
    parentElement.appendChild(this.selectBox);

    
    this.selectBox.style.left = Math.min(x1, x2) + "px";
    this.selectBox.style.top = Math.min(y1, y2) + "px";
    this.selectBox.style.width = Math.abs(x2-x1) + "px";
    this.selectBox.style.height = Math.abs(y2-y1) + "px";


  }
  /**
   * 
   * @param {HTMLDivElement} parentElement 
   * @param {number} x1 
   * @param {number} y1 
   * @param {number} x2 
   * @param {number} y2 
   */
  selectElementsWithin(parentElement, x1, y1, x2, y2) {
    var controls = DOM(parentElement).find(".UC-control");

    //Normalize the select direction
    var X1 = Math.min(x1,x2);
    var Y1 = Math.min(y1,y2);

    var X2 = Math.max(x1,x2);
    var Y2 = Math.max(y1,y2);

    controls.each(elem=>{
      var rect =elem.getBoundingClientRect();
     
      var elX = elem.UCNode.x;
      var elY = elem.UCNode.y;

      if ( X1 <= elX && elX+rect.width <= X2 &&
            Y1 <= elY && elY+ rect.height <= Y2
      ) {
        this.selectElement(elem, true);
      } 
    })
  }

    /**
   * 
   * @param {HTMLDivElement} parentElement 
   * @param {number} x 
   * @param {number} y 
   */
  getElementsUnder(parentElement, x, y) {
    var controls = DOM(parentElement).find(".UC-control");

    return Objects.filter(controls, elem=>{
      if (!elem.getBoundingClientRect) return false;
      var rect =elem.getBoundingClientRect();
     
      var elX = elem.UCNode.x;
      var elY = elem.UCNode.y;

      if ( x >= elX && elX+rect.width >= x &&
            y >= elY && elY+rect.height >= y
      ) {
        return true;
      } 
    })
  }

  /** @return {Promise<ResolvedPicture[]>} */
  getCurrentPictureList(){
    var pics = Objects.filter(this.pictures, p=>p.container == (this.selectedNodes[0]?.container || "AS3") )
    var items = []
    var promises = [];
    Objects.forEach(pics, picture=>{
      var filename1 = picture.picture_up;
      var filename2 = picture.picture_down;
      var ret1 = {
        picN: picture.controllN,
        picture: picture,
        picture_up: picture.picture_up,
        picture_up_name:filename1,
        picture_down: picture.picture_down,
        picture_down_name:filename2,
      }
      
      if (this.dirHandle) {
        if (filename1)
        promises.push(FileHelpers.getDirectoryFileContents(this.dirHandle, filename1).then(contents=>{
          ret1.picture_up = contents;
        }).catch(err=>{
          this.renderErrors.push({type:"Error", message: "Unable to load " + filename1 +" " + err.message, node:picture})
          //console.error(err)
        }));

        if (filename2)
        promises.push(FileHelpers.getDirectoryFileContents(this.dirHandle, filename2).then(contents=>{
          ret1.picture_down = contents;
        }).catch(err=>{
          //console.error(filename2);
          //console.error(err);
          this.renderErrors.push({type:"Error", message: "Unable to load " + filename1 +" " + err.message, node:picture})

        }));

      } else {
        ret1.picture_up = `UCCNC/${picture.picture_up}`
        ret1.picture_down = `UCCNC/${picture.picture_down}`
      }

      items.push(ret1);
    })
    return Promise.allSettled(promises).then(_=>{
      return items;
    });

  }

  editSelectedNodes(){
    this.dataClean.controller = this.data.controller;
    //clean all data
    Objects.overwrite(this.data, this.dataClean);

    if (this.selectedNodes.length > 0){
       this.getCurrentPictureList().then(items=>{
        this.form.fields['picN'].items = items;
      });
    }
    
    if (this.selectedNodes.length == 1){
      var node = this.selectedNodes[0];
      this.data.controllType = node.constructor.name;
      this.data.controllTypeName = node.constructor.name;
      this.data.x = node.x;
      this.data.y = node.y;
      this.data.w = node.w;
      this.data.h = node.h;
      this.data.layerN = node.layerN
      this.data.controllN = node.controllN;
            
      if (node instanceof ButtonNode) {
        this.data.buttonN = node.controllN;
        this.data.picN = node.picN;
        this.data.toggle = node.toggle;
        this.data.blink = node.blink;
        this.data.pictureSRC_up = node.picture.picture_up;
        this.data.pictureSRC_down = node.picture.picture_down;
      }
      if (node instanceof LedNode) {
        this.data.ledN = node.controllN;
        this.data.picN = node.picN
        this.data.blink = node.blink;
        this.data.pictureSRC_up = node.picture.picture_up;
        this.data.pictureSRC_down = node.picture.picture_down;
      }
      if (node instanceof BackgroundNode) {
        this.data.picN = node.picN
        this.data.pictureSRC_up = node.picture.picture_up;
        this.data.pictureSRC_down = node.picture.picture_down;
      }

      if (node instanceof FillNode) {
        this.data.color = argbToRGB(node.color);
        this.data.transparency = node.transparency;
      }
      if (node instanceof FieldNode) {
        this.data.fieldType = node.fieldType;
      }
      if (node instanceof FieldNode || node instanceof SliderNode) {
        this.data.fieldN = node.controllN;
        this.data.font = node.font;
        this.data.fontSize = node.fontSize;
        this.data.color = argbToRGB(node.color);
        this.data.colorName = this.data.color;
        this.data.align = node.align;
        this.data.min = node.min;
        this.data.max = node.max;
      }
      if (node instanceof CheckboxNode) {
        this.data.checkBoxN = node.controllN;
      }

      if (node instanceof SliderNode) {
        this.data.color = argbToRGB(node.color);
        this.data.color2 = argbToRGB(node.color2);
        this.data.vertical = node.vertical;
        this.data.clickable = node.clickable;
        this.data.min = node.min;
        this.data.max = node.max;
      }

      if (node instanceof CodeviewNode) {
        this.data.font = node.font;
        this.data.fontSize = node.fontSize;
      }

      if (node instanceof ListNode) {
        this.data.font = node.font;
        this.data.fontSize = node.fontSize;
        this.data.color = argbToRGB(node.color);
        this.data.transparency = node.transparency;
      }

      if (node instanceof TabNode) {
        this.data.font = node.font
        //this.data.fontSize = node.fontSize;
        //this.data.color = argbToRGB(node.color);
        //this.data.colorName = this.data.color;
        this.data.parentN = node.parentN
        this.data.align = node.align;
        this.data.picN = node.picN
        this.data.pictureSRC_up = node.picture.picture_up;
        this.data.pictureSRC_down = node.picture.picture_down;
      }

      if (node instanceof LabelNode) {
        this.data.font = node.font;
        this.data.fontSize = node.fontSize;
        this.data.value = node.value;
        this.data.color = node.color;
      }

    } else if (this.selectedNodes.length > 1 && this.areSelectedElementsSimilar()){
      this.data.controllType = this.selectedNodes[0].constructor.name;
      this.data.controllTypeName = this.data.controllType
      this.data.x = getSimilarProperty(this.selectedNodes, "x");
      this.data.y = getSimilarProperty(this.selectedNodes, "y");
      this.data.w = getSimilarProperty(this.selectedNodes, "w");
      this.data.h = getSimilarProperty(this.selectedNodes, "h");
      this.data.font = getSimilarProperty(this.selectedNodes, "font");
      this.data.fontSize = getSimilarProperty(this.selectedNodes, "fontSize");
      this.data.color = argbToRGB(getSimilarProperty(this.selectedNodes, "color"));
      this.data.color2 = argbToRGB(getSimilarProperty(this.selectedNodes, "color2"));
      this.data.picN = getSimilarProperty(this.selectedNodes, "picN");
      this.data.layerN = getSimilarProperty(this.selectedNodes, "layerN");
      this.data.parentN = getSimilarProperty(this.selectedNodes, "parentN");
      //this.data.controllN = getSimilarProperty(this.selectedNodes, "controllN");


      this.data.buttonN = getSimilarProperty(this.selectedNodes, "buttonN");
      this.data.ledN = getSimilarProperty(this.selectedNodes, "ledN");
      this.data.fieldN = getSimilarProperty(this.selectedNodes, "fieldN");
      this.data.checkBoxN = getSimilarProperty(this.selectedNodes, "checkBoxN");
      
      this.data.align = getSimilarProperty(this.selectedNodes, "align");
      this.data.toggle = getSimilarProperty(this.selectedNodes, "toggle");
      this.data.blink = getSimilarProperty(this.selectedNodes, "blink");
      this.data.min = getSimilarProperty(this.selectedNodes, "min");
      this.data.max = getSimilarProperty(this.selectedNodes, "max");
      this.data.transparency = getSimilarProperty(this.selectedNodes, "transparency");
      this.data.value = getSimilarProperty(this.selectedNodes, "value");
      this.data.fieldType = getSimilarProperty(this.selectedNodes, "fieldType");

    }else{
      this.data.controllType = null
    }

    this.form.validator.validateVisibility();
  }

  updateSelectedNodes(){
    if (this.selectedNodes.length == 1){
      var node = this.selectedNodes[0];
      node.x = this.data.x;
      node.y = this.data.y;

      if (node.controllN !== null && this.data.controllN !== null) {
        node.controllN = this.data.controllN;
      }

      node.layerN = this.data.layerN;
      if (this.data.w !== null)
        node.w = this.data.w;
      if (this.data.h !== null)
        node.h = this.data.h;
            
      if (node instanceof ButtonNode) {
        node.controllN = this.data.buttonN;
        node.picN = this.data.picN !== "" ? this.data.picN : null;
        if (node.picN === null) {
          //clear picture at this point
          node.picture = new PictureNode()
          node.picture.container = node.container;
          node.picture.region = node.region;
        }
        node.toggle = this.data.toggle;
      }

      if (node instanceof LedNode) {
        node.controllN = this.data.ledN;
        node.picN = this.data.picN;
        node.blink = this.data.blink;
      }

      if (node instanceof BackgroundNode) {
        node.picN = this.data.picN;
      }

      if (node instanceof FillNode) {
        node.color = RGBToargb(this.data.color);
        node.transparency = this.data.transparency;
      }

      if (node instanceof FieldNode) {
        node.fieldType = this.data.fieldType;
        node.controllN = this.data.fieldN;
        node.font = this.data.font;
        node.fontSize = this.data.fontSize;
        node.color = RGBToargb(this.data.color);
        node.align = this.data.align;
      }
      if (node instanceof CheckboxNode) {
        node.controllN = this.data.checkBoxN;
      }

      if (node instanceof SliderNode) {
        node.color =  RGBToargb(this.data.color);
        node.color2 = RGBToargb(this.data.color2);
        node.vertical = this.data.vertical;
        node.clickable = this.data.clickable;
        node.min = this.data.min;
        node.max = this.data.max;
      }

      if (node instanceof TabNode) {
        node.font = this.data.font;
        node.align = this.data.align;
        node.picN = this.data.picN;
        node.parentN = this.data.parentN;
      }

      if (node instanceof CodeviewNode) {
        node.font = this.data.font;
        node.fontSize = this.data.fontSize;
      }

      if (node instanceof ListNode) {
        node.font = this.data.font;
        node.fontSize = this.data.fontSize;
        node.color =  RGBToargb(this.data.color);
        node.transparency = this.data.transparency;
      }

      if (node instanceof LabelNode) {
        node.font = this.data.font;
        node.fontSize = this.data.fontSize;
        node.value = this.data.value;
        node.color = this.data.color;
      }
      
    } else if (this.selectedNodes.length > 1){
      Objects.forEach(this.selectedNodes, node=>{
        if (this.data.layerN !== null && node.layerN !== null)
        node.layerN = this.data.layerN;
        if (this.data.x !== null && node.x !== null)
        node.x = this.data.x;
        if (this.data.y !== null && node.y !== null)
        node.y = this.data.y;
        if (this.data.w !== null && node.w !== null)
        node.w = this.data.w;
        if (this.data.h !== null && node.h !== null)
        node.h = this.data.h;
        if (this.data.picN !== null && node.picN !== null)
        node.picN = this.data.picN;
        if (this.data.font !== null && node.font !== null)
        node.font = this.data.font;
        if (this.data.fontSize !== null && node.fontSize !== null)
        node.fontSize = this.data.fontSize;
        if (this.data.color !== null && node.color !== null)
        node.color = RGBToargb(this.data.color);
        if (this.data.align !== null && node.align !== null)
        node.align = this.data.align;
        if (this.data.toggle !== null && node.toggle !== null)
        node.toggle = this.data.toggle;
        if (this.data.blink !== null && node.blink !== null)
        node.blink = this.data.blink;
        if (this.data.parentN !== null && node.parentN !== null)
        node.parentN = this.data.parentN;

        if (this.data.value !== null && node.value !== null)
        node.value = this.data.value;
      })
    }
  }
  
  parse(text, pendingSave = false){
    this.clearAll()
    

    this.parser = new Parser()
    this.parser.parse(text);
    //this.renderControls(this.parser.getNodes());
    this.form.fields['controller'].items = this.getControllerItems()
    this.data.controller = this.form.fields['controller'].items[0].value;
    setTimeout(() => {
      this.form.onChange();
      this.saveHistorySnapshot()
      this.pendingSave = pendingSave;
    }, 100);
  
  }

  validateCurrentController(){
    this.renderErrors = [];
    var errs = this.parser.validateRegionNodes(this.data.controller);
    this.getCurrentPictureList().then(t=>{
      this.parseErrors.push( ...this.renderErrors);  
    });

    /** @type {BackgroundNode[]} */
    var nodes = Objects.filter(this.parser.getNodes(), node => node instanceof BackgroundNode && node.region==this.data.controller);
    var added = {}
    Objects.forEach(nodes, node => {
      if (added[node.layerN] && added[node.layerN]==node.container) {
        errs.push({type:"Error", message:"Duplicate Background " + node.controllN + ". Tab Layer Number "+ node.layerN +" already contains a background! UCCNC can render only one background for each tab!", node:node});
      } else {
        added[node.layerN]=node.container;
      }
    });
    
    this.parseErrors = errs;
  }

  get isScreensetLoaded(){
    return this.parser && this.parser.getNodes() && this.parser.getNodes().length > 0
  }

  /**
   * 
   * @param {string|null} controllName 
   * @param {CNode[]} nodes 
   */
  async renderControls(controllName, nodes, container){
    if (!controllName) return;

    var f = document.createElement("div");
    f.className="UC-screen";
    var nodes = Objects.filter(nodes, node => node.region==controllName && node.container == container);

    // @ts-ignore
    //var pictures = Objects.filter(nodes, n=> (n instanceof PictureNode ))

    /** @type {PictureNode[]} */
    // @ts-ignore
    var pictures = Objects.keyBy(Objects.filter(this.pictures, pic=>pic.container==container), 'controllN');
  
    /** @type {SetfieldNode[]} */
    // @ts-ignore
    var setFields = Objects.keyBy(Objects.filter(nodes, n=> (n instanceof SetfieldNode )), 'controllN');

    /** @type {FilterfieldtextNode[]} */
    // @ts-ignore
    var filterFields = Objects.keyBy(Objects.filter(nodes, n=> (n instanceof FilterfieldtextNode )), 'controllN');

    Objects.forEach(nodes, (anyNode)=>{
      // @ts-ignore
      if (anyNode.__proto__ instanceof ControlNode) {
        //If control inherits from ControlNode
        /** @type {ControlNode}*/
        // @ts-ignore
        var node = anyNode;
        
        if (!this.visibleLayers.includes(node.layerN)) {
          if (node instanceof TabNode && this.visibleLayers.includes(node.parentN )) {
            //tab visisble
          } else {
            return;
          }
        }
        /** @type {HTMLElement|HTMLSelectElement} */
        var el = null;
        if (node instanceof CodeviewNode) {
          el = document.createElement("select");
          // @ts-ignore
          el.multiple = true;
          el.style.fontFamily = node.font;
          //el.style.color = argbToRGB(node.color);
          el.style.fontSize = node.fontSize + "px";
          //el.style.backgroundColor =  argbToRGB(node.backgroundColor);
          el.style.opacity =  "0.5";
          //el.style.border = "none"
        } else if (node instanceof ListNode) {
          /** @type {HTMLSelectElement} */
          el = document.createElement("select");
          // @ts-ignore
          el.multiple = true;
          el.style.fontFamily = node.font;
          el.style.color = argbToRGB(node.color);
          el.style.fontSize = node.fontSize + "px";
          el.style.backgroundColor =  argbToRGB(node.backgroundColor);
          el.style.opacity =  Text.toString(node.transparency);
          //el.style.border = "none"
        } else {
          // @ts-ignore
          var el = document.createElement("div");
        }
        el.classList.add("UC-control");
        el.style.top = node.y+"px";
        el.style.left = node.x+"px";
        if (node.w !==null)
          el.style.width = node.w+"px";
        if (node.h !==null)
          el.style.height = node.h+"px";

        if (node instanceof CodeviewNode)  {
          el.style.width = (node.w+22) + "px";
        }
        if (!this.jogVisible && node.container=="AS3jog") {
          if (node instanceof BackgroundNode) {
            
            //el.style.width = jojPanelSize.value + "px";
          } else {
            //return;
          }
        }

        el.classList.add(node.container);
        
        el.classList.add(node.constructor.name);

        var isTabSelected = false;
        if (node instanceof TabNode) {
          if ( this.visibleLayers.includes(node.layerN)) {
            isTabSelected = true;
          }
        }

        if ((node instanceof BackgroundNode || node instanceof LedNode || node instanceof ButtonNode || node instanceof TabNode)){
          if (node.picN == null || !pictures[node.picN]){
            node.picture = new PictureNode()
            node.picture.container = node.container;
            node.picture.region = node.region;
          } else {
                      
            node.picture = pictures[node.picN];

            if (this.dirHandle) {
              var filename2 = pictures[node.picN].picture_down;// Text.fileFullName(pictures[node.picN].picture_down);
              if (filename2)
              FileHelpers.getDirectoryFileHandleAndContents(this.dirHandle, filename2).then(ret=>{
                node.picture.picture_down_handle = ret.fileHandle;
                if (node instanceof TabNode && !isTabSelected)
                  el.style.backgroundImage = `url(${ret.contents})`;
              }).catch(err=>{
                console.error(err);
              })
              var filename1 = pictures[node.picN].picture_up ;//Text.fileFullName(pictures[node.picN].picture_up);
              if (filename1)
              FileHelpers.getDirectoryFileHandleAndContents(this.dirHandle, filename1).then(ret=>{
                node.picture.picture_up_handle = ret.fileHandle;
                if (!(node instanceof TabNode) || isTabSelected)
                  el.style.backgroundImage = `url(${ret.contents})`;
              }).catch(err=>{
                console.error(err);
              })
            } else {
              el.style.backgroundImage = `url(UCCNC/${pictures[node.picN].picture_up})`;
            }
          }
          el.style.border = "none"
        } else {
          el.textContent = node.constructor.name;
        }

        if (node instanceof SliderNode) {
          var el_line = document.createElement("div")
          el_line.className = "SliderNodeLine";
          el_line.style.backgroundColor = argbToRGB(node.color2);

          var el_sl = document.createElement("div")
          el_sl.className = "SliderNodeSlider";
          el_sl.style.backgroundColor = argbToRGB(node.color);
          if (node.vertical) {
            el.classList.add("vertical")
            el.style.width = "15px";
            el.style.height = node.w+"px";
          } else {
            el.style.width = node.w+"px";
            el.style.height = "15px";
          }
          el.textContent = '';
          el.appendChild(el_line)
          el.appendChild(el_sl)
          
        }

        if (node instanceof FieldNode) {
          el.style.fontFamily = node.font;
          el.style.color = argbToRGB(node.color);
          el.style.fontSize = node.fontSize * 0.85 + "px";
          el.style.height = (node.fontSize * 1.25 ) +"px";
         
          el.classList.add(node.fieldType);
          
          if (filterFields[node.controllN]) {
            node.filterField = filterFields[node.controllN]
          }

          if (setFields[node.controllN]) {
            node.setField = setFields[node.controllN]
          }

          if (setFields[node.controllN] != null && Text.toString(setFields[node.controllN].value).trim()) {
            el.textContent = setFields[node.controllN].value;
            //el.style.border = "none"
            //el.style.height = "auto";

          } else {
            if ( (node.min || node.max) || (filterFields[node.controllN] && Text.toString(filterFields[node.controllN].value).trim().includes("."))) {
              el.textContent = "0.0000"
              //el.style.border = "none"
              //el.style.height = "auto";
            }
          }

          if (!el.textContent) {
            el.textContent = "&nbsp;"
          }
           
        }

        if (node instanceof LabelNode) {
          el.style.fontFamily = node.font;
          el.style.color = argbToRGB(node.color);
          el.style.fontSize = node.fontSize + "px";
          el.textContent = node.value
          el.style.border = "none"
        }

        node.el = null;
        var comment = document.createComment(JSON.stringify(node, null, '  '));
        el.appendChild(comment);

        if (node instanceof ButtonNode) {
          if (node.toggle)
            el.style.backgroundSize = "200% 100%";
        }

        if (node instanceof LedNode) {
          el.style.backgroundSize = "200% 100%";
        }


        if (node instanceof FieldNode) {
          el.style.textAlign = node.align;
        }

        if (node instanceof FillNode) {
          el.style.backgroundColor = argbToRGB(node.color);
        }

        if (node instanceof ListNode || node instanceof FillNode) {
          el.style.opacity = node.transparency
        }

        if (node instanceof TabNode) {
          el.setAttribute("layerN", node.layerN.toString());
          el.setAttribute("parentN", node.parentN.toString());
          //tab visisble
        }

        if (node instanceof CheckboxNode || node instanceof ColorNode) {
          el.textContent = "";
        }

        //add attributes used to find control on click
        el.setAttribute("controllType", node.constructor.name);
        el.setAttribute("controllN", Text.toString(node.controllN));
        el.setAttribute("container", node.container);

        if (this.selectedNodes.includes(node)) {
          el.classList.add("selected");
        }

        el['UCNode'] = node;
        //EWW create circular dependency! 
        node.el = el;

        f.appendChild(el);


      }
    });

    return f;
  }
  hideOrShowJog(){
    /** @type {BackgroundNode} */
    // @ts-ignore
    var jojPanel = Objects.find(this.parser.getNodes(), n=> (n instanceof BackgroundNode ) && n.region == this.data.controller && n.container=="AS3jog");
    /** @type {SetJogPanelTabSizeNode} */
    // @ts-ignore
    var jojPanelSize = Objects.find(this.parser.getNodes(), n=> (n instanceof SetJogPanelTabSizeNode ) && n.region == this.data.controller);
    if (!this.jogVisible) {
      if (jojPanel) {
        DOM(this.page).find(".UC-control.AS3jog").css({transform: `translatex(${-jojPanel.w + jojPanelSize.value}px)`})
      }
    }else{
      DOM(this.page).find(".UC-control.AS3jog").css({transform: `translatex(0px)`})
    }
  }

  getControllerItems(){
    return Objects.map(this.parser.getControllers(), el=>{
      return {value: el, title:el};
    });
  }

  onShowEmailClicked(){
    var p1="support@"
    var p2="zero-divide"
    var p3="net"
    
    Prompt("Forward all your inquiries to this email address:", ()=>{
      window.open(`mailto:${p1}${p2}.${p3}`, "new");
    }, "Contact Us",`${p1}${p2}.${p3}`);
  }

  get template (){
    return super.extendTemplate(super.template, template);
  }
  get donatecode(){
    return donatecode;
  }
}

var template = `
<div class="welcome" [if]="!this.isScreensetLoaded">
  <div class="welcome-box">
    <!--<div class="close-button"><button type="button" onlclick="this.onCloseWelcomeClicked()" class="btn btn-danger">X</button></div>-->
    <div class="mb-4 mt-2">
      Welcome to UCCNC Screen Editor by Eldar Gerfanov
    </div>

    <div class="mb-1" [if]="this.LastSession">
      <div class="text-danger" [if]="this.pendingSave">Warning, your last session was not saved to the disc!</div>
      Restore your last session on this computer:
    </div>
    <div class="mb-1" [if]="this.LastSession">
      <button type="button" class="btn btn-xl btn-primary" onclick="this.onRestoreSessionClicked()"><i class="fas fa-folder-open"></i> Restore Last Session</button>
    </div>

    <div class="mb-1">
      Start by loading a screenset from your computer:
    </div>
    <div class="mb-1">
      <button type="button" class="btn btn-xl btn-primary" onclick="this.onLoadScreensetClicked()"><i class="fas fa-folder-open"></i> Load Screenset</button>
    </div>
    <div class="mb1 text-center">
    -- or --
    </div>
    <div class="mb-1">
      <button type="button" class="btn btn-xl btn-primary" onclick="this.onLoadSampleScreensetClicked(1)">Load Sample Defaultscreenset</button>
    </div>
    <div class="mb-1">
      <button type="button" class="btn btn-xl btn-primary" onclick="this.onLoadSampleScreensetClicked(2)">Load Sample Default2019</button>
    </div>

    <div class="mb-1">
      Brought to you by<br><a href= "https://hsmadvisor.com" target="new"><img src="https://hsmadvisor.com/uploads/HSMAdvisor_LOGO_Small.png"></a><br>Speed And Feed Calculator for Professional CNC Programmers and Machinists. 
    </div>

    <div class="mb-1">
      For questions or suggestions: <span class="link" onclick="this.onShowEmailClicked()">show email</span>
    </div>

    <div class="m-3 text-center">
      <div [innerhtml]="this.donatecode"></div>
    </div>
    <div class="m-3 text-center">
      <i>This web app is designed to work on the latest Chrome browser</i>
    </div>
  </div>
</div>
<div class="wrapper" [show]="this.isScreensetLoaded">
  <div class="middle">
    <div class="" id="workarea" >
      <div class="" id="mainarea" ></div>
      <div class="" id="jogarea" ></div>
    </div>
  </div>
  <div class="right">
    <div class="buttons mb-1">
      <button type="button" class="" onclick="this.onLoadScreensetClicked()" title="Load Screenset ..."><i class="fas fa-folder-open"></i></button>
      <button type="button" [if]="this.fileHandle" class="" onclick="this.onSaveScreensetClicked()" title="Save Screenset" [disabled]="!this.pendingSave || this.parser.getNodes().length==0"><i class="fas fa-save"></i></button>
      <button type="button" class="" onclick="this.onSaveAsScreensetClicked()" title="Save Screenset As ..." [disabled]="this.parser.getNodes().length==0">Save As</button>
      <button type="button" [if]="this.data.controller" class="" title="Edit Screen Properties" onclick="this.onEditScreenProperttiesClicked()"><i class="fas fa-desktop"></i></button>
      <button type="button" [if]="this.data.controller" class="" title="Edit Picture List" onclick="this.onEditPictureListClicked()"><i class="fas fa-images"></i></button>
    </div>
    <div class="buttons mb-1">
      <button type="button" class="" [disabled]="this.history.length <= 1" title="Undo" onclick="this.onUndoClicked()"><i class="fas fa-undo"></i></button>
      <button type="button" [if]="this.selectedNodes.length > 0" class="" title="Duplicate Selected Controls" onclick="this.onDuplicateControlClicked()"><i class="fas fa-copy"></i></button>
      <button type="button" [if]="this.data.controller" class="" title="Create Control" onclick="this.onCreateControlClicked()"><i class="fas fa-plus-square"></i></button>
      <button type="button" [if]="this.selectedNodes.length > 0" class="danger" title="Delete Selected Controls" onclick="this.onDeleteControlsClicked()"><i class="fas fa-trash-alt"></i></button>
      <button type="button" [if]="this.isSelectedElementPictureGenSupported" class="" title="Generate Button Picture" onclick="this.onGenerateButtonClicked()"><i class="fas fa-file-image"></i></button>
 
    </div>
    <div class="buttons mb-1">
      
      <button type="button" [if]="this.selectedNodes.length > 2 && this.areSelectedElementsSimilar()" class="" title="Equal Vertical Spacing" onclick="this.onFitYClicked()"><i class="fas fa-arrows-alt-v"></i></button>
      <button type="button" [if]="this.selectedNodes.length > 2 && this.areSelectedElementsSimilar()" class="" title="Equal Horisontal Spacing" onclick="this.onFitXClicked()"><i class="fas fa-arrows-alt-h"></i></button>
      <button type="button" [if]="this.selectedNodes.length > 1" class="" title="Align Left" onclick="this.onAlignLeftClicked()"><i class="fas fa-align-left"></i></button>
      <button type="button" [if]="this.selectedNodes.length > 1" class="" title="Align Justify" onclick="this.onAlignJustifyClicked()"><i class="fas fa-align-justify"></i></button>
      <button type="button" [if]="this.selectedNodes.length > 1" class="" title="Align Right" onclick="this.onAlignRightClicked()"><i class="fas fa-align-right"></i></button>
    </div>
    
    <div [if]="this.parser.getNodes().length>0" class="mb-1">
      <div [component]="this.form"></div>
      
    </div>
    <div class="help-baloon">
      <div><b>Ctrl + LeftMouse</b> to select multiple items</div>
      <div><b>Shift + LeftMouse</b> to drag/resize items</div>
      <div><b>Alt + LeftMouse</b> to select Fill</div>
      <div class="mb-1">
        Contact us: <span class="link" onclick="this.onShowEmailClicked()">show email</span>
      </div>
    </div>

    <div class="error-baloon" [if]="this.parseErrors.length > 0" >
      <div><b>Parse Errors:</b></div>
      <div [foreach]="this.parseErrors as error">
        <span onclick="this.selectNode(error.node)" class="error-title clickable">{{error.type}}</span>{{error.message}}
      </div>
      
    </div>
  </div>
</div>

`;

function FetchFile(file){
  return fetch("UCCNC/Screens/"+file, {
    "headers": {
      "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,ru;q=0.7",
      "cache-control": "no-cache",
      "pragma": "no-cache"
    },
    "referrer": "http://snapwebapps.com/uccnceditor/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  }).then(res=>res.text());
}

function copyInstance(original){
  return Object.assign(
    Object.create(Object.getPrototypeOf(original)),
    original
  );
}

function getButtonsDropDown(srcItems){
  var buttons = Objects.copy(srcItems);
  var items = [];
  Objects.forEach(buttons, button=>{
    var matches = button.value.match(/^(\d+)-(\d+)$/);
    if (matches){
      //explde the following value: 123-345 into multiple items
      let i = 0, s=Number(matches[1]), e=Number(matches[2]);

      for (i=s; i<=e; i++) {
        //fix title according to current index offset
        var newtitle = button.title.replace(/(\d+)to\d+$/,(a,b,c)=> ""+(Number(b)+i-s).toString());

        items.push({ value: i, title: newtitle, text: button.text })
      }
    } else {
      items.push({ value: button.value, title: button.title, text: button.text })
    }
  })
  return items;
}