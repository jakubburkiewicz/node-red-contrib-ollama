module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaCopyNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const { host, source, destination } = msg.payload

            const ollama = new Ollama( { host } )

            const response = await ollama.copy( { source, destination } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-copy', OllamaCopyNode )
}