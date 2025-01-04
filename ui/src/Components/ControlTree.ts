import { BackgroundNode, ButtonNode, CheckboxNode, CNode, ComboNode, ControlNode, FieldNode, LabelNode, LedNode, PictureNode, ScreenControlNode, ScreenName, SelectLayerNode, SliderNode, TabLayer } from "../Parser";

import { BaseComponent } from "leet-mvc/components/BaseComponent";

import { Objects } from "leet-mvc/core/Objects";

import "./ControlTree.scss";
import { DOM } from "leet-mvc/core/DOM";
import { ButtonNumbers } from "../ButtonNumbers";
import { FieldNumbers } from "../FieldNumbers";
import { LedNumbers } from "../LedNumbers";
import { ComboNumbers } from "../ComboNumbers";
import { CheckBoxNumbers } from "../CheckBoxNumbers";

let buttonsDict = Objects.keyBy(ButtonNumbers, "value");
let fieldsDict = Objects.keyBy(FieldNumbers, "value");
let ledsDict = Objects.keyBy(LedNumbers, "value");
let combosDict = Objects.keyBy(ComboNumbers, "value");
let checksDict = Objects.keyBy(CheckBoxNumbers, "value");


interface TabTreeNode {
    name:string,
    tabNode: TabLayer|null,
    tabNodes: TabTreeNode[],
    controls: ScreenControlNode[]
    pictures: PictureNode[],
    collapsed: boolean
}

const selectedNodes : ScreenControlNode[] = [];

export class TabTree extends BaseComponent {
    //Input
    tab: TabTreeNode = null;
    treeType: any = null;
    selectedNodes: ControlNode[] = [];

