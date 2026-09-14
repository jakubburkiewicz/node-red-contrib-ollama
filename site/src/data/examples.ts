export interface FlowNode {
	id: string;
	type: string;
	name?: string;
	x?: number;
	y?: number;
	wires?: string[][];
	[key: string]: unknown;
}

export interface ExampleInfo {
	node: string;
	title: string;
	description: string;
	flow: FlowNode[];
	viewBox: string;
}

// Wraps an example's node list into an importable Node-RED flow (adds the
// tab and each node's `z`) — the same JSON you'd get from "Export" in the
// real editor, and what the on-page renderer draws from. Paste it straight
// into the Node-RED editor (Ctrl/Cmd+V) and it deploys and runs as-is
// against a local Ollama on localhost:11434 — these aren't decorative
// diagrams, the msg shapes match what each node actually expects/returns.
export function toFlowJson(nodes: FlowNode[]) {
	const tab = 'tab1';
	return [
		{ id: tab, type: 'tab', label: 'Flow 1', disabled: false, info: '', env: [] },
		// Config nodes (e.g. ollama-config-server) have no x/y — they're never
		// drawn on the canvas and, like in a real exported flow, get no `z`
		// (global scope). Giving them one made the renderer try to draw them
		// at NaN,NaN.
		...nodes.map((n) => (n.x === undefined || n.y === undefined ? n : { ...n, z: tab })),
	];
}

