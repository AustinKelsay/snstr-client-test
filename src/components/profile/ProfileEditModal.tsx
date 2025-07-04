/**
 * @fileoverview ProfileEditModal component for editing user profile information
 * Provides form interface for updating profile metadata with validation and publishing
 * Integrates with NIP-07 for event signing and publishes to connected relays
 */

import { memo, useState, useCallback, useEffect } from 'react'
import { Upload, Save, Loader2 } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store'
import { selectUser } from '@/store/selectors/authSelectors'
import { updateProfileFromEvent } from '@/store/slices/profilesSlice'
import { Modal } from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/common/Avatar'
import { nostrClient } from '@/features/nostr/nostrClient'
import type { UserProfile } from '@/types/auth'
import { cn } from '@/utils/cn'

interface ProfileEditModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Current profile data to edit */
  profile: UserProfile
  /** Callback fired when modal is closed */
  onClose: () => void
  /** Callback fired when profile is successfully updated */
  onSuccess?: (profile: UserProfile) => void
  /** Additional CSS classes */
  className?: string
}

interface ProfileFormData {
  name: string
  display_name: string
  about: string
  website: string
  nip05: string
  lud16: string
  picture: string
  banner: string
}

/**
 * ProfileEditModal component provides interface for editing user profile
 * Handles form validation, image uploads, and profile metadata publishing
 */
export const ProfileEditModal = memo(function ProfileEditModal({
  isOpen,
  profile,
  onClose,
  onSuccess,
  className,
}: ProfileEditModalProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    display_name: '',
    about: '',
    website: '',
    nip05: '',
    lud16: '',
    picture: '',
    banner: '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({})

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        display_name: profile.display_name || '',
        about: profile.about || '',
        website: profile.website || '',
        nip05: profile.nip05 || '',
        lud16: profile.lud16 || '',
        picture: profile.picture || '',
        banner: profile.banner || '',
      })
    }
  }, [profile])

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  // Validate form data
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<ProfileFormData> = {}

    // Validate name (required, max 50 chars)
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less'
    }

    // Validate display name (max 50 chars)
    if (formData.display_name.length > 50) {
      newErrors.display_name = 'Display name must be 50 characters or less'
    }

    // Validate about (max 500 chars)
    if (formData.about.length > 500) {
      newErrors.about = 'Bio must be 500 characters or less'
    }

    // Validate website URL
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL'
    }

    // Validate NIP-05 format
    if (formData.nip05 && !isValidNip05(formData.nip05)) {
      newErrors.nip05 = 'Please enter a valid NIP-05 identifier (user@domain.com)'
    }

    // Validate Lightning address
    if (formData.lud16 && !isValidLightningAddress(formData.lud16)) {
      newErrors.lud16 = 'Please enter a valid Lightning address'
    }

    // Validate image URLs
    if (formData.picture && !isValidImageUrl(formData.picture)) {
      newErrors.picture = 'Please enter a valid image URL'
    }

    if (formData.banner && !isValidImageUrl(formData.banner)) {
      newErrors.banner = 'Please enter a valid image URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !user?.pubkey) return

    setIsSubmitting(true)

    try {
      // Create profile metadata object
      const metadata = {
        name: formData.name.trim(),
        display_name: formData.display_name.trim() || undefined,
        about: formData.about.trim() || undefined,
        website: formData.website.trim() || undefined,
        nip05: formData.nip05.trim() || undefined,
        lud16: formData.lud16.trim() || undefined,
        picture: formData.picture.trim() || undefined,
        banner: formData.banner.trim() || undefined,
      }

      // Remove undefined values
      const cleanMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([, value]) => value !== undefined)
      )

      // Publish profile update (kind 0 event)
      if (typeof window !== 'undefined' && window.nostr) {
        // Create unsigned event
        const unsignedEvent = {
          kind: 0,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: JSON.stringify(cleanMetadata),
        }

        // Sign event with NIP-07 extension
        const signedEvent = await window.nostr.signEvent(unsignedEvent)
        
        // Publish via nostr client
        await nostrClient.publishEvent(signedEvent)

        // Update local profile store
        const updatedProfile: UserProfile = {
          ...profile,
          ...cleanMetadata,
        }

        dispatch(updateProfileFromEvent({
          pubkey: user.pubkey,
          profile: updatedProfile,
          timestamp: signedEvent.created_at,
        }))

        // Call success callback
        if (onSuccess) {
          onSuccess(updatedProfile)
        }

        // Close modal
        onClose()
      } else {
        throw new Error('NIP-07 extension not available')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      // TODO: Show error notification
    } finally {
      setIsSubmitting(false)
    }
  }, [validateForm, user?.pubkey, formData, profile, dispatch, onSuccess, onClose])

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose()
    }
  }, [isSubmitting, onClose])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile"
      className={cn('max-w-2xl', className)}
    >
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <Avatar
              src={formData.picture}
              name={formData.display_name || formData.name}
              pubkey={profile.pubkey}
              size="xl"
              className="mx-auto"
            />
            <button
              type="button"
              className="absolute -bottom-2 -right-2 p-2 bg-accent-primary text-text-inverse rounded-full hover:bg-accent-secondary transition-colors"
              title="Change avatar"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Your name"
              maxLength={50}
              error={errors.name}
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Display Name
            </label>
            <Input
              type="text"
              value={formData.display_name}
              onChange={(e) => handleFieldChange('display_name', e.target.value)}
              placeholder="Display name"
              maxLength={50}
              error={errors.display_name}
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Bio
          </label>
          <Textarea
            value={formData.about}
            onChange={(e) => handleFieldChange('about', e.target.value)}
            placeholder="Tell people about yourself..."
            rows={4}
            maxLength={500}
            error={errors.about}
          />
          <div className="text-xs text-text-secondary mt-1">
            {formData.about.length}/500 characters
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Website
          </label>
          <Input
            type="url"
            value={formData.website}
            onChange={(e) => handleFieldChange('website', e.target.value)}
            placeholder="https://yourwebsite.com"
            error={errors.website}
          />
        </div>

        {/* NIP-05 */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            NIP-05 Identifier
          </label>
          <Input
            type="text"
            value={formData.nip05}
            onChange={(e) => handleFieldChange('nip05', e.target.value)}
            placeholder="user@domain.com"
            error={errors.nip05}
          />
          <div className="text-xs text-text-secondary mt-1">
            Verifiable identifier for your profile
          </div>
        </div>

        {/* Lightning Address */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Lightning Address
          </label>
          <Input
            type="text"
            value={formData.lud16}
            onChange={(e) => handleFieldChange('lud16', e.target.value)}
            placeholder="user@lightning-provider.com"
            error={errors.lud16}
          />
          <div className="text-xs text-text-secondary mt-1">
            For receiving Bitcoin tips
          </div>
        </div>

        {/* Picture URL */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Profile Picture URL
          </label>
          <Input
            type="url"
            value={formData.picture}
            onChange={(e) => handleFieldChange('picture', e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            error={errors.picture}
          />
        </div>

        {/* Banner URL */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Banner Image URL
          </label>
          <Input
            type="url"
            value={formData.banner}
            onChange={(e) => handleFieldChange('banner', e.target.value)}
            placeholder="https://example.com/banner.jpg"
            error={errors.banner}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
})

// Validation helper functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function isValidNip05(nip05: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(nip05)
}

function isValidLightningAddress(address: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(address)
}

function isValidImageUrl(url: string): boolean {
  if (!isValidUrl(url)) return false
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('imgur.com') || url.includes('nostr.build')
}

export default ProfileEditModal 