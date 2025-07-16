# ConfidentialFlightBooking - fhevm v0.5.0 升级说明

## 📋 概述

本项目已更新以支持 fhevm v0.5.0 的重大变更,包括:

1. **KMS 管理合约重命名** - `KMSManagement` → `KMSGeneration`
2. **新增 PauserSet 合约** - 支持多个暂停器地址
3. **网关 API 重大变更** - `check...` 函数替换为 `is...` 函数
4. **交易输入重新随机化** - 自动提供 sIND-CPAD 安全性

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例配置文件:

```bash
cp .env.example .env
```

然后编辑 `.env` 文件,填入你的配置:

```env
# 网络配置
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key

# KMS 生成合约 (新命名)
KMS_GENERATION_ADDRESS=0xYourKMSGenerationContractAddress

# 网关合约
GATEWAY_CONTRACT_ADDRESS=0xYourGatewayContractAddress

# 暂停器配置
NUM_PAUSERS=2
PAUSER_ADDRESS_0=0xYourFirstPauserAddress
PAUSER_ADDRESS_1=0xYourSecondPauserAddress
```

### 3. 编译合约

```bash
npm run compile
```

### 4. 部署合约

按顺序部署:

```bash
# 1. 部署 PauserSet 合约
npm run deploy:pauser

# 2. 部署主合约
npm run deploy

# 或一次性部署所有合约
npm run deploy:all
```

### 5. 更新前端配置

在 `public/config.js` 中更新部署的合约地址:

```javascript
const CONFIG = {
    CONTRACT_ADDRESS: "0xYourDeployedContractAddress",
    // ... 其他配置
};
```

---

## 📁 项目结构

```
 
├── contracts/
│   ├── ConfidentialFlightBooking.sol    # 主合约
│   └── PauserSet.sol                     # 暂停器管理合约
├── scripts/
│   ├── deploy.js                         # 主合约部署脚本
│   └── deploy-pauser.js                  # PauserSet 部署脚本
├── public/
│   ├── index.html                        # 前端页面
│   ├── app.js                            # 应用逻辑
│   └── config.js                         # 前端配置
├── .env.example                          # 环境变量示例
├── hardhat.config.js                     # Hardhat 配置
├── MIGRATION_GUIDE.md                    # 迁移指南
└── UPGRADE_NOTES.md                      # 本文件
```

---

## 🔑 重要变更详解

### 1. KMS 管理合约重命名

**之前:**
```env
KMS_MANAGEMENT_ADDRESS=0x...
KMS_CONNECTOR_KMS_MANAGEMENT_CONTRACT__ADDRESS=0x...
```

**现在:**
```env
KMS_GENERATION_ADDRESS=0x...
KMS_CONNECTOR_KMS_GENERATION_CONTRACT__ADDRESS=0x...
```

**影响:**
- 所有引用 KMS 管理合约的地方需要更新
- Helm 图表配置中 `kmsManagement` → `kmsGeneration`

---

### 2. PauserSet 合约

**新功能:**
- 支持多个暂停器地址(KMS 节点 + 协处理器)
- 不可变合约,部署后不能修改暂停器列表
- 提供 O(1) 的暂停器验证

**配置公式:**
```
NUM_PAUSERS = n_kms + n_copro
```
其中:
- `n_kms` = 已注册的 KMS 节点数量
- `n_copro` = 已注册的协处理器数量

**合约 API:**
```solidity
// 检查地址是否为授权暂停器
function isAuthorizedPauser(address _address) external view returns (bool)

// 获取所有暂停器地址
function getAllPausers() external view returns (address[] memory)

// 获取暂停器数量
function getPauserCount() external view returns (uint256)
```

**使用示例:**

在你的合约中继承 `Pausable`:

```solidity
import "./PauserSet.sol";

contract YourContract is Pausable {
    constructor(address _pauserSet) Pausable(_pauserSet) {
        // 你的初始化代码
    }

    function yourFunction() external whenNotPaused {
        // 只有在未暂停时才能执行
    }
}
```

---

### 3. 网关 API 变更

**重大变更:**

所有 `check...` 视图函数已被删除,替换为返回布尔值的 `is...` 函数。

**之前 (已移除):**
```solidity
// ❌ 这个函数不再可用
gateway.checkPublicDecryptAllowed(ciphertext);
// 如果不允许会 revert,抛出 PublicDecryptNotAllowed 错误
```

**现在 (推荐使用):**
```solidity
// ✅ 使用新的 is... 函数
bool allowed = gateway.isPublicDecryptAllowed(ciphertext);
if (!allowed) {
    revert("Public decrypt not allowed");
}
```

