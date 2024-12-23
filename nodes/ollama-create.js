module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaCreateNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.stream = config.stream || false
        this.pathType = config.pathType || 'str'

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

            const modelfile = msg?.payload?.modelfile || config.modelfile

            const stream = ( msg?.payload?.stream !== undefined ) ? msg?.payload?.stream : node.stream

            let path = null
            if( msg?.payload?.path ) {
                path = msg?.payload?.path
            } else if( !!config.path ) {
                if( node.pathType === 'str' ) {
                    path = config.path
                } else if( node.pathType === 'msg' ) {
                    path = msg[ config.path ]
                } else if( node.pathType === 'flow' ) {
                    path = node.context().flow.get( config.path )
                } else if( node.pathType === 'global' ) {
                    path = node.context().global.get( config.path )
                }
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