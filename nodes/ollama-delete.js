module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaDeleteNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const ollama = new Ollama()
            const { model } = msg.payload

            const response = await ollama.delete( { model } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-delete', OllamaDeleteNode )
}