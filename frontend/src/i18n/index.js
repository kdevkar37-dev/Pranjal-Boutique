import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      home: {
        heroTitle: "Handcrafted Elegance For Every Celebration",
        heroSubtitle:
          "Signature boutique craft, personalized classes, and festive rentals for modern Maharashtrian style.",
      },
    },
  },
  mr: {
    translation: {
      home: {
        heroTitle: "प्रत्येक सणासाठी हाताने साकारलेली सुंदरता",
        heroSubtitle:
          "बुटीक काम, वैयक्तिक क्लासेस आणि पारंपरिक लुकसाठी खास रेंटल सेवा.",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("boutique-language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
