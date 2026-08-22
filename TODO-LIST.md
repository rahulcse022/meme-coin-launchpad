Here's a more polished and professional version of your requirements:

---

### Blockchain Token Generator – Required Features (All Supported Networks)

Implement the following functionality across all supported blockchain networks:

1. **Automatic Contract Verification**

   * On the **Create Token** page (`http://localhost:3000/create`), if the user enables the **"Verify on Block Explorer"** option, the deployed smart contract must be **automatically verified** on the respective blockchain explorer (e.g., Etherscan, BscScan, PolygonScan, SnowTrace, Tronscan, etc.) immediately after deployment.

2. **Conditional Minting Support**

   * Only include the **minting functionality** if the user enables the **"Enable Minting"** option.
   * When enabled:

     * The generated smart contract must include a secure `mint` function.
     * The frontend application must display a **Mint Tokens** interface that allows the token owner (or authorized account) to mint new tokens.
   * When disabled:

     * Do **not** include any minting logic in either the smart contract or the frontend UI.

3. **Conditional Burning Support**

   * Only include the **burning functionality** if the user enables the **"Enable Burning"** option.
   * When enabled:

     * The generated smart contract must include a `burn` function.
     * The frontend application must display a **Burn Tokens** interface that allows eligible users to burn tokens.
   * When disabled:

     * Do **not** include any burning logic in either the smart contract or the frontend UI.

4. **Conditional Custom Token Allocation**

   * The **"Configure Custom Token Allocations"** feature is supported **only for EVM-compatible networks and the Tron blockchain**. It is **not supported on Solana**.
   * If the user enables this option:

     * Generate a smart contract that includes the allocation configuration logic (e.g., predefined wallets and token distribution).
   * If the user does not enable this option:

     * Generate a standard token contract without any allocation-related code.
   * To keep the contracts clean and optimized, maintain **two separate smart contract templates**:

     * **Standard Token Contract** (without custom allocations)
     * **Allocation-Enabled Token Contract** (with custom allocation functionality)
   * During deployment, automatically select and deploy the appropriate contract template based on the user's selection.
