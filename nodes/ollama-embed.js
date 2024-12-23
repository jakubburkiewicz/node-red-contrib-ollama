module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaEmbedNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.keepAliveType = config.keepAliveType || 'str'

        const node = this
        node.on( 'input', async function( msg ) {
            const {
                input,
                truncate
            } = msg.payload

            const server = RED.nodes.getNode( config.server )
            const host = ( server ) ? server.host + ':' + server.port : msg?.payload?.host

            const ollama = new Ollama( { host } )

            let model = null
            if( !!config.model ) {
                if( node.modelType === 'str' ) {
                    model = config.model
                } else if( node.modelType === 'msg' ) {
                    model = msg[ config.model ]
                } else if( node.modelType === 'flow' ) {
                    model = node.context().flow.get( config.model )
                } else if( node.modelType === 'global' ) {
                    model = node.context().global.get( config.model )
                }
            } else {
                model = msg?.payload?.model
            }

            let keep_alive = null
            if( !!config.keepAlive ) {
                if( node.keepAliveType === 'str' ) {
                    keep_alive = config.keepAlive
                } else if( node.keepAliveType === 'num' ) {
                    keep_alive = Number( config.keepAlive )
                }
            } else {
                keep_alive = msg?.payload?.keep_alive
            }

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = ( optionsConfig ) ? optionsConfig.json : msg?.payload?.options

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