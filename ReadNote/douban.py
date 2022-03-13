# @Author: Lumos

from datetime import date
import requests
from bs4 import BeautifulSoup
import re

# 模板文件路径
TEMPLATEPATH = r"F:/OneDrive/MyPostgraduate/Template/ReadNote.md"

# 生成的笔记所在的目录
SAVEDIR = r"F:/OneDrive/MyPostgraduate/3日常/读书/"

# requests所需的代理参数，不知道为什么我不设置的话会报错
PROXIES = {
    'http': 'http://127.0.0.1:7890',
    'https': 'http://127.0.0.1:7890'
}

# 获取基础信息（标题以及详细信息的网址）
def getSimpleInfo(isbn:str) -> dict :
    url = f"https://m.douban.com/search/?query={isbn}"
    headers = {
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
    'Referer': 'https://m.douban.com/search/?query=9787210105893',
    }

    response = requests.get(url,headers=headers,proxies=PROXIES)
    soup = BeautifulSoup(response.content,"lxml")

    temp = soup.select("div[class=subject-info] > span")
    if temp:
        title = temp[0].text
        detailUrl = "https://m.douban.com"+soup.select("ul>li>a")[0].get("href")
    else:
        return None
    
    return {"title":title,"detailUrl":detailUrl}


# 获取详细信息
def getDetailInfo(detailUrl:str) -> dict:
    headers = {
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

    response = requests.get(detailUrl,headers=headers,proxies=PROXIES)
    soup = BeautifulSoup(response.content,"lxml")
    
    ## 书名
    name = soup.find("h1").text.replace("\n","")
    title = "\""+name+"\""

    ## 封面图片
    coverUrl = soup.select("div[id=mainpic]>a")[0].get("href")

    ## 作者和译者、原作名（如果有译者的话）、页数
    spanList=soup.find(id="info").select("span")
    author=""
    transAuthor=""
    originalName = title
    pages = ""
    for i in spanList:
        if "作者" in i.text and i.find_next_sibling("a")!=None:
            author = re.sub(r"[\s\[]","",i.find_next_sibling("a").text).replace("]"," ")
        elif "译者" in i.text and i.find_next_sibling("a")!=None:
            transAuthor = re.sub(r"[\s\[]","",i.find_next_sibling("a").text).replace("]"," ")
        elif "原作名" in i.text:
            originalName = "\""+i.next_sibling.text.strip()+"\""
        elif "页数" in i.text:
            pages = i.next_sibling.text.strip()

    ## ISBN号码，这个字段没有在标签下所以不太好定位，但是isbn一般为13个数字，所以直接用正则匹配
    patt = re.compile(r"\d{10,13}")
    isbn = patt.findall(soup.select("div[id=info]")[0].text)[0]

    ## 豆瓣评分
    rating = soup.select("div[id=interest_sectl]>div>div>strong")[0].text.replace(" ","")

    ## 简介
    # introList = soup.select("div[class=intro]")
    # ### 书籍简介
    # intro = ''
    # for i in introList[0].select("p"):
    #     intro = intro+i.text+"\n"
        
    # # for i in soup.select("div[id=link-report] > div> div>p"):
    # #     intro = intro+i.text+"\n"

    # ### 作者简介
    # authorIntro = ''
    # for i in introList[-1].select('p'):
    #     authorIntro = authorIntro+i.text+"\n"
    ### 书籍简介
    intro = ''
    for i in soup.select("h2")[0].find_next_sibling("div").select("div[class=intro]")[-1].select("p"):
        intro = intro+i.text+"\n"
    
    ### 作者简介
    authorIntro = ''
    for i in soup.select("h2")[1].find_next_sibling("div").select("div[class=intro]")[-1].select("p"):
        authorIntro = authorIntro+i.text+"\n"
    
    ## 部分原文摘录（如果有的话）
    pattern = re.compile(r"[\S ]+")
    quoteList = soup.select("figure")
    sourceList = soup.select("figcaption")
    if quoteList:
        quote1 = pattern.findall(quoteList[0].contents[0])[0].replace("(","").strip()+"\n> "+sourceList[0].text.replace("\n","")
        quote2 = pattern.findall(quoteList[1].contents[0])[0].replace("(","").strip()+"\n> "+sourceList[1].text.replace("\n","")
    else:
        quote1 = quote2 = None
    
    ## 标签
    tagPattern = re.compile(r"(?<=:)[\u4e00-\u9fa5·]+")
    tags = tagPattern.findall(soup.select("script")[-3].text)
    tags.append("book")
    
    ## 相关书籍
    relatedBooks = [i.text.replace("\n","").replace(" ","") for i in soup.select("div[id=db-rec-section]>div>dl>dd")]

    ## 当前日期，相当于文件创建日期
    today = date.today().strftime("%Y-%m-%d")

    detailInfo = {
        "title":title,
        "name":name,
        "coverUrl":coverUrl,
        "author":author,
        "transAuthor":transAuthor,
        "originalName":originalName,
        "rating":rating,
        "pages":pages,
        "tags":tags,
        "relatedBooks":relatedBooks,
        "link":detailUrl,
        "isbn":isbn,
        "today":today,
        "intro":intro,
        "authorIntro":authorIntro,
        "quote1":quote1,
        "quote2":quote2
    }
    return detailInfo


# 生成阅读笔记
def createNote(detailInfo:dict)-> None:
    with open(TEMPLATEPATH,"r",encoding="utf-8") as temp:
        template = temp.read()
    
    content = template.format(**detailInfo)
    
    with open(SAVEDIR + detailInfo["name"] + ".md","w",encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    isbn = "9787530211267" #《一个陌生女人的来信》
    url = getSimpleInfo(isbn)["detailUrl"]
    from time import sleep
    sleep(2)
    createNote(getDetailInfo(url))


