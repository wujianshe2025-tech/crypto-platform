import { useState, useEffect } from 'react';
import { getUser } from '../utils/api';

interface Post {
  _id: string;
  userId: string;
  user: string;
  avatar?: string;
  content: string;
  images: string[];
  likes: number;
  likedBy: string[];
  comments: Array<{ userId: string; user: string; content: string; time: string; createdAt?: Date }>;
  time?: string;
  createdAt: string;
}

const API_URL = 'https://crypto-platform-api.vercel.app';

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadPosts();
    const userData = getUser();
    setUser(userData);
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/community/posts`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPost,
          images: []
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewPost('');
        await loadPosts();
      } else {
        alert(data.error || '发布失败');
      }
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败，请重试');
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        await loadPosts();
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentText[postId]?.trim();
    if (!content) return;
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data = await response.json();
      if (data.success) {
        setCommentText({ ...commentText, [postId]: '' });
        await loadPosts();
      } else {
        alert(data.error || '评论失败');
      }
    } catch (error) {
      console.error('评论失败:', error);
      alert('评论失败，请重试');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0e1a' }}>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">投资社区</h1>
        <p className="text-gray-400 text-sm">专业观点与深度讨论</p>
      </div>

      {/* 发帖区域 */}
      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#1a2332', border: '1px solid #2d3748' }}>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            {/* 用户头像 */}
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: '#3b82f6', color: 'white' }}
            >
              {user ? user.username[0]?.toUpperCase() : 'Y'}
            </div>
            
            {/* 输入区域 */}
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={user ? "发布你的市场观点..." : "请先登录后发帖"}
                disabled={!user}
                className="w-full rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0f1419', border: '1px solid #2d3748', minHeight: '120px' }}
                rows={4}
              />
              
              {/* 底部工具栏 */}
              <div className="flex justify-between items-center mt-3">
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-gray-700 transition"
                  style={{ color: '#9ca3af' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <button
                  type="submit"
                  disabled={!user || !newPost.trim()}
                  className="px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3b82f6', color: 'white' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  发布观点
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 加载状态 */}
      {loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      )}

      {/* 空状态 */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2 text-white">还没有帖子</h3>
          <p className="text-gray-400">成为第一个发帖的人吧！</p>
        </div>
      )}

      {/* 帖子列表 */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div 
            key={post._id} 
            className="rounded-xl p-6"
            style={{ backgroundColor: '#1a2332', border: '1px solid #2d3748' }}
          >
            {/* 帖子头部 */}
            <div className="flex items-start gap-4 mb-4">
              {/* 用户头像 */}
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: '#2d3748', color: 'white' }}
              >
                {post.user[0]?.toUpperCase() || 'U'}
              </div>
              
              {/* 用户信息 */}
              <div className="flex-1">
                <div className="font-semibold text-white text-base">{post.user}</div>
                <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                  {getTimeAgo(post.createdAt)}
                </div>
              </div>
            </div>

            {/* 帖子内容 */}
            <p className="text-gray-200 mb-4 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>

            {/* 图片展示 */}
            {post.images && post.images.length > 0 && (
              <div className="mb-4">
                {post.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="" 
                    className="rounded-lg w-full"
                    style={{ maxHeight: '500px', objectFit: 'cover' }}
                  />
                ))}
              </div>
            )}

            {/* 互动区域 */}
            <div className="flex items-center gap-6 pt-4" style={{ borderTop: '1px solid #2d3748' }}>
              <button 
                onClick={() => handleLike(post._id)}
                disabled={!user}
                className="flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-400"
                style={{ color: user && post.likedBy?.includes(user.id) ? '#3b82f6' : '#9ca3af' }}
              >
                <svg className="w-5 h-5" fill={user && post.likedBy?.includes(user.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-medium">{post.likes || post.likedBy?.length || 0}</span>
              </button>
              
              <button 
                onClick={() => setShowComments(showComments === post._id ? null : post._id)}
                className="flex items-center gap-2 transition hover:text-blue-400"
                style={{ color: '#9ca3af' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm font-medium">{post.comments?.length || 0}</span>
              </button>
            </div>

            {/* 评论区 */}
            {showComments === post._id && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #2d3748' }}>
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {post.comments.map((comment, idx) => (
                      <div key={idx} className="rounded-lg p-3" style={{ backgroundColor: '#0f1419' }}>
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm flex-shrink-0"
                            style={{ backgroundColor: '#2d3748', color: 'white' }}
                          >
                            {comment.user[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm text-white">{comment.user}</span>
                              <span className="text-xs" style={{ color: '#9ca3af' }}>
                                {comment.time || (comment.createdAt ? getTimeAgo(comment.createdAt.toString()) : '')}
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: '#e5e7eb' }}>{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {user && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText[post._id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      placeholder="写下你的评论..."
                      className="flex-1 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: '#0f1419', border: '1px solid #2d3748' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(post._id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      className="px-4 py-2 rounded-lg transition font-medium"
                      style={{ backgroundColor: '#3b82f6', color: 'white' }}
                    >
                      发送
                    </button>
                  </div>
                )}
                
                {!user && (
                  <p className="text-sm text-center py-2" style={{ color: '#9ca3af' }}>请先登录后评论</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
