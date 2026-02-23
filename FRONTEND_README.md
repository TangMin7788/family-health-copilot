# Family Health Copilot - Next.js Frontend

A modern, beautiful Next.js 14 frontend for the Family Health Copilot medical report analysis system.

## 🎨 Features

- **Modern UI/UX**: Built with Next.js 14, React 18, and Tailwind CSS
- **Beautiful Design**: Gradient backgrounds, smooth animations, and professional aesthetics
- **Real-time Updates**: React Query for efficient data fetching and caching
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Type-Safe**: Full TypeScript support for better developer experience
- **Fast Performance**: Optimized with Next.js App Router and server components

## 📋 Prerequisites

- **Node.js 22+** (install with nvm as shown in backend setup)
- **Backend API** running on `http://localhost:8002`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8002/api/v1
```

### 3. Start Development Server

```bash
npm run dev
```

Or use the provided script from project root:

```bash
./start_frontend.sh
```

The frontend will be available at: **http://localhost:3000**

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard (home page)
│   │   ├── add/page.tsx       # Add new report
│   │   └── reports/[id]/      # Report detail page
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components (Button, Card, etc.)
│   │   ├── dashboard/         # Dashboard-specific components
│   │   └── reports/           # Report-related components
│   ├── hooks/                 # Custom React hooks
│   │   └── use-reports.ts     # Report data fetching hooks
│   ├── lib/                   # Utility libraries
│   │   ├── api.ts             # API client with Axios
│   │   ├── utils.ts           # Helper functions
│   │   └── react-query-provider.tsx
│   └── app/
│       ├── globals.css        # Global styles
│       └── layout.tsx         # Root layout
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎨 Design Features

### Color Palette

- **Primary**: Teal to Cyan gradient (#14b8a6 → #06b6d4)
- **Secondary**: Blue to Indigo gradient
- **Accent**: Amber to Orange (for warnings)
- **Success**: Emerald green
- **Danger**: Red

### Typography

- **Font**: Inter (Google Fonts)
- **Headings**: Bold, extra-large with gradients
- **Body**: Readable with proper line height
- **Code**: Monospace with syntax highlighting

### Components

- **Metric Cards**: Animated hover effects with gradient backgrounds
- **Report Cards**: Clean design with urgency badges
- **Buttons**: Gradient backgrounds with smooth transitions
- **Forms**: Modern inputs with focus states
- **Modals**: Backdrop blur and smooth animations

### Animations

- Fade-in effects for page loads
- Hover scale effects on cards
- Pulse animation for status indicators
- Shimmer effect on headers
- Smooth page transitions

## 🔄 API Integration

The frontend connects to the backend API using:

- **Axios** for HTTP requests
- **React Query** for data fetching and caching
- **TypeScript types** for type safety

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/reports?viewer={user}` | GET | List reports for a user |
| `/api/v1/reports/{id}` | GET | Get single report details |
| `/api/v1/reports` | POST | Create new report |
| `/api/v1/reports/{id}` | DELETE | Delete a report |
| `/api/v1/models/extract` | POST | Extract structured data |
| `/api/v1/models/patient-view` | POST | Generate patient explanation |
| `/api/v1/models/family-view` | POST | Generate family explanation |
| `/api/v1/health` | GET | Health check |

## 📱 Pages

### Dashboard (`/`)

- View all medical reports for selected family member
- Metric cards showing summary statistics
- Filter by user (Alice, Bob, Caregiver)
- Click on any report to view details

### Add Report (`/add`)

- Paste medical report text
- Select owner and privacy level
- Automatic PII redaction
- Background AI processing
- Success confirmation with redirect

### Report Detail (`/reports/{id}`)

- View original report text
- Patient-friendly explanation
- Family caregiver summary
- Structured extracted data
- Urgency and risk assessment

## 🛠️ Development

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

## 🎯 Customization

### Change Backend URL

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://your-backend-url:8002/api/v1
```

### Modify Colors

Edit `tailwind.config.ts` and `globals.css` to customize the color scheme.

### Add New Pages

1. Create a new file in `src/app/your-page/page.tsx`
2. Use existing components from `src/components/ui`
3. Follow the established patterns

## 🔧 Troubleshooting

### Backend Connection Issues

If the frontend can't connect to the backend:

1. Ensure backend is running: `./start_backend.sh`
2. Check the API URL in `.env.local`
3. Verify CORS settings in backend
4. Check browser console for errors

### Build Errors

If you encounter build errors:

1. Delete `node_modules` and `.next`
2. Run `npm install` again
3. Ensure Node.js version is 22+

### Styling Issues

If Tailwind classes don't work:

1. Ensure `tailwind.config.ts` content paths are correct
2. Check that `globals.css` is imported in `layout.tsx`
3. Run `npm run build` to regenerate styles

## 📦 Dependencies

Key dependencies:

- `next@14.2.0` - React framework
- `react@18.3.0` - UI library
- `@tanstack/react-query@5.28.0` - Data fetching
- `axios@1.6.7` - HTTP client
- `tailwindcss@3.4.0` - Styling
- `lucide-react@0.344.0` - Icons
- `react-markdown@9.0.0` - Markdown rendering
- `typescript@5` - Type safety

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Import the project
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

### Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment

```bash
npm run build
npm start
```

## 📄 License

This project is part of the Family Health Copilot system.

## 🤝 Contributing

When adding new features:

1. Follow the existing code style
2. Use TypeScript for type safety
3. Add proper error handling
4. Test with the backend API
5. Update documentation

## 📞 Support

For issues or questions, please refer to the main project README.
