import os
import webbrowser
from time import sleep
from wox import Wox, WoxAPI

from douban import getDetailInfo,getSimpleInfo,createNote,SAVEDIR


class ReadNote(Wox):
    def query(self, key) -> list:
        if key and len(key)==13:
            simple = getSimpleInfo(key)    
            results =[
                {
                    "Title": "生成读书笔记",
                    "SubTitle": "点击生成《{}》的读书笔记".format(simple["title"]),
                    "IcoPath":"assets/read.png",
                    # "ContextData": "ctxData",
                    "JsonRPCAction": {
                        'method': 'createReadNote',
                        'parameters': ["{}".format(simple["detailUrl"])],
                        'dontHideAfterAction': True
                    }
                },
                {
                    "Title": "在豆瓣中查看",
                    "SubTitle": "点击在豆瓣中查看《{}》的信息".format(simple["title"]),
                    "IcoPath":"assets/douban.png",
                    # "ContextData": "ctxData",
                    "JsonRPCAction": {
                        'method': 'openUrl',
                        'parameters': ["{}".format(simple["detailUrl"])],
                        'dontHideAfterAction': True
                    }
                },
                {
                    "Title": "查找读书笔记内容",
                    "SubTitle": "在Obsidian中查找: {}".format(key),
                    "IcoPath":"assets/obsidian.png",
                    # "ContextData": "ctxData",
                    "JsonRPCAction": {
                        'method': 'obsidian_search',
                        'parameters': ["{}".format(key)],
                        'dontHideAfterAction': True
                    }
                },
                {
                    "Title": "打开读书笔记文件夹",
                    "SubTitle": SAVEDIR,
                    "IcoPath":"assets/folder.png",
                    "ContextData": "ctxData",
                    "JsonRPCAction": {
                        'method': 'open_folder',
                        'parameters': ["{}".format(SAVEDIR)],
                        'dontHideAfterAction': False
                    }
                }
            ]
        else:
            results = [
                {
                    "Title": "查找读书笔记内容",
                    "SubTitle": "在Obsidian中查找: {}".format(key),
                    "IcoPath":"assets/obsidian.png",
                    # "ContextData": "ctxData",
                    "JsonRPCAction": {
                        'method': 'obsidian_search',
                        'parameters': ["{}".format(key)],
                        'dontHideAfterAction': True
                    }
                },
                {
                    "Title": "打开读书笔记文件夹",
                    "SubTitle": SAVEDIR,
                    "IcoPath":"assets/folder.png",
                    "ContextData": "ctxData",
                    "JsonRPCAction": {
                        'method': 'open_folder',
                        'parameters': ["{}".format(SAVEDIR)],
                        'dontHideAfterAction': False
                    }
                }
            ]
        return results
    
    def open_folder(self,dir):
        os.startfile(dir)
    
    def openUrl(self,url):
        webbrowser.open(url)
    
    def obsidian_search(self,key):
        os.startfile(f'obsidian://search?vault=MyPostgraduate&query=tag:book%20{key}')
    
    def createReadNote(self,detailUrl):
        sleep(1)
        bookInfo = getDetailInfo(detailUrl)
        createNote(bookInfo)
        os.startfile(f'obsidian://open?vault=MyPostgraduate&file={bookInfo["title"]}')


if __name__ == "__main__":
    ReadNote()
