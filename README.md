# TBS Group Handbag Division Website

A premium handbag showcase website built with Next.js, featuring multilingual support, contact forms with file uploads, and admin dashboard.

## 🚀 Features

- **Multilingual Support**: Vietnamese (vi), English (en), Indonesian (id)
- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, Prisma, PostgreSQL
- **Authentication**: NextAuth for admin access
- **File Uploads**: Cloudflare R2 integration with presigned URLs
- **SEO Optimized**: Metadata, Open Graph, JSON-LD structured data
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Animations**: Framer Motion for smooth interactions
- **Rate Limiting**: Built-in protection against spam

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon recommended)
- **Authentication**: NextAuth.js
- **File Storage**: Cloudflare R2
- **Internationalization**: next-intl
- **Deployment**: Vercel ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tbsgroup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your database URL, NextAuth secret, and Cloudflare R2 credentials.

4. **Set up the database**
   ```bash
   npm run db:push
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ |
| `NEXTAUTH_URL` | Base URL of your application | ✅ |
| `ADMIN_SEED_EMAIL` | Default admin email | ✅ |
| `ADMIN_SEED_PASSWORD` | Default admin password | ✅ |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 access key | ✅ |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key | ✅ |
| `CLOUDFLARE_R2_ENDPOINT` | R2 endpoint URL | ✅ |
| `CLOUDFLARE_R2_BUCKET` | R2 bucket name | ✅ |
| `CLOUDFLARE_R2_PUBLIC_BASE` | Public URL for uploaded files | ✅ |
| `CLOUDFLARE_R2_PUBLIC_BASE_HOST` | Host for Next.js image optimization | ✅ |

### Database Setup

1. Create a PostgreSQL database (Neon recommended for production)
2. Update `DATABASE_URL` in your `.env.local`
3. Run migrations: `npm run db:push`
4. Seed the database: `npm run seed`

### Cloudflare R2 Setup

1. Create a Cloudflare R2 bucket
2. Create API tokens with R2 permissions
3. Configure CORS for your domain
4. Set up a custom domain for public access (recommended)

## 📁 Project Structure

```
├── app/
│   ├── [locale]/          # Internationalized pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── sitemap.ts         # SEO sitemap
│   └── robots.ts          # SEO robots.txt
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
│   ├── i18n/             # Internationalization config
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── r2.ts             # Cloudflare R2 utilities
│   └── validations.ts    # Zod schemas
├── messages/             # Translation files
├── prisma/               # Database schema and seeds
└── middleware.ts         # Next.js middleware
```

## 🌐 Pages

### Public Pages
- `/` - Homepage with hero, collections preview, and strengths
- `/products` - Collections showcase
- `/strengths` - Core capabilities and expertise
- `/contact` - Contact form with file upload

### Admin Pages
- `/admin/login` - Admin authentication
- `/admin` - Inquiries dashboard (protected)

## 🎨 Customization

### Brand Colors
- Primary: `#0F172A` (Dark Navy)
- Accent: `#C0822C` (Gold)

### Fonts
- Sans-serif: Inter
- Serif: Playfair Display

### Animations
Built with Framer Motion for smooth, accessible animations.

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
Make sure to set all required environment variables in your deployment platform.

## 🔒 Security Features

- Rate limiting on contact form submissions
- CSRF protection via NextAuth
- Secure file upload validation
- Environment variable protection
- Security headers configured

## 📊 SEO Features

- Multilingual sitemap generation
- Open Graph meta tags
- Twitter Card support
- JSON-LD structured data
- Canonical URLs
- robots.txt configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential to TBS Group.

## 🆘 Support

For support, email support@tbs-handbag.com or create an issue in the repository.

---

Built with ❤️ by TBS Group Development Team