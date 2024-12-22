module.exports = function( RED ) {
    function OllamaConfigModelNode( config ) {
        RED.nodes.createNode( this, config )

        this.name = config.name
    }

    RED.nodes.registerType( 'ollama-config-model', OllamaConfigModelNode )
}