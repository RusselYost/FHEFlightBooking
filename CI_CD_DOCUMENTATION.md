# CI/CD Pipeline Documentation

## Overview

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Confidential Flight Booking platform.

## Table of Contents

1. [Pipeline Architecture](#pipeline-architecture)
2. [GitHub Actions Workflow](#github-actions-workflow)
3. [Code Quality Checks](#code-quality-checks)
4. [Automated Testing](#automated-testing)
5. [Code Coverage](#code-coverage)
6. [Security Auditing](#security-auditing)
7. [Build Verification](#build-verification)
8. [Configuration](#configuration)

---

## Pipeline Architecture

### Trigger Events

The CI/CD pipeline runs automatically on:
- **Push to main branch**
- **Push to develop branch**
- **All pull requests** to main or develop

### Multi-Version Testing

Tests run across multiple Node.js versions:
- Node.js 18.x (LTS)
- Node.js 20.x (Latest LTS)

---

## GitHub Actions Workflow

### File Location
`.github/workflows/test.yml`

### Jobs Overview

| Job | Purpose | Node Versions | Dependencies |
|-----|---------|---------------|--------------|
| **solidity-lint** | Code quality analysis | 20.x | Solhint |
| **contract-tests** | Smart contract testing | 18.x, 20.x | Hardhat, Mocha, Chai |
| **frontend-tests** | Frontend testing | 18.x, 20.x | Next.js, TypeScript |
| **build-check** | Build verification | 20.x | All jobs |
| **security-audit** | Dependency security | 20.x | npm audit |
| **test-summary** | Results aggregation | 20.x | All jobs |

### Workflow Diagram

```
┌─────────────────────────────────────────┐
│          Trigger (push/PR)              │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼───────┐  ┌──────▼──────┐
│ Solidity Lint │  │ Security    │
│               │  │ Audit       │
└───────┬───────┘  └──────┬──────┘
        │                 │
        │  ┌──────────────┴──────────────┐
        │  │                             │
┌───────▼──▼────────┐         ┌──────────▼─────────┐
│ Contract Tests    │         │ Frontend Tests     │
│ (Node 18.x, 20.x) │         │ (Node 18.x, 20.x)  │
└────────┬──────────┘         └──────────┬─────────┘
         │                               │
         └────────────┬──────────────────┘
                      │
              ┌───────▼────────┐
              │ Build Check    │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │ Test Summary   │
              └────────────────┘
```

---

## Code Quality Checks

### Solhint Configuration

**File:** `.solhint.json`

#### Enabled Rules

##### Compiler & Syntax
- `compiler-version`: Enforce Solidity ^0.8.24
- `constructor-syntax`: Modern constructor syntax
- `quotes`: Double quotes required

##### Naming Conventions
- `contract-name-camelcase`: CamelCase for contracts
- `event-name-camelcase`: CamelCase for events
- `func-name-mixedcase`: mixedCase for functions
- `modifier-name-mixedcase`: mixedCase for modifiers
- `private-vars-leading-underscore`: Private variables start with `_`

##### Code Quality
- `code-complexity`: Max complexity 10
- `function-max-lines`: Max 50 lines per function
- `max-states-count`: Max 15 state variables
- `no-empty-blocks`: Disallow empty blocks
- `no-unused-vars`: Warn on unused variables

##### Security
- `check-send-result`: Check return value of send()
- `avoid-suicide`: Disallow selfdestruct
- `avoid-throw`: Disallow throw
- `payable-fallback`: Enforce payable fallback

##### Gas Optimization
- `avoid-low-level-calls`: Warn on low-level calls
- `avoid-sha3`: Prefer keccak256 over sha3

#### Running Solhint

```bash
# Lint all contracts
npm run lint

# Auto-fix issues
npm run lint:fix

# Direct solhint command
npx solhint 'contracts/**/*.sol'
```

#### Example Output

```
contracts\ConfidentialFlightBooking.sol
   20:1   warning  Missing @author tag in contract
   82:9   warning  Use Custom Errors instead of require statements
  112:5   warning  Missing @param tag in function
  305:46  warning  For [ i ] variable, increment/decrement by 1 using: [ ++variable ]

✖ 124 warnings (0 errors)
```

---

## Automated Testing

### Contract Tests

#### Configuration
- **Framework:** Hardhat 2.26.0
- **Test Runner:** Mocha 11.7.1
- **Assertions:** Chai 4.5.0
- **Config:** `hardhat.config.deploy.cts`

#### Test Execution

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Run specific test file
npx hardhat test test/ConfidentialFlightBooking.test.cjs
```

#### CI Test Command

```bash
npx hardhat test --config hardhat.config.deploy.cts
```

#### Test Matrix

| Node Version | OS | Status |
|--------------|-----|--------|
| 18.x | ubuntu-latest | ✅ Tested |
| 20.x | ubuntu-latest | ✅ Tested |

### Frontend Tests

#### Configuration
- **Framework:** Next.js 14.2
- **Type Checking:** TypeScript 5.4.5
- **Build Tool:** Next.js built-in

#### Test Execution

```bash
cd frontend

# Type checking
npm run type-check

# Build test
npm run build

# Lint
npm run lint
```

---

## Code Coverage

### Codecov Integration

**File:** `codecov.yml`

#### Coverage Targets

| Metric | Target | Threshold |
|--------|--------|-----------|
| Project Coverage | 70% | ±5% |
| Patch Coverage | 80% | ±10% |

#### Configuration

```yaml
coverage:
  precision: 2
  range: "70...100"

  status:
    project:
      target: 70%
      threshold: 5%

    patch:
      target: 80%
      threshold: 10%
```

#### Flags

- **smart-contracts**: Coverage for contracts/ directory
- Carryforward enabled for consistent reporting

#### Upload Process

Coverage reports are automatically uploaded to Codecov on:
- ✅ Node.js 20.x builds only (to avoid duplicates)
- ✅ After successful test execution
- ✅ With smart-contracts flag

#### Viewing Coverage

1. **Local:**
   ```bash
   npm run coverage
   open coverage/index.html
   ```

2. **Codecov Dashboard:**
   - Visit: https://codecov.io/gh/[username]/[repo]
   - View coverage trends, file-level coverage, and PRs

#### Ignored Files

```
- node_modules
- test/
- scripts/
- deployments/
- frontend/
- *.config.js/ts/cts
```

---

## Security Auditing

### npm audit

#### Audit Levels
- **Moderate:** Warnings for moderate vulnerabilities
- **High:** Errors for high/critical vulnerabilities

#### Audit Execution

```bash
# Root dependencies
npm audit --audit-level=moderate

# Frontend dependencies
cd frontend && npm audit --audit-level=moderate
```

#### CI Behavior
- ⚠️ Continues on error (non-blocking)
- Outputs vulnerability report
- Does not fail build for audit issues

### Future Enhancements

Planned security additions:
- [ ] Slither static analysis
- [ ] Mythril security scanning
- [ ] Dependency vulnerability tracking
- [ ] SPDX license compliance

---

## Build Verification

### Build Check Job

Verifies that the entire project builds successfully:

1. **Install Dependencies**
   - Root: `npm ci`
   - Frontend: `cd frontend && npm ci`

2. **Compile Contracts**
   ```bash
   npx hardhat compile --config hardhat.config.deploy.cts
   ```

3. **Build Frontend**
   ```bash
   cd frontend && npm run build
   ```

4. **Check Artifact Sizes**
   ```bash
   du -sh artifacts/
   du -sh frontend/.next/
   ```

### Build Artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| Contract artifacts | `artifacts/` | Compiled contracts |
| TypeChain types | `typechain-types/` | Contract type definitions |
| Frontend build | `frontend/.next/` | Production-ready Next.js app |

---

## Configuration

### Environment Variables

#### Required for CI

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect integration | Yes (or dummy for CI) |

#### GitHub Secrets Setup

1. Go to: `Repository Settings → Secrets and variables → Actions`
2. Add secrets:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `CODECOV_TOKEN` (optional, for private repos)

### Package Scripts

#### Root (package.json)

```json
{
  "compile": "hardhat compile --config hardhat.config.deploy.cts",
  "test": "hardhat test --config hardhat.config.deploy.cts",
  "test:coverage": "hardhat coverage --config hardhat.config.deploy.cts",
  "coverage": "hardhat coverage --config hardhat.config.deploy.cts",
  "lint": "solhint 'contracts/**/*.sol'",
  "lint:fix": "solhint 'contracts/**/*.sol' --fix",
  "ci": "npm run lint && npm run compile && npm run test"
}
```

#### Frontend (frontend/package.json)

```json
{
  "dev": "next dev -p 1381",
  "build": "next build",
  "start": "next start -p 1381",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

---

## Running CI/CD Locally

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Full CI Simulation

```bash
# Step 1: Code quality
npm run lint

# Step 2: Compile
npm run compile

# Step 3: Test
npm test

# Step 4: Coverage
npm run coverage

# Step 5: Frontend type check
cd frontend && npm run type-check

# Step 6: Frontend build
cd frontend && npm run build

# Step 7: Security audit
npm audit --audit-level=moderate
```

### Quick CI Check

```bash
npm run ci
```

---

## Troubleshooting

### Common Issues

#### 1. Solhint Not Found

**Error:** `solhint: command not found`

**Solution:**
```bash
npm install --save-dev solhint solhint-plugin-prettier --legacy-peer-deps
```

#### 2. Hardhat Config Not Found

**Error:** `Cannot find hardhat.config.deploy.cts`

**Solution:**
Ensure all test commands use:
```bash
--config hardhat.config.deploy.cts
```

#### 3. Frontend Build Fails

**Error:** `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined`

**Solution:**
Set environment variable or use dummy value:
```bash
export NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=dummy-project-id-for-ci
npm run build
```

#### 4. Coverage Upload Fails

**Error:** `Codecov token not found`

**Solution:**
- Public repos: No token needed
- Private repos: Add `CODECOV_TOKEN` to GitHub secrets

---

## Best Practices

### Commit Messages

Follow Conventional Commits:
```
feat: add new flight booking feature
fix: resolve booking confirmation bug
docs: update CI/CD documentation
test: add edge case tests for cancellations
chore: update dependencies
ci: add Codecov integration
```

### Pull Request Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-booking-flow
   ```

2. **Run Local CI**
   ```bash
   npm run ci
   ```

3. **Push and Create PR**
   ```bash
   git push origin feature/new-booking-flow
   ```

4. **Wait for CI**
   - ✅ All checks must pass
   - Review coverage report
   - Address lint warnings

5. **Merge**
   - Squash commits
   - Delete branch after merge

### Branch Protection

Recommended settings for `main` branch:
- ✅ Require pull request reviews
- ✅ Require status checks to pass
  - solidity-lint
  - contract-tests (18.x, 20.x)
  - frontend-tests (18.x, 20.x)
  - build-check
- ✅ Require branches to be up to date
- ✅ Require linear history

---

## Performance Metrics

### CI/CD Pipeline Stats

| Metric | Target | Current |
|--------|--------|---------|
| Average build time | < 5 min | ~3 min |
| Test execution | < 2 min | ~1 sec |
| Frontend build | < 2 min | ~45 sec |
| Total pipeline | < 8 min | ~5 min |

### Optimization Tips

1. **Cache Dependencies**
   - GitHub Actions caches npm packages
   - Speeds up subsequent runs

2. **Parallel Jobs**
   - Lint and tests run concurrently
   - Reduces total pipeline time

3. **Conditional Jobs**
   - Build-check only runs if tests pass
   - Saves resources on failing builds

---

## Monitoring and Alerts

### GitHub Actions Dashboard

View workflow runs:
```
Repository → Actions → CI/CD Pipeline
```

### Notifications

Configure notifications in:
```
GitHub Settings → Notifications → Actions
```

Options:
- ✅ Failed workflows only
- ✅ All workflows
- ✅ Disable

---

## Future Improvements

### Planned Enhancements

1. **Deployment Automation**
   - [ ] Auto-deploy to Sepolia on merge to develop
   - [ ] Auto-deploy to mainnet on release tags

2. **Advanced Testing**
   - [ ] Gas usage benchmarking
   - [ ] Invariant testing with Echidna
   - [ ] Formal verification

3. **Code Quality**
   - [ ] ESLint for JavaScript/TypeScript
   - [ ] Prettier auto-formatting
   - [ ] Commit message linting

4. **Monitoring**
   - [ ] Contract monitoring on-chain
   - [ ] Frontend performance metrics
   - [ ] Error tracking (Sentry)

5. **Documentation**
   - [ ] Auto-generate API docs
   - [ ] Contract documentation from NatSpec
   - [ ] Changelog automation

---

## Resources

### Documentation Links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Codecov Documentation](https://docs.codecov.com/)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)

### Tools

- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)
- [Hardhat Gas Reporter](https://www.npmjs.com/package/hardhat-gas-reporter)
- [Solidity Coverage](https://www.npmjs.com/package/solidity-coverage)

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
**Status:** ✅ Production Ready
