# 一键生成读书笔记

一个在Obsidian中使用的脚本,主要用途是**可以更加方便为手边在读的纸质书自动生成读书笔记的部分内容**。
## 目录

- [一键生成读书笔记](#一键生成读书笔记)
  * [背景](#背景)
  * [使用方法](#使用方法)
    + [直接使用](#直接使用)
    + [自定义模板文件](#自定义模板文件)



## 背景
最近整理笔记的时候比较头疼，又想整理得尽可能完善同时又嫌实际操作起来太麻烦，于是想写个脚本以后方便一点。

之前听说有豆瓣读书的官方API可以用，但是查了一下发现豆瓣官方好像很早就不再开放查询ISBN的API了，**所以就打算自己写一个获取内容的脚本**。并且自己写脚本的话拿到的东西比原来官方API返回的内容会更丰富些，也可以自定义。
## 使用方法

B站使用帮助视频：https://www.bilibili.com/video/BV1NT4y1U7P3

文件夹下有 [*Wox*](https://github.com/LumosLovegood/myScripts/tree/main/CreateReadNote/Wox%E6%8F%92%E4%BB%B6%E7%89%88%E6%9C%AC) 和 [*QuickAdd*](https://github.com/LumosLovegood/myScripts/tree/main/CreateReadNote/QuickAdd%E7%89%88%E6%9C%AC) 两个版本。

  最开始是用 *python* 写的 *Wox* 插件，但是后来学了学 *JS*，又写了一个 *QuickAdd* 版本的。

我感觉 *QuickAdd* 版本更方便一点，所以推荐这个，**这里也只介绍一下 *QuickAdd* 版本的使用方法**。

我的模板中用到了 [Dataview 插件](https://github.com/blacksmithgu/obsidian-dataview)、 [Buttons 插件](https://github.com/shabegom/buttons) 和 [Admonition 插件](https://github.com/valentine195/obsidian-admonition)，所以直接使用的话需要在第三方社区插件中安装这三个插件。
### 直接使用
[*QuickAdd* 版本](https://github.com/LumosLovegood/myScripts/tree/main/CreateReadNote/QuickAdd%E7%89%88%E6%9C%AC) 文件夹下的 [douban.js](https://github.com/LumosLovegood/myScripts/blob/main/CreateReadNote/QuickAdd%E7%89%88%E6%9C%AC/douban.js) 是脚本文件，
[template.md](https://github.com/LumosLovegood/myScripts/blob/main/CreateReadNote/QuickAdd%E7%89%88%E6%9C%AC/template.md) 是读书笔记模板文件，[AllBooks.md](https://github.com/LumosLovegood/myScripts/blob/main/CreateReadNote/QuickAdd%E7%89%88%E6%9C%AC/AllBooks.md)是展示所有读书笔记的文件。

这三个文件需要下载之后保存到自己的 *Obsidian* 库中，之后具体的设置可以查看上面的视频教程。

### 自定义模板文件
模板文件也可以自定义修改，其中变量使用的话用 `{{VALUE:变量名}}` 格式，例如 `{{VALUE:name}}`。

目前可以使用的变量有：
- title：加引号的书名（避免因为书名中包含特殊字符而导致yaml解析错误），例如 `"一个陌生女子的来信"`
- name：不加引号的书名，例如 `一个陌生女子的来信`
- originalName：译文书籍的原作名，例如 `brief einer unbekannten`
- author：作者，格式为 `国家 作者名`，例如 `奥地利 斯蒂芬·茨威格`
- transAuthor：译者，例如 `沈锡良`
- rating：豆瓣评分，例如 `8.5`
- tags：豆瓣标签列表，例如 `'茨威格', '爱情', '女性', '人性', '外国文学', '文学', '奥地利', '奥地利文学', '小说', '思想小说', 'book'`
- relatedBooks：相关书籍列表，例如 `'斯·茨威格中短篇小说选', '情书', '心灵的焦灼', '霍乱时期的爱情', '永别了，武器', '一个女人一生中的二十四小时', '牛虻', '许三观卖血记', '地下室手记', '小径分岔的花园'`
- isbn：书籍的ISBN号码，例如 `9787210105893`
- link：书籍的豆瓣链接，例如 `https://m.douban.com/book/subject/30452866/`
- coverUrl：书籍的封面图片链接，例如 `https://img1.doubanio.com/view/subject/l/public/s34074708.jpg`
- pages：总页数，例如 `244`
- intro：书籍简介
- authorIntro：作者简介
- quote1(quote2)：原文摘录

示例
```md
书名: {{VALUE:name}}
作者: {{VALUE:author}}

## 内容简介
{{VALUE:intro}}
```
---

遇到问题或者有想法欢迎提交[issue](https://github.com/LumosLovegood/myScripts/issues)。
