import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { test } from "node:test";
import { maxAvatarSize } from "../config";
import { avatarUpload, parseAvatarUpload } from "./upload";

test("continues when a multipart request has no avatar", async () => {
  await withUploadEndpoint(async (url) => {
    const form = new FormData();
    form.append("username", "example");
    form.append("avatarFileId", "untrusted-client-value");

    const response = await fetch(url, { method: "POST", body: form });
    const result = (await response.json()) as {
      hasFile: boolean;
      body: Record<string, string>;
    };

    assert.equal(response.status, 200);
    assert.equal(result.hasFile, false);
    assert.equal("avatarFileId" in result.body, false);
  });
});

test("returns 413 when the uploaded file exceeds the byte limit", async () => {
  await withUploadEndpoint(async (url) => {
    const form = new FormData();
    form.append(
      "avatar",
      new Blob([Buffer.alloc(maxAvatarSize + 1)], { type: "image/png" }),
      "avatar.png",
    );

    const response = await fetch(url, { method: "POST", body: form });

    assert.equal(response.status, 413);
  });
});

async function withUploadEndpoint(
  callback: (url: string) => Promise<void>,
): Promise<void> {
  const app = express();
  app.post("/", parseAvatarUpload, avatarUpload, (req, res) => {
    return res
      .status(200)
      .json({ hasFile: Boolean(req.file), body: req.body });
  });

  const server = createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address() as AddressInfo;
  try {
    await callback(`http://127.0.0.1:${address.port}/`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}
