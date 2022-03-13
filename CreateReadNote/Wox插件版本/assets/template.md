---
title: {title}
originalName: {originalName}
author: {author}
transAuthor: {transAuthor}
rating: {rating}
tags: {tags}
RelatedBooks: {relatedBooks}
ISBN: {isbn}
type: ReadNote
link: {link}
BeginDate: {today}
EndDate:
alias:
cover: {coverUrl}
pages: {pages}
pageprogress:
---
[status:: `=choice(this.EndDate=none,"在读","读完")`]

现在是 `=date(now)`
距离第一次看《`=this.title`》已经过去了==`=date(today)-this.BeginDate`==
此刻有什么新[[#想法]]呢？

````ad-hibox
title: 这段时间里阅读的其他书籍：
collapse: true
icon: book-open

```dataview
list "开始阅读于 "+BeginDate
from #book 
where BeginDate>=this.BeginDate & file.name!=this.file.name
```
````

---
# {title}

![{title}|300]({coverUrl})

## 简介
### 书籍简介

{intro}

### 作者简介

{authorIntro}

## 原文摘录
> {quote1}

> {quote2}

## 想法



