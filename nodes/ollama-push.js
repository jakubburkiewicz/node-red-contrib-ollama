module.exports = function( RED ) {
    const { Ollama } = require( 'ollama' )

    function OllamaPushNode( config )  {
        RED.nodes.createNode( this, config )

        this.stream = config.stream || false

        const node = this
        node.on( 'input', async function( msg ) {
            const {
                insecure
            } = msg.payload

            const server = RED.nodes.getNode( config.server )
            const host = ( server ) ? server.host + ':' + server.port : msg?.payload?.host

            const ollama = new Ollama( { host } )

            const modelConfig = RED.nodes.getNode( config.model )
            const model = ( modelConfig ) ? modelConfig.name : msg?.payload?.model

            const stream = ( node.stream !== undefined ) ? node.stream : msg?.payload?.stream

            const response = await ollama.push( {
                    model,
                    insecure,
                    stream
                } )
                .catch( error => {
                    node.error( error )
                } )

            msg.payload = response
            node.send( msg )
        } )
    }

    RED.nodes.registerType( 'ollama-push', OllamaPushNode )
}