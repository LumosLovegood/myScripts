# 为笔记添加天气视图
一个可以在Obsidian笔记中插入天气内容的脚本。
## 目录
- [为笔记添加天气视图](#为笔记添加天气视图)
  * [简介](#简介)
  * [实现思路](#实现思路)
  * [使用方法](#使用方法)
    + [基本使用](#基本使用)
    + [字段解释](#字段解释)
## 简介
利用和风天气Api和 Dataview插件实现**在笔记中添加自定义天气内容**。
效果如下：

![](https://github.com/LumosLovegood/myScripts/blob/main/WeatherView/assets/Pasted%20image%2020220319151149.png)
## 实现思路
1. 访问和风天气Api获取天气数据
2. 利用Dataview插件的 dataviewjs，处理得到的天气数据并以表格视图展示。
## 使用方法
### 基本使用
视频演示地址：
1. 下载 [weatherView.js](https://github.com/LumosLovegood/myScripts/blob/main/WeatherView/weatherView.js) 脚本文件至自己的Obsidian库中
2. 安装dataview插件并启用 JavaScript 查询选项
	![](https://github.com/LumosLovegood/myScripts/blob/main/WeatherView/assets/Pasted%20image%2020220319153553.png)
3. 复制以下代码到想要添加天气视图的地方，并将上述下载的脚本文件路径填入代码中的`dv.view`。
  ```js
  let setting = {};

  //在和风天气中创建的 Api key
  setting.key = "";

  setting.city = "天心";//城市名
  setting.days = 3;//天气预报天数
  setting.headerLevel = 2;//添加标题的等级
  setting.addDesc = true;//是否添加描述
  setting.onlyToday = true;//是否只在当天显示
  setting.anotherCity = "";//添加另外一个城市

  //脚本文件 weatherView.js 所在路径
  dv.view("这里填脚本路径",setting)
  ```
4. 访问[和风天气开发平台](https://id.qweather.com/#/register)注册和风天气账号
5. 登录控制台点击左侧应用管理
6. 点击右侧创建Web API应用后得到Key
7. 将Key填入上面的代码中`setting.key`的位置。
### 字段解释
- `setting.key`：String，在和风天气中获取的API Key
- `setting.city`：String，主城市名，支持区级描述，例如"江汉"（即武汉市江汉区）
- `setting.days` ：int，要显示的天气预报天数，可用范围 **1~7**，为 1 时只显示描述
- `setting.headerLevel` ：int，添加标题的等级，为 0 时不显示标题。
- `setting.addDesc` 
- `setting.onlyToday` ：Boolean，是否只在当天显示，为true时，只有文件创建日期为当前日期时才显示。
- `setting.anotherCity`：String，另一个城市名，为 "" 时不显示

---

遇到问题或者有想法欢迎提交[issue](https://github.com/LumosLovegood/myScripts/issues)。
