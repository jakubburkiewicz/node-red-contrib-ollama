module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaEmbedNode( config )  {
        RED.nodes.createNode( this, config )

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

            const modelConfig = RED.nodes.getNode( config.model )
            const model = ( modelConfig ) ? modelConfig.name : msg?.payload?.model

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