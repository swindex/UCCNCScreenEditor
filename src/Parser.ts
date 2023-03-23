import { Objects } from "leet-mvc/core/Objects";
import { Text } from "leet-mvc/core/text";

interface WriteOrder {
  nodeType: any
  screenName?: ScreenName
}

let re = new RegExp(/^(?<container>AS3|AS3jog)\.Addlist\s*\(\s*"(?<font>(?:\\.|[^\\"])*)"\s*,\s*"(?<align>(?:\\.|[^\\"])*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[\-\d]*)\s*,\s*(?<nm1>[\-\d]*)\s*,\s*(?<transparency>[\.\d]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/)
console.log('AS3.Addlist("Arial", "left", 18, -12212238, -1, 1, 300, 80, 380, 280, 1, 12);'.match(re));

export class Parser {
  nodes: CNode[] = [];
  controllers: string[] = []
  classes = [
    UCCNCEditorSettings,
    ButtonJSONNode,
    RegionStartNode,
    RegionStartNode2,
    RegionStartNode3,
    InitJogScreenNode,
    InitMainScreenNode,
    SetBitmapFolderNode,
    SetMaxPortNode,
    SetMaxPinNode,
    SetMaxAnaInPortNode,
    SetMaxAnaOutPortNode,
    Comment1Node,// "//Set main and jog screen properties",
    SetScreenSizeNode,
    SetJogPanelSizeNode,
    SetJogPanelTabSizeNode,
    Comment2Node,//"//Load images for main screen",
    Comment3Node,//"//Load images for jog screen",
    PictureNode,
    Comment4Node,//"//Add tabs to main screen",
    Comment5Node,//"//Add tabs to jog screen",
    TabNode,
    Comment6Node,//"//Add backgrounds to main screen",
    Comment6_1Node,
    BackgroundNode,
    Comment7Node,//"//Select the startup layers for the main screen",
    Comment8Node,//"//Select the startup layers for the jog screen",
    SelectLayerNode,
    Comment9Node,//"//Add buttons to main screen",
    Comment10Node,//"//Add buttons to jog screen",
    ButtonNode,
    Comment11Node,//"//Add textfields to main screen",
    Comment12Node,//"//Add textfields to jog screen",
    FieldNode,
    SetfieldtextNode,
    FilterfieldtextNode,
    Comment13Node,//"//Add LEDs to main screen",
    Comment14Node,//"//Add LEDs to jog screen",
    LedNode,
    Comment14_1Node,
    Comment15Node,//"//Add labels to jog screen",
    LabelNode,
    Comment16Node,//"//Add lists to main screen",
    Comment17Node,//"//Add lists to jog screen",
    ListNode,
    Comment18Node,//"//Add comboboxes to main screen",
    Comment19Node,//"//Add comboboxes to jog screen",
    ComboNode,
    ClearcomboboxitemsNode,
    AddcomboboxitemNode,
    ValidatenewcomboboxitemsNode,
    UpdatecomboboxselectionNode,
    Comment20Node,//"//Add codeviews to main screen",
    Comment21Node,//"//Add codeviews to jog screen",
    CodeviewNode,
    Comment22Node,//"//Add colorpickers to main screen",
    Comment23Node,//"//Add colorpickers to jog screen",
    ColorNode,
    Comment24Node,//"//Add CAMs to main screen",
    Comment25Node,//"//Add CAMs to jog screen",
    UCCAMNode,
    Comment26Node,//"//Add toolpaths to main screen",
    ToolpathNode,
    Comment27Node,//"//Add checkboxes to main screen",
    Comment28Node,//"//Add checkboxes to jog screen",
    CheckboxNode,
    Comment29Node,//"//Add sliders to main screen",
    Comment30Node,//"//Add sliders to jog screen",
    SliderNode,
    Comment31Node,//"//Add fills to main screen",
    Comment32Node,//"//Add fills to jog screen",
    FillNode,
    Comment33Node,//"//Add imageviews to main screen",
    Comment34Node,//"//Add imageviews to jog screen",
    BottomExecNode,
    Comment35Node,//"//Screenset footer",
    RegionEndNode2,
    RegionEndNode,
  ]
  constructor() {

  }

  getNodesWhere(region: string, container: ScreenName, nodeType: any){
    let nodes = this.nodes.filter(el=>{
      let ret = true
      if (isDescendantOf(el, CRNode) && region) {
        ret = ret && ((<CRNode>el).region == region)
      }
      if (isDescendantOf(el, ScreenControlNode) && container) {
        ret = ret && ((<ScreenControlNode>el).container == container)
      }
      if (nodeType) {
        ret = ret && (el.constructor.name == nodeType.name)
      }
      return ret;
    })
    return nodes;
  }


  writeOrder(){
    let elementOrder: WriteOrder[] = [
      {nodeType:RegionStartNode} ,
      {nodeType:RegionStartNode2} ,
      {nodeType:RegionStartNode3} ,
      {nodeType:InitJogScreenNode} ,
      {nodeType:InitMainScreenNode} ,
      {nodeType:SetBitmapFolderNode} ,
      {nodeType:SetMaxPortNode} ,
      {nodeType:SetMaxPinNode} ,
      {nodeType:SetMaxAnaInPortNode} ,
      {nodeType:SetMaxAnaOutPortNode} ,
      {nodeType:Comment1Node} ,// "//Set main and jog screen properties",
      {nodeType:SetScreenSizeNode, screenName: ScreenName.AS3} ,
      {nodeType:SetJogPanelSizeNode, screenName: ScreenName.AS3jog} ,
      {nodeType:SetJogPanelTabSizeNode, screenName: ScreenName.AS3jog} ,
      {nodeType:Comment2Node} ,//"//Load images for main screen",
      {nodeType:PictureNode, screenName: ScreenName.AS3} ,
      {nodeType:Comment3Node} ,//"//Load images for jog screen",
      {nodeType:PictureNode, screenName: ScreenName.AS3jog} ,
      {nodeType:Comment4Node} ,//"//Add tabs to main screen",
      {nodeType:TabNode, screenName: ScreenName.AS3} ,
      {nodeType:Comment5Node} ,//"//Add tabs to jog screen",
      {nodeType:TabNode, screenName: ScreenName.AS3jog} ,
      {nodeType:Comment6Node} ,//"//Add backgrounds to main screen",
      {nodeType:BackgroundNode, screenName: ScreenName.AS3} ,
      {nodeType:Comment6_1Node} ,//"//Add backgrounds to main screen",
      {nodeType:BackgroundNode, screenName: ScreenName.AS3jog} ,
      {nodeType:Comment7Node} ,//"//Select the startup layers for the main screen",
      {nodeType:SelectLayerNode, screenName: ScreenName.AS3} , //AS3.selectlayer(
      {nodeType:Comment8Node} ,//"//Select the startup layers for the jog screen",
      {nodeType:SelectLayerNode, screenName: ScreenName.AS3jog} , //AS3jog.selectlayer(
      {nodeType:Comment9Node} ,//"//Add buttons to main screen",
      {nodeType:ButtonNode, screenName: ScreenName.AS3} ,
      {nodeType:Comment10Node} ,//"//Add buttons to jog screen",
      {nodeType:ButtonNode, screenName: ScreenName.AS3jog} ,
      {nodeType:Comment11Node} ,//"//Add textfields to main screen",
      {nodeType:FieldNode, screenName: ScreenName.AS3},
      {nodeType:SetfieldtextNode, screenName: ScreenName.AS3},
      {nodeType:FilterfieldtextNode, screenName: ScreenName.AS3},
      {nodeType:Comment12Node} ,//"//Add textfields to jog screen",
      {nodeType:FieldNode, screenName: ScreenName.AS3jog},
      {nodeType:SetfieldtextNode, screenName: ScreenName.AS3jog},
      {nodeType:FilterfieldtextNode, screenName: ScreenName.AS3jog},
      {nodeType:Comment13Node} ,//"//Add LEDs to main screen",
      {nodeType:LedNode, screenName: ScreenName.AS3},
      {nodeType:Comment14Node} ,//"//Add LEDs to jog screen",
      {nodeType:LedNode, screenName: ScreenName.AS3jog},
      {nodeType:Comment14_1Node} ,//"//Add labels to main screen",
      {nodeType:LabelNode, screenName: ScreenName.AS3},
      {nodeType:Comment15Node} ,//"//Add labels to jog screen",
      {nodeType:LabelNode, screenName: ScreenName.AS3jog},
      {nodeType:Comment16Node} ,//"//Add lists to main screen",
      {nodeType:ListNode, screenName: ScreenName.AS3},
      {nodeType:Comment17Node} ,//"//Add lists to jog screen",
      {nodeType:ListNode, screenName: ScreenName.AS3jog},
      {nodeType:Comment18Node} ,//"//Add comboboxes to main screen",
      {nodeType:ComboNode, screenName: ScreenName.AS3} ,
      {nodeType:ClearcomboboxitemsNode, screenName: ScreenName.AS3},
      {nodeType:AddcomboboxitemNode, screenName: ScreenName.AS3},
      {nodeType:ValidatenewcomboboxitemsNode, screenName: ScreenName.AS3},
      {nodeType:UpdatecomboboxselectionNode, screenName: ScreenName.AS3},
      {nodeType:Comment19Node} ,//"//Add comboboxes to jog screen",
      {nodeType:ComboNode, screenName: ScreenName.AS3jog} ,
      {nodeType:ClearcomboboxitemsNode, screenName: ScreenName.AS3jog},
      {nodeType:AddcomboboxitemNode, screenName: ScreenName.AS3jog},
      {nodeType:ValidatenewcomboboxitemsNode, screenName: ScreenName.AS3jog},
      {nodeType:UpdatecomboboxselectionNode, screenName: ScreenName.AS3jog},
      {nodeType:Comment20Node} ,//"//Add codeviews to main screen",
      {nodeType:CodeviewNode, screenName: ScreenName.AS3},
      {nodeType:Comment21Node} ,//"//Add codeviews to jog screen",
      {nodeType:CodeviewNode, screenName: ScreenName.AS3jog},
      {nodeType:Comment22Node} ,//"//Add colorpickers to main screen",
      {nodeType:ColorNode, screenName: ScreenName.AS3} ,
      {nodeType:Comment23Node} ,//"//Add colorpickers to jog screen",
      {nodeType:ColorNode, screenName: ScreenName.AS3jog} ,
      {nodeType:Comment24Node} ,//"//Add CAMs to main screen",
      {nodeType:UCCAMNode, screenName: ScreenName.AS3},
      {nodeType:Comment25Node} ,//"//Add CAMs to jog screen",
      {nodeType:UCCAMNode, screenName: ScreenName.AS3jog},
      {nodeType:Comment26Node} ,//"//Add toolpaths to main screen",
      {nodeType:ToolpathNode, screenName: ScreenName.AS3},
      {nodeType:Comment27Node} ,//"//Add checkboxes to main screen",
      {nodeType:CheckboxNode, screenName: ScreenName.AS3} ,
      {nodeType:Comment28Node} ,//"//Add checkboxes to jog screen",
      {nodeType:CheckboxNode, screenName: ScreenName.AS3jog} ,
      {nodeType:Comment29Node} ,//"//Add sliders to main screen",
      {nodeType:SliderNode, screenName: ScreenName.AS3} ,
      {nodeType:Comment30Node} ,//"//Add sliders to jog screen",
      {nodeType:SliderNode, screenName: ScreenName.AS3jog} ,
      {nodeType:Comment31Node} ,//"//Add fills to main screen",
      {nodeType:FillNode, screenName: ScreenName.AS3} ,
      {nodeType:Comment32Node} ,//"//Add fills to jog screen",
      {nodeType:FillNode, screenName: ScreenName.AS3jog} ,
      {nodeType:Comment33Node} ,//"//Add imageviews to main screen",
      {nodeType:Comment34Node} ,//"//Add imageviews to jog screen",
      {nodeType:TextNode},
      {nodeType:Comment35Node} ,//"//Screenset footer",
      {nodeType:BottomExecNode},
      {nodeType:RegionEndNode2},
      {nodeType:RegionEndNode} ,
    ]
    return elementOrder;
  }

  /**
   * 
   * @param {CNode} node 
   */
  insertNewNode(node) {
    //find the last node of the same type in the current region
    var index = null;

    if (node instanceof ButtonJSONNode){
      //Insert at the top of file
      index = 0;
    }



    if (this.nodes[index] instanceof SetfieldtextNode || this.nodes[index] instanceof FilterfieldtextNode) {
      //get index of the partent FieldNode
      index = this.getLastNodeIndexWhere(function(el){
        return (el.region == node.region && el.container==node.container && el instanceof FieldNode && el.controllN == node.controllN)
      })
      if (index == null) {
        throw Error(`Can't fint the parent FieldNode ${node.controllN}`)
      }
    } else {
      //Find the last occurence of the same type of element in this region
      index = this.getLastNodeIndexWhere(function(el){
        return (el.region == node.region && el.container==node.container && el.constructor.name == node.constructor.name)
      })
    }

    if (index==null) {
      //get the last line for this region
      index = this.getLastNodeIndexWhere(function(el){
        return (el.region == node.region)
      })
    } else {
      //add new control to the next line
      index ++;
    }

    this.nodes.splice( index, 0, node );
  }

  /**
   * 
   * @param {function(ControlNode)} callback 
   * @returns 
   */
  getLastNodeIndexWhere(callback) {
    for (var i=this.nodes.length-1; i>=0 ; i--){
      if (callback(this.nodes[i])) {
        return i;
      }
    }
    return null;
  }

  removeNode(node) {
    if (!node) return;
    this.nodes = Objects.filter(this.nodes, (el)=>{
      if (node instanceof FieldNode) {
        this.removeNode(node.fieldText)
        this.removeNode(node.fieldFilter)
      }
      return el !== node;
    })
  }

  /**
   * 
   * @param {string} text 
   */
  parse(text:string){
    this.controllers = []
    var nodes_s = text.split(/\n/g);
    this.nodes = Objects.map(nodes_s, (line)=>{
      var node = null;



      if (node = RegionStartNode.parse(line)) {
        this.controllers.push(node.region);
        return node;
      }

      this.classes.find(cls => {
        node = cls.parse(line);
        return node;
      });

      if (node) 
        return node;

      return new TextNode(line)
    })
    
    var cRegion = null;
    this.nodes.forEach((node)=>{
      //Assign node regions
      if (node instanceof RegionStartNode) {
        cRegion = node.region;
      } else if ((node instanceof CRNode)){
        node.region = cRegion;
      } else {
        console.log(node);
      }
      //assign field nodes their texts and filters:
      if (node instanceof SetfieldtextNode) {
        let field = <FieldNode>(<any[]>this.nodes).find((el:FieldNode)=>el instanceof FieldNode && el.controllN == node.controllN && el.region == node.region  && el.container == node.container)
        if (field){
          field.fieldText = node;
        }
      }
      if (node instanceof FilterfieldtextNode) {
        let field = <FieldNode>(<any[]>this.nodes).find((el:FieldNode)=>el instanceof FieldNode && el.controllN == node.controllN && el.region == node.region  && el.container == node.container)
        if (field){
          field.fieldFilter = node;
        }
      }
      if (node instanceof RegionEndNode) {
        cRegion = null;
      }
    })

    var settings = Objects.find(this.nodes, node=> node instanceof UCCNCEditorSettings);
    if (!settings) {
      this.nodes.unshift(<any>new UCCNCEditorSettings());

    }

    console.log(`Total Nodes: ${this.nodes.length}`)
    return this.nodes
  }

  validateRegionNodes(region){
    var ret = [];
    Objects.forEach(this.nodes, (node)=>{
      if (node instanceof CRNode && node.region !== region) return;
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

  /**
   * @param enforceStructure - set this to true to export while enforcing structure of the screenset. very long task!
   */
  getCCode(enforceStructure:boolean=false){
    var ret = [];
    var nodes = [];
    if (enforceStructure) {
      nodes = nodes.concat(this.getNodesWhere(null,null,UCCNCEditorSettings));
      nodes = nodes.concat(this.getNodesWhere(null,null,ButtonJSONNode));

      this.controllers.forEach((region)=>{
        this.writeOrder().forEach(wo=>{
          nodes = nodes.concat(this.getNodesWhere(region,wo.screenName,wo.nodeType));
        })
      })

    } else {
      nodes=this.nodes;
    }

    nodes.forEach(node=>{
      var line = <string>node.getCCode();
      if (line !== null && line.trim().length > 0)
        ret.push(line);
    })
    return ret.join('\n');
  }
}

export class CNode {
  static parse(cCode:string):CNode{
    throw new Error("Override base parse method!")
  }

  validate():{type:string, message:string, node: CNode}[]{
    return null;
  }

  getCCode(): string{
    throw new Error("Override base getCCode method!")
  }
}

export class CRNode {
  region:string = null;
  
  static parse(cCode:string):CRNode{
    throw new Error("Override base parse method!")
  }

  validate():{type:string, message:string, node: CRNode}[]{
    return null;
  }

  getCCode(): string{
    throw new Error("Override base getCCode method!")
  }
}

export class ScreenControlNode extends CRNode {
  container: ScreenName = null;
  layerN: number = null;
}

export class RegionStartNode extends CRNode {
  constructor(){
    super();
  }
  /** @return {RegionStartNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/\/\/REGION (?<region>UC\w*|AXBB|SCREENPROPERTIES)/);
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

export class RegionEndNode extends CRNode {
  constructor(){
    super();
  }
  /** @return {RegionEndNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/\/\/ENDREGION (?<region>.*)/);
    if (!m) return null

    var ret = new RegionEndNode()
    //ret.region = m.groups.region
    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `//ENDREGION ${this.region}`
  }
}

export class PictureNode extends ScreenControlNode {
  picture_up: string = "";
  picture_down: string = "";
  picture_up_handle: any = null;
  picture_down_handle: any = null;
  mostlyFalse: boolean = false;
  container: string | undefined = undefined;
  controllN: number | undefined = undefined;

  static parse(cCode: string = ""): PictureNode | null {
    if (!cCode) return null;
    const m = cCode.match(/^(?<container>AS3|AS3jog)\.Loadpicture\s*\(\s*"(?<picture_up>[a-zA-Z0-9/\._\-\&\(\)\@\[\]\s]*)"\s*,\s*"(?<picture_down>[a-zA-Z0-9/\._\-\&\(\)\@\[\]\s]*)"\s*,\s*(?<controllN>\d*)\s*,\s*(?<mostlyFalse>true|false)\s*\)\s*;\s*/);
    if (!m) return null;

    const ret = new PictureNode();
    ret.container = m.groups!.container;
    ret.picture_down = m.groups!.picture_down !== "null" ? m.groups!.picture_down : null;
    ret.picture_up = m.groups!.picture_up !== "null" ? m.groups!.picture_up : null;
    ret.controllN = Number(m.groups!.controllN);
    ret.mostlyFalse = s2b(m.groups!.mostlyFalse);

    return ret;
  }

  validate() {
    let err: any[] = [];
    if (this.picture_down === null) {
      err.push({ type: "Error", message: `Picture ${this.controllN} can not have Null picture_down number.`, node: this });
    }
    if (this.picture_up === null) {
      err.push({ type: "Error", message: `Picture ${this.controllN} can not have Null picture_up number.`, node: this });
    }
    return err;
  }

  getCCode(): string {
    return `${this.container}.Loadpicture("${this.picture_up}", "${this.picture_down}",${this.controllN}, ${b2s(this.mostlyFalse)});`;
  }
}

export class TextNode extends CRNode{
  static matchPattern = /^.*/;
  text:string;
  constructor(line) {
    super()
    this.text = line;  
  }
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;


    var m = cCodeLine.match(this.matchPattern)
    if (!m) return null;

    let ret  = new this(m.input);
    return ret
  }
  getCCode(){
    return this.text;
  }
}

export class ControlNode extends ScreenControlNode {
  el: HTMLElement | null = null;
  x: number = 0;
  y: number = 0;
  controllN: number = 0;
}

export class ControlWHNode extends ControlNode {
  w: number | null = null;
  h: number | null = null;
}

export class ControlWNode extends ControlNode {
  w: number | null = null;
}

export class TabNode extends ControlWHNode {
  firstEmpty: string = "";
  font: string = "";
  align: string = "";
  n24: number = 24;
  n0: number = 24;
  parentN: number = 0;
  picN: number | null = null;
  picture: PictureNode | null = null;

  static parse(cCode: string = ""): TabNode | null {
    if (!cCode) return null;
    const m = cCode.match(/^(?<container>AS3|AS3jog)\.Addtab\s*\(\s*"(?<firstEmpty>(?:\\.|[^\\"])*)"\s*,\s*"(?<font>(?:\\.|[^\\"])*)"\s*,\s*"(?<align>(?:\\.|[^\\"])*)"\s*,\s*(?<n24>\d*)\s*,\s*(?<n0>\d*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<picN>\d*)\s*,\s*(?<layerN>\d*)\s*,\s*(?<parentN>\d*)\s*\)\s*;\s*/);
    if (!m) return null;

    const ret = new TabNode();
    ret.container = ScreenNameFromString(m.groups!.container);
    ret.firstEmpty = m.groups!.firstEmpty;
    ret.font = m.groups!.font;
    ret.align = m.groups!.align;
    ret.n24 = Number(m.groups!.n24);
    ret.n0 = Number(m.groups!.n0);
    ret.x = Number(m.groups!.x);
    ret.y = Number(m.groups!.y);
    ret.w = Number(m.groups!.w);
    ret.h = Number(m.groups!.h);
    ret.layerN = Number(m.groups!.layerN);
    ret.picN = Number(m.groups!.picN);
    ret.parentN = Number(m.groups!.parentN);

    return ret;
  }

  getCCode(): string {
    return `${this.container}.Addtab("${str(this.firstEmpty)}", "${str(this.font)}", "${str(this.align)}", ${this.n24}, ${this.n0}, ${num(this.x)}, ${num(this.y)}, ${num(this.w)}, ${num(this.h)}, ${this.picN}, ${this.layerN}, ${this.parentN});`;
  }
}

export class ListNode extends ControlWHNode {
  font: string = "";
  align: string = "";
  fontSize: number = 24;
  color: number = 0;
  transparency: number = 0;
  backgroundColor: number = -1;

  static parse(cCode: string = ""): ListNode | null {
    if (!cCode) return null;
    const re = new RegExp(
      /^(?<container>AS3|AS3jog)\.Addlist\s*\(\s*"(?<font>(?:\\.|[^\\"])*)"\s*,\s*"(?<align>(?:\\.|[^\\"])*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[\-\d]*)\s*,\s*(?<nm1>[\-\d]*)\s*,\s*(?<transparency>[\.\d]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/
    );
    var m = cCode.match(re);
    if (!m) return null;

    var ret = new ListNode();
    ret.container = ScreenNameFromString(m.groups!.container!);
    ret.font = m.groups!.font!;
    ret.align = m.groups!.align!;
    ret.fontSize = Number(m.groups!.fontSize);
    ret.color = Number(m.groups!.color);
    ret.backgroundColor = Number(m.groups!.nm1!);
    ret.transparency = Number(m.groups!.transparency);
    ret.x = Number(m.groups!.x);
    ret.y = Number(m.groups!.y);
    ret.w = Number(m.groups!.w);
    ret.h = Number(m.groups!.h);
    ret.controllN = Number(m.groups!.controllN);
    ret.layerN = Number(m.groups!.layerN);



    return ret;
  }

  getCCode(): string {
    return `${this.container}.Addlist("${str(this.font)}", "${str(this.align)}", ${this.fontSize}, ${this.color}, ${this.backgroundColor}, ${this.transparency}, ${num(
      this.x
    )}, ${num(this.y)}, ${num(this.w)}, ${num(this.h)}, ${
      this.controllN
    }, ${this.layerN});`;
  }
}

export class ComboNode extends ControlWNode {
  font:string = "";
  fontSize:number = 24;
  color:number = 0;
  n6:number = 6;

  static parse(cCode = ""): ComboNode | null {
      if (!cCode) return null;
      const m = cCode.match(/^(?<container>AS3|AS3jog)\.Addcombobox\s*\(\s*"(?<font>(?:\\.|[^\\"])*)"\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[\-\d]*)\s*,\s*(?<n6>[\-\d]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/);
      if (!m) return null;

      const ret = new ComboNode();
      ret.container = ScreenNameFromString(m.groups.container);
      ret.font = m.groups.font;
      ret.fontSize = Number(m.groups.fontSize);
      ret.color = Number(m.groups.color);
      ret.n6 = Number(m.groups.n6);

      ret.x = Number(m.groups.x);
      ret.y = Number(m.groups.y);
      ret.w = Number(m.groups.w);

      ret.controllN = Number(m.groups.controllN);
      ret.layerN = Number(m.groups.layerN);

      return ret;
  }

  getCCode(): string {
      return `${this.container}.Addcombobox("${str(this.font)}", ${num(this.x)}, ${num(this.y)}, ${num(this.w)}, ${this.fontSize}, ${this.color}, ${this.n6}, ${this.controllN}, ${this.layerN});`;
  }
}




/*
"AS3.Validatenewcomboboxitems(11);\r"
"AS3.Addcomboboxitem(\"Internal contour\", 11);\r"
AS3.Clearcomboboxitems(10);\r
AS3.Updatecomboboxselection(0,11);
*/

export class ValidatenewcomboboxitemsNode extends ScreenControlNode {
  controllN: number
  static parse(cCode = ""): ValidatenewcomboboxitemsNode | null {
      if (!cCode) return null;
      const m = cCode.match(/^(?<container>AS3|AS3jog)\.Validatenewcomboboxitems\s*\(\s*(?<controllN>[\d]*)\s*\)\s*;.*/);
      if (!m) return null;

      const ret = new ValidatenewcomboboxitemsNode();
      ret.container = ScreenNameFromString(m.groups.container);
      ret.controllN = Number(m.groups.controllN);

      return ret;
  }

  getCCode(): string {
      return `${this.container}.Validatenewcomboboxitems(${num(this.controllN)});`;
  }
}
export class AddcomboboxitemNode extends ScreenControlNode {
  value: string
  controllN: number
  static parse(cCode = "") {
      if (!cCode) return null;
      const m = cCode.match(/^(?<container>AS3|AS3jog)\.Addcomboboxitem\s*\(\s*"(?<text>(?:\\.|[^\\"])*)"\s*,\s*(?<controllN>[\d]*)\s*\)\s*;.*/);
      if (!m) return null;

      const ret = new AddcomboboxitemNode();
      ret.container = ScreenNameFromString(m.groups.container);
      ret.controllN = Number(m.groups.controllN);
      ret.value = m.groups.text;
      return ret;
  }

  getCCode(): string {
    return `${this.container}.Addcomboboxitem("${str(this.value)}",${num(this.controllN)});`;
  }
}
export class ClearcomboboxitemsNode extends ScreenControlNode {
  controllN: number
  static parse(cCode = "") {
      if (!cCode) return null;
      const m = cCode.match(/^(?<container>AS3|AS3jog)\.Clearcomboboxitems\s*\(\s*(?<controllN>[\d]*)\s*\)\s*;.*/);
      if (!m) return null;

      const ret = new ClearcomboboxitemsNode();
      ret.container = ScreenNameFromString(m.groups.container);
      ret.controllN = Number(m.groups.controllN);
      return ret;
  }

  getCCode(): string {
    return `${this.container}.Clearcomboboxitems(${num(this.controllN)});`;
  }
}
export class UpdatecomboboxselectionNode extends ScreenControlNode {
  controllN: number
  value: number
  static parse(cCode = "") {
      if (!cCode) return null;
      const m = cCode.match(/^(?<container>AS3|AS3jog)\.Updatecomboboxselection\s*\(\s*(?<value>[\d]*)\s*,\s*(?<controllN>[\d]*)\s*\)\s*;.*/);
      if (!m) return null;

      const ret = new UpdatecomboboxselectionNode();
      ret.container = ScreenNameFromString(m.groups.container);
      ret.controllN = Number(m.groups.controllN);
      ret.value = Number(m.groups.value);
      return ret;
  }

  getCCode(): string {
    return `${this.container}.Updatecomboboxselection(${num(this.value)}, ${num(this.controllN)});`;
  }
}

export class FieldNode extends ControlWNode {
  firstEmpty: string='';
  font: string='';
  align: string='';
  fontSize: number=24;
  color: number=0;
  fieldType: string='';
  min: number=0;
  max: number=0;
  fieldFilter: FilterfieldtextNode | null = null;
  fieldText: SetfieldtextNode | null = null;

  static parse(cCode = ''): FieldNode | null {
    if (!cCode) return null;

    const m = cCode.match(
      /^(?<container>AS3|AS3jog)\.Addfield\s*\(\s*"(?<firstEmpty>(?:\\.|[^\\"])*)"\s*,\s*"(?<font>(?:\\.|[^\\"])*)"\s*,\s*"(?<align>(?:\\.|[^\\"])*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[^,]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*"(?<fieldType>(?:\\.|[^\\"])*)"\s*,\s*(?<min>[^,]*)\s*,\s*(?<max>[^,]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/
    );
    if (!m) return null;

    const ret = new FieldNode();
    ret.container = ScreenNameFromString(m.groups!.container!);
    ret.firstEmpty = m.groups!.firstEmpty!;
    ret.font = m.groups!.font!;
    ret.align = m.groups!.align!;
    ret.fontSize = Number(m.groups!.fontSize);
    ret.color = Number(m.groups!.color);
    ret.x = Number(m.groups!.x);
    ret.y = Number(m.groups!.y);
    ret.w = Number(m.groups!.w);
    ret.min = Number(m.groups!.min);
    ret.max = Number(m.groups!.max);
    ret.fieldType = m.groups!.fieldType!;
    ret.controllN = Number(m.groups!.controllN);
    ret.layerN = Number(m.groups!.layerN);
    return ret;
  }

  getCCode(): string {
    let ret = `${this.container}.Addfield("${str(this.firstEmpty)}", "${str(this.font)}", "${str(this.align)}", ${this.fontSize}, ${this.color}, ${num(
      this.x.toString(),
    )}, ${num(this.y.toString())}, ${num(this.w.toString())}, "${this.fieldType}", ${minMaxToString(
      this.min,
    )}, ${minMaxToString(this.max)}, ${this.controllN}, ${this.layerN});`;

    return ret;
  }
}

