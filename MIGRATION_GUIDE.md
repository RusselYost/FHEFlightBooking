# fhevm 重大变更迁移指南

## 概述

本文档描述了 fhevm 系统的重大变更,包括网关合约、KMS 生成和暂停器设置的更新。

## 主要变更

### 1. KMS 管理合约更名为 KMS 生成合约

**旧名称:**
- `KMSManagement` 合约
- 环境变量: `KMS_MANAGEMENT_ADDRESS`
- KMS 连接器变量: `KMS_CONNECTOR_KMS_MANAGEMENT_CONTRACT__ADDRESS`

**新名称:**
- `KMSGeneration` 合约
- 环境变量: `KMS_GENERATION_ADDRESS`
- KMS 连接器变量: `KMS_CONNECTOR_KMS_GENERATION_CONTRACT__ADDRESS`

**迁移步骤:**
1. 更新所有环境变量引用
2. 更新 Helm 图表中的 `values.yaml`:
   - `kmsManagement` → `kmsGeneration`

---

### 2. 新增 PauserSet 不可变合约

网关和主机合约现在通过新的 `PauserSet` 合约支持多个暂停器地址。

#### 网关合约的新环境变量:

```env
# 暂停器数量 = 已注册 KMS 节点数 + 已注册协处理器数
NUM_PAUSERS=2

# 暂停器地址 (从 0 开始索引)
PAUSER_ADDRESS_0=0xYourFirstPauserAddress
PAUSER_ADDRESS_1=0xYourSecondPauserAddress
# ... 根据 NUM_PAUSERS 添加更多地址
```

**过时的环境变量:**
- ❌ `PAUSER_ADDRESS` (单一暂停器地址)

#### 主机合约的新环境变量:

```env
# 主机合约的暂停器配置
HOST_NUM_PAUSERS=2
HOST_PAUSER_ADDRESS_0=0xYourFirstHostPauserAddress
HOST_PAUSER_ADDRESS_1=0xYourSecondHostPauserAddress
```

**过时的环境变量:**
- ❌ `PAUSER_ADDRESS` (单一暂停器地址)

**迁移步骤:**
1. 计算所需的暂停器数量: `NUM_PAUSERS = n_kms + n_copro`
2. 为每个暂停器创建 `PAUSER_ADDRESS_[0-N]` 环境变量
3. 移除旧的 `PAUSER_ADDRESS` 变量

---

### 3. 交易输入的重新随机化

**新功能:**
- 所有交易输入(包括来自状态的输入)在评估 FHE 操作之前都会重新加密
- 提供 **sIND-CPAD 安全性** (simulation-based Indistinguishability under Chosen-Plaintext Attack with Decryption)

**影响:**
- 此功能对用户**完全透明**
- 不需要代码更改
- 自动提供更强的安全保证

---

### 4. 网关合约 API 变更

#### 删除的函数 (Breaking Changes)

所有外部 `check...` 视图函数已被删除,替换为 `is...` 函数:

**旧 API (已删除):**
```solidity
// ❌ 这些函数不再可用
function checkPublicDecryptAllowed(...) external view
// 失败时会 revert,抛出 PublicDecryptNotAllowed 错误
```

**新 API (推荐使用):**
```solidity
// ✅ 使用这些新函数
function isPublicDecryptAllowed(...) external view returns (bool)
// 返回布尔值而不是 revert
```

#### 错误处理变更

- 相关错误已移至不同的合约或被删除
- 例如: `PublicDecryptNotAllowed` 错误已移至 `Decryption` 合约

**迁移步骤:**
1. 查找所有对 `check...` 函数的调用
2. 替换为对应的 `is...` 函数
3. 更新错误处理逻辑:
   ```solidity
   // 旧方式
   gateway.checkPublicDecryptAllowed(...);
   // 如果不允许会 revert

   // 新方式
   bool allowed = gateway.isPublicDecryptAllowed(...);
   if (!allowed) {
       revert("Public decrypt not allowed");
   }
   ```

---

## 完整的环境变量清单

### 网络配置
```env
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia.infura.io/v3/your_project_id
CHAIN_ID=11155111
```

### KMS 配置 (已更新)
```env
# 新变量名
KMS_GENERATION_ADDRESS=0xYourKMSGenerationContractAddress
KMS_CONNECTOR_KMS_GENERATION_CONTRACT_ADDRESS=0xYourKMSGenerationContractAddress

# ❌ 已过时 - 请勿使用
# KMS_MANAGEMENT_ADDRESS
# KMS_CONNECTOR_KMS_MANAGEMENT_CONTRACT__ADDRESS
```

### 网关配置
```env
GATEWAY_CONTRACT_ADDRESS=0xYourGatewayContractAddress
NUM_PAUSERS=2
PAUSER_ADDRESS_0=0xYourFirstPauserAddress
PAUSER_ADDRESS_1=0xYourSecondPauserAddress

# ❌ 已过时 - 请勿使用
# PAUSER_ADDRESS
```

### 主机配置
```env
HOST_CONTRACT_ADDRESS=0xYourHostContractAddress
HOST_NUM_PAUSERS=2
HOST_PAUSER_ADDRESS_0=0xYourFirstHostPauserAddress
HOST_PAUSER_ADDRESS_1=0xYourSecondHostPauserAddress
```

### 解密配置
```env
DECRYPTION_CONTRACT_ADDRESS=0xYourDecryptionContractAddress
```

---

## 智能合约更新建议

### 1. 更新导入语句
确保使用最新版本的 fhevm 库:
```solidity
import { FHE, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

### 2. 审查解密逻辑
如果你的合约使用了网关的解密功能,请:
- 检查是否使用了被删除的 `check...` 函数
- 更新为新的 `is...` 函数
- 调整错误处理逻辑

### 3. 安全性考虑
- 新的输入重新随机化功能自动提供额外的安全保证
- 无需修改代码即可享受 sIND-CPAD 安全性
- 审查暂停器地址配置以确保适当的访问控制

---

## 测试检查清单

在部署更新后的合约之前,请确保:

- [ ] 所有环境变量已更新为新名称
- [ ] `NUM_PAUSERS` 正确设置为 `n_kms + n_copro`
- [ ] 所有暂停器地址已正确配置
- [ ] 网关 API 调用已从 `check...` 更新为 `is...`
- [ ] 错误处理逻辑已相应更新
- [ ] 在测试网上完整测试所有功能
- [ ] 解密功能正常工作
- [ ] 暂停/恢复机制正常工作

---

## 故障排除

### 问题: 合约部署失败
**解决方案:** 检查是否使用了过时的环境变量名称

### 问题: 网关函数调用失败
**解决方案:** 确认已将 `check...` 函数替换为 `is...` 函数

### 问题: 暂停功能不工作
**解决方案:**
1. 验证 `NUM_PAUSERS` 设置正确
2. 确认所有 `PAUSER_ADDRESS_[N]` 变量已设置
3. 检查暂停器地址是否有正确的权限

---

## 其他资源

- [fhevm 官方文档](https://docs.zama.ai/fhevm)
- [Zama 开发者社区](https://community.zama.ai/)
- [GitHub Issues](https://github.com/zama-ai/fhevm/issues)

---

**最后更新:** 2025-10-23
**适用版本:** fhevm v0.5.0+
