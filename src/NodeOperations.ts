import { Objects } from "leet-mvc/core/Objects";
import { CNode, ControlNode, Parser, TabNode } from "./Parser";

export class NodeOperations {
    static removeNodes(selectedNodes: ControlNode[], parser: Parser, recursive: any) {
        Objects.forEach(selectedNodes, node=> {
            parser.removeNode(node);
            if (recursive && node instanceof TabNode) {
                let children = parser.getNodes().filter((el:ControlNode)=>el.region == node.region && (el.layerN == node.layerN || el.parentN == node.layerN ))
                NodeOperations.removeNodes(<any>children, parser, recursive);   
            }
        })
    }
    static applyNodeStyleToNodesInOtherRegions(node: ControlNode, regions: string[], nodes:CNode[]) {
        let elelms = <ControlNode[]> nodes.filter((el: ControlNode) => {
            if (el.region !== node.region && 
                el.container == node.container &&
                el.layerN == node.layerN &&
                el.controllN == node.controllN &&
                el.constructor.name == node.constructor.name &&
                regions.includes(el.region)) {
                    return true;                    
            }
        });

        elelms.forEach(el=>{
            
            let oldregion = el.region
            let nodeCopy = new node.constructor.parse(node.getCCode());

            Objects.overwrite(el, nodeCopy)
            el.region = oldregion
        })

        return elelms;
    }

    static copyNodeToOtherRegions(node: ControlNode, regions: string[], parser:Parser) {
        let elelms = <ControlNode[]> parser.getNodes().filter((el: ControlNode) => {
            if (el.region !== node.region && 
                el.container == node.container &&
                el.layerN == node.layerN &&
                el.controllN == node.controllN &&
                el.constructor.name == node.constructor.name &&
                regions.includes(el.region)) {
                    return true;                    
            }
        });


        elelms.forEach(el=>{
            parser.removeNode(el);
        })

        let nodeCopy = new node.constructor.parse(node.getCCode());

        Objects.overwrite(el, nodeCopy)
        el.region = oldregion
    }
}