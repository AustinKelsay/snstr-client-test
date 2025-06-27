/**
 * @fileoverview Settings page component for application configuration
 * Provides relay management, theme settings, and privacy controls
 */

import { useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export interface SettingsPageProps {
  className?: string;
}

/**
 * Settings page component handles application configuration
 * Includes relay management, appearance settings, and privacy controls
 */
export function SettingsPage({ className }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState('relays');

  const settingsSections = [
    { id: 'relays', label: 'Relays', icon: '🌐' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' },
  ];

  return (
    <div className={`min-h-screen ${className || ''}`}>
      {/* Page Header */}
      <div className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] sticky top-0 z-10">
        <div className="container-padding">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Settings
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Configure your Nostr client
            </p>
          </div>
        </div>
      </div>

      <div className="container-padding py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="card">
              <nav className="space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeSection === 'relays' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Relay Management
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Manage your Nostr relay connections. Relays are servers that store and distribute your posts.
                  </p>
                  
                  {/* Relay List Placeholder */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--error)]"></div>
                        <span className="text-[var(--text-secondary)] font-mono text-sm">
                          wss://relay.example.com
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-xs text-[var(--text-tertiary)]">Connecting...</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center p-8 border-2 border-dashed border-[var(--border-primary)] rounded-lg">
                      <div className="text-center">
                        <p className="text-[var(--text-secondary)] mb-3">
                          No relays configured
                        </p>
                        <button className="btn-base btn-secondary">
                          Add Relay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Appearance Settings
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Customize the look and feel of your Nostr client.
                  </p>
                  
                  {/* Theme Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[var(--text-primary)] font-medium">
                          Theme
                        </label>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Choose your preferred theme
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--accent-primary)]">Dark (Cypherpunk)</span>
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[var(--text-primary)] font-medium">
                          Font Size
                        </label>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Adjust text size for better readability
                        </p>
                      </div>
                      <select className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded px-3 py-1 text-[var(--text-primary)]">
                        <option>Small</option>
                        <option selected>Medium</option>
                        <option>Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Privacy & Security
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Control your privacy settings and data sharing preferences.
                  </p>
                  
                  {/* Privacy Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[var(--text-primary)] font-medium">
                          NIP-07 Extension
                        </label>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Browser extension for secure key management
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-[var(--warning)]">Not detected</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[var(--text-primary)] font-medium">
                          Auto-connect
                        </label>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Automatically connect to extension on startup
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Advanced Settings
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Advanced configuration for power users.
                  </p>
                  
                  {/* Advanced Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[var(--text-primary)] font-medium">
                          Debug Mode
                        </label>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Enable verbose logging for troubleshooting
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[var(--text-primary)] font-medium">
                          Developer Tools
                        </label>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Show technical information and debugging features
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage; 