module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaCreateNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const {
                host,
                model,
                modelfile,
                stream,
                path
            } = msg.payload

            const ollama = new Ollama( { host } )

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