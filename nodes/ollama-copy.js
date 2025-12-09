module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaCopyNode( config )  {
        RED.nodes.createNode( this, config )

        this.sourceType = config.sourceType || 'str'
        this.destinationType = config.destinationType || 'str'

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

            let source = null
            if( msg?.payload?.source ) {
                source = msg?.payload?.source
            } else if( !!config.source ) {
                if( node.sourceType === 'str' ) {
                    source = config.source
                } else if( node.sourceType === 'msg' ) {
                    source = msg[ config.source ]
                } else if( node.sourceType === 'flow' ) {
                    source = node.context().flow.get( config.source )
                } else if( node.sourceType === 'global' ) {
                    source = node.context().global.get( config.source )
                }
            }

            let destination = null
            if( msg?.payload?.destination ) {
                destination = msg?.payload?.destination
            } else if( !!config.destination ) {
                if( node.destinationType === 'str' ) {
                    destination = config.destination
                } else if( node.destinationType === 'msg' ) {
                    destination = msg[ config.destination ]
                } else if( node.destinationType === 'flow' ) {
                    destination = node.context().flow.get( config.destination )
                } else if( node.destinationType === 'global' ) {
                    destination = node.context().global.get( config.destination )
                }
            }

            const response = await ollama.copy( {
                    source,
                    destination
                } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-copy', OllamaCopyNode )
}