export class SliderNode extends ControlWNode {
  color: number = 0;
  color2: number = 0;
  min: number = 0;
  max: number = 0;
  vertical: boolean = false;
  clickable: boolean = false;

  /** @return {SliderNode|null} */
  static parse(cCode = ""): SliderNode | null {
    if (!cCode) return null;
    const m = cCode.match(
      /^(?<container>AS3|AS3jog)\.Addslider\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<color>[^,]*)\s*,\s*(?<color2>[^,]*)\s*,\s*(?<min>[^,]*)\s*,\s*(?<max>[^,]*)\s*,\s*(?<vertical>true|false)\s*,\s*(?<clickable>true|false)\s*,\s*(?<fieldN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/
    );
    if (!m) return null;

    const ret = new SliderNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.color = Number(m.groups.color);
    ret.color2 = Number(m.groups.color2);
    ret.vertical = s2b(m.groups.vertical);
    ret.clickable = s2b(m.groups.clickable);
    ret.min = Number(m.groups.min);
    ret.max = Number(m.groups.max);
    ret.controllN = Number(m.groups.fieldN);
    ret.layerN = Number(m.groups.layerN);

    return ret;
  }

  /** @return {string} */
  getCCode(): string {
    return `${this.container}.Addslider(${num(this.x)}, ${num(this.y)}, ${num(this.w)}, ${this.color}, ${this.color2}, ${minMaxToString(this.min)}, ${minMaxToString(this.max)}, ${b2s(this.vertical)}, ${b2s(this.clickable)}, ${this.controllN}, ${this.layerN});`;
  }
}

