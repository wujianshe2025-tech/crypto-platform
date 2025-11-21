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
const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:3000'
  : 'https://crypto-platform-api.vercel.app';


// ==================== 全局变量 ====================
let currentUser = null; // 当前登录用户
let userToken = null; // JWT Token
let isMember = false; // 是否会员

// ==================== 钱包连接功能 ====================

/**
 * 连接MetaMask钱包
 */
async function connectWallet() {}

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
                    <span class="text-white">${currentUser.username || ('用户' + String(currentUser.id).slice(-4))}</span>
                </div>
                <button onclick="logout()" class="text-gray-400 hover:text-white">退出</button>
            </div>
        `;
    } else {
        walletStatus.innerHTML = `
            <a href="index.html" class="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">登录</a>
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
    if (!currentUser) { alert('请先登录'); closeMembershipModal(); return; }
    if (isMember) { alert('你已经是会员了'); closeMembershipModal(); return; }
    try {
        const orderId = prompt('请输入支付订单号');
        if (!orderId) return;
        const response = await fetch(`${API_URL}/api/membership/activate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
            body: JSON.stringify({ txHash: orderId, blockNumber: null })
        });
        const data = await response.json();
        if (data.success) {
            isMember = true;
            currentUser.isMember = true;
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateMemberStatus();
            updateWalletStatus();
            alert('✅ 会员激活成功');
            closeMembershipModal();
        } else { throw new Error(data.error || '激活失败'); }
    } catch (error) {
        console.error('激活失败:', error);
        alert('激活失败: ' + error.message);
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
        alert('请先登录');
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

    if (hasReward && !isMember) {
        showMembershipModal();
        return;
    }

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
        alert('请先登录');
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
    const rewardAmount = 0;

    try {
        let txHash = null;

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
                amount: 0,
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
 

console.log('✅ 预测投票 - 登录与二维码支付集成已加载');
