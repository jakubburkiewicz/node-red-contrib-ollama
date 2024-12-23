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

            let template = null
            if( !!config.template ) {
                if( node.templateType === 'str' ) {
                    template = config.template
                } else if( node.templateType === 'msg' ) {
                    template = msg[ config.template ]
                } else if( node.templateType === 'flow' ) {
                    template = node.context().flow.get( config.template )
                } else if( node.templateType === 'global' ) {
                    template = node.context().global.get( config.template )
                }
            } else {
                template = msg?.payload?.template
            }

            const optionsConfig = RED.nodes.getNode( config.options )
            const options = ( optionsConfig ) ? optionsConfig.json : msg?.payload?.options

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