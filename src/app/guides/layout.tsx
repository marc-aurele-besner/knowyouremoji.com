import { Instrument_Serif } from 'next/font/google';

// Editorial serif for the /guides section. Gives long-form articles a
// print-publication feel that distinguishes them from the otherwise
// sans-serif site. Declared in this layout (not the root one) so the font
// files are only preloaded on /guides routes.
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
});

export default function GuidesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `guides-fonts` re-declares --font-serif against the variable set here; the
  // copy on <body> was already resolved before this element existed.
  return <div className={`${instrumentSerif.variable} guides-fonts`}>{children}</div>;
}
