module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaShowNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const {
                system,
                template
            } = msg.payload

            const server = RED.nodes.getNode( config.server )
            const host = ( server ) ? server.host + ':' + server.port : msg?.payload?.host

            const ollama = new Ollama( { host } )

            const modelConfig = RED.nodes.getNode( config.model )
            const model = ( modelConfig ) ? modelConfig.name : msg?.payload?.model

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = ( optionsConfig ) ? optionsConfig.json : msg?.payload?.options

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