# ComfyUI — Local Image Generation Stack

Local image generation running on Mac M4 Max (MPS backend) with ComfyUI, Z-Image-Turbo, and supporting models.

## Runtime

| Component | Value |
|-----------|-------|
| ComfyUI path | `~/Desktop/comfyui/` |
| ComfyUI version | `0.27.0` |
| Python | `3.11.15` via `/opt/homebrew/bin/python3.11` venv |
| PyTorch | `2.13.0` |
| Backend | MPS (Apple Silicon) |
| VRAM free | ~127 GB unified |
| Web UI | http://127.0.0.1:8188 |
| Listen | `0.0.0.0:8188` |

Old Python 3.14 venv backed up to `venv-3.14-backup/`. Python 3.14 broke `pydantic-core`, `comfy-cli`, and some custom-node deps.

## Installed Custom Nodes

- `ComfyUI-Manager`
- `ComfyUI-Impact-Pack`
- `ComfyUI-Advanced-ControlNet`
- `ComfyUI_essentials`
- `ComfyUI-AnimateDiff-Evolved`
- `ComfyUI_IPAdapter_plus`
- `was-node-suite-comfyui`
- `rgthree-comfy`
- `ComfyUI-KJNodes`

Total node types available: ~1,518.

## Models

| Model | Type | Size | Location | Source |
|-------|------|------|----------|--------|
| `z_image_turbo_bf16.safetensors` | Diffusion (checkpoint) | 11 GB | `models/checkpoints/` | symlink from `~/Desktop/ModelWeights/diffusion/` |
| `LTX-2.3-22B-distilled-1.1-Q4_K_M.gguf` | Video diffusion (GGUF) | 17 GB | `models/unet/` | symlink from `~/Desktop/ModelWeights/diffusion/` |
| `qwen_3_4b.safetensors` | Text encoder (2560-dim) | 7.5 GB | `models/clip/` | Comfy-Org/z_image_turbo |
| `qwen_3_4b_fp8_mixed.safetensors` | Text encoder (smaller) | 5.2 GB | `models/clip/` | Comfy-Org/z_image_turbo |
| `z_image_vae.safetensors` | VAE (for z_image) | 320 MB | `models/vae/` | Comfy-Org/z_image_turbo |
| `sdxl_vae.safetensors` | VAE (backup) | 319 MB | `models/vae/` | stabilityai/sdxl-vae |
| `CLIP-G_fp32_2.78GB.safetensors` | CLIP vision | 2.8 GB | `models/clip_vision/` | symlink from `~/Desktop/ModelWeights/clip/` |

## How Z-Image-Turbo Loads

`z_image_turbo_bf16` is a Lumina2-architecture diffusion model. It does **not** include a text encoder or VAE.

Required pipeline:
- `CheckpointLoaderSimple` loads the diffusion model (outputs `MODEL` only).
- `CLIPLoader` with `type: lumina2` loads `qwen_3_4b.safetensors` (Qwen3-4B, 2560-dim output).
- `TextEncodeZImageOmni` encodes prompts using the Qwen3 CLIP.
- `VAELoader` loads `z_image_vae.safetensors`.
- `KSampler` + `VAEDecode` + `SaveImage`.

Using CLIP-G fails because it outputs 1280-dim embeddings while `cap_embedder` expects 2560-dim.

## Saved Workflows

All in `~/Desktop/comfyui/user/default/workflows/`:

| Workflow | Description | Status |
|----------|-------------|--------|
| `z_turbo_txt2img.json` | Generic landscape prompt | ✅ verified |
| `mai_shibuya.json` | Mai Shiranui cosplayer at Shibuya crossing | ✅ verified |
| `asurada_eau_rouge.json` | Asurada at Eau Rouge, Spa | ✅ verified |
| `ltxv_mai_shibuya.json` | LTX video text-to-video (Mai Shiranui at Shibuya) | ✅ verified |
| `ltxv_text2video.json` | LTX video text-to-video (draft) | ✅ verified |

## Commands

Start:
```bash
cd ~/Desktop/comfyui
./venv/bin/python main.py --listen 0.0.0.0 --port 8188
```

Install custom node via comfy-cli:
```bash
./venv/bin/comfy --workspace ~/Desktop/comfyui node install <node-name>
```

List installed models:
```bash
curl -s http://127.0.0.1:8188/models/checkpoints | python3 -m json.tool
curl -s http://127.0.0.1:8188/models/clip | python3 -m json.tool
curl -s http://127.0.0.1:8188/models/vae | python3 -m json.tool
```

## Notes

- Default generation: 1280×1280, 4 steps, euler sampler, cfg=1.0.
- Larger resolutions possible; 1536×1536 or 2048×2048 may need more VRAM.
- LTX video workflow is drafted but missing the LTX VAE. Download from `Comfy-Org/LTX-Video` VAE if needed.
- Triton and AnimateDiff motion-model warnings are cosmetic on macOS.

## Remaining Items

- [ ] Download LTX VAE and verify `ltxv_text2video.json`.
- [ ] Add upscale node workflow (4x-UltraSharp / ESRGAN) if high-res output is needed.
- [ ] Optionally download IP-Adapter face model for consistent character generation.
