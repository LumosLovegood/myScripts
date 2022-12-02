const headers = {
    'authority': 'www.bilibili.com',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7'
}

async function bilibili(QuickAdd){
    const url = await QuickAdd.quickAddApi.inputPrompt(
        "输入Bilibili视频网址："
    );
    let urlTest = url?.match(/https?:\/\/(?:(?:www|m)\.bilibili\.com\/video\/\S*\??|b23\.tv\/\S*)/gm);
    if (url.length==0 || urlTest.length==0){
        new Notice("网址格式错误");
        throw new Error("网址格式错误");
    }
    let biliInfo = await getBiliInfo(url)
    if(!biliInfo){
        new Notice("获取内容失败");
        throw new Error("获取内容失败");
    }
    new Notice(biliInfo.title+"笔记已生成！",500);
    console.log(biliInfo);
    QuickAdd.variables = {
        ...biliInfo
    };
}

async function getBiliInfo(url){
    let searchUrl = new URL(url);
    const res = await request({
      url: searchUrl.href,
      method: "GET",
      cache: "no-cache",
      headers:headers
    });
    if(!res){
        return null;
    }
    let p = new DOMParser();
    let doc = p.parseFromString(res, "text/html");
    let $ = s => doc.querySelector(s);

    let mainUrl = url.match(/^.+[\?$]/g)
    let parts = "";;
    if($('h3')) {
        let partList = doc.querySelectorAll("script")[3].textContent.match(/(?<=part\":\").+?(?=\")/g);
        console.log(partList);
        if(partList?.length!=undefined){
            for(var i=0;i<partList.length;i++){
                parts += `[P${i+1}📺 ${partList[i]}](${mainUrl.replace(/\?$/, '')}?p=${i+1})\n`;
            }
        }
    }

    let biliInfo={};
    biliInfo.link = url.match(/^.+(?=\?)/g) || url;
    biliInfo.date = $("meta[itemprop='datePublished']")?.content;
    biliInfo.videoDate = biliInfo.date;
    biliInfo.title = $(".tit").textContent;
    biliInfo.author = $(".username").innerText.replace(/(^\s*)|(\s*$)/g,"");
    biliInfo.content = $("div#v_desc")?.textContent?.trim()?.replace(/收起$/, '');
    biliInfo.intro = biliInfo.content;
    biliInfo.cover = '"http:' + $("meta[property='og:image']")?.content?.replace(/@.*/, '') + '"';
    biliInfo.parts = parts === '' ? biliInfo.link : parts;
    biliInfo.filename = biliInfo.title.replace(/[\\\/\:\*\?\"\<\>\|]/g,"_");

    return biliInfo;

}
module.exports =  bilibili;
