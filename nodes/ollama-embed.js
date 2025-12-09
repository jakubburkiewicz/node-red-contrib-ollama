module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaEmbedNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.inputType = config.inputType || 'str'
        this.thuncate = config.thuncate || false
        this.keepAliveType = config.keepAliveType || 'str'

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

            let input = null
            if( msg?.payload?.input ) {
                input = msg?.payload?.input
            } else if( !!config.input ) {
                if( node.inputType === 'str' ) {
                    input = config.input
                } else if( node.inputType === 'msg' ) {
                    input = msg[ config.input ]
                } else if( node.inputType === 'flow' ) {
                    input = node.context().flow.get( config.input )
                } else if( node.inputType === 'global' ) {
                    input = node.context().global.get( config.input )
                } else if( node.inputType === 'json' ) {
                    input = JSON.parse( config.input )
                }
            }

            const truncate = ( msg?.payload?.truncate !== undefined ) ? msg?.payload?.truncate : node.truncate

            let keep_alive = null
            if( msg?.payload?.keep_alive ) {
                keep_alive = msg?.payload?.keep_alive
            } else if( !!config.keepAlive ) {
                if( node.keepAliveType === 'str' ) {
                    keep_alive = config.keepAlive
                } else if( node.keepAliveType === 'num' ) {
                    keep_alive = Number( config.keepAlive )
                }
            }

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = msg?.payload?.options || ( optionsConfig ) ? JSON.parse( optionsConfig.json ) : null

            const response = await ollama.embed( {
                model,
                input,
                truncate,
                keep_alive,
                options
            } )
            .catch( error => {
                node.error( error )
            } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-embed', OllamaEmbedNode )
}