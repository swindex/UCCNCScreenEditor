import { Objects } from "leet-mvc/core/Objects";
import { Text } from "leet-mvc/core/text";

export class Parser {

  constructor() {
    /** @type {CNode[]} */
    this.nodes = []
    this.controllers = []
  }

  /**
   * 
   * @param {CNode} node 
   */
  insertNewNode(node) {
    //find the last node of the same type in the current region
    var index = null;
    //try to get the last element with the same region, container and type
    for (var i=this.nodes.length-1; i>=0 ; i--){
      if ( this.nodes[i].region == node.region && this.nodes[i].container === node.container && this.nodes[i].constructor.name === node.constructor.name) {
        index = i;
        break;
      }
    }
    //try to get the last element with the same region and type
    if (index == null)
    for (var i=this.nodes.length-1; i>=0 ; i--){
      if ( this.nodes[i].region == node.region && this.nodes[i].constructor.name === node.constructor.name) {
        index = i;
        break;
      }
    }
    //try to get the last element with the same region and SetJogPanelSizeNode
    if (index == null)
    for (var i=this.nodes.length-1; i>=0 ; i--){
      if ( this.nodes[i].region == node.region && this.nodes[i] instanceof SetJogPanelSizeNode) {
        index = i;
        break;
      }
    }
    if (index !== null) {
      //insert after
      index +=1;
      if (this.nodes[index] instanceof SetfieldNode || this.nodes[index] instanceof FilterfieldtextNode) {
        //if next field is setter, then insert after
        index += 1
      }
      if (this.nodes[index] instanceof SetfieldNode || this.nodes[index] instanceof FilterfieldtextNode) {
        //if next field is setter, then insert after
        index += 1
      }
      //insert node
      this.nodes.splice( index, 0, node );
    } else {
      console.error("Could not find a suitable place to insert node!");
    }
  }

  removeNode(node){
    this.nodes = Objects.filter(this.nodes, (el)=>{
      return el !== node;
    })
  }

  /**
   * 
   * @param {string} text 
   */
  parse(text){

    var nodes = text.split(/\n/g);
    this.nodes = Objects.map(nodes, (line)=>{
      var node = null;

      if (node = RegionStartNode.parse(line)) {
        this.controllers.push(node.region);
        return node;
      }

      if (node = RegionEndNode.parse(line)) {
        return node;
      }

      if (node = ButtonNode.parse(line)) {
        return node;
      }
      if (node = PictureNode.parse(line)) {
        return node;
      }
      if (node = TabNode.parse(line)) {
        return node;
      }

      if (node = FieldNode.parse(line)) {
        return node;
      }

      if (node = BackgroundNode.parse(line)) {
        return node;
      }

      if (node = LabelNode.parse(line)) {
        return node;
      }

      if (node = CheckboxNode.parse(line)) {
        return node;
      }

      if (node = LedNode.parse(line)) {
        return node;
      }

      if (node = ColorNode.parse(line)) {
        return node;
      }

      if (node = CodeviewNode.parse(line)) {
        return node;
      }

      if (node = ListNode.parse(line)) {
        return node;
      }

      if (node = ComboNode.parse(line)) {
        return node;
      }

      if (node = UCCAMNode.parse(line)) {
        return node;
      }

      if (node = ToolpathNode.parse(line)) {
        return node;
      }

      if (node = SliderNode.parse(line)) {
        return node;
      }

      if (node = FillNode.parse(line)) {
        return node;
      }

      if (node = SetfieldNode.parse(line)) {
        return node;
      }

      if (node = FilterfieldtextNode.parse(line)) {
        return node;
      }

      if (node = SetScreenSizeNode.parse(line)) {
        return node;
      }
      if (node = SetJogPanelSizeNode.parse(line)) {
        return node;
      }
      if (node = SetJogPanelTabSizeNode.parse(line)) {
        return node;
      }
      if (node = SetBitmapFolderNode.parse(line)) {
        return node;
      }

      return new TextNode(line)

    })
    
    var cRegion = null;
    Objects.forEach(this.nodes, function(node){
      if (node instanceof RegionStartNode) {
        cRegion = node.region;
      } else if (node instanceof RegionEndNode) {
        cRegion = null;
      } else {
        node.region = cRegion;
      }
    })

    console.log(`Total Nodes: ${this.nodes.length}`)
    //console.log(this.nodes);

    
    this.text = text;    
    return this.nodes
  }

