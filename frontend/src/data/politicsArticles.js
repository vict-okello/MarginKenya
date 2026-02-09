import worldImage from "../assets/world.jpg";
import heroImage from "../assets/hero1.png";
import technologyImage from "../assets/technology.jpg";
import sportImage from "../assets/sport.jpg";

export const politicsDesk = {
  local: [
    {
      id: "local-budget-realignment",
      scope: "Local",
      tag: "Parliament",
      title: "Counties push for budget realignment ahead of the next fiscal cycle",
      summary:
        "Lawmakers are debating service delivery targets, devolution priorities, and debt controls.",
      body:
        "Committee sessions are focusing on expenditure ceilings, county revenue assumptions, and the sequencing of priority projects. Negotiators are also reviewing debt service obligations to avoid crowding out frontline services.",
      date: "Feb 9, 2026",
      image: heroImage,
    },
    {
      id: "local-youth-turnout",
      scope: "Local",
      tag: "Elections",
      title: "Youth civic groups launch turnout drive in urban and peri-urban wards",
      summary:
        "Organizers are combining digital campaigns with town-hall sessions to increase participation.",
      body:
        "The coalition is training volunteer coordinators to run issue-based forums and voter education clinics. Analysts say the approach could improve engagement among first-time voters who often skip local primaries.",
      date: "Feb 8, 2026",
      image: worldImage,
    },
    {
      id: "local-health-oversight",
      scope: "Local",
      tag: "Governance",
      title: "Oversight panel audits county health procurement contracts",
      summary:
        "The review focuses on transparency controls, supplier concentration, and value-for-money metrics.",
      body:
        "Auditors are examining tender timing, delivery verification, and pricing benchmarks for essential supplies. The panel is expected to publish recommendations on procurement controls and compliance timelines.",
      date: "Feb 7, 2026",
      image: technologyImage,
    },
    {
      id: "local-housing-bill",
      scope: "Local",
      tag: "Policy",
      title: "Affordable housing bill enters final amendment stage in senate",
      summary:
        "Debate centers on financing models, tenant safeguards, and local implementation timelines.",
      body:
        "Lawmakers are considering phased rollout clauses and affordability thresholds tied to median income. Municipal administrations are asking for clearer execution guidance before implementation begins.",
      date: "Feb 6, 2026",
      image: worldImage,
    },
    {
      id: "local-water-compact",
      scope: "Local",
      tag: "Devolution",
      title: "County leaders sign water access compact for drought-prone regions",
      summary:
        "The compact sets shared funding rules for borehole expansion and emergency response plans.",
      body:
        "Regional authorities committed to pooled procurement and joint maintenance targets for critical water points. The agreement includes monthly resilience reporting and drought early-warning coordination.",
      date: "Feb 5, 2026",
      image: sportImage,
    },
    {
      id: "local-transit-hearing",
      scope: "Local",
      tag: "Urban Affairs",
      title: "Public hearing opens on metro transit reforms and commuter pricing",
      summary:
        "Transport officials are reviewing route redesigns, fare protections, and service reliability targets.",
      body:
        "Stakeholders presented proposals on peak-hour frequency, transfer integration, and low-income fare protections. The transport board is expected to release a draft framework after public submissions close.",
      date: "Feb 4, 2026",
      image: heroImage,
    },
  ],
  international: [
    {
      id: "intl-security-dialogue",
      scope: "International",
      tag: "Diplomacy",
      title: "Regional blocs reopen security dialogue as shipping routes face pressure",
      summary:
        "Negotiators are balancing trade continuity, maritime patrol rules, and sanctions compliance.",
      body:
        "Delegations reopened technical talks on joint patrol coordination and trade-lane risk protocols. Diplomats say the objective is to reduce disruptions without escalating cross-border tensions.",
      date: "Feb 9, 2026",
      image: worldImage,
    },
    {
      id: "intl-energy-vote",
      scope: "International",
      tag: "Policy",
      title: "Cross-border energy accord heads for a decisive parliamentary vote",
      summary:
        "The pact could reshape electricity pricing, green investment flows, and transmission planning.",
      body:
        "Member states are evaluating capacity-sharing guarantees and long-term tariff stabilization clauses. If approved, the accord would establish a coordinated investment roadmap for interconnection upgrades.",
      date: "Feb 8, 2026",
      image: sportImage,
    },
    {
      id: "intl-election-watch",
      scope: "International",
      tag: "Elections",
      title: "Election observers flag disinformation spikes ahead of key national polls",
      summary:
        "Monitoring teams cite coordinated bot activity and recommend stronger platform safeguards.",
      body:
        "Observer groups are urging faster takedown protocols for coordinated manipulation campaigns. Civil-society coalitions are also expanding media literacy initiatives to help voters verify claims.",
      date: "Feb 6, 2026",
      image: technologyImage,
    },
    {
      id: "intl-trade-corridor",
      scope: "International",
      tag: "Trade",
      title: "New trade corridor pact aims to cut shipping delays across three regions",
      summary:
        "Customs digitization and rail-port integration are central to the proposed timetable.",
      body:
        "Officials outlined a phased rollout for interoperable cargo systems and pre-clearance protocols. Logistics groups expect the reforms to reduce turnaround time and lower port congestion.",
      date: "Feb 5, 2026",
      image: heroImage,
    },
    {
      id: "intl-climate-negotiation",
      scope: "International",
      tag: "Climate",
      title: "Climate negotiation bloc pushes for stricter emissions verification rules",
      summary:
        "Delegates propose shared standards for industrial reporting and cross-border audit access.",
      body:
        "The framework proposes harmonized disclosure templates and independent verification cycles for heavy industries. Supporters argue the standards will improve trust in cross-border climate financing.",
      date: "Feb 4, 2026",
      image: worldImage,
    },
    {
      id: "intl-food-security",
      scope: "International",
      tag: "Development",
      title: "Food security summit prioritizes fertilizer supply and resilient grain reserves",
      summary:
        "Member states are weighing joint procurement and rapid-response mechanisms for shortages.",
      body:
        "Agriculture ministers proposed pooled reserve triggers and emergency corridor guarantees for staple imports. Development lenders signaled support for storage infrastructure tied to resilience targets.",
      date: "Feb 3, 2026",
      image: sportImage,
    },
  ],
};

export const politicsArticles = [...politicsDesk.local, ...politicsDesk.international];
