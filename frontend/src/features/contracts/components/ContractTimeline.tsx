/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { Offer } from '@/services/api/offer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ethers } from 'ethers';

interface ContractTimelineProps {
  contracts: Offer[];
  title?: string;
  loading?: boolean;
}

export function ContractTimeline({ contracts, title = "Contract History", loading = false }: ContractTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Sort contracts by date - most recent first
  const sortedContracts = [...contracts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Limit displayed contracts if not expanded
  const displayedContracts = expanded ? sortedContracts : sortedContracts.slice(0, 3);
  
  // Format currency (convert Wei to ETH)
  const formatCurrency = (wei: string) => {
    try {
      return `${ethers.formatEther(wei)} ETH`;
    } catch (e) {
      return wei;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Your contract history and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No contracts found
          </div>
        ) : (
          <>
            <Timeline>
              {displayedContracts.map((contract, index) => (
                <TimelineItem 
                  key={contract._id}
                  title={contract.jobDescription}
                  date={contract.createdAt}
                  status={contract.status}
                  isLast={index === displayedContracts.length - 1 && (!expanded || sortedContracts.length === displayedContracts.length)}
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                    <div className="font-medium">Project Period:</div>
                    <div>
                      {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                    </div>
                    
                    <div className="font-medium">Work Hours:</div>
                    <div>{contract.totalWorkHours} hours</div>
                    
                    <div className="font-medium">Payment:</div>
                    <div>{formatCurrency(contract.totalPay)}</div>
                    
                    {contract.paymentTxHash && (
                      <>
                        <div className="font-medium">Transaction:</div>
                        <div className="truncate">
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${contract.paymentTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {contract.paymentTxHash.substring(0, 10)}...
                          </a>
                        </div>
                      </>
                    )}
                    
                    {contract.workStartedAt && (
                      <>
                        <div className="font-medium">Work Started:</div>
                        <div>{new Date(contract.workStartedAt).toLocaleString()}</div>
                      </>
                    )}
                    
                    {contract.workCompletedAt && (
                      <>
                        <div className="font-medium">Completed:</div>
                        <div>{new Date(contract.workCompletedAt).toLocaleString()}</div>
                      </>
                    )}
                  </div>
                </TimelineItem>
              ))}
            </Timeline>
            
            {sortedContracts.length > 3 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Show Less" : `Show All (${sortedContracts.length})`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 