  validateRegionNodes(region){
    var ret = [];
    Objects.forEach(this.nodes, (node)=>{
      if (node.region !== region) return;
      var errs = node.validate();
      if (errs) {
        ret.push( ...errs);
      }
    })
    return ret;
  }

  /**
   */
  getNodes(){
    return this.nodes;
  }

  getControllers(){
    return this.controllers;
  }

  getCCode(){
    var ret = [];
    Objects.forEach(this.nodes, node=>{
      var line = node.getCCode();
      ret.push(line);
    })
    return ret.join('\n');
  }
}

export class CNode {
  constructor(){
    /** @type {string} */
    this.region = null;
  }
  /** @return {any} */
  static parse(cCode = ""){
    throw new Error("Override base isMatch method!")
  }

  /** @return {{type:string, message:string, node: CNode}[]} */
  validate(){
    return null;
  }

  /** @return {string} */
  getCCode(){
    throw new Error("Override base getCCode method!")
  }
}

export class RegionStartNode extends CNode {
  constructor(){
    super();
  }
  /** @return {RegionStartNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/\/\/REGION (?<region>UC\w*|AXBB)/);
    if (!m) return null

    var ret = new RegionStartNode()
    ret.region = m.groups.region
    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `//REGION ${this.region}`
  }
}

export class RegionEndNode extends CNode {
  constructor(){
    super();
  }
  /** @return {RegionEndNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/\/\/ENDREGION (?<region>UC\w*)/);
    if (!m) return null

    var ret = new RegionEndNode()
    ret.region = m.groups.region
    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `//ENDREGION ${this.region}`
  }
}

export class PictureNode extends CNode {
  constructor(){
    super();
    
    this.picture_up = "";
    this.picture_down = "";
    this.picture_up_handle = null;
    this.picture_down_handle = null;
    this.mostlyFalse = false;
    this.container = undefined;
    this.controllN = undefined;
  }
  /** @return {PictureNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^(?<container>AS3|AS3jog)\.Loadpicture\s*\(\s*"(?<picture_up>[a-zA-Z0-9/\._\-\&\(\)\@\[\]\s]*)"\s*,\s*"(?<picture_down>[a-zA-Z0-9/\._\-\&\(\)\@\[\]\s]*)"\s*,\s*(?<controllN>\d*)\s*,\s*(?<mostlyFalse>true|false)\s*\)\s*;\s*/)
    if (!m) return null

    var ret = new PictureNode()
    ret.container = m.groups.container
    ret.picture_down = m.groups.picture_down !="null" ? m.groups.picture_down : null
    ret.picture_up = m.groups.picture_up !="null" ? m.groups.picture_up : null
    ret.controllN = Number(m.groups.controllN);
    ret.mostlyFalse = s2b(m.groups.mostlyFalse);

    return ret;
  }

  validate(){
    let err = [];
    if (this.picture_down == null) {
      err.push({type:"Error", message:`Picture ${this.controllN} can not have Null picture_down number.`, node: this});
    }
    if (this.picture_up == null) {
      err.push({type:"Error", message:`Picture ${this.controllN} can not have Null picture_up number.`, node: this});
    }
    return err;
  }

  /** @return {string} */
  getCCode(){
    return `${this.container}.Loadpicture("${this.picture_up}", "${this.picture_down}",${this.controllN}, ${b2s(this.mostlyFalse)});`
  }
}

export class ControlNode extends CNode {
  constructor(line) {
    super();
    /** @type {string|'AS3'|'AS3jog'} */
    this.container = "AS3"
    /** @type {HTMLElement} */
    this.el = null;
    this.x = 0;
    this.y = 0;
    this.w = null;
    this.h = null;
    this.controllN = 0
    this.layerN = 0;
  }

