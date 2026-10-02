import "./globals.css";

export const metadata = {
  title: "Gala | Travel Planner",
  description: "Plan your trips, itineraries, and adventures in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
