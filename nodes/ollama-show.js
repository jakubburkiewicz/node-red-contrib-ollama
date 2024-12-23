module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaShowNode( config )  {
        RED.nodes.createNode( this, config )

        this.modelType = config.modelType || 'str'

        const node = this
        node.on( 'input', async function( msg ) {
            const {
                system,
                template
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