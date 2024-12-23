module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaChatNode( config )  {
        RED.nodes.createNode( this, config )

        this.messagesType = config.messagesType || 'msg'
        this.stream = config.stream || false
        this.keepAliveType = config.keepAliveType || 'str'

        const node = this
        node.on( 'input', async function( msg ) {
            const {
                host: payloadHost,
                model: payloadModel,
                messages: payloadMessages,
                format: payloadFormat,
                stream: payloadStream,
                keep_alive: payloadKeepAlive,
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
                if( node.messagesType === 'msg' ) {
                    messages = msg[ config.messages ]
                } else if( node.messagesType === 'flow' ) {
                    messages = node.context().flow.get( config.messages )
                } else if( node.messagesType === 'global' ) {
                    messages = node.context().global.get( config.messages )
                } else if( node.messagesType === 'json' ) {
                    messages = JSON.parse( config.messages )
                }
            } else {
                messages = payloadMessages
            }

            const formatConfig = RED.nodes.getNode( config.format )
            const format = ( formatConfig ) ? formatConfig.json : payloadFormat

            const stream = ( node.stream !== undefined ) ? node.stream : payloadStream

            let keep_alive = null
            if( !!config.keepAlive ) {
                if( node.keepAliveType === 'str' ) {
                    keep_alive = config.keepAlive
                } else if( node.keepAliveType === 'num' ) {
                    keep_alive = Number( config.keepAlive )
                }
            } else {
                keep_alive = payloadKeepAlive
            }
            console.log( 'keep_alive', typeof keep_alive, keep_alive )

            const toolsConfig = RED.nodes.getNode( config.tools )
            const tools = ( toolsConfig ) ? JSON.parse( toolsConfig.json ) : payloadTools

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = ( optionsConfig ) ? JSON.parse( optionsConfig.json ) : payloadOptions

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