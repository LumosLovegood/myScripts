// Author: @Lumos
// Url: https://github.com/LumosLovegood
async function douban(QuickAdd){
    const isbn = await QuickAdd.quickAddApi.inputPrompt(
        "请输入书籍背后的13位ISBN码："
    );
    if(isbn.length!=13){
        new Notice("ISBN码位数错误");
        throw new Error("ISBN码位数错误");
    }
    let simpleInfo =await getBookUrl(isbn);
    if(!simpleInfo){
        new Notice("无法识别此ISBN码");
        throw new Error("无法识别此ISBN码");
    }
    let url = simpleInfo.url;
    new Notice("准备获取《"+simpleInfo.title+"》的内容信息",1000)
    let bookInfo = await getDetailInfo(url)
    if(!bookInfo){
        new Notice("获取内容失败");
        throw new Error("获取内容失败");
    }
    new Notice("笔记已生成！",500);
    // 获取今日日期
    const date = window.moment().format("gggg-MM-DD")
    bookInfo.today = date;

    QuickAdd.variables = {
        ...bookInfo
    };
}

async function getBookUrl(isbn){
    url = "https://m.douban.com/search/?query="+isbn;
    let searchUrl = new URL(url);
    const res = await request({
      url: searchUrl.href,
      method: "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
      }
    });

    if(!res){
        return null;
    }

    let p = new DOMParser();
    let doc = p.parseFromString(res, "text/html");
    let title = doc.querySelector("div.subject-info span").textContent;
    let detailUrl = String(doc.querySelector("ul li a").href).replace("app://obsidian.md","https://m.douban.com");
    if (!detailUrl){
        return null;
    }
    let simpleInfo={};
    simpleInfo.title=title;
    simpleInfo.url = detailUrl;
    return simpleInfo;
}

async function getDetailInfo(detailUrl){
    let headers = {
        "Content-Type": "text/html; charset=utf-8",
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Site': 'same-site',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Referer': 'https://m.douban.com/',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        }
    let deUrl = new URL(detailUrl);
    const res = await request({
        url: deUrl.href,
        method: "GET",
        cache: "no-cache",
        headers: headers
      });

    let p = new DOMParser();
    let doc = p.parseFromString(res, "text/html");
    
    // 书名
    let name = doc.querySelector('h1').textContent.replace("\n","").trim();
    let title = "\""+name+"\"";
    
    // 封面图片
    let coverUrl = doc.querySelector("div#mainpic a").href;
    
    // 作者和译者、原作名、页数（如果有的话）
    let spanList = doc.querySelectorAll('#info span');
    let author='';
    let transAuthor="Not set";
    let originalName = title;
    let pages = "Not set";
    for(var j=0;j<spanList.length;j++){
        var i = spanList[j];
        if(i.textContent.includes("作者")&&i.nextElementSibling.textContent!=""){
            author = i.nextElementSibling.textContent.replace(/[\s[]/g,"").replace("]"," ");
        }
        else if(i.textContent.includes("译者")&&i.nextElementSibling.textContent!=""){
            transAuthor = i.nextElementSibling.textContent.replace(/[\s[]/g,"").replace("]"," ");
        }
        else if(i.textContent.includes("原作名")){
            originalName = "\""+i.nextSibling.textContent.trim()+"\"";
        }
        else if(i.textContent.includes("页数")){
            pages = i.nextSibling.textContent.trim();
        }
    }
    
    // ISBN号码
    let isbn = doc.querySelector("div#info").textContent.match(/\d{10,13}/g)[0];

    // 豆瓣评分
    let rating = doc.querySelector("div#interest_sectl div div strong").textContent.replace(/\s/g,"");
    
    // 简介
    // 书籍简介
    let intro = "";
    var temp1 = doc.querySelector("h2").nextElementSibling.querySelectorAll("div.intro");
    var temp2 = temp1[temp1.length-1].querySelectorAll("p");
    for(var i=0;i<temp2.length;i++){
        intro = intro+temp2[i].textContent+"\n";
    }
    // 作者简介
    let authorIntro = "";
    temp1 = doc.querySelectorAll("h2")[1].nextElementSibling.querySelectorAll("div.intro");
    temp2 = temp1[temp1.length-1].querySelectorAll("p");
    for(var i=0;i<temp2.length;i++){
        authorIntro = authorIntro+temp2[i].textContent+"\n";
    }

    // 部分原文摘录（如果有的话）
    let quoteList = doc.querySelectorAll("figure");
    let sourceList = doc.querySelectorAll("figcaption");
    let quote1;
    let quote2;
    if(!quoteList){
        quote1 = null;
        quote2 = null;
    }else{
        quote1 = quoteList[0].childNodes[0].textContent.replace(/\(/g,"").trim()+"\n"+sourceList[0].textContent.replace(/\s/g,"");
        quote2 = quoteList[1].childNodes[0].textContent.replace(/\(/g,"").trim()+"\n"+sourceList[1].textContent.replace(/\s/g,"");
    }

    // 标签
    var temp = doc.querySelectorAll("script");
    let tags = temp[temp.length-3].textContent.match(/(?<=:)[\u4e00-\u9fa5·]+/g);
    tags.push("book");

    // 相关书籍
    temp = doc.querySelectorAll("div#db-rec-section div dl dd");
    let relatedBooks = [];
    for(var i=0;i<temp.length;i++){
        relatedBooks.push(temp[i].textContent.replace(/\s/g,""));
    }
    let bookInfo = {};
    bookInfo.name = name;
    bookInfo.title=title;
    bookInfo.author=author;
    bookInfo.transAuthor=transAuthor;
    bookInfo.coverUrl=coverUrl;
    bookInfo.originalName=originalName;
    bookInfo.pages=pages;
    bookInfo.intro=intro;
    bookInfo.isbn=isbn;
    bookInfo.rating=rating;
    bookInfo.authorIntro =authorIntro;
    bookInfo.quote1=quote1;
    bookInfo.quote2=quote2;
    bookInfo.tags=tags;
    bookInfo.relatedBooks=relatedBooks;
    bookInfo.link = detailUrl;
    
    return bookInfo;
}
module.exports =  douban
