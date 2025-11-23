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

  // 加载数据
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
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">社区论坛</h1>

      {!user && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <p className="text-yellow-300">⚠️ 请先登录后才能发帖、评论和点赞</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={user ? "分享你的观点..." : "请先登录后发帖"}
            disabled={!user}
            className="w-full bg-gray-700 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={4}
          />
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-400">
              {user ? `当前用户: ${user.username}` : '请先登录'}
            </div>
            <button
              type="submit"
              disabled={!user}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发布
            </button>
          </div>
        </form>
      </div>

      {loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">还没有帖子</h3>
          <p className="text-gray-400">成为第一个发帖的人吧！</p>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0" style={{ backgroundColor: '#1e3a8a' }}>
                {post.user[0]?.toUpperCase() || 'U'}
              </div>
              <div className="ml-4 flex-1">
                <div className="font-semibold text-base">{post.user}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {post.time || getTimeAgo(post.createdAt)}
                </div>
              </div>
            </div>

            <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {post.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="rounded-lg" />
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 pt-4" style={{ borderTop: '1px solid #2d3748' }}>
              <button 
                onClick={() => handleLike(post._id)}
                disabled={!user}
                className="flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed hover:text-red-400"
                style={{ color: user && post.likedBy?.includes(user.id) ? '#ef4444' : '#9ca3af' }}
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

            {showComments === post._id && (
              <div className="mt-4 border-t border-gray-700 pt-4">
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {post.comments.map((comment, idx) => (
                      <div key={idx} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-md flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {comment.user[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm">{comment.user}</span>
                              <span className="text-xs text-gray-500">
                                {comment.time || (comment.createdAt ? getTimeAgo(comment.createdAt.toString()) : '')}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm">{comment.content}</p>
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
                      className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(post._id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                      发送
                    </button>
                  </div>
                )}
                
                {!user && (
                  <p className="text-sm text-gray-400 text-center py-2">请先登录后评论</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>提示：</strong>
          {user 
            ? '你可以发布帖子、评论和点赞，所有数据都会保存到数据库'
            : '登录后可以发布帖子、评论和点赞'
          }
        </p>
      </div>
    </div>
  );
}
