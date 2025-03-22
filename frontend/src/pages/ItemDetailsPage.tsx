import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { talentApi, Talent } from "@/services/api/talent";
import { formatAddress } from "@/lib/utils";
import { ethers } from "ethers";
import { Clock, MapPin, Wallet, Award, GraduationCap, Briefcase, Calendar, AlertCircle } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { offerApi, OfferCreateRequest } from "@/services/api/offer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ContractTimeline } from "@/features/contracts/components/ContractTimeline";
import { contractsApi } from "@/services/api/contracts";
import { Offer } from "@/services/api/offer";

// Mock data to supplement API data - will be replaced with blockchain data later
const mockEducation = {
  degree: "MSc in Computer Science, Blockchain Specialization",
  institution: "Technical University of Berlin",
  year: "2019"
};

const mockWorkHistory = [
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
];

// Contract form interface
interface ContractFormData {
  jobDescription: string;
  startDate: string;
  endDate: string;
  totalWorkHours: number;
  totalPay: string;
  talentId: string;
  skillId: string;
  skillName: string;
  hourlyRate: string;
}

export function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, roles, requireAuth, LoginDialog } = useAuth();
  const [professional, setProfessional] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Talent['skills'][0] | null>(null);
  const [contractForm, setContractForm] = useState<ContractFormData>({
    jobDescription: '',
    startDate: '',
    endDate: '',
    totalWorkHours: 0,
    totalPay: '',
    talentId: id || '',
    skillId: '',
    skillName: '',
    hourlyRate: ''
  });
  const [submittingContract, setSubmittingContract] = useState(false);
  const [contractSuccess, setContractSuccess] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Offer[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);

  // Check if user is an employer
  const isEmployer = roles.includes('employer');
  const isAdmin = roles.includes('admin');

  useEffect(() => {
    async function fetchProfessionalDetails() {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await talentApi.getTalentById(id);
        setProfessional(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching professional details:", err);
        setError("Failed to load professional details");
      } finally {
        setLoading(false);
      }
    }

    fetchProfessionalDetails();
  }, [id]);

  // Fetch contract history if user is authenticated
  useEffect(() => {
    async function fetchContractHistory() {
      if (!id || !isAuthenticated) return;
      
      try {
        setContractsLoading(true);
        const response = await contractsApi.getContractsByTalentId(id);
        setContracts(response.offers);
      } catch (err) {
        console.error("Error fetching contract history:", err);
      } finally {
        setContractsLoading(false);
      }
    }

    fetchContractHistory();
  }, [id, isAuthenticated]);

  // Format hourly rate from wei to ETH
  const formatRate = (weiRate: string): string => {
    try {
      const ethValue = parseFloat(ethers.formatEther(weiRate));
      return `${ethValue.toFixed(6).replace(/\.?0+$/, '')} ETH/hr`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return "Rate unavailable";
    }
  };

  // Get rate value in ETH (without units)
  const getRateValue = (weiRate: string): string => {
    try {
      const ethValue = parseFloat(ethers.formatEther(weiRate));
      return ethValue.toFixed(6);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return "0";
    }
  };

  // Get highest rate from skills
  const getHighestRate = (skills: Talent["skills"]): string => {
    if (!skills || skills.length === 0) return "Rate unavailable";
    
    try {
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

  // Get total years of experience (highest from skills)
  const getTotalExperience = (skills: Talent["skills"]): number => {
    if (!skills || skills.length === 0) return 0;
    return Math.max(...skills.map(skill => skill.yearsOfExperience));
  };

  // Handle opening the contract modal for a specific skill
  const handleHireForSkill = (skill: Talent['skills'][0]) => {
    // Check if user is authenticated and has employer role
    const isAuthed = requireAuth();
    if (!isAuthed || !isEmployer) return;
    
    setSelectedSkill(skill);
    const hourlyRateEth = getRateValue(skill.hourlyRate);
    
    // Reset contract form and statuses
    setContractSuccess(null);
    setContractError(null);
    
    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setContractForm({
      jobDescription: '',
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: '',
      totalWorkHours: 40,
      totalPay: (parseFloat(hourlyRateEth) * 40).toString(),
      talentId: id || '',
      skillId: skill._id,
      skillName: skill.name,
      hourlyRate: hourlyRateEth
    });
    
    setContractModalOpen(true);
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setContractForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Auto-calculate total pay when work hours change
      if (name === 'totalWorkHours') {
        const hours = parseFloat(value) || 0;
        const rate = parseFloat(prev.hourlyRate) || 0;
        newForm.totalPay = (hours * rate).toString();
      }
      
      return newForm;
    });
  };

  // Handle contract submission
  const handleSubmitContract = async () => {
    try {
      setSubmittingContract(true);
      setContractSuccess(null);
      setContractError(null);
      
      // Validate required fields
      if (
        !contractForm.jobDescription || 
        !contractForm.startDate || 
        !contractForm.endDate || 
        !contractForm.totalWorkHours
      ) {
        setContractError("All fields are required");
        setSubmittingContract(false);
        return;
      }
      
      // Format the contract data for the API
      const contractData: OfferCreateRequest = {
        jobDescription: contractForm.jobDescription,
        startDate: new Date(contractForm.startDate).toISOString(),
        endDate: new Date(contractForm.endDate).toISOString(),
        totalWorkHours: Number(contractForm.totalWorkHours),
        totalPay: ethers.parseEther(contractForm.totalPay).toString(),
        talentId: contractForm.talentId
      };
      
      // Call the API to create the contract/offer
      const result = await offerApi.createOffer(contractData);
      
      // Show success message
      setContractSuccess(`Contract #${result._id} created successfully!`);
      
      // Keep the modal open to show success message
      setTimeout(() => {
        setContractModalOpen(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error creating contract:', err);
      setContractError(err instanceof Error ? err.message : 'Error creating contract. Please try again.');
    } finally {
      setSubmittingContract(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg">Loading professional details...</p>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg text-red-500">{error || "Professional not found"}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{professional.name}</CardTitle>
              <CardDescription className="text-lg">{professional.description}</CardDescription>
            </div>
            <div className="text-right">
              <p className="font-medium text-lg">{getHighestRate(professional.skills)}</p>
              <p className="text-sm text-muted-foreground">
                {professional.availability ? "Available Now" : "Currently Unavailable"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-6">
            <div className="w-32 h-32 overflow-hidden rounded-full">
              <img 
                src={professional.imageUrl || "https://placehold.co/400/gray/white?text=No+Image"} 
                alt={`${professional.name}'s profile`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">Profile</h3>
                <Badge variant="skill" className="capitalize flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {professional.experience}
                </Badge>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{professional.location}</span>
                </div>
              </div>
              <p className="text-gray-600">{professional.description}</p>
              <p className="text-gray-600 mt-2">
                Total experience: {getTotalExperience(professional.skills)} years in the field
              </p>
            </div>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Skills & Rates</h3>
            <div className="grid gap-3">
              {professional.skills.map((skill) => (
                <div 
                  key={skill._id} 
                  className="bg-secondary/10 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{skill.name}</span>
                    <div className="text-sm text-muted-foreground">
                      {skill.yearsOfExperience} years experience
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-semibold">
                        {formatRate(skill.hourlyRate)}
                      </span>
                    </div>
                    {isAuthenticated && isEmployer && (
                      <Button 
                        size="sm" 
                        onClick={() => handleHireForSkill(skill)}
                        disabled={!professional.availability}
                      >
                        Hire Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
              Work Experience
            </h3>
            <div className="space-y-4">
              {mockWorkHistory.map((work, index) => (
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

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
              Education
            </h3>
            <div className="bg-secondary/10 p-4 rounded-lg">
              <div className="mb-1">
                <h4 className="font-medium">{mockEducation.degree}</h4>
                <p className="text-sm text-muted-foreground">{mockEducation.institution}</p>
              </div>
              <p className="text-sm text-muted-foreground">Graduated: {mockEducation.year}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Wallet Address</h3>
            <div className="flex items-center bg-secondary/10 p-3 rounded-lg">
              <Wallet className="h-4 w-4 text-gray-500 mr-2" />
              <p className="font-mono text-sm">{formatAddress(professional.walletAddress)}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline">Contact</Button>
        </CardFooter>
      </Card>

      {/* Contract History Section - Only shown to authenticated users */}
      {isAuthenticated && (isEmployer || isAdmin) && (
        <div className="max-w-4xl mx-auto mt-8">
          <ContractTimeline 
            contracts={contracts}
            loading={contractsLoading}
            title={`Contract History: ${professional?.name || 'Professional'}`}
          />
        </div>
      )}

      {/* Login Dialog for authentication */}
      {LoginDialog}

      {/* Contract Dialog */}
      <Dialog open={contractModalOpen} onOpenChange={setContractModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create Contract for {selectedSkill?.name}</DialogTitle>
            <DialogDescription>
              Complete the form below to create a contract with {professional.name} for {selectedSkill?.name} services at {formatRate(selectedSkill?.hourlyRate || '0')}
            </DialogDescription>
          </DialogHeader>
          
          {/* Success message */}
          {contractSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <div className="flex items-center">
                <div className="bg-green-400 p-1 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
                  </svg>
                </div>
                <AlertTitle className="ml-2 text-green-800">Success</AlertTitle>
              </div>
              <AlertDescription className="text-green-700">
                {contractSuccess}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Error message */}
          {contractError && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="ml-2 text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">
                {contractError}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                value={contractForm.jobDescription}
                onChange={handleFormChange}
                placeholder="Describe the job requirements and expectations"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={contractForm.startDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={contractForm.endDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalWorkHours">Total Work Hours</Label>
                <Input
                  id="totalWorkHours"
                  name="totalWorkHours"
                  type="number"
                  min="1"
                  value={contractForm.totalWorkHours}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="totalPay">Total Payment (ETH)</Label>
                <div className="flex items-center">
                  <Input
                    id="totalPay"
                    name="totalPay"
                    type="text"
                    value={contractForm.totalPay}
                    onChange={handleFormChange}
                    disabled
                  />
                  <span className="ml-2">ETH</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Calculated based on {formatRate(selectedSkill?.hourlyRate || '0')} × {contractForm.totalWorkHours} hours
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setContractModalOpen(false)}
                    disabled={submittingContract}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitContract} 
              disabled={submittingContract || !!contractSuccess}
            >
              {submittingContract ? "Creating..." : "Create Contract"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}