  /** @return {any} */
  static parse(cCode = ""){
    throw new Error("Override base isMatch method!")
  }

  /** @return {string} */
  getCCode(){
    throw new Error("Override base getCCode method!")
  }
}



export class TabNode extends ControlNode {
  constructor(){
    super();

    
    this.firstEmpty = "";
    this.font = "";
    this.align = "";
    this.n24 = 24;
    this.n0 = 24;
    this.parentN = 0;

    this.picN = null;
    /** @type {PictureNode} */
    this.picture = null;
  }
  /** @return {TabNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^(?<container>AS3|AS3jog)\.Addtab\s*\(\s*"(?<firstEmpty>[a-zA-Z0-9/\._\-\&\(\)\s]*)"\s*,\s*"(?<font>[a-zA-Z0-9/\._\-\&\(\)\s]*)"\s*,\s*"(?<align>[a-zA-Z0-9/\._\-\&\(\)\s]*)"\s*,\s*(?<n24>\d*)\s*,\s*(?<n0>\d*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<picN>\d*)\s*,\s*(?<layerN>\d*)\s*,\s*(?<parentN>\d*)\s*\)\s*;\s*/)
    if (!m) return null

    var ret = new TabNode()
    ret.container = m.groups.container
    ret.firstEmpty = m.groups.firstEmpty
    ret.font = m.groups.font
    ret.align = m.groups.align
    ret.n24 = Number(m.groups.n24);
    ret.n0 = Number(m.groups.n0);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);
    ret.layerN = Number(m.groups.layerN);
    ret.picN = Number(m.groups.picN);
    ret.parentN = Number(m.groups.parentN);


    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `${this.container}.Addtab("${this.firstEmpty}", "${this.font}", "${this.align}",${this.n24}, ${this.n0},${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${parseInt(this.h)}, ${this.picN}, ${this.layerN}, ${this.parentN});`
  }
}

