import { CNode, ControlNode, TabNode } from "../Parser";

import { BaseComponent } from "leet-mvc/components/BaseComponent";

import { Objects } from "leet-mvc/core/Objects";

import "./ControlTree.scss";

interface TabTreeNode {
    tabNode: TabNode,
    controls: ControlNode[]
    tabNodes: TabTreeNode[],
    collapsed: boolean
}

class RootNode{

}

const selectedNodes = [];

export class TabTree extends BaseComponent {

    tab: TabTreeNode = null;
    treeType: any = null;
    //selectedNodes: ControlNode[] = [];

    constructor(){
        super();
        this.treeType = TabTree;
        this.template = `
<div>
    <div class="tab-node" [selected]="this.isNodeSelected(this.tab ? this.tab.tabNode : null)" [if]="this.tab && this.tab.tabNode != null">   
        <div class="icon" onclick="this.onExpandToggle()"  >
            <i [if]="this.tab.collapsed" class="fas fa-caret-right"></i>
            <i [if]="!this.tab.collapsed" class="fas fa-caret-down"></i>
        </div>
        <div class="name" onclick="this.onControlSelected(this.tab.tabNode)">{{ this.tab.tabNode.constructor.name }} - {{ this.tab.tabNode.layerN }}</div>
    </div>
    <div class="children">    
        <div class="tabs" [if]="!this.tab.collapsed">
            <div class="tab" [foreach]="this.tab.tabNodes as tabNode">
                <div [component]="this.treeType" [tab]="tabNode" [onControlSelected]="this.onControlSelected"></div>
            </div>
        </div>
        <div class="controls" [if]="!this.tab.collapsed">
            <div class="control-node" [foreach]="this.tab.controls as control" onclick="this.onControlSelected(control)" [selected]="this.isNodeSelected(control)">
                <div class="icon"></div>
                <div class="name">{{ control.constructor.name }} - {{ control.controllN }}</div>
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
    onControlSelected(control: ControlNode){

    }

    isNodeSelected(node: ControlNode){
        return selectedNodes.includes(node)
    }
}

export class ControlTree extends BaseComponent{
    nodes: CNode[] = [];

    selectedNodes: ControlNode[] = [];

    tabs: TabTreeNode[] = [];
    treeType: any = null;

    constructor(){
        super();
        this.treeType = TabTree;
        this.template = template
    }

    setNodes(nodes: CNode[]){
        nodes = Objects.filter(nodes, function(el){ return el instanceof ControlNode && el.container=="AS3" });
        this.tabs = [{
            tabNode: null,
            tabNodes : [],
            controls : []
        }];

        setTimeout(() => {
        this.tabs =[{
            tabNode: null,
            tabNodes: this.getTabNodeTabs(nodes, 1),
            controls: this.getTabNodeControls(nodes, 1),
        }]
               
        //    this.update()
        }, 10);
        
        //console.log(this.tabs);
        //console.log(nodes.length);
        //this.update()
    }

    setSelectedNodes(nodes: CNode[]){
        Objects.overwrite(selectedNodes, nodes);
        this.update()
    }


    getTabNodeControls(nodes: ControlNode[], parentN: number) {
        return Objects.filter(nodes, function(el){ 
            return !(el instanceof TabNode) && el.layerN == parentN
        })
    }

    getTabNodeTabs(nodes: ControlNode[], parentN: number) {
        let tabs = Objects.filter(nodes, function(el){ return el instanceof TabNode && el.parentN == parentN })
        
        return tabs.map(tab=>{
            return <TabTreeNode> {
                tabNode: tab,
                tabNodes: this.getTabNodeTabs(nodes, tab.layerN),
                controls: this.getTabNodeControls(nodes, tab.layerN),
                collapsed: true
            }
        })
    }

    /** @virtual */
    onControlSelected(control: ControlNode){
        console.log(control)
    }
}

const template =`
<div class="scroll ControlTree">
    <div [component]="this.treeType" [onControlSelected]="this.onControlSelected" [tab]="this.tabs[0]" [selectedNodes] = "this.selectedNodes"></div>
</div>

`