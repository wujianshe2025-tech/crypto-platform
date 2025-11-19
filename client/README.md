# 🪙 加密货币平台 - 客户端

一个使用真实数据的加密货币信息平台，提供实时行情、新闻资讯、社区论坛和预测投票功能。

## ✨ 功能特点

- 🔥 **实时行情** - 使用CoinGecko API显示真实的加密货币价格
- 📰 **新闻资讯** - 使用CryptoCompare API显示最新行业新闻
- 💬 **社区论坛** - 发布帖子、点赞、评论
- 🎯 **预测投票** - 创建预测、投票、查看统计
- 🔄 **自动刷新** - 价格数据每30秒自动更新
- 📱 **响应式设计** - 完美支持移动端和桌面端

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📦 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **样式**: Tailwind CSS
- **API**: CoinGecko + CryptoCompare

## 🌐 API说明

### CoinGecko API
- 用途：加密货币价格和市场数据
- 免费使用，无需API密钥
- 限制：每分钟10-50次请求

### CryptoCompare API
- 用途：加密货币新闻
- 免费使用，无需API密钥
- 限制：每秒20次请求

## 📁 项目结构

```
src/
├── components/      # 组件
│   └── Layout.tsx   # 布局组件
├── pages/           # 页面
│   ├── Dashboard.tsx    # 实时行情
│   ├── News.tsx         # 新闻资讯
│   ├── Community.tsx    # 社区论坛
│   └── Predictions.tsx  # 预测投票
├── services/        # API服务
│   └── api.ts       # API调用函数
├── data/            # 数据
│   └── mockData.ts  # 模拟数据
├── App.tsx          # 主应用
├── main.tsx         # 入口文件
└── index.css        # 样式文件
```

## 🔧 配置文件

- `vite.config.ts` - Vite配置
- `tailwind.config.js` - Tailwind CSS配置
- `tsconfig.json` - TypeScript配置
- `postcss.config.js` - PostCSS配置

## 📝 环境变量

目前不需要环境变量，所有API都是公开的。

如果将来需要，创建 `.env` 文件：

```env
VITE_API_KEY=your_api_key
```

在代码中使用：
```typescript
const apiKey = import.meta.env.VITE_API_KEY;
```

## 🚢 部署

### 部署到Vercel

1. 推送代码到GitHub
2. 访问 https://vercel.com
3. 导入项目
4. 配置：
   - Root Directory: `client`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 部署

详细步骤请查看 `快速部署.md`

## ⚠️ 注意事项

1. **API限制** - 免费API有请求频率限制，请勿过度刷新
2. **网络要求** - 需要稳定的网络连接才能获取数据
3. **数据说明** - 数据来自第三方API，仅供参考
4. **本地存储** - 社区和预测数据保存在浏览器本地

## 🐛 问题排查

### 构建失败
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 页面空白
- 检查浏览器控制台错误
- 确认路由配置正确
- 检查API是否可访问

### API错误
- 检查网络连接
- 确认API服务状态
- 查看请求频率是否超限

## 📚 文档

- [部署说明](./部署说明.md) - 详细的部署指南
- [快速部署](./快速部署.md) - 快速部署步骤

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [CoinGecko API文档](https://www.coingecko.com/en/api)
- [CryptoCompare API文档](https://min-api.cryptocompare.com/)
- [React文档](https://react.dev/)
- [Vite文档](https://vitejs.dev/)
- [Tailwind CSS文档](https://tailwindcss.com/)

## 💡 未来计划

- [ ] 添加用户系统
- [ ] 集成数据库
- [ ] 添加K线图表
- [ ] 支持多语言
- [ ] 添加PWA支持
- [ ] 优化性能和缓存

---

Made with ❤️ by [Your Name]
