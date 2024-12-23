module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaGenerateNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.promptType = config.promptType || 'str'
        this.suffixType = config.suffixType || 'str'
        this.systemType = config.systemType || 'str'
        this.stream = config.stream || false
        this.keepAliveType = config.keepAliveType || 'str'

        const node = this
        node.on( 'input', async function( msg ) {
            const {
                prompt,
                suffix,
                system,
                template,
                raw,
                images
            } = msg.payload

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

            let prompt = null
            if( !!config.prompt ) {
                if( node.promptType === 'str' ) {
                    prompt = config.prompt
                } else if( node.promptType === 'msg' ) {
                    prompt = msg[ config.prompt ]
                } else if( node.promptType === 'flow' ) {
                    prompt = node.context().flow.get( config.prompt )
                } else if( node.promptType === 'global' ) {
                    prompt = node.context().global.get( config.prompt )
                }
            } else {
                prompt = msg?.payload?.prompt
            }

            let suffix = null
            if( !!config.suffix ) {
                if( node.suffixType === 'str' ) {
                    suffix = config.suffix
                } else if( node.suffixType === 'msg' ) {
                    suffix = msg[ config.suffix ]
                } else if( node.suffixType === 'flow' ) {
                    suffix = node.context().flow.get( config.suffix )
                } else if( node.suffixType === 'global' ) {
                    suffix = node.context().global.get( config.suffix )
                }
            } else {
                suffix = msg?.payload?.suffix
            }

            let system = null
            if( !!config.system ) {
                if( node.systemType === 'str' ) {
                    system = config.system
                } else if( node.systemType === 'msg' ) {
                    system = msg[ config.system ]
                } else if( node.systemType === 'flow' ) {
                    system = node.context().flow.get( config.system )
                } else if( node.systemType === 'global' ) {
                    system = node.context().global.get( config.system )
                }
            } else {
                system = msg?.payload?.system
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

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = ( optionsConfig ) ? optionsConfig.json : msg?.payload?.options

            const response = await ollama.generate( {
                model,
                prompt,
                suffix,
                system,
                template,
                raw,
                images,
                format,
                stream,
                keep_alive,
                options
            } )
            .catch( error => {
                node.error( error )
            } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-generate', OllamaGenerateNode )
}