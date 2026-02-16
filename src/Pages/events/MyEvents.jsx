// src/Pages/events/MyEvents.jsx - FULLY RESPONSIVE WITH UNIVERSAL NAVBAR

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc,
  deleteDoc,
  getDocs 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

const MyEvents = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [hostedEvents, setHostedEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hosted');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { 
        replace: true,
        state: { from: '/events/my-events', message: 'Please sign in to view your events' }
      });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const eventsQuery = query(
      collection(db, 'tech_events'),
      where('submitterEmail', '==', currentUser.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        eventDate: doc.data().eventDate?.toDate(),
        registrationDeadline: doc.data().registrationDeadline?.toDate()
      }));
      
      setHostedEvents(events);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching hosted events:', error);
      toast.error('Error loading your events');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchRegisteredEvents = async () => {
      try {
        const attendeesQuery = query(
          collection(db, 'event_attendees'),
          where('userEmail', '==', currentUser.email)
        );
        
        const attendeesSnapshot = await getDocs(attendeesQuery);
        const eventIds = attendeesSnapshot.docs.map(doc => doc.data().eventId);

        if (eventIds.length === 0) {
          setRegisteredEvents([]);
          return;
        }

        const eventsPromises = eventIds.map(async (eventId) => {
          const eventDoc = await getDocs(query(
            collection(db, 'tech_events'),
            where('__name__', '==', eventId)
          ));
          
          if (!eventDoc.empty) {
            const eventData = eventDoc.docs[0].data();
            return {
              id: eventDoc.docs[0].id,
              ...eventData,
              createdAt: eventData.createdAt?.toDate(),
              eventDate: eventData.eventDate?.toDate(),
              registrationDeadline: eventData.registrationDeadline?.toDate()
            };
          }
          return null;
        });

        const events = (await Promise.all(eventsPromises)).filter(e => e !== null);
        setRegisteredEvents(events);
      } catch (error) {
        console.error('Error fetching registered events:', error);
      }
    };

    fetchRegisteredEvents();
  }, [currentUser]);

  const sortEvents = (events) => {
    return [...events].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'upcoming':
          return a.eventDate - b.eventDate;
        case 'attendees':
          return (b.attendeeCount || 0) - (a.attendeeCount || 0);
        default:
          return 0;
      }
    });
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'tech_events', eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleCancelEvent = async (eventId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'cancelled' ? 'active' : 'cancelled';
      await updateDoc(doc(db, 'tech_events', eventId), {
        status: newStatus,
        cancelledAt: newStatus === 'cancelled' ? new Date() : null
      });
      toast.success(`Event ${newStatus === 'cancelled' ? 'cancelled' : 'reactivated'} successfully`);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown';
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
      }
    }
    
    return 'Just now';
  };

  const getEventStatus = (event) => {
    const now = new Date();
    
    if (event.status === 'cancelled') {
      return { label: 'Cancelled', color: 'bg-red-500', textColor: 'text-white' };
    }
    
    if (event.eventDate && event.eventDate < now) {
      return { label: 'Completed', color: 'bg-gray-500', textColor: 'text-white' };
    }
    
    if (event.registrationDeadline && event.registrationDeadline < now) {
      return { label: 'Registration Closed', color: 'bg-orange-500', textColor: 'text-white' };
    }
    
    return { label: 'Upcoming', color: 'bg-green-500', textColor: 'text-white' };
  };

  const formatEventType = (type) => {
    const typeMap = {
      'workshop': 'Workshop',
      'webinar': 'Webinar',
      'talk': 'Talk/Panel',
      'conference': 'Conference',
      'meetup': 'Meetup'
    };
    return typeMap[type] || type;
  };

  if (authLoading || !currentUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-3 xs:px-4">
          <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-6 xs:p-7 sm:p-8 border border-white/20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-base xs:text-lg">Loading your events...</p>
          </div>
        </div>
      </>
    );
  }

  const displayEvents = activeTab === 'hosted' 
    ? sortEvents(hostedEvents) 
    : sortEvents(registeredEvents);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        
        <main className="pt-16 xs:pt-18 sm:pt-20 pb-12 xs:pb-14 sm:pb-16">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-12 md:py-16 max-w-7xl">
            
            <section className="text-center mb-8 xs:mb-10 sm:mb-12">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black mb-3 xs:mb-4"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #ffffff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(255,255,255,0.3)',
                    filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.9))'
                  }}>
                My{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-500">
                  Events
                </span>
              </h1>
              <p className="text-sm xs:text-base sm:text-lg text-gray-200 mb-4 xs:mb-5 sm:mb-6">
                Manage your hosted and registered events
              </p>
              
              <div className="flex justify-center gap-2 xs:gap-3 sm:gap-4 mb-6 xs:mb-7 sm:mb-8">
                <button
                  onClick={() => setActiveTab('hosted')}
                  className={`px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 rounded-lg xs:rounded-xl font-bold transition-all min-h-[44px] text-sm xs:text-base ${
                    activeTab === 'hosted'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg active:scale-95'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 active:bg-white/30'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Hosted ({hostedEvents.length})
                </button>
                <button
                  onClick={() => setActiveTab('registered')}
                  className={`px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 rounded-lg xs:rounded-xl font-bold transition-all min-h-[44px] text-sm xs:text-base ${
                    activeTab === 'registered'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg active:scale-95'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 active:bg-white/30'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Registered ({registeredEvents.length})
                </button>
              </div>
            </section>

            <section className="mb-6 xs:mb-7 sm:mb-8">
              <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-2 xs:mb-3 text-sm xs:text-base flex items-center gap-2">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sort By
                </h3>
                <div className="flex flex-wrap gap-1.5 xs:gap-2">
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-all text-xs xs:text-sm min-h-[44px] ${
                      sortBy === 'newest'
                        ? 'bg-blue-500 text-white active:bg-blue-600'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 active:bg-white/30'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setSortBy('oldest')}
                    className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-all text-xs xs:text-sm min-h-[44px] ${
                      sortBy === 'oldest'
                        ? 'bg-blue-500 text-white active:bg-blue-600'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 active:bg-white/30'
                    }`}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => setSortBy('upcoming')}
                    className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-all text-xs xs:text-sm min-h-[44px] ${
                      sortBy === 'upcoming'
                        ? 'bg-blue-500 text-white active:bg-blue-600'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 active:bg-white/30'
                    }`}
                  >
                    Event Date
                  </button>
                  {activeTab === 'hosted' && (
                    <button
                      onClick={() => setSortBy('attendees')}
                      className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-all text-xs xs:text-sm min-h-[44px] ${
                        sortBy === 'attendees'
                          ? 'bg-blue-500 text-white active:bg-blue-600'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20 active:bg-white/30'
                      }`}
                    >
                      Most Attendees
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section>
              {loading ? (
                <div className="text-center py-12 xs:py-14 sm:py-16">
                  <div className="animate-spin rounded-full h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-white text-base xs:text-lg">Loading your events...</p>
                </div>
              ) : displayEvents.length === 0 ? (
                <div className="text-center py-12 xs:py-14 sm:py-16 px-4">
                  <svg className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 mx-auto mb-4 xs:mb-5 sm:mb-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-3 xs:mb-4">
                    {activeTab === 'hosted' ? 'No Events Hosted' : 'No Events Registered'}
                  </h3>
                  <p className="text-gray-400 mb-6 xs:mb-7 sm:mb-8 text-sm xs:text-base">
                    {activeTab === 'hosted' 
                      ? "You haven't created any events yet"
                      : "You haven't registered for any events yet"}
                  </p>
                  {activeTab === 'hosted' ? (
                    <Link
                      to="/events/submit"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 xs:px-8 py-3 xs:py-4 rounded-lg xs:rounded-xl font-bold hover:from-blue-600 hover:to-cyan-700 active:scale-95 transition-all min-h-[56px] text-sm xs:text-base"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Event
                    </Link>
                  ) : (
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 xs:px-8 py-3 xs:py-4 rounded-lg xs:rounded-xl font-bold hover:from-blue-600 hover:to-cyan-700 active:scale-95 transition-all min-h-[56px] text-sm xs:text-base"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Browse Events
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                  {displayEvents.map(event => {
                    const statusBadge = getEventStatus(event);
                    
                    return (
                      <div
                        key={event.id}
                        className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 border border-white/20 hover:border-blue-400/40 transition-all"
                      >
                        <div className="mb-3 xs:mb-4">
                          <div className="flex items-center gap-1.5 xs:gap-2 mb-2 flex-wrap">
                            <span className="px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs xs:text-sm font-semibold">
                              {formatEventType(event.eventType)}
                            </span>
                            <span className={`px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 ${statusBadge.color} ${statusBadge.textColor} rounded-full text-xs xs:text-sm font-semibold`}>
                              {statusBadge.label}
                            </span>
                          </div>
                          <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white mb-2">{event.eventTitle}</h3>
                          <p className="text-gray-300 text-xs xs:text-sm line-clamp-2">{event.eventDescription}</p>
                        </div>

                        <div className="space-y-1.5 xs:space-y-2 mb-3 xs:mb-4 text-xs xs:text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Event Date: <span className="text-white">{formatDate(event.eventDate)}</span>
                          </div>
                          {event.eventLocation && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Location: <span className="text-white">{event.eventLocation}</span>
                            </div>
                          )}
                          {activeTab === 'hosted' && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              Attendees: <span className="text-white">{event.attendeeCount || 0}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Created: {formatTimeAgo(event.createdAt)}
                          </div>
                        </div>

                        {activeTab === 'hosted' ? (
                          <div className="flex gap-2">
                            <Link
                              to={`/events/edit/${event.id}`}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg font-semibold text-center transition-all min-h-[44px] flex items-center justify-center gap-1.5 text-xs xs:text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Link>
                            <button
                              onClick={() => handleCancelEvent(event.id, event.status)}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg font-semibold transition-all min-h-[44px] flex items-center justify-center gap-1.5 text-xs xs:text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              {event.status === 'cancelled' ? 'Reactivate' : 'Cancel'}
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg font-semibold transition-all min-h-[44px] flex items-center justify-center text-xs xs:text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {event.meetingUrl && (
                              <a
                                href={event.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg font-semibold text-center transition-all min-h-[44px] flex items-center justify-center gap-2 text-xs xs:text-sm"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Event Details
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
          
          * { font-family: 'Inter', sans-serif; }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
          ::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.5); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.7); }

          @media (min-width: 375px) {
            .xs\\:inline { display: inline; }
            .xs\\:hidden { display: none; }
          }
        `}</style>
      </div>
    </>
  );
};

export default MyEvents;
