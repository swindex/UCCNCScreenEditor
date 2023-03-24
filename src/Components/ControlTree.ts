import { BackgroundNode, CNode, ControlNode, PictureNode, ScreenControlNode, ScreenName, TabNode } from "../Parser";

import { BaseComponent } from "leet-mvc/components/BaseComponent";

import { Objects } from "leet-mvc/core/Objects";

import "./ControlTree.scss";

interface TabTreeNode {
    name:string,
    tabNode: TabNode|null,
    tabNodes: TabTreeNode[],
    controls: ScreenControlNode[]
    pictures: PictureNode[],
    collapsed: boolean
}

class RootNode{

}

const selectedNodes : ScreenControlNode[] = [];

export class TabTree extends BaseComponent {
    //Input
    tab: TabTreeNode = null;
    treeType: any = null;
    //selectedNodes: ControlNode[] = [];

    constructor(){
        super();
        this.treeType = TabTree;
        this.template = `
<div>
    <div class="tab-node" [selected]="this.isNodeSelected(this.tab ? this.tab.tabNode : null)" [if]="this.tab.name">   
        <div class="icon" onclick="this.onExpandToggle()"  >
            <i [if]="this.tab.collapsed" class="fas fa-caret-right"></i>
            <i [if]="!this.tab.collapsed" class="fas fa-caret-down"></i>
        </div>
        <div class="name" onclick="this.tab.tabNode ? this.onControlSelected(this.tab.tabNode) : null" onmouseover="this.tab.tabNode ? this.onControlMouseOver($event, this.tab.tabNode) : null">{{ this.tab.name }}</div>
    </div>
    <div class="children" [if]="!this.tab.collapsed">    
        <div class="tabs">
            <div class="tab" [foreach]="this.tab.tabNodes as tabNode">
                <div [component]="this.treeType" [tab]="tabNode" [onControlSelected]="this.onControlSelected" [onControlMouseOver]="this.onControlMouseOver"></div>
            </div>
        </div>
        <div class="controls">
            <div class="control-node" [foreach]="this.tab.controls as control" onclick="this.onControlSelected(control)" onmouseover="this.onControlMouseOver($event, control)" [selected]="this.isNodeSelected(control)">
                <div class="icon"></div>
                <div class="name">{{ this.formatName(control.constructor.name) }} - {{ control.controllN }}</div>
            </div>
        </div>
        <div class="pictures">
            <div class="control-node" [foreach]="this.tab.pictures as control" onclick="this.onControlSelected(control)" onmouseover="this.onControlMouseOver($event, control)" [selected]="this.isNodeSelected(control)">
                <div class="icon"></div>
                <div class="name">{{ this.formatName(control.constructor.name) }} - {{ control.controllN }}</div>
            </div>
        </div>
    </div>
</div>
        `
    }

    onUpdate(): void {
        //console.log('tab Update', this.tab);
    }

    tabChange(value){
        //console.log('tabChange', value);
    }

    getTabControls(){
        return this.tab.controls;
    }

    onExpandToggle(){
        this.tab.collapsed = !this.tab.collapsed;
    }

    /** @virtual */
    onControlSelected( control: ControlNode){

    }

    /** @virtual */
    onControlMouseOver(event: any, control: ControlNode){
        console.log(event)
    }

    formatName(name: string){
        return name.replace("Node","")
    }

    isNodeSelected(node: ControlNode){
        return selectedNodes.includes(node)
    }
    isTabCollapsed(){
        /*if (!this.tab.collapsed){
            return false;
        }
        if (selectedNodes[0]?.layerN == this.tab.tabNode.layerN ) {
            return this.tab.collapsed = false
        }
        if (selectedNodes[0]?.layerN ) {
            let ret = this.tab.tabNodes.find(el=> el.tabNode.layerN ==selectedNodes[0]?.layerN)
            if (ret) {
                return this.tab.collapsed = false;
            }
        }*/
        return this.tab.collapsed
    }

    
}

export class ControlTree extends BaseComponent{
    nodes: CNode[] = [];

    //selectedNodes: ControlNode[] = [];

    treeNodes: TabTreeNode[] = [];
    treeInstance: any = null;

    constructor(){
        super();
        this.treeInstance = new TabTree();
        this.template = template
    }

