import { HeaderPage } from "leet-mvc/pages/HeaderPage/HeaderPage.js"
import { DOM } from "leet-mvc/core/DOM"
import { Objects } from "leet-mvc/core/Objects";
import { Forms } from "leet-mvc/components/Forms";
import "./EditorPage.scss";

export class EditorPage extends HeaderPage {
  constructor(){
    super();
    this.selector = "page-EditorPage"
    this.title = "UCCNC Button Creator"
    /** @type {File} */
    this.file=null;

    /** @type {CanvasRenderingContext2D} */
    this.cn_b_up = null;

    /** @type {CanvasRenderingContext2D} */
    this.cn_b_down = null;

    this.parser = new Parser()
    this.formData = {
      controller: null,
      buttonBaseFileName:"",
      buttonTitle:"Hello",
      buttonX: 0,
      buttonY: 0,
      buttonWidth: 120,
      buttonHeight: 60,
      buttonLineWidth: 6,
      buttonBorderRadius: 10,
      buttonBorderColor: "#F0CD46",
      buttonBackColor: "#FEFEFE",
      buttonBackColorEnd: "#CCC",
      buttonTextColor: "#444",
      buttonTextSize: 32,
      statusEnabled: true,
      statusLineWidth: 6,
      statusDisabledColor: "#B3B6B6",
      statusEnabledColor: "#0F0",
      
    };
    this.form = new Forms([
      //{ type:"select", name:"controller", title:"Controller", placeholder:"Select Controller", dynamicItems: true},
      { type:"label", value:"Button Properties"},
      { type:"text", name:"buttonBaseFileName", title:"Button Base File Name", validateRule:"required|regex:^[a-zA-Z0-9_-]+$"},
      { type:"textarea", name:"buttonTitle", title:"Button Title", validateRule:"required"},
      { type:"number", name:"buttonX", title:"Button X", placeholder:"", validateRule:"numeric"},
      { type:"number", name:"buttonY", title:"Button Y", placeholder:"", validateRule:"numeric"},
      { type:"number", name:"buttonWidth", title:"Button Width", placeholder:"", validateRule:"required|numeric"},
      { type:"number", name:"buttonHeight", title:"Button Height", placeholder:"", validateRule:"required|numeric"},
      { type:"number", name:"buttonLineWidth", title:"Border Thickness", placeholder:"", validateRule:"required|numeric"},
      { type:"number", name:"buttonBorderRadius", title:"Border Radius", placeholder:"", validateRule:"required|numeric"},
      { type:"text", name:"buttonBorderColor", title:"Border Color", placeholder:"", validateRule:"required"},
      { type:"text", name:"buttonBackColor", title:"Back Color Start", placeholder:"", validateRule:"required"},
      { type:"text", name:"buttonBackColorEnd", title:"Back Color End", placeholder:"", validateRule:"required"},
      { type:"text", name:"buttonTextColor", title:"Text Color", placeholder:"", validateRule:"required"},
      { type:"number", name:"buttonTextSize", title:"Text Size", unit:"px", dataType:"number", validateRule:"required|numeric"},
      { type:"checkbox", name:"statusEnabled", title:"Show Status Line", dataType:"number", value: false},
      { type:"number", name:"statusLineWidth", title:"StatusLineWidth", unit:"px", dataType:"number", validateRule:"required|numeric"},
      { type:"text", name:"statusDisabledColor", title:"Disabled Color", placeholder:"", validateRule:"required"},
      { type:"text", name:"statusEnabledColor", title:"Enabled Color", placeholder:"", validateRule:"required"},

    ], this.formData);
    this.form.onChange = this.form.onInput = ()=>{
      this.drawControl();
    }
    //imageElem = document.getElementById('image');
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
      ctx.canvas.height = this.formData.buttonHeight;
      ctx.canvas.width = this.formData.buttonWidth * ( this.formData.statusEnabled ? 2 : 1);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      this.drawButton_up(ctx);

      if (this.formData.statusEnabled){
        this.drawButton_up(ctx, true);
      }
      
      var ctx = this.cn_b_down
      ctx.canvas.height = this.formData.buttonHeight;
      ctx.canvas.width = this.formData.buttonWidth * ( this.formData.statusEnabled ? 2 : 1);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      this.drawButton_down(ctx);

      if (this.formData.statusEnabled){
        this.drawButton_down(ctx, true);
      }
    } catch (ex) {
      this.lastErrorMessage = ex.message+"\n";
    }


  }
/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {*} isEnabled 
 */
  drawButton_up(ctx, isEnabled = false){

    var x=0;
    if (isEnabled) {
      x = this.formData.buttonWidth + 0
    } else {
      x = 0
    }
    
    drawButton(ctx, {
      x:x,
      y:0,
      w: Number(this.formData.buttonWidth),
      h: Number(this.formData.buttonHeight),
      bw: Number(this.formData.buttonLineWidth),
      br: Number(this.formData.buttonBorderRadius),
      bc:  this.formData.buttonBorderColor,
      bgc1: this.formData.buttonBackColor,
      bgc2: this.formData.buttonBackColorEnd,
      text: this.formData.buttonTitle,
      ts: Number(this.formData.buttonTextSize),
      tc: this.formData.buttonTextColor,
      statusWidth:  this.formData.statusEnabled ? this.formData.statusLineWidth : 0,
      statusColor:  isEnabled ?  this.formData.statusEnabledColor: this.formData.statusDisabledColor
    })
    
  }

  /**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {*} isEnabled 
 */
drawButton_down(ctx, isEnabled = false){

  var x=0;
  if (isEnabled) {
    x = this.formData.buttonWidth + 0
  } else {
    x = 0
  }
  
  drawButton(ctx, {
    x:x,
    y:0,
    w: Number(this.formData.buttonWidth),
    h: Number(this.formData.buttonHeight),
    bw: Number(this.formData.buttonLineWidth),
    br: Number(this.formData.buttonBorderRadius),
    bc:  this.formData.buttonBorderColor,
    bgc2: this.formData.buttonBackColor,
    bgc1: this.formData.buttonBackColorEnd,
    text: this.formData.buttonTitle,
    ts: Number(this.formData.buttonTextSize),
    tc: this.formData.buttonTextColor,
    statusWidth:  this.formData.statusEnabled ? this.formData.statusLineWidth : 0,
    statusColor:  isEnabled ?  this.formData.statusEnabledColor: this.formData.statusDisabledColor
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

  onSaveButtonClicked(){
    if (!this.form.validator.validate())
      return;
    downloadFile(this.cn_b_up.canvas, this.formData.buttonBaseFileName + "_up.png");
    setTimeout(()=>{
      downloadFile(this.cn_b_down.canvas, this.formData.buttonBaseFileName + "_down.png");
    },500)
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
    return super.extendTemplate(super.template, template);
  }
}

var template = `
<div class="wrapper">
  
  <div class="top"></div>
  <div class="middle row">
    <div class="col-6">
      <div class="">{{ this.formData.buttonBaseFileName }}_up.png</div>
      <canvas id="canvas_button_up"></canvas>

      <div class="">{{ this.formData.buttonBaseFileName }}_down.png</div>
      <canvas id="canvas_button_down"></canvas>
      <div class="error">
        <pre>{{this.lastErrorMessage}}</pre>
      </div>
      <div class="">
        <a id="link"></a>
        <button class="btn btn-primary" onclick="this.onSaveButtonClicked()">Export Files</button>
      </div>
    </div>
    <div class="col-6 properties-wrapper">
      <div class="properties">
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