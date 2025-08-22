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
        showZodiacImage(zodiac);
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
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
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


document.getElementById("submit_btn").addEventListener("click", (e) => {
    e.preventDefault();
    const U_name = document.getElementById("user_name");
    const U_birthday = document.getElementById("user_birthday");
    const U_date = document.getElementById("user_date");
const today = new Date().toISOString().split("T")[0];
if (U_birthday.value > today) {
        alert("Birthday cannot be in the future. Please, select a valid date.");
        return;
    }
    if (U_date.value < today) {
        alert("Date of horoscope cannot be in the past. Please, select a valid date.");
        return;
    }
    const zodiac = getZodiacSign(U_birthday.value.trim());
    const info = {
        name: U_name.value.trim(),
        birthday: U_birthday.value.trim(),
        date: U_date.value.trim(),
        zodiac: zodiac
    };
    localStorage.setItem("info", JSON.stringify(info));
    showZodiacImage(zodiac);
});

async function fetchFromChatGPT(request) {
    // async, await, promise
    let response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer YOUR_API_KEY`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Hello, who won the world series in 2020?"
                }
            ]
        })
    })

    console.log("Response from ChatGPT:", response);
}