import express from "express";
import ytdl from "ytdl-core";
import yts from "yt-search";
import fs from "fs/promises";
import ffmpeg from "ffmpeg";
import { createWriteStream } from "fs";
import path from "path";
// import { Canvas, resolveImage } from "canvas-constructor/skia";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.set("view engine", "pug");

app.get("/", (req, res) => {
    return res.render("create");
});

app.get("/search", async (req, res) => {
    const {query} = req.query;

    const results = await yts(query);

    return res.json({results: results.all});
});

app.get("/download", async (req, res) => {
    try {
        // @ts-ignore
        const { url, mode }: {url: string, mode} = req.query;

        const date = Date.now();

        const tempName = `${date}.mp3`;

        console.time("Fetching");
        const audio = await ytdl(url, {filter: "audioonly"}).pipe(createWriteStream("./temp/" + tempName));
        const audioInfo = await ytdl.getInfo(url);
        console.timeEnd("Fetching");

        console.time("Audio");
        const editedAudio = await new ffmpeg("./temp/" + tempName);
        editedAudio.addCommand("-y", "");

        if(mode === "true") {
            editedAudio.addCommand("-af", "asetrate=44100*1.3");
        }else {
            editedAudio.addCommand("-af", "asetrate=44100*0.8");
        }

        editedAudio.setAudioBitRate(128);
        await editedAudio.save(`./temp/edited_${date}.mp3`);
        console.timeEnd("Audio");

        return res.download(path.join(__dirname, "temp/", `edited_${date}.mp3`), audioInfo.videoDetails.title + ` - ${mode === "true" ? "Sped up" : "Slowed"}.mp3`);
    }catch(err) {
        console.log(err);
    }
});
//
// app.post("/create", async (req, res) => {
//     const { url } = req.body;
//
//     const date = Date.now();
//
//     const tempName = `${date}.mp3`;
//
//     console.time("Fetching");
//     const audio = await ytdl(url, {filter: "audioonly"}).pipe(createWriteStream("./temp/" + tempName));
//     const audioInfo = await ytdl.getInfo(url);
//     console.timeEnd("Fetching");
//
//     console.time("Thumbnail");
//     const thumbnail = await createThumbnail({videoName: audioInfo.videoDetails.title});
//     console.timeEnd("Thumbnail");
//
//     await fs.writeFile(`./temp/${date}.png`, thumbnail);
//
//     // return;
//
//     console.time("Audio");
//     const editedAudio = await new ffmpeg("./temp/" + tempName);
//     editedAudio.addCommand("-y", "");
//     editedAudio.addCommand("-af", "asetrate=44100*1.3");
//     // editedAudio.addCommand("-af", "asetrate=44100*0.8");
//     editedAudio.setAudioBitRate(128);
//     await editedAudio.save(`./temp/edited_${date}.mp3`);
//     console.timeEnd("Audio");
//
//     return res.download(path.join(__dirname, "temp/", `edited_${date}.mp3`), audioInfo.videoDetails.title + " Nightcore.mp3");
//
//     // console.time("Video");
//     // const editedVideo = await new ffmpeg(`./temp/edited_${tempName}`);
//     // editedVideo.setVideoFormat("mp4");
//     // // editedVideo.setVideoCodec("nvenc_h264");
//     // // editedVideo.setVideoFrameRate(1);
//     // // editedVideo.setVideoBitRate(1024);
//     // // editedVideo.setVideoSize("1920x1080", true, true, "#FFFFFF");
//     // editedVideo.addCommand("-i", `./temp/${date}.png`);
//     // editedVideo.addCommand(" -i", `./temp/edited_${tempName}`);
//     // editedVideo.addCommand("-acodec", "copy");
//     // editedVideo.addCommand("-codec:v", "h264_qsv");
//     // // editedVideo.addCommand("-ar", "48000");
//     // // editedVideo.setAudioBitRate(128);
//     // // editedVideo.setAudioQuality(128);
//     // // editedVideo.setAudioFrequency(48);
//
//     // await editedVideo.save(`./temp/edited_${date}.mp4`);
//
//     // console.timeEnd("Video");
//
//     // return res.render("create");
// });

app.listen(5888);

//
// async function createThumbnail({videoName}: {videoName: string}) {
//     const wallpaper = await resolveImage("./assets/Wallpaper1.png");
//
//     const thumbnail = new Canvas(1920, 1080)
//         .printImage(wallpaper, 0, 0, 1920, 1080)
//         .setColor("#FFFFFF")
//         .setTextFont("80px Impact")
//         .setTextSize(80)
//         .setTextAlign("center")
//         .printText(videoName, 1920 / 2, 1080 / 2)
//         .toBuffer("png");
//
//     return thumbnail;
// }