export class LabelNode extends ControlNode {
  value:string = '';
  font:string  = '';
  align:string  = '';
  fontSize:number = 24;
  color:number = 0;
  layerN:number = 0;

  static parse(cCode = ''): LabelNode | null {
    if (!cCode) return null;
    const m = cCode.match(
      /^(?<container>AS3|AS3jog)\.Addlabel\s*\(\s*"(?<value>[^"]*)"\s*,\s*"(?<font>[^,]*)"\s*,\s*"(?<align>[^,]*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[^,]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/
    );
    if (!m) return null;

    const ret = new LabelNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.value = m.groups.value;
    ret.font = m.groups.font;
    ret.align = m.groups.align;
    ret.fontSize = Number(m.groups.fontSize);
    ret.color = Number(m.groups.color);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.layerN = Number(m.groups.layerN);

    return ret;
  }

  getCCode(): string {
    return `${this.container}.Addlabel("${this.value}", "${str(this.font)}", "${str(this.align)}", ${this.fontSize}, ${this.color}, ${num(this.x)}, ${num(this.y)}, ${this.layerN});`;
  }
}

export class CodeviewNode extends ControlWHNode {
  value:string = "";
  font:string = "";
  align:string = "";
  fontSize:number = 24;
  color:number = 0;
  layerN:number = 0;

