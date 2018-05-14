# 为什么选用 GraphQL
---

## 需求
- 新需求插队
- 开发滞后需求
- 加班也延迟
- 代码为进度而死

---

### 需求1：多平台

#### 产生冗余字段，移动端只缩略图，而pc端需要缩略图和原图
```
http://api.xxx.com/getUserInfo/:uid
http://cpi.xxx.com/getUserInfo/:uid
http://mpi.xxx.com/getUserInfo/:uid
```
遇到不同产品线呢？一级代理、二级代理
加到参数中

---

### 需求2：一次调用多个API: 聚合数据
![](lottery_header.png)

```
/lottery/current/number 当前期期号
/lottery/history/?page=1&size=1  上次开奖结果
```

---

### 需求3：变更多又快
#### 导航菜单会有：
- 标签：热门、推荐
- 显示：不可用、隐藏
- 排版：一级变二级，二级变三级，折叠，首页与次页
- 排序: 最新、最热、用户喜好

---

## 技术优势
---

### 缓存优先
#### 省去各种状态管理：不再出现没刷新，不同步
#### 省去加载多余数据：按 typename + id 索引，保存后刷新，翻页和加载更多
#### 减轻服务器负载

---

### 编程规范
#### 类型检查：字段变更有友好提示
#### 套接字：只关注业务开发
#### 文档：使用gql，代码即文档

---

### 开发成本
#### 工具链，php go python java c#
#### Facebook Twitter GitHub 在使用

