import * as comlink from "comlink";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

import {  canvasSize } from "./config";

let net: cocoSsd.ObjectDetection | null = null;
let ctx: CanvasRenderingContext2D | null = null;

// image buffer
const imageBufferCanvas = new OffscreenCanvas(canvasSize, canvasSize);
const imageBufferContext = (imageBufferCanvas.getContext(
  "2d"
) as any) as CanvasRenderingContext2D;

console.time("[worker] start");

comlink.expose({
  async init(canvas: OffscreenCanvas) {
    console.time("[worker] load-model");
    net = await cocoSsd.load();
    console.timeEnd("[worker] load-model");
    ctx = canvas.getContext("2d") as any;
    console.time("[worker] ready");
  },
  async update(bitmap: ImageBitmap) {
    if (net != null && ctx) {
      imageBufferContext.drawImage(bitmap, 0, 0);
      
      const t0= performance.now()
      const data = await net.detect(imageBufferCanvas as any);
      console.log('classification: ',performance.now()-t0)
      console.log(data)
    }
  }
});
