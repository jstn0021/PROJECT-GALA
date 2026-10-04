// import { Background, Logo } from "../../components/AuthCard";

// const trips = [
//   {
//     place: "Palawan",
//     dates: "Dec 12 - 16",
//     emoji: "🏝️",
//     tag: "Island hopping",
//   },
//   { place: "Siargao", dates: "Jan 8 - 12", emoji: "🏄", tag: "Surf trip" },
//   { place: "Baguio", dates: "Feb 14 - 16", emoji: "🌲", tag: "Cool getaway" },
//   { place: "Tokyo", dates: "Apr 3 - 10", emoji: "🗼", tag: "Cherry blossom" },
// ];

// export default function Home() {
//   return (
//     <Background>
//       <div className="mx-auto max-w-5xl p-6 md:p-10">
//         <div className="glass flex items-center justify-between rounded-2xl px-5 py-3">
//           <Logo />
//           <span className="text-sm text-white/70">My Trips</span>
//         </div>

//         <h1 className="mt-10 text-4xl font-semibold tracking-tight md:text-5xl">
//           Where to next? ✈️
//         </h1>
//         <p className="mt-2 text-white/70">Your upcoming adventures</p>

//         <div className="mt-8 grid gap-5 sm:grid-cols-2">
//           {trips.map((t) => (
//             <div
//               key={t.place}
//               className="glass rounded-3xl p-6 transition hover:-translate-y-1 hover:bg-white/10"
//             >
//               <div className="text-5xl">{t.emoji}</div>
//               <h3 className="mt-4 text-2xl font-semibold">{t.place}</h3>
//               <p className="text-white/70">{t.dates}</p>
//               <span className="mt-3 inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs">
//                 {t.tag}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </Background>
//   );
// }
import { Background, Logo } from "../../components/AuthCard";

const trips = [
  {
    place: "Palawan",
    dates: "Dec 12 - 16",
    emoji: "🏝️",
    tag: "Island hopping",
  },
  { place: "Siargao", dates: "Jan 8 - 12", emoji: "🏄", tag: "Surf trip" },
  { place: "Baguio", dates: "Feb 14 - 16", emoji: "🌲", tag: "Cool getaway" },
  { place: "Tokyo", dates: "Apr 3 - 10", emoji: "🗼", tag: "Cherry blossom" },
];

export default function Home() {
  return (
    <Background>
      <div className="mx-auto max-w-5xl p-6 md:p-10">
        <div className="glass flex items-center justify-between rounded-2xl px-5 py-3">
          <Logo />
          <span className="text-sm text-white/70">My Trips</span>
        </div>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight md:text-5xl">
          Where to next? ✈️
        </h1>
        <p className="mt-2 text-white/70">Your upcoming adventures</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {trips.map((t) => (
            <div
              key={t.place}
              className="glass rounded-3xl p-6 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="text-5xl">{t.emoji}</div>
              <h3 className="mt-4 text-2xl font-semibold">{t.place}</h3>
              <p className="text-white/70">{t.dates}</p>
              <span className="mt-3 inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs">
                {t.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Background>
  );
}
