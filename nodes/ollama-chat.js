module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaChatNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const {
                host: payloadHost,
                model: payloadModel,
                messages,
                format: payloadFormat,
                stream,
                keep_alive,
                tools: payloadTools,
                options: payloadOptions
            } = msg.payload

            const server = RED.nodes.getNode( config.server )
            const host = ( server ) ? server.host + ':' + server.port : payloadHost

            const ollama = new Ollama( { host } )

            const modelConfig = RED.nodes.getNode( config.model )
            const model = ( modelConfig ) ? modelConfig.name : payloadModel

            const formatConfig = RED.nodes.getNode( config.format )
            const format = ( formatConfig ) ? formatConfig.json : payloadFormat

            const toolsConfig = RED.nodes.getNode( config.tools )
            const tools = ( toolsConfig ) ? toolsConfig.json : payloadTools

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = ( optionsConfig ) ? optionsConfig.json : payloadOptions

            const response = await ollama.chat( {
                    model,
                    messages,
                    format,
                    stream,
                    keep_alive,
                    tools,
                    options
                } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-chat', OllamaChatNode )
}