    setNodes(nodes: ScreenControlNode[]){
        //nodes = Objects.filter(nodes, function(el){ return el instanceof ControlNode });

        //let tabjog = Objects.filter(nodes, function(el){ return ( el.container=="AS3jog") })

        this.treeNodes = [{
            name: "",
            tabNode: null,
            tabNodes : [],
            controls : [],
            pictures: [],
            collapsed: false
        }];

        setTimeout(() => {
            this.treeNodes =[{
                name:"",
                tabNode: null,
                tabNodes: [
                    {
                        name:"Main Screen",
                        tabNode: null,
                        tabNodes: [
                            {
                                name:"Control Elements",
                                tabNode: null,
                                tabNodes: this.getTabNodeTabs(nodes, ScreenName.AS3,  1),
                                controls: this.getTabNodeControls(nodes, ScreenName.AS3, 1),
                                pictures: [],
                                collapsed: true
                            },
                            {
                                name:"Picture Elements",
                                tabNode: null,
                                tabNodes: [],
                                controls: [],
                                pictures: this.getPictureNodes(nodes, ScreenName.AS3),
                                collapsed: true
                            }
                        ],
                        controls: [],
                        pictures: [],
                        collapsed: false
                    },
                    {
                        name:"Jog Screen",
                        tabNode: null,
                        tabNodes: [
                            {
                                name:"Control Elements",
                                tabNode: null,
                                tabNodes: this.getTabNodeTabs(nodes, ScreenName.AS3jog,  1),
                                controls: this.getTabNodeControls(nodes, ScreenName.AS3jog, 1),
                                pictures: [],
                                collapsed: true
                            },
                            {
                                name:"Picture Elements",
                                tabNode: null,
                                tabNodes: [],
                                controls: [],
                                pictures: this.getPictureNodes(nodes, ScreenName.AS3jog),
                                collapsed: true
                            }
                        ],
                        controls: [],
                        pictures: [],
                        collapsed: false
                    }          
                ],
                controls: [],
                pictures: [],
                collapsed: false
            }]
            console.log("Done");

            /**{
                name:"",
                tabNode: null,
                tabNodes: this.getTabNodeTabs(nodes, 1),
                controls: this.getTabNodeControls(nodes, 1),
                collapsed: true
            } */
                
            //    this.update()
            this.update()
            this.treeInstance.update();
        }, 100);
        
        //console.log(this.tabs);
        //console.log(nodes.length);
        
    }

    setSelectedNodes(nodes: CNode[]){
        Objects.overwrite(selectedNodes, nodes);
        this.update()
    }



    getTabNodeTabs(nodes: ScreenControlNode[], screenName:ScreenName, parentN: number) {
        let tabs = Objects.filter(nodes, function(el){ return (el instanceof TabNode && el.parentN == parentN && el.container == screenName) })
        
        return tabs.map(tab=>{
            return <TabTreeNode> {
                name: tab.constructor.name +"-"+ tab.layerN,
                tabNode: tab,
                tabNodes: this.getTabNodeTabs(nodes,screenName, tab.layerN),
                controls: this.getTabNodeControls(nodes, screenName, tab.layerN),
                pictures: [],
                collapsed: true
            }
        })
    }

    getTabNodeControls(nodes: ScreenControlNode[], screenName:ScreenName, parentN: number) {
        return Objects.filter(nodes, function(el){ 
            return !(el instanceof TabNode) && !(el instanceof PictureNode) && el.layerN == parentN && el.container == screenName
        })
    }

    getPictureNodes(nodes: PictureNode[], screenName:ScreenName) {
        return Objects.filter(nodes, function(el){ 
            return (el instanceof PictureNode) && el.container == screenName
        })
    }

    /** @virtual */
    onControlSelected(control: ControlNode){
        console.log(control)
    }

    /** @virtual */
    onControlMouseOver(control: ControlNode){
        console.log(control)
    }
}

const template =`
<div class="scroll ControlTree">
    <div [component]="this.treeInstance" [onControlSelected]="this.onControlSelected"  [onControlMouseOver]="this.onControlMouseOver" [tab]="this.treeNodes[0]" [selectedNodes] = "this.selectedNodes"></div>
</div>

`