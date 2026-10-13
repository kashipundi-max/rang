export const disclaimers = [
  { title: "Program Overview", content: "Range4ex provides structured skills assessments and educational trader-development programs. All evaluation activity takes place in a simulated environment." },
  { title: "Educational Purpose", content: "Site content is provided for general education and program guidance. It should not be treated as personalized professional advice." },
  { title: "Participation Responsibility", content: "Participants are responsible for reviewing the guidelines, understanding the evaluation structure, and deciding whether the program suits their experience." },
  { title: "Past Performance", content: "Past or simulated results do not guarantee future outcomes. Educational simulations have inherent limitations and cannot reproduce every real-world condition." },
  { title: "Evaluations", content: "Passing an evaluation is not guaranteed. Enrollment does not guarantee progression, and all objectives and participation guidelines must be followed." },
  { title: "Program Status", content: "Range4ex is an educational evaluation and simulation provider. Program availability may vary by jurisdiction, and participants are responsible for confirming local eligibility." },
  { title: "Technology Notice", content: "Platform outages, technical failures, or cyberattacks may affect access. Range4ex is not responsible for disruptions caused by circumstances beyond its reasonable control." },
  { title: "Program Terms", content: "Participation is governed by our terms, assessment guidelines, and program policies. Violations may result in restricted access or termination." },
  { title: "Local Requirements", content: "Participants are responsible for understanding and complying with any local requirements that apply to program access." },
  { title: "Acknowledgment", content: "By using Range4ex services, you confirm that you have read these notices and accept responsibility for your participation and outcomes." },
];

export default function DisclaimerSection() {
  return (
    <section aria-labelledby="footer-disclaimer-title" className="mb-8 rounded-2xl border border-white/10 bg-black/15 p-5 sm:p-6">
      <h2 id="footer-disclaimer-title" className="font-clash-display text-lg font-semibold text-text-primary">Program Disclaimers &amp; Participation Notices</h2>
      <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
        {disclaimers.map((disclaimer) => (
          <p key={disclaimer.title} className="font-dm-sans text-[11px] leading-[1.65] text-text-muted sm:text-xs">
            <strong className="font-semibold text-text-body">{disclaimer.title}:</strong>{" "}{disclaimer.content}
          </p>
        ))}
      </div>
    </section>
  );
}