    constructor(){
        super();
        this.treeType = TabTree;
        this.template = `
<div>
    <div class="tab-node" [selected]="this.isNodeSelected(this.tab ? this.tab.tabNode : null)" [if]="this.tab.name">   
        <div class="icon" data-cy="onExpandToggle" onclick="this.onExpandToggle()"  >
            <i [if]="this.tab.collapsed" class="fas fa-caret-right"></i>
            <i [if]="!this.tab.collapsed" class="fas fa-caret-down"></i>
        </div>
        <div class="name" data-cy="onTabControlSelected" onclick="this.tab.tabNode ? this.onControlSelected(this.tab.tabNode) : null" onmouseover="this.tab.tabNode ? this.onControlMouseOver($event, this.tab.tabNode) : null">{{ this.tab.name }}</div>
    </div>
    <div class="children" [if]="!this.tab.collapsed">    
        <div class="tabs">
            <div class="tab" [foreach]="this.tab.tabNodes as tabNode">
                <div [component]="this.treeType" [tab]="tabNode" [onControlSelected]="this.onControlSelected" [onControlMouseOver]="this.onControlMouseOver"></div>
            </div>
        </div>
        <div class="controls">
            <div class="control-node" [foreach]="this.tab.controls as control" data-cy="onControlSelected" onclick="this.onControlSelected(control)" onmouseover="this.onControlMouseOver($event, control)" [selected]="this.isNodeSelected(control)">
                <div class="icon"></div>
                <div class="name">{{ this.formatCtrlName(control) }}</div>
            </div>
        </div>
        <div class="pictures">
            <div class="control-node" [foreach]="this.tab.pictures as control" data-cy="onControlSelected" onclick="this.onControlSelected(control)" onmouseover="this.onControlMouseOver($event, control)" [selected]="this.isNodeSelected(control)">
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

    formatCtrlName(ctrl: ControlNode){
        let name = ""
        if (ctrl instanceof ButtonNode) {
            name = "Btn-" + buttonsDict[ctrl.controllN]?.title || String(ctrl.controllN);
        } else if (ctrl instanceof FieldNode || ctrl instanceof SliderNode ) {
            name = "Fld-" + fieldsDict[ctrl.controllN]?.title || String(ctrl.controllN);
        } else if (ctrl instanceof LedNode) {
            name = "Led-" + ledsDict[ctrl.controllN]?.title || String(ctrl.controllN);
        } else if (ctrl instanceof ComboNode) {
            name = "Cmb-" + combosDict[ctrl.controllN]?.title || String(ctrl.controllN);
        } else if (ctrl instanceof CheckboxNode) {
            name = "Chk-" + checksDict[ctrl.controllN]?.title || String(ctrl.controllN);
        } else if (ctrl instanceof LabelNode) {
            name = "Lbl-" + (ctrl.value || "None").substring(0, 25);
        } else {
            name = ctrl.constructor.name.replace("Node","") + "-" + String(ctrl.controllN);
        }   
        return name
    }

    formatName(name: string){
        return name.replace("Node","")
    }

    isNodeSelected(node: ControlNode){
        if (!selectedNodes?.length) return false;
        return selectedNodes.includes(node) 
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
        this.treeNodes = [{
            name: "",
            tabNode: null,
            tabNodes : [],
            controls : [],
            pictures: [],
            collapsed: false
        }];

        setTimeout(() => {
            const orphanedTabs: TabTreeNode[] = [];
            const orphanedControls: ScreenControlNode[] = [];

            // Separate orphaned tabs and controls
            nodes.forEach(node => {
                if (node instanceof TabLayer && !this.tabHasParent(node, nodes)) {
                    orphanedTabs.push({
                        name: node.constructor.name + "-" + node.layerN,
                        tabNode: node,
                        tabNodes: this.getTabNodeTabs(nodes, node.container, node.layerN),
                        controls: this.getTabNodeControls(nodes, node.container, node.layerN),
                        pictures: [],
                        collapsed: true,
                    });
                } else if (!(node instanceof TabLayer) && !(node instanceof PictureNode) && !this.controlHasParent(node, nodes)) {
                    orphanedControls.push(node);
                }
            });

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
                    },
                    {
                        name: "Orphaned Controls",
                        tabNode: null,
                        tabNodes: orphanedTabs,
                        controls: orphanedControls,
                        pictures: [],
                        collapsed: false,
                    },        
                ],
                controls: [],
                pictures: [],
                collapsed: false
            }]
            console.log("Done");

            this.update()
            this.treeInstance.update();
        }, 100);
        
        //console.log(this.tabs);
        //console.log(nodes.length);
        
    }

    tabHasParent(node: TabLayer, nodes: ScreenControlNode[]): boolean {
        if (node.parentN == 1) {
            return true;
        }
        return nodes.some(
            potentialParent =>
                potentialParent instanceof TabLayer && potentialParent.layerN === node.parentN && potentialParent.container === node.container
        );
    }

    controlHasParent(node: ScreenControlNode, nodes: ScreenControlNode[]): boolean {
        if (node.layerN == 1 || node.layerN == null) {
            return true;
        }
        return nodes.some(
            potentialParent =>
                potentialParent instanceof TabLayer && potentialParent.layerN === node.layerN && potentialParent.container === node.container
        );
    }
    

    setSelectedNodes(nodes: CNode[]){
        Objects.overwrite(selectedNodes, nodes);
        if (selectedNodes?.length == 1) {
            this.expandTabsContainingSelectedNode();
            setTimeout(() => {
                let el = DOM(this.container).find("[selected]").first();
                if (el && typeof el.scrollIntoViewIfNeeded == "function" ){
                    el.scrollIntoViewIfNeeded()
                }
                //this.scrollSelectedIntoView();
            }, 100);
        }
        this.update()
    }

    expandTabsContainingSelectedNode() {
        if (!selectedNodes.length) return;
    
        // Helper function to recursively expand tabs containing the selected nodes
        const expandNode = (node: TabTreeNode): boolean => {
            let containsSelected = false;
    
            // Check if the node's controls or pictures contain any of the selectedNodes
            containsSelected = (
                selectedNodes.includes(node.tabNode) ||
                node.tabNodes.some(tab => selectedNodes.includes(tab)) ||
                node.controls.some(control => selectedNodes.includes(control)) ||
                node.pictures.some(picture => selectedNodes.includes(picture))
            );
    
            // Recursively check child tabNodes
            for (const childTab of node.tabNodes) {
                const childContainsSelected = expandNode(childTab);
                containsSelected = containsSelected || childContainsSelected;
            }
    
            // Expand the node if it contains the selectedNode
            if (containsSelected) {
                node.collapsed = false;
            }
    
            return containsSelected;
        };
    
        // Apply the helper function to the root treeNodes
        for (const rootNode of this.treeNodes) {
            expandNode(rootNode);
        }
   
    }
    



    getTabNodeTabs(nodes: ScreenControlNode[], screenName:ScreenName, parentN: number) {
        let tabs = Objects.filter(nodes, function(el){ return (el instanceof TabLayer && el.parentN == parentN && el.container == screenName) })
        
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
            return !(el instanceof TabLayer) && !(el instanceof PictureNode) && !(el instanceof SelectLayerNode) && el.layerN == parentN && el.container == screenName
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
</div>`