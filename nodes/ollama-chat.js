module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaChatNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.messagesType = config.messagesType || 'msg'
        this.stream = config.stream || false
        this.keepAliveType = config.keepAliveType || 'str'

        const node = this
        node.on( 'input', async function( msg ) {
            const server = RED.nodes.getNode( config.server )
            const host = ( server ) ? server.host + ':' + server.port : msg?.payload?.host

            const ollama = new Ollama( { host } )

            let model = null
            if( !!config.model ) {
                if( node.modelType === 'str' ) {
                    model = config.model
                } else if( node.modelType === 'msg' ) {
                    model = msg[ config.model ]
                } else if( node.modelType === 'flow' ) {
                    model = node.context().flow.get( config.model )
                } else if( node.modelType === 'global' ) {
                    model = node.context().global.get( config.model )
                }
            } else {
                model = msg?.payload?.model
            }

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
                messages = msg?.payload?.messages
            }

            const formatConfig = RED.nodes.getNode( config.format )
            const format = ( formatConfig ) ? formatConfig.json : msg?.payload?.format

            const stream = ( node.stream !== undefined ) ? node.stream : msg?.payload?.stream

            let keep_alive = null
            if( !!config.keepAlive ) {
                if( node.keepAliveType === 'str' ) {
                    keep_alive = config.keepAlive
                } else if( node.keepAliveType === 'num' ) {
                    keep_alive = Number( config.keepAlive )
                }
            } else {
                keep_alive = msg?.payload?.keep_alive
            }

            const toolsConfig = RED.nodes.getNode( config.tools )
            const tools = ( toolsConfig ) ? JSON.parse( toolsConfig.json ) : msg?.payload?.tools

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = ( optionsConfig ) ? JSON.parse( optionsConfig.json ) : msg?.payload?.options

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