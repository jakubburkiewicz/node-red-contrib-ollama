# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