  static parse(cCode = ""): CodeviewNode | null {
    if (!cCode) return null;
    const m = cCode.match(
      /^(?<container>AS3|AS3jog)\.Addcodeview\s*\(\s*"(?<value>[^,]*)"\s*,\s*"(?<font>[^,]*)"\s*,\s*"(?<align>[^,]*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<color>[^,]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/
    );
    if (!m) return null;

    const ret = new CodeviewNode();
    ret.container = ScreenNameFromString(m.groups!.container);
    ret.value = m.groups!.value!;
    ret.font = m.groups!.font!;
    ret.align = m.groups!.align!;
    ret.fontSize = Number(m.groups!.fontSize!);
    ret.color = Number(m.groups!.color!);
    ret.x = Number(m.groups!.x!);
    ret.y = Number(m.groups!.y!);
    ret.w = Number(m.groups!.w!);
    ret.h = 339;
    ret.layerN = Number(m.groups!.layerN!);

    return ret;
  }

  getCCode(): string {
    return `${this.container}.Addcodeview("${this.value}", "${str(this.font)}", "${str(this.align)}", ${this.fontSize}, ${this.color}, ${num(
      this.x,
    )}, ${num(this.y)}, ${num(this.w)}, 339, ${this.layerN});`;
  }
}

export class CheckboxNode extends ControlNode {
  firstEmpty:string = "";
  font:string = "";
  align:string = "";
  fontSize:number = 24;
  n0:number = 0;
  layerN:number = 0;
  controllN:number = 0
  
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^(?<container>AS3|AS3jog)\.Addcheckbox\s*\(\s*"(?<firstEmpty>(?:\\.|[^\\"])*)"\s*,\s*"(?<font>(?:\\.|[^\\"])*)"\s*,\s*(?<fontSize>\d*)\s*,\s*(?<n0>[^,]*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;\s*/)
    if (!m) return null

    var ret = new CheckboxNode()
    ret.container = ScreenNameFromString(m.groups.container);
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
    return `${this.container}.Addcheckbox("${str(this.firstEmpty)}", "${str(this.font)}", ${this.fontSize}, ${this.n0}, ${num(this.x)}, ${num(this.y)}, ${this.controllN}, ${this.layerN});`
  }
}

export class ButtonNode extends ControlWHNode{
  blink:boolean = false;
  toggle:boolean = false;
  picN:number = null;
  picture:PictureNode = null;

  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addbutton\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<toggle>true|false)\s*,\s*(?<blink>true|false)\s*,\s*(?<picN>\d*|null)\s*,\s*(?<controllN>\d*|null)\s*,\s*(?<layerN>\d*|null)\s*\)\s*;/)
    if (!m) return null;

    var ret = new ButtonNode();
    ret.container = ScreenNameFromString(m.groups.container);
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
    return `${this.container}.Addbutton(${num(this.x)}, ${num(this.y)}, ${num(this.w)}, ${num(this.h)}, ${b2s(this.toggle)}, ${b2s(this.blink)}, ${this.picN}, ${this.controllN}, ${this.layerN});`
  }
}

