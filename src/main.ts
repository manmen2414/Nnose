import {
  addClearedAchievementsToHtml,
  checkAchievements,
} from "./achievements";
import {
  dbInit,
  isNotExistConfig,
  isNotExistNoseCount,
  setNoseCount,
} from "./db";
import {
  addNose,
  calcNowNose,
  getTodaySeated,
  isNotSchoolStarted,
  isRestDay,
  seated,
} from "./nose";
import { numbersToKanji } from "./numbersToKanji";
import { setupSettings } from "./settings";
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
      const nose = parseInt(input.value);
      setNoseCount(Number.isNaN(nose) ? NaN : nose)
        .then(() => checkAchievements("nose", nose))
        .then(() => location.reload());
    };
    if (await isNotExistConfig()) {
      await dbInit();
    }
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
  if (Number.isNaN(nose)) return;

  let noseText = `${nose.toFixed(4)}`;
  if (nose % 1 === 0) noseText = numbersToKanji(nose);

  noseText += "瀬";

  noseElements.forEach((v) => {
    v.innerText = noseText;
  });

  checkAchievements("custom", nose);

  if (todayRest) return;

  const seatedBtn: HTMLButtonElement | null = document.querySelector("#seated");
  if (!seatedBtn) return;
  const nowSchoolStated = !(await isNotSchoolStarted());
  if (
    // 学校始まってるかつ最後のtickでは学校始まってなかったかつ登校していない場合
    nowSchoolStated &&
    !lastTickSchoolStarted &&
    !(await getTodaySeated())
  ) {
    addNose().then(() => {
      seated();
    });
  }
  lastTickSchoolStarted = nowSchoolStated;
}

async function main() {
  if (await setupPanel()) {
    return;
  }
  setupSettings();
  setInterval(tick);

  const todaySeated = await getTodaySeated();
  const schoolStarted = !(await isNotSchoolStarted());
  const unclickableSeatedBtn = todaySeated || todayRest || schoolStarted;
  const seatedBtn: HTMLButtonElement | null = document.querySelector("#seated");
  if (!seatedBtn) return;

  if (unclickableSeatedBtn) seatedBtn.disabled = true;
  else
    seatedBtn.onclick = async () => {
      seatedBtn.disabled = true;
      seated();
    };

  const restInfo: HTMLElement | null = document.querySelector("#restinfo");
  if (!restInfo) return;
  restInfo.innerText = todayRest ? "休日" : "平日";

  addClearedAchievementsToHtml();
}

main();
