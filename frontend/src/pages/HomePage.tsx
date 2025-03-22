/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { searchTalents, setSearchParams } from '@/features/talent/talentSlice';
import { Talent, TalentSkill } from '@/services/api/talent';
import { ethers } from 'ethers';
import { Award, Clock, MapPin, Search, LogIn } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function HomePage() {
  const dispatch = useAppDispatch();
  const { talents, loading, error, totalResults } = useAppSelector((state) => state.talent || { talents: [] });
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const searchRef = useRef<HTMLDivElement>(null);
  const { LoginDialog, connect, isAuthenticated } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Handle clicks outside of search component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Available skills for suggestions
  const availableSkills = [
    "Solidity",
    "Smart Contracts",
    "React",
    "TypeScript",
    "Blockchain Architecture",
    "DeFi",
    "NFT Development",
    "Web3",
    ".NET",
    "Rust",
    "Azure"
  ];

  // Filter skills based on search query
  const filteredSkills = availableSkills.filter(skill => 
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load talents on component mount or when page changes
  useEffect(() => {
    try {
      dispatch(searchTalents({ page: currentPage, limit: itemsPerPage }));
    } catch (err) {
      console.error('Error fetching talents:', err);
    }
  }, [dispatch, currentPage, itemsPerPage]);

  // Handle search submission (both for skills and free text)
  const handleSearch = () => {
    // If the exact search query matches a skill, treat it as a skill search
    const isSkill = availableSkills.some(
      skill => skill.toLowerCase() === searchQuery.toLowerCase()
    );

    if (isSkill) {
      handleSkillSelect(searchQuery);
    } else if (searchQuery) {
      // Free text search
      setSelectedSkill(null);
      dispatch(setSearchParams({ query: searchQuery }));
      dispatch(searchTalents({ query: searchQuery }));
    } else {
      // Empty search, show all professionals
      handleClearSearch();
    }
    setIsOpen(false);
  };

  // Handle skill selection
  const handleSkillSelect = (skill: string) => {
    setSelectedSkill(skill);
    setSearchQuery(skill);
    setCurrentPage(1); // Reset to first page when changing search/filters
    
    // Update search params in the store and trigger a search
    dispatch(setSearchParams({ 
      skills: [skill],
      query: undefined,
      page: 1,
      limit: itemsPerPage
    }));
    dispatch(searchTalents({ skills: [skill], page: 1, limit: itemsPerPage }));
    setIsOpen(false);
  };

  // Clear search and filters
  const handleClearSearch = () => {
    setSelectedSkill(null);
    setSearchQuery('');
    setCurrentPage(1); // Reset to first page
    dispatch(setSearchParams({ skills: undefined, query: undefined, page: 1, limit: itemsPerPage }));
    dispatch(searchTalents({ page: 1, limit: itemsPerPage }));
  };

  // Safely access the talents array
  const safeTalents = talents || [];

  // Format ETH rate from wei
  const formatRate = (weiRate: string): string => {
    try {
      // Directly format to a number with 2 decimal places max
      const ethValue = parseFloat(ethers.formatEther(weiRate));
      return `${ethValue.toFixed(2).replace(/\.?0+$/, '')} ETH/hr`;
    } catch (_err) {
      return "Rate unavailable";
    }
  };

  // Get highest rate from skills - completely rewritten to ensure proper conversion
  const getHighestRate = (skills: TalentSkill[]): string => {
    if (!skills || skills.length === 0) return "Rate unavailable";
    
    try {
      // Check if any skills are matched (search is active)
      const matchedSkills = skills.filter(skill => skill.isMatched);
      
      // If search is active, use rate from matched skill
      if (matchedSkills.length > 0) {
        return formatRate(matchedSkills[0].hourlyRate);
      }
      
      // Find highest rate from all skills
      let highestRate = "0";
      for (const skill of skills) {
        try {
          const currentRate = ethers.parseUnits(skill.hourlyRate, 18);
          const previousHighest = ethers.parseUnits(highestRate, 18);
          if (currentRate > previousHighest) {
            highestRate = skill.hourlyRate;
          }
        } catch (err) {
          console.error("Error parsing rate:", err);
        }
      }
      
      return formatRate(highestRate);
    } catch (err) {
      console.error("Error in getHighestRate:", err);
      return "Rate unavailable";
    }
  };

  // Get skill names from a talent
  const getSkillNames = (skills: TalentSkill[]): string[] => {
    // Check if any skills are matched (search is active)
    const matchedSkills = skills.filter(skill => skill.isMatched);
    
    // If search is active, only show matched skills
    if (matchedSkills.length > 0) {
      return matchedSkills.map(skill => skill.name);
    }
    
    // Otherwise, show all skills
    return skills?.map(skill => skill.name) || [];
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    
    // Build search params based on current state
    const searchParams: { 
      page: number; 
      limit: number; 
      skills?: string[]; 
      query?: string;
    } = { 
      page: newPage, 
      limit: itemsPerPage 
    };
    
    if (selectedSkill) {
      searchParams.skills = [selectedSkill];
    } else if (searchQuery) {
      searchParams.query = searchQuery;
    }
    
    // Update search params and fetch new page
    dispatch(setSearchParams({ ...searchParams }));
    dispatch(searchTalents(searchParams));
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 md:px-20 text-center">
        <h1 className="text-4xl font-bold mb-2">
          Welcome to Web3 Labor Marketplace!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
          Connect with skilled professionals and hire talent on our decentralized platform.
        </p>
      </section>
      
      {/* Sticky Search Bar - this will stick to top when scrolled to */}
      <div id="search-container" className="sticky top-0 z-50 -mt-8 pb-3 pt-1 bg-background/80 backdrop-blur-md" ref={searchRef}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative">
            <div className="relative flex items-center w-full rounded-full border shadow-lg px-4 py-3 bg-white dark:bg-gray-900">
              <Search className="h-5 w-5 shrink-0 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search by skill or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full border-none outline-none shadow-none focus:ring-0 bg-transparent text-base"
              />
            </div>
            
            {isOpen && filteredSkills && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-700 z-50">
                {filteredSkills.length === 0 && searchQuery && (
                  <div className="p-2 text-center text-sm text-gray-500">
                    No results found
                  </div>
                )}
                
                {filteredSkills.length > 0 && (
                  <div>
                    <div className="p-2 text-xs font-medium text-gray-500 border-b">
                      Suggested Skills
                    </div>
                    <div className="max-h-60 overflow-auto">
                      {filteredSkills.map((skill) => (
                        <div
                  key={skill}
                          onClick={() => handleSkillSelect(skill)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
          
          <div className="mt-4 flex gap-2 justify-center">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
              className="rounded-md px-4 py-2"
            >
              Clear
            </Button>
            <Button 
              onClick={handleSearch}
              size="sm"
              className="rounded-md px-4 py-2"
            >
              Search
            </Button>
          </div>
        </div>
        
        {/* This div creates a background effect when scrolled */}
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md shadow-sm -z-10 opacity-0 transition-opacity duration-200" 
             id="sticky-bg" />
      </div>

      {/* Add script to handle sticky background appearance */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const searchContainer = document.getElementById('search-container');
            const stickyBg = document.getElementById('sticky-bg');
            
            if (searchContainer && stickyBg) {
              const searchOffset = searchContainer.offsetTop;
              
              window.addEventListener('scroll', function() {
                if (window.scrollY > searchOffset - 10) {
                  stickyBg.style.opacity = '1';
                } else {
                  stickyBg.style.opacity = '0';
                }
              });
            }
          });
        `
      }} />

      {/* Professionals section with increased margin top */}
      <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
          Professionals
          </h2>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Loading professionals...</p>
          </div>
        )}

        {/* Error state - Modified to show login prompt for 401 errors */}
        {error && (
          <div className="text-center py-12">
            {error.includes('401') ? (
              <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                    <LogIn className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    Please log in to view our professional talent pool.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xl text-red-500">Error: {error}</p>
                <Button 
                  variant="link" 
                  onClick={() => dispatch(searchTalents({}))}
                  className="mt-2"
                >
                  Try again
                </Button>
              </>
            )}
          </div>
        )}

        {/* No results state */}
        {!loading && !error && safeTalents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              No professionals found
            </p>
            {(selectedSkill || searchQuery) && (
              <Button 
                variant="link" 
                onClick={handleClearSearch}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && safeTalents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {safeTalents.map((professional: Talent) => (
              <Link to={`/professional/${professional._id}`} key={professional._id} className="block">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 group p-0 h-full hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 z-10 group-hover:from-black/50 group-hover:to-black/5 transition-all duration-800 ease-out group-hover:scale-105" />
                    <img 
                      src={professional.imageUrl || "https://placehold.co/600x400/gray/white?text=No+Image"} 
                      alt={`${professional.name}'s profile`}
                      className="w-full h-52 object-cover object-center group-hover:scale-105 transition-all duration-500 ease-in-out"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      <h3 className="text-xl font-bold text-white group-hover:text-white/90">{professional.name}</h3>
                      <div className="flex items-center mt-1 text-white/90 group-hover:text-white/80">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <p className="text-sm">{professional.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        variant="skill" 
                        className="capitalize flex items-center gap-1"
                      >
                        <Award className="h-3 w-3" />
                        {professional.experience}
                      </Badge>
                      <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
                        <div className={`w-2.5 h-2.5 rounded-full mr-2 ${professional.availability ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>{professional.availability ? 'Available Now' : 'Unavailable'}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {professional.description}
                    </p>
                    
                    <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Skills</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getSkillNames(professional.skills).map((skill) => (
                        <Badge 
                          key={skill}
                          variant="skill"
                      >
                        {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 border-t pt-3 mt-3">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Hourly Rate:</span>
                        <span className="ml-1.5 font-semibold text-primary">
                          {getHighestRate(professional.skills)}
                        </span>
                  </div>
                </div>
              </CardContent>
                  
                  <CardFooter className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
                    <Button variant="default" size="sm" className="w-full font-medium">
                      View Profile
                    </Button>
              </CardFooter>
            </Card>
              </Link>
          ))}
        </div>
        )}

        {/* Show total results count and pagination */}
        {!loading && !error && safeTalents.length > 0 && totalResults > 0 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500">
              Showing {safeTalents.length} of {totalResults} professionals
            </p>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              
              <span className="text-sm mx-2">
                Page {currentPage} of {Math.ceil(totalResults / itemsPerPage)}
              </span>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalResults / itemsPerPage)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="bg-gray-50 py-10 rounded-lg">
        <div className="container px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-bold mb-2">Connect Wallet</h3>
              <p className="text-gray-600">Connect your Ethereum wallet to get started.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-bold mb-2">Browse Professionals</h3>
              <p className="text-gray-600">Explore talented professionals in your field.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-bold mb-2">Hire & Collaborate</h3>
              <p className="text-gray-600">Hire professionals and manage contracts securely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Include the login dialog */}
      {LoginDialog}
    </div>
  );
} 