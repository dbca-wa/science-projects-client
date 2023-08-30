// Script for keeping track of the currently selected Lexical node.
// This script is required for ensuring that the lexical toolbar updates with 
// the correct values when clicking on a node. WIP.

import { createContext, useState, useContext, useEffect } from 'react';

export type NodeType = 'h1' | 'h2' | 'h3' | 'paragraph' | 'ol' | 'ul' | 'quote';

interface ILexicalSelectedNode {
    selectedNodeType: NodeType;
    setSelectedNodeType?: (nodeType: NodeType) => void;
}

const LexicalSelectedNodeContext = createContext<ILexicalSelectedNode>({
    selectedNodeType: 'paragraph',
    setSelectedNodeType: () => { throw new Error('switchNodeType function must be overridden') },
});

interface ILexicalSelectedNodeProviderProps {
    children: React.ReactNode;
}

export const LexicalSelectedNodeProvider = ({ children }: ILexicalSelectedNodeProviderProps) => {
    const [selectedNodeType, setSelectedNodeType] = useState<NodeType>('paragraph');

    useEffect(() => {
        console.log('Selected node type changed:', selectedNodeType);

    }, [selectedNodeType])

    return (
        <LexicalSelectedNodeContext.Provider value={{ selectedNodeType, setSelectedNodeType }}>
            {children}
        </LexicalSelectedNodeContext.Provider>
    );
};

export const useSelectedNode = () => useContext(LexicalSelectedNodeContext);
