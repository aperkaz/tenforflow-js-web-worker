let currentStream: any | null = null;
const maxVideoSize = 513;

export function loadVideo(cameraId: any): Promise<HTMLVideoElement> {
  const video = document.getElementById("video") as HTMLVideoElement;

  video.width = maxVideoSize;
  video.height = maxVideoSize;

  return new Promise((resolve, reject) => {
    navigator.getUserMedia(
      {
        video: {
          width: maxVideoSize,
          height: maxVideoSize,
        }
      },
      stream => {
        currentStream = stream;
        video.srcObject = stream;
        resolve(video);
      },
      err => reject(err)
    );
  });
}
