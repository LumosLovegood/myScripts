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

async function getDetailInfo(url){
    let bookUrl = new URL(url);
    const res = await request({
        url: bookUrl.href,
        method: "GET",
        cache: "no-cache",
        headers: headers
    });
    let p = new DOMParser();
    let doc = p.parseFromString(res, "text/html");
    let $ = s => doc.querySelector(s);
    let $2 = z => doc.querySelectorAll(z);


    let bookInfo = {}; 
    //书名、作者、ISBN、封面
    let name = $("meta[property='og:title']")?.content;
    let title = "\""+name+"\""; //用于放到front matter里，加引号避免因为包含特殊字符导致ymal解析错误
    let author = $("meta[property='book:author']")?.content.replace(/[\[\]\(\)（）]/g,"");
    let isbn = $("meta[property='book:isbn']")?.content;
    let cover = $("meta[property='og:image']")?.content;
    
    //其他信息(译者、原作名、页数)
    let text = $("#info")?.textContent.replace("\n","");
    let transAuthor = text.match(/(?<=译者:\s*)\S+\s?\S+/g)?text.match(/(?<=译者:\s*)\S+\s?\S+/g)[0].trim():"";
    let originalName = text.match(/(?<=原作名:\s*)[\S ]+/g)?text.match(/(?<=原作名:\s*)[\S ]+/g)[0].trim():"";
    let pages = text.match(/(?<=页数:\s*)[\S ]+/g)?text.match(/(?<=页数:\s*)[\S ]+/g)[0].trim():"";
    let publisher = text.match(/(?<=出版社:\s*)\S+\s?\S+/g)?text.match(/(?<=出版社:\s*)\S+\s?\S+/g)[0].trim():"";

    //豆瓣评分
    let rating = $("div#interest_sectl div div strong")?.textContent.replace(/\s/g,"");

    //书籍和作者简介，这一块儿不同类型的书对应的网页结构都不太一样，尽力做兼容了，还有问题我也没办法 \摊手
    let intro = "";
    let authorIntro = "";
    var temp1 = $("h2");
    if(temp1.innerText.includes("内容简介")){
        var temp2 = temp1.nextElementSibling.querySelectorAll("div.intro")
        var temp3 = temp2[temp2.length-1].querySelectorAll("p");
        for(var i=0;i<temp3.length;i++){
            intro = intro+temp3[i].textContent+"\n";
        }
        try{
            temp2 = $2("h2")[1].nextElementSibling.querySelectorAll("div.intro");
            temp3 = temp2[temp2.length-1].querySelectorAll("p");
            for(var i=0;i<temp3.length;i++){
                authorIntro = authorIntro+temp3[i].textContent+"\n";
            }
        }catch(e){
            new Notice("没有作者简介");
        }        
    }else if(temp1.innerText.includes("作者简介")){
        var temp2 = temp1.nextElementSibling.querySelectorAll("div.intro")
        var temp3 = temp2[temp2.length-1].querySelectorAll("p");
        for(var i=0;i<temp3.length;i++){
            authorIntro = authorIntro+temp3[i].textContent+"\n";
        }
    }

    //原文摘录
    let quote1 = "";
    let quote2 = "";
    let quoteList = $2("figure");
    let sourceList = $2("figcaption");
    if(quoteList){
        quote1 = quoteList[0].childNodes[0].textContent.replace(/\(/g,"").trim()+"\n"+sourceList[0].textContent.replace(/\s/g,"");
        quote2 = quoteList[1].childNodes[0].textContent.replace(/\(/g,"").trim()+"\n"+sourceList[1].textContent.replace(/\s/g,"");
    }

    //豆瓣常用标签，记得之前这一块儿网页元素里是有的，后来找不到了，但是尝试性源代码全文搜索的时候 在Script标签里找到了，但是感觉随时会改。
    var temp = $2("script");
    let tags = temp[temp.length-3].textContent.match(/(?<=:)[\u4e00-\u9fa5·]+/g);
    tags.push("book");

    //相关书籍，仿佛这个信息也没啥用，但是能加就加了
    let relatedBooks = [];
    temp = $2("div#db-rec-section div dl dd");
    if(temp){
        for(var i=0;i<temp.length;i++){
            relatedBooks.push(temp[i].textContent.replace(/\s/g,""));
        }
    }

    bookInfo.name = name;
    bookInfo.title=title;
    bookInfo.author=author;
    bookInfo.transAuthor=transAuthor;
    bookInfo.coverUrl=cover;
    bookInfo.originalName=originalName;
    bookInfo.pages=pages;
    bookInfo.publisher=publisher;
    bookInfo.intro=intro;
    bookInfo.isbn=isbn;
    bookInfo.rating=rating;
    bookInfo.authorIntro =authorIntro;
    bookInfo.quote1=quote1;
    bookInfo.quote2=quote2;
    bookInfo.tags=tags;
    bookInfo.relatedBooks=relatedBooks;
    bookInfo.link = url;

    // 如果为空的话，quickadd会出现提示框让自己填，太麻烦了，所以先填一个默认空值
    for(var i in bookInfo){
        if(bookInfo[i]==""){
            bookInfo[i]="Not Found.";
        }
    }

    return bookInfo;
}
module.exports =  douban
