# snstr-client-test - User Flow

This document defines the complete user journey through the snstr-client-test application, covering all major user pathways from initial access through advanced feature usage. The flows are designed to work seamlessly across mobile and desktop devices with a simple, elegant, and intuitive interface.

---

## Application Entry Points

### Initial App Access
```
User visits app URL
    ↓
Check NIP-07 extension status
    ↓
┌─ Extension Available ────────────┐    ┌─ No Extension ──────────────────┐
│   ↓                              │    │   ↓                              │
│ Check if user is logged in       │    │ Show informative error message   │
│   ↓                              │    │ "NIP-07 browser extension        │
│ ┌─ Logged In ─┐  ┌─ Not Logged─┐ │    │  required for authentication.    │
│ │     ↓       │  │      ↓      │ │    │  Please install: Alby, nos2x,    │
│ │ Following   │  │   Discover   │ │    │  or Flamingo extension"          │
│ │    Feed     │  │     Feed     │ │    │   ↓                              │
│ └─────────────┘  └──────────────┘ │    │ [Install Extension Guide Button] │
└──────────────────────────────────┘    └──────────────────────────────────┘
```

---

## Authentication Flow

### Login Process
```
User clicks "Login" button
    ↓
Check NIP-07 extension availability
    ↓
┌─ Extension Available ─────────────────┐    ┌─ No Extension ─────────────────┐
│   ↓                                   │    │   ↓                            │
│ Request public key from extension     │    │ Show error message             │
│   ↓                                   │    │ Return to previous state       │
│ ┌─ Success ─────┐  ┌─ User Denied ─┐  │    └────────────────────────────────┘
│ │      ↓        │  │      ↓       │  │
│ │ Store pubkey  │  │ Show error   │  │
│ │ Set logged in │  │ Stay logged  │  │
│ │ Redirect to   │  │ out state    │  │
│ │ Following     │  └──────────────┘  │
│ │ Feed          │                    │
│ └───────────────┘                    │
└───────────────────────────────────────┘
```

### Logout Process
```
User clicks "Logout" button
    ↓
Clear user session data
    ↓
Redirect to Discover feed
    ↓
Update navigation state
```

---

## Main Navigation Structure

### Primary Navigation (Available on all pages)
```
┌─ Mobile Layout ────────────────────┐    ┌─ Desktop Layout ───────────────────┐
│                                    │    │                                    │
│ [☰] snstr-client-test    [Profile] │    │ ┌─ Sidebar ─────────────────────┐  │
│ ────────────────────────────────── │    │ │ snstr-client-test             │  │
│                                    │    │ │                               │  │
│ Bottom Tab Bar:                    │    │ │ 🏠 Following                  │  │
│ [🏠] [🔍] [✏️] [💬] [⚙️]           │    │ │ 🌟 Discover                   │  │
│                                    │    │ │ 🔍 Search                     │  │
│                                    │    │ │ ✏️ Compose                    │  │
│                                    │    │ │ 💬 Messages                   │  │
│                                    │    │ │ ⚙️ Settings                   │  │
│                                    │    │ │                               │  │
│                                    │    │ │ [Login/Logout Button]         │  │
│                                    │    │ └───────────────────────────────┘  │
└────────────────────────────────────┘    └────────────────────────────────────┘
```

### Navigation Logic
- **Not Logged In**: Show Discover, Search, Settings only
- **Logged In**: Show all navigation options
- **Active States**: Highlight current page in navigation
- **Responsive**: Mobile uses bottom tabs, Desktop uses sidebar

---

## Feed Flows

### Discover Feed (Default for non-logged users)
```
Load Discover Feed
    ↓
Connect to default relays:
- wss://relay.primal.net
- wss://relay.damus.io
    ↓
Fetch popular kind-1 events
    ↓
Display chronological timeline
    ↓
┌─ User Interactions ────────────────────────┐
│                                            │
│ Click Post → View Post Detail Page        │
│ Click Profile → View Profile Page         │
│ Click Hashtag → Search Results            │
│ Scroll Down → Load More Posts (Infinite)  │
│                                            │
│ If Logged In:                              │
│ Click ❤️ → Toggle Like (Inline)           │
│ Click ⚡ → Zap Modal                      │
│ Click 💬 → Reply Modal/Thread View        │
│ Click 🔄 → Repost Modal                   │
└────────────────────────────────────────────┘
```