**错误处理变更:**
- `PublicDecryptNotAllowed` 错误已从 Gateway 合约移至 Decryption 合约
- 所有相关事件已被删除

**迁移清单:**
- [ ] 查找所有 `gateway.check...` 调用
- [ ] 替换为 `gateway.is...` 调用
- [ ] 添加适当的错误处理
- [ ] 更新错误导入语句

---

### 4. 交易输入重新随机化

**新安全特性:**

所有交易输入(包括来自状态的输入)在评估 FHE 操作之前都会自动重新加密。

**安全保证:**
- 提供 **sIND-CPAD 安全性** (simulation-based Indistinguishability under Chosen-Plaintext Attack with Decryption)
- 防止通过重放攻击推断密文内容
- 增强隐私保护

**开发者影响:**
- ✅ **完全透明** - 无需修改代码
- ✅ **自动启用** - fhevm 自动处理
- ✅ **性能影响极小** - 优化的重新加密过程

**技术细节:**
```solidity
// 示例:预订航班时的加密数据
euint32 encryptedPassport = FHE.asEuint32(_passportNumber);
euint16 encryptedAge = FHE.asEuint16(_age);

// fhevm 会在内部自动重新随机化这些输入
// 开发者无需任何额外操作
```

---

## 🧪 测试

### 运行测试

```bash
npm test
```

### 测试清单

- [ ] PauserSet 合约部署和初始化
- [ ] 多个暂停器地址验证
- [ ] 暂停/恢复功能
- [ ] 航班添加和预订
- [ ] 加密数据处理
- [ ] 网关 API 集成
- [ ] 取消预订和退款

---

## 🔐 安全考虑

### 暂停器配置

1. **验证暂停器地址**
   - 确保所有暂停器地址正确
   - 验证每个地址对应的实体(KMS 或协处理器)

2. **计算 NUM_PAUSERS**
   ```
   NUM_PAUSERS = 已注册 KMS 节点数 + 已注册协处理器数
   ```

3. **地址安全**
   - 使用硬件钱包管理暂停器私钥
   - 定期审计暂停器权限
   - 保持暂停器列表最新

### 加密最佳实践

1. **客户端加密**
   - 在发送到区块链之前加密敏感数据
   - 使用 fhevm 提供的加密库

2. **权限管理**
   - 正确配置 FHE.allow() 权限
   - 限制解密权限仅给授权用户

3. **数据验证**
   - 验证加密输入的有效性
   - 实施业务逻辑检查

---

## 📊 性能优化

### Gas 优化

1. **合约优化**
   - 启用 Solidity 优化器 (已配置)
   - 使用 viaIR 优化 (已启用)

2. **批量操作**
   - 尽可能批量处理多个操作
   - 减少链上交互次数

3. **存储优化**
   - 使用紧凑的数据结构
   - 避免不必要的状态变量

---

## 🐛 故障排除

### 常见问题

#### 1. 部署 PauserSet 失败

**错误:** `PauserSet: At least one pauser required`

**解决方案:**
- 检查 `.env` 文件中的 `NUM_PAUSERS` 配置
- 确保所有 `PAUSER_ADDRESS_[N]` 变量已设置

#### 2. 网关函数调用失败

**错误:** `Function not found: checkPublicDecryptAllowed`

**解决方案:**
- 更新为新的 `isPublicDecryptAllowed` 函数
- 参考 MIGRATION_GUIDE.md 中的 API 变更说明

#### 3. KMS 连接失败

**错误:** `KMS_MANAGEMENT_ADDRESS not found`

**解决方案:**
- 更新环境变量为 `KMS_GENERATION_ADDRESS`
- 检查 Helm 配置是否使用 `kmsGeneration`

#### 4. 暂停功能不工作

**解决方案:**
1. 验证 PauserSet 合约已正确部署
2. 检查暂停器地址配置
3. 确认调用者地址在暂停器列表中

---

## 📚 相关文档

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - 完整的迁移指南
- [fhevm 官方文档](https://docs.zama.ai/fhevm)
- [Zama 社区](https://community.zama.ai/)

---

## 🤝 贡献

欢迎贡献!请查看项目的贡献指南。

---

## 📄 许可证

MIT License

---

## 📞 支持

如果遇到问题:

1. 查看 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
2. 检查 [GitHub Issues](https://github.com/RusselYost/ConfidentialFlightBooking/issues)
3. 访问 [Zama 社区论坛](https://community.zama.ai/)

---

**最后更新:** 2025-10-23
**fhevm 版本:** v0.5.0
**合约版本:** 2.0.0
