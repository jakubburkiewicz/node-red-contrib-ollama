module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaCopyNode( config )  {
        RED.nodes.createNode( this, config )

        this.sourceType = config.sourceType || 'str'
        this.destinationType = config.destinationType || 'str'

        const node = this
        node.on( 'input', async function( msg ) {
            const server = RED.nodes.getNode( config.server )

            const host = ( server ) ? server.host + ':' + server.port : msg?.payload?.host

            const ollama = new Ollama( { host } )

            let source = null
            if( !!config.source ) {
                if( node.sourceType === 'str' ) {
                    source = config.source
                } else if( node.sourceType === 'msg' ) {
                    source = msg[ config.source ]
                } else if( node.sourceType === 'flow' ) {
                    source = node.context().flow.get( config.source )
                } else if( node.sourceType === 'global' ) {
                    source = node.context().global.get( config.source )
                }
            } else {
                source = msg?.payload?.source
            }

            let destination = null
            if( !!config.destination ) {
                if( node.destinationType === 'str' ) {
                    destination = config.destination
                } else if( node.destinationType === 'msg' ) {
                    destination = msg[ config.destination ]
                } else if( node.destinationType === 'flow' ) {
                    destination = node.context().flow.get( config.destination )
                } else if( node.destinationType === 'global' ) {
                    destination = node.context().global.get( config.destination )
                }
            } else {
                destination = msg?.payload?.destination
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