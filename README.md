# CONSTRUCTION PRO

AI Agent for MEP Companies

## Features

- Secure signin/signup
- Dashboard with sidebar navigation
- Add new projects, workers, inventory
- Calculate Bill of Quantities (BOQ)
- Settings and profile management
- MEP-related functionalities for Mechanical, Electrical, and Plumbing systems

## Getting Started

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Technologies

- Next.js
- TypeScript
- Tailwind CSS
- ESLint
## Research Statement
- This project demonstrates how domain‑specific AI systems can be designed with safety, transparency, and human oversight at their core. Construction Pro’s risk‑aware scheduling engine highlights several principles that are directly relevant to AI safety research:

Transparency and Interpretability: By integrating SHAP explainability into risk predictions, the system ensures that stakeholders can understand why a recommendation was made, reducing the risk of opaque or untrustworthy automation.

Robustness and Constraint Enforcement: Hard safety rules (e.g., worker fatigue limits, load thresholds, environmental conditions) act as “safety shields,” preventing unsafe outputs even if the predictive model is imperfect. This parallels alignment strategies in AI safety research where constraints safeguard against harmful actions.

Human Oversight and Accountability: The design explicitly includes override mechanisms and annotation features, ensuring that human experts remain in control. This reflects the principle that AI systems should augment human judgment rather than replace it.

Ethical Alignment in High‑Risk Domains: By embedding ethical boundaries into construction planning, the project illustrates how AI can be responsibly deployed in critical infrastructure — a context where safety failures have severe consequences.
