module.exports = function( RED ) {
    function OllamaConfigServerNode( config ) {
        RED.nodes.createNode( this, config )

        this.host = config.host
        this.port = config.port
        this.useCloud = config.useCloud || false
    }

    RED.nodes.registerType( 'ollama-config-server', OllamaConfigServerNode, {
        credentials: {
            apiKey: { type: "password" }
        }
    } )
}