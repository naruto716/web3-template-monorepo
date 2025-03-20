import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ethers } from "ethers"

// Combine class names with Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format an address to a shortened version
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format an amount of ETH with the specified number of decimals
export function formatEth(wei: bigint | string, decimals: number = 4): string {
  try {
    const amount = ethers.formatEther(wei)
    return parseFloat(amount).toFixed(decimals) + ' ETH'
  } catch (error) {
    console.error('Error formatting ETH:', error)
    return '0 ETH'
  }
}

// Parse an ETH amount to wei
export function parseEth(eth: string): bigint {
  try {
    return ethers.parseEther(eth)
  } catch (error) {
    console.error('Error parsing ETH:', error)
    return BigInt(0)
  }
}

// Check if the address is valid
export function isValidAddress(address: string): boolean {
  try {
    ethers.getAddress(address) // This will throw for invalid addresses
    return true
  } catch (error) {
    console.error('Error validating address:', error)
    return false
  }
}
