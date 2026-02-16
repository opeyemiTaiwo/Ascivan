// src/Pages/career/ProjectGroupView.jsx - White Background / Blue-Orange Accent Theme

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
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
  arrayUnion,
  arrayRemove,
  increment,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { safeFirestoreOperation } from '../../utils/errorHandler';

// Import notification utilities
import NotificationBell from '../../components/NotificationBell';
import { 
  createGroupPostNotification, 
  createGroupReplyNotification 
} from '../../utils/notificationHelpers';

// Link insertion utilities
const urlRegex = /(https?:\/\/[^\s]+)/g;

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const formatUrl = (url) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
};

// Link Insertion Modal Component
const LinkInsertModal = ({ isOpen, onClose, onInsert }) => {
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleInsert = () => {
    if (!linkUrl.trim()) {
      toast.warning('Please enter a URL');
      return;
    }

    const formattedUrl = formatUrl(linkUrl.trim());
    
    if (!validateUrl(formattedUrl)) {
      toast.warning('Please enter a valid URL');
      return;
    }

    const displayText = linkText.trim() || formattedUrl;
    const linkMarkdown = `[${displayText}](${formattedUrl})`;
    
    onInsert(linkMarkdown);
    setLinkText('');
    setLinkUrl('');
    onClose();
  };

  const handleCancel = () => {
    setLinkText('');
    setLinkUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            Insert Link
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Link Text (Optional)
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                placeholder="Display text for the link"
                maxLength={100}
              />
              <p className="text-gray-400 text-xs mt-1">
                Leave empty to use the URL as display text
              </p>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                URL <span className="text-orange-500">*</span>
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                placeholder="https://example.com"
                required
              />
              <p className="text-gray-400 text-xs mt-1">
                Enter the full URL including https://
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleInsert}
              disabled={!linkUrl.trim()}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base min-h-[44px] flex items-center justify-center"
            >
              Insert Link
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-300 text-sm sm:text-base min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Function to render content with clickable links
const renderContentWithLinks = (content) => {
  if (!content) return content;

  const processedContent = content.replace(urlRegex, (url) => {
    if (validateUrl(url)) {
      const displayText = url.length > 50 ? url.substring(0, 47) + '...' : url;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline transition-colors font-medium">${displayText}</a>`;
    }
    return url;
  });

  return <span dangerouslySetInnerHTML={{ __html: processedContent }} />;
};

// Text Editor Component with Link Insertion
const TextEditorWithLinks = ({ 
  value, 
  onChange, 
  placeholder, 
  className, 
  maxLength = 2000,
  label,
  required = false
}) => {
  return (
    <div>
      {label && (
        <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
      />
      
      <div className="flex justify-between items-center mt-1">
        <p className="text-gray-400 text-xs">
          Paste URLs directly - they will become clickable links
        </p>
        <div className="text-right text-gray-400 text-xs">
          {value.length}/{maxLength} characters
        </div>
      </div>
    </div>
  );
};

// Likes Preview Component
const LikesPreview = ({ post, onOpenModal, previewUsers = [] }) => {
  const likeCount = post.likeCount || 0;
  const likes = post.likes || [];
  
  if (likeCount === 0) return null;

  return (
    <button
      onClick={() => onOpenModal(post.id, likes)}
      className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-gray-900 text-xs sm:text-sm transition-colors cursor-pointer group"
    >
      <div className="flex -space-x-1 sm:-space-x-2">
        {previewUsers.slice(0, 3).map((user, index) => (
          <div
            key={user?.uid || index}
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 border-white group-hover:border-gray-100 transition-colors overflow-hidden bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center shadow-sm"
            style={{ zIndex: 10 - index }}
          >
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xs">
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        ))}
        
        {likeCount > 3 && (
          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 border-white group-hover:border-gray-100 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
            +{likeCount - 3}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1">
        <span className="text-sm sm:text-base text-red-500">&#9829;</span>
        <span className="text-xs sm:text-sm">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
      </div>
    </button>
  );
};

// Likes Modal Component
const LikesModal = ({ postId, isOpen, onClose, likesData, likeCount }) => {
  if (!isOpen || !postId) return null;

  const users = likesData[postId] || [];

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xs sm:max-w-md max-h-[90vh] sm:max-h-96 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 flex items-center">
            <span className="text-red-500 mr-1 sm:mr-2">&#9829;</span>
            <span className="hidden sm:inline">Liked by {likeCount} {likeCount === 1 ? 'person' : 'people'}</span>
            <span className="sm:hidden">{likeCount} like{likeCount !== 1 ? 's' : ''}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 text-lg sm:text-xl font-bold min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] sm:max-h-80">
          {users.length === 0 ? (
            <div className="p-4 sm:p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-400 text-sm">Loading users...</p>
            </div>
          ) : (
            <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
              {users.map((user, index) => (
                <div key={user.uid || index} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center flex-shrink-0">
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
                  </div>
                  <div className="text-red-500 text-sm">&#9829;</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-gray-400 text-xs text-center">
            Tap outside to close
          </p>
        </div>
      </div>
    </div>
  );
};

const ProjectGroupView = () => {
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [userMembership, setUserMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    type: 'discussion'
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showAdminInstructions, setShowAdminInstructions] = useState(false);
  const [showRepositoryInfo, setShowRepositoryInfo] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [editingPost, setEditingPost] = useState(null);
  const [editPostData, setEditPostData] = useState({ title: '', content: '', type: 'discussion' });
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [replies, setReplies] = useState({});

  const [showLikesModal, setShowLikesModal] = useState(null);
  const [likesData, setLikesData] = useState({});
  const [likesPreviewData, setLikesPreviewData] = useState({});

  const getAuthorName = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    if (currentUser?.displayName && currentUser.displayName.trim()) {
      return currentUser.displayName.trim();
    }
    if (userMembership?.userName && userMembership.userName.trim()) {
      return userMembership.userName.trim();
    }
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      if (emailName && emailName.trim() && emailName !== 'user') {
        return emailName
          .replace(/[._]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
    }
    const currentMember = members.find(member => 
      member.userId === currentUser?.uid || 
      member.userEmail === currentUser?.email
    );
    if (currentMember?.userName && currentMember.userName.trim()) {
      return currentMember.userName.trim();
    }
    return 'Team Member';
  };

  const getAuthorInfo = () => {
    const displayName = getAuthorName();
    return {
      authorDisplayName: displayName,
      authorName: displayName,
      authorFirstName: currentUser?.firstName || '',
      authorLastName: currentUser?.lastName || '',
      authorPhoto: currentUser?.photoURL || null,
      authorId: currentUser?.uid,
      authorEmail: currentUser?.email
    };
  };

  const closeLikesModal = () => {
    setShowLikesModal(null);
  };

  const fetchLikesPreview = async (postId, userIds) => {
    if (!userIds || userIds.length === 0) return;
    if (likesPreviewData[postId]) return;

    try {
      const previewUserIds = userIds.slice(0, 3);
      const usersQuery = query(
        collection(db, 'users'),
        where('uid', 'in', previewUserIds)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      const memberUsers = members.filter(member => previewUserIds.includes(member.userId || member.uid))
        .map(member => ({
          uid: member.userId || member.uid,
          displayName: member.userName,
          email: member.userEmail,
          photoURL: member.photoURL || null
        }));

      const allUsers = [...users];
      memberUsers.forEach(memberUser => {
        if (!allUsers.find(user => user.uid === memberUser.uid)) {
          allUsers.push(memberUser);
        }
      });

      const sortedUsers = previewUserIds.map(userId => 
        allUsers.find(user => user.uid === userId)
      ).filter(Boolean);

      setLikesPreviewData(prev => ({
        ...prev,
        [postId]: sortedUsers
      }));
    } catch (error) {
      console.error('Error fetching likes preview:', error);
    }
  };

  const openLikesModal = async (postId, userIds) => {
    if (!userIds || userIds.length === 0) {
      setShowLikesModal(postId);
      return;
    }

    setShowLikesModal(postId);
    
    if (likesData[postId]) return;

    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('uid', 'in', userIds.slice(0, 10))
      );
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      const memberUsers = members.filter(member => userIds.includes(member.userId || member.uid))
        .map(member => ({
          uid: member.userId || member.uid,
          displayName: member.userName,
          email: member.userEmail,
          photoURL: member.photoURL || null
        }));

      const allUsers = [...users];
      memberUsers.forEach(memberUser => {
        if (!allUsers.find(user => user.uid === memberUser.uid)) {
          allUsers.push(memberUser);
        }
      });

      setLikesData(prev => ({
        ...prev,
        [postId]: allUsers
      }));
    } catch (error) {
      console.error('Error fetching users who liked post:', error);
      setLikesData(prev => ({
        ...prev,
        [postId]: []
      }));
    }
  };

  const handleTogglePin = async (postId, isCurrentlyPinned) => {
    if (userMembership?.role !== 'admin') {
      toast.warning('Only admins can pin/unpin posts');
      return;
    }

    try {
      await safeFirestoreOperation(async () => {
        const postRef = doc(db, 'group_posts', postId);
        await updateDoc(postRef, {
          isPinned: !isCurrentlyPinned,
          updatedAt: serverTimestamp()
        });
      }, isCurrentlyPinned ? 'unpinning post' : 'pinning post');

      toast.success(isCurrentlyPinned ? 'Post unpinned' : 'Post pinned to top');
    } catch (error) {
      console.error('Error toggling pin status:', error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'groups', groupId), 
      (doc) => {
        if (doc.exists()) {
          const groupData = { id: doc.id, ...doc.data() };
          setGroup(groupData);
        } else {
          navigate('/my-groups');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching group:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [groupId]);

  useEffect(() => {
    if (!groupId || posts.length === 0) return;

    const postIds = posts.map(post => post.id);
    const repliesQuery = query(
      collection(db, 'post_replies'),
      where('groupId', '==', groupId),
      where('postId', 'in', postIds.slice(0, 10))
    );

    const unsubscribe = onSnapshot(
      repliesQuery,
      (snapshot) => {
        const repliesData = {};
        snapshot.docs.forEach(doc => {
          const reply = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          };
          if (!repliesData[reply.postId]) {
            repliesData[reply.postId] = [];
          }
          repliesData[reply.postId].push(reply);
        });

        Object.keys(repliesData).forEach(postId => {
          repliesData[postId].sort((a, b) => a.createdAt - b.createdAt);
        });

        setReplies(repliesData);
      },
      (error) => {
        console.error('Error fetching replies:', error);
      }
    );

    return unsubscribe;
  }, [groupId, posts]);

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
        const membershipData = snapshot.docs[0].data();
        setUserMembership(membershipData);
      } else {
        setUserMembership(null);
        if (!loading) {
          navigate('/my-groups');
        }
      }
    });

    return unsubscribe;
  }, [currentUser, groupId, loading, navigate]);

  useEffect(() => {
    if (!groupId) return;

    const membersQuery = query(
      collection(db, 'group_members'),
      where('groupId', '==', groupId),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(membersQuery, async (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinedAt: doc.data().joinedAt?.toDate()
      }));

      membersData.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        return (a.joinedAt || new Date(0)) - (b.joinedAt || new Date(0));
      });

      setMembers(membersData);

      if (group && membersData.length !== group.memberCount) {
        try {
          await updateDoc(doc(db, 'groups', groupId), {
            memberCount: membersData.length,
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating member count:', error);
        }
      }
    });

    return unsubscribe;
  }, [groupId, group]);

  useEffect(() => {
    if (!groupId) return;

    setPostsLoading(true);

    const postsQuery = query(
      collection(db, 'group_posts'),
      where('groupId', '==', groupId)
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        postsData.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (b.isPinned && !a.isPinned) return 1;
          return b.createdAt - a.createdAt;
        });

        setPosts(postsData);
        setPostsLoading(false);

        postsData.forEach(post => {
          if (post.likes && post.likes.length > 0) {
            fetchLikesPreview(post.id, post.likes);
          }
        });
      },
      (error) => {
        console.error('Error fetching posts:', error);
        setPostsLoading(false);
        toast.error('Failed to load posts');
      }
    );

    return unsubscribe;
  }, [groupId, members]);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.warning('Please fill in both title and content');
      return;
    }

    if (!currentUser || !userMembership) {
      toast.warning('You must be an active member to create posts');
      return;
    }

    try {
      await safeFirestoreOperation(async () => {
        const authorInfo = getAuthorInfo();

        const postData = {
          groupId: groupId,
          authorId: currentUser.uid,
          authorName: authorInfo.authorDisplayName,
          authorEmail: currentUser.email,
          authorPhoto: currentUser.photoURL || null,
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          type: newPost.type,
          groupTitle: group?.projectTitle,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          replyCount: 0,
          isPinned: false,
          likes: [],
          likeCount: 0,
          replies: [],
          ...authorInfo
        };

        const docRef = await addDoc(collection(db, 'group_posts'), postData);
        
        await createGroupPostNotification(
          { ...postData, id: docRef.id },
          members,
          currentUser.uid
        );
        
        return docRef;
      }, 'creating post');
      
      setNewPost({ title: '', content: '', type: 'discussion' });
      setShowNewPostForm(false);
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleSubmitReply = async (postId) => {
    if (!replyContent.trim()) {
      toast.warning('Please enter a reply');
      return;
    }

    if (!currentUser || !userMembership) {
      toast.warning('You must be an active member to reply');
      return;
    }

    try {
      await safeFirestoreOperation(async () => {
        const authorInfo = getAuthorInfo();

        const replyData = {
          postId: postId,
          groupId: groupId,
          authorId: currentUser.uid,
          authorName: authorInfo.authorDisplayName,
          authorEmail: currentUser.email,
          authorPhoto: currentUser.photoURL || null,
          content: replyContent.trim(),
          createdAt: serverTimestamp(),
          ...authorInfo
        };

        await addDoc(collection(db, 'post_replies'), replyData);

        const originalPost = posts.find(p => p.id === postId);

        if (originalPost) {
          await createGroupReplyNotification(
            { ...replyData, id: 'temp-id' },
            members,
            originalPost.authorId,
            originalPost.title
          );
        }

        const postRef = doc(db, 'group_posts', postId);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          const currentReplyCount = postDoc.data().replyCount || 0;
          await updateDoc(postRef, {
            replyCount: currentReplyCount + 1,
            updatedAt: serverTimestamp()
          });
        }
      }, 'posting reply');

      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply posted successfully!');
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleEditPost = async (postId) => {
    if (!editPostData.title.trim() || !editPostData.content.trim()) {
      toast.warning('Please fill in both title and content');
      return;
    }

    try {
      await safeFirestoreOperation(async () => {
        const authorInfo = getAuthorInfo();
        const postRef = doc(db, 'group_posts', postId);
        await updateDoc(postRef, {
          title: editPostData.title.trim(),
          content: editPostData.content.trim(),
          type: editPostData.type,
          authorName: authorInfo.authorDisplayName,
          updatedAt: serverTimestamp(),
          isEdited: true,
          ...authorInfo
        });
      }, 'updating post');

      setEditingPost(null);
      setEditPostData({ title: '', content: '', type: 'discussion' });
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const startEditingPost = (post) => {
    setEditingPost(post.id);
    setEditPostData({ title: post.title, content: post.content, type: post.type });
    setEditingReply(null);
    setEditReplyContent('');
    setReplyingTo(null);
    setReplyContent('');
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditPostData({ title: '', content: '', type: 'discussion' });
  };

  const handleEditReply = async (replyId) => {
    if (!editReplyContent.trim()) {
      toast.warning('Please enter reply content');
      return;
    }

    try {
      await safeFirestoreOperation(async () => {
        const authorInfo = getAuthorInfo();
        const replyRef = doc(db, 'post_replies', replyId);
        await updateDoc(replyRef, {
          content: editReplyContent.trim(),
          authorName: authorInfo.authorDisplayName,
          updatedAt: serverTimestamp(),
          isEdited: true,
          ...authorInfo
        });
      }, 'updating reply');

      setEditingReply(null);
      setEditReplyContent('');
      toast.success('Reply updated successfully!');
    } catch (error) {
      console.error('Error updating reply:', error);
    }
  };

  const startEditingReply = (reply) => {
    setEditingReply(reply.id);
    setEditReplyContent(reply.content);
    setReplyingTo(null);
    setReplyContent('');
  };

  const cancelReplyEdit = () => {
    setEditingReply(null);
    setEditReplyContent('');
  };

  const canEditPost = (post) => {
    return currentUser && (
      post.authorId === currentUser.uid || 
      post.authorEmail === currentUser.email
    );
  };

  const canEditReply = (reply) => {
    return currentUser && (
      reply.authorId === currentUser.uid || 
      reply.authorEmail === currentUser.email
    );
  };

  const handleLikePost = async (postId, isCurrentlyLiked) => {
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

      setLikesPreviewData(prev => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });

      if (!isCurrentlyLiked) {
        toast.success('Post liked!', { autoClose: 1500 });
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const isPostLikedByUser = (post) => {
    return currentUser && post.likes && post.likes.includes(currentUser.uid);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completing':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completing': return 'Completing';
      case 'completed': return 'Completed';
      default: return status || 'active';
    }
  };

  const canUserInteract = () => {
    return userMembership && userMembership.status === 'active' && group?.status !== 'completed';
  };

  const getMemberProfileUrl = (member) => {
    return `/profile/${encodeURIComponent(member.userEmail)}`;
  };

  const RepositoryInfo = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200 shadow-sm mb-4 sm:mb-6 md:mb-8">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center">
          <span className="hidden sm:inline">Project Repository</span>
          <span className="sm:hidden">Repository</span>
        </h3>
        <button
          onClick={() => setShowRepositoryInfo(!showRepositoryInfo)}
          className="text-blue-600 hover:text-blue-700 transition-colors text-base sm:text-lg p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
        >
          {showRepositoryInfo ? '▼' : '▶'}
        </button>
      </div>

      <div className="mb-3 sm:mb-4">
        <a
          href="https://github.com/loomiq/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-gray-900 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start min-h-[44px]"
        >
          View Loomiq Repository
          <span className="ml-2">&#8599;</span>
        </a>
      </div>

      {showRepositoryInfo && (
        <div className="space-y-3 sm:space-y-4 text-sm">
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h4 className="text-blue-700 font-semibold mb-2 text-sm sm:text-base">Repository Requirements</h4>
            <ul className="text-gray-600 space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li>All project code must be submitted to the Loomiq repository</li>
              <li>Code must be well-documented with clear README files</li>
              <li>Include setup instructions and dependencies</li>
              <li>Follow proper Git commit practices</li>
              <li>Ensure code is production-ready and tested</li>
            </ul>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h4 className="text-orange-700 font-semibold mb-2 text-sm sm:text-base">First Week Submission</h4>
            <p className="text-orange-600 mb-2 text-xs sm:text-sm">
              <strong>Product Owner:</strong> Within the first week, submit the following via email:
            </p>
            <ul className="text-gray-600 space-y-1 mb-3 text-xs sm:text-sm">
              <li>GitHub username of each team member</li>
              <li>GitHub profile URL of each team member</li>
              <li>Project title and brief description</li>
              <li>Expected completion timeline</li>
            </ul>
            <div className="bg-white rounded-lg p-2 sm:p-3 border border-orange-200">
              <p className="text-orange-700 font-semibold text-xs sm:text-sm">Email to:</p>
              <a
                href="mailto:hello@loomiqhq.com"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors text-xs sm:text-sm break-all"
              >
                hello@loomiqhq.com
              </a>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h4 className="text-blue-700 font-semibold mb-2 text-sm sm:text-base">Repository Setup</h4>
            <p className="text-blue-600 text-xs sm:text-sm">
              A Loomiq representative will contact you within 2-3 business days after receiving your 
              submission to set up your project repository and provide access credentials.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const AdminInstructions = () => {
    if (userMembership?.role !== 'admin') return null;

    return (
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-orange-200 shadow-sm mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center">
            <span className="hidden sm:inline">Admin Instructions</span>
            <span className="sm:hidden">Admin Guide</span>
          </h3>
          <button
            onClick={() => setShowAdminInstructions(!showAdminInstructions)}
            className="text-orange-500 hover:text-orange-600 transition-colors text-base sm:text-lg p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            {showAdminInstructions ? '▼' : '▶'}
          </button>
        </div>

        {showAdminInstructions && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="text-orange-700 font-semibold mb-2 text-sm sm:text-base">Badge Verification</h4>
              <div className="text-gray-600 text-xs sm:text-sm space-y-1">
                <div>Click member profiles to view their complete project history</div>
                <div>Verify code quality, documentation, and participation level</div>
                <div>Match badge level to actual performance and contributions</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                <h4 className="text-blue-700 font-semibold text-sm sm:text-base">Badge Levels</h4>
                <Link 
                  to="/tech-badges" 
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm transition-colors mt-1 sm:mt-0"
                >
                  Full Guide &rarr;
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <div className="text-orange-600 font-semibold">Novice</div>
                  <div className="text-gray-500">First project</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="text-blue-600 font-semibold">Beginners</div>
                  <div className="text-gray-500">5+ projects</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="text-blue-600 font-semibold">Intermediate</div>
                  <div className="text-gray-500">10+ projects</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <div className="text-orange-600 font-semibold">Expert</div>
                  <div className="text-gray-500">15+ projects</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="text-blue-700 font-semibold mb-2 text-sm sm:text-base">Completion Checklist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-gray-600 text-xs sm:text-sm">
                <div>&#9744; Code in repository</div>
                <div>&#9744; Documentation complete</div>
                <div>&#9744; Contributions verified</div>
                <div>&#9744; Quality standards met</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-900 text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading project group...</p>
        </div>
      </div>
    );
  }

  if (!userMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 border border-gray-200 shadow-lg text-center max-w-sm sm:max-w-md w-full">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">You don't have permission to view this project group.</p>
          <Link 
            to="/my-groups" 
            className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-orange-600 transition-all duration-300 inline-block text-sm sm:text-base min-h-[44px]"
          >
            &larr; My Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Navbar */}
      <Navbar />

      <main className="flex-grow pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
          
          {/* Header Section */}
          <section className="mb-6 sm:mb-8 md:mb-12">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 sm:mb-6 lg:mb-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4 leading-tight">{group?.projectTitle}</h1>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 line-clamp-3">{group?.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                    <span className="text-xs sm:text-sm bg-blue-50 text-blue-700 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full border border-blue-200 font-medium">
                      {members.length} members
                    </span>
                    <span className="text-xs sm:text-sm bg-orange-50 text-orange-700 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full border border-orange-200 font-medium">
                      {posts.length} posts
                    </span>
                    {userMembership?.role === 'admin' && (
                      <span className="text-xs sm:text-sm bg-orange-50 text-orange-700 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full border border-orange-200 font-medium">
                        Admin
                      </span>
                    )}
                    <span className={`text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full border font-medium ${getStatusColor(group?.status)}`}>
                      {getStatusLabel(group?.status)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 sm:space-y-3">
                  {userMembership?.role === 'admin' && (
                    <>
                      {group?.status === 'active' && (
                        <Link 
                          to={`/groups/${groupId}/complete`}
                          className="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-orange-600 hover:to-blue-700 transition-all duration-300 text-center shadow-md text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                        >
                          Complete Project
                        </Link>
                      )}
                      
                      {group?.status === 'completing' && (
                        <Link 
                          to={`/groups/${groupId}/complete`}
                          className="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-orange-600 hover:to-blue-700 transition-all duration-300 text-center shadow-md animate-pulse text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                        >
                          Continue Completion
                        </Link>
                      )}

                      {group?.status === 'completed' && (
                        <button 
                          disabled
                          className="bg-gray-100 text-gray-400 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold cursor-not-allowed text-center text-sm sm:text-base min-h-[44px] flex items-center justify-center border border-gray-200"
                        >
                          Project Completed
                        </button>
                      )}
                    </>
                  )}

                  {userMembership?.role !== 'admin' && group?.status === 'completed' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                      <div className="text-blue-700 font-semibold text-sm sm:text-base">Project Completed!</div>
                      <div className="text-gray-500 text-xs sm:text-sm mt-1">Check your dashboard for badges</div>
                    </div>
                  )}

                  {canUserInteract() && (
                    <button
                      onClick={() => setShowNewPostForm(!showNewPostForm)}
                      className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-orange-600 transition-all duration-300 shadow-md text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                    >
                      + New Post
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <RepositoryInfo />
          <AdminInstructions />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            
            {/* Sidebar - Team Members */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200 shadow-sm lg:sticky lg:top-24">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                  Team Members
                  <span className="block text-xs text-gray-400 font-normal mt-1">
                    <span className="hidden sm:inline">Click to view member profiles</span>
                    <span className="sm:hidden">Tap to view profiles</span>
                  </span>
                </h3>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  {members.map((member) => (
                    <Link
                      key={member.id}
                      to={getMemberProfileUrl(member)}
                      className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer group min-h-[44px]"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base flex-shrink-0">
                        {member.userName?.charAt(0).toUpperCase() || member.userEmail?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate text-sm sm:text-base">
                          {member.userName || member.userEmail}
                        </p>
                        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                          {member.role === 'admin' ? (
                            <span>Admin</span>
                          ) : (
                            <span>Member</span>
                          )}
                          {member.joinedAt && (
                            <span className="ml-2 text-xs hidden sm:inline">
                              &middot; {member.joinedAt.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-blue-600 transition-colors text-sm">
                        &rarr;
                      </div>
                    </Link>
                  ))}
                </div>

                {(group?.status === 'completing' || group?.status === 'completed') && (
                  <div className="mt-4 sm:mt-6 md:mt-8 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                    <h4 className="text-blue-700 font-semibold mb-3 flex items-center text-sm sm:text-base">
                      {group?.status === 'completed' ? 'Project Completed!' : 'Completion in Progress'}
                    </h4>
                    
                    {group?.status === 'completed' ? (
                      <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Team Members:</span>
                          <span className="text-blue-600 font-semibold">{members.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Badges Awarded:</span>
                          <span className="text-orange-500 font-semibold">{Math.max(0, members.length - 1)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Certificate:</span>
                          <span className="text-blue-600 font-semibold">Generated</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-gray-600">
                        <p>The project admin is evaluating team member contributions and awarding badges.</p>
                        {userMembership?.role === 'admin' && (
                          <Link
                            to={`/groups/${groupId}/complete`}
                            className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Continue Evaluation &rarr;
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content - Posts */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              
              {/* New Post Form */}
              {showNewPostForm && canUserInteract() && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200 shadow-sm mb-4 sm:mb-6 md:mb-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Create New Post</h3>
                  <form onSubmit={handleSubmitPost} className="space-y-3 sm:space-y-4 md:space-y-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Post Type</label>
                      <select
                        value={newPost.type}
                        onChange={(e) => setNewPost({...newPost, type: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base min-h-[44px]"
                      >
                        <option value="discussion">Discussion</option>
                        <option value="announcement">Announcement</option>
                        <option value="task">Task</option>
                        <option value="update">Update</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Title</label>
                      <input
                        type="text"
                        value={newPost.title}
                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base min-h-[44px]"
                        placeholder="Enter post title..."
                        maxLength={100}
                        required
                      />
                      <div className="text-right text-gray-400 text-xs mt-1">
                        {newPost.title.length}/100 characters
                      </div>
                    </div>
                    
                    <TextEditorWithLinks
                      label="Content"
                      value={newPost.content}
                      onChange={(value) => setNewPost({...newPost, content: value})}
                      placeholder="Share your thoughts, updates, or questions... Paste URLs directly - they will become clickable links!"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 h-20 sm:h-24 md:h-32 resize-vertical text-sm sm:text-base"
                      maxLength={2000}
                      required
                    />
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        type="submit"
                        disabled={!newPost.title.trim() || !newPost.content.trim()}
                        className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                      >
                        Publish Post
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewPostForm(false);
                          setNewPost({ title: '', content: '', type: 'discussion' });
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-colors duration-300 text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Posts List */}
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {postsLoading ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-gray-500 text-sm sm:text-base">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 border border-gray-200 shadow-sm text-center">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No posts yet</h3>
                    <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Be the first to start a discussion in this project group!</p>
                    {canUserInteract() && (
                      <button
                        onClick={() => setShowNewPostForm(true)}
                        className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-orange-600 transition-all duration-300 text-sm sm:text-base min-h-[44px]"
                      >
                        Create First Post
                      </button>
                    )}
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border shadow-sm hover:shadow-md transition-all duration-300 ${post.isPinned ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200'}`}>
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                            {post.authorPhoto ? (
                              <img src={post.authorPhoto} alt="" className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full" />
                            ) : (
                              <span className="text-white font-bold text-xs sm:text-sm md:text-base">
                                {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{post.authorName}</p>
                            <p className="text-gray-400 text-xs sm:text-sm">
                              {post.createdAt?.toLocaleDateString()} at {post.createdAt?.toLocaleTimeString()}
                              {post.isEdited && (
                                <span className="ml-2 text-xs text-gray-400 italic">(edited)</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          {userMembership?.role === 'admin' && canUserInteract() && (
                            <button
                              onClick={() => handleTogglePin(post.id, post.isPinned)}
                              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 border min-h-[32px] ${
                                post.isPinned 
                                  ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200' 
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border-gray-200'
                              }`}
                              title={post.isPinned ? "Unpin post" : "Pin post to top"}
                            >
                              <span className="hidden sm:inline">
                                {post.isPinned ? 'Unpin' : 'Pin'}
                              </span>
                              <span className="sm:hidden">
                                {post.isPinned ? '&#128204;' : '&#128205;'}
                              </span>
                            </button>
                          )}

                          {canEditPost(post) && canUserInteract() && (
                            <button
                              onClick={() => startEditingPost(post)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 border border-blue-200 min-h-[32px]"
                              title="Edit post"
                            >
                              <span className="hidden sm:inline">Edit</span>
                              <span className="sm:hidden">&#9998;</span>
                            </button>
                          )}
                          {post.isPinned && (
                            <span className="text-orange-500 text-sm sm:text-lg" title="Pinned Post">&#128204;</span>
                          )}
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 rounded-full border border-gray-200 font-medium">
                            <span className="hidden sm:inline capitalize">{post.type}</span>
                            <span className="sm:hidden capitalize">{post.type?.charAt(0)?.toUpperCase()}</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Post Content / Edit Form */}
                      {editingPost === post.id ? (
                        <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Post Type</label>
                            <select
                              value={editPostData.type}
                              onChange={(e) => setEditPostData({...editPostData, type: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none text-sm sm:text-base min-h-[44px]"
                            >
                              <option value="discussion">Discussion</option>
                              <option value="announcement">Announcement</option>
                              <option value="task">Task</option>
                              <option value="update">Update</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Title</label>
                            <input
                              type="text"
                              value={editPostData.title}
                              onChange={(e) => setEditPostData({...editPostData, title: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm sm:text-base min-h-[44px]"
                              placeholder="Enter post title..."
                              maxLength={100}
                            />
                            <div className="text-right text-gray-400 text-xs mt-1">
                              {editPostData.title.length}/100 characters
                            </div>
                          </div>
                          
                          <TextEditorWithLinks
                            label="Content"
                            value={editPostData.content}
                            onChange={(value) => setEditPostData({...editPostData, content: value})}
                            placeholder="Share your thoughts, updates, or questions..."
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none h-20 sm:h-24 md:h-32 resize-vertical text-sm sm:text-base"
                            maxLength={2000}
                            required
                          />
                          
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                              onClick={() => handleEditPost(post.id)}
                              disabled={!editPostData.title.trim() || !editPostData.content.trim()}
                              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm min-h-[44px] flex items-center justify-center"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-semibold transition-colors duration-300 text-sm min-h-[44px] flex items-center justify-center"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{post.title}</h3>
                          <div className="text-gray-700 leading-relaxed mb-3 sm:mb-4 whitespace-pre-wrap text-sm sm:text-base">
                            {renderContentWithLinks(post.content)}
                          </div>
                          
                          {/* Like Button */}
                          {canUserInteract() && editingPost !== post.id && (
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                              <button
                                onClick={() => handleLikePost(post.id, isPostLikedByUser(post))}
                                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base min-h-[36px] sm:min-h-[40px] ${
                                  isPostLikedByUser(post)
                                    ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                                }`}
                              >
                                <span className="text-sm sm:text-base md:text-lg">
                                  {isPostLikedByUser(post) ? '♥' : '♡'}
                                </span>
                                <span className="hidden sm:inline">Like</span>
                              </button>
                              
                              <LikesPreview 
                                post={post}
                                onOpenModal={openLikesModal}
                                previewUsers={likesPreviewData[post.id] || []}
                              />
                            </div>
                          )}

                          {!canUserInteract() && post.likeCount > 0 && (
                            <div className="mb-3 sm:mb-4">
                              <LikesPreview 
                                post={post}
                                onOpenModal={openLikesModal}
                                previewUsers={likesPreviewData[post.id] || []}
                              />
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Replies Section */}
                      {canUserInteract() && editingPost !== post.id && (
                        <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-3 sm:mb-4">
                          
                          {replies[post.id] && replies[post.id].length > 0 && (
                            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                              <h4 className="text-sm font-semibold text-gray-500">Replies:</h4>
                              {replies[post.id].map((reply) => (
                                <div key={reply.id} className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {reply.authorName?.charAt(0)?.toUpperCase() || '?'}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{reply.authorName}</p>
                                        <p className="text-xs text-gray-400">
                                          {reply.createdAt?.toLocaleDateString()} at {reply.createdAt?.toLocaleTimeString()}
                                          {reply.isEdited && (
                                            <span className="ml-1 text-xs text-gray-400 italic">(edited)</span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {canEditReply(reply) && (
                                      <button
                                        onClick={() => startEditingReply(reply)}
                                        className="text-gray-400 hover:text-blue-600 transition-colors text-xs flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
                                        title="Edit reply"
                                      >
                                        &#9998;
                                      </button>
                                    )}
                                  </div>
                                  
                                  {editingReply === reply.id ? (
                                    <div className="space-y-2">
                                      <TextEditorWithLinks
                                        value={editReplyContent}
                                        onChange={setEditReplyContent}
                                        placeholder="Edit your reply..."
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm h-16 sm:h-20 resize-vertical"
                                        maxLength={1000}
                                      />
                                      <div className="flex items-center justify-between">
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => handleEditReply(reply.id)}
                                            disabled={!editReplyContent.trim()}
                                            className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-semibold transition-all duration-300 min-h-[32px]"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={cancelReplyEdit}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-semibold transition-colors duration-300 min-h-[32px]"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap">
                                      {renderContentWithLinks(reply.content)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {replyingTo === post.id ? (
                            <div className="space-y-3">
                              <TextEditorWithLinks
                                value={replyContent}
                                onChange={setReplyContent}
                                placeholder="Write your reply..."
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 h-16 sm:h-20 md:h-24 resize-vertical text-sm sm:text-base"
                                maxLength={1000}
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                  <button
                                    onClick={() => handleSubmitReply(post.id)}
                                    disabled={!replyContent.trim()}
                                    className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 min-h-[36px] flex items-center justify-center"
                                  >
                                    Reply
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyContent('');
                                    }}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[36px] flex items-center justify-center"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReplyingTo(post.id);
                                setEditingReply(null);
                                setEditReplyContent('');
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-300 min-h-[32px] flex items-center"
                            >
                              Reply to this post
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Post Footer */}
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-y-1">
                          <div className="text-gray-500 text-xs sm:text-sm">
                            {post.replyCount || 0} {(post.replyCount || 0) === 1 ? 'reply' : 'replies'}
                          </div>
                          {canEditPost(post) && canUserInteract() && editingPost !== post.id && (
                            <button
                              onClick={() => startEditingPost(post)}
                              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium transition-colors duration-300 flex items-center space-x-1 min-h-[32px]"
                            >
                              <span className="hidden sm:inline">Edit Post</span>
                            </button>
                          )}
                        </div>
                        <Link 
                          to={`/groups/${groupId}/posts/${post.id}`}
                          className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium transition-colors duration-300 flex items-center min-h-[32px]"
                        >
                          <span className="hidden sm:inline">View Discussion</span>
                          <span className="sm:hidden">View</span>
                          <span className="ml-1 sm:ml-2">&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <LikesModal 
        postId={showLikesModal}
        isOpen={!!showLikesModal}
        onClose={closeLikesModal}
        likesData={likesData}
        likeCount={showLikesModal ? (posts.find(p => p.id === showLikesModal)?.likeCount || 0) : 0}
      />

      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .text-gray-700 a[href], .whitespace-pre-wrap a[href] {
          color: #2563eb !important;
          text-decoration: underline;
          transition: color 0.3s ease;
          font-weight: 500;
        }

        .text-gray-700 a[href]:hover, .whitespace-pre-wrap a[href]:hover {
          color: #1d4ed8 !important;
        }

        .whitespace-pre-wrap a {
          word-break: break-word;
          max-width: 100%;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default ProjectGroupView;
