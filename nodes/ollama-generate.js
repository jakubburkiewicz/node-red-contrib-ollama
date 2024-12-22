module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaGenerateNode( config )  {
        RED.nodes.createNode( this, config )
        const node = this

        node.on( 'input', async function( msg ) {
            const {
                host: payloadHost,
                model: payloadModel,
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
            } = msg.payload

            const server = RED.nodes.getNode( config.server )
            const host = ( server ) ? server.host + ':' + server.port : payloadHost

            const ollama = new Ollama( { host } )

            const modelConfig = RED.nodes.getNode( config.model )
            const model = ( modelConfig ) ? modelConfig.name : payloadModel

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