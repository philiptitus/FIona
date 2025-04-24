# Fiona Campaign Manager Frontend

![Fiona Logo](public/favicon.ico)

A modern, AI-powered campaign and content management system built with Next.js, TypeScript, and Redux Toolkit.

---

## 🚀 Features

- **Authentication**: Secure login, registration, password reset, and profile management
- **Campaign Management**: Create, edit, and track campaigns with beautiful dashboards
- **Template & Content Creation**: Use AI to generate and edit templates and content in responsive modals
- **Analytics**: Stunning analytics dashboard (placeholder, ready for backend integration)
- **Responsive UI**: Fully mobile-friendly, dark mode, and accessible
- **Notifications**: Toasts for all important actions and errors
- **Pagination & Sorting**: All lists paginated and sorted by latest
- **Search**: Fast, fuzzy search across campaigns, templates, content, and emails
- **Design System**: Built with custom UI components and Lucide icons

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) 15+
- [TypeScript](https://www.typescriptlang.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Axios](https://axios-http.com/)
- [Radix UI](https://www.radix-ui.com/) components
- [Lucide React](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## ⚡ Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to your backend (default: `http://127.0.0.1:8000`)

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   App will be available at [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
Frontend/
├── app/                # Next.js app directory (pages, layouts, routes)
├── components/         # Reusable UI and layout components
├── lib/                # API config, utilities, constants
├── public/             # Static assets (logo, images)
├── store/              # Redux slices, actions, middleware
├── styles/             # Global styles (Tailwind)
├── .env.local          # Local environment variables
├── package.json        # Project metadata & scripts
└── README.md           # Project documentation
```

---

## 🌐 API Proxy
- All API requests are proxied to the backend via the URL in `lib/api.ts`.
- Change the backend URL by setting `NEXT_PUBLIC_API_URL` in your `.env.local`.

---

## 🧑‍💻 Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.

---

## 📄 License

MIT License. See [LICENSE](../LICENSE) for details.

---

## 🙏 Acknowledgements
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

---

**Made with ❤️ by Philip Titus and contributors**
