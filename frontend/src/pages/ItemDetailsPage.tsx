import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router-dom";

export function ItemDetailsPage() {
  const { id } = useParams();

  // Mock data - in a real app this would come from an API/backend
  const professional = {
    name: "Alex Chen",
    title: "Senior Blockchain Developer",
    wallet: "0x123...4567",
    rate: "0.5 ETH/hr",
    experience: "5 Years",
    availability: "Available from May 2024",
    about: "Passionate blockchain developer with extensive experience in DeFi protocols and smart contract development. Focused on creating secure and efficient solutions for Web3 projects.",
    skills: ["Solidity", "Ethereum", "Smart Contracts", "React", "TypeScript"],
    workHistory: [
      {
        role: "Lead Smart Contract Developer",
        company: "DeFi Protocol X",
        period: "2022 - Present",
        description: "Developed and audited smart contracts for lending and borrowing protocols"
      },
      {
        role: "Blockchain Developer",
        company: "Web3 Studio Y",
        period: "2020 - 2022",
        description: "Built NFT marketplaces and token systems"
      }
    ],
    education: "MSc in Computer Science, Blockchain Specialization"
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{professional.name}</CardTitle>
              <CardDescription className="text-lg">{professional.title}</CardDescription>
            </div>
            <div className="text-right">
              <p className="font-medium text-lg">{professional.rate}</p>
              <p className="text-sm text-muted-foreground">{professional.availability}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-500">Profile Photo</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-600">{professional.about}</p>
            </div>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {professional.skills.map((skill) => (
                <span 
                  key={skill} 
                  className="bg-secondary/20 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Work Experience</h3>
            <div className="space-y-4">
              {professional.workHistory.map((work, index) => (
                <div key={index} className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{work.role}</h4>
                    <span className="text-sm text-muted-foreground">{work.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{work.company}</p>
                  <p className="text-sm">{work.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Experience</h3>
              <p className="text-lg font-semibold">{professional.experience}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Education</h3>
              <p className="text-lg font-semibold">{professional.education}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
            <p className="font-mono">{professional.wallet}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline">Contact</Button>
          <Button>Hire Now</Button>
        </CardFooter>
      </Card>
    </div>
  );
}