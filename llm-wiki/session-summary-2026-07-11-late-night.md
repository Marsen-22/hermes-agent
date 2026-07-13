# Session Summary — 2026-07-11 (Late Night)

## llama.cpp RPC Cluster — 4-Node Build + Verification

### Problem

The cluster had 3 Windows nodes (RTX 5090 + RTX 4090 + RTX 3090 = 80GB VRAM) running old llama.cpp RPC servers that were incompatible with the Mac's llama.cpp version. The Mac had no RPC-enabled llama-server build. 80GB of GPU VRAM sat idle.

### Solution

Built llama.cpp with RPC support on the Mac, updated all 3 Windows nodes to the same commit, and verified 4-node RPC split inference.

### 1. Mac Build (arm64, RPC + Metal)

- Cloned llama.cpp to `~/Desktop/llama.cpp` (commit c92e806)
- Built with `-DGGML_RPC=ON -DGGML_METAL=ON -DLLAMA_OPENSSL=OFF`
- OpenSSL disabled (homebrew arm64 vs system x86_64 conflict)
- Produced `build/bin/llama-server` (with `--rpc` flag) and `build/bin/ggml-rpc-server`
- Started Mac rpc-server on `0.0.0.0:50052`

### 2. Node4 Build (CUDA, fresh)

- Node4 had llama.cpp source at `C:\Users\juns6\Desktop\llama.cpp` (old commit a3900a6)
- `git pull` updated to c92e806 (matching Mac)
- Clean build: `cmake -B build -DGGML_RPC=ON -DGGML_CUDA=ON -DCMAKE_BUILD_TYPE=Release -DLLAMA_OPENSSL=OFF`
- Binary: `build\bin\Release\ggml-rpc-server.exe` + 5 DLLs

### 3. Nodes 2 + 3 (Binary Distribution)

- Node2 (RTX 5090): No Visual Studio Build Tools — can't compile
- Node3 (RTX 4090): No git installed
- Solution: Copied node4's binaries (exe + 5 DLLs) via Mac as intermediary
- Cleaned `C:\tmp\` on both nodes (removed all old DLLs from July 3 build)
- Copied 6 files: `ggml-rpc-server.exe`, `ggml-base.dll`, `ggml-cpu.dll`, `ggml-cuda.dll`, `ggml-rpc.dll`, `ggml.dll`
- Started rpc-server from `C:\tmp\` working directory

### 4. Verification

| Test | RPC Nodes | Result |
|------|-----------|--------|
| Mac only (no RPC) | none | ✅ baseline |
| Mac + Node4 | 192.168.50.104 | ✅ "Got it! How can" |
| Mac + Node3 | 192.168.50.103 | ✅ "Got it! How can" |
| Mac + Node2 | 192.168.50.102 | ✅ "Got it! How can" (178 tok/s — RTX 5090 fast!) |
| Mac + All 3 | all three | ✅ "Got it! How can" |

### Key details

| Node | IP | GPU | VRAM | RPC Port | Binary Source |
|------|-----|-----|------|----------|---------------|
| Mac | 192.168.50.101 | M4 Max | 128GB | 50052 | Fresh build (arm64, Metal) |
| Node2 | 192.168.50.102 | RTX 5090 | 32GB | 50052 | Copied from node4 |
| Node3 | 192.168.50.103 | RTX 4090 | 24GB | 50052 | Copied from node4 |
| Node4 | 192.168.50.104 | RTX 3090 | 24GB | 50052 | Fresh build (CUDA) |

**Total pooled VRAM: 208GB**

### Files

| Path | Description |
|------|-------------|
| `~/Desktop/llama.cpp/` | Mac llama.cpp source (commit c92e806) |
| `~/Desktop/llama.cpp/build/bin/llama-server` | Mac RPC-enabled inference server |
| `~/Desktop/llama.cpp/build/bin/ggml-rpc-server` | Mac RPC backend server |
| `C:\Users\juns6\Desktop\llama.cpp\` (node4) | Node4 llama.cpp source + build |
| `C:\tmp\` (nodes 2+3) | rpc-server binaries (6 files) |
| `/tmp/rpc-dist/` (Mac) | Distribution staging (exe + 5 DLLs) |

### Pitfalls Encountered

1. **OpenSSL linking on Mac** — homebrew openssl is arm64 but system openssl at `/usr/local/lib` is x86_64. Fix: `-DLLAMA_OPENSSL=OFF`
2. **Version mismatch** — Windows nodes were on commit a3900a6, Mac on c92e806. RPC protocol is version-sensitive. Fix: git pull on all nodes.
3. **Mixed DLLs** — old July 3 DLLs in `C:\tmp\` conflicted with new ones. Fix: delete all DLLs, copy only the 6 new files.
4. **No VS Build Tools on node2** — can't compile C++ on node2. Fix: copy binaries from node4.
5. **No git on node3** — can't clone llama.cpp. Fix: tar source from Mac, scp to node3.
6. **SSH + PowerShell escaping** — `$` in PowerShell variables gets eaten by SSH. Fix: use `.bat` files instead of inline PowerShell.
7. **Process lifecycle** — `start /b` through SSH doesn't detach properly. Fix: run `cmd /c` directly (blocks SSH but process stays alive).

### Next Steps

- Wire port 8092 into LiteLLM as a second backend for load-balancing/failover
- Test with a large model (e.g., 70B+ GGUF) that needs pooled VRAM
- Create startup scripts/services for rpc-servers on all nodes (survive reboots)
- Node2 needs Visual Studio Build Tools if we want to build natively (for CUDA compute capability 12.0 optimizations)