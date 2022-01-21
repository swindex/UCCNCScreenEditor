import { HeaderPage } from "leet-mvc/pages/HeaderPage/HeaderPage.js"
import { DOM } from "leet-mvc/core/DOM"
import { Objects } from "leet-mvc/core/Objects";
import { Forms } from "leet-mvc/components/Forms";
import "./EditorPage.scss";
import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import { ButtonNode, PictureNode, UCCNCEditorSettings } from "../Parser";
import { Text } from "leet-mvc/core/text";
import { Storage } from "leet-mvc/core/storage";
import { Alert, Confirm, Prompt } from "leet-mvc/core/simple_confirm";
import { FileHelpers } from "../FileHelpers";

export class EditorPage extends DialogPage {
  /**
   * 
   * @param {ButtonNode} button 
   * @param {FileSystemDirectoryHandle} dirHandle
   */
  constructor(button, dirHandle, jsonData){
    super();
    this.selector = "page-EditorPage"
    this.title = "UCCNC Button Creator"
    /** @type {File} */
    this.file=null;

    /** @type {FileSystemDirectoryHandle} */
    this.dirHandle = dirHandle;

    this.classNames.push('large');

    /** @type {CanvasRenderingContext2D} */
    this.cn_b_up = null;

    /** @type {CanvasRenderingContext2D} */
    this.cn_b_down = null;

    this.parser = new Parser()

    var fn = Text.fileName(button.picture.picture_up);
    fn = fn.replace(/_up|_down/,'');

    this.button = button;

    /** @type {UCCNCEditorSettings} */
    this.settings = null;

    this.data = {
      preset: null,
      controller: null,
      buttonBaseFileName: fn,
      buttonTitle:"Hello",
      buttonWidth: button.w*2,
      buttonHeight: button.h*2,
      buttonLineWidth: 6,
      buttonBorderRadius: 10,
      buttonBorderColor: "#F0CD46",
      buttonBackColor: "#FEFEFE",
      buttonBackColorEnd: "#CCC",
      buttonTextColor: "#444",
      buttonTextSize: button.h,
      isToggle: button.toggle,


      
      toggleStyle:{
        buttonBorderColor:  "",
        buttonBackColor:  "",
        buttonBackColorEnd:  "",
        buttonTextColor:  "",

        statusLineWidth: 6,
        statusDisabledColor: "#B3B6B6",
        statusEnabledColor: "#0F0",
      },
      downStyle:{
        buttonBorderColor: "",
        buttonBackColor: "#CCC",
        buttonBackColorEnd: "#FEFEFE",
        buttonTextColor: "",
      }

    };

    if (jsonData) {
      delete jsonData.buttonWidth;
      delete jsonData.buttonHeight;
      delete jsonData.buttonBaseFileName;
      delete jsonData.isToggle;
      Object.assign(this.data, jsonData);
    }
    this.form = new Forms([
      //{ type:"select", name:"controller", title:"Controller", placeholder:"Select Controller", dynamicItems: true},
      { type:"form", class:"col-md-3", items:[
        { type:"form", title:"Base Button Properties", class:"box", items:[
          { type:"label", value:"Base Properties"},
          { type:"text", name:"buttonBaseFileName", title:"Base File Name", validateRule:"required|regex:^[a-zA-Z0-9_-]+$"},
          { type:"textarea", name:"buttonTitle", title:"Button Title", validateRule:"required"},
          { type:"number", name:"buttonWidth", title:"Button Width", placeholder:"", validateRule:"required|numeric"},
          { type:"number", name:"buttonHeight", title:"Button Height", placeholder:"", validateRule:"required|numeric"},
          { type:"number", name:"buttonBorderRadius", title:"Border Radius", placeholder:"", validateRule:"numeric"},
          { type:"number", name:"buttonLineWidth", title:"Border Thickness", placeholder:"", validateRule:"numeric"},
          { type:"checkbox", name:"isToggle", title:"Toggle Button", dataType:"number", value: false},
        ]},
      ]},
      { type:"form", class:"col-md-3", items:[
        { type:"form", class:"box", items:[
          { type:"label", value:"UP Style"},
          //{ type:"textarea", name:"buttonTitle", title:"Button Title", validateRule:"required"},
          { type:"color-picker", name:"buttonBorderColor", title:"Border Color", placeholder:"", validateRule:"required"},
          { type:"color-picker", name:"buttonBackColor", title:"Back Color Start", placeholder:"", validateRule:"required"},
          { type:"color-picker", name:"buttonBackColorEnd", title:"Back Color End", placeholder:"", validateRule:"required"},
          { type:"color-picker", name:"buttonTextColor", title:"Text Color", placeholder:"", validateRule:"required"},
          { type:"number", name:"buttonTextSize", title:"Text Size", unit:"px", dataType:"number", validateRule:"required|numeric"},
        ]},
      ]},
      { type:"form", class:"col-md-3", items:[
        { type:"form", name:"downStyle", class:"box", items:[
          { type:"label", value:"Down Style"},
          //{ type:"textarea", name:"buttonTitle", title:"Button Title", validateRule:"required"},
          { type:"color-picker", name:"buttonBorderColor", title:"Border Color", placeholder:"", validateRule:""},
          { type:"color-picker", name:"buttonBackColor", title:"Back Color Start", placeholder:"", validateRule:""},
          { type:"color-picker", name:"buttonBackColorEnd", title:"Back Color End", placeholder:"", validateRule:""},
          { type:"color-picker", name:"buttonTextColor", title:"Text Color", placeholder:"", validateRule:""},
        ]},
      ]},
      { type:"form", class:"col-md-3", displayRule:"true_if:isToggle,true", items:[
        { type:"form", name:"toggleStyle", class:"box", items:[
          { type:"label", value:"Toggle Style"},
          
          //{ type:"textarea", name:"buttonTitle", title:"Button Title", validateRule:"required"},
          { type:"color-picker", name:"buttonBorderColor", title:"Border Color", placeholder:"", validateRule:""},
          { type:"color-picker", name:"buttonBackColor", title:"Back Color Start", placeholder:"", validateRule:""},
          { type:"color-picker", name:"buttonBackColorEnd", title:"Back Color End", placeholder:"", validateRule:""},
          { type:"color-picker", name:"buttonTextColor", title:"Text Color", placeholder:"", validateRule:""},

          { type:"number", name:"statusLineWidth", title:"StatusLineWidth", unit:"px", dataType:"number", validateRule:"numeric"},

          { type:"text", name:"statusDisabledColor", title:"Disabled Color", placeholder:"", validateRule:"required"},
          { type:"text", name:"statusEnabledColor", title:"Enabled Color", placeholder:"", validateRule:"required"},

        ]}
      ]}
    ], this.data);
    this.form.onChange = this.form.onInput = ()=>{
      this.drawControl();
    }
    this.presetData = {}
    this.presets = new Forms([
      { type:"form", class:"row", items:[
        { type: "select", name:"preset", class:"col-md-4", title:"Presets", placeholder:"Select preset ...", dynamicItems:true },
        { type: "button", name:"create", class:"col-md-2", value:"Create", title:" "},
        { type: "button", name:"update", class:"col-md-2", value:"Save", title:" ", displayRule:"true_if_not:preset,null"},
        { type: "button", name:"rename", class:"col-md-2", value:"Rename", title:" ", displayRule:"true_if_not:preset,null"},
        { type: "button", name:"delete", class:"col-md-2", value:"Delete", title:" ", displayRule:"true_if_not:preset,null"},
      ]}
    ],this.presetData)

    this.presets.onButtonClick = (ev)=>{
      if (ev.target.name == "create") {
        Prompt("Enter preset name", (val)=>{

          var existing = Objects.find(this.presetItems, p=> p.preset == val);
         
          this.data.preset = val;
        
          if (existing){
            Alert(`Preset '${val}' already exists.`,()=>{}, "Can not create!");
            return false;
          } else {
            this.presetItems.push(Objects.copy(this.data));
          }
          this.updatePresetItems(this.presetItems);
          setTimeout(() => {
            this.presetData.preset = val;  
          }, 0);
        })
      }
      if (ev.target.name == "update") {
        this.data.preset = this.presetData.preset

        var preset = Objects.find(this.presetItems, p=> p.preset == this.data.preset);
        
        if (preset){
          Objects.overwrite(preset, this.data);
        } else {
          this.presetItems.push(Objects.copy(this.data));
          this.updatePresetItems(this.presetItems);
        }
      }
      if (ev.target.name == "rename") {
        Prompt("Enter new preset name", (val)=>{
          if (val) {
            var existing = Objects.find(this.presetItems, p=> p.preset == val);

            var overwriteFunc = ()=>{
             

              var preset = Objects.find(this.presetItems, p=> p.preset == this.data.preset);
              if (preset){
                preset.preset = val;
              } 

              this.updatePresetItems(this.presetItems);
              setTimeout(() => {
                this.data.preset = this.presetData.preset = preset.preset;
              }, 0);
   
            }

            if (existing) {
              Alert(`Preset '${val}' already exists.`,()=>{}, "Can not rename!");
              return false;
            } else {
              overwriteFunc();
            }

            
          }
        }, "", this.data.preset);
      }
      if (ev.target.name == "delete") {
        Confirm(`Delete preset '${this.data.preset}' ?`, ()=>{
          this.presetItems =  Objects.filter(this.presetItems, p=> p.preset != this.data.preset);
          this.updatePresetItems(this.presetItems);
          this.data.preset = this.presetData.preset  = null;
        }, "Delete Preset");
      }
    }
    this.presets.onChange = ()=>{
      var preset = Objects.find(this.presetItems, p=> p.preset == this.presetData.preset);
      this.data.preset = preset.preset
      this.data.isToggle = preset.isToggle;      

      this.data.buttonTextSize = preset.buttonTextSize;
      this.data.buttonBorderRadius = preset.buttonBorderRadius;
      this.data.buttonLineWidth = preset.buttonLineWidth;
      this.data.buttonBackColor = preset.buttonBackColor;
      this.data.buttonBackColorEnd = preset.buttonBackColorEnd;
      this.data.buttonBorderColor = preset.buttonBorderColor;
      this.data.buttonTextColor = preset.buttonTextColor;


      this.data.downStyle.buttonBackColor = preset.downStyle.buttonBackColor;
      this.data.downStyle.buttonBackColorEnd = preset.downStyle.buttonBackColorEnd;
      this.data.downStyle.buttonBorderColor = preset.downStyle.buttonBorderColor;
      this.data.downStyle.buttonTextColor = preset.downStyle.buttonTextColor;

      this.data.toggleStyle.buttonBackColor = preset.toggleStyle.buttonBackColor;
      this.data.toggleStyle.buttonBackColorEnd = preset.toggleStyle.buttonBackColorEnd;
      this.data.toggleStyle.buttonBorderColor = preset.toggleStyle.buttonBorderColor;
      this.data.toggleStyle.buttonTextColor = preset.toggleStyle.buttonTextColor;
      this.data.toggleStyle.statusEnabledColor = preset.toggleStyle.statusEnabledColor;
      this.data.toggleStyle.statusDisabledColor = preset.toggleStyle.statusDisabledColor;
      this.data.toggleStyle.statusLineWidth = preset.toggleStyle.statusLineWidth;
      this.drawControl();
    }

    //legacy presets import
    this.presetItems = Storage.get("ButtonGeneratePresets",[]);
    
    this.buttons = {
      Close:()=>{},
      "Save As New Picture": ()=>{
        this.onSaveNewButtonClicked();

        return false;
      },
      "Save Files": ()=>{
        this.onSaveButtonClicked();

        return false;
      },
      /*"Save Into..":()=>{
        this.onSaveIntoButtonClicked();
      }*/
    }

    //imageElem = document.getElementById('image');
  }

