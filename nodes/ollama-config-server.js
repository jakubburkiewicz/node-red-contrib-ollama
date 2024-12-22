module.exports = function( RED ) {
    function OllamaConfigServerNode( config ) {
        RED.nodes.createNode( this, config )

        this.host = config.host
        this.port = config.port
    }

    RED.nodes.registerType( 'ollama-config-server', OllamaConfigServerNode )
}