export class ListNode extends ControlNode {
  constructor(){
    super();

    this.font = "";
    this.align = "";
    this.fontSize = 24;
    this.color = 0;
    this.transparency = 0;
    this.backgroundColor = -1
  }
  /** @return {ListNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^(?<container>AS3|AS3jog)\.Addlist\s*\(\s*"(?<font>[a-zA-Z0-9/\._\-\&\(\)\s]*)"\s*,\s*"(?<align>[a-zA-Z0-9/\._\-\&\(\)\s]*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[\-\d]*)\s*,\s*(?<nm1>[\-\d]*)\s*,\s*(?<transparency>[\.\d]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/)
    if (!m) return null

    var ret = new ListNode()
    ret.container = m.groups.container
    ret.font = m.groups.font
    ret.align = m.groups.align
    ret.fontSize = Number(m.groups.fontSize)
    ret.color = Number(m.groups.color)
    ret.backgroundColor = Number(m.groups.nm1);

    ret.transparency = Number(m.groups.transparency);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);
    ret.controllN = Number(m.groups.controllN);
    ret.layerN = Number(m.groups.layerN);


    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `${this.container}.Addlist("${this.font}", "${this.align}", ${this.fontSize}, ${this.color}, ${this.backgroundColor}, ${this.transparency}, ${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${parseInt(this.h)}, ${this.controllN}, ${this.layerN});`
  }
}

export class ComboNode extends ControlNode {
  constructor(){
    super();

    this.font = "";
    this.fontSize = 24;
    this.color = 0;
    this.n6 = 6
  }
  /** @return {ComboNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^(?<container>AS3|AS3jog)\.Addcombobox\s*\(\s*"(?<font>[a-zA-Z0-9/\._\-\&\(\)\s]*)"\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[\-\d]*)\s*,\s*(?<n6>[\-\d]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/)
    if (!m) return null

    var ret = new ComboNode()
    ret.container = m.groups.container
    ret.font = m.groups.font
    ret.fontSize = Number(m.groups.fontSize)
    ret.color = Number(m.groups.color)
    ret.n6 = Number(m.groups.n6);

    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);

    ret.controllN = Number(m.groups.controllN);
    ret.layerN = Number(m.groups.layerN);


    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `${this.container}.Addcombobox("${this.font}", ${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${this.fontSize}, ${this.color}, ${this.n6}, ${this.controllN}, ${this.layerN});`
  }
}

export class FieldNode extends ControlNode {
  constructor(){
    super();
   
    this.firstEmpty = "";
    this.font = "";
    this.align = "";
    this.fontSize = 24;
    this.color = 0;
    this.fieldType = "";
    this.min = 0;
    this.max = 0;

    /** @type {FilterfieldtextNode|null} */
    this.filterField = null;
    /** @type {FilterfieldtextNode|null} */
    this.setField = null;
  }
  /** @return {FieldNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^(?<container>AS3|AS3jog)\.Addfield\s*\(\s*"(?<firstEmpty>[^,]*)"\s*,\s*"(?<font>[^,]*)"\s*,\s*"(?<align>[^,]*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[^,]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*"(?<fieldType>[a-zA-Z0-9/\._\-\&\(\)\s]*)"\s*,\s*(?<min>[^,]*)\s*,\s*(?<max>[^,]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/)
    if (!m) return null

    var ret = new FieldNode()
    ret.container = m.groups.container;
    ret.firstEmpty = m.groups.firstEmpty
    ret.font = m.groups.font
    ret.align = m.groups.align
    ret.fontSize = Number(m.groups.fontSize);
    ret.color = Number(m.groups.color);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);

    ret.min = Number(m.groups.min);
    ret.max = Number(m.groups.max);

    ret.fieldType = m.groups.fieldType;
    ret.controllN = Number(m.groups.controllN);
    ret.layerN = Number(m.groups.layerN);


    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `${this.container}.Addfield("${this.firstEmpty}", "${this.font}", "${this.align}", ${this.fontSize}, ${this.color}, ${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, "${this.fieldType}", ${minMaxToString(this.min)}, ${minMaxToString(this.max)}, ${this.controllN}, ${this.layerN});`
  }
}

export class SliderNode extends ControlNode {
  constructor(){
    super();
   
    this.color = 0;
    this.color2 = 0;
    this.min = 0;
    this.max = 0;
    this.vertical = false
    this.clickable = false
  }
  /** @return {SliderNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^(?<container>AS3|AS3jog)\.Addslider\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<color>[^,]*)\s*,\s*(?<color2>[^,]*)\s*,\s*(?<min>[^,]*)\s*,\s*(?<max>[^,]*)\s*,\s*(?<vertical>true|false)\s*,\s*(?<clickable>true|false)\s*,\s*(?<fieldN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/)
    if (!m) return null

    var ret = new SliderNode()
    ret.container = m.groups.container;
   
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);

    ret.color =  Number(m.groups.color)
    ret.color2 =  Number(m.groups.color2)

    ret.vertical = s2b(m.groups.vertical)
    ret.clickable = s2b(m.groups.clickable)

    ret.min = Number(m.groups.min);
    ret.max = Number(m.groups.max);


    ret.controllN = Number(m.groups.fieldN);
    ret.layerN = Number(m.groups.layerN);


    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `${this.container}.Addslider(${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${this.color}, ${this.color2}, ${minMaxToString(this.min)}, ${minMaxToString(this.max)}, ${b2s(this.vertical)}, ${b2s(this.clickable)}, ${this.controllN}, ${this.layerN});`
  }
}

export class LabelNode extends ControlNode {
  constructor(){
    super();
    /** @type {string|'AS3'|'AS3jog'} */
    this.container = "AS3"
    
    this.value = "";
    this.font = "";
    this.align = "";
    this.fontSize = 24;
    this.color = 0;
    this.layerN = 0;
  }
  /** @return {LabelNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^(?<container>AS3|AS3jog)\.Addlabel\s*\(\s*"(?<value>[^"]*)"\s*,\s*"(?<font>[^,]*)"\s*,\s*"(?<align>[^,]*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[^,]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/)
    if (!m) return null

    var ret = new LabelNode()
    ret.container = m.groups.container;
    ret.value = m.groups.value
    ret.font = m.groups.font
    ret.align = m.groups.align
    ret.fontSize = Number(m.groups.fontSize);
    ret.color = Number(m.groups.color);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.layerN = Number(m.groups.layerN);

    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `${this.container}.Addlabel("${this.value}", "${this.font}", "${this.align}", ${this.fontSize}, ${this.color}, ${parseInt(this.x)}, ${parseInt(this.y)}, ${this.layerN});`
  }
}

export class CodeviewNode extends ControlNode {
  constructor(){
    super();
    /** @type {string|'AS3'|'AS3jog'} */
    this.container = "AS3"
    
    this.value = "";
    this.font = "";
    this.align = "";
    this.fontSize = 24;
    this.color = 0;
    this.layerN = 0;
  }
  /** @return {CodeviewNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^(?<container>AS3|AS3jog)\.Addcodeview\s*\(\s*"(?<value>[^,]*)"\s*,\s*"(?<font>[^,]*)"\s*,\s*"(?<align>[^,]*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[^,]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/)
    if (!m) return null

    var ret = new CodeviewNode()
    ret.container = m.groups.container;
    ret.value = m.groups.value
    ret.font = m.groups.font
    ret.align = m.groups.align
    ret.fontSize = Number(m.groups.fontSize);
    ret.color = Number(m.groups.color);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = 339;
    ret.layerN = Number(m.groups.layerN);

    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `${this.container}.Addcodeview("${this.value}", "${this.font}", "${this.align}", ${this.fontSize}, ${this.color}, ${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, 339, ${this.layerN});`
  }
}

export class CheckboxNode extends ControlNode {
  constructor(){
    super();
    /** @type {string|'AS3'|'AS3jog'} */
    this.container = "AS3"
    
    this.firstEmpty = "";
    this.font = "";
    this.align = "";
    this.fontSize = 24;
    this.n0 = 0;
    this.layerN = 0;
    this.controllN = 0
  }
  /** @return {CheckboxNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^(?<container>AS3|AS3jog)\.Addcheckbox\s*\(\s*"(?<firstEmpty>[^,]*)"\s*,\s*"(?<font>[^,]*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<n0>[^,]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/)
    if (!m) return null

    var ret = new CheckboxNode()
    ret.container = m.groups.container;
    ret.firstEmpty = m.groups.firstEmpty
    ret.font = m.groups.font
    ret.fontSize = Number(m.groups.fontSize);
    ret.n0 = Number(m.groups.n0);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.layerN = Number(m.groups.layerN);
    ret.controllN = Number(m.groups.controllN);
    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `${this.container}.Addcheckbox("${this.firstEmpty}", "${this.font}", ${this.fontSize}, ${this.n0}, ${parseInt(this.x)}, ${parseInt(this.y)}, ${this.controllN}, ${this.layerN});`
  }
}

export class ButtonNode extends ControlNode{
  constructor(line) {
    super();
    this.blink = false;
    this.toggle = false;

    this.picN = null;
    /** @type {PictureNode} */
    this.picture = null;

  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {ButtonNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addbutton\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<toggle>true|false)\s*,\s*(?<blink>true|false)\s*,\s*(?<picN>\d*|null)\s*,\s*(?<controllN>\d*|null)\s*,\s*(?<layerN>\d*|null)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new ButtonNode();
    ret.container = m.groups.container;
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);
    ret.layerN = Number(m.groups.layerN);
    ret.picN = m.groups.picN !== 'null' ? Number(m.groups.picN) : null;
    ret.controllN = m.groups.controllN !== 'null' ? Number(m.groups.controllN) : null;
    ret.blink = s2b(m.groups.blink);
    ret.toggle = s2b(m.groups.toggle);



    return ret;    
  }

  validate(){
    let err = [];
    if (this.picN == null) {
      err.push({type:"Error", message:"Button can not have Null picture number.", node: this});
    }
    if (this.controllN == null ) {
      err.push({type:"Error", message:"Button can not have Null controll number.", node: this});
    }
    return err;
  }

  getCCode(){
    return `${this.container}.Addbutton(${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${parseInt(this.h)}, ${b2s(this.toggle)}, ${b2s(this.blink)}, ${this.picN}, ${this.controllN}, ${this.layerN});`
  }
}

