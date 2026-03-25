// src/Pages/projects/ProjectWorkspace.jsx — Workspace with Forum + Resources
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, arrayUnion, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { logActivity } from '../../utils/activityLog';

const formatTime = (ts) => {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forum');

  // Forum state
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newPostLink, setNewPostLink] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const [showReactors, setShowReactors] = useState(null); // 'postId-emoji' key

  // Resource state
  const [resources, setResources] = useState({ submissionUrl: '', meetingUrl: '', detailsUrl: '', notes: '' });
  const [savingResources, setSavingResources] = useState(false);

  // Team state
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const snap = await getDoc(doc(db, 'projects', projectId));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setProject(data);
          if (data.resources) {
            setResources({
              submissionUrl: data.resources.submissionUrl || '',
              meetingUrl: data.resources.meetingUrl || '',
              detailsUrl: data.resources.detailsUrl || '',
              notes: data.resources.notes || '',
            });
          }
        }
      } catch (e) { console.error('Error fetching project:', e); }
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  // Fetch team members
  useEffect(() => {
    if (!project) return;
    const fetchTeam = async () => {
      try {
        // Get approved applications
        const appQ = query(collection(db, 'project_applications'), where('projectId', '==', projectId), where('status', '==', 'approved'));
        const appSnap = await getDocs(appQ);
        const members = appSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fetch user profiles for each member
        const enriched = await Promise.all(members.map(async (m) => {
          try {
            const userQ = query(collection(db, 'users'), where('email', '==', m.applicantEmail));
            const userSnap = await getDocs(userQ);
            if (!userSnap.empty) {
              const userData = userSnap.docs[0].data();
              return { ...m, photoURL: userData.photoURL || null, displayName: userData.displayName || m.applicantName };
            }
          } catch (e) {}
          return m;
        }));

        // Add owner
        const ownerEntry = {
          applicantName: project.submitterName || project.contactName || 'Project Owner',
          applicantEmail: project.submitterEmail,
          role: 'Project Owner',
          photoURL: project.submitterPhoto || null,
          isOwner: true,
        };
        setTeamMembers([ownerEntry, ...enriched]);
      } catch (e) { console.error('Error fetching team:', e); }
    };
    fetchTeam();
  }, [project, projectId]);

  // Listen to forum posts
  useEffect(() => {
    if (!projectId) return;
    const q = query(collection(db, 'projects', projectId, 'forum'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    if (activeTab === 'forum') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts, activeTab]);

  const isOwner = project?.submitterId === currentUser?.uid || project?.submitterEmail === currentUser?.email;

  // Forum handlers
  const handlePost = async () => {
    if (!newPost.trim() && !newPostLink.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'projects', projectId, 'forum'), {
        text: newPost.trim(),
        link: newPostLink.trim() || null,
        authorId: currentUser.uid,
        authorEmail: currentUser.email,
        authorName: currentUser.displayName || currentUser.email,
        authorEmail: currentUser.email,
        authorPhoto: currentUser.photoURL || null,
        createdAt: serverTimestamp(),
        editedAt: null,
        reactions: {},
        parentId: null,
      });
      setNewPost('');
      setNewPostLink('');
    } catch (e) { toast.error('Failed to post'); }
    setPosting(false);
  };

  const handleReply = async (parentId) => {
    if (!replyText.trim()) return;
    try {
      await addDoc(collection(db, 'projects', projectId, 'forum'), {
        text: replyText.trim(),
        link: null,
        authorId: currentUser.uid,
        authorEmail: currentUser.email,
        authorName: currentUser.displayName || currentUser.email,
        authorEmail: currentUser.email,
        authorPhoto: currentUser.photoURL || null,
        createdAt: serverTimestamp(),
        editedAt: null,
        reactions: {},
        parentId,
      });
      setReplyTo(null);
      setReplyText('');
    } catch (e) { toast.error('Failed to reply'); }
  };

  const handleEdit = async (postId) => {
    if (!editText.trim()) return;
    try {
      await updateDoc(doc(db, 'projects', projectId, 'forum', postId), {
        text: editText.trim(),
        editedAt: serverTimestamp(),
      });
      setEditingPost(null);
      setEditText('');
    } catch (e) { toast.error('Failed to edit'); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try { await deleteDoc(doc(db, 'projects', projectId, 'forum', postId)); } catch (e) { toast.error('Failed to delete'); }
  };

  const handleReact = async (postId, emoji) => {
    try {
      const postRef = doc(db, 'projects', projectId, 'forum', postId);
      const post = posts.find(p => p.id === postId);
      const reactions = post?.reactions || {};
      const key = `reactions.${emoji}`;
      const current = reactions[emoji] || [];
      const updated = current.includes(currentUser.uid) ? current.filter(u => u !== currentUser.uid) : [...current, currentUser.uid];
      await updateDoc(postRef, { [key]: updated });
    } catch (e) { console.error(e); }
  };

  // Resource handlers
  const handleSaveResources = async () => {
    setSavingResources(true);
    try {
      await updateDoc(doc(db, 'projects', projectId), { resources });
      toast.success('Resources updated');
      logActivity(projectId, { type: 'workspace_updated', actor: currentUser?.email, actorName: currentUser?.displayName || currentUser?.email, description: 'Resources updated' });
    } catch (e) { toast.error('Failed to save'); }
    setSavingResources(false);
  };

  const tabs = [
    { id: 'forum', label: 'Discussion' },
    { id: 'resources', label: 'Resources' },
    { id: 'team', label: `Team (${teamMembers.length})` },
  ];

  const topPosts = posts.filter(p => !p.parentId);
  const getReplies = (parentId) => posts.filter(p => p.parentId === parentId);
  const emojis = ['👍', '❤️', '🎉', '🔥', '👀'];

  const getReactorNames = (reactorUids) => {
    if (!reactorUids || reactorUids.length === 0) return [];
    return reactorUids.map(uid => {
      if (uid === currentUser?.uid) return 'You';
      const member = teamMembers.find(m => m.applicantUid === uid || m.applicantEmail === uid);
      return member?.applicantName || member?.displayName || 'Someone';
    });
  };

  // Build uid → name/email map from team members + posts
  const uidNameMap = {};
  teamMembers.forEach(m => { if (m.applicantEmail) uidNameMap[m.applicantEmail] = m.displayName || m.applicantName; });
  posts.forEach(p => { if (p.authorId) uidNameMap[p.authorId] = p.authorName; });

  const getReactorNames = (reactorUids) => {
    if (!reactorUids || reactorUids.length === 0) return '';
    return reactorUids.map(uid => uidNameMap[uid] || 'Someone').join(', ');
  };

  const inputCls = "w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!project) return <div className="text-center py-20"><p className="text-gray-900 font-semibold">Project not found</p></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(`/projects/${projectId}`)} className="text-gray-500 hover:text-gray-900 text-sm mb-4 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Project
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.projectTitle || project.title} — Workspace</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Discussion Forum */}
      {activeTab === 'forum' && (
        <div>
          {/* Posts */}
          <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-1">
            {topPosts.length === 0 && (
              <div className="text-center py-10"><p className="text-gray-400 text-sm">No posts yet. Start a discussion!</p></div>
            )}
            {topPosts.map(post => (
              <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4">
                {/* Post header */}
                <div className="flex items-start gap-3">
                  {post.authorPhoto ? (
                    <img src={post.authorPhoto} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{(post.authorName || 'U')[0].toUpperCase()}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a href={`/profile/${encodeURIComponent(post.authorEmail || '')}`} className="text-gray-900 text-sm font-semibold hover:text-blue-600 hover:underline">{post.authorName}</a>
                      <span className="text-gray-400 text-xs">{formatTime(post.createdAt)}</span>
                      {post.editedAt && <span className="text-gray-400 text-[10px] italic">edited</span>}
                    </div>
                    {/* Content */}
                    {editingPost === post.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea value={editText} onChange={e => setEditText(e.target.value)} className={inputCls + " resize-none"} rows={2} />
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(post.id)} className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg">Save</button>
                          <button onClick={() => setEditingPost(null)} className="text-gray-500 text-xs px-3 py-1.5">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{post.text}</p>
                        {post.link && <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline mt-1 block truncate">{post.link}</a>}
                      </>
                    )}
                    {/* Reactions */}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {emojis.map(emoji => {
                        const reactors = post.reactions?.[emoji] || [];
                        const count = reactors.length;
                        const reacted = reactors.includes(currentUser?.uid);
                        const key = `${post.id}-${emoji}`;
                        return (
                          <div key={emoji} className="relative">
                            <button
                              onClick={() => handleReact(post.id, emoji)}
                              onMouseEnter={() => count > 0 && setShowReactors(key)}
                              onMouseLeave={() => setShowReactors(null)}
                              className={`text-xs px-1.5 py-0.5 rounded-full border transition-all ${reacted ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                              {emoji}{count > 0 && <span className="ml-0.5 text-gray-600">{count}</span>}
                            </button>
                            {showReactors === key && count > 0 && (
                              <div className="absolute bottom-full left-0 mb-1 bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1.5 whitespace-nowrap z-10 shadow-lg">
                                {getReactorNames(reactors).join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <button onClick={() => { setReplyTo(post.id); setReplyText(''); }} className="text-gray-500 text-xs hover:text-blue-600 ml-2">Reply</button>
                      {post.authorId === currentUser?.uid && (
                        <>
                          <button onClick={() => { setEditingPost(post.id); setEditText(post.text); }} className="text-gray-400 text-xs hover:text-gray-600 ml-1">Edit</button>
                          <button onClick={() => handleDelete(post.id)} className="text-gray-400 text-xs hover:text-red-500 ml-1">Delete</button>
                        </>
                      )}
                    </div>
                    {/* Replies */}
                    {getReplies(post.id).length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
                        {getReplies(post.id).map(reply => (
                          <div key={reply.id} className="flex items-start gap-2">
                            {reply.authorPhoto ? (
                              <img src={reply.authorPhoto} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{(reply.authorName || 'U')[0].toUpperCase()}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <a href={`/profile/${encodeURIComponent(reply.authorEmail || '')}`} className="text-gray-900 text-xs font-semibold hover:text-blue-600 hover:underline">{reply.authorName}</a>
                                <span className="text-gray-400 text-[10px]">{formatTime(reply.createdAt)}</span>
                                {reply.editedAt && <span className="text-gray-400 text-[10px] italic">edited</span>}
                              </div>
                              <p className="text-gray-600 text-xs mt-0.5">{reply.text}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {emojis.map(emoji => {
                                  const c = (reply.reactions?.[emoji] || []).length;
                                  const r = (reply.reactions?.[emoji] || []).includes(currentUser?.uid);
                                  return c > 0 || r ? (
                                    <button key={emoji} onClick={() => handleReact(reply.id, emoji)} className={`text-[10px] px-1 py-0.5 rounded-full border ${r ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                                      {emoji}{c > 0 && <span className="ml-0.5">{c}</span>}
                                    </button>
                                  ) : null;
                                })}
                                {reply.authorId === currentUser?.uid && (
                                  <button onClick={() => handleDelete(reply.id)} className="text-gray-400 text-[10px] hover:text-red-500 ml-1">Delete</button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Reply input */}
                    {replyTo === post.id && (
                      <div className="mt-3 flex gap-2">
                        <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply(post.id)} className={inputCls + " text-xs"} placeholder="Write a reply..." />
                        <button onClick={() => handleReply(post.id)} className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0">Reply</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* New post */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)} className={inputCls + " resize-none"} rows={3} placeholder="Share an update, question, or file..." />
            <div className="flex items-center gap-3">
              <input value={newPostLink} onChange={e => setNewPostLink(e.target.value)} className={inputCls + " text-xs flex-1"} placeholder="Attach a link (optional)" />
              <button onClick={handlePost} disabled={posting || (!newPost.trim() && !newPostLink.trim())} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-50 transition-all flex-shrink-0">
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          {/* Display resources */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Project Resources</h3>
            {resources.submissionUrl ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div><p className="text-gray-500 text-xs font-medium">Project Submission URL</p><a href={resources.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline truncate block">{resources.submissionUrl}</a></div>
              </div>
            ) : <p className="text-gray-400 text-xs">No submission URL set</p>}

            {resources.meetingUrl ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div><p className="text-gray-500 text-xs font-medium">Meeting URL</p><a href={resources.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline truncate block">{resources.meetingUrl}</a></div>
              </div>
            ) : <p className="text-gray-400 text-xs">No meeting URL set</p>}

            {resources.detailsUrl ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div><p className="text-gray-500 text-xs font-medium">Project Details URL</p><a href={resources.detailsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline truncate block">{resources.detailsUrl}</a></div>
              </div>
            ) : <p className="text-gray-400 text-xs">No details URL set</p>}

            {resources.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-xs font-medium mb-1">Important Notes</p>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{resources.notes}</p>
              </div>
            )}
          </div>

          {/* Edit resources — owner only */}
          {isOwner && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-bold text-gray-900">Edit Resources</h3>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1">Project Submission URL</label>
                <input type="url" value={resources.submissionUrl} onChange={e => setResources(p => ({ ...p, submissionUrl: e.target.value }))} className={inputCls} placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1">Meeting URL</label>
                <input type="url" value={resources.meetingUrl} onChange={e => setResources(p => ({ ...p, meetingUrl: e.target.value }))} className={inputCls} placeholder="https://zoom.us/... or Google Meet link" />
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1">Project Details URL</label>
                <input type="url" value={resources.detailsUrl} onChange={e => setResources(p => ({ ...p, detailsUrl: e.target.value }))} className={inputCls} placeholder="https://docs.google.com/..." />
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1">Important Notes</label>
                <textarea value={resources.notes} onChange={e => setResources(p => ({ ...p, notes: e.target.value }))} className={inputCls + " resize-none"} rows={3} placeholder="Any important updates or notes for the team..." />
              </div>
              <button onClick={handleSaveResources} disabled={savingResources} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all disabled:opacity-50">
                {savingResources ? 'Saving...' : 'Save Resources'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Team */}
      {activeTab === 'team' && (
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">Team Members</h3>
            {teamMembers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No team members yet.</p>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {member.photoURL ? (
                      <img src={member.photoURL} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(member.applicantName || member.displayName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <a href={`/profile/${encodeURIComponent(member.applicantEmail)}`} className="text-gray-900 text-sm font-semibold hover:text-blue-600 hover:underline">
                        {member.displayName || member.applicantName}
                      </a>
                      <p className="text-gray-500 text-xs">{member.role}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {member.portfolioUrl && <a href={member.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-[10px] hover:underline">Portfolio</a>}
                        {member.linkedinUrl && <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-[10px] hover:underline">LinkedIn</a>}
                      </div>
                    </div>
                    {member.isOwner && (
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">Owner</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-gray-900 text-sm font-semibold mb-0.5">Keep all project conversations here</p>
          <p className="text-gray-600 text-xs leading-relaxed">Use the Discussion tab for all project communications. In case of any payment dispute, conversations logged here serve as your record and can be reviewed by admins.</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspace;
