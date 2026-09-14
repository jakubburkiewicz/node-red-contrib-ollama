# Code notes for this repo

Node-RED plugin wrapping the `ollama` JS client library as configurable nodes. Each node type is declared in `package.json` (`node-red.nodes`) as an `.html` + `.js` pair under `nodes/`.

## Node categories

- **Config nodes** (no direct output, referenced by action nodes via `config.server`/etc.): `ollama-config-server` (host/port, or Ollama Cloud + API key credential), `ollama-config-options`, `ollama-config-format`, `ollama-config-tools`.
- **Action nodes** (12): `ollama-chat`, `ollama-generate`, `ollama-embed`, `ollama-list`, `ollama-show`, `ollama-ps`, `ollama-pull`, `ollama-push`, `ollama-create`, `ollama-copy`, `ollama-delete`, `ollama-abort` — each wraps one `ollama.js` client method.

## Shared patterns (present in every action node — keep them in sync when touching one)

- **Host resolution**: with a local server configured, `msg.payload.host` may override the configured host. With Ollama Cloud (`server.useCloud`), the configured host is always used and `msg.payload.host` is **never** allowed to override it — an override would let the configured API key leak to an arbitrary host. See `ollama-chat.js` for the canonical implementation.
- **Param resolution**: `model` and other per-call params read from `msg.payload.<field>` first, falling back to the node's own config value — respecting the field's configured type (`str` literal vs `msg` property lookup).
- **Streaming** (`stream: true`): the node consumes the response with `for await` and emits one cloned `msg` per chunk on `payload` — never pass a raw `AbortableAsyncIterator` out to `msg.payload`.

## Style

- 4-space indentation, a space inside parens in declarations/conditions (`function( RED )`, `if( config.model )`) — match this in new code, even though it's an unusual style choice.