export class LedNode extends ControlWHNode{
  blink:boolean = false;
  toggle:boolean = false;
  picN:number = null;
  picture:PictureNode = null;

  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addled\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<blink>true|false)\s*,\s*(?<picN>\d*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;.*/)
    if (!m) return null;

    var ret = new LedNode();
    ret.container = ScreenNameFromString(m.groups.container);
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
    return `${this.container}.Addled(${num(this.x)}, ${num(this.y)}, ${num(this.w)}, ${num(this.h)}, ${b2s(this.blink)}, ${this.picN}, ${this.controllN}, ${this.layerN});`
  }
}

export class ColorNode extends ControlWHNode{
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addcolorpick\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;.*/)
    if (!m) return null;

    var ret = new ColorNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);
    ret.layerN = Number(m.groups.layerN);
    ret.controllN = Number(m.groups.controllN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.Addcolorpick(${num(this.x)}, ${num(this.y)}, ${num(this.w)}, ${num(this.h)}, ${this.controllN}, ${this.layerN});`
  }
}

export class UCCAMNode extends ControlWHNode{
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.AddUCCAM\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;.*/)
    if (!m) return null;

    var ret = new UCCAMNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);
    ret.layerN = Number(m.groups.layerN);
    ret.controllN = Number(m.groups.controllN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.AddUCCAM(${num(this.x)}, ${num(this.y)}, ${num(this.w)}, ${num(this.h)}, ${this.controllN}, ${this.layerN});`
  }
}

