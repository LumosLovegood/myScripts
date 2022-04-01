// author：@Lumos 
// 获取电影部分的代码修改于Blue-topaz-examples;作者:Cuman;Github:https://github.com/cumany/Blue-topaz-examples

// 豆瓣读书和电影的前缀
const moviePre = "https://movie.douban.com/subject/";
const bookPre = "https://book.douban.com/subject/";
const headers = {
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

async function douban(QuickAdd){
    // 内容查找提示框
    const name = await QuickAdd.quickAddApi.inputPrompt(
        "输入查询的豆瓣内容🔍"
    );
    if(!name){
        new Notice("❗没有输入任何内容");
        throw new Error("没有输入任何内容");
    }
    let searchResult =await searchDouban(name);
    if(!searchResult){
        new Notice("❗找不到你搜索的内容");
        throw new Error("找不到你搜索的内容");
    }
    let choice;

    while(true){
        choice = await QuickAdd.quickAddApi.suggester(
            (obj) => obj.text,
            searchResult
        );
        if(!choice){
            new Notice("❗没有选择任何内容");
            throw new Error("没有选择内容");
        }
        if(choice.typeId==0||choice.typeId==2){
            new Notice("🙃别点我，我只是一个分隔符");
            continue;
        }else if(choice.type=="book"){
            let bookInfo = await getBookInfo(choice.link);
            new Notice("正在生成笔记📖");
            // 调用quickAddApi.executeChoice()命令执行一个QuickAdd中设置好的读书笔记生成命令choice
            await QuickAdd.quickAddApi.executeChoice('CreateReadNote',bookInfo);
            break;
        }else{  
            movieInfo = await getMovieInfo(choice.link);
            new Notice("正在生成笔记🎞️");
            // 调用quickAddApi.executeChoice()命令执行一个QuickAdd中设置好的电影笔记生成命令choice
            await QuickAdd.quickAddApi.executeChoice('CreateMovieNote',movieInfo);
            break;
        }
    }
    
}

// 搜索内容并返回搜索结果列表
async function searchDouban(name){
    url = "https://www.douban.com/search/?q="+name;
    console.log(url);
    let searchUrl = new URL(url);
    const res = await request({
      url: searchUrl.href,
      method: "GET",
      cache: "no-cache",
      headers: headers
    });

    if(!res){
        return null;
    }

    let p = new DOMParser();
    let doc = p.parseFromString(res, "text/html");
    let $ = s => doc.querySelector(s);

    let re = $(".result-list");
    if(!re){
        return null;
    }

    let result = re.querySelectorAll(".result")
    let itemList=[];
    // 生成项目列表，列表项包括多个 格式为{text:text,link:link,type:type,typeId:typeId}的对象
    for(var i =0;i<result.length;i++){
        let temp = result[i];
        value = temp.querySelector("h3 a").attributes.onclick.value;
        if(value.includes("book")){
            text="📖"+" 《"+temp.querySelector("h3 a").textContent.trim()+"》 "+temp.querySelector(".subject-cast").textContent.trim();
            type = "book";
            typeId = 1;
            link = bookPre+value.match(/\d+(?=,)/g)
            itemList.push({text:text,link:link,type:type,typeId:typeId})
        }else if(value.includes("movie")){
            text="🎞️"+" 《"+temp.querySelector("h3 a").textContent.trim()+"》 "+temp.querySelector(".subject-cast").textContent.trim();
            type = "movie";
            typeId = 3;
            link = moviePre+value.match(/\d+(?=,)/g)
            itemList.push({text:text,link:link,type:type,typeId:typeId})
        }        
    }
    if(itemList.length==0){
        return null;
    }

    // 遍历列表项中如果有电影则添加一个 影视 分隔符
    for(var i=0;i<itemList.length;i++){
        if (itemList[i].typeId==3){
            itemList.push({text:"影视",typeId:2});
            break;
        }
    }
    // 遍历列表项中如果有电影则添加一个 书籍 分隔符
    for(var i=0;i<itemList.length;i++){
        if (itemList[i].typeId==1){
            itemList.push({text:"书籍",typeId:0});
            break;
        }
    }

    //根据typeID排序，书籍分隔符 0; 书籍项 1; 影视分隔符 2; 影视项 3
    itemList.sort(function(a,b){return a.typeId - b.typeId})

    return itemList;
}

//获取读书信息
async function getBookInfo(url){
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
    let nameWithQuote = "\""+name+"\""; //用于放到front matter里，加引号避免因为包含特殊字符导致ymal解析错误
    let author = $("meta[property='book:author']")?.content.replace(/[\[\]\(\)（）]/g,"");
    let authorWithQuote = "\""+author+"\"";
    let isbn = $("meta[property='book:isbn']")?.content;
    let cover = $("meta[property='og:image']")?.content;
    
    //其他信息(译者、原作名、页数)
    let text = $("#info")?.textContent.replace("\n","");
    let transAuthor = text.match(/(?<=译者:\s*)\S+\s?\S+/g)?text.match(/(?<=译者:\s*)\S+\s?\S+/g)[0].trim():"";
    let originalName = text.match(/(?<=原作名:\s*)[\S ]+/g)?(text.match(/(?<=原作名:\s*)[\S ]+/g)[0].trim()):"";
    let originalNameWithQuote = "\""+originalName+"\"";
    let pages = text.match(/(?<=页数:\s*)[\S ]+/g)?text.match(/(?<=页数:\s*)[\S ]+/g)[0].trim():"";
    let publisher = text.match(/(?<=出版社:\s*)\S+\s?\S+/g)?text.match(/(?<=出版社:\s*)\S+\s?\S+/g)[0].trim():"";
    let publishDate = text.match(/(?<=出版年:\s*)[\S ]+/g)?text.match(/(?<=出版年:\s*)[\S ]+/g)[0].trim():"";

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
    if(quoteList.length!=0){
        quote1 = quoteList[0]?.childNodes[0].textContent.replace(/\(/g,"").trim()+"\n"+sourceList[0].textContent.replace(/\s/g,"");
        quote2 = quoteList[1]?.childNodes[0].textContent.replace(/\(/g,"").trim()+"\n"+sourceList[1].textContent.replace(/\s/g,"");
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
    bookInfo.title = nameWithQuote;
    bookInfo.nameWithQuote=nameWithQuote;
    bookInfo.author=author;
    bookInfo.authorWithQuote = authorWithQuote;
    bookInfo.transAuthor=transAuthor;
    bookInfo.coverUrl=cover;
    bookInfo.originalName=originalName;
    bookInfo.originalNameWithQuote = originalNameWithQuote;
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
    bookInfo.publishDate = publishDate

    // 如果为空的话，quickadd会出现提示框让自己填，太麻烦了，所以先填一个默认空值
    for(var i in bookInfo){
        if(bookInfo[i]==""){
            bookInfo[i]="Not Found.";
        }
    }

    return bookInfo;
}

//电影部分的代码修改于Blue-topaz-examples;作者:Cuman;Github:https://github.com/cumany/Blue-topaz-examples
async function getMovieInfo(url){
    let movieUrl = new URL(url);
    const page = await request({
        url: movieUrl.href,
        method: "GET",
        cache: "no-cache",
        headers: headers
    });

    if (!page) {
     notice("No results found.");
     throw new Error("No results found.");
   }
     let p = new DOMParser();
     let doc = p.parseFromString(page, "text/html");
     let $ = s => doc.querySelector(s);
     let director = '';
     let moviename = '';
     moviename = $("meta[property='og:title']")?.content
     director = $("meta[property='video:director']")?.content
     summary = $("span[property='v:summary']").textContent??'-';
     genre = $("span[property='v:genre']").textContent??'-';
     console.log(genre)
     let regx = /<[^>]*>|<\/[^>]*>/gm;
     if (summary) {
             summary = summary.replace('(展开全部)', "");
             summary = summary.replace(regx, "").trim();
             summary = summary.replace(/\s\s\s\s/gm, "\n");
             
         }
     let movieinfo = {};
     movieinfo.fileName =moviename;
     movieinfo.Poster = $("meta[property='og:image']")?.content;
     movieinfo.type = 'movie';
     movieinfo.description = $("meta[property='og:description']")?.content;
     movieinfo.douban_url = $("meta[property='og:url']")?.content;
     movieinfo.director = "'"+ director +"'";  
     movieinfo.genre =  genre;
     movieinfo.rating = $("#interest_sectl > div > div.rating_self > strong")?.textContent??'-';
     movieinfo.plot = summary;
     movieinfo.runtime =  $("span[property='v:runtime']")?.textContent??'-';
     movieinfo.year = $("span[property='v:initialReleaseDate']")?.textContent??'-';
     movieinfo.banner= movieinfo.Poster.replace('s_ratio_poster', "1");
     
   return movieinfo;
}

module.exports =  douban
