module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaGenerateNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.promptType = config.promptType || 'str'
        this.suffixType = config.suffixType || 'str'
        this.systemType = config.systemType || 'str'
        this.templateType = config.templateType || 'str'
        this.raw = config.raw || false
        this.imagesType = config.imagesType || 'json'
        this.stream = config.stream || false
        this.think = config.think || false
        this.keepAliveType = config.keepAliveType || 'str'

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

            let prompt = null
            if( msg?.payload?.prompt ) {
                prompt = msg?.payload?.prompt
            } else if( !!config.prompt ) {
                if( node.promptType === 'str' ) {
                    prompt = config.prompt
                } else if( node.promptType === 'msg' ) {
                    prompt = msg[ config.prompt ]
                } else if( node.promptType === 'flow' ) {
                    prompt = node.context().flow.get( config.prompt )
                } else if( node.promptType === 'global' ) {
                    prompt = node.context().global.get( config.prompt )
                }
            }

            let suffix = null
            if( msg?.payload?.suffix ) {
                suffix = msg?.payload?.suffix
            } else if( !!config.suffix ) {
                if( node.suffixType === 'str' ) {
                    suffix = config.suffix
                } else if( node.suffixType === 'msg' ) {
                    suffix = msg[ config.suffix ]
                } else if( node.suffixType === 'flow' ) {
                    suffix = node.context().flow.get( config.suffix )
                } else if( node.suffixType === 'global' ) {
                    suffix = node.context().global.get( config.suffix )
                }
            }

            let system = null
            if( msg?.payload?.system ) {
                system = msg?.payload?.system
            } else if( !!config.system ) {
                if( node.systemType === 'str' ) {
                    system = config.system
                } else if( node.systemType === 'msg' ) {
                    system = msg[ config.system ]
                } else if( node.systemType === 'flow' ) {
                    system = node.context().flow.get( config.system )
                } else if( node.systemType === 'global' ) {
                    system = node.context().global.get( config.system )
                }
            }

            let template = null
            if( msg?.payload?.template ) {
                template = msg?.payload?.template
            } else if( !!config.template ) {
                if( node.templateType === 'str' ) {
                    template = config.template
                } else if( node.templateType === 'msg' ) {
                    template = msg[ config.template ]
                } else if( node.templateType === 'flow' ) {
                    template = node.context().flow.get( config.template )
                } else if( node.templateType === 'global' ) {
                    template = node.context().global.get( config.template )
                }
            }

            const raw = ( msg?.payload?.raw !== undefined ) ? msg?.payload?.raw : node.raw

            let images = null
            if( msg?.payload?.images ) {
                images = msg?.payload?.images
            } else if( !!config.images ) {
                if( node.imagesType === 'json' ) {
                    images = JSON.parse( config.images )
                } else if( node.imagesType === 'msg' ) {
                    images = msg[ config.images ]
                } else if( node.imagesType === 'flow' ) {
                    images = node.context().flow.get( config.images )
                } else if( node.imagesType === 'global' ) {
                    images = node.context().global.get( config.images )
                }
            }

            const formatConfig = RED.nodes.getNode( config.format )
            const format = msg?.payload?.format || ( formatConfig ) ? formatConfig.json : null

            const stream = ( msg?.payload?.stream !== undefined ) ? msg?.payload?.stream : node.stream

            const think = ( msg?.payload?.think !== undefined ) ? msg?.payload?.think : node.think || false

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

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = msg?.payload?.options || ( optionsConfig ) ? JSON.parse( optionsConfig.json ) : null

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
                think,
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