### Following Feed (Logged in users only)
```
Load Following Feed
    ↓
Get user's follow list (NIP-02)
    ↓
┌─ Has Follows ──────────────┐    ┌─ No Follows ─────────────────┐
│   ↓                        │    │   ↓                          │
│ Fetch events from followed │    │ Show empty state with        │
│ users across all relays    │    │ suggestions:                 │
│   ↓                        │    │ "You're not following anyone │
│ Display chronological      │    │  yet. Try the Discover tab   │
│ timeline                   │    │  or search for interesting   │
│   ↓                        │    │  people to follow."          │
│ Same interaction options   │    │ [Go to Discover] [Search]    │
│ as Discover feed           │    └──────────────────────────────┘
└────────────────────────────┘
```

---

## Content Creation Flows

### Compose Note
```
User clicks "Compose" or ✏️
    ↓
┌─ Not Logged In ────────────┐    ┌─ Logged In ─────────────────────┐
│   ↓                        │    │   ↓                             │
│ Show login prompt          │    │ Open compose modal/page         │
│ "Please login to post"     │    │   ↓                             │
│ [Login Button]             │    │ Text area with:                 │
└────────────────────────────┘    │ - Character counter (280 limit) │
                                  │ - @ mention autocomplete        │
                                  │ - # hashtag highlighting        │
                                  │ - Media upload button           │
                                  │   ↓                             │
                                  │ User types content              │
                                  │   ↓                             │
                                  │ [Cancel] [Post] buttons         │
                                  │   ↓                             │
                                  │ ┌─ Post ─────┐ ┌─ Cancel ────┐  │
                                  │ │     ↓       │ │     ↓       │  │
                                  │ │ Sign event  │ │ Close modal │  │
                                  │ │ via NIP-07  │ │ Discard     │  │
                                  │ │     ↓       │ │ content     │  │
                                  │ │ Publish to  │ └─────────────┘  │
                                  │ │ relays      │                 │
                                  │ │     ↓       │                 │
                                  │ │ Show in     │                 │
                                  │ │ timeline    │                 │
                                  │ │ (optimistic)│                 │
                                  │ └─────────────┘                 │
                                  └─────────────────────────────────┘
```

### Reply to Note
```
User clicks 💬 on a post
    ↓
┌─ Not Logged In ────────────┐    ┌─ Logged In ─────────────────────┐
│   ↓                        │    │   ↓                             │
│ Show login prompt          │    │ Open reply modal with:          │
│ "Please login to reply"    │    │ - Original post context        │
│ [Login Button]             │    │ - Reply composition area       │
└────────────────────────────┘    │ - @ mention prefilled          │
                                  │   ↓                             │
                                  │ User composes reply             │
                                  │   ↓                             │
                                  │ [Cancel] [Reply] buttons        │
                                  │   ↓                             │
                                  │ Same signing & publishing       │
                                  │ flow as compose                 │
                                  │   ↓                             │
                                  │ Update thread view              │
                                  └─────────────────────────────────┘
```

---

## Post Interaction Flows

### View Post Detail
```
User clicks on a post
    ↓
Navigate to dedicated post page
    ↓
Display post with:
- Full content
- Author info
- Timestamp
- Interaction buttons
- Reply thread below
    ↓
┌─ Logged In Interactions ───────────────────┐
│                                            │
│ ❤️ Like → Toggle like state (inline)       │
│ ⚡ Zap → Open zap modal                   │
│ 💬 Reply → Open reply modal              │
│ 🔄 Repost → Open repost modal            │
│ 📋 Copy Link → Copy post URL             │
│ 🚫 Report → Report modal                 │
└────────────────────────────────────────────┘
```

