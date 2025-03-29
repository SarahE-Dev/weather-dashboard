# Purple Weather Dashboard

A beautiful, responsive weather dashboard application built with Next.js and Tailwind CSS.

![Purple Weather Dashboard](https://placeholder.svg?height=300&width=600)

## Features

- 🌤️ Real-time weather data display
- 📱 Fully responsive design with a purple theme
- 🔍 Search for weather by location
- 📊 Detailed weather metrics (temperature, humidity, wind speed, etc.)
- 🌡️ Temperature unit conversion (Celsius/Fahrenheit)
- 📅 Weather forecast for upcoming days

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- Weather API integration

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/purple-weather-dashboard.git
cd purple-weather-dashboard
```

2. Install dependencies:


```shellscript
npm install
# or
yarn install
```

3. Set up environment variables:


Create a `.env.local` file in the root directory and add your weather API key:

```plaintext
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
```

4. Start the development server:


```shellscript
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Usage

- Enter a city name or location in the search bar to get weather information
- Toggle between Celsius and Fahrenheit using the temperature unit switch
- View detailed weather metrics in the dashboard cards
- Check the forecast for upcoming days


## Project Structure

```plaintext
purple-weather-dashboard/
├── app/                  # Next.js App Router
│   ├── components/       # Shared components
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # UI components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
└── ...                   # Configuration files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Weather data provided by [Weather API Provider]
- Icons from [Lucide React](https://lucide.dev/)


