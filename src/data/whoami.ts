import type { ui } from "../i18n/ui";

export type WhoamiLang = keyof typeof ui;
export type CardTone = "red" | "ink";

export interface WhoamiCard {
  rank: string;
  suit: string;
  tone: CardTone;
  reveal: string;
  announcement: string;
}

export interface WhoamiDeckConfig {
  closeLabel: string;
  cards: readonly WhoamiCard[];
  colorChange: {
    light: WhoamiCard;
    dark: WhoamiCard;
  };
}

/**
 * 4-card escalation sequence for the `$ whoami` Easter egg, plus
 * theme-triggered color-change cards when toggling light/dark while revealed.
 */
export const whoamiDeck: Record<WhoamiLang, WhoamiDeckConfig> = {
  "pt-br": {
    closeLabel: "Virar carta de volta para $ whoami",
    cards: [
      {
        rank: "7",
        suit: "♦",
        tone: "red",
        reveal: "não era essa a carta que você pensou.",
        announcement:
          "Carta revelada: 7 de ouros — não era essa a carta que você pensou.",
      },
      {
        rank: "Q",
        suit: "♥",
        tone: "red",
        reveal: "certeza que não era a de antes?",
        announcement:
          "Carta revelada: Dama de copas — certeza que não era a de antes?",
      },
      {
        rank: "A",
        suit: "♠",
        tone: "ink",
        reveal: "prometo que não tem Math.random() aqui.",
        announcement:
          "Carta revelada: Ás de espadas — prometo que não tem Math.random() aqui.",
      },
      {
        rank: "★",
        suit: "✦",
        tone: "red",
        reveal: "ok, agora você já está abrindo o DevTools pra ver o truque.",
        announcement:
          "Carta revelada: Coringa — ok, agora você já está abrindo o DevTools pra ver o truque.",
      },
    ],
    colorChange: {
      light: {
        rank: "K",
        suit: "♦",
        tone: "red",
        reveal: "a luz voltou — e a carta mudou.",
        announcement:
          "Troca de cor: Rei de ouros — a luz voltou e a carta mudou.",
      },
      dark: {
        rank: "A",
        suit: "♣",
        tone: "ink",
        reveal: "mudou o tema, mudou a carta.",
        announcement:
          "Troca de cor: Ás de paus — mudou o tema, mudou a carta.",
      },
    },
  },
  en: {
    closeLabel: "Flip card back to $ whoami",
    cards: [
      {
        rank: "7",
        suit: "♦",
        tone: "red",
        reveal: "this wasn’t the card you were thinking of.",
        announcement:
          "Card revealed: 7 of diamonds — this wasn’t the card you were thinking of.",
      },
      {
        rank: "Q",
        suit: "♥",
        tone: "red",
        reveal: "are you sure it wasn’t the previous one?",
        announcement:
          "Card revealed: Queen of hearts — are you sure it wasn’t the previous one?",
      },
      {
        rank: "A",
        suit: "♠",
        tone: "ink",
        reveal: "I promise there’s no Math.random() in here.",
        announcement:
          "Card revealed: Ace of spades — I promise there’s no Math.random() in here.",
      },
      {
        rank: "★",
        suit: "✦",
        tone: "red",
        reveal: "alright, now you’re opening DevTools to inspect the trick.",
        announcement:
          "Card revealed: Joker — alright, now you’re opening DevTools to inspect the trick.",
      },
    ],
    colorChange: {
      light: {
        rank: "K",
        suit: "♦",
        tone: "red",
        reveal: "lights back on — different card.",
        announcement:
          "Color change: King of diamonds — lights back on, different card.",
      },
      dark: {
        rank: "A",
        suit: "♣",
        tone: "ink",
        reveal: "new theme, new card.",
        announcement: "Color change: Ace of clubs — new theme, new card.",
      },
    },
  },
};