  settingsChange(value){
    if (!value) {
      return;
    }
    this.updatePresetItems(value.settings.buttonPresets);
  }

  updatePresetItems(value){
    this.presetItems = value;

    if (this.settings)
      this.settings.settings.buttonPresets = value;
   
    this.presets.fields.preset.items = Objects.map(value, (p)=>{
      return {
        value: p.preset,
        title: p.preset,
      }
    });
  }

  onInit(){
    this.cn_b_up = DOM("#canvas_button_up").first().getContext('2d');
    this.cn_b_down = DOM("#canvas_button_down").first().getContext('2d');
    this.drawControl();
  }

  drawControl(){
    try {
      this.lastErrorMessage = "";
      var ctx = this.cn_b_up
      ctx.canvas.height = this.data.buttonHeight;
      ctx.canvas.width = this.data.buttonWidth * ( this.data.isToggle ? 2 : 1);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      this.drawButton_up(ctx);

      if (this.data.isToggle){
        this.drawButton_up(ctx, true);
      }
      
      var ctx = this.cn_b_down
      ctx.canvas.height = this.data.buttonHeight;
      ctx.canvas.width = this.data.buttonWidth * ( this.data.isToggle ? 2 : 1);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      this.drawButton_down(ctx);

      if (this.data.isToggle){
        this.drawButton_down(ctx, true);
      }
    } catch (ex) {
      this.lastErrorMessage = ex.message+"\n";
    }


  }
/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {*} isToggleOn 
 */
  drawButton_up(ctx, isToggleOn = false){

    var x=0;
    if (isToggleOn) {
      x = this.data.buttonWidth + 0
    } else {
      x = 0
    }
    
    drawButton(ctx, {
      x:x,
      y:0,
      w: Number(this.data.buttonWidth),
      h: Number(this.data.buttonHeight),
      bw: Number(this.data.buttonLineWidth),
      br: Number(this.data.buttonBorderRadius),
      bc: isToggleOn ? (this.data.toggleStyle.buttonBorderColor || this.data.buttonBorderColor) : this.data.buttonBorderColor,
      bgc1: isToggleOn ? (this.data.toggleStyle.buttonBackColor || this.data.buttonBackColor) : this.data.buttonBackColor,
      bgc2: isToggleOn ? (this.data.toggleStyle.buttonBackColorEnd || this.data.buttonBackColorEnd) : this.data.buttonBackColorEnd,
      text: this.data.buttonTitle,
      ts: Number(this.data.buttonTextSize),
      tc: isToggleOn ? (this.data.toggleStyle.buttonTextColor || this.data.buttonTextColor) : this.data.buttonTextColor,
      statusWidth:  this.data.isToggle ? this.data.toggleStyle.statusLineWidth : 0,
      statusColor:  isToggleOn ?  this.data.toggleStyle.statusEnabledColor: this.data.toggleStyle.statusDisabledColor
    })
    
  }

