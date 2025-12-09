module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaAbortNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const server = RED.nodes.getNode( config.server )

            // Construct host URL
            let host = msg?.payload?.host
            if ( !host && server ) {
                // Check if host already includes protocol
                if ( server.host.startsWith('http://') || server.host.startsWith('https://') ) {
                    host = server.host
                } else {
                    host = `http://${server.host}:${server.port}`
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

            const response = await ollama.abort()
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-abort', OllamaAbortNode )
}