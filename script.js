'use strict'
// 1行目に記載している 'use strict' は削除しないでください

const inputVideo = document.getElementById("input-video");

inputVideo.addEventListener("change", function () {
    const file = inputVideo.files[0];
    console.log(file)
    // const video = document.createElement('video');
    const video = document.getElementById("video");
    video.src = URL.createObjectURL(file);
    video.controls = true;
    document.body.appendChild(video);

    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });

    video.addEventListener('loadedmetadata', async function () {
        await ffmpeg.load();
        ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(await file.arrayBuffer()));
        ffmpeg.FS('unmount');
        await ffmpeg.run('-i', 'input.mp4', '-ss', '00:00:05', '-t', '00:00:10', '-c', 'copy', 'output.mp4');
        const outputData = ffmpeg.FS('readFile', 'output.mp4');
        const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
        const outputURL = URL.createObjectURL(outputBlob);
        video.src = outputURL;
    });
});
