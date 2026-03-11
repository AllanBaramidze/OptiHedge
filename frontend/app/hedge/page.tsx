import HedgeContainer from "@/components/hedge/HedgeContainer";

export const metadata = {
  title: "Hedge Engine | OptiHedge",
  description: "Institutional Risk Management & Narrative Correlation Analysis",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <HedgeContainer />
    </main>
  );
}