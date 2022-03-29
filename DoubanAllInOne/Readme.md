# Ob内查询并生成读书/电影笔记
豆瓣All in One。
一个可以在obsidian内搜索豆瓣内容（图书和电影）、展示搜索结果并且自动生成笔记的脚本。
## 更新记录
### 2022年3月29日
- 修复部分书籍没有摘录信息的情况下无法生成笔记的问题
- 修复书名、原作名以及作者名中出现特殊字符导致yaml解析出错的问题
## 目录
 - [Ob内查询并生成读书/电影笔记](#Ob内查询并生成读书/电影笔记)
	* [简介以及实现效果](#简介以及实现效果)
	* [实现思路](#实现思路)
	* [使用方法](#使用方法)
	    + [基本使用](#基本使用)
	    + [字段解释](#字段解释)

## 简介以及实现效果
最近对之前生成读书笔记的代码重构了一下，现在把书籍和电影整合到了一起，可以实现**搜索并展示搜索结果**。

在搜索结果中**点击不同类型的搜索结果会生成对应类型的笔记**（比如点击书籍类型会生成读书笔记，点击电影类型会生成电影笔记）。

（脚本中的电影信息获取的代码移植自[cuman](https://github.com/cumany)的[obsidian示例库](https://github.com/cumany/Blue-topaz-examples)）

效果如下：

![](https://github.com/LumosLovegood/myScripts/blob/main/DoubanAllInOne/assets/Snipaste_2022-03-27_13-07-15.png)

![](https://github.com/LumosLovegood/myScripts/blob/main/DoubanAllInOne/assets/Snipaste_2022-03-27_13-07-43.png)

## 实现思路
1. 查询并展示搜索结果
	1. 脚本获取豆瓣查询界面的页面文档
	2. 解析文档中的查询结果等相关元素
	3. 将解析到的结果列表项放入quickaddAPI生成的suggester提示框
2. 点击生成对应类型的笔记
	1. 获取选中的结果项对象包含的网址信息
	2. 脚本获取网址界面的页面文档并解析相关内容元素，得到图书或电影信息
	3. 在Quickadd中新建两个模板choice命令，分别对应两种类型的笔记生成
	4. 使用QuickaddAPI的executeChoice方法，对不同选中的结果类型执行不同的choice指令
## 使用方法
视频演示地址：[Obsidian使用技巧：一站式搜索并生成读书/电影笔记](https://www.bilibili.com/video/BV1E3411W7ZTb)
### 基本使用
1. 安装并启用[Quickadd](https://github.com/chhoumann/quickadd)插件
1. 在Quickadd中新建两个Template命令，命令所用的模板文件分别为[Read Note]()和[MovieNote]()，并分别命名为“CreateReadNote”和“CreateMovieNote”
2. 在Quickadd中新建一个Macro命令，命令设置中添加User Script为[doubanInOne.js]()，并点亮该命令的⚡符号以启用命令。
3. 命令面板启动该命令即可使用。
4. 如果想要更方便的话可以使用[Button](https://github.com/shabegom/buttons)插件为这个命令添加一个按钮。
### 字段解释
##### 读书笔记模板字段解释
参考在上一篇文档中写的[自定义模板文件部分](https://github.com/LumosLovegood/myScripts/tree/main/CreateReadNote#%E8%87%AA%E5%AE%9A%E4%B9%89%E6%A8%A1%E6%9D%BF%E6%96%87%E4%BB%B6)。此外新增获取出版社信息，使用{{VALUE:publisher}}字段。

![](https://github.com/LumosLovegood/myScripts/blob/main/DoubanAllInOne/assets/Pasted%20image%2020220327140217.png)

##### 电影笔记模板字段解释
由于这部分不是我写的，就不做解释和评论了，可以参考读书笔记模板字段解释进行修改。

遇到问题或者有想法欢迎提交[issue](https://github.com/LumosLovegood/myScripts/issues)。
