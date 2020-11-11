const axios = require("axios").default;
var candidates = [];
var inputHandler = inputMusicURL;

function inputMusicURL(input) {
    var hash = input.match(/kugou.+hash=([0-9A-F]{32})/);
    if (hash) {
        axios.get("http://krcs.kugou.com/search?ver=1&man=yes&hash=" + hash[1]).then(res => {
            if (res.data.info == "OK" && res.data.candidates.length > 0) {
                candidates = res.data.candidates;
                candidates.forEach((v, i) => console.log(`${i}. ${v.song}\t${v.singer}\t${v.nickname}`));
                inputHandler = selectLyric;
            } else {
                console.log("获取歌词失败，请检查音乐是否有歌词");
            }
        });
    } else {
        console.log("请输入正确的连接");
    }
}

function selectLyric(input) {
    var num = input.match(/(\d)/);
    if (num && num[1] < candidates.length) {
        var item = candidates[Number(num[1])];
        axios.get("http://lyrics.kugou.com/download?ver=1&client=pc&id=" + item.id + "&accesskey=" + item.accesskey + "&fmt=krc&charset=utf8").then(res => {
            console.log(res.data);
        });
        inputHandler = inputMusicURL;
    } else {
        console.log("请输入正确的数字");
    }
}

process.stdin.on("data", (buffer) => {
    inputHandler(String(buffer));
});
