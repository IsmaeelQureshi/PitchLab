#!/bin/zsh
cd -- "${0:A:h}" || exit 1

if command -v node >/dev/null 2>&1; then
  pitchlab_node="$(command -v node)"
elif [[ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]]; then
  pitchlab_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
else
  print 'PitchLab requires Node.js 20 or later. Install Node.js, then run this launcher again.'
  read 'reply?Press Enter to close.'
  exit 1
fi

print 'Open http://127.0.0.1:4173 in your browser.'
print 'Keep this window open while using PitchLab. Press Control+C to stop.'
"$pitchlab_node" server.mjs
if [[ $? -ne 0 ]]; then
  read 'reply?PitchLab could not start. Check the error above. Press Enter to close.'
fi
