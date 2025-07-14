module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaChatNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.messagesType = config.messagesType || 'msg'
        this.stream = config.stream || false
        this.keepAliveType = config.keepAliveType || 'str'
        this.think = config.think || false

        const node = this
        node.on( 'input', async function( msg ) {
            const server = RED.nodes.getNode( config.server )
            const host = msg?.payload?.host || ( server ) ? server.host + ':' + server.port : null

            const ollama = new Ollama( { host } )

            let model = null
            if( msg?.payload?.model ) {
                model = msg?.payload?.model
            } else if( !!config.model ) {
                if( node.modelType === 'str' ) {
                    model = config.model
                } else if( node.modelType === 'msg' ) {
                    model = msg[ config.model ]
                } else if( node.modelType === 'flow' ) {
                    model = node.context().flow.get( config.model )
                } else if( node.modelType === 'global' ) {
                    model = node.context().global.get( config.model )
                }
            }

            let messages = null
            if( msg?.payload?.messages ) {
                messages = msg?.payload?.messages
            } else if( !!config.messages ) {
                if( node.messagesType === 'msg' ) {
                    messages = msg[ config.messages ]
                } else if( node.messagesType === 'flow' ) {
                    messages = node.context().flow.get( config.messages )
                } else if( node.messagesType === 'global' ) {
                    messages = node.context().global.get( config.messages )
                } else if( node.messagesType === 'json' ) {
                    messages = JSON.parse( config.messages )
                }
            }

            const formatConfig = RED.nodes.getNode( config.format )
            const format = msg?.payload?.format || ( formatConfig ) ? formatConfig.json : null

            const stream = ( msg?.payload?.stream !== undefined ) ? msg?.payload?.stream : node.stream

            let keep_alive = null
            if( msg?.payload?.keep_alive ) {
                keep_alive = msg?.payload?.keep_alive
            } else if( !!config.keepAlive ) {
                if( node.keepAliveType === 'str' ) {
                    keep_alive = config.keepAlive
                } else if( node.keepAliveType === 'num' ) {
                    keep_alive = Number( config.keepAlive )
                }
            }

            const toolsConfig = RED.nodes.getNode( config.tools )
            const tools = msg?.payload?.tools || ( toolsConfig ) ? JSON.parse( toolsConfig.json ) : null

            const think = ( msg?.payload?.think !== undefined ) ? msg?.payload?.think : node.think

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = msg?.payload?.options || ( optionsConfig ) ? JSON.parse( optionsConfig.json ) : null

            const response = await ollama.chat( {
                    model,
                    messages,
                    format,
                    stream,
                    keep_alive,
                    tools,
                    think,
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