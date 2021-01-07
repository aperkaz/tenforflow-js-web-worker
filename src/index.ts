import * as media from "./media";
import * as comlink from "comlink";
import { canvasSize } from "./config";

document.body.innerHTML = `
<div id='main'>
  <h1 id="classification-classes">Detected object will be named here</h1>  
  <video autoplay="true" id="video" src="" ></video>
  <canvas id="output" />
</div>`;

console.log("start", performance.now());
console.time("setup");

const offscreen = new OffscreenCanvas(canvasSize, canvasSize);
const offCtx = offscreen.getContext("2d") as any;

export async function main() {
  // setup video
  const video = await media.loadVideo("cameraId");

  // create offscreen context
  const canvas = document.getElementById("output") as HTMLCanvasElement;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const offscreenCanvas = canvas.transferControlToOffscreen();

  // setup comlink
  console.time("[main] worker setup");
  const worker = new Worker("./classificationWorker.ts", { type: "module" });
  const api: any = await comlink.wrap(worker);
  await api.init(comlink.transfer(offscreenCanvas, [offscreenCanvas as any]));
  console.timeEnd("[main] worker setup");

  async function mainloop() {
    offCtx.drawImage(video, 0, 0);
    const bitmap = offscreen.transferToImageBitmap();
    const data = await api.update(comlink.transfer(bitmap, [bitmap as any]));

    const el = document.getElementById("classification-classes");

    if (el && el.textContent) {
      el.innerHTML = data.length > 0 ? data[0].class : "Nothing found";
    }

    await new Promise((r) => setTimeout(r, 500));

    requestAnimationFrame(mainloop);
  }
  mainloop();
  console.timeEnd("setup");
}

main();
