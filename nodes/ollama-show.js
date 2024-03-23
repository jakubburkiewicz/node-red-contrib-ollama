module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaShowNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const ollama = new Ollama()
            const { name } = msg.payload

            const response = await ollama.show( { name } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-show', OllamaShowNode )
}