  /**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {*} isToggleOn 
 */
drawButton_down(ctx, isToggleOn = false){

  var x=0;
  if (isToggleOn) {
    x = this.data.buttonWidth + 0
  } else {
    x = 0
  }
  
  drawButton(ctx, {
    x:x,
    y:0,
    w: Number(this.data.buttonWidth),
    h: Number(this.data.buttonHeight),
    bw: Number(this.data.buttonLineWidth),
    br: Number(this.data.buttonBorderRadius),
    bc:  isToggleOn ? (this.data.toggleStyle.buttonBorderColor || this.data.downStyle.buttonBorderColor || this.data.buttonBorderColor) : (this.data.downStyle.buttonBorderColor || this.data.buttonBorderColor),
    bgc1: isToggleOn ? (this.data.toggleStyle.buttonBackColor || this.data.downStyle.buttonBackColor || this.data.buttonBackColor) : (this.data.downStyle.buttonBackColor || this.data.buttonBackColor),
    bgc2: isToggleOn ? (this.data.toggleStyle.buttonBackColorEnd || this.data.downStyle.buttonBackColorEnd || this.data.buttonBackColorEnd) : (this.data.downStyle.buttonBackColorEnd || this.data.buttonBackColorEnd),
    text: this.data.buttonTitle,
    ts: Number(this.data.buttonTextSize),
    tc: isToggleOn ? (this.data.toggleStyle.buttonTextColor || this.data.downStyle.buttonTextColor || this.data.buttonTextColor) : (this.data.downStyle.buttonTextColor || this.data.buttonTextColor),
    statusWidth:  this.data.isToggle ? this.data.toggleStyle.statusLineWidth : 0,
    statusColor:  isToggleOn ?  this.data.toggleStyle.statusEnabledColor: this.data.toggleStyle.statusDisabledColor
  })
  
}

  


