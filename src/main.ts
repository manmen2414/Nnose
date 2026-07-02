import { dbInit, isNotExistNoseCount, setNoseCount } from "./db";
import {
  addNose,
  calcNowNose,
  getTodaySeated,
  isNotSchoolStarted,
  isRestDay,
  seated,
} from "./nose";
import { numbersToKanji } from "./numbersToKanji";
import "./style.css";

async function setupPanel() {
  if (await isNotExistNoseCount()) {
    const panel: HTMLElement | null = document.querySelector("#setup-panel");
    if (!panel) return;
    panel.style.display = "block";

    const btn: HTMLButtonElement | null =
      document.querySelector("#nose-submit");
    if (!btn) return;
    btn.onclick = () => {
      const input: HTMLInputElement | null =
        document.querySelector("#nose-input");
      if (!input) return;
      setNoseCount(parseInt(input.value));
      location.reload();
    };
    await dbInit();
    return true;
  }
  return false;
}

let lastTickSchoolStarted = true;
const todayRest = isRestDay();

async function tick() {
  const noseElements: HTMLElement[] = Array.from(
    document.querySelectorAll(".nose-value"),
  );

  const nose = await calcNowNose();

  let noseText = `${nose.toFixed(4)}`;
  if (nose % 1 === 0) noseText = numbersToKanji(nose);

  noseText += "瀬";

  noseElements.forEach((v) => {
    v.innerText = noseText;
  });

  if (todayRest) return;

  const seatedBtn: HTMLButtonElement | null = document.querySelector("#seated");
  if (!seatedBtn) return;
  if (
    // 学校始まってるかつ最後のtickでは学校始まってなかったかつ登校していない場合
    !isNotSchoolStarted() &&
    !lastTickSchoolStarted &&
    !(await getTodaySeated())
  ) {
    addNose().then(() => seated());
    seatedBtn.disabled = true;
  }
  lastTickSchoolStarted = !isNotSchoolStarted();
}

async function main() {
  if (await setupPanel()) return;
  setInterval(tick);

  const todaySeated = await getTodaySeated();
  const schoolStarted = !isNotSchoolStarted();
  const unclickableSeatedBtn = todaySeated || todayRest || schoolStarted;
  const seatedBtn: HTMLButtonElement | null = document.querySelector("#seated");
  if (!seatedBtn) return;

  if (unclickableSeatedBtn) seatedBtn.disabled = true;
  else
    seatedBtn.onclick = () => {
      seated();
      seatedBtn.disabled = true;
    };

  const restInfo: HTMLElement | null = document.querySelector("#restinfo");
  if (!restInfo) return;
  restInfo.innerText = todayRest ? "休日" : "平日";
}

main();
