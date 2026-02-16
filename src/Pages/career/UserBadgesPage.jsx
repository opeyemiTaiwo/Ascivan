// src/Pages/career/UserBadgesPage.jsx - Fully Responsive

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const UserBadgesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userBadges, setUserBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  const badgeCategories = {
    'mentorship': {
      id: 'techmo',
      name: 'TechMO Badges',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-200',
      image: '/Images/TechMO.png'
    },
    'quality-assurance': {
      id: 'techqa',
      name: 'TechQA Badges',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      image: '/Images/TechQA.png'
    },
    'development': {
      id: 'techdev',
      name: 'TechDev Badges',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      image: '/Images/TechDev.png'
    },
    'leadership': {
      id: 'techleads',
      name: 'TechLeads Badges',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      image: '/Images/TechLeads.png'
    },
    'design': {
      id: 'techarchs',
      name: 'TechArchs Badges',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      image: '/Images/TechArchs.png'
    },
    'security': {
      id: 'techguard',
      name: 'TechGuard Badges',
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100',
      borderColor: 'border-red-200',
      image: '/Images/TechGuard.png'
    }
  };

  const badgeLevels = {
    'novice': { name: 'Novice', color: '#FFC107', weight: 1 },
    'beginners': { name: 'Beginners', color: '#2196F3', weight: 2 },
    'intermediate': { name: 'Intermediate', color: '#9C27B0', weight: 3 },
    'expert': { name: 'Expert', color: '#FF8C00', weight: 4 }
  };

  useEffect(() => {
    if (!currentUser) return;

    const badgesQuery = query(
      collection(db, 'member_badges'),
      where('memberEmail', '==', currentUser.email),
      orderBy('awardedAt', 'desc')
    );

    const badgesUnsubscribe = onSnapshot(badgesQuery, (snapshot) => {
      const badges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserBadges(badges);
    });

    const certificatesQuery = query(
      collection(db, 'certificates'),
      where('recipientEmail', '==', currentUser.email),
      orderBy('generatedAt', 'desc')
    );

    const certificatesUnsubscribe = onSnapshot(certificatesQuery, (snapshot) => {
      const certs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCertificates(certs);
      setLoading(false);
    });

    return () => {
      badgesUnsubscribe();
      certificatesUnsubscribe();
    };
  }, [currentUser]);

  const downloadCertificate = async (certificate) => {
    try {
      const certificateHTML = generateCertificateHTML(certificate);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(certificateHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Error generating certificate. Please try again.');
    }
  };

  const downloadBadge = async (badge) => {
    try {
      const badgeHTML = generateBadgeHTML(badge);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(badgeHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    } catch (error) {
      console.error('Error generating badge certificate:', error);
      alert('Error generating badge certificate. Please try again.');
    }
  };

  const generateBadgeHTML = (badge) => {
    const categoryInfo = badgeCategories[badge.badgeCategory];
    const levelInfo = badgeLevels[badge.badgeLevel];
    const formattedDate = badge.awardedAt?.toDate?.()?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) || 'Recently';

    const logoUrl = `${window.location.origin}/Images/loomiq-logo.svg`;

    return `<!DOCTYPE html>
<html>
<head>
  <title>Badge Certificate</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    body { margin: 0; padding: 40px; font-family: 'Georgia', serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .certificate { background: white; padding: 60px; border: 15px solid #D4AF37; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 900px; width: 100%; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }
    .logo { display: flex; align-items: center; }
    .logo img { height: 80px; object-fit: contain; }
    .medal { width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; }
    .category h2 { font-size: 32px; margin: 0; color: #D4AF37; text-align: center; }
    .level h3 { font-size: 20px; margin: 10px 0 30px; color: #7F8C8D; text-align: center; text-transform: uppercase; }
    .awarded-to { text-align: center; margin-bottom: 20px; color: #555; font-size: 16px; }
    .recipient h2 { font-size: 36px; margin: 0; color: #2C3E50; text-align: center; font-style: italic; border-bottom: 2px solid #D4AF37; display: inline-block; padding-bottom: 10px; }
    .contribution { text-align: center; margin: 20px 0 10px; color: #555; font-size: 14px; }
    .project h3 { font-size: 20px; margin: 0 0 40px; color: #3498DB; text-align: center; font-weight: bold; }
    @media print { body { background: white; } }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header"><div class="logo"><img src="${logoUrl}" alt="Loomiq" /></div><div class="medal">🏅</div></div>
    <div class="category"><h2>${categoryInfo.name}</h2></div>
    <div class="level"><h3>${levelInfo.name} Level</h3></div>
    <div class="awarded-to">This badge is awarded to</div>
    <div class="recipient" style="text-align: center; margin-bottom: 20px;"><h2>${badge.memberName || badge.memberEmail}</h2></div>
    <div class="contribution">for ${badge.contribution} contribution in</div>
    <div class="project"><h3>"${badge.projectTitle}"</h3></div>
  </div>
</body>
</html>`;
  };

  const generateCertificateHTML = (certificate) => {
    const formattedDate = certificate.generatedAt?.toDate?.()?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) || 'Recent';

    const logoUrl = `${window.location.origin}/Images/loomiq-logo.svg`;

    return `<!DOCTYPE html>
<html>
<head>
  <title>Certificate of Completion</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    body { margin: 0; padding: 40px; font-family: 'Georgia', serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .certificate { background: white; padding: 60px; border: 15px solid #D4AF37; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 900px; width: 100%; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { display: flex; justify-content: center; align-items: center; }
    .logo img { height: 80px; object-fit: contain; }
    .title h1 { font-size: 48px; margin: 40px 0; color: #2C3E50; text-align: center; }
    .subtitle { text-align: center; margin-bottom: 30px; color: #7F8C8D; font-size: 18px; }
    .recipient h2 { font-size: 36px; margin: 20px 0; color: #2C3E50; text-align: center; font-style: italic; border-bottom: 2px solid #D4AF37; display: inline-block; padding-bottom: 10px; }
    .project h3 { font-size: 24px; margin: 20px 0 40px; color: #3498DB; text-align: center; font-weight: bold; }
    @media print { body { background: white; } }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header"><div class="logo"><img src="${logoUrl}" alt="Loomiq" /></div></div>
    <div class="title"><h1>Certificate of Completion</h1></div>
    <div class="subtitle">Project Leadership Excellence</div>
    <div style="text-align: center; margin-bottom: 20px;"><div class="recipient"><h2>${certificate.recipientName || certificate.recipientEmail}</h2></div></div>
    <div style="text-align: center; margin-bottom: 10px; color: #555;">has successfully completed the project</div>
    <div class="project"><h3>"${certificate.projectTitle}"</h3></div>
  </div>
</body>
</html>`;
  };

  const filteredBadges = userBadges.filter(badge => {
    if (selectedFilter === 'all') return true;
    return badge.badgeCategory === selectedFilter;
  });

  const badgeStats = Object.keys(badgeCategories).map(category => {
    const categoryBadges = userBadges.filter(badge => badge.badgeCategory === category);
    const totalCount = categoryBadges.length;
    const levelCounts = Object.keys(badgeLevels).reduce((acc, level) => {
      acc[level] = categoryBadges.filter(badge => badge.badgeLevel === level).length;
      return acc;
    }, {});

    return { category, totalCount, levelCounts, ...badgeCategories[category] };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading your achievements...</p>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 max-w-7xl">
          
          {/* Hero Section */}
          <section className="mb-8 sm:mb-12 text-center">
            <div className="mb-4 sm:mb-6">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-bold border border-blue-200">
                🏆 ProjectX Achievements
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              My <span className="text-blue-600">Badges</span> & <span className="text-orange-600">Certificates</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Your professional achievements from Loomiq ProjectX - where projects power careers
            </p>
          </section>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6 mb-8 sm:mb-12">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="text-2xl sm:text-3xl flex-shrink-0">⚠️</div>
              <div>
                <h3 className="text-yellow-800 font-bold text-base sm:text-lg mb-2">Important Notice</h3>
                <p className="text-yellow-700 text-sm sm:text-base mb-2">
                  Please download and keep copies of your certificates. System updates may erase important data.
                </p>
                <p className="text-yellow-600 text-xs sm:text-sm">
                  Save certificates in multiple locations for safekeeping.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-2">{userBadges.length}</div>
              <div className="text-gray-700 text-xs sm:text-sm font-semibold">Total Badges</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl font-black text-orange-600 mb-2">{certificates.length}</div>
              <div className="text-gray-700 text-xs sm:text-sm font-semibold">Certificates</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl font-black text-purple-600 mb-2">
                {badgeStats.filter(stat => stat.totalCount > 0).length}
              </div>
              <div className="text-gray-700 text-xs sm:text-sm font-semibold">Categories</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl font-black text-yellow-600 mb-2">
                {userBadges.filter(badge => badge.badgeLevel === 'expert').length}
              </div>
              <div className="text-gray-700 text-xs sm:text-sm font-semibold">Expert Badges</div>
            </div>
          </div>

          {/* Badge Categories Progress */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Badge Categories Progress</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {badgeStats.map((stat) => (
                <div
                  key={stat.category}
                  className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-gray-900 font-bold mb-2 text-base sm:text-lg">{stat.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{stat.totalCount} badges earned</p>
                  <div className="space-y-2">
                    {Object.entries(stat.levelCounts).map(([level, count]) => (
                      <div key={level} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 capitalize">{level}</span>
                        <span className="text-gray-900 font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({userBadges.length})
            </button>
            {Object.entries(badgeCategories).map(([category, info]) => {
              const count = userBadges.filter(badge => badge.badgeCategory === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedFilter(category)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                    selectedFilter === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">{info.name}</span>
                  <span className="sm:hidden">{info.name.split(' ')[0]}</span>
                  {' '}({count})
                </button>
              );
            })}
          </div>

          {/* Badges Grid */}
          <div className="mb-12">
            {filteredBadges.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-5xl sm:text-6xl mb-4">🏆</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {selectedFilter === 'all' ? 'No badges earned yet' : `No ${badgeCategories[selectedFilter]?.name} earned yet`}
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Complete projects to earn your first badges!
                </p>
                <Link
                  to="/projects"
                  className="inline-block bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-6 sm:px-8 py-3 rounded-xl font-bold transition-all text-sm sm:text-base"
                >
                  Join a Project
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredBadges.map((badge) => {
                  const categoryInfo = badgeCategories[badge.badgeCategory];
                  const levelInfo = badgeLevels[badge.badgeLevel];

                  return (
                    <div
                      key={badge.id}
                      className={`bg-gradient-to-br ${categoryInfo.bgColor} border ${categoryInfo.borderColor} rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-base sm:text-lg font-bold bg-gradient-to-r ${categoryInfo.color} bg-clip-text text-transparent truncate`}>
                            {categoryInfo.name}
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm">{levelInfo.name}</p>
                        </div>
                        <div className="text-2xl sm:text-3xl flex-shrink-0 ml-2">🏅</div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-gray-900 font-semibold mb-2 text-sm sm:text-base line-clamp-2">{badge.projectTitle}</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Awarded for: {badge.contribution}
                        </p>
                      </div>

                      {badge.skillsDisplayed && badge.skillsDisplayed.length > 0 && (
                        <div className="mb-4">
                          <p className="text-gray-600 text-xs mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {badge.skillsDisplayed.slice(0, 3).map((skill, index) => (
                              <span key={index} className="bg-white/60 text-gray-700 px-2 py-1 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                            {badge.skillsDisplayed.length > 3 && (
                              <span className="bg-white/60 text-gray-700 px-2 py-1 rounded text-xs">
                                +{badge.skillsDisplayed.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-gray-600 text-xs mb-4">
                        Earned: {badge.awardedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </div>

                      <button
                        onClick={() => downloadBadge(badge)}
                        className="w-full bg-gray-700 hover:bg-gray-800 text-white px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-xs sm:text-sm"
                      >
                        📥 Download Certificate
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Certificates Section */}
          {certificates.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Certificates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="text-4xl sm:text-5xl mb-4 text-center">📜</div>
                    <h3 className="text-gray-900 font-bold mb-2 text-base sm:text-lg">Project Completion</h3>
                    <p className="text-gray-700 mb-4 text-sm sm:text-base line-clamp-2">{certificate.projectTitle}</p>
                    <div className="text-gray-600 text-xs sm:text-sm space-y-1 mb-4">
                      <p>Type: {certificate.type.replace('_', ' ')}</p>
                      <p>Issued: {certificate.generatedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</p>
                      {certificate.certificateData?.teamSize && (
                        <p>Team: {certificate.certificateData.teamSize} members</p>
                      )}
                    </div>
                    <button
                      onClick={() => downloadCertificate(certificate)}
                      className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-4 py-2.5 sm:py-3 rounded-xl font-bold transition-all text-xs sm:text-sm"
                    >
                      📥 Download Certificate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default UserBadgesPage;
