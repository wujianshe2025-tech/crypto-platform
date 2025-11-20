/**
 * 预测投票 - 钱包连接和支付功能集成补丁
 * 
 * 使用方法：
 * 1. 在 index.html 的 <head> 中添加 Ethers.js:
 *    <script src="https://cdn.ethers.io/lib/ethers-5.2.umd.min.js"></script>
 * 
 * 2. 在导航栏右侧添加钱包连接按钮（替换"真实数据版"文字）:
 *    <div id="wallet-status" class="flex items-center gap-3">
 *        <button id="connect-wallet-btn" onclick="connectWallet()" 
 *                class="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
 *            连接钱包
 *        </button>
 *    </div>
 * 
 * 3. 将下面的代码添加到 <script> 标签中，替换原有的相关函数
 */

// ==================== 配置 ====================
const API_URL = 'http://localhost:3000'; // 后端API地址
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BSC主网USDT
const PLATFORM_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'; // 平台钱包地址

const USDT_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)'
];

// ==================== 全局变量 ====================
let currentUser = null; // 当前登录用户
let userToken = null; // JWT Token
let isMember = false; // 是否会员

// ==================== 钱包连接功能 ====================

/**
 * 连接MetaMask钱包
 */
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('请先安装MetaMask钱包！\n\n访问 https://metamask.io 下载安装');
        window.open('https://metamask.io/download/', '_blank');
        return;
    }

    try {
        // 显示加载状态
        document.getElementById('connect-wallet-btn').textContent = '连接中...';
        document.getElementById('connect-wallet-btn').disabled = true;

        // 1. 请求账户访问
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        const address = accounts[0];

        // 2. 生成签名消息
        const message = `欢迎登录追风观测\n\n时间: ${new Date().toISOString()}\n地址: ${address}`;
        
        // 3. 请求签名
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, address]
        });

        // 4. 发送到后端验证
        const response = await fetch(`${API_URL}/api/auth/wallet-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, message, signature })
        });

        const data = await response.json();

        if (data.success) {
            // 保存用户信息
            currentUser = data.user;
            userToken = data.token;
            isMember = data.user.isMember;

            // 保存到localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            // 更新UI
            updateWalletStatus();
            updateMemberStatus();

            alert('✅ 登录成功！');
        } else {
            throw new Error(data.error || '登录失败');
        }

    } catch (error) {
        console.error('连接钱包失败:', error);
        alert('连接失败: ' + error.message);
        
        // 恢复按钮状态
        document.getElementById('connect-wallet-btn').textContent = '连接钱包';
        document.getElementById('connect-wallet-btn').disabled = false;
    }
}

/**
 * 更新钱包状态显示
 */
function updateWalletStatus() {
    const walletStatus = document.getElementById('wallet-status');
    
    if (currentUser) {
        walletStatus.innerHTML = `
            <div class="flex items-center gap-3">
                ${isMember ? '<span class="px-3 py-1 bg-yellow-500 text-white text-sm rounded-full">⭐ 会员</span>' : ''}
                <div class="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span class="text-white">${currentUser.walletAddress.slice(0, 6)}...${currentUser.walletAddress.slice(-4)}</span>
                </div>
                <button onclick="logout()" class="text-gray-400 hover:text-white">退出</button>
            </div>
        `;
    } else {
        walletStatus.innerHTML = `
            <button id="connect-wallet-btn" onclick="connectWallet()" 
                    class="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                连接钱包
            </button>
        `;
    }
}

/**
 * 退出登录
 */
function logout() {
    currentUser = null;
    userToken = null;
    isMember = false;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    updateWalletStatus();
    updateMemberStatus();
    alert('已退出登录');
}

/**
 * 页面加载时检查登录状态
 */
function checkLoginStatus() {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        userToken = savedToken;
        isMember = currentUser.isMember;
        updateWalletStatus();
        updateMemberStatus();
    }
}

// ==================== 会员支付功能 ====================

/**
 * 成为会员 - 真实USDT支付
 */
async function becomeMember() {
    if (!currentUser) {
        alert('请先连接钱包登录！');
        closeMembershipModal();
        return;
    }

    if (isMember) {
        alert('你已经是会员了！');
        closeMembershipModal();
        return;
    }

    if (!confirm('确认支付 1 USDT 成为会员吗？\n\n支付将通过BSC网络进行')) {
        return;
    }

    try {
        // 显示支付进度
        const modalContent = document.querySelector('#membership-modal .bg-gray-800');
        const originalHTML = modalContent.innerHTML;
        
        modalContent.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">💳</div>
                <h3 class="text-xl font-bold mb-4">处理支付中...</h3>
                <div class="space-y-3 text-sm text-gray-400">
                    <div id="payment-step-1" class="flex items-center justify-center gap-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        <span>检查USDT余额...</span>
                    </div>
                    <div id="payment-step-2" class="flex items-center justify-center gap-2 opacity-50">
                        <div class="w-4 h-4"></div>
                        <span>发起转账...</span>
                    </div>
                    <div id="payment-step-3" class="flex items-center justify-center gap-2 opacity-50">
                        <div class="w-4 h-4"></div>
                        <span>等待区块链确认...</span>
                    </div>
                    <div id="payment-step-4" class="flex items-center justify-center gap-2 opacity-50">
                        <div class="w-4 h-4"></div>
                        <span>激活会员...</span>
                    </div>
                </div>
            </div>
        `;

        // 1. 初始化Web3
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);

        // 2. 检查余额
        const balance = await usdtContract.balanceOf(currentUser.walletAddress);
        const balanceFormatted = ethers.utils.formatUnits(balance, 18);
        
        document.getElementById('payment-step-1').innerHTML = `
            <span class="text-green-400">✓</span>
            <span>余额检查完成 (${parseFloat(balanceFormatted).toFixed(2)} USDT)</span>
        `;

        if (parseFloat(balanceFormatted) < 1) {
            throw new Error('USDT余额不足，至少需要 1 USDT');
        }

        // 3. 发起转账
        document.getElementById('payment-step-2').classList.remove('opacity-50');
        document.getElementById('payment-step-2').innerHTML = `
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span>请在MetaMask中确认交易...</span>
        `;

        const amount = ethers.utils.parseUnits('1', 18);
        const tx = await usdtContract.transfer(PLATFORM_ADDRESS, amount);

        document.getElementById('payment-step-2').innerHTML = `
            <span class="text-green-400">✓</span>
            <span>交易已发送</span>
        `;

        // 4. 等待确认
        document.getElementById('payment-step-3').classList.remove('opacity-50');
        document.getElementById('payment-step-3').innerHTML = `
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span>等待区块链确认...</span>
        `;

        const receipt = await tx.wait();

        document.getElementById('payment-step-3').innerHTML = `
            <span class="text-green-400">✓</span>
            <span>交易已确认 (区块 ${receipt.blockNumber})</span>
        `;

        // 5. 通知后端激活会员
        document.getElementById('payment-step-4').classList.remove('opacity-50');
        document.getElementById('payment-step-4').innerHTML = `
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span>激活会员中...</span>
        `;

        const response = await fetch(`${API_URL}/api/membership/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                txHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber
            })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('payment-step-4').innerHTML = `
                <span class="text-green-400">✓</span>
                <span>会员激活成功！</span>
            `;

            // 更新用户状态
            isMember = true;
            currentUser.isMember = true;
            localStorage.setItem('user', JSON.stringify(currentUser));

            // 显示成功消息
            setTimeout(() => {
                modalContent.innerHTML = `
                    <div class="text-center py-12">
                        <div class="text-6xl mb-4">🎉</div>
                        <h3 class="text-2xl font-bold mb-4">恭喜成为会员！</h3>
                        <p class="text-gray-400 mb-6">你现在可以创建预测和参与投票了</p>
                        <button onclick="closeMembershipModal(); updateMemberStatus();" 
                                class="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700">
                            开始使用
                        </button>
                    </div>
                `;
            }, 1000);

        } else {
            throw new Error(data.error || '激活失败');
        }

    } catch (error) {
        console.error('支付失败:', error);
        alert('支付失败: ' + error.message);
        closeMembershipModal();
    }
}

/**
 * 更新会员状态显示
 */
function updateMemberStatus() {
    const memberStatus = document.getElementById('member-status');
    if (memberStatus) {
        memberStatus.innerHTML = isMember ? 
            '<span class="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold">👑 会员</span>' : 
            '<button onclick="showMembershipModal()" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold">成为会员</button>';
    }

    // 更新会员提示
    const memberNotice = document.getElementById('member-notice');
    if (memberNotice) {
        memberNotice.style.display = isMember ? 'none' : 'block';
    }
}

// ==================== 预测功能集成 ====================

/**
 * 创建预测 - 集成后端API
 */
async function createPrediction() {
    if (!currentUser) {
        alert('请先连接钱包登录！');
        return;
    }

    if (!isMember) {
        showMembershipModal();
        return;
    }

    const title = document.getElementById('pred-title').value.trim();
    const description = document.getElementById('pred-desc').value.trim();
    
    if (!title) {
        alert('请输入预测标题');
        return;
    }

    const hasReward = document.getElementById('reward-toggle').textContent.includes('有奖');
    const rewardPerPerson = hasReward ? parseInt(document.querySelector('.reward-btn.bg-blue-600')?.textContent || '2') : 0;

    try {
        const response = await fetch(`${API_URL}/api/predictions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                title,
                description,
                options: ['能突破', '不能突破'], // 默认两个选项
                hasReward,
                rewardPerPerson,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ 预测创建成功！');
            document.getElementById('pred-title').value = '';
            document.getElementById('pred-desc').value = '';
            toggleCreatePrediction();
            loadPredictions(); // 重新加载预测列表
        } else {
            throw new Error(data.error || '创建失败');
        }

    } catch (error) {
        console.error('创建预测失败:', error);
        alert('创建失败: ' + error.message);
    }
}

