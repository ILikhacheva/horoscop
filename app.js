function showLoading() {
  document.getElementById("loadingOverlay").style.display = "flex";
}
function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

// restore localStorage
window.addEventListener("load", () => {
  const savedInfo = JSON.parse(localStorage.getItem("info")) || {};
  const U_name = document.getElementById("user_name");
  const U_birthday = document.getElementById("user_birthday");
  const U_date = document.getElementById("user_date");
  if (savedInfo.name) U_name.value = savedInfo.name;
  if (savedInfo.birthday) U_birthday.value = savedInfo.birthday;
  if (savedInfo.birthday) {
    const zodiac = getZodiacSign(savedInfo.birthday);
    //showZodiacImage(zodiac);
  }
  const today = new Date().toISOString().split("T")[0];

  U_date.setAttribute("min", today);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  U_date.value = tomorrowStr;

  U_birthday.setAttribute("max", today);
});

function getZodiacSign(dateStr) {
  if (!dateStr) return "unknown";
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return "Aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
  return "unknown";
}

function showZodiacImage(zodiac) {
  const imageContainer = document.getElementById("zodiac_img");
  if (!imageContainer) return;
  let src = zodiac !== "unknown" ? `img/zodiac/${zodiac}.png` : "";
  imageContainer.src = src;
  /*const imgDiv = document.getElementById("zodiac_img");
    if (!imgDiv) return;
    imgDiv.innerHTML = zodiac !== "unknown"
        ? `<img src="img/zodiac/${zodiac}.png" alt="${zodiac}" style="height:80px;">`
        : "";*/
}

document.getElementById("submit_btn").addEventListener("click", async (e) => {
  e.preventDefault();

  showLoading();

  document.getElementById("horoscope").innerHTML = "";
  const U_name = document.getElementById("user_name");
  const U_birthday = document.getElementById("user_birthday");
  const U_date = document.getElementById("user_date");
  const today = new Date().toISOString().split("T")[0];
  if (U_birthday.value > today) {
    alert("Birthday cannot be in the future. Please, select a valid date.");
    return;
  }
  if (U_date.value < today) {
    alert(
      "Date of horoscope cannot be in the past. Please, select a valid date."
    );
    return;
  }
  const zodiac = getZodiacSign(U_birthday.value.trim());
  const info = {
    name: U_name.value.trim(),
    birthday: U_birthday.value.trim(),
    date: U_date.value.trim(),
    zodiac: zodiac,
  };

  const saveInfo = JSON.parse(localStorage.getItem("info")) || {};
  const savedResult =
    JSON.parse(localStorage.getItem("horoscopeResult")) || null;
  if (
    saveInfo.name === info.name &&
    saveInfo.birthday === info.birthday &&
    saveInfo.date === info.date &&
    savedResult
  ) {
    setTimeout(() => {
      let html = `<div class="horoscopeResult"><h2>Гороскоп для ${info.name} (${info.zodiac})</h2>`;
      infoSections.forEach((section) => {
        html += `<p><b>${section}:</b> ${
          savedResult.horoscope?.[section] || "-"
        }</p>`;
      });
      html += `</div>`;

      // document.getElementById("horoscope").innerHTML = `
      //<div class="horoscopeResult">
      //  <img class="horoscope-bg" src="img/zodiac/${zodiac}.png" alt="Зодиак" />
      //  ${html}
      //</div>
      //`;

      document.getElementById("horoscope").innerHTML = html;

      document.getElementById("result_form").classList.remove("form-hidden");
      const resultBox = document.querySelector("#horoscope .horoscopeResult");
      if (resultBox) {
        resultBox.style.backgroundImage = `url('img/zodiac/${zodiac}.png')`;
        resultBox.style.backgroundSize = "cover";
        resultBox.style.backgroundRepeat = "no-repeat";
        resultBox.style.backgroundPosition = "center";
        resultBox.style.opacity = "0.9";
      }

      hideLoading();
    }, 800); //800 ms
    return;
  }

  //saved new data
  localStorage.setItem("info", JSON.stringify(info));
  //showZodiacImage(zodiac);

  // Получаем ответ от ChatGPT
  let chatResponse = await fetchFromChatGPT(info);
  let result;

  try {
    // Ожидаем JSON-ответ
    const data = await chatResponse.json();
    // Выводим ответ ChatGPT для диагностики
    console.log("ChatGPT raw content:", data.choices[0].message.content);
    // Парсим ответ ChatGPT (может быть в data.choices[0].message.content)
    result = JSON.parse(data.choices[0].message.content);
    console.log("ChatGPT raw content parsed:", result);

    // Выводим структурированный гороскоп по разделам infoSections
    let html = `<div class="horoscopeResult"> <h2>Гороскоп для ${info.name} (${info.zodiac})</h2>`;
    infoSections.forEach((section) => {
      console.log(
        //   `Значение для ${section}: ${JSON.stringify(result[section]) || "-"}`
        `Значение для ${section}: ${result.horoscope?.[section] || "-"}`
      );

      html += `<p><b>${section}:</b> ${result.horoscope?.[section] || "-"}</p>`;
    });
    html += `</div>`;

    document.getElementById("horoscope").innerHTML = html;

    // document.getElementById("horoscope").innerHTML = `
    //<div class="horoscopeResult">
    // <img class="horoscope-bg" src="img/zodiac/${zodiac}.png" alt="Зодиак" />
    // ${html}
    //</div>
    //`;

    document.getElementById("result_form").classList.remove("form-hidden");

    const resultBox = document.querySelector("#horoscope .horoscopeResult");

    if (resultBox) {
      resultBox.style.backgroundImage = `url('img/zodiac/${zodiac}.png')`;
      resultBox.style.backgroundSize = "cover";
      resultBox.style.backgroundRepeat = "no-repeat";
      resultBox.style.backgroundPosition = "center";
      resultBox.style.opacity = "0.9";
    }

    let overlay = document.createElement("div");
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    resultBox.parentElement.appendChild(overlay);

    localStorage.setItem("horoscopeResult", JSON.stringify(result));
    hideLoading();
  } catch (err) {
    document.getElementById("horoscope").innerHTML =
      "Ошибка получения гороскопа.";
    hideLoading();
    return;
  }
});

const API_KEY =
  "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";
const infoSections = [
  "General",
  "Work",
  "Health",
  "Finance",
  "Travel",
  "Relationships",
  "Advice",
];

function buildPrompt(info) {
  return `Ты астролог. Отвечай структурированным JSON с разделами: ${infoSections.join(
    ", "
  )}. 
        Ответ на английском. Каждый раздел должен содержать один абзац с не менее 2 предложениями. 
        Вот данные пользователя: Имя: ${info.name}, Знак зодиака: ${
    info.zodiac
  }, Дата гороскопа: ${info.date}. 
        Сделай гороскоп на эту дату, используя эти данные. В разделе "General" обратись по имени.
        Структура ответа должна быть строго такой:
        {
          "horoscope": {
            "General": "...",
            "Work": "...",
            "Health": "...",
            "Finance": "...",
            "Travel": "...",
            "Relationships": "...",
            "Advice": "..."
          }
        }
    
    Ответь только JSON, без пояснений и текста.
     `;
}

async function fetchFromChatGPT(info) {
  const mytext = buildPrompt(info);
  let response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: mytext,
        },
      ],
    }),
  });
  return response;
}