### Zap Flow
```
User clicks ⚡ on a post
    ↓
┌─ Not Logged In ────────────┐    ┌─ Logged In ─────────────────────┐
│   ↓                        │    │   ↓                             │
│ Show login prompt          │    │ Open zap modal with:            │
│ "Please login to zap"      │    │ - Amount selector (21, 100,     │
│ [Login Button]             │    │   500, custom sats)             │
└────────────────────────────┘    │ - Optional message field        │
                                  │ - Recipient info                │
                                  │   ↓                             │
                                  │ User selects amount & message   │
                                  │   ↓                             │
                                  │ [Cancel] [Send Zap] buttons     │
                                  │   ↓                             │
                                  │ ┌─ Send Zap ──────────────────┐ │
                                  │ │   ↓                         │ │
                                  │ │ Generate zap request        │ │
                                  │ │   ↓                         │ │
                                  │ │ Open Lightning wallet       │ │
                                  │ │   ↓                         │ │
                                  │ │ ┌─ Success ─┐ ┌─ Failed ──┐ │ │
                                  │ │ │     ↓     │ │     ↓     │ │ │
                                  │ │ │ Show zap  │ │ Show error│ │ │
                                  │ │ │ confirmed │ │ message   │ │ │
                                  │ │ │ in UI     │ │ Allow     │ │ │
                                  │ │ └───────────┘ │ retry     │ │ │
                                  │ │               └───────────┘ │ │
                                  │ └─────────────────────────────┘ │
                                  └─────────────────────────────────┘
```

---

## Profile Flows

### View Profile
```
User clicks on username/avatar
    ↓
Navigate to profile page
    ↓
Display profile with:
- Avatar & banner
- Display name & username
- Bio & NIP-05 verification
- Follower/following counts
- User's posts timeline
    ↓
┌─ Own Profile ──────────────┐    ┌─ Other User's Profile ──────────┐
│   ↓                        │    │   ↓                             │
│ Show [Edit Profile] button │    │ Show [Follow/Unfollow] button   │
│   ↓                        │    │ Show [Message] button           │
│ ┌─ Edit Profile ──────────┐ │    │   ↓                             │
│ │   ↓                     │ │    │ ┌─ Follow ─────┐ ┌─ Message ──┐ │
│ │ Open edit modal with:   │ │    │ │      ↓       │ │     ↓      │ │
│ │ - Avatar upload         │ │    │ │ Update follow │ │ Open DM    │ │
│ │ - Banner upload         │ │    │ │      ↓       │ │     ↓      │ │
│ │ - Display name field    │ │    │ │ Sign & publish│ │ Navigate   │ │
│ │ - Bio text area         │ │    │ │      ↓       │ │ to DM page │ │
│ │ - NIP-05 field          │ │    │ │ Update button │ └────────────┘ │
│ │   ↓                     │ │    │ │ state         │               │
│ │ [Cancel] [Save]         │ │    │ │ Update button │ └────────────┘ │
│ │   ↓                     │ │    │ │ state         │               │
│ │ Save profile metadata   │ │    └─────────────────────────────────┘
│ │ Sign & publish event    │ │
│ └─────────────────────────┘ │
└────────────────────────────┘
```

---

## Search & Discovery Flows

### Search Flow
```
User clicks search or types in search bar
    ↓
Real-time search with:
┌─ Search Types ─────────────────────────────┐
│                                            │
│ @ username search → User results           │
│ # hashtag search → Tag results            │
│ npub/nprofile → Direct profile lookup     │
│ General text → Content search             │
└────────────────────────────────────────────┘
    ↓
Display search results with:
- User profiles (with follow buttons)
- Recent posts matching query
- Trending hashtags
    ↓
User clicks result → Navigate to profile/post
```

### Discovery Recommendations
```
Discovery Tab Algorithm:
    ↓
Fetch from multiple relays:
1. Posts with high engagement (likes, zaps, replies)
2. Posts from verified accounts (NIP-05)
3. Recent posts with trending hashtags
4. Posts from accounts with many followers
    ↓
Rank by:
- Engagement rate
- Recency
- Author reputation
    ↓
Display mixed timeline with variety
```

---

## Messaging Flows

### Direct Messages
```
User clicks 💬 Messages
    ↓
┌─ Not Logged In ────────────┐    ┌─ Logged In ─────────────────────┐
│   ↓                        │    │   ↓                             │
│ Show login prompt          │    │ Load DM conversations           │
│ "Please login to message"  │    │   ↓                             │
│ [Login Button]             │    │ Display conversation list:      │
└────────────────────────────┘    │ - Contact avatars & names       │
                                  │ - Last message preview          │
                                  │ - Unread indicators             │
                                  │   ↓                             │
                                  │ ┌─ Existing Conversation ─────┐ │
                                  │ │        ↓                    │ │
                                  │ │ Click conversation          │ │
                                  │ │        ↓                    │ │
                                  │ │ Open chat thread            │ │
                                  │ │        ↓                    │ │
                                  │ │ Display messages with:      │ │
                                  │ │ - Sender identification     │ │
                                  │ │ - Message timestamps        │ │
                                  │ │ - Encryption indicators     │ │
                                  │ │        ↓                    │ │
                                  │ │ Message input at bottom     │ │
                                  │ │        ↓                    │ │
                                  │ │ [Send] → Encrypt & send     │ │
                                  │ └─────────────────────────────┘ │
                                  │                                 │
                                  │ ┌─ New Conversation ──────────┐ │
                                  │ │        ↓                    │ │
                                  │ │ [+ New Message] button      │ │
                                  │ │        ↓                    │ │
                                  │ │ Search/select recipient     │ │
                                  │ │        ↓                    │ │
                                  │ │ Compose first message       │ │
                                  │ │        ↓                    │ │
                                  │ │ Create new conversation     │ │
                                  │ └─────────────────────────────┘ │
                                  └─────────────────────────────────┘
```

