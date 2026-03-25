// src/Pages/projects/ProjectWorkspace.jsx — Per-project workspace with tabs
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { logActivity } from '../../utils/activityLog';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('data');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [workspaceData, setWorkspaceData] = useState({
    meetingSchedule: '',
    communicationTools: '',
    resourceLinks: [],
  });
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const snap = await getDoc(doc(db, 'projects', projectId));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setProject(data);
          if (data.workspace) {
            setWorkspaceData({
              meetingSchedule: data.workspace.meetingSchedule || '',
              communicationTools: data.workspace.communicationTools || '',
              resourceLinks: data.workspace.resourceLinks || [],
            });
          }
        }
      } catch (e) {
        console.error('Error fetching project:', e);
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  const handleSaveWorkspace = async () => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        workspace: {
          meetingSchedule: workspaceData.meetingSchedule,
          communicationTools: workspaceData.communicationTools,
          resourceLinks: workspaceData.resourceLinks,
          updatedAt: new Date(),
        }
      });
      toast.success('Workspace updated');
      setShowSetupModal(false);

      logActivity(projectId, {
        type: 'workspace_updated',
        actor: currentUser?.email,
        actorName: currentUser?.displayName || currentUser?.email,
        description: 'Workspace settings updated',
      });
    } catch (e) {
      toast.error('Failed to save workspace');
    }
  };

  const addResourceLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    setWorkspaceData(prev => ({
      ...prev,
      resourceLinks: [...prev.resourceLinks, { ...newLink, addedAt: new Date() }]
    }));
    setNewLink({ title: '', url: '' });
  };

  const removeResourceLink = (index) => {
    setWorkspaceData(prev => ({
      ...prev,
      resourceLinks: prev.resourceLinks.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'data', label: 'Data' },
    { id: 'resources', label: 'Resource Links' },
    { id: 'collaborators', label: 'Collaborators' },
  ];

  if (loading) {
    return (
      
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      
    );
  }

  if (!project) {
    return (
      
        <div className="text-center py-20">
          <p className="text-gray-900 font-semibold text-lg mb-2">Project not found</p>
          <button onClick={() => navigate('/projects')} className="text-blue-600 text-sm font-medium hover:underline">Back to Projects</button>
        </div>
      
    );
  }

  const isOwner = project.createdBy === currentUser?.uid;

  return (
    
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate(`/projects/${projectId}`)} className="text-gray-400 hover:text-gray-600 text-sm">Back</button>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Workspace</h1>
        <p className="text-gray-500 text-base mb-6">{project.title || 'Untitled Project'}</p>

        {/* Setup CTA */}
        {isOwner && !workspaceData.meetingSchedule && !workspaceData.communicationTools && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <h3 className="text-gray-900 font-semibold text-base mb-2">Complete your workspace details</h3>
            <p className="text-gray-500 text-sm mb-3">Set up meeting schedule, communication tools, and resource links for your team.</p>
            <button onClick={() => setShowSetupModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
              Set Up Workspace
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Data tab */}
        {activeTab === 'data' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {!workspaceData.meetingSchedule && !workspaceData.communicationTools ? (
              <div className="text-center py-10">
                <p className="text-gray-900 font-semibold text-lg mb-2">Welcome to your project workspace</p>
                <p className="text-gray-400 text-sm">Set up your workspace to start collaborating with your team.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workspaceData.meetingSchedule && (
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Meeting Schedule</p>
                    <p className="text-gray-900 text-sm">{workspaceData.meetingSchedule}</p>
                  </div>
                )}
                {workspaceData.communicationTools && (
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Communication Tools</p>
                    <p className="text-gray-900 text-sm">{workspaceData.communicationTools}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resources tab */}
        {activeTab === 'resources' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {workspaceData.resourceLinks.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No resource links added yet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {workspaceData.resourceLinks.map((link, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 text-sm font-medium truncate">{link.title}</p>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline truncate block">{link.url}</a>
                    </div>
                    {isOwner && (
                      <button onClick={() => removeResourceLink(i)} className="text-red-400 hover:text-red-600 text-xs ml-2 flex-shrink-0">Remove</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isOwner && (
              <div className="flex gap-2 mt-4">
                <input type="text" value={newLink.title} onChange={e => setNewLink(p => ({ ...p, title: e.target.value }))} placeholder="Link title" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                <input type="url" value={newLink.url} onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))} placeholder="https://..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                <button onClick={addResourceLink} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
              </div>
            )}
          </div>
        )}

        {/* Collaborators tab */}
        {activeTab === 'collaborators' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {(!project.members || project.members.length === 0) ? (
              <p className="text-gray-400 text-sm text-center py-6">No collaborators yet.</p>
            ) : (
              <div className="space-y-3">
                {project.memberDetails ? (
                  project.memberDetails.map((member, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {(member.displayName || 'U')[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{member.displayName || 'User'}</p>
                        <p className="text-gray-400 text-xs">{member.role || 'Collaborator'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">{project.members.length} collaborator{project.members.length !== 1 ? 's' : ''} on this project.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Setup Modal */}
        {showSetupModal && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowSetupModal(false)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-gray-900 font-bold text-lg">Complete your workspace details</h3>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Meeting Schedule</label>
                <input type="text" value={workspaceData.meetingSchedule} onChange={e => setWorkspaceData(p => ({ ...p, meetingSchedule: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="e.g., Tuesdays and Thursdays at 5pm EST" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Communication Tools</label>
                <input type="text" value={workspaceData.communicationTools} onChange={e => setWorkspaceData(p => ({ ...p, communicationTools: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="e.g., Slack, Discord, Zoom" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowSetupModal(false)} className="flex-1 border border-gray-300 text-gray-700 font-medium text-sm py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveWorkspace} className="flex-1 bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-blue-700">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Save button for owner when editing resources */}
        {isOwner && (activeTab === 'resources') && workspaceData.resourceLinks.length > 0 && (
          <div className="mt-4">
            <button onClick={handleSaveWorkspace} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all">
              Save Workspace
            </button>
          </div>
        )}
      </div>
    
  );
};

export default ProjectWorkspace;
