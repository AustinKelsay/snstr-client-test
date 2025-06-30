# snstr-client-test

A modern, Twitter-like Nostr client with a clean, intuitive interface. Built with React, TypeScript, and Tailwind CSS, featuring a cypherpunk aesthetic and seamless integration with NIP-07 browser extensions.

## 🚀 Features

- **Modern UI**: Clean, responsive design with a cypherpunk dark theme
- **NIP-07 Integration**: Seamless connection with popular Nostr browser extensions
- **Real-time Updates**: Live feed updates and notifications
- **Lightning Payments**: Send and receive Bitcoin micropayments via Lightning Network
- **Encrypted Messaging**: End-to-end encrypted direct messages
- **Multi-relay Support**: Connect to multiple Nostr relays for redundancy
- **Mobile Responsive**: Optimized for both desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom CSS Variables
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Development**: ESLint + Prettier + TypeScript

## 📋 Prerequisites

- Node.js 18+ (recommended: use nvm or volta)
- npm 8+
- A Nostr browser extension (Alby, nos2x, or Flamingo)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd snstr-client-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎨 Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted correctly
- `npm run type-check` - Run TypeScript type checking
- `npm run preview` - Preview the production build

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── common/         # Common components (ErrorBoundary, etc.)
│   └── layout/         # Layout components (Header, Sidebar, etc.)
├── features/           # Feature-specific components and logic
│   └── auth/          # Authentication feature
├── pages/             # Page components
├── store/             # Redux store configuration
│   ├── slices/        # Redux slices
│   └── selectors/     # Memoized selectors
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── styles/            # Global styles and theme
└── main.tsx           # Application entry point
```

### Code Style

This project follows strict TypeScript and React best practices:

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **React**: Functional components with hooks, no class components
- **Styling**: Utility-first approach with Tailwind CSS
- **State Management**: Redux Toolkit with proper TypeScript integration
- **Code Organization**: Feature-based architecture with clear separation of concerns

### Theme and Styling

The application uses a cypherpunk-inspired dark theme with:

- **Colors**: Dark backgrounds with bright green and cyan accents
- **Typography**: Inter font for UI, JetBrains Mono for code
- **Components**: Consistent design system with proper accessibility
- **Responsive**: Mobile-first approach with responsive utilities

## 🔗 Browser Extension Setup

To use the application, you'll need a Nostr browser extension:

### Recommended Extensions:

1. **Alby** - Bitcoin Lightning wallet with Nostr support
2. **nos2x** - Simple Nostr signer extension
3. **Flamingo** - Advanced Nostr client extension

### Installation:

1. Install one of the extensions from your browser's extension store
2. Set up your Nostr keys following the extension's instructions
3. Return to snstr-client and click "Connect Extension"

## 🚀 Production Build

To build for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Add TypeScript types for all new code
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Nostr Protocol](https://github.com/nostr-protocol/nostr) - The decentralized social network protocol
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Lucide](https://lucide.dev/) - For the beautiful icons
- [Radix UI](https://radix-ui.com/) - For accessible component primitives

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/snstr-client-test/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

Made with ⚡ by the snstr-client team
