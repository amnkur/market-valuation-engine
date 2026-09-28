# Contributing to Market Valuation Engine

Thank you for your interest in contributing to the **Market Valuation Engine**! 

To maintain project stability, financial model integrity, and code quality, all contributions follow a strict **Pull Request (PR) workflow**. Direct pushes to the `main` branch are disabled.

---

## 🔒 Merge & Approval Policy

> **MANDATORY APPROVAL REQUIRED:**  
> Every Pull Request **must be reviewed and approved by repository owner [@amnkur](https://github.com/amnkur)** before it can be merged into `main`. PRs without explicit owner approval cannot be merged under any circumstance.

---

## 🛠️ Step-by-Step Contribution Workflow

### 1. Fork & Clone
1. Fork the repository on GitHub: `https://github.com/amnkur/market-valuation-engine`
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/market-valuation-engine.git
   cd market-valuation-engine
   ```
3. Set upstream remote:
   ```bash
   git remote add upstream https://github.com/amnkur/market-valuation-engine.git
   ```

### 2. Create a Feature Branch
Never make changes directly on `main`. Create a new topic branch with a descriptive name:
```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description
```

### 3. Local Verification & Testing
Before committing your work, verify that all components compile and execute properly:

- **Frontend Build Test:**
  ```bash
  cd market-valuation-engine
  npm run build
  cd ..
  ```
  Ensure the Vite build completes with zero errors.

- **Backend Validation:**
  ```bash
  python check_stock.py NVDA
  python check_stock.py TARIL
  ```
  Ensure the CLI and financial valuation calculations run cleanly.

- **Zero-Leak Security Audit:**
  - Verify that no API keys, private credentials, or personal secrets are added.
  - Check `git status` to ensure temporary files, `node_modules`, or build output (`dist/`) are not staged.

### 4. Commit Guidelines
Write clean, concise commit messages following standard conventional commit style:
```bash
git commit -m "feat: add multi-factor liquidity indicator"
# or
git commit -m "fix: resolve ticker symbol formatting in modal"
```

### 5. Submit a Pull Request
1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of `amnkur/market-valuation-engine`.
3. Complete the PR template checklist.
4. GitHub's `CODEOWNERS` configuration will automatically assign review to `@amnkur`.
5. Address any review comments or feedback requested during review.
6. Once approved by `@amnkur`, the PR will be merged.

---

## 📜 Code of Conduct
Please ensure all discussions, code reviews, and interactions remain constructive, respectful, and focused on building robust quantitative tools.
