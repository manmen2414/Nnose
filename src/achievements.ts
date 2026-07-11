import { TIMEZONE } from "./const";
import {
  getAchievements,
  getConfig,
  setAchievements,
  setNoseCount,
} from "./db";
import { TIMES } from "./nose";
import { getTimeZonedDate } from "./util";

export interface Achievement {
  name: string;
  description: string;
  /**
   * nose: 瀬数変化時(小数を除く)に発生する
   * seated: 登校時に発生する
   * custom: 毎処理呼ばれる
   */
  type: "nose" | "seated" | "custom";
  func: (nose: number) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    name: "零瀬",
    description: "全ての始まり。",
    type: "nose",
    func(nose) {
      return nose === 0;
    },
  },
  {
    name: "NaN瀬",
    description: "大人しくリセットしてください。",
    type: "nose",
    func(nose) {
      return Number.isNaN(nose);
    },
  },
  {
    name: "億瀬",
    description: "現実で達成しえない遅刻数。",
    type: "nose",
    func(nose) {
      return nose >= 1_0000_0000;
    },
  },
  {
    name: "オーバーフロー瀬",
    description: "int型で管理してるらしい。",
    type: "nose",
    func(nose) {
      if (Number.isNaN(nose) || nose <= 2147483647) return false;
      setNoseCount(-2147483648);
      return true;
    },
  },
  {
    name: ".9瀬",
    description: "早く来て！！！",
    type: "custom",
    func(nose) {
      return nose % 1 > 0.9;
    },
  },
  {
    name: "十五瀬",
    description: "指定校推薦などなかった",
    type: "nose",
    func(nose) {
      return nose > 14;
    },
  },
  {
    name: "三十瀬",
    description: "総合型選抜などなかった",
    type: "nose",
    func(nose) {
      return nose > 29;
    },
  },
  {
    name: "早瀬",
    description: "カウントダウンが始まる前に来るとかすげぇ...",
    type: "seated",
    func() {
      getConfig().then(({ offset }) => {
        const now = getTimeZonedDate(TIMEZONE, offset);
        const countStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          ...TIMES.countStart,
          0,
          0,
        );
        if (now < countStart) clearAchievement(this);
      });
      return false;
    },
  },
] as const;

export async function clearAchievement(achievement: Achievement) {
  const achievements = await getAchievements();
  if (achievements.includes(achievement.name)) return;
  achievements.push(achievement.name);
  await setAchievements(achievements);

  addAchievementsToHtml(achievement);
  reloadAchievementsText();
}

const genredAchievements = {
  custom: ACHIEVEMENTS.filter((v) => v.type === "custom"),
  nose: ACHIEVEMENTS.filter((v) => v.type === "nose"),
  seated: ACHIEVEMENTS.filter((v) => v.type === "seated"),
};
export function checkAchievements(
  type: "custom" | "nose" | "seated",
  nose: number,
) {
  return Promise.all(
    genredAchievements[type].filter((v) => v.func(nose)).map(clearAchievement),
  );
}

export async function addClearedAchievementsToHtml() {
  const clearedNames = await getAchievements().catch((): string[] => []);
  for (const clearedName of clearedNames) {
    const achievement = ACHIEVEMENTS.find((v) => v.name === clearedName);
    if (!achievement) continue;
    addAchievementsToHtml(achievement);
  }
  reloadAchievementsText();
}

export function addAchievementsToHtml(achievement: Achievement) {
  const wrapper: HTMLDivElement | null = document.querySelector(
    "#achievements-wrapper",
  );
  if (!wrapper) return false;

  const achievementElem = document.createElement("div");
  achievementElem.className = "achievement";
  const achievementContent = document.createElement("div");
  const title = document.createElement("div");
  title.className = "achievement-title";
  title.innerText = achievement.name;
  const desc = document.createElement("div");
  desc.className = "achievement-desc";
  desc.innerText = achievement.description;
  achievementContent.append(title, desc);
  achievementElem.append(achievementContent);

  wrapper.append(achievementElem);
}

export async function reloadAchievementsText() {
  const cleared = (await getAchievements().catch(() => [])).length;
  const max = ACHIEVEMENTS.length;

  const text: HTMLDivElement | null =
    document.querySelector("#achievement-text");
  if (!text) return false;
  text.innerText = `実績: ${cleared}/${max}`;
}
