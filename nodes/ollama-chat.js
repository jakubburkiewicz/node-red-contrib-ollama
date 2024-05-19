module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaChatNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const { host, model, messages, format, stream, keep_alive, options } = msg.payload

            const ollama = new Ollama( { host } )

            const response = await ollama.chat( { model, messages, format, stream, keep_alive, options } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-chat', OllamaChatNode )
}