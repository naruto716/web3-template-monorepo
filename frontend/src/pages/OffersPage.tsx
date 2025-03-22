/* eslint-disable @typescript-eslint/no-unused-vars */
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn, formatAddress } from "@/lib/utils";
import { Offer, offerApi, OfferListResponse } from "@/services/api/offer";
import { Talent, talentApi } from "@/services/api/talent";
import { createOfferNFT, getOffer as getBlockchainOffer, tradeOfferNFT } from "@/services/web3/contracts";
import { ethers } from "ethers";
import { AlertCircle, ArrowUpRight, Award, Briefcase, Calendar, CheckCircle, Clock, CreditCard, FileText, Loader2, MapPin, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Define a simple toast implementation if the imported one doesn't exist
const useToast = () => {
  return {
    toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
      console.log(`${title}: ${description}`);
      // In a real implementation, this would show a toast notification
      // For now, we'll just log to console
    }
  };
};

export function OffersPage() {
  const { isAuthenticated, roles, requireAuth, LoginDialog } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offersData, setOffersData] = useState<OfferListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatusTab, setActiveStatusTab] = useState<string>("all");
  const [activeRoleTab, setActiveRoleTab] = useState<string>("employer");
  const [professionals, setProfessionals] = useState<Record<string, Talent>>({});
  const [ethProvider, setEthProvider] = useState<ethers.BrowserProvider | null>(null);
  const { toast } = useToast();
  
  // New state variables for blockchain operations
  const [blockchainAction, setBlockchainAction] = useState<string | null>(null);
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(null);
  const [transactionStep, setTransactionStep] = useState<string | null>(null);

  const isEmployer = roles.includes('employer');
  const isProfessional = roles.includes('professional');

  // Initialize Ethereum provider
  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setEthProvider(provider);
        } catch (err) {
          console.error('Error initializing provider:', err);
          setError('Failed to connect to Ethereum provider');
        }
      }
    };
    
    if (isAuthenticated) {
      initProvider();
    }
  }, [isAuthenticated]);

  // Set default role tab based on user roles
  useEffect(() => {
    if (isProfessional && !isEmployer) {
      setActiveRoleTab("professional");
    }
  }, [isProfessional, isEmployer]);

  useEffect(() => {
    if (isAuthenticated && (isEmployer || isProfessional)) {
      fetchOffers();
    }
  }, [isAuthenticated, isEmployer, isProfessional, currentPage, activeStatusTab, activeRoleTab]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to get offers based on active role tab
      const result = await offerApi.getAllOffers(currentPage, 10, activeRoleTab);
      setOffersData(result);
      
      // Fetch professional details if in employer role
      if (activeRoleTab === "employer" && result.offers.length > 0) {
        const talentIds = result.offers.map(offer => offer.talentId._id);
        const uniqueTalentIds = [...new Set(talentIds)];
        
        // Fetch professional details for all offers
        await Promise.all(
          uniqueTalentIds.map(async (talentId) => {
            try {
              const professional = await talentApi.getTalentById(talentId);
              setProfessionals(prev => ({
                ...prev,
                [talentId]: professional
              }));
            } catch (err) {
              console.error(`Error fetching professional ${talentId}:`, err);
            }
          })
        );
      }
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError("Failed to load your offers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format ETH from wei to human-readable format
  const formatEth = (weiValue: string): string => {
    try {
      const ethValue = parseFloat(ethers.formatEther(weiValue));
      return `${ethValue.toFixed(2)} ETH`;
    } catch (_error) {
      return "ETH value unavailable";
    }
  };

  // Format date to a readable format
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (_error) {
      return "Date unavailable";
    }
  };

  // Get timestamp in seconds from date string
  const getTimestamp = (dateString: string): number => {
    try {
      const date = new Date(dateString);
      return Math.floor(date.getTime() / 1000);
    } catch (_error) {
      return Math.floor(Date.now() / 1000);
    }
  };

  // Get offers filtered by status
  const getFilteredOffers = (): Offer[] => {
    if (!offersData || !offersData.offers) return [];
    
    if (activeStatusTab === "all") {
      return offersData.offers;
    }
    
    return offersData.offers.filter(offer => offer.status === activeStatusTab);
  };

  // Get status badge with appropriate color
  const getStatusBadge = (status: Offer['status']) => {
    const statusConfig = {
      waiting: { 
        label: "Awaiting Response", 
        className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-800 dark:hover:text-yellow-200" 
      },
      accepted: { 
        label: "Accepted", 
        className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-800 dark:hover:text-blue-200" 
      },
      paid: { 
        label: "Paid", 
        className: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-800 dark:hover:text-purple-200" 
      },
      working: { 
        label: "In Progress", 
        className: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-700 dark:hover:bg-indigo-800 dark:hover:text-indigo-200" 
      },
      finished: { 
        label: "Completed", 
        className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800 dark:hover:text-green-200" 
      }
    };
    
    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200" };
    
    return (
      <Badge className={cn(`${config.className} px-3 py-1 font-medium border rounded-full text-xs transition-colors duration-200`)}>
        {config.label}
      </Badge>
    );
  };

  // Handle accepting an offer (for professionals) and creating an NFT
  const handleAcceptOffer = async (offer: Offer) => {
    if (!ethProvider) {
      toast({
        title: "Error",
        description: "Ethereum provider not available. Please connect your wallet.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setBlockchainAction("acceptance");
      setProcessingOfferId(offer._id);
      setTransactionStep("preparing");
      
      // First create the NFT on the blockchain
      const startTimestamp = getTimestamp(offer.startDate);
      const endTimestamp = getTimestamp(offer.endDate);
      
      setTransactionStep("approving");
      
      toast({
        title: "Creating NFT",
        description: "Please confirm the transaction in your wallet...",
      });
      
      const result = await createOfferNFT(
        ethProvider,
        offer.employerId.walletAddress, // company address
        offer.jobDescription, // skill name - could be more specific based on the offer
        offer.totalPay, // payment amount in wei
        startTimestamp,
        endTimestamp
      );

      //console.log("result:", result);
      
      setTransactionStep("confirming");
      
      // Then update the offer status in the database
      await offerApi.updateOfferStatus(offer._id, 'accepted', result.tokenId);
      
      setTransactionStep("completed");
      
      toast({
        title: "Success!",
        description: "Offer accepted and NFT created. Transaction hash: " + result.transactionHash.slice(0, 10) + "..."
      });
      
      fetchOffers(); // Refresh after update
    } catch (err) {
      console.error("Error accepting offer:", err);
      setError("Failed to accept offer. Please try again.");
      
      toast({
        title: "Error",
        description: "Failed to accept offer: " + (err instanceof Error ? err.message : String(err)),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setBlockchainAction(null);
      setProcessingOfferId(null);
      setTransactionStep(null);
    }
  };

  // Handle paying for an offer (for employers) and buying the NFT
  const handlePayOffer = async (offer: Offer) => {
    if (!ethProvider) {
      toast({
        title: "Error",
        description: "Ethereum provider not available. Please connect your wallet.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setBlockchainAction("payment");
      setProcessingOfferId(offer._id);
      setTransactionStep("preparing");
      
      if (!offer.paymentTxHash) {
        throw new Error("No payment transaction hash found for offer.");
      }

      const tokenId = parseInt(offer.paymentTxHash);
      //alert("tokenId: " + tokenId);
      
      setTransactionStep("fetching");
      
      // Verify wallet address matches the company address in the offer
      const signer = await ethProvider.getSigner();
      const walletAddress = await signer.getAddress();
      
      // First try to fetch the actual offer from the blockchain to ensure we have the correct payment amount
      let payment = offer.totalPay;
      let blockchainOffer;
      
      try {
        blockchainOffer = await getBlockchainOffer(ethProvider, tokenId);
        if (blockchainOffer && blockchainOffer.payment) {
          payment = blockchainOffer.payment.toString();
          console.log(`Using blockchain payment amount: ${payment}`);
          
          // Compare the wallet address with the company address in the blockchain offer
          if (blockchainOffer.company && 
              walletAddress.toLowerCase() !== blockchainOffer.company.toLowerCase()) {
            throw new Error(`Only the company address (${blockchainOffer.company}) can pay for this offer. Your address: ${walletAddress}`);
          }
        }
      } catch (fetchErr) {
        console.warn("Could not fetch blockchain offer details:", fetchErr);
        console.log(`Using database payment amount: ${payment}`);
        
        // If we couldn't fetch the blockchain offer, at least verify against the database
        if (offer.employerId && offer.employerId.walletAddress && 
            walletAddress.toLowerCase() !== offer.employerId.walletAddress.toLowerCase()) {
          throw new Error(`Your wallet address (${walletAddress}) doesn't match the employer address on this offer.`);
        }
      }
      
      setTransactionStep("approving");
      
      toast({
        title: "Sending Payment",
        description: "Please confirm the transaction in your wallet...",
      });
      
      // Buy/trade the NFT by sending ETH
      const result = await tradeOfferNFT(
        ethProvider,
        tokenId,
        payment // Use the payment amount from the blockchain if possible
      );
      
      setTransactionStep("confirming");
      
      // Then update the offer status in the database
      await offerApi.updateOfferStatus(offer._id, 'working', result.hash);
      
      setTransactionStep("completed");
      
      toast({
        title: "Success!",
        description: "Payment sent and NFT acquired. Transaction hash: " + result.hash.slice(0, 10) + "..."
      });
      
      fetchOffers(); // Refresh after update
    } catch (err) {
      console.error("Error paying for offer:", err);
      setError("Failed to process payment. Please try again.");
      
      // Improved error message extraction
      let errorMessage = "Failed to process payment";
      
      if (err instanceof Error) {
        // For direct error messages
        errorMessage = err.message;
        
        // For Ethereum contract errors
        const ethError = err as { reason?: string; error?: { reason?: string }; data?: string; };
        
        // Extract the error message from various possible formats
        if (ethError.reason) {
          errorMessage = ethError.reason;
        } else if (ethError.error?.reason) {
          errorMessage = ethError.error.reason;
        } else if (typeof ethError.data === 'string' && ethError.data.includes('Only specified company can trade')) {
          errorMessage = "Only specified company can trade";
        } else if (err.message.includes('execution reverted:')) {
          // Extract message between quotes if present
          const match = err.message.match(/execution reverted: "(.*?)"/);
          if (match && match[1]) {
            errorMessage = match[1]; 
          }
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setBlockchainAction(null);
      setProcessingOfferId(null);
      setTransactionStep(null);
    }
  };

  // Add this new component for the blockchain loading indicator
  const BlockchainLoadingIndicator = ({ action, step }: { action: string; step: string | null }) => {
    const actionText = {
      acceptance: "Accepting Offer",
      payment: "Processing Payment",
    }[action] || "Processing";
    
    const stepText = {
      preparing: "Preparing transaction...",
      fetching: "Fetching blockchain data...",
      approving: "Waiting for wallet approval...",
      confirming: "Confirming transaction...",
      completed: "Transaction completed!"
    }[step || ""] || "Processing...";
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-16 h-16">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                {action === "acceptance" && <CheckCircle className="w-6 h-6" />}
                {action === "payment" && <CreditCard className="w-6 h-6" />}
              </div>
            </div>
            
            <h3 className="text-xl font-semibold">{actionText}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stepText}</p>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-primary h-2.5 rounded-full animate-pulse"
                style={{ 
                  width: step === "completed" ? "100%" : "80%",
                  transition: "width 0.5s ease-in-out"
                }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Blockchain transactions may take a few moments.<br />Please don't close this window.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // If user not authenticated, prompt login
  if (!isAuthenticated) {
    requireAuth();
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>My Offers</CardTitle>
            <CardDescription>
              You need to be logged in to view your offers
            </CardDescription>
          </CardHeader>
        </Card>
        {LoginDialog}
      </div>
    );
  }

  // If user has neither employer nor professional role
  if (!isEmployer && !isProfessional) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>My Offers</CardTitle>
            <CardDescription>
              You need to have either an employer or professional role to view offers
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Offers</h1>
        <Button 
          onClick={fetchOffers} 
          disabled={loading}
          className="transition-all duration-300 transform hover:scale-105"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 animate-in fade-in-50 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Role tabs */}
      {isEmployer && isProfessional && (
        <Tabs value={activeRoleTab} onValueChange={setActiveRoleTab} className="mb-8">
          <TabsList className="grid grid-cols-2 w-full sm:w-[400px] rounded-xl p-1">
            <TabsTrigger value="employer" className="rounded-lg transition-all duration-200">As Employer</TabsTrigger>
            <TabsTrigger value="professional" className="rounded-lg transition-all duration-200">As Professional</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Status tabs */}
      <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab} className="mb-8">
        <TabsList className="grid grid-cols-5 w-full md:w-auto rounded-xl p-1">
          <TabsTrigger value="all" className="rounded-lg transition-all duration-200">All</TabsTrigger>
          <TabsTrigger value="waiting" className="rounded-lg transition-all duration-200">Awaiting</TabsTrigger>
          <TabsTrigger value="accepted" className="rounded-lg transition-all duration-200">Accepted</TabsTrigger>
          <TabsTrigger value="working" className="rounded-lg transition-all duration-200">In Progress</TabsTrigger>
          <TabsTrigger value="finished" className="rounded-lg transition-all duration-200">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeStatusTab} className="mt-8">
          {loading ? (
            <div className="text-center py-16 animate-pulse">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">Loading offers...</p>
            </div>
          ) : getFilteredOffers().length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">No offers found in this category</p>
            </div>
          ) : (
            <div className="space-y-6">
              {getFilteredOffers().map((offer) => {
                const professional = offer.talentId && offer.talentId._id ? professionals[offer.talentId._id] : undefined;
                
                return (
                <Card 
                  key={offer._id} 
                  className="overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] relative"
                >
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                          {offer.jobDescription}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-2 text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium text-gray-600">{offer.totalWorkHours} hours</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="font-bold text-primary">{formatEth(offer.totalPay)}</span>
                        </CardDescription>
                      </div>
                      <div className="sm:ml-auto">
                        {getStatusBadge(offer.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-5 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Calendar className="h-4 w-4 text-primary mr-2" />
                          Contract Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-700 bg-white px-3 py-1.5 rounded-md border border-gray-200 w-full">
                              {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                            </span>
                          </div>
                          
                          {offer.status === "working" && offer.workStartedAt && (
                            <div className="flex items-center text-sm">
                              <span className="text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100 w-full">
                                Started: {formatDate(offer.workStartedAt)}
                              </span>
                            </div>
                          )}
                          
                          {offer.status === "finished" && offer.workCompletedAt && (
                            <div className="flex items-center text-sm">
                              <span className="text-green-700 bg-green-50 px-3 py-1.5 rounded-md border border-green-100 w-full">
                                Completed: {formatDate(offer.workCompletedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Wallet className="h-4 w-4 text-primary mr-2" />
                          {activeRoleTab === "employer" ? "Professional" : "Employer"}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <span className="font-mono bg-white px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 w-full break-all">
                              {activeRoleTab === "employer" 
                                ? (offer.talentId && offer.talentId.walletAddress ? formatAddress(offer.talentId.walletAddress) : "Address unavailable")
                                : (offer.employerId && offer.employerId.walletAddress ? formatAddress(offer.employerId.walletAddress) : "Address unavailable")
                              }
                            </span>
                          </div>
                          
                          {activeRoleTab === "employer" && offer.talentId && offer.talentId._id && (
                            <div className="flex items-center">
                              <Link 
                                to={`/professional/${offer.talentId._id}`}
                                className="text-sm text-primary flex items-center hover:underline transition-colors duration-200 group"
                              >
                                View Professional Profile
                                <ArrowUpRight className="h-3.5 w-3.5 ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Professional info (only for employer view) */}
                    {activeRoleTab === "employer" && professional && (
                      <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Briefcase className="h-4 w-4 text-primary mr-2" />
                          Professional Details
                        </h4>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded-full border-2 border-gray-200">
                              <img 
                                src={professional.imageUrl || "https://placehold.co/400/gray/white?text=No+Image"} 
                                alt={`${professional.name}'s profile`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex flex-col space-y-1.5">
                                <span className="text-xs text-gray-500">Name</span>
                                <span className="text-sm font-medium">{professional.name}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-sm">{professional.location}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Award className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-sm capitalize">{professional.experience} Level</span>
                              </div>
                              
                              {professional.skills && professional.skills.length > 0 && (
                                <div className="md:col-span-3 mt-2">
                                  <span className="text-xs text-gray-500 block mb-1.5">Skills</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {professional.skills.map(skill => (
                                      <Badge key={skill._id} variant="outline" className="bg-white">
                                        {skill.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Action buttons based on role and status */}
                    <div className="mt-5 flex justify-end">
                      {activeRoleTab === "professional" && offer.status === "waiting" && (
                        <Button 
                          onClick={() => handleAcceptOffer(offer)}
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-2 transition-transform duration-300 hover:scale-105 shadow-sm"
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept & Create NFT
                        </Button>
                      )}
                      
                      {activeRoleTab === "employer" && offer.status === "accepted" && (
                        <Button 
                          onClick={() => handlePayOffer(offer)}
                          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-transform duration-300 hover:scale-105 shadow-sm"
                          disabled={loading}
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay & Buy NFT
                        </Button>
                      )}
                    </div>
                    
                    {offer.paymentTxHash && (
                      <>
                        <Separator className="my-5" />
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <CreditCard className="h-4 w-4 text-primary mr-2" />
                            Blockchain Transaction
                          </h4>
                          <div className="flex items-center text-sm">
                            <span className="font-mono bg-white px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 w-full break-all">
                              {offer.paymentTxHash}
                            </span>
                          </div>
                          <div className="mt-2">
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${offer.paymentTxHash}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary flex items-center hover:underline mt-2"
                            >
                              View on Etherscan
                              <ArrowUpRight className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {offersData && offersData.pagination && offersData.pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage <= 1 || loading}
            className="transition-all duration-300 hover:border-primary hover:text-primary"
          >
            Previous
          </Button>
          
          <span className="flex items-center mx-2 text-sm">
            Page <span className="font-bold mx-1">{currentPage}</span> of <span className="font-bold mx-1">{offersData.pagination.totalPages}</span>
          </span>
          
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, offersData.pagination.totalPages))} 
            disabled={currentPage >= offersData.pagination.totalPages || loading}
            className="transition-all duration-300 hover:border-primary hover:text-primary"
          >
            Next
          </Button>
        </div>
      )}
      
      {blockchainAction && transactionStep && (
        <BlockchainLoadingIndicator action={blockchainAction} step={transactionStep} />
      )}
    </div>
  );
} 