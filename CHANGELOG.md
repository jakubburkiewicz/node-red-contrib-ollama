# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.6.2] - 2026-09-15

### Fixed

- Added `ollama-ps` and `ollama-abort` to the bundled example flow (`examples/Example.json`) — they were the only two action nodes not demonstrated in any example, which the Node-RED flow library scorecard flags as missing example coverage.

## [0.6.1] - 2026-09-13

### Fixed

- `ollama-create` node configuration fields (model, from, quantize, template, license, system, parameters, messages, adapters) were never actually used — only `msg.payload` overrides worked. Switched to `RED.util.evaluateNodeProperty` and fixed the node's `typedInput` setup. Also removed dead `this.editor` references that threw on every save/cancel, made `parameters` a proper JSON field, and made `quantize` optional ([#32](https://github.com/jakubburkiewicz/node-red-contrib-ollama/pull/32), thanks @gorenje).

## [0.6.0] - 2026-09-13

### Added

- `ollama-chat`, `ollama-generate`, `ollama-pull` and `ollama-push` now emit one output message per streamed chunk when `stream` is `true`, instead of a single message with an unusable raw iterator as `payload` ([#17](https://github.com/jakubburkiewicz/node-red-contrib-ollama/issues/17)). Non-streaming behavior (the default) is unchanged.

## [0.5.5] - 2026-09-13

### Fixed

- The "Embeddings" node in the example flow using a stale node type (`ollama-embeddings` instead of `ollama-embed`) and a payload shaped for `ollama-generate` instead of `ollama-embed` ([#18](https://github.com/jakubburkiewicz/node-red-contrib-ollama/issues/18)).

## [0.5.4] - 2026-09-13

### Fixed

- `msg.payload.host` being silently ignored on all nodes when the node's Server field is set to "none", instead of being used to reach the Ollama instance directly ([#28](https://github.com/jakubburkiewicz/node-red-contrib-ollama/issues/28), [#20](https://github.com/jakubburkiewicz/node-red-contrib-ollama/issues/20)).

## [0.5.3] - 2026-09-13

### Fixed

- `msg.payload.tools` being ignored by the `ollama-chat` node ([#29](https://github.com/jakubburkiewicz/node-red-contrib-ollama/issues/29)) and the same operator-precedence bug affecting `msg.payload.options` in `ollama-chat`, `ollama-generate`, `ollama-embed` and `ollama-show`.

## [0.5.2] - 2026-09-13

### Fixed

- `ollama-embed` node ignoring the "Truncate" setting due to a config property name typo.
- All nodes emitting an output message with an empty payload after a failed Ollama call, instead of only reporting the error.

## [0.5.1] - 2026-09-13

### Fixed

- `ollama-abort` node crashing the Node-RED process due to incorrect handling of the synchronous `abort()` call.