export class LedNode extends ControlNode{
  constructor(line) {
    super();
    this.blink = false;
    this.controllN = 0;

    this.picN = null;
    /** @type {PictureNode} */
    this.picture = null;

  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {LedNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addled\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<blink>true|false)\s*,\s*(?<picN>\d*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new LedNode();
    ret.container = m.groups.container;
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);
    ret.layerN = Number(m.groups.layerN);
    ret.picN = Number(m.groups.picN);
    ret.controllN = Number(m.groups.controllN);
    ret.blink = s2b(m.groups.blink);
    return ret;    
  }

  getCCode(){
    return `${this.container}.Addled(${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${parseInt(this.h)}, ${b2s(this.blink)}, ${this.picN}, ${this.controllN}, ${this.layerN});`
  }
}

export class ColorNode extends ControlNode{
  constructor(line) {
    super();
    this.controllN = 0;
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {ColorNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addcolorpick\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new ColorNode();
    ret.container = m.groups.container;
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);
    ret.layerN = Number(m.groups.layerN);
    ret.controllN = Number(m.groups.controllN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.Addcolorpick(${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${parseInt(this.h)}, ${this.controllN}, ${this.layerN});`
  }
}

export class UCCAMNode extends ControlNode{
  constructor() {
    super();
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {UCCAMNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.AddUCCAM\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new UCCAMNode();
    ret.container = m.groups.container;
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);
    ret.layerN = Number(m.groups.layerN);
    ret.controllN = Number(m.groups.controllN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.AddUCCAM(${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${parseInt(this.h)}, ${this.controllN}, ${this.layerN});`
  }
}

export class SetfieldNode extends CNode{
  constructor() {
    super();
    this.value = null;
    /** @type {'AS3'|'AS3jog'} */
    this.container = null;
    this.controllN = null;
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {SetfieldNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Setfieldtext\s*\(\s*"(?<value>[^"]*)"\s*,\s*(?<controllN>\d*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new SetfieldNode();
    ret.container = m.groups.container;
    ret.value = m.groups.value;
    ret.controllN = Number(m.groups.controllN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.Setfieldtext("${this.value}", ${this.controllN});`
  }
}

export class FilterfieldtextNode extends CNode{
  constructor() {
    super();
    this.value = null;
    /** @type {'AS3'|'AS3jog'} */
    this.container = null;
    this.controllN = null;
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {FilterfieldtextNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Filterfieldtext\s*\(\s*"(?<value>[^"]*)"\s*,\s*(?<controllN>\d*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new FilterfieldtextNode();
    ret.container = m.groups.container;
    ret.value = m.groups.value;
    ret.controllN = Number(m.groups.controllN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.Filterfieldtext("${this.value}", ${this.controllN});`
  }
}

export class SetJogPanelTabSizeNode extends CNode{
  constructor() {
    super();
    /** @type {'AS3'|'AS3jog'|string} */
    this.container = null;
    this.value = null;
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {SetJogPanelTabSizeNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Setjogpaneltabsize\s*\(\s*(?<width>\d*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new SetJogPanelTabSizeNode();
    ret.container = m.groups.container;
    ret.value = Number(m.groups.width);

    return ret;    
  }

  getCCode(){
    return `${this.container}.Setjogpaneltabsize(${this.value});`
  }
}

export class SetScreenSizeNode extends CNode{
  constructor() {
    super();
    /** @type {'AS3'|'AS3jog'} */
    this.container = null;
    this.w = null;
    this.h = null;
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {SetScreenSizeNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3)\.Setscreensize\s*\(\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new SetScreenSizeNode();
    ret.container = m.groups.container;
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);

    return ret;    
  }

  getCCode(){
    return `${this.container}.Setscreensize(${parseInt(this.w)}, ${parseInt(this.h)});`
  }
}
export class SetJogPanelSizeNode extends CNode{
  constructor() {
    super();
    /** @type {'AS3'|'AS3jog'} */
    this.container = null;
    this.w = null;
    this.h = null;
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {SetJogPanelSizeNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3jog)\.Setscreensize\s*\(\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new SetJogPanelSizeNode();
    ret.container = m.groups.container;
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);

    return ret;    
  }

  getCCode(){
    return `${this.container}.Setscreensize(${parseInt(this.w)}, ${parseInt(this.h)});`
  }
}

export class SetBitmapFolderNode extends CNode{
  constructor() {
    super();
    /** @type {string} */
    this.path = null;
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {SetBitmapFolderNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^string bitmapfolder\s*=\s*"(?<path>[^"]*)"\s*;\s*$/)
    if (!m) return null;

    var ret = new SetBitmapFolderNode();
    ret.path = m.groups.path;

    return ret;    
  }

  getCCode(){
    return `string bitmapfolder = "${this.path}";`
  }
}

export class ToolpathNode extends ControlNode{
  constructor() {
    super();
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {ToolpathNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addtoolpath\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new ToolpathNode();
    ret.container = m.groups.container;
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);
    ret.layerN = Number(m.groups.layerN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.Addtoolpath(${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${parseInt(this.h)}, ${this.layerN});`
  }
}

export class BackgroundNode extends ControlNode{
  constructor(line) {
    super();
    this.backgroundN = 0;

    this.picN = null;
    /** @type {PictureNode} */
    this.picture = null;
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {BackgroundNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addbackground\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<picN>\d*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new BackgroundNode();
    ret.container = m.groups.container;
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);

    ret.picN = Number(m.groups.picN);
    ret.controllN = Number(m.groups.controllN);
    ret.layerN = Number(m.groups.layerN);
    //ret.controllN = ret.layerN //Number(m.groups.backgroundN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.Addbackground(${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${parseInt(this.h)}, ${this.picN}, ${this.controllN}, ${this.layerN});`
  }
}

export class FillNode extends ControlNode{
  constructor() {
    super();
    this.transparency = null
    this.color = null;
    this.n1 = null;
  }
  /**
   * 
   * @param {string} cCodeLine 
   * @return {FillNode|null}
   */
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addfill\s*\(\s*(?<color>\-?\d*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<transparency>[\d\.]*)\s*,\s*(?<n1>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*$/)
    if (!m) return null;

    var ret = new FillNode();
    ret.container = m.groups.container;
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);

    ret.color = Number(m.groups.color);
    ret.transparency = Number(m.groups.transparency);
    ret.n1 = Number(m.groups.n1);
    ret.layerN = Number(m.groups.layerN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.Addfill(${this.color}, ${parseInt(this.x)}, ${parseInt(this.y)}, ${parseInt(this.w)}, ${parseInt(this.h)}, ${this.transparency}, ${this.n1}, ${this.layerN});`
  }
}

export class TextNode extends CNode{
  constructor(line) {
    super()
    this.text = line;  
  }
  getCCode(){
    return this.text;
  }
}

export function b2s(val){
  return val ? "true" : "false"
}

export function s2b(val){
  return val=="true" ? true : false;
}

export function argbToRGB(color) {
  return '#'+ ('000000' + (color & 0xFFFFFF).toString(16)).slice(-6);
}

export function RGBToargb(color) {
  var normalized = normalColor(color);
  var digits = normalized.split('#')[1];
  return parseInt("0xFFF" + digits , 16) >> 32;
}

/**
 * 
 * @param {string} str - any color name or string
 * @return {string} - returns #FFFFFF type color
 */
export function normalColor(str){
  var ctx = document.createElement('canvas').getContext("2d");
  ctx.fillStyle = str;
  return ctx.fillStyle.toUpperCase();
}

export function getSimilarProperty(arr, prop){
  if (arr.every(a => a[prop]==arr[0][prop])) {
    return arr[0][prop];
  }
  return null;
}

export function minMaxToString(val){
  return Text.toString(val).toUpperCase();
}
