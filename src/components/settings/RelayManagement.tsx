/**
 * @fileoverview RelayManagement component for managing Nostr relay connections
 * Provides interface for adding, removing, testing, and configuring relays
 * Connects to the existing RelayManager backend with real-time status updates
 */

import { memo, useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, TestTube, Wifi, Clock, CheckCircle, XCircle } from 'lucide-react'
import { relayManager, type RelayConfig, type RelayStatus } from '@/features/nostr/relayManager'
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
 */
export const RelayManagement = memo(function RelayManagement({
  className,
}: RelayManagementProps) {
  const [relays, setRelays] = useState<RelayConfig[]>([])
  const [statuses, setStatuses] = useState<Map<string, RelayStatus>>(new Map())
  const [newRelayUrl, setNewRelayUrl] = useState('')
  const [isAddingRelay, setIsAddingRelay] = useState(false)
  const [testingRelays, setTestingRelays] = useState<Set<string>>(new Set())

  // Load initial relay data
  useEffect(() => {
    const loadRelayData = () => {
      const relayConfigs = relayManager.getAllRelays()
      const relayStatuses = new Map<string, RelayStatus>()
      
      relayConfigs.forEach(config => {
        const status = relayManager.getRelayStatus(config.url)
        if (status) {
          relayStatuses.set(config.url, status)
        }
      })
      
      setRelays(relayConfigs)
      setStatuses(relayStatuses)
    }

    loadRelayData()

    // Set up periodic status updates since relayManager doesn't have events
    const interval = setInterval(loadRelayData, 5000) // Update every 5 seconds

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

      // Add relay to manager
      const config: RelayConfig = {
        url,
        read: true,
        write: true,
        enabled: true,
        priority: relays.length + 1
      }

      relayManager.addRelay(config)
      
      // Test the new relay
      await relayManager.testRelay(url)
      
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
  const handleRemoveRelay = useCallback((url: string) => {
    relayManager.removeRelay(url)
    setRelays(relayManager.getAllRelays())
    setStatuses(prev => {
      const updated = new Map(prev)
      updated.delete(url)
      return updated
    })
  }, [])

  // Test relay connection
  const handleTestRelay = useCallback(async (url: string) => {
    setTestingRelays(prev => new Set(prev).add(url))
    
    try {
      await relayManager.testRelay(url)
      // Status will be updated via event listener
    } catch (error) {
      console.error(`Failed to test relay ${url}:`, error)
    } finally {
      setTestingRelays(prev => {
        const updated = new Set(prev)
        updated.delete(url)
        return updated
      })
    }
  }, [])

  // Toggle relay configuration
  const handleToggleConfig = useCallback((url: string, field: 'read' | 'write' | 'enabled') => {
    const relay = relays.find(r => r.url === url)
    if (!relay) return

    const updates = { [field]: !relay[field] }
    relayManager.updateRelay(url, updates)
    setRelays(relayManager.getAllRelays())
  }, [relays])

  // Get status indicator
  const getStatusIndicator = (url: string) => {
    const status = statuses.get(url)
    const isTesting = testingRelays.has(url)

    if (isTesting) {
      return (
        <div className="flex items-center gap-2 text-warning">
          <LoadingSpinner size="sm" />
          <span className="text-xs">Testing...</span>
        </div>
      )
    }

    if (!status) {
      return (
        <div className="flex items-center gap-2 text-text-tertiary">
          <Clock className="w-4 h-4" />
          <span className="text-xs">Unknown</span>
        </div>
      )
    }

    if (status.connecting) {
      return (
        <div className="flex items-center gap-2 text-warning">
          <LoadingSpinner size="sm" />
          <span className="text-xs">Connecting...</span>
        </div>
      )
    }

    if (status.connected) {
      return (
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs">Connected</span>
          {status.latency && (
            <span className="text-xs text-text-tertiary">
              ({status.latency}ms)
            </span>
          )}
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 text-error">
        <XCircle className="w-4 h-4" />
        <span className="text-xs">
          {status.error || 'Disconnected'}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Relay Management
        </h3>
        <p className="text-text-secondary">
          Manage your Nostr relay connections. Relays are servers that store and distribute your posts.
        </p>
      </div>

      {/* Add Relay Form */}
      <div className="card">
        <h4 className="text-md font-medium text-text-primary mb-4">
          Add New Relay
        </h4>
        <div className="flex gap-3">
          <Input
            type="url"
            placeholder="wss://relay.example.com"
            value={newRelayUrl}
            onChange={(e) => setNewRelayUrl(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddRelay()
              }
            }}
          />
          <Button
            onClick={handleAddRelay}
            disabled={!newRelayUrl.trim() || isAddingRelay}
            className="flex items-center gap-2"
          >
            {isAddingRelay ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Add</span>
          </Button>
        </div>
      </div>

      {/* Relay List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-text-primary">
            Current Relays ({relays.length})
          </h4>
          <div className="text-xs text-text-secondary">
            Connected: {Array.from(statuses.values()).filter(s => s.connected).length}
          </div>
        </div>

        {relays.length === 0 ? (
          <div className="text-center py-8">
            <Wifi className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary mb-2">
              No relays configured
            </p>
            <p className="text-text-tertiary text-sm">
              Add a relay above to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {relays.map((relay) => (
              <div
                key={relay.url}
                className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg border border-border-primary"
              >
                {/* Relay Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIndicator(relay.url)}
                    <span className="text-text-primary font-mono text-sm truncate">
                      {relay.url}
                    </span>
                  </div>
                  
                  {/* Configuration toggles */}
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={relay.enabled}
                        onChange={() => handleToggleConfig(relay.url, 'enabled')}
                        className="w-3 h-3 rounded border-border-secondary bg-bg-secondary"
                      />
                      <span className={relay.enabled ? 'text-text-primary' : 'text-text-tertiary'}>
                        Enabled
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={relay.read}
                        onChange={() => handleToggleConfig(relay.url, 'read')}
                        className="w-3 h-3 rounded border-border-secondary bg-bg-secondary"
                        disabled={!relay.enabled}
                      />
                      <span className={relay.read && relay.enabled ? 'text-text-primary' : 'text-text-tertiary'}>
                        Read
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={relay.write}
                        onChange={() => handleToggleConfig(relay.url, 'write')}
                        className="w-3 h-3 rounded border-border-secondary bg-bg-secondary"
                        disabled={!relay.enabled}
                      />
                      <span className={relay.write && relay.enabled ? 'text-text-primary' : 'text-text-tertiary'}>
                        Write
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
                    className="p-2"
                    title="Test connection"
                  >
                    <TestTube className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRelay(relay.url)}
                    className="p-2 text-error hover:bg-error hover:bg-opacity-10"
                    title="Remove relay"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="card">
        <h4 className="text-md font-medium text-text-primary mb-4">
          Statistics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-primary">
              {relays.length}
            </div>
            <div className="text-xs text-text-secondary">Total Relays</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {Array.from(statuses.values()).filter(s => s.connected).length}
            </div>
            <div className="text-xs text-text-secondary">Connected</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">
              {relays.filter(r => r.read && r.enabled).length}
            </div>
            <div className="text-xs text-text-secondary">Read Relays</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">
              {relays.filter(r => r.write && r.enabled).length}
            </div>
            <div className="text-xs text-text-secondary">Write Relays</div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default RelayManagement 