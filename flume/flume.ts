import React from 'react';
import { NodeEditor } from 'flume';
import config from './flumeConfig';

const PromptEditor = () => {
    return (
        <div style= {{ width: '100%', height: '100vh' }
}>
    <NodeEditor
        nodeTypes={ config.nodeTypes }
portTypes = { config.portTypes }
onChange = { nodes => {
    // Handle node updates
    console.log(nodes);
}}
      />
    </div>
  );
};

export default PromptEditor;