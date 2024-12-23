module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaPulltNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.stream = config.stream || false

        const node = this
        node.on( 'input', async function( msg ) {
            const {
                insecure
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

            const stream = ( node.stream !== undefined ) ? node.stream : msg?.payload?.stream

            const response = await ollama.pull( {
                    model,
                    insecure,
                    stream
                } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-pull', OllamaPulltNode )
}