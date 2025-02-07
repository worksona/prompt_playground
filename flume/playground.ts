import { FlumeConfig, Controls, Colors } from "flume";

const config = new FlumeConfig();

// Port Types
config
    .addPortType({
        type: "text",
        name: "text",
        label: "Text",
        color: Colors.green,
        controls: [
            Controls.text({
                name: "text",
                label: "Text Content"
            })
        ]
    })
    .addPortType({
        type: "persona",
        name: "persona",
        label: "Persona",
        color: Colors.orange,
        controls: [
            Controls.text({
                name: "name",
                label: "Name"
            }),
            Controls.text({
                name: "description",
                label: "Description"
            })
        ]
    })
    .addPortType({
        type: "scenario",
        name: "scenario",
        label: "Scenario",
        color: Colors.purple,
        controls: [
            Controls.text({
                name: "name",
                label: "Name"
            }),
            Controls.text({
                name: "context",
                label: "Context"
            }),
            Controls.text({
                name: "challenges",
                label: "Challenges"
            }),
            Controls.text({
                name: "opportunities",
                label: "Opportunities"
            })
        ]
    })
    .addPortType({
        type: "prompt",
        name: "prompt",
        label: "Prompt",
        color: Colors.blue,
        controls: [
            Controls.text({
                name: "text",
                label: "Prompt Text"
            })
        ]
    })
    .addPortType({
        type: "result",
        name: "result",
        label: "Result",
        color: Colors.red
    });

// Node Types
config
    // Source Node
    .addNodeType({
        type: "source",
        label: "Source Content",
        description: "Input source content",
        inputs: ports => [],
        outputs: ports => [
            ports.text()
        ]
    })
    // Persona Node
    .addNodeType({
        type: "persona",
        label: "Persona",
        description: "Define a persona",
        inputs: ports => [],
        outputs: ports => [
            ports.persona()
        ]
    })
    // Scenario Node
    .addNodeType({
        type: "scenario",
        label: "Scenario",
        description: "Define a scenario",
        inputs: ports => [],
        outputs: ports => [
            ports.scenario()
        ]
    })
    // Prompt Node
    .addNodeType({
        type: "prompt",
        label: "Prompt",
        description: "Create a prompt with context",
        inputs: ports => [
            ports.text({ name: "source" }),
            ports.persona({ name: "personas", multi: true }),
            ports.scenario({ name: "scenario" })
        ],
        outputs: ports => [
            ports.prompt(),
            ports.result()
        ]
    })
    // Chain Node
    .addNodeType({
        type: "chain",
        label: "Prompt Chain",
        description: "Chain multiple prompts",
        inputs: ports => [
            ports.result({ name: "previousResult" }),
            ports.prompt({ name: "prompt" })
        ],
        outputs: ports => [
            ports.result()
        ]
    });

export default config;