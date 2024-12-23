module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaChatNode( config )  {
        RED.nodes.createNode( this, config )

        const messagesType = config.messagesType || 'msg'

        const node = this
        node.on( 'input', async function( msg ) {
            const {
                host: payloadHost,
                model: payloadModel,
                messages: payloadMessages,
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

            let messages = null
            if( !!config.messages ) {
                if( messagesType === 'msg' ) {
                    messages = msg[ config.messages ]
                } else if( messagesType === 'flow' ) {
                    messages = node.context().flow.get( config.messages )
                } else if( messagesType === 'global' ) {
                    messages = node.context().global.get( config.messages )
                } else if( messagesType === 'json' ) {
                    messages = JSON.parse( config.messages )
                }
            } else {
                messages = payloadMessages
            }

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