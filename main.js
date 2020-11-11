const axios = require("axios").default;
var candidates = [];

function inputMusicURL(buffer) {
    var url = String(buffer).trimEnd();
    var hash = url.match(/kugou.+hash=([0-9A-F]{32})/);
    if (hash) {
        axios.get("http://krcs.kugou.com/search?ver=1&man=yes&hash=" + hash[1]).then(res => {
            if (res.data.info == "OK" && res.data.candidates.length > 0) {
                res.data.candidates.forEach((v, i) => {
                    console.log(`${i}. ${v.song}\t${v.singer}\t${v.nickname}`);
                    process.stdin.on("data", selectLyric);
                });
            } else {
                console.log("获取歌词失败，请检查音乐是否有歌词");
            }
        });
    } else {
        console.log("请输入正确的连接");
    }
}

function selectLyric(buffer) {
    var input = String(buffer).trimEnd();
    var num = input.match(/(\d)/);
    if (num && num < candidates.length) {
        console.log("好");
        process.stdin.on("data", inputMusicURL);
    } else {
        console.log("请输入正确的数字");
    }
}

process.stdin.on("data", inputMusicURL);
