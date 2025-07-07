/**
 * @fileoverview RelayManagement component for managing Nostr relay connections
 * Provides interface for adding, removing, testing, and configuring relays
 * Connects to the real NostrClient for persistent connection status tracking
 */

import { memo, useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, TestTube, Wifi, Clock, CheckCircle, XCircle, WifiOff, Activity, Server, Shield } from 'lucide-react'
import { nostrClient } from '@/features/nostr/nostrClient'
import { relayManager, type RelayConfig } from '@/features/nostr/relayManager'
import type { RelayStatus } from '@/features/nostr/types'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

interface RelayManagementProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * RelayManagement component provides a comprehensive interface for managing Nostr relays
 * Features real-time status monitoring, relay testing, and configuration management
 * Now uses the actual NostrClient for persistent connection tracking
 */
export const RelayManagement = memo(function RelayManagement({
  className,
}: RelayManagementProps) {
  const [relays, setRelays] = useState<RelayConfig[]>([])
  const [statuses, setStatuses] = useState<Map<string, RelayStatus>>(new Map())
  const [newRelayUrl, setNewRelayUrl] = useState('')
  const [isAddingRelay, setIsAddingRelay] = useState(false)
  const [testingRelays, setTestingRelays] = useState<Set<string>>(new Set())

  // Load initial relay data and connect to real NostrClient status
  useEffect(() => {
    const loadRelayData = () => {
      // Get relay configs from manager (for UI configuration)
      const relayConfigs = relayManager.getAllRelays()
      
      // Get actual connection status from NostrClient (persistent connections)
      const nostrStatuses = nostrClient.getRelayStatuses()
      const statusMap = new Map<string, RelayStatus>()
      
      nostrStatuses.forEach(status => {
        statusMap.set(status.url, status)
      })
      
      setRelays(relayConfigs)
      setStatuses(statusMap)
      
      // Debug logging to help troubleshoot connection status
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Relay Status Debug:', {
          configuredRelays: relayConfigs.length,
          nostrClientStatuses: nostrStatuses.length,
          connectedCount: nostrStatuses.filter(s => s.connected).length,
          connectingCount: nostrStatuses.filter(s => s.connecting).length,
          statuses: nostrStatuses.map(s => ({
            url: s.url,
            connected: s.connected,
            connecting: s.connecting,
            error: s.error
          }))
        })
      }
    }

    loadRelayData()

    // Set up periodic status updates to get real connection status
    const interval = setInterval(loadRelayData, 2000) // Update every 2 seconds for better responsiveness

    // Initialize NostrClient connections if not already connected
    const initializeConnections = async () => {
      try {
        const connectedRelays = nostrClient.getConnectedRelays()
        if (connectedRelays.length === 0) {
          console.log('🚀 Initializing NostrClient connections...')
          await nostrClient.connectToRelays()
        }
      } catch (error) {
        console.error('Failed to initialize NostrClient connections:', error)
      }
    }

    initializeConnections()

    return () => {
      clearInterval(interval)
    }
  }, [])

  // Add new relay
  const handleAddRelay = useCallback(async () => {
    if (!newRelayUrl.trim()) return

    setIsAddingRelay(true)
    
    try {
      // Validate URL format
      const url = newRelayUrl.trim()
      if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
        throw new Error('Relay URL must start with ws:// or wss://')
      }

      // Add relay to both manager (for config) and NostrClient (for connections)
      const config: RelayConfig = {
        url,
        read: true,
        write: true,
        enabled: true,
        priority: relays.length + 1
      }

      relayManager.addRelay(config)
      await nostrClient.addRelay(url) // Add to actual client for persistent connections
      
      // Update local state
      setRelays(relayManager.getAllRelays())
      setNewRelayUrl('')
      
    } catch (error) {
      console.error('Failed to add relay:', error)
      // TODO: Show error toast/notification
    } finally {
      setIsAddingRelay(false)
    }
  }, [newRelayUrl, relays.length])

  // Remove relay
  const handleRemoveRelay = useCallback(async (url: string) => {
    try {
      relayManager.removeRelay(url)
      await nostrClient.removeRelay(url) // Remove from actual client
      
      setRelays(relayManager.getAllRelays())
      setStatuses(prev => {
        const updated = new Map(prev)
        updated.delete(url)
        return updated
      })
    } catch (error) {
      console.error('Failed to remove relay:', error)
    }
  }, [])

  // Test relay connection using RelayManager for quick test
  const handleTestRelay = useCallback(async (url: string) => {
    setTestingRelays(prev => new Set(prev).add(url))
    
    try {
      // Use RelayManager for quick connection test
      await relayManager.testRelay(url)
      
      // Also trigger NostrClient reconnection if needed
      const currentStatus = statuses.get(url)
      if (!currentStatus?.connected) {
        await nostrClient.connectToRelays()
      }
    } catch (error) {
      console.error(`Failed to test relay ${url}:`, error)
    } finally {
      setTestingRelays(prev => {
        const updated = new Set(prev)
        updated.delete(url)
        return updated
      })
    }
  }, [statuses])

  // Toggle relay configuration
  const handleToggleConfig = useCallback((url: string, field: 'read' | 'write' | 'enabled') => {
    const relay = relays.find(r => r.url === url)
    if (!relay) return

    const updates = { [field]: !relay[field] }
    relayManager.updateRelay(url, updates)
    setRelays(relayManager.getAllRelays())
    
    // If disabling/enabling relay, reconnect NostrClient
    if (field === 'enabled') {
      nostrClient.connectToRelays().catch(error => {
        console.error('Failed to update NostrClient connections:', error)
      })
    }
  }, [relays])

  // Get enhanced status indicator
  const getStatusIndicator = (url: string) => {
    const status = statuses.get(url)
    const isTesting = testingRelays.has(url)

    if (isTesting) {
      return (
        <div className="flex items-center gap-2 text-accent-primary bg-accent-primary/10 px-2 py-1 rounded border border-accent-primary/30">
          <LoadingSpinner size="sm" />
          <span className="text-xs font-mono tracking-wide">TESTING...</span>
        </div>
      )
    }

    if (!status) {
      return (
        <div className="flex items-center gap-2 text-text-tertiary bg-bg-quaternary px-2 py-1 rounded border border-border-primary">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-mono tracking-wide">UNKNOWN</span>
        </div>
      )
    }

    if (status.connecting) {
      return (
        <div className="flex items-center gap-2 text-warning bg-warning/10 px-2 py-1 rounded border border-warning/30">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-mono tracking-wide">CONNECTING...</span>
        </div>
      )
    }

    if (status.connected) {
      return (
        <div className="flex items-center gap-2 text-success bg-success/10 px-2 py-1 rounded border border-success/30">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-mono tracking-wide">ONLINE</span>
          {status.latency && (
            <span className="text-xs font-mono text-text-tertiary bg-bg-secondary px-1 rounded">
              {status.latency}ms
            </span>
          )}
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 text-error bg-error/10 px-2 py-1 rounded border border-error/30">
        <XCircle className="w-4 h-4" />
        <span className="text-xs font-mono tracking-wide">
          {status.error ? 'ERROR' : 'OFFLINE'}
        </span>
      </div>
    )
  }

  const connectedCount = Array.from(statuses.values()).filter(s => s.connected).length
  const readRelayCount = relays.filter(r => r.read && r.enabled).length
  const writeRelayCount = relays.filter(r => r.write && r.enabled).length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with status overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-text-primary font-mono tracking-wide">
            RELAY MANAGEMENT
        </h3>
          <div className={cn(
            'flex items-center gap-2 px-3 py-1 rounded text-xs font-mono',
            connectedCount > 0 ? 'bg-success/10 text-success border border-success/30' : 
            'bg-error/10 text-error border border-error/30'
          )}>
            <Server className="w-4 h-4" />
            <span>{connectedCount}/{relays.length} ONLINE</span>
          </div>
        </div>
        
        <p className="text-text-secondary font-mono text-sm leading-relaxed">
          Manage your Nostr relay connections. Relays are decentralized servers that store and distribute your encrypted messages across the network.
        </p>
      </div>

      {/* Add Relay Form */}
      <div className="bg-bg-secondary border border-border-primary rounded p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Plus className="w-5 h-5 text-accent-primary" />
          <h4 className="text-lg font-semibold text-text-primary font-mono tracking-wide">
            ADD NEW RELAY
        </h4>
        </div>
        
        <div className="flex gap-3">
          <Input
            type="url"
            placeholder="wss://relay.example.com"
            value={newRelayUrl}
            onChange={(e) => setNewRelayUrl(e.target.value)}
            className="flex-1"
            variant="technical"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddRelay()
              }
            }}
          />
          <Button
            onClick={handleAddRelay}
            disabled={!newRelayUrl.trim() || isAddingRelay}
            variant="primary"
            className="flex items-center gap-2 font-mono min-w-[100px]"
          >
            {isAddingRelay ? (
              <>
              <LoadingSpinner size="sm" />
                <span>ADDING...</span>
              </>
            ) : (
              <>
              <Plus className="w-4 h-4" />
                <span>ADD</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Relay List */}
      <div className="bg-bg-secondary border border-border-primary rounded p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5 text-accent-primary" />
            <h4 className="text-lg font-semibold text-text-primary font-mono tracking-wide">
              ACTIVE RELAYS ({relays.length})
          </h4>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-text-secondary">{connectedCount} CONNECTED</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-accent-primary rounded-full" />
              <span className="text-text-secondary">{readRelayCount} READ</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-warning rounded-full" />
              <span className="text-text-secondary">{writeRelayCount} WRITE</span>
            </div>
          </div>
        </div>

        {relays.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <WifiOff className="w-16 h-16 text-text-tertiary mx-auto" />
            <div className="space-y-2">
              <p className="text-text-secondary font-mono text-lg">
                NO RELAYS CONFIGURED
            </p>
              <p className="text-text-tertiary font-mono text-sm">
                Add a relay above to connect to the Nostr network
            </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {relays.map((relay) => (
              <div
                key={relay.url}
                className={cn(
                  'group relative flex items-center justify-between p-4 rounded border transition-all duration-200',
                  'bg-bg-tertiary border-border-primary hover:border-accent-primary/50 hover:bg-bg-hover'
                )}
              >
                {/* Relay Info */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusIndicator(relay.url)}
                    <span className="text-text-primary font-mono text-sm font-medium truncate">
                      {relay.url}
                    </span>
                    {!relay.enabled && (
                      <span className="text-error text-xs font-mono bg-error/10 px-2 py-1 rounded border border-error/30">
                        DISABLED
                      </span>
                    )}
                  </div>
                  
                  {/* Configuration toggles */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group/toggle">
                      <input
                        type="checkbox"
                        checked={relay.enabled}
                        onChange={() => handleToggleConfig(relay.url, 'enabled')}
                        className="w-4 h-4 rounded border-border-secondary bg-bg-secondary accent-accent-primary"
                      />
                      <span className={cn(
                        'text-xs font-mono tracking-wide transition-colors',
                        relay.enabled ? 'text-text-primary group-hover/toggle:text-accent-primary' : 'text-text-tertiary'
                      )}>
                        ENABLED
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer group/toggle">
                      <input
                        type="checkbox"
                        checked={relay.read}
                        onChange={() => handleToggleConfig(relay.url, 'read')}
                        className="w-4 h-4 rounded border-border-secondary bg-bg-secondary accent-accent-primary"
                        disabled={!relay.enabled}
                      />
                      <span className={cn(
                        'text-xs font-mono tracking-wide transition-colors',
                        relay.read && relay.enabled ? 'text-text-primary group-hover/toggle:text-accent-primary' : 'text-text-tertiary'
                      )}>
                        READ
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer group/toggle">
                      <input
                        type="checkbox"
                        checked={relay.write}
                        onChange={() => handleToggleConfig(relay.url, 'write')}
                        className="w-4 h-4 rounded border-border-secondary bg-bg-secondary accent-accent-primary"
                        disabled={!relay.enabled}
                      />
                      <span className={cn(
                        'text-xs font-mono tracking-wide transition-colors',
                        relay.write && relay.enabled ? 'text-text-primary group-hover/toggle:text-accent-primary' : 'text-text-tertiary'
                      )}>
                        WRITE
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTestRelay(relay.url)}
                    disabled={testingRelays.has(relay.url)}
                    className="p-2 font-mono"
                    title="Test connection"
                  >
                    <TestTube className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRelay(relay.url)}
                    className="p-2 text-error hover:bg-error/10 hover:border-error/30 font-mono"
                    title="Remove relay"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Connection indicator */}
                <div className={cn(
                  'absolute left-0 top-0 bottom-0 w-1 rounded-l transition-all duration-200',
                  statuses.get(relay.url)?.connected ? 'bg-success' : 
                  statuses.get(relay.url)?.connecting ? 'bg-warning animate-pulse' : 
                  'bg-error/30'
                )} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Statistics */}
      <div className="bg-bg-secondary border border-border-primary rounded p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-accent-primary" />
          <h4 className="text-lg font-semibold text-text-primary font-mono tracking-wide">
            NETWORK STATISTICS
        </h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg-tertiary border border-border-primary rounded p-4 text-center space-y-2">
            <div className="text-2xl font-bold text-accent-primary font-mono">
              {relays.length}
            </div>
            <div className="text-xs text-text-secondary font-mono tracking-wide">TOTAL RELAYS</div>
          </div>
          
          <div className="bg-bg-tertiary border border-border-primary rounded p-4 text-center space-y-2">
            <div className="text-2xl font-bold text-success font-mono">
              {connectedCount}
            </div>
            <div className="text-xs text-text-secondary font-mono tracking-wide">CONNECTED</div>
          </div>
          
          <div className="bg-bg-tertiary border border-border-primary rounded p-4 text-center space-y-2">
            <div className="text-2xl font-bold text-text-primary font-mono">
              {readRelayCount}
            </div>
            <div className="text-xs text-text-secondary font-mono tracking-wide">READ RELAYS</div>
          </div>
          
          <div className="bg-bg-tertiary border border-border-primary rounded p-4 text-center space-y-2">
            <div className="text-2xl font-bold text-text-primary font-mono">
              {writeRelayCount}
            </div>
            <div className="text-xs text-text-secondary font-mono tracking-wide">WRITE RELAYS</div>
          </div>
        </div>
        
        {/* Network health indicator */}
        <div className="mt-6 p-4 bg-bg-primary border border-border-primary rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-accent-primary" />
              <span className="font-mono text-sm text-text-primary">NETWORK HEALTH</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex items-center gap-2 px-3 py-1 rounded text-xs font-mono',
                connectedCount >= 3 ? 'bg-success/10 text-success border border-success/30' : 
                connectedCount >= 1 ? 'bg-warning/10 text-warning border border-warning/30' :
                'bg-error/10 text-error border border-error/30'
              )}>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  connectedCount >= 3 ? 'bg-success animate-pulse' : 
                  connectedCount >= 1 ? 'bg-warning animate-pulse' :
                  'bg-error'
                )} />
                <span>
                  {connectedCount >= 3 ? 'EXCELLENT' : 
                   connectedCount >= 1 ? 'ADEQUATE' : 
                   'DISCONNECTED'}
                </span>
              </div>
              
              {/* Manual connect button for troubleshooting */}
              {connectedCount === 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    try {
                      console.log('🔄 Manual connection attempt...')
                      await nostrClient.connectToRelays()
                    } catch (error) {
                      console.error('Manual connection failed:', error)
                    }
                  }}
                  className="text-xs font-mono"
                >
                  CONNECT NOW
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default RelayManagement 