# 快速参考卡片 - fhevm v0.5.0 升级

## 🚀 5 分钟快速开始

```bash
# 1. 配置环境
cp .env.example .env
# 编辑 .env,填入你的配置

# 2. 安装和编译
npm install
npm run compile

# 3. 部署
npm run deploy:pauser
npm run deploy

# 4. 验证
npm run verify
```

---

## 📝 关键变更速查

### 环境变量
```bash
# ❌ 旧的(已弃用)
KMS_MANAGEMENT_ADDRESS=0x...
PAUSER_ADDRESS=0x...

# ✅ 新的(使用这个)
KMS_GENERATION_ADDRESS=0x...
NUM_PAUSERS=2
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...
```

### 网关 API
```solidity
// ❌ 旧的(已移除)
gateway.checkPublicDecryptAllowed(ct);

// ✅ 新的(使用这个)
bool allowed = gateway.isPublicDecryptAllowed(ct);
if (!allowed) revert("Not allowed");
```

### PauserSet 计算
```
NUM_PAUSERS = n_kms + n_copro
```
- n_kms = KMS 节点数
- n_copro = 协处理器数

---

## 🔧 常用命令

```bash
# 编译
npm run compile

# 部署 PauserSet
npm run deploy:pauser

# 部署主合约
npm run deploy

# 全部部署
npm run deploy:all

# 验证合约
npm run verify

# 运行测试
npm test

# 启动开发服务器
npm run dev
```

---

## 📁 重要文件位置

| 文件 | 位置 | 用途 |
|------|------|------|
| 环境变量 | `.env` | 配置私钥、地址等 |
| 主合约 | `contracts/ConfidentialFlightBooking.sol` | 航班预订逻辑 |
| 暂停器 | `contracts/PauserSet.sol` | 暂停器管理 |
| 前端配置 | `public/config.js` | 合约地址和配置 |
| 部署脚本 | `scripts/deploy.js` | 部署主合约 |
| 迁移指南 | `MIGRATION_GUIDE.md` | 完整迁移说明 |

---

## 🆘 快速故障排除

### 问题: PauserSet 部署失败
```bash
# 检查
cat .env | grep NUM_PAUSERS
cat .env | grep PAUSER_ADDRESS_

# 确保配置了 NUM_PAUSERS 和所有 PAUSER_ADDRESS_[0-N]
```

### 问题: 函数不存在错误
```solidity
// 确保使用新 API
// 旧: checkPublicDecryptAllowed ❌
// 新: isPublicDecryptAllowed ✅
```

### 问题: KMS 连接失败
```bash
# 检查环境变量
cat .env | grep KMS_GENERATION_ADDRESS

# 应该是 KMS_GENERATION_ADDRESS,不是 KMS_MANAGEMENT_ADDRESS
```

---

## 📊 部署流程图

```
开始
  ↓
配置 .env
  ↓
npm install
  ↓
npm run compile
  ↓
部署 PauserSet ← 记录地址
  ↓
更新 .env
  ↓
部署主合约 ← 记录地址
  ↓
验证合约
  ↓
更新前端配置
  ↓
测试功能
  ↓
完成 ✅
```

---

## 🔐 安全检查清单

- [ ] 私钥已安全存储
- [ ] .env 在 .gitignore 中
- [ ] 所有暂停器地址已验证
- [ ] NUM_PAUSERS 计算正确
- [ ] 合约 owner 地址正确
- [ ] 已在测试网测试
- [ ] 合约已验证

---

## 📞 获取帮助

1. **本地文档**
   - `MIGRATION_GUIDE.md` - 详细迁移步骤
   - `UPGRADE_NOTES.md` - 完整升级说明
   - `DEPLOYMENT_CHECKLIST.md` - 部署检查清单

2. **在线资源**
   - [fhevm 文档](https://docs.zama.ai/fhevm)
   - [Zama 社区](https://community.zama.ai/)
   - [GitHub Issues](https://github.com/RusselYost/ConfidentialFlightBooking/issues)

---

## 💡 提示和技巧

### 提示 1: 环境变量验证
```bash
# 快速验证所有必需的环境变量
node -e "require('dotenv').config(); console.log('Private Key:', process.env.PRIVATE_KEY ? '✅' : '❌'); console.log('RPC URL:', process.env.RPC_URL ? '✅' : '❌'); console.log('NUM_PAUSERS:', process.env.NUM_PAUSERS || '❌');"
```

### 提示 2: 部署日志保存
```bash
# 保存部署日志以便后续参考
npm run deploy:pauser | tee deploy-pauser.log
npm run deploy | tee deploy-main.log
```

### 提示 3: 快速配置检查
```javascript
// 在浏览器控制台运行
console.log('Config:', CONFIG);
console.log('Contract:', ConfigHelper.getContractAddress('main'));
console.log('Pausers:', ConfigHelper.getGatewayPausers());
```

---

## 🎯 下一步行动

### 今天
1. ✅ 复制 .env.example
2. ✅ 填写必需的配置
3. ✅ 运行 npm install

### 本周
1. ✅ 部署到测试网
2. ✅ 验证合约
3. ✅ 测试所有功能

### 下周
1. ✅ 部署到生产环境
2. ✅ 配置监控
3. ✅ 准备上线

---

**保存此文件以便快速参考!** 📌

**最后更新:** 2025-10-23
