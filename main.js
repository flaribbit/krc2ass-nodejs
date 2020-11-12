const zlib = require("zlib");
const fs = require("fs");
const { totalmem } = require("os");
const axios = require("axios").default;
const key = [0x40, 0x47, 0x61, 0x77, 0x5E, 0x32, 0x74, 0x47, 0x51, 0x36, 0x31, 0x2D, 0xCE, 0xD2, 0x6E, 0x69];
const round = Math.round;
var candidates = [];
var inputHandler = inputMusicURL;
process.stdin.on("data", buffer => inputHandler(String(buffer)));

function inputMusicURL(input) {
    var hash = input.match(/kugou.+hash=([0-9A-F]{32})/);
    if (hash) {
        axios.get(`http://krcs.kugou.com/search?ver=1&man=yes&hash=${hash[1]}`).then(res => {
            if (res.data.info == "OK" && res.data.candidates.length > 0) {
                candidates = res.data.candidates;
                candidates.forEach((v, i) => console.log(`${i}. ${v.song}\t${v.singer}\t${v.nickname}`));
                inputHandler = selectLyric;
                console.log("请输入选项前数字");
            } else {
                console.log("获取歌词失败，请检查音乐是否有歌词");
            }
        });
    } else {
        console.log("请输入正确的歌曲链接");
    }
}

function selectLyric(input) {
    var num = input.match(/(\d)/);
    if (num && num[1] < candidates.length) {
        var item = candidates[Number(num[1])];
        axios.get(`http://lyrics.kugou.com/download?ver=1&client=pc&id=${item.id}&accesskey=${item.accesskey}&fmt=krc&charset=utf8`).then(res => {
            var data = Buffer.from(res.data.content, "base64").slice(4);
            for (var i = 0; i < data.length; i++) {
                data[i] ^= key[i % 16];
            }
            var decom = String(zlib.unzipSync(data)).split("\r\n");
            var result = "";
            decom.forEach(line => {
                var lineTime = line.match(/\[(\d+),(\d+)\]/);
                if (lineTime) {
                    var regsyl = /<(\d+),(\d+),0>([^<]+)/g;
                    var syl;
                    result += `Dialogue: 0,${toTime(Number(lineTime[1]))},${toTime(Number(lineTime[1]) + Number(lineTime[2]))},Default,,0,0,0,,`;
                    while (syl = regsyl.exec(line)) {
                        result += `${syl[3]}{\\k${round(syl[2] / 10)}}`;
                    }
                    result += "\n";
                }
            });
            console.log(result);
        });
        inputHandler = inputMusicURL;
    } else {
        console.log("请输入正确的数字");
    }
}

function toTime(ms) {
    var d = String((ms / 10 % 100) << 0);
    var s = String((ms / 1000 % 60) << 0);
    var m = String((ms / 60000) << 0);
    if (d.length < 2) d = "0" + d;
    if (s.length < 2) s = "0" + s;
    if (m.length < 2) m = "0" + m;
    return m + ":" + s + "." + d
}
