module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaCreateNode( config )  {
        RED.nodes.createNode( this, config )

        const node = this
        const cfg = config
        
        node.on( 'input', async function( msg ) {
            const server = RED.nodes.getNode( config.server )

            // Construct host URL
            let host = null
            if ( !host && server ) {
                if ( server.useCloud ) {
                    // For Ollama Cloud, always use the configured host (https://ollama.com)
                    // NEVER allow msg.payload.host override when using API key authentication
                    if ( server.host.startsWith('http://') || server.host.startsWith('https://') ) {
                        host = server.host
                    } else {
                        host = `https://${server.host}:${server.port}`
                    }
                } else {
                    // For local Ollama servers, allow host override from message
                    host = msg?.payload?.host
                    if ( !host ) {
                        if ( server.host.startsWith('http://') || server.host.startsWith('https://') ) {
                            host = server.host
                        } else {
                            host = `http://${server.host}:${server.port}`
                        }
                    }
                }
            }

            // Ollama Cloud configuration
            const ollamaConfig = { host }
            if ( server && server.useCloud && server.credentials && server.credentials.apiKey ) {
                ollamaConfig.headers = {
                    'Authorization': `Bearer ${server.credentials.apiKey}`
                }
            }

            const stream = (msg?.payload?.stream !== undefined) ? msg.payload.stream : cfg.stream

            let model = null
            if( msg?.payload?.model ) {
                model = msg.payload.model
            } else {
                model = RED.util.evaluateNodeProperty(cfg.model, cfg.modelType, node, msg)
            }

            let from = null
            if( msg?.payload?.from ) {
                from = msg.payload.from
            } else if( !!config.from ) {
                from = RED.util.evaluateNodeProperty(cfg.from, cfg.fromType, node, msg)                
            }

            let quantize = null
            if( msg?.payload?.quantize ) {
                quantize = msg.payload.quantize
            } else if( !!config.quantize ) {
                quantize = RED.util.evaluateNodeProperty(cfg.quantize, cfg.quantizeType, node, msg)
            }

            let template = null
            if( msg?.payload?.template ) {
                template = msg.payload.template
            } else if( !!config.template ) {
                template = RED.util.evaluateNodeProperty(cfg.template, cfg.templateType, node, msg)
            }

            let license = null
            if( msg?.payload?.license ) {
                license = msg.payload.license
            } else if( !!config.license ) {
                license = RED.util.evaluateNodeProperty(cfg.license, cfg.licenseType, node, msg)
            }

            let system = null
            if( msg?.payload?.system ) {
                system = msg.payload.system
            } else if( !!config.system ) {
                system = RED.util.evaluateNodeProperty(cfg.system, cfg.systemType, node, msg)
            }

            let parameters = null
            if( msg?.payload?.parameters ) {
                parameters = msg.payload.parameters
            } else if( !!config.parameters ) {
                parameters = RED.util.evaluateNodeProperty(cfg.parameters, cfg.parametersType, node, msg)
            }

            let messages = null
            if( msg?.payload?.messages ) {
                messages = msg.payload.messages
            } else if( !!config.messages ) {
                messages = RED.util.evaluateNodeProperty(cfg.messages, cfg.messagesType, node, msg)
            }

            let adapters = null
            if( msg?.payload?.adapters ) {
                adapters = msg.payload.adapters
            } else if( !!config.adapters ) {
                adapters = RED.util.evaluateNodeProperty(cfg.adapters, cfg.adaptersType, node, msg)
            }
            
            const ollama = new Ollama(ollamaConfig)

            ollama.create( {
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
            })
            .then( response => {
                msg.payload = response
                node.send(msg)
            })
            .catch( error => {
                node.error( error )
            })
        } )
    }

    RED.nodes.registerType( 'ollama-create', OllamaCreateNode )
}