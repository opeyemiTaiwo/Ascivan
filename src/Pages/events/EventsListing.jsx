// src/Pages/events/EventsListing.jsx - FULLY RESPONSIVE WITH BLUE/ORANGE THEME

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

const EventsListing = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    eventType: '',
    timeframe: '',
    format: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyingToEvent, setApplyingToEvent] = useState({});
  const [userAttendance, setUserAttendance] = useState({});

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { 
        replace: true,
        state: { from: '/events', message: 'Please sign in to view and register for events' }
      });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !currentUser) {
      return;
    }

    const fetchEvents = async () => {
      try {
        const q = query(
          collection(db, 'tech_events'),
          where('status', '==', 'approved'),
          orderBy('startDate', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const eventsData = snapshot.docs.map(doc => {
            const data = doc.data();
            
            let startDate, endDate;
            
            if (data.startDate && data.endDate) {
              startDate = data.startDate?.toDate?.()?.toISOString() || new Date(data.startDate).toISOString();
              endDate = data.endDate?.toDate?.()?.toISOString() || new Date(data.endDate).toISOString();
            } else {
              const eventDate = data.eventDate?.toDate?.()?.toISOString() || new Date().toISOString();
              startDate = eventDate;
              endDate = new Date(new Date(startDate).getTime() + (60 * 60 * 1000)).toISOString();
            }

            return {
              id: doc.id,
              ...data,
              startDate: startDate,
              endDate: endDate,
              isMultiDay: new Date(startDate).toDateString() !== new Date(endDate).toDateString(),
              attendeeCount: data.attendeeCount || 0,
              maxAttendees: data.maxAttendees || null
            };
          });

          const currentTime = new Date();
          const upcomingEvents = eventsData.filter(event => 
            new Date(event.endDate) > currentTime
          );

          setEvents(upcomingEvents);
          setFilteredEvents(upcomingEvents);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching events:', error);
          setEvents([]);
          setFilteredEvents([]);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up Firebase listener:', error);
        setEvents([]);
        setFilteredEvents([]);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser, authLoading]);

  useEffect(() => {
    if (!currentUser || events.length === 0) return;

    const fetchAttendanceStatus = async () => {
      try {
        const batchSize = 10;
        const eventBatches = [];
        
        for (let i = 0; i < events.length; i += batchSize) {
          eventBatches.push(events.slice(i, i + batchSize));
        }

        const attendanceMap = {};

        for (const batch of eventBatches) {
          const eventIds = batch.map(e => e.id);
          
          const attendanceQuery = query(
            collection(db, 'event_attendees'),
            where('userId', '==', currentUser.uid),
            where('eventId', 'in', eventIds)
          );

          const attendanceSnapshot = await getDocs(attendanceQuery);
          
          attendanceSnapshot.docs.forEach(doc => {
            const data = doc.data();
            attendanceMap[data.eventId] = {
              id: doc.id,
              status: data.status,
              appliedAt: data.appliedAt?.toDate()
            };
          });
        }

        setUserAttendance(attendanceMap);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendanceStatus();
  }, [currentUser, events]);

  useEffect(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.eventDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.tags?.join(' ').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !selectedFilters.eventType || event.eventType === selectedFilters.eventType;
      const matchesFormat = !selectedFilters.format || event.format === selectedFilters.format;
      
      let matchesTimeframe = true;
      if (selectedFilters.timeframe) {
        const eventStartDate = new Date(event.startDate);
        const now = new Date();
        const daysDiff = Math.ceil((eventStartDate - now) / (1000 * 60 * 60 * 24));
        
        switch (selectedFilters.timeframe) {
          case 'this-week':
            matchesTimeframe = daysDiff <= 7;
            break;
          case 'this-month':
            matchesTimeframe = daysDiff <= 30;
            break;
          case 'next-month':
            matchesTimeframe = daysDiff > 30 && daysDiff <= 60;
            break;
          default:
            matchesTimeframe = true;
        }
      }

      return matchesSearch && matchesType && matchesFormat && matchesTimeframe;
    });

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedFilters]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      eventType: '',
      timeframe: '',
      format: ''
    });
    setSearchQuery('');
  };

  const applyToAttendEvent = async (event) => {
    if (!currentUser) {
      toast.error('Please sign in to register for events');
      navigate('/login');
      return;
    }

    setApplyingToEvent(prev => ({ ...prev, [event.id]: true }));

    try {
      const attendanceData = {
        eventId: event.id,
        eventTitle: event.eventTitle,
        eventDate: event.startDate,
        
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email,
        userPhoto: currentUser.photoURL || null,
        
        status: 'registered',
        appliedAt: serverTimestamp(),
        registeredAt: serverTimestamp(),
        
        eventType: event.eventType,
        eventStartDate: event.startDate,
        eventEndDate: event.endDate,
        meetingUrl: event.meetingUrl,
        organizerEmail: event.organizerEmail,
        organizerName: event.organizerName
      };

      const docRef = await addDoc(collection(db, 'event_attendees'), attendanceData);

      await updateDoc(doc(db, 'tech_events', event.id), {
        attendeeCount: increment(1),
        attendees: arrayUnion(currentUser.uid)
      });

      setUserAttendance(prev => ({
        ...prev,
        [event.id]: {
          id: docRef.id,
          status: 'registered',
          appliedAt: new Date()
        }
      }));

      toast.success(`Registered for "${event.eventTitle}"!`);

    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Error registering for event: ' + error.message);
    } finally {
      setApplyingToEvent(prev => ({ ...prev, [event.id]: false }));
    }
  };

  const cancelAttendance = async (eventId, attendanceId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel your registration?');
    if (!confirmCancel) return;

    try {
      await deleteDoc(doc(db, 'event_attendees', attendanceId));

      await updateDoc(doc(db, 'tech_events', eventId), {
        attendeeCount: increment(-1),
        attendees: arrayRemove(currentUser.uid)
      });

      setUserAttendance(prev => {
        const updated = { ...prev };
        delete updated[eventId];
        return updated;
      });

      toast.success('Registration cancelled successfully');

    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('Error cancelling registration');
    }
  };

  const formatEventDateTime = (event) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const isMultiDay = event.isMultiDay;
    
    if (isMultiDay) {
      const startFormatted = startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const endFormatted = endDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return {
        primary: `${startFormatted} - ${endFormatted}`,
        duration: calculateEventDuration(event.startDate, event.endDate)
      };
    } else {
      const dateFormatted = startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const startTime = startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const endTime = endDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return {
        primary: `${dateFormatted}`,
        time: `${startTime} - ${endTime}`,
        duration: calculateEventDuration(event.startDate, event.endDate)
      };
    }
  };

  const calculateEventDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end - start;
    
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      if (hours === 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
      }
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      if (minutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      }
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
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

  const addToGoogleCalendar = (event) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const eventDetails = `${event.eventDescription}\n\n` +
                        `${event.learningObjectives ? `What you'll learn:\n${event.learningObjectives}\n\n` : ''}` +
                        `${event.requirements ? `Requirements:\n${event.requirements}\n\n` : ''}` +
                        `${event.meetingUrl ? `Join here: ${event.meetingUrl}` : ''}`;

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.eventTitle)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(event.meetingUrl || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  if (authLoading || (currentUser && loading)) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-3 xs:px-4">
          <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-6 xs:p-7 sm:p-8 border border-white/20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-base xs:text-lg">
              {authLoading ? 'Checking authentication...' : 'Loading tech events...'}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        
        <main className="pt-16 xs:pt-18 sm:pt-20 pb-12 xs:pb-14 sm:pb-16">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-12 md:py-16 max-w-7xl">
            
            <section className="relative mb-12 xs:mb-16 sm:mb-20 md:mb-24 pt-6 xs:pt-8 sm:pt-12 md:pt-16">
              <div className="max-w-4xl mx-auto text-center">
                
                <div className="mb-4 xs:mb-5 sm:mb-6 p-3 xs:p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg xs:rounded-xl border border-blue-500/20">
                  <p className="text-blue-300 font-semibold text-xs xs:text-sm sm:text-base">
                    Welcome, {currentUser.displayName || currentUser.email}! Discover and register for amazing tech events.
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-6 md:mb-8 animate-pulse">
                  <div className="h-2 w-2 xs:h-3 xs:w-3 sm:h-4 sm:w-4 bg-blue-400 rounded-full animate-ping shadow-lg" 
                       style={{boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)'}}></div>
                  <span className="text-blue-300 uppercase tracking-widest text-[10px] xs:text-xs sm:text-sm md:text-base font-black" 
                        style={{
                          textShadow: '0 0 20px rgba(59, 130, 246, 0.8), 2px 2px 4px rgba(0,0,0,0.9)',
                          fontFamily: '"Inter", sans-serif'
                        }}>
                    Loomiq Events
                  </span>
                  <div className="h-2 w-2 xs:h-3 xs:w-3 sm:h-4 sm:w-4 bg-blue-400 rounded-full animate-ping shadow-lg" 
                       style={{boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)'}}></div>
                </div>
                
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-5 sm:mb-6 md:mb-8 lg:mb-12 leading-[0.9] tracking-tight"
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #ffffff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(59, 130, 246, 0.2)',
                      filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.9))'
                    }}>
                  Discover Tech{' '}
                  <span className="block mt-1 xs:mt-2 sm:mt-3 md:mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-500"
                        style={{
                          textShadow: 'none',
                          filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
                          animation: 'glow 2s ease-in-out infinite alternate'
                        }}>
                    Events
                  </span>
                </h1>

                <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed font-light mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12 px-2" 
                   style={{
                     textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                     fontFamily: '"Inter", sans-serif'
                   }}>
                  Join workshops, webinars, and talks from tech professionals. 
                  <span className="text-blue-300 font-semibold"> Register instantly</span> and grow your skills.
                </p>
                
                <div className="h-1 xs:h-1.5 sm:h-2 w-12 xs:w-16 sm:w-20 md:w-24 lg:w-32 bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto rounded-full shadow-2xl mb-6 xs:mb-8 sm:mb-10 md:mb-12 lg:mb-16"
                     style={{boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'}}></div>
              </div>
            </section>

            <section className="mb-8 xs:mb-10 sm:mb-12">
              <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-8 border border-white/20 shadow-2xl">
                
                <div className="mb-4 xs:mb-5 sm:mb-6">
                  <div className="relative">
                    <svg className="absolute left-3 xs:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search events by title, description, or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl pl-10 xs:pl-12 pr-4 xs:pr-5 sm:pr-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-sm xs:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xs:gap-4 mb-4 xs:mb-5 sm:mb-6">
                  
                  <select
                    value={selectedFilters.eventType}
                    onChange={(e) => handleFilterChange('eventType', e.target.value)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-xs xs:text-sm sm:text-base"
                  >
                    <option value="">All Event Types</option>
                    <option value="workshop">Workshops</option>
                    <option value="webinar">Webinars</option>
                    <option value="talk">Talks & Panels</option>
                    <option value="conference">Conferences</option>
                  </select>

                  <select
                    value={selectedFilters.format}
                    onChange={(e) => handleFilterChange('format', e.target.value)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-xs xs:text-sm sm:text-base"
                  >
                    <option value="">All Formats</option>
                    <option value="online">Online</option>
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>

                  <select
                    value={selectedFilters.timeframe}
                    onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-xs xs:text-sm sm:text-base"
                  >
                    <option value="">All Timeframes</option>
                    <option value="this-week">This Week</option>
                    <option value="this-month">This Month</option>
                    <option value="next-month">Next Month</option>
                  </select>
                </div>

                <div className="flex justify-between items-center text-xs xs:text-sm sm:text-base">
                  <div className="text-gray-300">
                    <span className="text-blue-300 font-semibold">{filteredEvents.length}</span> events found
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-blue-300 hover:text-white font-semibold transition-colors duration-300 min-h-[44px] px-3 xs:px-4 py-2 rounded-lg hover:bg-white/5 active:bg-white/10"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </section>

            <section>
              {loading ? (
                <div className="text-center py-12 xs:py-14 sm:py-16 md:py-20">
                  <div className="animate-spin rounded-full h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-gray-300 text-base xs:text-lg sm:text-xl">Loading events...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12 xs:py-14 sm:py-16 md:py-20 px-4">
                  <svg className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 mx-auto mb-4 xs:mb-5 sm:mb-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-3 xs:mb-4">No upcoming events</h3>
                  <p className="text-gray-300 text-sm xs:text-base sm:text-lg mb-6 xs:mb-7 sm:mb-8 max-w-md mx-auto">
                    {events.length === 0 
                      ? 'Check back soon for new tech events, workshops, and webinars!'
                      : 'No events match your search criteria. Try adjusting your filters.'
                    }
                  </p>
                  <button 
                    onClick={() => navigate('/events/submit')}
                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 text-white px-6 xs:px-8 sm:px-10 md:px-12 py-3 xs:py-4 rounded-full font-bold text-sm xs:text-base sm:text-lg transition-all duration-500 transform hover:scale-110 active:scale-95 shadow-2xl min-h-[56px] flex items-center gap-2 mx-auto"
                    style={{
                      boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)',
                      fontFamily: '"Inter", sans-serif'
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Host Your Event
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                  {filteredEvents.map((event) => {
                    const dateTimeInfo = formatEventDateTime(event);
                    const attendance = userAttendance[event.id];
                    const isRegistered = attendance?.status === 'registered';
                    const isEventFull = event.maxAttendees && event.attendeeCount >= event.maxAttendees;
                    
                    return (
                      <div key={event.id} className="group">
                        <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-lg xs:rounded-xl p-4 xs:p-5 sm:p-6 md:p-8 border border-white/20 shadow-2xl transform hover:scale-105 active:scale-100 transition-all duration-500 h-full flex flex-col">
                          
                          <div className="mb-4 xs:mb-5 sm:mb-6">
                            <div className="flex items-start justify-between mb-3 xs:mb-4">
                              <div className="flex items-center mb-2">
                                <span className="bg-white/10 text-blue-300 px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-medium border border-white/20">
                                  {formatEventType(event.eventType)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 xs:gap-2">
                                <span className="bg-cyan-500/20 text-cyan-300 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded text-[10px] xs:text-xs">
                                  {event.format}
                                </span>
                                {event.isMultiDay && (
                                  <span className="bg-orange-500/20 text-orange-300 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded text-[10px] xs:text-xs">
                                    Multi-day
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-black text-white group-hover:text-blue-300 transition-colors duration-300" 
                                style={{
                                  textShadow: '0 0 15px rgba(255,255,255,0.2), 2px 2px 4px rgba(0,0,0,0.8)',
                                  fontFamily: '"Inter", sans-serif'
                                }}>
                              {event.eventTitle}
                            </h3>
                            
                            <div className="flex items-center text-gray-400 text-xs xs:text-sm mt-2 xs:mt-3 gap-2 xs:gap-3 sm:gap-4">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="truncate">{event.organizerName}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {dateTimeInfo.duration}
                              </span>
                            </div>
                          </div>

                          <div className="mb-3 xs:mb-4 p-3 xs:p-4 bg-white/5 rounded-lg xs:rounded-xl border border-white/10">
                            <div className="text-blue-300 font-semibold text-xs xs:text-sm mb-1 flex items-center gap-1.5">
                              <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {event.isMultiDay ? 'Event Dates' : 'Event Date & Time'}
                            </div>
                            <div className="text-white text-xs xs:text-sm">
                              <div>{dateTimeInfo.primary}</div>
                              {dateTimeInfo.time && (
                                <div className="text-gray-300 text-[10px] xs:text-xs mt-1">{dateTimeInfo.time}</div>
                              )}
                            </div>
                          </div>

                          <div className="mb-3 xs:mb-4 p-2.5 xs:p-3 bg-white/5 rounded-lg xs:rounded-xl border border-white/10">
                            <div className="flex items-center justify-between text-xs xs:text-sm">
                              <span className="text-gray-300">
                                {event.attendeeCount || 0} {event.attendeeCount === 1 ? 'attendee' : 'attendees'}
                              </span>
                              {event.maxAttendees && (
                                <span className="text-gray-400">
                                  Max: {event.maxAttendees}
                                </span>
                              )}
                            </div>
                            {isEventFull && (
                              <div className="mt-2 text-red-400 text-[10px] xs:text-xs font-semibold">
                                Event is full
                              </div>
                            )}
                          </div>

                          <div className="mb-4 xs:mb-5 sm:mb-6 flex-grow">
                            <p className="text-gray-200 leading-relaxed text-xs xs:text-sm sm:text-base line-clamp-3" 
                               style={{
                                 textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                 fontFamily: '"Inter", sans-serif'
                               }}>
                              {event.eventDescription}
                            </p>
                          </div>

                          {event.learningObjectives && (
                            <div className="mb-3 xs:mb-4">
                              <div className="text-orange-300 font-semibold text-xs xs:text-sm mb-1.5 xs:mb-2 flex items-center gap-1.5">
                                <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                What You'll Learn
                              </div>
                              <p className="text-gray-300 text-xs xs:text-sm line-clamp-2">{event.learningObjectives}</p>
                            </div>
                          )}

                          {event.tags && event.tags.length > 0 && (
                            <div className="mb-4 xs:mb-5 sm:mb-6">
                              <div className="flex flex-wrap gap-1.5 xs:gap-2">
                                {event.tags.slice(0, 4).map((tag, index) => (
                                  <span key={index} className="bg-white/10 text-gray-300 px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-medium border border-white/20">
                                    {tag}
                                  </span>
                                ))}
                                {event.tags.length > 4 && (
                                  <span className="bg-white/10 text-gray-300 px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-medium border border-white/20">
                                    +{event.tags.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2 xs:space-y-2.5 sm:space-y-3">
                            
                            {!isRegistered ? (
                              <button
                                onClick={() => applyToAttendEvent(event)}
                                disabled={applyingToEvent[event.id] || isEventFull}
                                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 hover:scale-105 active:scale-95 disabled:from-gray-500 disabled:to-gray-600 disabled:scale-100 text-white px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 min-h-[44px] text-sm xs:text-base"
                                style={{
                                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                                  fontFamily: '"Inter", sans-serif'
                                }}
                              >
                                {applyingToEvent[event.id] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Registering...
                                  </>
                                ) : isEventFull ? (
                                  'Event Full'
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Register to Attend
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="space-y-2">
                                <div className="w-full bg-green-500/20 border-2 border-green-500/50 text-green-300 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg font-bold text-center min-h-[44px] flex items-center justify-center gap-2 text-sm xs:text-base">
                                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Registered
                                </div>
                                <button
                                  onClick={() => cancelAttendance(event.id, attendance.id)}
                                  className="w-full bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 text-red-300 px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg font-semibold text-xs xs:text-sm transition-colors border border-red-500/30 min-h-[44px]"
                                >
                                  Cancel Registration
                                </button>
                              </div>
                            )}
                            
                            {isRegistered && (
                              <button
                                onClick={() => addToGoogleCalendar(event)}
                                className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 active:bg-cyan-600/40 text-cyan-300 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg font-semibold transition-all duration-300 border border-cyan-500/30 flex items-center justify-center gap-2 min-h-[44px] text-sm xs:text-base"
                              >
                                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Add to Calendar
                              </button>
                            )}
                            
                            {isRegistered && event.meetingUrl && (
                              <button
                                onClick={() => window.open(event.meetingUrl, '_blank')}
                                className="w-full bg-blue-600/20 hover:bg-blue-600/30 active:bg-blue-600/40 text-blue-300 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg font-semibold transition-all duration-300 border border-blue-500/30 flex items-center justify-center gap-2 min-h-[44px] text-sm xs:text-base"
                              >
                                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Join Event Link
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="mt-12 xs:mt-14 sm:mt-16 text-center">
              <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-6 xs:p-7 sm:p-8 md:p-12 border border-white/20 shadow-2xl">
                <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-white mb-4 xs:mb-5 sm:mb-6"
                    style={{
                      textShadow: '0 0 20px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.9)',
                      fontFamily: '"Inter", sans-serif'
                    }}>
                  Host Your Own Tech Event
                </h2>
                <p className="text-base xs:text-lg sm:text-xl text-gray-200 mb-6 xs:mb-7 sm:mb-8 max-w-2xl mx-auto px-2"
                   style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>
                  Share your expertise through workshops, webinars, or talks. Your event will be published instantly and visible to the community.
                </p>
                <button 
                  onClick={() => navigate('/events/submit')}
                  className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 text-white px-8 xs:px-10 sm:px-12 py-3 xs:py-4 sm:py-5 rounded-full font-black text-base xs:text-lg sm:text-xl transition-all duration-500 transform hover:scale-110 active:scale-95 shadow-2xl min-h-[56px] inline-flex items-center gap-2"
                  style={{
                    boxShadow: '0 0 40px rgba(59, 130, 246, 0.4), 0 20px 40px rgba(0,0,0,0.3)',
                    fontFamily: '"Inter", sans-serif'
                  }}
                >
                  <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Your Event
                </button>
              </div>
            </section>
          </div>
        </main>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
          
          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5)); }
            50% { filter: drop-shadow(0 0 40px rgba(59, 130, 246, 0.8)); }
          }
          
          * { font-family: 'Inter', sans-serif; }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
          ::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.5); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.7); }

          input:focus, textarea:focus, select:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          select option {
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
          }

          @media (min-width: 375px) {
            .xs\\:inline { display: inline; }
            .xs\\:hidden { display: none; }
          }
        `}</style>
      </div>
    </>
  );
};

export default EventsListing;