export class SetfieldtextNode extends ScreenControlNode{
  value: string = null;
  controllN: number = null;

  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Setfieldtext\s*\(\s*"(?<value>(?:\\.|[^\\"])*)"\s*,\s*(?<controllN>\d*)\s*\)\s*;.*/)
    if (!m) return null;

    var ret = new SetfieldtextNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.value = m.groups.value;
    ret.controllN = Number(m.groups.controllN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.Setfieldtext("${this.value}", ${this.controllN});`
  }
}

export class FilterfieldtextNode extends ScreenControlNode{
  value: string | null = null;
  container: ScreenName = null;
  controllN: number | null = null;

  static parse(cCodeLine: string): FilterfieldtextNode | null {
    if (!cCodeLine) return null;

    const m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Filterfieldtext\s*\(\s*"(?<value>(?:\\.|[^\\"])*)"\s*,\s*(?<controllN>\d*)\s*\)\s*;.*/);
    if (!m) return null;

    const ret = new FilterfieldtextNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.value = m.groups.value;
    ret.controllN = Number(m.groups.controllN);
    return ret;    
  }

  getCCode(): string {
    return `${this.container}.Filterfieldtext("${this.value}", ${this.controllN});`
  }
}

export class SetJogPanelTabSizeNode extends ScreenControlNode{
  value: number | null = null;

  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Setjogpaneltabsize\s*\(\s*(?<width>\d*)\s*\)\s*;.*/)
    if (!m) return null;

    var ret = new SetJogPanelTabSizeNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.value = Number(m.groups.width);

    return ret;    
  }

  getCCode(){
    return `${this.container}.Setjogpaneltabsize(${this.value});`
  }
}

export class SetScreenSizeNode extends ControlWHNode{
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3)\.Setscreensize\s*\(\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*\)\s*;.*/)
    if (!m) return null;

    var ret = new SetScreenSizeNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);

    return ret;    
  }

  getCCode(){
    return `${this.container}.Setscreensize(${num(this.w)}, ${num(this.h)});`
  }
}
export class SetJogPanelSizeNode extends ControlWHNode{
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3jog)\.Setscreensize\s*\(\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*\)\s*;.*/)
    if (!m) return null;

    var ret = new SetJogPanelSizeNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);

    return ret;    
  }

  getCCode(){
    return `${this.container}.Setscreensize(${num(this.w)}, ${num(this.h)});`
  }
}


export class SetBitmapFolderNode extends CRNode{
  path: string = null

  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^string bitmapfolder\s*=\s*"(?<path>[^"]*)"\s*;.*/)
    if (!m) return null;

    var ret = new SetBitmapFolderNode();
    ret.path = m.groups.path;

    return ret;    
  }

  getCCode(){
    return `string bitmapfolder = "${this.path}";`
  }
}

export class ToolpathNode extends ControlWHNode{
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addtoolpath\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<layerN>\d*)\s*\)\s*;.*/)
    if (!m) return null;

    var ret = new ToolpathNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);
    ret.layerN = Number(m.groups.layerN);
    return ret;    
  }

  getCCode(){
    return `${this.container}.Addtoolpath(${num(this.x)}, ${num(this.y)}, ${num(this.w)}, ${num(this.h)}, ${this.layerN});`
  }
}

export class BackgroundNode extends ControlWHNode{
  backgroundN: number = 0;
  picN: number = null;
  picture:PictureNode = null;

  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addbackground\s*\(\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<picN>\d*)\s*,\s*(?<controllN>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;.*/)
    if (!m) return null;

    var ret = new BackgroundNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.x = Number(m.groups.x);
    ret.y = Number(m.groups.y);
    ret.w = Number(m.groups.w);
    ret.h = Number(m.groups.h);

    ret.picN = Number(m.groups.picN);
    //ret.controllN = Number(m.groups.controllN);
    ret.layerN = ret.controllN = Number(m.groups.layerN);

    return ret;    
  }

  getCCode(){
    this.controllN = this.layerN
    return `${this.container}.Addbackground(${num(this.x)}, ${num(this.y)}, ${num(this.w)}, ${num(this.h)}, ${this.picN}, ${this.controllN}, ${this.layerN});`
  }
}

export class FillNode extends ControlWHNode{
  transparency: number = null
  color: number = null;
  n1: number = null;

  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.Addfill\s*\(\s*(?<color>\-?\d*)\s*,\s*(?<x>\-?[\d\.]*)\s*,\s*(?<y>\-?[\d\.]*)\s*,\s*(?<w>[\d\.]*)\s*,\s*(?<h>[\d\.]*)\s*,\s*(?<transparency>[\d\.]*)\s*,\s*(?<n1>\d*)\s*,\s*(?<layerN>\d*)\s*\)\s*;.*/)
    if (!m) return null;

    var ret = new FillNode();
    ret.container = ScreenNameFromString(m.groups.container);
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
    return `${this.container}.Addfill(${this.color}, ${num(this.x)}, ${num(this.y)}, ${num(this.w)}, ${num(this.h)}, ${this.transparency}, ${this.n1}, ${this.layerN});`
  }
}

export class RegionStartNode2 extends TextNode {
  static matchPattern=/^if\s*\(mainform\..*/
}
export class RegionStartNode3 extends TextNode {
  static matchPattern=/^\{[\s\r]*/
}

export class RegionEndNode2 extends TextNode {
  static matchPattern=/^\}[\s\r]*/
}

/*//REGION SCREENPROPERTIES
Optimised for 3:4 screen resolution.
//ENDREGION SCREENPROPERTIES*/

export class BottomExecNode extends TextNode {// int maxport = mainform.maxport;
  static matchPattern=/^mainform\.exec\..*/
}

export class InitJogScreenNode extends TextNode {// UCCNC.AS3interfaceClass AS3jog = mainform.AS3jog;
  static matchPattern=/^\s*UCCNC\.AS3interfaceClass\s*AS3jog\s*=.*/
}
export class InitMainScreenNode extends TextNode {// UCCNC.AS3interfaceClass AS3 = mainform.AS3;
  static matchPattern=/^\s*UCCNC\.AS3interfaceClass\s*AS3\s*=.*/
}
export class SetMaxPortNode extends TextNode {// int maxport = mainform.maxport;
  static matchPattern=/^\s*int\s+maxport\s*=.*/
}
export class SetMaxPinNode extends TextNode {// int maxpin = mainform.maxpin;
  static matchPattern=/^\s*int\s+maxpin\s*=.*/
}
export class SetMaxAnaInPortNode extends TextNode {// int maxAnaInport = mainform.maxAnaInport;
  static matchPattern=/^\s*int\s+maxAnaInport\s*=.*/
}
export class SetMaxAnaOutPortNode extends TextNode {// int maxAnaOutport = mainform.maxAnaOutport;
  static matchPattern=/^\s*int\s+maxAnaOutport\s*=.*/
}

export class SelectLayerNode extends ScreenControlNode { ////AS3.selectlayer(
  text: string;
  static parse(cCodeLine = ""){
    if (!cCodeLine) return null;

    var m = cCodeLine.match(/^(?<container>AS3|AS3jog)\.selectlayer\s*\(.*/)
    if (!m) return null;

    var ret = new SelectLayerNode();
    ret.container = ScreenNameFromString(m.groups.container);
    ret.text = m.input;
    return ret;    
  }
  getCCode(): string {
    return this.text;
  }
}


export class Comment1Node extends TextNode {// "//Set main and jog screen properties"
  static matchPattern=/^\/\/Set main and jog screen properties.*/
}
export class Comment2Node extends TextNode {//"//Load images for main screen"
  static matchPattern=/^\/\/Load images for main screen.*/
}
export class Comment3Node extends TextNode {//"//Load images for jog screen"
  static matchPattern=/^\/\/Load images for jog screen.*/
}
export class Comment4Node extends TextNode {//"//Add tabs to main screen"
  static matchPattern=/^\/\/Add tabs to main screen.*/
}
export class Comment5Node extends TextNode {//"//Add tabs to jog screen"
  static matchPattern=/^\/\/Add tabs to jog screen.*/
}
export class Comment6Node extends TextNode {//"//Add backgrounds to main screen"
  static matchPattern=/^\/\/Add backgrounds to main screen.*/
}
export class Comment6_1Node extends TextNode {//"//Add backgrounds to jog screen"
  static matchPattern=/^\/\/Add backgrounds to jog screen.*/
}
export class Comment7Node extends TextNode {//"//Select the startup layers for the main screen"
  static matchPattern=/^\/\/Select the startup layers for the main screen.*/
}
export class Comment8Node extends TextNode {//"//Select the startup layers for the jog screen"
  static matchPattern=/^\/\/Select the startup layers for the jog screen.*/
}
export class Comment9Node extends TextNode {//"//Add buttons to main screen"
  static matchPattern=/^\/\/Add buttons to main screen.*/
}
export class Comment10Node extends TextNode {//"//Add buttons to jog screen"
  static matchPattern=/^\/\/Add buttons to jog screen.*/
}
export class Comment11Node extends TextNode {//"//Add textfields to main screen"
  static matchPattern=/^\/\/Add textfields to main screen.*/
}
export class Comment12Node extends TextNode {//"//Add textfields to jog screen"
  static matchPattern=/^\/\/Add textfields to jog screen.*/
}
export class Comment13Node extends TextNode {//"//Add LEDs to main screen"
  static matchPattern=/^\/\/Add LEDs to main screen.*/
}
export class Comment14Node extends TextNode {//"//Add LEDs to jog screen"
  static matchPattern=/^\/\/Add LEDs to jog screen.*/
}
export class Comment14_1Node extends TextNode {//"/'//Add labels to main screen\r'
  static matchPattern=/^\/\/Add labels to main screen.*/
}
export class Comment15Node extends TextNode {//"//Add labels to jog screen"
  static matchPattern=/^\/\/Add labels to jog screen.*/
}
export class Comment16Node extends TextNode {//"//Add lists to main screen"
  static matchPattern=/^\/\/Add lists to main screen.*/
}
export class Comment17Node extends TextNode {//"//Add lists to jog screen"
  static matchPattern=/^\/\/Add lists to jog screen.*/
}
export class Comment18Node extends TextNode {//"//Add comboboxes to main screen"
  static matchPattern=/^\/\/Add comboboxes to main screen.*/
}
export class Comment19Node extends TextNode {//"//Add comboboxes to jog screen"
  static matchPattern=/^\/\/Add comboboxes to jog screen.*/
}
export class Comment20Node extends TextNode {//"//Add codeviews to main screen"
  static matchPattern=/^\/\/Add codeviews to main screen.*/
}
export class Comment21Node extends TextNode {//"//Add codeviews to jog screen"
  static matchPattern=/^\/\/Add codeviews to jog screen.*/
}
export class Comment22Node extends TextNode {//"//Add colorpickers to main screen"
  static matchPattern=/^\/\/Add colorpickers to main screen.*/
}
export class Comment23Node extends TextNode {//"//Add colorpickers to jog screen"
  static matchPattern=/^\/\/Add colorpickers to jog screen.*/
}
export class Comment24Node extends TextNode {//"//Add CAMs to main screen"
  static matchPattern=/^\/\/Add CAMs to main screen.*/
}
export class Comment25Node extends TextNode {//"//Add CAMs to jog screen"
  static matchPattern=/^\/\/Add CAMs to jog screen.*/
}
export class Comment26Node extends TextNode {//"//Add toolpaths to main screen"
  static matchPattern=/^\/\/Add toolpaths to main screen.*/
}
export class Comment27Node extends TextNode {//"//Add checkboxes to main screen"
  static matchPattern=/^\/\/Add checkboxes to main screen.*/
}
export class Comment28Node extends TextNode {//"//Add checkboxes to jog screen"
  static matchPattern=/^\/\/Add checkboxes to jog screen.*/
}
export class Comment29Node extends TextNode {//"//Add sliders to main screen"
  static matchPattern=/^\/\/Add sliders to main screen.*/
}
export class Comment30Node extends TextNode {//"//Add sliders to jog screen"
  static matchPattern=/^\/\/Add sliders to jog screen.*/
}
export class Comment31Node extends TextNode {//"//Add fills to main screen"
  static matchPattern=/^\/\/Add fills to main screen.*/
}
export class Comment32Node extends TextNode {//"//Add fills to jog screen"
  static matchPattern=/^\/\/Add fills to jog screen.*/
}
export class Comment33Node extends TextNode {//"//Add imageviews to main screen"
  static matchPattern=/^\/\/Add imageviews to main screen.*/
}
export class Comment34Node extends TextNode {//"//Add imageviews to jog screen"
  static matchPattern=/^\/\/Add imageviews to jog screen.*/
}
export class Comment35Node extends TextNode {//"//Screenset footer"
  static matchPattern=/^\/\/Screenset footer.*/
}

export class UCCNCEditorSettings extends CNode {
  settings = {
    buttonPresets : [],
    backgrounds : [],
  }
  error:Error = null;
  
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^\/\/UCCNCEDITORJSON\((?<json>.*)\)[\s\r]*$/)
    
    if (!m) return null

    var ret = new UCCNCEditorSettings()
    if (m.groups.json) {
      try {
        ret.settings = JSON.parse(m.groups.json);
      } catch (err) {
        ret.error = err;
        ret.settings = {
          buttonPresets : [],
          backgrounds : [],
        }
      }
    }
    return ret;
  }

  /** @return {string} */
  getCCode(){
    return `//UCCNCEDITORJSON(${JSON.stringify(this.settings)})`
  }
}

