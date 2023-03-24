import { Objects } from "leet-mvc/core/Objects";
import { CNode, ControlNode, CRNode, FieldNode, Parser, TabNode } from "./Parser";

export class NodeOperations {
    static removeNodes(selectedNodes: ControlNode[], parser: Parser, recursive: any) {
        selectedNodes.forEach(node=> {
            console.log(`remove ${node.container} ${node.constructor.name} ${node.controllN} `,)
            parser.removeNode(node);
            if (recursive && node instanceof TabNode) {
                let children = parser.getNodes().filter((el:ControlNode)=>el.region == node.region && el !== node && (el.layerN == node.layerN || el.parentN == node.layerN ))
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

    static copyNodeToOtherRegions(nodes: CRNode[], region: string, parser:Parser, recursive: any) {
        /*let existing = <ControlNode[]> parser.getNodes().filter((el: ControlNode) => {
            if (el.region !== node.region && 
                el.container == node.container &&
                el.layerN == node.layerN &&
                el.controllN == node.controllN &&
                el.constructor.name == node.constructor.name &&
                regions.includes(el.region)) {
                    return true;                    
            }
        });

        if (existing.length > 0)
            NodeOperations.removeNodes(existing, parser, recursive);*/
        let ret:CRNode[] = []
        nodes.forEach(node=>{
            let nodeCopy = node.constructor.parse(node.getCCode());
            nodeCopy.region = region
            parser.insertNewNode(nodeCopy) 


            if (recursive && node instanceof TabNode) {
                let children = parser.getNodes().filter((el:ControlNode)=>el.region == node.region && el !== node && (el.layerN == node.layerN || el.parentN == node.layerN ))
                NodeOperations.copyNodeToOtherRegions(children, region, parser, recursive);
            }

            if (node instanceof FieldNode) {
                if (node.fieldText)
                    nodeCopy.fieldText = NodeOperations.copyNodeToOtherRegions([node.fieldText], region, parser, recursive)[0];
                if (node.fieldFilter)
                    nodeCopy.fieldFilter = NodeOperations.copyNodeToOtherRegions([node.fieldFilter], region, parser, recursive)[0];
            }
            ret.push(nodeCopy)

        })
        return ret;
    }
}