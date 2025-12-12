module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaDeleteNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'

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

            let model = null
            if( msg?.payload?.model ) {
                model = msg?.payload?.model
            } else if( !!config.model ) {
                if( node.modelType === 'str' ) {
                    model = config.model
                } else if( node.modelType === 'msg' ) {
                    model = msg[ config.model ]
                } else if( node.modelType === 'flow' ) {
                    model = node.context().flow.get( config.model )
                } else if( node.modelType === 'global' ) {
                    model = node.context().global.get( config.model )
                }
            }

            const response = await ollama.delete( { model } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-delete', OllamaDeleteNode )
}