---

## Settings & Configuration Flows

### Settings Page
```
User clicks ⚙️ Settings
    ↓
Display settings categories:
┌─ Settings Categories ──────────────────────┐
│                                            │
│ 🔐 Account Settings                       │
│ 📡 Relay Management                       │
│ 🎨 Appearance                             │
│ 🔔 Notifications                          │
│ 💾 Data & Privacy                         │
│ ℹ️ About                                  │
└────────────────────────────────────────────┘
```

### Relay Management Flow
```
User clicks "Relay Management"
    ↓
Display current relays with:
- Relay URL
- Connection status (🟢/🔴)
- Read/Write permissions
- [Remove] button
    ↓
Show default relays:
- wss://relay.primal.net ✓
- wss://relay.damus.io ✓
    ↓
[+ Add Relay] button
    ↓
┌─ Add Relay Modal ──────────────────────────┐
│                                            │
│ Relay URL input field                      │
│ [Test Connection] button                   │
│ ┌─ Connection Success ┐ ┌─ Connection Fail─┐│
│ │        ↓            │ │        ↓         ││
│ │ Show ✓ Connected    │ │ Show ✗ Failed    ││
│ │ Enable [Add] button │ │ Show error msg   ││
│ └─────────────────────┘ └──────────────────┘│
│                                            │
│ [Cancel] [Add Relay]                       │
└────────────────────────────────────────────┘
```

---

## Error Handling Flows

### Common Error States
```
┌─ Network Errors ───────────────────────────┐
│                                            │
│ Relay Connection Failed                    │
│ → Show retry button                        │
│ → Allow switching to other relays          │
│                                            │
│ Slow Loading                               │
│ → Show loading spinners                    │
│ → Timeout after 10 seconds with retry     │
└────────────────────────────────────────────┘

┌─ Authentication Errors ────────────────────┐
│                                            │
│ NIP-07 Extension Not Found                 │
│ → Show installation guide                  │
│ → Link to extension stores                 │
│                                            │
│ User Denied Permission                     │
│ → Explain why permission is needed         │
│ → Offer to retry authentication            │
└────────────────────────────────────────────┘

┌─ Content Errors ───────────────────────────┐
│                                            │
│ Failed to Load Posts                       │
│ → Show retry button                        │
│ → Allow manual refresh                     │
│                                            │
│ Post Publishing Failed                     │
│ → Show error message                       │
│ → Allow retry with same content            │
│ → Save draft locally                       │
└────────────────────────────────────────────┘
```

---

## Key User Journey Touchpoints

### New User First Experience
1. **Landing** → Discover feed (no login required)
2. **Exploration** → Browse posts, profiles, search
3. **Engagement Attempt** → Login prompt appears
4. **Authentication** → NIP-07 extension setup
5. **Onboarding** → Following suggestions, relay verification
6. **First Post** → Compose and publish
7. **Social Interaction** → Follow users, engage with content

### Returning User Experience  
1. **Return Visit** → Auto-authenticate if extension available
2. **Following Feed** → Personalized timeline
3. **Engagement** → Like, zap, reply to posts
4. **Content Creation** → Regular posting activity
5. **Discovery** → Explore new users and content
6. **Management** → Profile updates, relay configuration

### Cross-Platform Consistency
- **Mobile**: Touch-friendly interactions, bottom navigation
- **Desktop**: Keyboard shortcuts, sidebar navigation  
- **Responsive**: Fluid layout adaptation
- **Performance**: Fast loading on all devices

This user flow serves as the foundation for building the application's architecture, ensuring all user interactions are accounted for and properly connected throughout the application experience. 