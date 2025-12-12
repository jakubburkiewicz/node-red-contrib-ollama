module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaListNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const server = RED.nodes.getNode( config.server )

            // Construct host URL
            let host = null
            if ( !host && server ) {
                if ( server.useCloud ) {
                    // For Ollama Cloud, always use the configured host (https://ollama.com)
                    // NEVER allow msg.payload.host override when using API key authentication
                    if ( server.host.startsWith('http://') || server.host.startsWith('https://') ) {
                        host = server.host
                    } else {
                        host = `https://${server.host}:${server.port}`
                    }
                } else {
                    // For local Ollama servers, allow host override from message
                    host = msg?.payload?.host
                    if ( !host ) {
                        if ( server.host.startsWith('http://') || server.host.startsWith('https://') ) {
                            host = server.host
                        } else {
                            host = `http://${server.host}:${server.port}`
                        }
                    }
                }
            }

            // Ollama Cloud configuration
            const ollamaConfig = { host }
            if ( server && server.useCloud && server.credentials && server.credentials.apiKey ) {
                ollamaConfig.headers = {
                    'Authorization': `Bearer ${server.credentials.apiKey}`
                }
            }

            const ollama = new Ollama( ollamaConfig )

            const response = await ollama.list()
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-list', OllamaListNode )
}