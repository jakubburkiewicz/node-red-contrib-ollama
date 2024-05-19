module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaGenerateNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const { host, model, prompt, images, format, options, system, template, context, stream, raw, keep_alive } = msg.payload

            const ollama = new Ollama( { host } )

            const response = await ollama.generate( { model, prompt, images, format, options, system, template, context, stream, raw, keep_alive } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-generate', OllamaGenerateNode )
}