/**
 * 投票 - 集成后端API和USDT支付
 */
async function votePrediction(predId, optionIndex) {
    if (!currentUser) {
        alert('请先连接钱包登录！');
        return;
    }

    if (!isMember) {
        showMembershipModal();
        return;
    }

    // 获取预测信息
    const prediction = predictions.find(p => p.id === predId);
    if (!prediction) {
        alert('预测不存在');
        return;
    }

    // 检查是否已投票
    if (prediction.userVoted) {
        alert('你已经投过票了！');
        return;
    }

    const hasReward = prediction.rewardPool > 0;
    const rewardAmount = prediction.rewardPerPerson || 0;

    if (hasReward && !confirm(`此预测需要投注 ${rewardAmount} USDT\n\n确认投票吗？`)) {
        return;
    }

    try {
        let txHash = null;

        // 如果是有奖预测，需要先支付
        if (hasReward && rewardAmount > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);

            // 检查余额
            const balance = await usdtContract.balanceOf(currentUser.walletAddress);
            const balanceFormatted = ethers.utils.formatUnits(balance, 18);

            if (parseFloat(balanceFormatted) < rewardAmount) {
                alert(`USDT余额不足\n\n需要: ${rewardAmount} USDT\n当前: ${parseFloat(balanceFormatted).toFixed(2)} USDT`);
                return;
            }

            // 发起转账
            const amount = ethers.utils.parseUnits(rewardAmount.toString(), 18);
            const tx = await usdtContract.transfer(PLATFORM_ADDRESS, amount);
            const receipt = await tx.wait();
            txHash = receipt.transactionHash;
        }

        // 提交投票到后端
        const response = await fetch(`${API_URL}/api/predictions/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                predictionId: predId,
                optionIndex,
                amount: rewardAmount,
                txHash
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ 投票成功！');
            loadPredictions(); // 重新加载预测列表
        } else {
            throw new Error(data.error || '投票失败');
        }

    } catch (error) {
        console.error('投票失败:', error);
        alert('投票失败: ' + error.message);
    }
}

/**
 * 从后端加载预测列表
 */
async function loadPredictions() {
    try {
        const response = await fetch(`${API_URL}/api/predictions`);
        const data = await response.json();

        if (data.success) {
            predictions = data.data.map(pred => ({
                id: pred._id,
                title: pred.title,
                description: pred.description,
                creator: pred.creatorId.username,
                options: pred.options.map(opt => ({
                    text: opt.text,
                    votes: opt.votes.length
                })),
                rewardPool: pred.totalPool || 0,
                rewardPerPerson: pred.rewardPerPerson || 0,
                deadline: pred.deadline,
                userVoted: currentUser && pred.options.some(opt => opt.votes.includes(currentUser.id))
            }));

            renderPredictions();
        }
    } catch (error) {
        console.error('加载预测失败:', error);
    }
}

// ==================== 初始化 ====================

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 如果已登录，加载预测列表
    if (currentUser) {
        loadPredictions();
    }
});

// 监听账户变化
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', function(accounts) {
        if (accounts.length === 0) {
            logout();
        } else if (currentUser && accounts[0].toLowerCase() !== currentUser.walletAddress.toLowerCase()) {
            alert('检测到账户切换，请重新登录');
            logout();
        }
    });
}

console.log('✅ 预测投票 - 钱包支付功能已加载');