  loadFileClicked(){
    DOM("#file").first().click()
  }
  onFileChange(event){
    var file = event.target.files[0];

    console.log(file)
    var reader = new FileReader()
    reader.onload = ()=>{
      this.parse(reader.result);
    }
    reader.readAsText(file)
  }

  async onSaveNewButtonClicked(){
    if (!this.form.validator.validate()){
      return;
    }

    //var dirItem = await FileHelpers.selectDirectoryFromDirectoryHandle(this.dirHandle, "Select directory to save the files in")
    //if (!dirItem) return;
    var fileHandle_up = await window.showSaveFilePicker({
      suggestedName: this.data.buttonBaseFileName + "_up.png",
      types: [
        {
          description: 'UP png Image File',
          accept: {
            'image/png': ['.png'],
          },
        }
      ],
    })

    var fileHandle_down = await window.showSaveFilePicker({
      suggestedName: this.data.buttonBaseFileName + "_down.png",
      types: [
        {
          description: 'DOWN png Image File',
          accept: {
            'image/png': ['.png'],
          },
        }
      ],
    })

    if (!fileHandle_up || !fileHandle_down){
      Alert("Operation cancelled by the user");
      return;
    }

   

    await FileHelpers.saveCanvasToFileHandle(this.cn_b_up.canvas, fileHandle_up)
    await FileHelpers.saveCanvasToFileHandle(this.cn_b_up.canvas, fileHandle_down)
   

    var pic = new PictureNode();
    pic.container = this.button.container;
    pic.picture_up = fileHandle_up.name;
    pic.picture_down = fileHandle_up.name;
    pic.picture_up_handle = fileHandle_up;
    pic.picture_down_handle = fileHandle_down;

    this.onNewPictureCreated(pic)

    //downloadFile(this.cn_b_up.canvas, this.data.buttonBaseFileName + "_up.png");
    //downloadFile(this.cn_b_down.canvas, this.data.buttonBaseFileName + "_down.png");
    //this.onNewPictureCreated()
  }

