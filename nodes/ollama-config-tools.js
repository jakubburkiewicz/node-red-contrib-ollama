module.exports = function( RED ) {
    function OllamaConfigToolsNode( config ) {
        RED.nodes.createNode( this, config )

        this.name = config.name
        this.json = config.json
    }

    RED.nodes.registerType( 'ollama-config-tools', OllamaConfigToolsNode )
}