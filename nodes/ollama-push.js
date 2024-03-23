module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaPushNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const ollama = new Ollama()
            const { model, insecure, stream } = msg.payload

            const response = await ollama.push( { model, insecure, stream } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-push', OllamaPushNode )
}