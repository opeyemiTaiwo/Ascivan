// src/Pages/career/GroupPostView.jsx - FULLY RESPONSIVE VERSION

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { safeFirestoreOperation } from '../../utils/errorHandler';

// Likes Modal Component
const LikesModal = ({ isOpen, onClose, likesData, likeCount }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full max-h-96 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
            <span className="text-blue-600 mr-2">Likes</span>
            {likeCount} {likeCount === 1 ? 'person' : 'people'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Users List */}
        <div className="overflow-y-auto max-h-80">
          {likesData.length === 0 ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Loading users...</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {likesData.map((user, index) => (
                <div key={user.uid || index} className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-orange-600 flex items-center justify-center flex-shrink-0">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xs sm:text-sm">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm sm:text-base">
                      {user.displayName || user.email || 'Unknown User'}
                    </p>
                    {user.email && user.displayName && (
                      <p className="text-gray-600 text-xs sm:text-sm truncate">{user.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-gray-600 text-xs text-center">
            Click outside to close
          </p>
        </div>
      </div>
    </div>
  );
};

const GroupPostView = () => {
  const { groupId, postId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [userMembership, setUserMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repliesLoading, setRepliesLoading] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  
  // Reply editing state
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  
  // Like-related state
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesData, setLikesData] = useState([]);

  // Keyboard shortcuts for reply editing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingReply) {
        cancelReplyEdit();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && editingReply && editReplyContent.trim()) {
        e.preventDefault();
        handleEditReply(editingReply);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingReply, editReplyContent]);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch group data
  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = onSnapshot(doc(db, 'groups', groupId), (doc) => {
      if (doc.exists()) {
        setGroup({ id: doc.id, ...doc.data() });
      } else {
        navigate('/my-groups');
      }
    });

    return unsubscribe;
  }, [groupId, navigate]);

  // Check user membership
  useEffect(() => {
    if (!currentUser || !groupId) return;

    const memberQuery = query(
      collection(db, 'group_members'),
      where('groupId', '==', groupId),
      where('userEmail', '==', currentUser.email),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(memberQuery, (snapshot) => {
      if (!snapshot.empty) {
        setUserMembership(snapshot.docs[0].data());
      } else {
        setUserMembership(null);
        if (!loading) {
          navigate('/my-groups');
        }
      }
    });

    return unsubscribe;
  }, [currentUser, groupId, loading, navigate]);

  // Fetch post data
  useEffect(() => {
    if (!postId || !userMembership) return;

    const unsubscribe = onSnapshot(doc(db, 'group_posts', postId), (doc) => {
      if (doc.exists()) {
        const postData = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        };
        setPost(postData);
      } else {
        navigate(`/groups/${groupId}`);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [postId, userMembership, groupId, navigate]);

  // Fetch replies
  useEffect(() => {
    if (!postId || !userMembership) return;

    setRepliesLoading(true);

    const repliesQuery = query(
      collection(db, 'post_replies'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      repliesQuery,
      (snapshot) => {
        const repliesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        setReplies(repliesData);
        setRepliesLoading(false);
      },
      (error) => {
        console.error('Error fetching replies:', error);
        
        if (error.code === 'failed-precondition') {
          const simpleRepliesQuery = query(
            collection(db, 'post_replies'),
            where('postId', '==', postId)
          );
          
          const unsubscribeSimple = onSnapshot(simpleRepliesQuery, (snapshot) => {
            const repliesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            
            repliesData.sort((a, b) => a.createdAt - b.createdAt);
            setReplies(repliesData);
            setRepliesLoading(false);
          });
          
          return unsubscribeSimple;
        } else {
          setRepliesLoading(false);
          toast.error('Failed to load replies');
        }
      }
    );

    return unsubscribe;
  }, [postId, userMembership]);

  // Reply editing functions
  const canEditReply = (reply) => {
    return currentUser && (
      reply.authorId === currentUser.uid || 
      reply.authorEmail === currentUser.email
    );
  };

  const startEditingReply = (reply) => {
    setEditingReply(reply.id);
    setEditReplyContent(reply.content);
  };

  const cancelReplyEdit = () => {
    setEditingReply(null);
    setEditReplyContent('');
  };

  const handleEditReply = async (replyId) => {
    if (!editReplyContent.trim()) {
      toast.warning('Please enter reply content');
      return;
    }

    try {
      await safeFirestoreOperation(async () => {
        const replyRef = doc(db, 'post_replies', replyId);
        await updateDoc(replyRef, {
          content: editReplyContent.trim(),
          updatedAt: serverTimestamp(),
          isEdited: true
        });
      }, 'updating reply');

      setEditingReply(null);
      setEditReplyContent('');
      toast.success('Reply updated successfully!');

    } catch (error) {
      console.error('Error updating reply:', error);
    }
  };

  // Handle post liking/unliking
  const handleLikePost = async (isCurrentlyLiked) => {
    if (!currentUser || !userMembership) {
      toast.warning('You must be logged in to like posts');
      return;
    }

    try {
      await safeFirestoreOperation(async () => {
        const postRef = doc(db, 'group_posts', postId);
        
        if (isCurrentlyLiked) {
          await updateDoc(postRef, {
            likes: arrayRemove(currentUser.uid),
            likeCount: increment(-1),
            updatedAt: serverTimestamp()
          });
        } else {
          await updateDoc(postRef, {
            likes: arrayUnion(currentUser.uid),
            likeCount: increment(1),
            updatedAt: serverTimestamp()
          });
        }
      }, isCurrentlyLiked ? 'unliking post' : 'liking post');

      if (!isCurrentlyLiked) {
        toast.success('Post liked!', { autoClose: 1500 });
      }

    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const isPostLikedByUser = () => {
    return currentUser && post && post.likes && post.likes.includes(currentUser.uid);
  };

  // Reply submission
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!newReply.trim() || submittingReply) {
      toast.warning('Please enter a reply message');
      return;
    }

    if (newReply.length > 1000) {
      toast.warning('Reply must be less than 1000 characters');
      return;
    }

    setSubmittingReply(true);

    try {
      await safeFirestoreOperation(async () => {
        const replyData = {
          postId: postId,
          groupId: groupId,
          authorId: currentUser.uid,
          authorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Unknown User',
          authorEmail: currentUser.email,
          authorPhoto: currentUser.photoURL || null,
          content: newReply.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'post_replies'), replyData);

        await updateDoc(doc(db, 'group_posts', postId), {
          replyCount: increment(1),
          updatedAt: serverTimestamp()
        });

        return docRef;
      }, 'posting reply');

      setNewReply('');
      toast.success('Reply posted successfully!');

    } catch (error) {
      console.error('Reply submission failed:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const closeLikesModal = () => {
    setShowLikesModal(false);
    setLikesData([]);
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'announcement': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'task': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'update': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!userMembership || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl sm:text-6xl mb-6">❌</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">This post may have been deleted or you don't have access to it.</p>
          <Link 
            to={`/groups/${groupId}`} 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-sm text-sm sm:text-base"
          >
            ← Back to Group
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
          
          {/* Back Button */}
          <div className="mb-6 sm:mb-8">
            <button 
              onClick={() => navigate(`/groups/${groupId}`)}
              className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors text-sm sm:text-base"
            >
              <span className="mr-2">←</span>
              Back to {group?.projectTitle}
            </button>
          </div>
          
          {/* Main Post */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm mb-8">
            
            {/* Post Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-orange-600 flex-shrink-0">
                  {post.authorPhoto ? (
                    <img src={post.authorPhoto} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm sm:text-lg">
                      {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">{post.authorName}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {post.createdAt?.toLocaleDateString()} at {post.createdAt?.toLocaleTimeString()}
                  </p>
                  {userMembership?.role === 'admin' && post.authorEmail === userMembership.userEmail && (
                    <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-semibold border border-orange-200 mt-1 inline-block">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              
              <span className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border ${getPostTypeColor(post.type)} whitespace-nowrap`}>
                {post.type}
              </span>
            </div>

            {/* Post Content */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base md:text-lg">
                  {post.content}
                </p>
              </div>
            </div>

            {/* Post Stats */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 pt-6 border-t border-gray-200 text-xs sm:text-sm">
              <span className="text-gray-600">
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </span>
              {post.updatedAt && post.updatedAt > post.createdAt && (
                <span className="text-gray-600">
                  Edited {post.updatedAt?.toLocaleDateString()}
                </span>
              )}
              <span className="text-blue-600 font-medium">
                Discussion
              </span>
            </div>
          </div>

          {/* Reply Form */}
          {group?.status !== 'completed' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-8">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4">Add a Reply</h3>
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-orange-600 flex-shrink-0">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-xs sm:text-sm">
                        {(currentUser?.displayName || currentUser?.email)?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 min-h-[80px] sm:min-h-[100px] resize-vertical text-sm sm:text-base"
                      placeholder="Write your reply..."
                      maxLength={1000}
                      required
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 gap-3">
                      <span className="text-gray-600 text-xs sm:text-sm">
                        {newReply.length}/1000 characters
                      </span>
                      <button
                        type="submit"
                        disabled={!newReply.trim() || submittingReply || newReply.length > 1000}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-colors duration-300 shadow-sm text-sm sm:text-base w-full sm:w-auto"
                      >
                        {submittingReply ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Posting...
                          </span>
                        ) : (
                          'Post Reply'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Replies */}
          <div className="space-y-4 sm:space-y-6">
            {repliesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading replies...</p>
              </div>
            ) : replies.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 md:p-12 shadow-sm text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-4">💬</div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4">No replies yet</h3>
                <p className="text-gray-600 text-sm sm:text-base">Be the first to respond to this post!</p>
              </div>
            ) : (
              <>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4">
                  {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                </h3>
                {replies.map((reply, index) => (
                  <div 
                    key={reply.id} 
                    className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3 sm:gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-600 to-blue-600 flex-shrink-0">
                          {reply.authorPhoto ? (
                            <img src={reply.authorPhoto} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-xs sm:text-sm">
                              {reply.authorName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">{reply.authorName}</p>
                            <p className="text-gray-600 text-xs sm:text-sm">
                              {reply.createdAt?.toLocaleDateString()} at {reply.createdAt?.toLocaleTimeString()}
                              {reply.isEdited && (
                                <span className="ml-2 text-xs text-gray-500 italic">(edited)</span>
                              )}
                            </p>
                            {reply.authorEmail === post.authorEmail && (
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 sm:py-1 rounded text-xs font-semibold border border-blue-200">
                                OP
                              </span>
                            )}
                            {userMembership?.role === 'admin' && reply.authorEmail === userMembership.userEmail && (
                              <span className="bg-orange-50 text-orange-700 px-2 py-0.5 sm:py-1 rounded text-xs font-semibold border border-orange-200">
                                Admin
                              </span>
                            )}
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 sm:py-1 rounded text-xs">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {canEditReply(reply) && editingReply !== reply.id && (
                        <button
                          onClick={() => startEditingReply(reply)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 border border-blue-200 whitespace-nowrap self-start sm:self-auto"
                          title="Edit this reply"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    
                    {editingReply === reply.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-blue-600 font-semibold mb-2 text-xs sm:text-sm md:text-base">Edit Reply</label>
                          <textarea
                            value={editReplyContent}
                            onChange={(e) => setEditReplyContent(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 h-24 sm:h-32 resize-vertical text-sm sm:text-base"
                            placeholder="Edit your reply..."
                            maxLength={1000}
                          />
                          <div className="text-right text-gray-600 text-xs mt-1">
                            {editReplyContent.length}/1000 characters
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-xs text-gray-600 hidden sm:block">
                            Press Escape to cancel, Ctrl+Enter to save
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => handleEditReply(reply.id)}
                              disabled={!editReplyContent.trim() || editReplyContent === reply.content}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 shadow-sm"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={cancelReplyEdit}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                            {reply.content}
                          </p>
                        </div>
                        {canEditReply(reply) && (
                          <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => startEditingReply(reply)}
                              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium transition-colors duration-300"
                            >
                              Edit Reply
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Likes Modal */}
      <LikesModal 
        isOpen={showLikesModal}
        onClose={closeLikesModal}
        likesData={likesData}
        likeCount={post?.likeCount || 0}
      />
    </div>
  );
};

export default GroupPostView;
