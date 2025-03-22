import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  
  // Mock data - would come from backend
  const availableSkills = [
    "Solidity",
    "Smart Contracts",
    "React",
    "TypeScript",
    "Blockchain Architecture",
    "DeFi",
    "NFT Development",
    "Web3",
  ];

  const professionals = [
    {
      id: 1,
      name: "Alex Chen",
      experience: "5 Years",
      expertise: "Smart Contract Development",
      rate: "0.5 ETH/hr",
      skills: ["Solidity", "Smart Contracts", "DeFi"]
    },
    {
      id: 2,
      name: "Sarah Johnson",
      experience: "3 Years",
      expertise: "Frontend Development",
      rate: "0.3 ETH/hr",
      skills: ["React", "TypeScript", "Web3"]
    },
    {
      id: 3,
      name: "Michael Kumar",
      experience: "7 Years",
      expertise: "Blockchain Architecture",
      rate: "0.8 ETH/hr",
      skills: ["Blockchain Architecture", "Smart Contracts", "DeFi"]
    }
  ];

  const filteredProfessionals = selectedSkill 
    ? professionals.filter(prof => prof.skills.includes(selectedSkill))
    : professionals;

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
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Search by skill (e.g., Solidity, React, Smart Contracts...)" 
            />
            <CommandList>
              <CommandEmpty>No skills found.</CommandEmpty>
              <CommandGroup>
                {availableSkills.map((skill) => (
                  <CommandItem
                    key={skill}
                    onSelect={() => setSelectedSkill(skill)}
                    value={skill}
                  >
                    {skill}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </section>

      <section>
        {selectedSkill ? (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Professionals with {selectedSkill} expertise
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedSkill(null)}
            >
              Clear Filter
            </Button>
          </div>
        ) : (
          <h2 className="text-2xl font-bold mb-6 text-center">
            Featured Professionals
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProfessionals.map((professional) => (
            <Card key={professional.id}>
              <CardHeader>
                <CardTitle>{professional.name}</CardTitle>
                <CardDescription>{professional.expertise}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-gray-500">Profile Photo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Experience:</span>
                    <span className="font-medium">{professional.experience}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {professional.skills.map((skill) => (
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
                <span className="text-sm font-medium">{professional.rate}</span>
                <Link to={`/professional/${professional.id}`}>
                  <Button variant="outline" size="sm">View Profile</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
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