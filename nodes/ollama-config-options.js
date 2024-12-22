module.exports = function( RED ) {
    function OllamaConfigOptionsNode( config ) {
        RED.nodes.createNode( this, config )

        this.name = config.name
        this.json = config.json
    }

    RED.nodes.registerType( 'ollama-config-options', OllamaConfigOptionsNode )
}