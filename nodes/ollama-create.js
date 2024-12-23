module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaCreateNode( config )  {
        RED.nodes.createNode( this, config )

        this.stream = config.stream || false
        this.pathType = config.pathType || 'str'

        const node = this
        node.on( 'input', async function( msg ) {
            const {
                modelfile
            } = msg.payload

            const server = RED.nodes.getNode( config.server )
            const host = ( server ) ? server.host + ':' + server.port : msg?.payload?.host

            const ollama = new Ollama( { host } )

            const modelConfig = RED.nodes.getNode( config.model )
            const model = ( modelConfig ) ? modelConfig.name : msg?.payload?.model

            const stream = ( node.stream !== undefined ) ? node.stream : msg?.payload?.stream

            let path = null
            if( !!config.path ) {
                if( node.pathType === 'str' ) {
                    path = config.path
                } else if( node.pathType === 'msg' ) {
                    path = msg[ config.path ]
                } else if( node.pathType === 'flow' ) {
                    path = node.context().flow.get( config.path )
                } else if( node.pathType === 'global' ) {
                    path = node.context().global.get( config.path )
                }
            } else {
                path = msg?.payload?.path
            }

            const response = await ollama.create( {
                    model,
                    modelfile,
                    stream,
                    path
                } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-create', OllamaCreateNode )
}