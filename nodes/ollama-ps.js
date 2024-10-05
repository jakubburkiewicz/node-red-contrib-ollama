module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaPsNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const { host } = msg.payload

            const ollama = new Ollama( { host } )

            const response = await ollama.ps()
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-ps', OllamaPsNode )
}