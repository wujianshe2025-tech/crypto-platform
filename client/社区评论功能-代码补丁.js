// ==========================================
// 社区论坛功能 - 带评论系统
// ==========================================

// 社区帖子数据（使用localStorage持久化）
let posts = JSON.parse(localStorage.getItem('community_posts') || '[]');

// 如果没有数据，添加一些示例帖子
if (posts.length === 0) {
    posts = [
        {
            id: Date.now() - 3600000,
            user: '加密老韭菜',
            content: '刚刚抄底了一些ETH，感觉2300是个不错的入场点位。大家怎么看？',
            likes: 3,
            likedBy: [],
            comments: [
                { id: 1, user: '币圈新手', content: '我也想买，但是怕继续跌', time: '1小时前' },
                { id: 2, user: '技术分析师', content: '从技术面看，这个位置确实有支撑', time: '30分钟前' }
            ],
            time: new Date(Date.now() - 3600000).toLocaleString('zh-CN')
        },
        {
            id: Date.now() - 7200000,
            user: 'DeFi玩家',
            content: '最近在研究Solana上的新项目，收益率真的很香！有没有一起的？',
            likes: 2,
            likedBy: [],
            comments: [
                { id: 1, user: '风险厌恶者', content: '注意风险，很多项目都是土狗', time: '2小时前' }
            ],
            time: new Date(Date.now() - 7200000).toLocaleString('zh-CN')
        }
    ];
    localStorage.setItem('community_posts', JSON.stringify(posts));
}

// 渲染帖子列表
function renderPosts() {
    const postsContainer = document.getElementById('posts-list');
    if (!postsContainer) return;
    
    postsContainer.innerHTML = posts.map(post => `
        <div class="bg-gray-800 rounded-lg p-6">
            <!-- 帖子头部 -->
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                    ${post.user[0].toUpperCase()}
                </div>
                <div class="ml-3">
                    <div class="font-semibold">${post.user}</div>
                    <div class="text-sm text-gray-400">${post.time}</div>
                </div>
            </div>

            <!-- 帖子内容 -->
            <p class="text-gray-200 mb-4 whitespace-pre-wrap">${post.content}</p>

            <!-- 互动按钮 -->
            <div class="flex items-center space-x-6 text-gray-400 border-t border-gray-700 pt-4">
                <button 
                    onclick="toggleLike(${post.id})" 
                    class="flex items-center space-x-2 hover:text-blue-400 transition ${post.likedBy.includes('current-user') ? 'text-blue-400' : ''}"
                >
                    <span>${post.likedBy.includes('current-user') ? '👍' : '👍🏻'}</span>
                    <span>${post.likes}</span>
                </button>
                <button 
                    onclick="toggleComments(${post.id})" 
                    class="flex items-center space-x-2 hover:text-blue-400 transition"
                >
                    <span>💬</span>
                    <span>${post.comments.length}</span>
                </button>
                <button class="flex items-center space-x-2 hover:text-blue-400 transition">
                    <span>🔗</span>
                    <span>分享</span>
                </button>
            </div>

            <!-- 评论区域 -->
            <div id="comments-${post.id}" class="hidden mt-4 border-t border-gray-700 pt-4">
                <!-- 评论列表 -->
                <div class="space-y-3 mb-4">
                    ${post.comments.map(comment => `
                        <div class="bg-gray-700 rounded-lg p-3">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-semibold text-sm">${comment.user}</span>
                                <span class="text-xs text-gray-400">${comment.time}</span>
                            </div>
                            <p class="text-gray-300 text-sm">${comment.content}</p>
                        </div>
                    `).join('')}
                </div>

                <!-- 评论输入框 -->
                <div class="flex space-x-2">
                    <input 
                        type="text" 
                        id="comment-input-${post.id}"
                        placeholder="写下你的评论..." 
                        class="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onkeypress="if(event.key==='Enter') addComment(${post.id})"
                    />
                    <button 
                        onclick="addComment(${post.id})"
                        class="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                        发送
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 创建新帖子
function createPost() {
    const textarea = document.getElementById('new-post');
    const content = textarea.value.trim();
    
    if (!content) {
        alert('请输入内容');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        user: '我',
        content: content,
        likes: 0,
        likedBy: [],
        comments: [],
        time: new Date().toLocaleString('zh-CN')
    };
    
    posts.unshift(newPost);
    localStorage.setItem('community_posts', JSON.stringify(posts));
    
    textarea.value = '';
    renderPosts();
    
    // 显示成功提示
    showToast('✅ 发布成功！');
}

// 切换点赞
function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const userId = 'current-user';
    const index = post.likedBy.indexOf(userId);
    
    if (index > -1) {
        post.likedBy.splice(index, 1);
        post.likes--;
    } else {
        post.likedBy.push(userId);
        post.likes++;
    }
    
    localStorage.setItem('community_posts', JSON.stringify(posts));
    renderPosts();
}

// 切换评论显示
function toggleComments(postId) {
    const commentsDiv = document.getElementById(`comments-${postId}`);
    if (commentsDiv) {
        commentsDiv.classList.toggle('hidden');
        
        // 如果显示评论区，聚焦到输入框
        if (!commentsDiv.classList.contains('hidden')) {
            setTimeout(() => {
                const input = document.getElementById(`comment-input-${postId}`);
                if (input) input.focus();
            }, 100);
        }
    }
}

// 添加评论
function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    
    if (!content) {
        alert('请输入评论内容');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const newComment = {
        id: Date.now(),
        user: '我',
        content: content,
        time: '刚刚'
    };
    
    post.comments.push(newComment);
    localStorage.setItem('community_posts', JSON.stringify(posts));
    
    input.value = '';
    renderPosts();
    
    // 重新显示评论区
    setTimeout(() => {
        const commentsDiv = document.getElementById(`comments-${postId}`);
        if (commentsDiv) {
            commentsDiv.classList.remove('hidden');
        }
    }, 100);
    
    showToast('✅ 评论成功！');
}

// 显示提示消息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }
`;
document.head.appendChild(style);
