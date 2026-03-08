import Hero from './sections/Hero';
import ProblemSolution from './sections/ProblemSolution';
import Footer from './sections/Footer';

export default function LandingPage() {
  return (
    // Use a simple div. Do not use 'main' with 'min-h-screen' here 
    // if it's part of a larger scrolling assembly.
    <div className="w-full">
      <Hero />
      <ProblemSolution />
      <Footer />
    </div>
  );
}