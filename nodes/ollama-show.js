module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaShowNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const {
                host,
                model,
                system,
                template,
                options
            } = msg.payload

            const ollama = new Ollama( { host } )

            const response = await ollama.show( {
                model,
                system,
                template,
                options
            } )
            .catch( error => {
                node.error( error )
            } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-show', OllamaShowNode )
}