  /** @param {PictureNode} picture*/
  onNewPictureCreated(picture){

  }

  async onSaveButtonClicked(){
    if (!this.form.validator.validate())
      return;

    if (this.button.picture.picture_up_handle && !await new Promise ((resolve)=>Confirm(`Overwrite existing image files?`, ()=>resolve(true),"Are you sure?"))){
      return;
    }

    if (this.button.picture.picture_up_handle){
      await  FileHelpers.saveCanvasToFileHandle(this.cn_b_up.canvas, this.button.picture.picture_up_handle)
    } else {
      downloadFile(this.cn_b_up.canvas, this.data.buttonBaseFileName + "_up.png");
    }

    if (this.button.picture.picture_down_handle){
      await  FileHelpers.saveCanvasToFileHandle(this.cn_b_down.canvas, this.button.picture.picture_down_handle)
    } else {
      downloadFile(this.cn_b_down.canvas, this.data.buttonBaseFileName + "_down.png");
    }

    this.onButtonCodeUpdated(Objects.copy(this.data));
  }

  /** @mustoverride */
  onButtonCodeUpdated(json){

  }

  parse(text){
    this.parser.parse(text);
    this.form.fields['controller'].items = this.getControllerItems()
  }

  getControllerItems(){
    return Objects.map(this.parser.controllers, el=>{
      return {value: el, title:el};
    });
  }

  get template (){
    return this.extendTemplate(super.template, template);
  }
}

var template = `
<div class="wrapper">
  
  <div class="top"></div>
  <div class="middle">
    <div class="">
      <div class="">{{ this.data.buttonBaseFileName }}_up.png</div>
      <canvas id="canvas_button_up"></canvas>

      <div class="">{{ this.data.buttonBaseFileName }}_down.png</div>
      <canvas id="canvas_button_down"></canvas>
      <div class="error">
        <pre>{{this.lastErrorMessage}}</pre>
      </div>
      <!--<div class="">
        <a id="link"></a>
        <button class="btn btn-primary" onclick="this.onSaveButtonClicked()">Export Files</button>
      </div>-->
    </div>
    <div class="properties-wrapper">
      <div class="presets">
        <div [component]="this.presets"></div>
      </div>
      <div class="row properties">
        <!--<input id="file" type="file" onchange="this.onFileChange($event)" />-->
        <!--<button onclick="this.loadFileClicked()">Load File</button>-->
        <div [component]="this.form"></div>
      </div>
    </div>
  </div>
</div>

`;

class Parser {

