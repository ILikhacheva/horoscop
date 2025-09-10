// zodiac.js
// List of zodiac signs for all forms

const ZODIAC_SIGNS = [
  { value: "", label: "Select your zodiac sign" },
  { value: "Aries", label: "Aries (March 21 - April 20)" },
  { value: "Taurus", label: "Taurus (April 21 - May 21)" },
  { value: "Gemini", label: "Gemini (May 22 - June 21)" },
  { value: "Cancer", label: "Cancer (June 22 - July 22)" },
  { value: "Leo", label: "Leo (July 23 - August 22)" },
  { value: "Virgo", label: "Virgo (August 23 - September 23)" },
  { value: "Libra", label: "Libra (September 24 - October 23)" },
  { value: "Scorpio", label: "Scorpio (October 24 - November 22)" },
  { value: "Sagittarius", label: "Sagittarius (November 23 - December 21)" },
  { value: "Capricorn", label: "Capricorn (December 22 - January 20)" },
  { value: "Aquarius", label: "Aquarius (January 21 - February 19)" },
  { value: "Pisces", label: "Pisces (February 20 - March 20)" },
];

function fillZodiacSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "";
  ZODIAC_SIGNS.forEach((sign) => {
    const option = document.createElement("option");
    option.value = sign.value;
    option.textContent = sign.label;
    select.appendChild(option);
  });
}
