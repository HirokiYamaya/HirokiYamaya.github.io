'use strict'

// ファイル選択ボタンの要素
const inputVideo = document.getElementById("input-video");

// ファイルドロップエリアの要素
const dropVideo = document.getElementById("drop-area");

// 読み込んだ動画を表示するエリアの要素
const video = document.getElementById("video");

//キャプチャー用モーダル
const modal = document.getElementById("easyModal");

// playボタンの動作
const playButton = document.getElementById("play-button");

// resetボタンの動作
const resetButton = document.getElementById("reset-button");

// トリミングスライダーの動作
const range = document.getElementById("range");

// 再生速度の反映
const speedRate = document.querySelectorAll("input[name=speed]");

// 出力イメージ図形
const square = document.getElementById("preview");

// モーダルクローズ
const buttonClose = document.getElementById("modalClose");

// gif変換開始ボタン
const create = document.getElementById("create-button");

// gif出力イメージ
const gifImage = document.getElementById("gif-image");

// gifダウンロードボタン
const download = document.getElementById("download-button");

// キャプチャー
const videoElem = document.getElementById("video-cap");
const startElem = document.getElementById("cap-start");

// 再生最小時間（トリミングに反映）
let minTime = 0;

// 再生最大時間（トリミングに反映）
let maxTime = 30;

// GIF出力FPS
let outputFps = document.getElementById("fps");

// GIF出力画像幅
let outputWidth = document.getElementById("image-width");

// アスペクト比
let aspectRatio = 16 / 9;

// アスペクト比計算
function gcd(x, y) {
  if (y === 0) return x
  return gcd(y, x % y)
}

// videoタグにアドレスを代入
function readVideo(file) {
  video.src = URL.createObjectURL(file);
  video.controls = false;
  // console.log(video.durrentTime, video.duration)
}

// videoのプロパティを取得
function getVideoProperty() {
  minTime = video.currentTime;
  maxTime = video.duration;
  const w = video.videoWidth;
  const h = video.videoHeight
  const g = gcd(w, h);
  square.style.width = `${w}px`;
  square.style.aspectRatio = (w / g) / (h / g);
  outputWidth.value = w;
}

// ドラッグオーバー時の処理
dropVideo.addEventListener("dragover", function (event) {
  event.preventDefault();
});

// ドラッグアウト時の処理
dropVideo.addEventListener("dragleave", function (event) {
  event.preventDefault();
});

// ドロップした時の処理
dropVideo.addEventListener("drop", function (event) {
  event.preventDefault();
  // // ドロップしたファイルをinputVideo要素に代入
  inputVideo.files = event.dataTransfer.files;
  readVideo(inputVideo.files[0]);
});

let fileData = "";

// ファイルを選択ボタンからの処理
inputVideo.addEventListener("change", function () {
  readVideo(inputVideo.files[0]);
  video.addEventListener("loadedmetadata", async function () {
    getVideoProperty()
    fileData = new Uint8Array(await file.arrayBuffer())

    //   await ffmpeg.load();
    //   ffmpeg.FS("writeFile", "input.mp4", new Uint8Array(await file.arrayBuffer()));
    //   await ffmpeg.run("-i", "input.mp4", "-vf", `fps=${outputFps},scale=${outputWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, "-loop", "0", "output.gif");
    //   const outputData = ffmpeg.FS("readFile", "output.gif");
    //   const outputBlob = new Blob([outputData.buffer], { type: "image/gif" });
    //   const outputURL = URL.createObjectURL(outputBlob);
    //   const gifAni = document.createElement("img");
    //   gifAni.src = outputURL
    //   document.body.appendChild(gifAni)
    // });
  });
});

// 再生ボタン押したときの処理
playButton.addEventListener("click", function () {
  if (video.paused) {
    video.play();
    playButton.innerText = "||";
  } else {
    video.pause();
    playButton.innerText = "▶";
  }
})

// リセットボタン押したときの処理
resetButton.addEventListener("click", function () {
  video.pause();
  playButton.innerText = "▶";
  video.currentTime = minTime;
})

// トリミングスライダー初期設定
noUiSlider.create(range, {
  range: {
    "min": minTime,
    "max": maxTime
  },
  step: 0.5,
  start: [minTime, maxTime],
  connect: true,
  behaviour: "tap-drag",
  tooltips: true,
  pips: {
    mode: "steps",
    stepped: true,
    density: 10
  }
});

// 再生開始秒の反映
range.noUiSlider.on("update", function (values, handle) {
  video.currentTime = Math.trunc(values[0]);
  minTime = Math.trunc(values[0]);
  maxTime = Math.trunc(values[1]);
})

// 再生終了秒の反映
video.addEventListener("timeupdate", function () {
  const currentTime = video.currentTime;
  if (currentTime >= maxTime) {
    video.pause();
  }
});

// 再生スピードの取得
for (let rate of speedRate) {
  rate.addEventListener("change", function () {
    video.playbackRate = Number(rate.value) / 100;
  });
}

// 出力幅イメージを表示
outputWidth.addEventListener("change", function () {
  square.style.width = `${outputWidth.value}px`;
})

// Gifに変換
create.addEventListener("click", async function (event) {
  square.style.visibility = "hidden";
  getVideoProperty()

  const speed = 1;
  const fade = true;
  // minTime
  // maxTime

  // FFmpegのインポート
  const { createFFmpeg, fetchFile } = FFmpeg;
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

//   const fileData = await fetch(video.src).then((response) => response.arrayBuffer());
//   ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(fileData));
  ffmpeg.FS('writeFile', 'input.mp4', fileData);
  await ffmpeg.run("-i", "input.mp4", "-vf", `fps=${outputFps},scale=${outputWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, "-loop", "0", "output.gif");
  const outputData = ffmpeg.FS("readFile", "output.gif");
  const outputBlob = new Blob([outputData.buffer], { type: "image/gif" });
  const outputURL = URL.createObjectURL(outputBlob);
  gifImage.src = outputURL

  // gifImage.src = "test.gif"

})

// ダウンロード
download.addEventListener("click", function clickDl() {
  download.href = gifImage.src;
  gifImage.download = "output.gif";
});

startElem.addEventListener("click", function (evt) {
  startCapture();
}, false);

async function startCapture() {
  modal.style.display = "flex";

  try {
    videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: false });
  } catch (err) {
    console.error("Error: " + err);
  }

  function startRecording() {
    let rec = new MediaRecorder(videoElem.srcObject, { mimeType: "video/webm; codecs=vp9" });
    const chunks = [];

    rec.ondataavailable = e => chunks.push(e.data);
    rec.start();
    // 共有停止したらキャプチャー処理の停止 
    rec.onstop = async () => {
      modal.style.display = "none";
      const webm = new Blob(chunks, { "type": "video/webm" });
      readVideo(webm)
      videoElem.srcObject = null;
      getVideoProperty()
    }
  };
  startRecording()

}

// バツ印がクリックされた時
buttonClose.addEventListener('click', () => modal.style.display = 'none');
