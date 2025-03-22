/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { searchTalents, setSearchParams } from '@/features/talent/talentSlice';
import { Talent, TalentSkill } from '@/services/api/talent';
import { ethers } from 'ethers';

export function HomePage() {
  const dispatch = useAppDispatch();
  const { talents, loading, error, totalResults } = useAppSelector((state) => state.talent || { talents: [] });
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Available skills for the dropdown
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

  // Load talents on component mount
  useEffect(() => {
    try {
      dispatch(searchTalents({}));
    } catch (err) {
      console.error('Error fetching talents:', err);
    }
  }, [dispatch]);

  // Filter talents by skill
  const handleSkillChange = (value: string) => {
    setSelectedSkill(value);
    
    // Update search params in the store and trigger a search
    dispatch(setSearchParams({ 
      skills: [value]
    }));
    dispatch(searchTalents({ skills: [value] }));
  };

  // Clear filter
  const handleClearFilter = () => {
    setSelectedSkill(null);
    dispatch(setSearchParams({ skills: undefined }));
    dispatch(searchTalents({}));
  };

  // Safely access the talents array
  const safeTalents = talents || [];

  // Format ETH rate from wei
  const formatRate = (weiRate: string): string => {
    try {
      return `${ethers.formatEther(weiRate)} ETH/hr`;
    } catch (_err) {
      return "Rate unavailable";
    }
  };

  // Get highest rate from skills
  const getHighestRate = (skills: TalentSkill[]): string => {
    if (!skills || skills.length === 0) return "Rate unavailable";
    
    const highestRate = skills.reduce(
      (max, skill) => {
        try {
          const rate = ethers.parseEther(skill.hourlyRate);
          return rate > max ? rate : max;
        } catch (_err) {
          return max;
        }
      },
      ethers.parseEther("0")
    );
    
    return formatRate(highestRate.toString());
  };

  // Get all skill names from a talent
  const getSkillNames = (skills: TalentSkill[]): string[] => {
    return skills?.map(skill => skill.name) || [];
  };

  return (
    <div className="space-y-12">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Web3 Labor Marketplace!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Connect with skilled professionals and hire talent on our decentralized platform.
        </p>
        
        {/* Search/Filter Component */}
        <div className="max-w-2xl mx-auto">
          <Select onValueChange={handleSkillChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a skill to filter by..." />
            </SelectTrigger>
            <SelectContent>
              {availableSkills.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSkill && (
            <Button 
              variant="ghost" 
              onClick={handleClearFilter}
              className="mt-2"
            >
              Clear Filter
            </Button>
          )}
        </div>
      </section>

      <section>
        {selectedSkill ? (
          <h2 className="text-2xl font-bold mb-6 text-center">
            Professionals with {selectedSkill} expertise
          </h2>
        ) : (
          <h2 className="text-2xl font-bold mb-6 text-center">
            Featured Professionals
          </h2>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Loading professionals...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-red-500">Error: {error}</p>
            <Button 
              variant="link" 
              onClick={() => dispatch(searchTalents({}))}
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        )}

        {/* No results state */}
        {!loading && !error && safeTalents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              {selectedSkill 
                ? `No professionals found with ${selectedSkill} expertise` 
                : 'No professionals found'}
            </p>
            {selectedSkill && (
              <Button 
                variant="link" 
                onClick={handleClearFilter}
                className="mt-2"
              >
                View all professionals
              </Button>
            )}
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && safeTalents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {safeTalents.map((professional: Talent) => (
              <Card key={professional._id}>
                <CardHeader>
                  <CardTitle>{professional.name}</CardTitle>
                  <CardDescription>{professional.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-gray-500">Profile Photo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Experience:</span>
                      <span className="font-medium capitalize">{professional.experience}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getSkillNames(professional.skills).map((skill) => (
                        <span 
                          key={skill}
                          className="bg-secondary/20 px-2 py-1 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-sm font-medium">{getHighestRate(professional.skills)}</span>
                  <Link to={`/professional/${professional._id}`}>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Show total results count */}
        {!loading && !error && safeTalents.length > 0 && totalResults > 0 && (
          <div className="text-center mt-6 text-sm text-gray-500">
            Showing {safeTalents.length} of {totalResults} professionals
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
    </div>
  );
} 