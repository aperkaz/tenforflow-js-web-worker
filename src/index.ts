import * as media from "./media";
import * as comlink from "comlink";
import { canvasSize } from "./config";

document.body.innerHTML = `
<script>
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()
</script>
<img src="https://cdn.dribbble.com/users/634508/screenshots/5058273/theindcrediblerobot_dribbble.gif"></img>

<div id='main'>
  <video autoplay="true" id="video" src="" style="transform: scaleX(-1); display: none;"></video>
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
    api.update(comlink.transfer(bitmap, [bitmap as any]));
    requestAnimationFrame(mainloop);
  }
  mainloop();
  console.timeEnd("setup");
}

main();
