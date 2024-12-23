module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaPulltNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.insecure = config.insecure || false
        this.stream = config.stream || false

        const node = this
        node.on( 'input', async function( msg ) {
            const server = RED.nodes.getNode( config.server )
            const host = msg?.payload?.host || ( server ) ? server.host + ':' + server.port : null

            const ollama = new Ollama( { host } )

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

            const insecure = ( msg?.payload?.insecure !== undefined ) ? msg?.payload?.insecure : node.insecure

            const stream = ( msg?.payload?.stream !== undefined ) ? msg?.payload?.stream : node.stream

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