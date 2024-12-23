module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaShowNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'
        this.systemType = config.systemType || 'str'
        this.templateType = config.templateType || 'str'

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

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = msg?.payload?.options || ( optionsConfig ) ? JSON.parse( optionsConfig.json ) : null

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