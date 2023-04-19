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
        
        let fps = 10;
        let width = 200;
        await ffmpeg.run('-i', 'input.mp4', '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, '-loop', '0', 'output.gif');
        const outputData = ffmpeg.FS('readFile', 'output.gif');
        const outputBlob = new Blob([outputData.buffer], { type: 'image/gif' });
        const outputURL = URL.createObjectURL(outputBlob);

        const gifAni = document.getElementById("gif-ani");
        gifAni.addEventListener("loadedmetadata", function () {
        gifAni.src = outputURL;
        })
    });
});