export const examples: ExampleInfo[] = [
	{
		node: 'Chat',
		title: 'Session-aware support chatbot',
		description:
			'A webhook keeps a running conversation per visitor in flow context: build the message history, get a reply from Ollama, remember it for next time, and answer back over HTTP.',
		viewBox: '0 0 1030 190',
		flow: [
			{ id: 'srv1', type: 'ollama-config-server', name: 'Local Ollama', host: 'localhost', port: 11434, useCloud: false },
			{
				id: 'n1', type: 'http in', name: 'POST /chat', url: '/chat', method: 'post', upload: false, swaggerDoc: '',
				x: 90, y: 110, wires: [['n2']],
			},
			{
				id: 'n2', type: 'function', name: 'Build messages',
				func:
					"const sessionId = (msg.req && msg.req.headers['x-session-id']) || 'default';\n" +
					"const history = flow.get('chat_' + sessionId) || [];\n" +
					"const userText = (msg.req && msg.req.body && msg.req.body.message) || '';\n" +
					'msg.sessionId = sessionId;\n' +
					'msg.userText = userText;\n' +
					'msg.payload = {\n' +
					"    model: 'llama3.2',\n" +
					"    messages: history.concat([{ role: 'user', content: userText }])\n" +
					'};\n' +
					'return msg;',
				outputs: 1, timeout: 0, noerr: 0, initialize: '', finalize: '', libs: [],
				x: 300, y: 110, wires: [['n3']],
			},
			{ id: 'n3', type: 'ollama-chat', name: 'Chat', server: 'srv1', x: 510, y: 110, wires: [['n4']] },
			{
				id: 'n4', type: 'function', name: 'Save history',
				func:
					'const reply = msg.payload.message;\n' +
					"const history = flow.get('chat_' + msg.sessionId) || [];\n" +
					"history.push({ role: 'user', content: msg.userText });\n" +
					'history.push(reply);\n' +
					"flow.set('chat_' + msg.sessionId, history);\n" +
					'msg.payload = { reply: reply.content };\n' +
					'return msg;',
				outputs: 1, timeout: 0, noerr: 0, initialize: '', finalize: '', libs: [],
				x: 720, y: 110, wires: [['n5']],
			},
			{ id: 'n5', type: 'http response', name: 'Reply', statusCode: '', headers: {}, x: 930, y: 110, wires: [] },
		],
	},
	{
		node: 'Generate',
		title: 'Ticket triage & escalation',
		description:
			'Incoming support tickets get a one-line prompt built from their body, a triage summary from Ollama, and get routed to Slack when the reply flags them urgent — everything else is just logged.',
		viewBox: '0 0 1250 260',
		flow: [
			{ id: 'srv2', type: 'ollama-config-server', name: 'Local Ollama', host: 'localhost', port: 11434, useCloud: false },
			{
				id: 'n1', type: 'http in', name: 'POST /tickets', url: '/tickets', method: 'post', upload: false, swaggerDoc: '',
				x: 90, y: 130, wires: [['n2', 'n8']],
			},
			{
				id: 'n8', type: 'function', name: 'Acknowledge',
				func: "msg.payload = { status: 'queued' };\nreturn msg;",
				outputs: 1, timeout: 0, noerr: 0, initialize: '', finalize: '', libs: [],
				x: 300, y: 210, wires: [['n9']],
			},
			{
				id: 'n9', type: 'http response', name: 'Accepted',
				statusCode: '202', headers: {}, x: 510, y: 210, wires: [],
			},
			{
				id: 'n2', type: 'function', name: 'Build prompt',
				func:
					'const ticket = (msg.req && msg.req.body) || {};\n' +
					"const subject = ticket.subject || '(no subject)';\n" +
					"const body = ticket.body || '';\n" +
					'msg.payload = {\n' +
					"    model: 'llama3.2',\n" +
					"    prompt: 'You triage support tickets. Reply with a one-sentence summary, and include the ' +\n" +
					"        'word URGENT if this needs immediate attention.\\n\\nSubject: ' + subject + '\\nBody: ' + body\n" +
					'};\n' +
					'return msg;',
				outputs: 1, timeout: 0, noerr: 0, initialize: '', finalize: '', libs: [],
				x: 300, y: 130, wires: [['n3']],
			},
			{ id: 'n3', type: 'ollama-generate', name: 'Generate', server: 'srv2', x: 510, y: 130, wires: [['n4']] },
			{
				id: 'n4', type: 'switch', name: 'Urgent?',
				property: 'payload.response', propertyType: 'msg',
				rules: [
					{ t: 'cont', v: 'URGENT', vt: 'str' },
					{ t: 'else' },
				],
				checkall: 'true', repair: false, outputs: 2,
				x: 720, y: 130, wires: [['n5'], ['n7']],
			},
			{
				id: 'n5', type: 'function', name: 'Format Slack message',
				func: "msg.payload = { text: '🚨 ' + msg.payload.response };\nreturn msg;",
				outputs: 1, timeout: 0, noerr: 0, initialize: '', finalize: '', libs: [],
				x: 930, y: 70, wires: [['n6']],
			},
			{
				id: 'n6', type: 'http request', name: 'Notify Slack',
				method: 'POST', ret: 'txt', paytoqs: 'ignore',
				url: 'https://hooks.slack.com/services/REPLACE/ME',
				tls: '', persist: false, proxy: '', insecureHTTPParser: false, authType: '', senderr: false, headers: [],
				x: 1140, y: 70, wires: [[]],
			},
			{
				id: 'n7', type: 'debug', name: 'Log ticket',
				active: true, tosidebar: true, console: false, tostatus: false,
				complete: 'payload', targetType: 'msg', statusVal: '', statusType: 'auto',
				x: 930, y: 195, wires: [],
			},
		],
	},
	{
		node: 'Embed',
		title: 'Index new documents for search',
		description:
			'Whenever a file lands in a watched folder, its contents are embedded and appended to a flat-file vector store, ready for semantic search later.',
		viewBox: '0 0 1250 190',
		flow: [
			{ id: 'srv3', type: 'ollama-config-server', name: 'Local Ollama', host: 'localhost', port: 11434, useCloud: false },
			{
				id: 'n1', type: 'inject', name: 'New file',
				props: [{ p: 'payload' }, { p: 'filename', v: '/tmp/example.txt', vt: 'str' }],
				repeat: '', crontab: '', once: false, onceDelay: 0.1, topic: '', payload: '', payloadType: 'date',
				x: 90, y: 110, wires: [['n2']],
			},
			{
				id: 'n2', type: 'file in', name: 'Read file',
				filename: 'filename', filenameType: 'msg', format: 'utf8', chunk: false, sendError: false, encoding: 'none', allProps: false,
				x: 300, y: 110, wires: [['n3']],
			},
			{
				id: 'n3', type: 'function', name: 'Build embed request',
				func: "msg.text = msg.payload;\nmsg.payload = { model: 'all-minilm', input: msg.payload };\nreturn msg;",
				outputs: 1, timeout: 0, noerr: 0, initialize: '', finalize: '', libs: [],
				x: 510, y: 110, wires: [['n4']],
			},
			{ id: 'n4', type: 'ollama-embed', name: 'Embed', server: 'srv3', x: 720, y: 110, wires: [['n5']] },
			{
				id: 'n5', type: 'function', name: 'Build vector record',
				func:
					'msg.payload = JSON.stringify({\n' +
					'    id: Date.now(),\n' +
					'    text: msg.text,\n' +
					'    embedding: msg.payload.embeddings[0]\n' +
					'});\n' +
					'return msg;',
				outputs: 1, timeout: 0, noerr: 0, initialize: '', finalize: '', libs: [],
				x: 930, y: 110, wires: [['n6']],
			},
			{
				id: 'n6', type: 'file', name: 'Append to store',
				filename: '/tmp/vector-store.jsonl', filenameType: 'str', appendNewline: true, createDir: true,
				overwriteFile: 'false', encoding: 'none',
				x: 1140, y: 110, wires: [],
			},
		],
	},
];