export class ButtonJSONNode extends CNode {
  picN:number = null;
  layerN:number = null;
  json:object = null;
  error:Error = null;
  region:string
  /** @return {ButtonJSONNode|null} */
  static parse(cCode = ""){
    if (!cCode) return null;
    var m = cCode.match(/^\/\/ButtonJSONNode\((?<json>.*)\)[\s\r]*$/)
    
    if (!m) return null

    var ret = new ButtonJSONNode()
    if (m.groups.json) {
      try {
        var body = JSON.parse(m.groups.json);
        ret.region = body.region;
        ret.json = body.json
        ret.picN = body.picN;
        ret.layerN = body.layerN;
      } catch (err) {
        ret.error = err;
      }
    }
    return ret;
  }

  /** @return {string} */
  getCCode(){
    if (!this.json || Object.keys(this.json).length ==0 ){
      return null;
    }
    return `//ButtonJSONNode(${JSON.stringify({ region: this.region, picN: this.picN, layerN: this.layerN, json: this.json})})`
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

export function normalColor(str:string){
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
  if (val=="" || val ==null) {
    return "0"
  }
  return Text.toString(val).toUpperCase();
}

function num(val:any){
  val = Number(val);
  return isNaN(val) ? 0 : String(val)
}

function frmtInlineJSON(json){
  if (!json) {
    return '';
  }

  if (json.error) {
    return ` //JSON(${json.json_str})`;
  } else {
    return ` //JSON(${JSON.stringify(json)})`;
  }
  
}

function isDescendantOf(obj, cls) {
  let proto = Object.getPrototypeOf(obj);
  while (proto != null){
      //console.log(obj, proto, cls);
      if (proto.constructor == cls) return true;
      proto = Object.getPrototypeOf(proto);
  }
  return false;
}

export enum ScreenName {
  AS3="AS3",
  AS3jog="AS3jog",
}

function ScreenNameFromString(val:string){
  if (Object.keys(ScreenName).includes(val)){
    return <ScreenName>val;
  }
  throw Error(`The value passed ${val} does not match any of the expected values: ${Object.keys(ScreenName)}`)
}
function str(str) {
  //escape double quotes!
  return str.replace(/([^\\])"/g, '$1\\"');
}