/**
 * @fileoverview Settings page component for application configuration
 * Provides relay management, theme settings, and privacy controls
 */

import { useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SettingsNavButton from '@/components/ui/SettingsNavButton';
import Button from '@/components/ui/Button';
import { RelayManagement } from '@/components/settings/RelayManagement';
import { Server, Palette, Shield, Settings as SettingsIcon } from 'lucide-react';

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
    { id: 'relays', label: 'Relays', icon: <Server className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-5 h-5" /> },
    { id: 'advanced', label: 'Advanced', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <div className={`min-h-screen ${className || ''}`}>
      {/* Page Header */}
      <div className="border-b border-border-primary bg-bg-secondary sticky top-0 z-10">
        <div className="container-padding">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-text-primary font-mono tracking-wide">
              SETTINGS
            </h1>
            <p className="text-sm text-text-secondary mt-2 font-mono">
              Configure your Nostr client
            </p>
          </div>
        </div>
      </div>

      <div className="container-padding py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary border border-border-primary rounded-sm p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-text-primary font-mono tracking-wide mb-4 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-accent-primary" />
                NAVIGATION
              </h3>
              <nav className="space-y-2">
                {settingsSections.map((section) => (
                  <SettingsNavButton
                    key={section.id}
                    isActive={activeSection === section.id}
                    onClick={() => setActiveSection(section.id)}
                    icon={section.icon}
                  >
                    {section.label}
                  </SettingsNavButton>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeSection === 'relays' && (
              <RelayManagement />
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-bg-secondary border border-border-primary rounded-sm p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Palette className="w-6 h-6 text-accent-primary" />
                    <h3 className="text-xl font-semibold text-text-primary font-mono tracking-wide">
                      APPEARANCE SETTINGS
                    </h3>
                  </div>
                  <p className="text-text-secondary mb-6 font-mono">
                    Customize the look and feel of your Nostr client.
                  </p>
                  
                  {/* Theme Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-primary rounded-sm">
                      <div>
                        <label className="text-text-primary font-medium font-mono tracking-wide">
                          Theme
                        </label>
                        <p className="text-sm text-text-secondary font-mono">
                          Choose your preferred theme
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-accent-primary/10 border border-accent-primary rounded-sm">
                          <div className="w-3 h-3 rounded-full bg-accent-primary animate-pulse"></div>
                          <span className="text-sm text-accent-primary font-mono font-semibold">
                            CYPHERPUNK DARK
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-primary rounded-sm">
                      <div>
                        <label className="text-text-primary font-medium font-mono tracking-wide">
                          Font Size
                        </label>
                        <p className="text-sm text-text-secondary font-mono">
                          Adjust text size for better readability
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Small</Button>
                        <Button variant="primary" size="sm">Medium</Button>
                        <Button variant="outline" size="sm">Large</Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-primary rounded-sm">
                      <div>
                        <label className="text-text-primary font-medium font-mono tracking-wide">
                          Animation Effects
                        </label>
                        <p className="text-sm text-text-secondary font-mono">
                          Control visual animations and transitions
                        </p>
                      </div>
                      <Button variant="secondary" size="sm">
                        ENABLED
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-bg-secondary border border-border-primary rounded-sm p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-accent-primary" />
                    <h3 className="text-xl font-semibold text-text-primary font-mono tracking-wide">
                      PRIVACY & SECURITY
                    </h3>
                  </div>
                  <p className="text-text-secondary mb-6 font-mono">
                    Control your privacy settings and data sharing preferences.
                  </p>
                  
                  {/* Privacy Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-primary rounded-sm">
                      <div>
                        <label className="text-text-primary font-medium font-mono tracking-wide">
                          NIP-07 Extension
                        </label>
                        <p className="text-sm text-text-secondary font-mono">
                          Browser extension for secure key management
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span className="text-sm text-warning font-mono font-semibold">
                            SCANNING...
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          CONNECT
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-primary rounded-sm">
                      <div>
                        <label className="text-text-primary font-medium font-mono tracking-wide">
                          Auto-connect
                        </label>
                        <p className="text-sm text-text-secondary font-mono">
                          Automatically connect to extension on startup
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        DISABLED
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-primary rounded-sm">
                      <div>
                        <label className="text-text-primary font-medium font-mono tracking-wide">
                          Data Retention
                        </label>
                        <p className="text-sm text-text-secondary font-mono">
                          How long to store local data
                        </p>
                      </div>
                      <Button variant="secondary" size="sm">
                        30 DAYS
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div className="space-y-6">
                <div className="bg-bg-secondary border border-border-primary rounded-sm p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <SettingsIcon className="w-6 h-6 text-accent-primary" />
                    <h3 className="text-xl font-semibold text-text-primary font-mono tracking-wide">
                      ADVANCED SETTINGS
                    </h3>
                  </div>
                  <p className="text-text-secondary mb-6 font-mono">
                    Advanced configuration for power users.
                  </p>
                  
                  {/* Advanced Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-primary rounded-sm">
                      <div>
                        <label className="text-text-primary font-medium font-mono tracking-wide">
                          Debug Mode
                        </label>
                        <p className="text-sm text-text-secondary font-mono">
                          Enable verbose logging for troubleshooting
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        DISABLED
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-primary rounded-sm">
                      <div>
                        <label className="text-text-primary font-medium font-mono tracking-wide">
                          Developer Tools
                        </label>
                        <p className="text-sm text-text-secondary font-mono">
                          Show technical information and debugging features
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        ENABLED
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-bg-tertiary border border-border-primary rounded-sm">
                      <div>
                        <label className="text-text-primary font-medium font-mono tracking-wide">
                          Performance Mode
                        </label>
                        <p className="text-sm text-text-secondary font-mono">
                          Optimize for speed over visual effects
                        </p>
                      </div>
                      <Button variant="secondary" size="sm">
                        BALANCED
                      </Button>
                    </div>

                    <div className="pt-4 border-t border-border-primary">
                      <div className="flex items-center gap-4">
                        <Button variant="destructive" size="sm">
                          RESET SETTINGS
                        </Button>
                        <Button variant="outline" size="sm">
                          EXPORT CONFIG
                        </Button>
                        <Button variant="outline" size="sm">
                          IMPORT CONFIG
                        </Button>
                      </div>
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