import sportImage from "../assets/sport1.png";
import sportAltImage from "../assets/sport.jpg";

export const sportsArticles = {
  topScorer: {
    id: "top-scorer",
    title: "Top Scorer to the Final Match",
    summary:
      "The EuroLeague Finals Top Scorer is the individual award for the player that gained the highest points in the EuroLeague Finals.",
    body:
      "This feature breaks down the moments that defined the final, how the top scorer created space, and what this performance means for the next stage of the season.",
    image: sportImage,
  },
  runners: {
    id: "runners-top-four",
    title: "Ethiopian Runners Took the Top Four Spots",
    summary: "A dominant track performance delivered a clean top-four finish.",
    body:
      "From start control to final surge, this report covers split times, pace strategy, and why this race may be remembered as one of the strongest team displays this year.",
    image: sportImage,
  },
  indycar: {
    id: "indycar-dixon-practice",
    title: "IndyCar Detroit: Dixon Quickest in Second Practice",
    summary: "A sharp session placed Dixon ahead before qualifying.",
    body:
      "We review lap consistency, setup choices, and how conditions shaped the second practice order heading into race weekend.",
    image: sportImage,
  },
};

export const sportsCategories = {
  football: {
    id: "football",
    name: "Football",
    title: "Football Category",
    summary: "Latest football updates, match previews, and transfer highlights.",
    body:
      "This section covers league fixtures, player form, and tactical analysis across top football competitions.",
    image: sportAltImage,
  },
  carSport: {
    id: "car-sport",
    name: "Car Sport",
    title: "Car Sport Category",
    summary: "Track reports, qualifying pace, and race-weekend insights.",
    body:
      "Follow practice sessions, setup choices, and performance comparisons across major car sport events.",
    image: sportImage,
  },
  basketball: {
    id: "basketball",
    name: "Basketball",
    title: "Basketball Category",
    summary: "Game recaps, player rankings, and season storylines.",
    body:
      "Get coverage on team form, key matchups, and standout performances from domestic and international basketball.",
    image: sportImage,
  },
  tableTennis: {
    id: "table-tennis",
    name: "Table Tennis",
    title: "Table Tennis Category",
    summary: "Tournament highlights, technique notes, and rising talents.",
    body:
      "Read about match tempo, spin control, and player consistency from local and global table tennis events.",
    image: sportAltImage,
  },
};
