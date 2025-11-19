import { useState } from 'react';
import { mockPosts } from '../data/mockData';

interface Post {
  _id: string;
  userId: { username: string; avatar?: string };
  content: string;
  images: string[];
  likes: string[];
  comments: Array<{ userId: { username: string }; content: string; createdAt: string }>;
  createdAt: string;
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post: Post = {
      _id: Date.now().toString(),
      userId: { username: '我' },
      content: newPost,
      images: [],
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        const isLiked = post.likes.includes('current-user');
        return {
          ...post,
          likes: isLiked 
            ? post.likes.filter(id => id !== 'current-user')
            : [...post.likes, 'current-user']
        };
      }
      return post;
    }));
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

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="分享你的观点..."
            className="w-full bg-gray-700 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-400">
              支持发布文字和图片
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              发布
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                {post.userId.username[0].toUpperCase()}
              </div>
              <div className="ml-3">
                <div className="font-semibold">{post.userId.username}</div>
                <div className="text-sm text-gray-400">
                  {getTimeAgo(post.createdAt)}
                </div>
              </div>
            </div>

            <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

            {post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {post.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="rounded-lg" />
                ))}
              </div>
            )}

            <div className="flex items-center space-x-6 text-gray-400 border-t border-gray-700 pt-4">
              <button 
                onClick={() => handleLike(post._id)}
                className={`flex items-center space-x-2 hover:text-blue-400 transition ${
                  post.likes.includes('current-user') ? 'text-blue-400' : ''
                }`}
              >
                <span>{post.likes.includes('current-user') ? '👍' : '👍🏻'}</span>
                <span>{post.likes.length}</span>
              </button>
              <button 
                onClick={() => setShowComments(showComments === post._id ? null : post._id)}
                className="flex items-center space-x-2 hover:text-blue-400 transition"
              >
                <span>💬</span>
                <span>{post.comments.length}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-400 transition">
                <span>🔗</span>
                <span>分享</span>
              </button>
            </div>

            {showComments === post._id && post.comments.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-gray-700 pt-4">
                {post.comments.map((comment, idx) => (
                  <div key={idx} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{comment.userId.username}</span>
                      <span className="text-xs text-gray-400">{getTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-yellow-300">
          💡 <strong>交互演示：</strong>你可以发布新帖子和点赞，数据仅保存在本地浏览器中
        </p>
      </div>
    </div>
  );
}
