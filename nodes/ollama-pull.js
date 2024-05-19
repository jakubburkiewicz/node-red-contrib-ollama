module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaPulltNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const { host, model, insecure, stream } = msg.payload

            const ollama = new Ollama( { host } )

            const response = await ollama.pull( { model, insecure, stream } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-pull', OllamaPulltNode )
}