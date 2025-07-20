module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaCreateNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.fromType = config.from || 'str'
        this.stream = config.stream || false
        this.quantize = config.quantize || 'str'
        this.template = config.template || null
        this.license = config.license || null
        this.system = config.system || null
        this.parameters = config.parameters || 'str'
        this.messages = config.messages || 'str'
        this.adapters = config.adapters || 'str'
        this.pathType = config.pathType || 'str'

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

            let from = null
            if( msg?.payload?.from ) {
                from = msg?.payload?.from
            } else if( !!config.from ) {
                if( node.fromType === 'str' ) {
                    from = config.from
                } else if( node.fromType === 'msg' ) {
                    from = msg[ config.from ]
                } else if( node.fromType === 'flow' ) {
                    from = node.context().flow.get( config.from )
                } else if( node.fromType === 'global' ) {
                    from = node.context().global.get( config.from )
                }
            }

            const stream = ( msg?.payload?.stream !== undefined ) ? msg?.payload?.stream : node.stream

            let quantize = null
            if( msg?.payload?.quantize ) {
                quantize = msg?.payload?.quantize
            } else if( !!config.quantize ) {
                if( node.quantize === 'str' ) {
                    quantize = config.quantize
                } else if( node.quantize === 'msg' ) {
                    quantize = msg[ config.quantize ]
                } else if( node.quantize === 'flow' ) {
                    quantize = node.context().flow.get( config.quantize )
                } else if( node.quantize === 'global' ) {
                    quantize = node.context().global.get( config.quantize )
                }
            }

            let template = null
            if( msg?.payload?.template ) {
                template = msg?.payload?.template
            } else if( !!config.template ) {
                if( node.template === 'str' ) {
                    template = config.template
                } else if( node.template === 'msg' ) {
                    template = msg[ config.template ]
                } else if( node.template === 'flow' ) {
                    template = node.context().flow.get( config.template )
                } else if( node.template === 'global' ) {
                    template = node.context().global.get( config.template )
                }
            }

            let license = null
            if( msg?.payload?.license ) {
                license = msg?.payload?.license
            } else if( !!config.license ) {
                if( node.license === 'str' ) {
                    license = config.license
                } else if( node.license === 'msg' ) {
                    license = msg[ config.license ]
                } else if( node.license === 'flow' ) {
                    license = node.context().flow.get( config.license )
                } else if( node.license === 'global' ) {
                    license = node.context().global.get( config.license )
                }
            }

            let system = null
            if( msg?.payload?.system ) {
                system = msg?.payload?.system
            } else if( !!config.system ) {
                if( node.system === 'str' ) {
                    system = config.system
                } else if( node.system === 'msg' ) {
                    system = msg[ config.system ]
                } else if( node.system === 'flow' ) {
                    system = node.context().flow.get( config.system )
                } else if( node.system === 'global' ) {
                    system = node.context().global.get( config.system )
                }
            }

            let parameters = null
            if( msg?.payload?.parameters ) {
                parameters = msg?.payload?.parameters
            } else if( !!config.parameters ) {
                if( node.parameters === 'str' ) {
                    parameters = config.parameters
                } else if( node.parameters === 'msg' ) {
                    parameters = msg[ config.parameters ]
                } else if( node.parameters === 'flow' ) {
                    parameters = node.context().flow.get( config.parameters )
                } else if( node.parameters === 'global' ) {
                    parameters = node.context().global.get( config.parameters )
                }
            }

            let messages = null
            if( msg?.payload?.messages ) {
                messages = msg?.payload?.messages
            } else if( !!config.messages ) {
                if( node.messages === 'str' ) {
                    messages = config.messages
                } else if( node.messages === 'msg' ) {
                    messages = msg[ config.messages ]
                } else if( node.messages === 'flow' ) {
                    messages = node.context().flow.get( config.messages )
                } else if( node.messages === 'global' ) {
                    messages = node.context().global.get( config.messages )
                }
            }

            let adapters = null
            if( msg?.payload?.adapters ) {
                adapters = msg?.payload?.adapters
            } else if( !!config.adapters ) {
                if( node.adapters === 'str' ) {
                    adapters = config.adapters
                } else if( node.adapters === 'msg' ) {
                    adapters = msg[ config.adapters ]
                } else if( node.adapters === 'flow' ) {
                    adapters = node.context().flow.get( config.adapters )
                } else if( node.adapters === 'global' ) {
                    adapters = node.context().global.get( config.adapters )
                }
            }

            const response = await ollama.create( {
                    model,
                    from,
                    stream,
                    quantize,
                    template,
                    license,
                    system,
                    parameters,
                    messages,
                    adapters
                } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-create', OllamaCreateNode )
}