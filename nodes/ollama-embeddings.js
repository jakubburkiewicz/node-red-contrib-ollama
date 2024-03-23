module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaEmbeddingsNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const ollama = new Ollama()
            const { model, prompt, options, keep_alive } = msg.payload

            const response = await ollama.embeddings( { model, prompt, options, keep_alive } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-embeddings', OllamaEmbeddingsNode )
}