  constructor() {
    this.nodes = []
    this.controllers = []
    
  }

  /**
   * 
   * @param {string} text 
   */
  parse(text){
    this.text = text;    
    var matches = this.text.match(/\/\/REGION UC\w*/gm);
    Objects.forEach(matches, (m)=>{
      var ver = m.match(/\/\/REGION (UC\w*)/)[1];
      if (ver && !this.controllers.includes(ver)) {
        this.controllers.push(ver);
      }
    })

    var matches = this.text.match(/\/\/REGION UC\w*/gm);
    Objects.forEach(matches, (m)=>{
      var ver = m.match(/\/\/REGION (UC\w*)/)[1];
      if (ver && !this.controllers.includes(ver)) {
        this.controllers.push(ver);
      }
    })
  }

  /**
   * 
   * @param {HTMLCanvasElement} cn 
   */
  draw(cn){

  }
}
/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * */
function multiLineText(ctx, text, x, y, w, h, fontHeight){
  x = Number(x);
  y = Number(y);
  w = Number(w);
  h = Number(h);
  fontHeight = Number(fontHeight);

  
  
  ctx.font = `${fontHeight}px Arial`;

  let lines = text.split(/\n/g);
  Objects.forEach(lines, (line, i)=>{
    let textMetrics = ctx.measureText(line);
    var lineHeight = textMetrics.actualBoundingBoxAscent * 1.25;
    ctx.fillText(line, x + w/2 - Math.min(textMetrics.width,w)/2, y+(h/2+ textMetrics.actualBoundingBoxAscent/2 - lineHeight * (lines.length-1)/2)+ i * lineHeight, w );
  })
  
  
}

/**
 * 
 * @param {CanvasRenderingContext2D} context 

 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @param {string} color 
 * @param {number} lineWidth 
 * @param {number} radius 
 */
function roundRect(context, x, y, w, h,color, lineWidth, radius)
{
  lineWidth = Number(lineWidth);

  x = Number(x)+lineWidth/2;
  y = Number(y)+lineWidth/2;
  w = Number(w)-lineWidth;
  h = Number(h)-lineWidth;


  radius = Number(radius);
  
  var r = x + w;
  var b = y + h;
  context.beginPath();
  context.strokeStyle=color;
  context.lineWidth=lineWidth;
  context.moveTo(x+radius, y);
  context.lineTo(r-radius, y);
  context.quadraticCurveTo(r, y, r, y+radius);
  context.lineTo(r, y+h-radius);
  context.quadraticCurveTo(r, b, r-radius, b);
  context.lineTo(x+radius, b);
  context.quadraticCurveTo(x, b, x, b-radius);
  context.lineTo(x, y+radius);
  context.quadraticCurveTo(x, y, x+radius, y);
  context.stroke();
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {ButtonStyle} style 
 */
function drawButton(ctx, style ){
 
  
  //draw background
  roundRect(ctx,style.x, style.y, style.w, style.h, style.bc, style.bw, style.br)

  // Create gradient
  if ( style.bgc1 != style.bgc2){
    var grd = ctx.createLinearGradient(style.x, 0, style.x, style.h);
    grd.addColorStop(0, style.bgc1);
    grd.addColorStop(1,  style.bgc2);

    ctx.fillStyle = grd;
  } else {
    ctx.fillStyle = style.bgc1;
  }
  ctx.fill();

  //draw border
  roundRect(ctx,style.x, style.y, style.w, style.h, style.bc, style.bw, style.br)
  //draw Text
  ctx.fillStyle = style.tc;
  multiLineText(ctx, style.text, style.x + style.bw, style.y + style.bw, style.w-(style.bw*2), style.h-(style.bw*2), style.ts)
  
  if (style.statusWidth>0) {
    let w = style.w * 0.75;
    let xx = (style.w - w)/2;
    //draw background
    roundRect(ctx,style.x + xx , style.h - style.bw*1.5 - style.statusWidth , w , style.statusWidth, style.statusColor , style.statusWidth/2, style.statusWidth/2)
    

  }
  
}


function downloadFile(canvas, fileName){
  var link = document.createElement('a');
  document.body.appendChild(link)
  link.setAttribute('download', fileName);
  link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  link.click();
  setTimeout(()=>{
    document.body.removeChild(link);
  },1000);
}