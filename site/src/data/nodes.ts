export interface NodeInfo {
	id: string;
	name: string;
	summary: string;
}

export const configNodes: NodeInfo[] = [
	{ id: 'ollama-config-server', name: 'Server', summary: 'Connection to a local Ollama instance or Ollama Cloud (host, port, API key).' },
	{ id: 'ollama-config-options', name: 'Options', summary: 'Reusable generation options (temperature, context size, and more).' },
	{ id: 'ollama-config-format', name: 'Format', summary: 'Reusable response format / JSON schema definition.' },
	{ id: 'ollama-config-tools', name: 'Tools', summary: 'Reusable tool/function definitions for tool-calling models.' },
];

export const actionNodes: NodeInfo[] = [
	{ id: 'ollama-chat', name: 'Chat', summary: 'Generate the next message in a chat with a provided model.' },
	{ id: 'ollama-generate', name: 'Generate', summary: 'Generate a response for a given prompt with a provided model.' },
	{ id: 'ollama-embed', name: 'Embed', summary: 'Generate embeddings from a model.' },
	{ id: 'ollama-list', name: 'List', summary: 'List models that are available.' },
	{ id: 'ollama-show', name: 'Show', summary: 'Show details, template, parameters, license and system prompt of a model.' },
	{ id: 'ollama-ps', name: 'Ps', summary: 'List models that are currently loaded into memory.' },
	{ id: 'ollama-pull', name: 'Pull', summary: 'Download a model from the Ollama library.' },
	{ id: 'ollama-push', name: 'Push', summary: 'Upload a model to a model library.' },
	{ id: 'ollama-create', name: 'Create', summary: 'Create a model from a Modelfile.' },
	{ id: 'ollama-copy', name: 'Copy', summary: 'Copy a model to a new name.' },
	{ id: 'ollama-delete', name: 'Delete', summary: 'Delete a model and its data.' },
	{ id: 'ollama-abort', name: 'Abort', summary: 'Abort all streamed generations currently running.' },
];
