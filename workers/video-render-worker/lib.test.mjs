import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildStorageObjectPath,
  collectOutputFiles,
  comfyJobState,
  inspectOutputFile,
  resolveOutputPath,
} from "./lib.mjs";

describe("video render worker utilities", () => {
  it("collects only supported video output descriptors", () => {
    const outputs = collectOutputFiles({
      "19": {
        videos: [
          { filename: "render.mp4", subfolder: "daily", type: "output" },
          { filename: "preview.png", subfolder: "daily", type: "output" },
        ],
      },
    });
    expect(outputs).toEqual([
      {
        fileName: "render.mp4",
        subfolder: "daily",
        outputType: "output",
        mimeType: "video/mp4",
      },
    ]);
  });

  it("blocks output paths that escape the configured directory", () => {
    expect(() =>
      resolveOutputPath("/safe/output", {
        fileName: "secret.mp4",
        subfolder: "../../etc",
      }),
    ).toThrow("OUTPUT_PATH_ESCAPE_BLOCKED");
  });

  it("hashes and inspects an output file", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "gem-video-worker-"));
    await mkdir(path.join(root, "daily"));
    await writeFile(path.join(root, "daily", "render.mp4"), "video-bytes");

    const inspected = await inspectOutputFile(root, {
      fileName: "render.mp4",
      subfolder: "daily",
      outputType: "output",
      mimeType: "video/mp4",
    });
    expect(inspected.fileSize).toBe(11);
    expect(inspected.checksumSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("preserves ComfyUI execution failures", () => {
    const result = comfyJobState(
      {
        "prompt-1": {
          status: {
            status_str: "error",
            messages: [
              [
                "execution_error",
                {
                  exception_type: "OOMError",
                  exception_message: "GPU memory exhausted",
                },
              ],
            ],
          },
          outputs: {},
        },
      },
      "prompt-1",
      { queue_running: [], queue_pending: [] },
    );
    expect(result).toMatchObject({
      state: "FAILED",
      errorCode: "OOMError",
      errorMessage: "GPU memory exhausted",
    });
  });

  it("recognizes completed outputs and stable storage paths", () => {
    const result = comfyJobState(
      {
        "prompt-2": {
          status: { status_str: "success", completed: true },
          outputs: { "19": { videos: [{ filename: "render.mp4" }] } },
        },
      },
      "prompt-2",
      { queue_running: [], queue_pending: [] },
    );
    expect(result.state).toBe("COMPLETED");
    expect(
      buildStorageObjectPath(
        {
          workspaceId: "workspace/one",
          contentId: "content one",
          renderJobId: "render-1",
        },
        "GEM final.mp4",
      ),
    ).toBe("workspace-one/content-one/render-1/GEM-final.mp4");
  });
});
